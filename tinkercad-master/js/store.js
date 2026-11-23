/* Tinkercad Master — armazenamento local (progresso em localStorage, prints em IndexedDB). */
(function () {
  const TM = (window.TM = window.TM || {});
  const KEY = 'tinkercad-master.v1';

  const blank = () => ({
    v: 1,
    criado: new Date().toISOString(),
    concluidas: {},   // id -> { result, pontos, data, dicas }
    desbloqueadas: [1],
    tentativas: {},   // id -> número de envios de print
    dicas: {},        // id -> nível de dica aberto (0–3)
    checks: {},       // id -> { índice do requisito: true }
    avaliacoes: {},   // id -> [{ result, data, parecer (anotações), pontos }] — autoavaliações
    historico: [],    // [{ id, tipo, data, result?, pontos?, detalhe? }]
    nome: ''
  });
  TM.blankState = blank;

  TM.loadState = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      const s = JSON.parse(raw);
      return Object.assign(blank(), s);
    } catch (e) { return blank(); }
  };
  TM.saveState = (s) => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch (e) { return false; }
  };
  TM.storageOK = (() => { try { localStorage.setItem('__tm', '1'); localStorage.removeItem('__tm'); return true; } catch (e) { return false; } })();

  /* ---------- Prints (IndexedDB, com reserva em memória) ---------- */
  const mem = new Map();
  let dbP = null;
  function db() {
    if (!dbP) {
      dbP = new Promise((res) => {
        try {
          const req = indexedDB.open('tinkercad-master', 1);
          req.onupgradeneeded = () => req.result.createObjectStore('prints');
          req.onsuccess = () => res(req.result);
          req.onerror = () => res(null);
        } catch (e) { res(null); }
      });
    }
    return dbP;
  }
  TM.savePrint = async (id, rec) => {
    mem.set(id, rec);
    const d = await db(); if (!d) return false;
    return new Promise((res) => {
      try { const tx = d.transaction('prints', 'readwrite'); tx.objectStore('prints').put(rec, id); tx.oncomplete = () => res(true); tx.onerror = () => res(false); }
      catch (e) { res(false); }
    });
  };
  TM.getPrint = async (id) => {
    if (mem.has(id)) return mem.get(id);
    const d = await db(); if (!d) return null;
    return new Promise((res) => {
      try { const r = d.transaction('prints').objectStore('prints').get(id); r.onsuccess = () => { if (r.result) mem.set(id, r.result); res(r.result || null); }; r.onerror = () => res(null); }
      catch (e) { res(null); }
    });
  };
  TM.deletePrint = async (id) => {
    mem.delete(id);
    const d = await db(); if (!d) return;
    try { d.transaction('prints', 'readwrite').objectStore('prints').delete(id); } catch (e) {}
  };
  TM.clearPrints = async () => {
    mem.clear(); const d = await db(); if (!d) return;
    try { d.transaction('prints', 'readwrite').objectStore('prints').clear(); } catch (e) {}
  };

  /* Reduz o print (máx. 1600 px) para caber no armazenamento */
  TM.readImage = (file) => new Promise((res, rej) => {
    if (!file || !/^image\//.test(file.type)) return rej(new Error('Envie um arquivo de imagem (PNG ou JPG).'));
    const fr = new FileReader();
    fr.onerror = () => rej(new Error('Não foi possível ler o arquivo.'));
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1600, k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        res({ data: c.toDataURL('image/jpeg', 0.88), w: c.width, h: c.height, nome: file.name || 'print.png', tamanho: file.size });
      };
      img.onerror = () => rej(new Error('A imagem parece corrompida.'));
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
})();
