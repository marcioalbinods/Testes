import type { RuleExplanation, Tile } from '../content/types';

function TileView({ tile }: { tile: Tile }) {
  return (
    <span className={`tile ${tile.kind}`} title={tile.pt}>
      {tile.label}
      {tile.pt && <small>{tile.pt}</small>}
    </span>
  );
}

/**
 * Representação ilustrativa de regras do Kodu (WHEN/DO).
 * Não é captura de tela: os blocos reais do Kodu são ícones.
 */
export function RuleCard({ data }: { data: RuleExplanation }) {
  return (
    <figure className="rule-card" style={{ margin: '10px 0' }}>
      <div className="who">Programa de: {data.character}</div>
      {data.rules.map((r, i) => (
        <div className="rule" key={i} style={{ marginLeft: (r.indent ?? 0) * 28 }}>
          <span className="line">
            {r.page && r.page > 1 ? `p${r.page}·` : ''}
            {r.line}
          </span>
          <div className="rule-body" aria-label={`Linha ${r.line}: QUANDO ${r.when.map((t) => t.label).join(' ') || '(vazio = sempre)'}, FAÇA ${r.do.map((t) => t.label).join(' ') || '(vazio)'}`}>
            {(r.indent ?? 0) > 0 && <span className="muted" aria-hidden="true">↳</span>}
            <span className="kw">WHEN</span>
            {r.when.length ? r.when.map((t, j) => <TileView key={j} tile={t} />) : <span className="tile empty">vazio<small>= sempre</small></span>}
            <span className="kw">DO</span>
            {r.do.length ? r.do.map((t, j) => <TileView key={j} tile={t} />) : <span className="tile empty">vazio<small>só agrupa</small></span>}
          </div>
        </div>
      ))}
      <figcaption className="rule-note">
        {data.explanation} <em>Representação ilustrativa — no Kodu os blocos aparecem como ícones.</em>
      </figcaption>
    </figure>
  );
}

export function TileLegend() {
  return (
    <div className="legend" aria-label="Legenda das cores dos blocos">
      <span className="tile sensor">sensor</span>
      <span className="tile filter">filtro</span>
      <span className="tile action">ação</span>
      <span className="tile modifier">modificador</span>
    </div>
  );
}
