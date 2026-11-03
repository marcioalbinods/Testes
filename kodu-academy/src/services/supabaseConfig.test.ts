import { normalizeSupabaseUrl, supabaseConfigProblems } from './supabaseConfig';

describe('validação da configuração do Supabase', () => {
  const key = 'sb_publishable_AbC123_xyz';
  it('aceita configuração correta, com espaços e barra final', () => {
    expect(supabaseConfigProblems(' https://abcd1234.supabase.co/ \n', ` ${key}\n`)).toEqual([]);
    expect(normalizeSupabaseUrl('https://abcd.supabase.co/rest/v1/')).toBe('https://abcd.supabase.co');
  });
  it('detecta valores trocados, painel, chave secreta e formato inválido', () => {
    expect(supabaseConfigProblems(key, 'https://abcd.supabase.co').join(' ')).toMatch(/trocados/);
    expect(supabaseConfigProblems('https://supabase.com/dashboard/project/abcd', key)[0]).toMatch(/painel/);
    expect(supabaseConfigProblems('https://abcd.supabase.co', 'sb_secret_xyz')[0]).toMatch(/SECRETA/);
    expect(supabaseConfigProblems('abcd.supabase.co', 'chave qualquer')).toHaveLength(2);
  });
  it('nunca inclui os valores nas mensagens', () => {
    const msgs = supabaseConfigProblems('https://segredo-url.example.com', 'valor-da-chave-123').join(' ');
    expect(msgs).not.toContain('segredo-url');
    expect(msgs).not.toContain('valor-da-chave');
  });
});
