import type { DiagramId } from '../content/types';
import { T } from '../content/tiles';
import { RuleCard } from './RuleCard';

const TOOLS: [string, string][] = [
  ['Home Menu', 'salvar, carregar, sair'],
  ['Play Game', 'jogar/testar'],
  ['Move Camera', 'mover a câmera'],
  ['Object Tool', 'personagens e objetos'],
  ['Path Tool', 'caminhos, muros'],
  ['Ground Brush', 'pintar terreno'],
  ['Up/Down', 'morros e vales'],
  ['Flatten', 'suavizar/nivelar'],
  ['Roughen', 'irregular'],
  ['Water Tool', 'água'],
  ['Delete Tool', 'apagar objetos'],
  ['World Settings', 'configurações'],
];

function Flow({ nodes, loop }: { nodes: string[]; loop?: string }) {
  return (
    <div className="flow" role="list">
      {nodes.map((n, i) => (
        <span key={n} style={{ display: 'contents' }}>
          <span className="node" role="listitem">
            {n}
          </span>
          {i < nodes.length - 1 && (
            <span className="arrow" aria-hidden="true">
              →
            </span>
          )}
        </span>
      ))}
      {loop && (
        <span className="arrow" aria-label={loop}>
          ↺ {loop}
        </span>
      )}
    </div>
  );
}

export function Diagram({ id }: { id: DiagramId }) {
  switch (id) {
    case 'toolbar':
      return (
        <figure className="diagram">
          <div className="toolbar-diagram">
            {TOOLS.map(([n, d]) => (
              <div key={n}>
                {n}
                <span>{d}</span>
              </div>
            ))}
          </div>
          <figcaption>
            Esquema ilustrativo da barra de ferramentas do modo de edição (teclado e mouse), da esquerda para a direita. Os ícones reais do
            Kodu são diferentes — passe o mouse sobre cada um para ler o nome.
          </figcaption>
        </figure>
      );
    case 'mouse':
      return (
        <figure className="diagram">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ferramenta</th>
                  <th>Botão esquerdo</th>
                  <th>Botão direito</th>
                  <th>Outros</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Move Camera</td><td>arrastar o mundo</td><td>girar (orbitar)</td><td>roda: zoom · F4: centralizar</td></tr>
                <tr><td>Ground Brush</td><td>pintar/adicionar chão</td><td>apagar chão</td><td>← →: tamanho do pincel</td></tr>
                <tr><td>Up/Down</td><td>levantar</td><td>abaixar</td><td>← →: tamanho</td></tr>
                <tr><td>Flatten</td><td>suavizar</td><td>nivelar</td><td>← →: tamanho</td></tr>
                <tr><td>Roughen</td><td>pontiagudo</td><td>ondulado</td><td>← →: tamanho</td></tr>
                <tr><td>Water Tool</td><td>subir a água</td><td>baixar a água</td><td>botão do meio: cor da água</td></tr>
              </tbody>
            </table>
          </div>
          <figcaption>Controles de mouse conforme a ajuda do próprio Kodu (versão para teclado e mouse).</figcaption>
        </figure>
      );
    case 'rule-anatomy':
      return (
        <figure className="diagram">
          <RuleCard
            data={{
              character: 'exemplo',
              rules: [{ line: 1, when: [T.see, T.red, T.apple], do: [T.move, T.toward, T.quickly] }],
              explanation: 'WHEN: sensor (see) + filtros (red, apple). DO: ação (move) + modificadores (toward, quickly).',
            }}
          />
          <figcaption>Anatomia de uma regra: QUANDO [sensor + filtros] FAÇA [ação + modificadores].</figcaption>
        </figure>
      );
    case 'states':
      return (
        <figure className="diagram">
          <Flow nodes={['Página 1: estado A', 'condição de troca (switch page 2)', 'Página 2: estado B', 'condição de volta (switch page 1)']} loop="repete" />
          <figcaption>Diagrama de estados: cada página é um modo de comportamento; a ação switch troca de página.</figcaption>
        </figure>
      );
    case 'debug':
      return (
        <figure className="diagram">
          <Flow nodes={['Reproduzir', 'Observar as regras', 'Hipótese', 'Mudar UMA coisa', 'Testar de novo', 'Registrar']} loop="até resolver" />
          <figcaption>Ciclo de depuração.</figcaption>
        </figure>
      );
    case 'iteration':
      return (
        <figure className="diagram">
          <Flow nodes={['Planejar', 'Construir', 'Testar com jogadores', 'Melhorar']} loop="iterar" />
          <figcaption>Ciclo de iteração no desenvolvimento de jogos.</figcaption>
        </figure>
      );
    case 'counter':
      return (
        <figure className="diagram">
          <Flow nodes={['Valor inicial (set score … once)', 'Mudança (score / subtract)', 'Verificação do limite (scored … <= / >=)', 'Consequência (win / end)']} />
          <figcaption>As quatro partes de um contador (vidas, tempo, pontos).</figcaption>
        </figure>
      );
  }
}
