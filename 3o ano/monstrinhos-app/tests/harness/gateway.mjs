// =====================================================================
// PONTE DE TESTE LOCAL (somente para testes automatizados).
//
// Simula a camada HTTP do Supabase (Auth "GoTrue" e REST "PostgREST")
// por cima de um PostgreSQL REAL do Supabase (imagem supabase/postgres),
// executando cada pedido com o papel "authenticated" e as "claims" do
// JWT, exatamente como o Supabase faz. Assim as políticas RLS e as
// funções do arquivo SQL são testadas de verdade. O Storage é o serviço
// REAL do Supabase (supabase/storage-api), para onde os pedidos são
// repassados.
//
// Uso: node tests/harness/gateway.mjs   (porta 54321)
// =====================================================================
import http from 'node:http';
import crypto from 'node:crypto';
import pg from 'pg';

const PORT = Number(process.env.GW_PORT || 54321);
const SECRET = process.env.JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long';
const STORAGE = process.env.STORAGE_URL || 'http://127.0.0.1:54325';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:54322/postgres', max: 10 });

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
function sign(payload) {
  const h = b64({ alg: 'HS256', typ: 'JWT' });
  const p = b64(payload);
  return `${h}.${p}.${crypto.createHmac('sha256', SECRET).update(`${h}.${p}`).digest('base64url')}`;
}
function verify(token) {
  if (!token) return null;
  const [h, p, s] = token.split('.');
  if (!s) return null;
  const good = crypto.createHmac('sha256', SECRET).update(`${h}.${p}`).digest('base64url');
  if (good !== s) return null;
  const payload = JSON.parse(Buffer.from(p, 'base64url').toString());
  if (payload.exp && payload.exp * 1000 < Date.now()) return null;
  return payload;
}

const refreshTokens = new Map(); // token -> user id
let offline = false; // permite simular queda do servidor nos testes

function userObj(row) {
  return {
    id: row.id, aud: 'authenticated', role: 'authenticated', email: row.email || '',
    is_anonymous: row.is_anonymous, app_metadata: {}, user_metadata: {},
    created_at: row.created_at, updated_at: row.created_at,
  };
}
function session(row) {
  const now = Math.floor(Date.now() / 1000);
  const access = sign({
    sub: row.id, role: 'authenticated', aud: 'authenticated', is_anonymous: row.is_anonymous,
    email: row.email || '', iat: now, exp: now + 3600, session_id: crypto.randomUUID(),
  });
  const refresh = crypto.randomBytes(16).toString('hex');
  refreshTokens.set(refresh, row.id);
  return { access_token: access, token_type: 'bearer', expires_in: 3600, expires_at: now + 3600, refresh_token: refresh, user: userObj(row) };
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json', ...cors, ...headers });
  res.end(body === undefined ? '' : JSON.stringify(body));
}
const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS,HEAD',
  'access-control-expose-headers': '*',
};
async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

async function asUser(claims, headers, fn) {
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(`select set_config('role', $1, true), set_config('request.jwt.claims', $2, true), set_config('request.headers', $3, true)`, [
      claims ? 'authenticated' : 'anon', JSON.stringify(claims || { role: 'anon' }), JSON.stringify(headers),
    ]);
    const r = await fn(client);
    await client.query('commit');
    return r;
  } catch (e) {
    await client.query('rollback');
    throw e;
  } finally {
    client.release();
  }
}

const ident = (s) => {
  if (!/^[a-z_][a-z0-9_]*$/.test(s)) throw new Error('bad identifier ' + s);
  return `"${s}"`;
};

async function handleRest(req, res, url, claims) {
  const path = url.pathname.replace('/rest/v1/', '');
  const headers = { 'x-forwarded-for': req.headers['x-test-ip'] || '10.0.0.1' };
  if (path.startsWith('rpc/')) {
    const fn = path.slice(4);
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    const keys = Object.keys(body);
    const args = keys.map((k, i) => `${ident(k)} => $${i + 1}`).join(', ');
    const values = keys.map((k) => {
      const v = body[k];
      if (Array.isArray(v)) return `{${v.join(',')}}`;
      if (v !== null && typeof v === 'object') return JSON.stringify(v);
      return v;
    });
    try {
      const r = await asUser(claims, headers, (c) => c.query(`select public.${ident(fn)}(${args}) as r`, values));
      return send(res, 200, r.rows[0].r);
    } catch (e) {
      return send(res, e.code === '42501' ? 403 : 400, { code: e.code, message: e.message });
    }
  }
  // Tabelas: GET com select=*, filtros col=eq.valor / in.(a,b), order=col.desc, limit
  if (req.method !== 'GET') return send(res, 405, { message: 'somente leitura nesta ponte' });
  const table = ident(path);
  const where = [];
  const values = [];
  let order = '';
  let limit = '';
  for (const [k, v] of url.searchParams) {
    if (k === 'select') continue;
    if (k === 'order') {
      order = ' order by ' + v.split(',').map((o) => { const [c, d] = o.split('.'); return `${ident(c)} ${d === 'desc' ? 'desc' : 'asc'}`; }).join(', ');
      continue;
    }
    if (k === 'limit') { limit = ` limit ${Number(v)}`; continue; }
    if (k === 'offset') continue;
    const m = /^(eq|neq|in)\.(.*)$/.exec(v);
    if (!m) continue;
    if (m[1] === 'in') {
      const list = m[2].replace(/^\(|\)$/g, '').split(',');
      values.push(list);
      where.push(`${ident(k)}::text = any($${values.length})`);
    } else {
      values.push(m[2]);
      where.push(`${ident(k)}::text ${m[1] === 'eq' ? '=' : '<>'} $${values.length}`);
    }
  }
  try {
    const r = await asUser(claims, headers, (c) => c.query(`select * from public.${table}${where.length ? ' where ' + where.join(' and ') : ''}${order}${limit}`, values));
    const single = (req.headers.accept || '').includes('vnd.pgrst.object');
    if (single) {
      if (r.rows.length !== 1) return send(res, 406, { code: 'PGRST116', message: 'not single' });
      return send(res, 200, r.rows[0]);
    }
    return send(res, 200, r.rows, { 'content-range': `0-${Math.max(0, r.rows.length - 1)}/${r.rows.length}` });
  } catch (e) {
    return send(res, e.code === '42501' ? 403 : 400, { code: e.code, message: e.message });
  }
}

async function handleAuth(req, res, url, claims) {
  const p = url.pathname.replace('/auth/v1', '');
  const db = pool;
  if (p === '/signup' && req.method === 'POST') {
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    if (body.email) return send(res, 422, { msg: 'Signups not allowed in this test bridge' });
    const r = await db.query(`insert into auth.users (id, aud, role, is_anonymous, created_at, updated_at, instance_id)
      values (gen_random_uuid(), 'authenticated', 'authenticated', true, now(), now(), '00000000-0000-0000-0000-000000000000') returning *`);
    return send(res, 200, session(r.rows[0]));
  }
  if (p === '/token') {
    const grant = url.searchParams.get('grant_type');
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    if (grant === 'password') {
      const r = await db.query(`select * from auth.users where email = $1 and encrypted_password = extensions.crypt($2, encrypted_password)`, [body.email, body.password]);
      if (!r.rows.length) return send(res, 400, { error: 'invalid_grant', error_description: 'Invalid login credentials', code: 'invalid_credentials', msg: 'Invalid login credentials' });
      return send(res, 200, session(r.rows[0]));
    }
    if (grant === 'refresh_token') {
      const id = refreshTokens.get(body.refresh_token);
      if (!id) return send(res, 400, { error: 'invalid_grant', error_description: 'Invalid Refresh Token', code: 'refresh_token_not_found' });
      refreshTokens.delete(body.refresh_token);
      const r = await db.query('select * from auth.users where id = $1', [id]);
      if (!r.rows.length) return send(res, 400, { error: 'invalid_grant', code: 'user_not_found' });
      return send(res, 200, session(r.rows[0]));
    }
  }
  if (p === '/user' && req.method === 'GET') {
    if (!claims) return send(res, 401, { msg: 'invalid token', code: 'bad_jwt' });
    const r = await db.query('select * from auth.users where id = $1', [claims.sub]);
    if (!r.rows.length) return send(res, 404, { code: 'user_not_found' });
    return send(res, 200, userObj(r.rows[0]));
  }
  if (p === '/logout') return send(res, 204);
  return send(res, 404, { msg: 'not implemented in test bridge: ' + p });
}

async function proxyStorage(req, res, url) {
  const target = STORAGE + url.pathname.replace('/storage/v1', '') + url.search;
  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await readBody(req);
  const h = { ...req.headers };
  delete h.host;
  delete h['content-length'];
  try {
    const r = await fetch(target, { method: req.method, headers: h, body });
    const buf = Buffer.from(await r.arrayBuffer());
    const out = { ...cors };
    r.headers.forEach((v, k) => { if (!['content-encoding', 'transfer-encoding', 'connection', 'content-length'].includes(k) && !k.startsWith('access-control')) out[k] = v; });
    res.writeHead(r.status, out);
    res.end(buf);
  } catch (e) {
    send(res, 502, { message: String(e) });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
  if (url.pathname === '/__test/offline') { offline = url.searchParams.get('v') === '1'; return send(res, 200, { offline }); }
  if (offline) { req.socket.destroy(); return; }
  const token = (req.headers.authorization || '').replace(/^Bearer /i, '');
  const claims = verify(token);
  const effective = claims && claims.role === 'authenticated' ? claims : null;
  try {
    if (url.pathname.startsWith('/auth/v1')) return await handleAuth(req, res, url, effective);
    if (url.pathname.startsWith('/rest/v1/')) return await handleRest(req, res, url, effective);
    if (url.pathname.startsWith('/storage/v1/')) return await proxyStorage(req, res, url);
    send(res, 404, { message: 'not found' });
  } catch (e) {
    console.error(e);
    send(res, 500, { message: String(e) });
  }
});
server.listen(PORT, () => console.log(`ponte de teste em http://127.0.0.1:${PORT}`));
