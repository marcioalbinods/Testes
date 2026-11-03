// Divisão passo a passo pelo método da chave.
// A conta é desenhada numa grade: a coluna 0 guarda o sinal de menos e
// a coluna c+1 guarda o algarismo c do dividendo.

const $ = (sel) => document.querySelector(sel);

const els = {
  dividendo: $("#dividendo"),
  divisor: $("#divisor"),
  praticar: $("#praticar"),
  erroInicial: $("#erroInicial"),
  area: $("#area"),
  conta: $("#conta"),
  divisorBox: $("#divisorBox"),
  quocienteBox: $("#quocienteBox"),
  painel: $("#painel"),
  tabuada: $("#tabuada"),
  passos: $("#passos"),
};

let S = null; // estado da divisão atual

// ---------- Início ----------

function comecar() {
  const rawD = els.dividendo.value.trim();
  const rawd = els.divisor.value.trim();

  if (!/^\d+$/.test(rawD)) return erroInicial("Digite o dividendo usando apenas algarismos (0 a 9).");
  if (!/^\d+$/.test(rawd)) return erroInicial("Digite o divisor usando apenas algarismos (0 a 9).");

  const D = rawD.replace(/^0+(?=\d)/, "");
  const d = BigInt(rawd);
  if (d === 0n) return erroInicial("Não existe divisão por zero! Escolha um divisor maior que 0.");

  els.erroInicial.hidden = true;

  // Primeiro dividendo parcial: o menor começo do dividendo em que o divisor cabe.
  let fim = 0;
  let parcial = 0n;
  for (; fim < D.length; fim++) {
    parcial = parcial * 10n + BigInt(D[fim]);
    if (parcial >= d) break;
  }
  if (fim === D.length) fim = D.length - 1;

  S = {
    D,
    d,
    linhas: [{ inicio: 0, texto: D, tipo: "dividendo" }],
    parcial: { linha: 0, de: 0, ate: fim },
    proximo: fim + 1, // próximo algarismo do dividendo a ser baixado
    baixados: new Set(),
    quociente: "",
    escolha: null, // { k, produto, diferenca, ok }
    fase: "escolher", // escolher | baixar | fim
    resto: null,
    passo: 0,
  };

  els.passos.innerHTML = "";
  els.tabuada.innerHTML = "";
  for (let k = 0n; k <= 9n; k++) {
    const li = document.createElement("li");
    li.textContent = `${d} × ${k} = ${d * k}`;
    els.tabuada.appendChild(li);
  }

  els.area.hidden = false;
  render();
  els.area.scrollIntoView({ behavior: "smooth", block: "start" });
}

function erroInicial(msg) {
  els.erroInicial.textContent = msg;
  els.erroInicial.hidden = false;
}

function exemplo() {
  const divisor = 2 + Math.floor(Math.random() * 18);
  const dividendo = divisor * (10 + Math.floor(Math.random() * 990)) + Math.floor(Math.random() * divisor);
  els.dividendo.value = dividendo;
  els.divisor.value = divisor;
  comecar();
}

// ---------- Ajudantes ----------

function textoParcial() {
  const { linha, de, ate } = S.parcial;
  const l = S.linhas[linha];
  return l.texto.slice(de - l.inicio, ate - l.inicio + 1);
}

function valorParcial() {
  return BigInt(textoParcial());
}

function temMaisAlgarismos() {
  return S.proximo < S.D.length;
}

function addPasso(html) {
  const li = document.createElement("li");
  li.innerHTML = html;
  els.passos.appendChild(li);
}

// ---------- Ações ----------

function escolher(valor) {
  if (valor === "") {
    S.escolha = null;
    return render();
  }
  const k = BigInt(valor);
  const P = valorParcial();
  const produto = S.d * k;
  const diferenca = P - produto;
  let ok = true;
  let msg;

  if (produto > P) {
    ok = false;
    msg = `${S.d} × ${k} = ${produto}, que é maior que ${P}. Não dá para tirar ${produto} de ${P}. Escolha um número menor.`;
  } else if (diferenca >= S.d) {
    ok = false;
    msg = `${S.d} × ${k} = ${produto} e sobrariam ${diferenca}, que é maior ou igual ao divisor ${S.d}. Ainda cabe mais: escolha um número maior.`;
  } else if (k === 0n) {
    msg = `Isso! ${S.d} não cabe em ${P}, então colocamos 0 no quociente.`;
  } else {
    msg = `Muito bem! ${S.d} × ${k} = ${produto}. Agora vamos subtrair: ${P} − ${produto}.`;
  }

  S.escolha = { k, produto, diferenca, ok, msg };
  render();
}

function confirmarZero() {
  const P = valorParcial();
  S.quociente += "0";
  S.passo++;
  addPasso(`<code>${S.d}</code> não cabe em <code>${P}</code> → quociente recebe <code>0</code>.`);
  S.escolha = null;
  if (temMaisAlgarismos()) {
    baixar();
  } else {
    terminar(P);
  }
}

function subtrair(respostaAluno) {
  const { k, produto, diferenca } = S.escolha;

  if (respostaAluno !== undefined) {
    const txt = respostaAluno.trim();
    if (!/^\d+$/.test(txt) || BigInt(txt) !== diferenca) {
      S.escolha.erroSub = `Ainda não. Confira a conta ${valorParcial()} − ${produto}. Dica: comece pelas unidades.`;
      return render();
    }
  }

  const P = valorParcial();
  const ate = S.parcial.ate;
  const prodTxt = produto.toString();
  const difTxt = diferenca.toString();

  S.linhas.push({ inicio: ate - prodTxt.length + 1, texto: prodTxt, tipo: "produto" });
  S.linhas.push({ inicio: ate - difTxt.length + 1, texto: difTxt, tipo: "diferenca" });
  S.quociente += k.toString();
  S.passo++;
  addPasso(
    `<code>${S.d}</code> cabe <code>${k}</code> vez(es) em <code>${P}</code>: ` +
      `<code>${S.d} × ${k} = ${produto}</code> e <code>${P} − ${produto} = ${diferenca}</code>.`
  );
  S.escolha = null;

  if (temMaisAlgarismos()) {
    S.fase = "baixar";
    render();
  } else {
    terminar(diferenca);
  }
}

function baixar() {
  const col = S.proximo;
  const alg = S.D[col];
  const idx = S.linhas.length - 1;
  const linha = S.linhas[idx];

  linha.texto += alg;
  linha.baixados = (linha.baixados || 0) + 1;
  S.baixados.add(col);
  S.parcial = { linha: idx, de: linha.inicio, ate: col };
  S.proximo++;
  addPasso(`Baixamos o <code>${alg}</code>. Novo dividendo parcial: <code>${valorParcial()}</code>.`);
  S.fase = "escolher";
  render();
}

function terminar(resto) {
  S.resto = resto;
  S.fase = "fim";
  render();
}

// ---------- Desenho ----------

function celula(linha, coluna, texto, classes) {
  const div = document.createElement("div");
  div.className = "cell " + classes.join(" ");
  div.style.gridRow = linha + 1;
  div.style.gridColumn = coluna + 2; // +1 da coluna do sinal, +1 porque a grade começa em 1
  div.textContent = texto;
  return div;
}

function desenharConta() {
  const frag = document.createDocumentFragment();
  const mostrandoParcial = S.fase === "escolher";
  const { linha: pl, de: pde, ate: pate } = S.parcial;

  // Garante a largura total da grade (dividendo + coluna do sinal).
  els.conta.style.gridTemplateColumns = `repeat(${S.D.length + 1}, var(--cell))`;

  S.linhas.forEach((l, r) => {
    const sublinhado = l.tipo === "produto";
    if (l.tipo === "produto") {
      frag.appendChild(celula(r, l.inicio - 1, "−", ["product", "ul"]));
    }
    const nBaixados = l.baixados || 0;
    [...l.texto].forEach((ch, i) => {
      const col = l.inicio + i;
      const cls = [];
      if (l.tipo === "produto") cls.push("product");
      if (l.tipo === "diferenca") cls.push(i >= l.texto.length - nBaixados ? "brought" : "diff");
      if (l.tipo === "dividendo") {
        if (S.baixados.has(col)) cls.push("used", "down");
      }
      if (sublinhado) cls.push("ul");
      if (mostrandoParcial && r === pl && col >= pde && col <= pate) cls.push("partial");
      frag.appendChild(celula(r, col, ch, cls));
    });
  });

  // Prévia do produto escolhido, embaixo do dividendo parcial.
  if (S.fase === "escolher" && S.escolha && S.escolha.k > 0n) {
    const r = S.linhas.length;
    const txt = S.escolha.produto.toString();
    const inicio = pate - txt.length + 1;
    const extra = S.escolha.ok ? [] : ["wrong"];
    frag.appendChild(celula(r, inicio - 1, "−", ["preview", "ul", ...extra]));
    [...txt].forEach((ch, i) => {
      frag.appendChild(celula(r, inicio + i, ch, ["preview", "ul", ...extra]));
    });
  }

  els.conta.replaceChildren(frag);
}

function desenharChave() {
  els.divisorBox.replaceChildren(
    ...[...S.d.toString()].map((ch) => {
      const s = document.createElement("span");
      s.textContent = ch;
      return s;
    })
  );

  const spans = [...S.quociente].map((ch) => {
    const s = document.createElement("span");
    s.textContent = ch;
    return s;
  });
  if (S.fase === "escolher") {
    const s = document.createElement("span");
    if (S.escolha) {
      s.textContent = S.escolha.k.toString();
      s.className = "temp" + (S.escolha.ok ? "" : " wrong");
    } else {
      s.textContent = "?";
      s.className = "temp empty";
    }
    spans.push(s);
  }
  els.quocienteBox.replaceChildren(...spans);
}

function feedback(msg, tipo) {
  const p = document.createElement("p");
  p.className = "feedback " + tipo;
  p.textContent = msg;
  return p;
}

function botao(texto, onClick, primario = true) {
  const b = document.createElement("button");
  b.textContent = texto;
  if (primario) b.className = "primary";
  b.addEventListener("click", onClick);
  return b;
}

function desenharPainel() {
  const p = els.painel;
  p.replaceChildren();

  if (S.fase === "escolher") {
    const P = valorParcial();
    const pergunta = document.createElement("p");
    pergunta.className = "pergunta";
    pergunta.textContent = `Quantas vezes o ${S.d} cabe em ${P}?`;
    p.appendChild(pergunta);

    const linha = document.createElement("div");
    linha.className = "linha";
    const label = document.createElement("label");
    label.textContent = "Algarismo do quociente: ";
    const sel = document.createElement("select");
    sel.id = "seletorQuociente";
    sel.appendChild(new Option("—", ""));
    for (let k = 0; k <= 9; k++) sel.appendChild(new Option(String(k), String(k)));
    sel.value = S.escolha ? S.escolha.k.toString() : "";
    sel.addEventListener("change", () => escolher(sel.value));
    label.appendChild(sel);
    linha.appendChild(label);
    p.appendChild(linha);

    if (S.escolha) {
      p.appendChild(feedback(S.escolha.msg, S.escolha.ok ? "good" : "bad"));

      if (S.escolha.ok) {
        const bts = document.createElement("div");
        bts.className = "buttons";
        if (S.escolha.k === 0n) {
          const txt = temMaisAlgarismos()
            ? `Colocar 0 e baixar o ${S.D[S.proximo]}`
            : "Colocar 0 e terminar";
          bts.appendChild(botao(txt, confirmarZero));
          p.appendChild(bts);
        } else if (els.praticar.checked) {
          const l2 = document.createElement("div");
          l2.className = "linha";
          l2.style.marginTop = "0.8rem";
          const lab = document.createElement("label");
          lab.textContent = `Diferença: ${P} − ${S.escolha.produto} = `;
          const inp = document.createElement("input");
          inp.inputMode = "numeric";
          inp.autocomplete = "off";
          inp.addEventListener("keydown", (e) => {
            if (e.key === "Enter") subtrair(inp.value);
          });
          lab.appendChild(inp);
          l2.appendChild(lab);
          l2.appendChild(botao("Conferir", () => subtrair(inp.value)));
          p.appendChild(l2);
          if (S.escolha.erroSub) p.appendChild(feedback(S.escolha.erroSub, "bad"));
          setTimeout(() => inp.focus(), 0);
        } else {
          bts.appendChild(botao(`Subtrair (${P} − ${S.escolha.produto})`, () => subtrair()));
          p.appendChild(bts);
        }
      }
    } else {
      p.appendChild(
        feedback("Escolha um número. O produto do divisor pelo número aparece embaixo do dividendo.", "info")
      );
    }
  } else if (S.fase === "baixar") {
    const pergunta = document.createElement("p");
    pergunta.className = "pergunta";
    pergunta.textContent = `Ainda há algarismos no dividendo. Baixe o próximo: ${S.D[S.proximo]}`;
    p.appendChild(pergunta);
    const bts = document.createElement("div");
    bts.className = "buttons";
    bts.appendChild(botao(`Baixar o ${S.D[S.proximo]} ↓`, baixar));
    p.appendChild(bts);
  } else if (S.fase === "fim") {
    const q = BigInt(S.quociente);
    const r = S.resto;
    const div = document.createElement("div");
    div.className = "resultado";
    div.innerHTML =
      `<p class="pergunta">Divisão concluída! 🎉</p>` +
      `<p>Quociente: <strong>${q}</strong> &nbsp;·&nbsp; Resto: <strong>${r}</strong> ` +
      `(${r === 0n ? "divisão exata" : "divisão não exata"})</p>` +
      `<p>Prova real: <strong>${S.d} × ${q} + ${r} = ${S.d * q + r}</strong> ✔</p>`;
    p.appendChild(div);
  }
}

function render() {
  desenharConta();
  desenharChave();
  desenharPainel();
  if (S.fase === "escolher") {
    const sel = $("#seletorQuociente");
    if (sel && !S.escolha) sel.focus({ preventScroll: true });
  }
}

// ---------- Eventos ----------

$("#btnComecar").addEventListener("click", comecar);
$("#btnExemplo").addEventListener("click", exemplo);
$("#btnRecomecar").addEventListener("click", () => {
  els.area.hidden = true;
  S = null;
  els.dividendo.value = "";
  els.divisor.value = "";
  els.dividendo.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
[els.dividendo, els.divisor].forEach((inp) =>
  inp.addEventListener("keydown", (e) => {
    if (e.key === "Enter") comecar();
  })
);
els.praticar.addEventListener("change", () => S && render());
