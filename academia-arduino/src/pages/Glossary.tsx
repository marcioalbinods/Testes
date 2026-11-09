/** Glossário de eletrônica com linguagem acessível e exemplos do dia a dia. */
import { useMemo, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { PageHead } from '../components/ui';

export const GLOSSARY: { term: string; def: string; example: string }[] = [
  { term: 'Corrente elétrica', def: 'É o movimento organizado de cargas elétricas (elétrons) por um caminho, como um fio. Medimos em ampères (A) ou miliampères (mA).', example: 'Como a água correndo dentro de um cano: quanto mais água passa por segundo, maior a corrente.' },
  { term: 'Tensão', def: 'É a "força" que empurra a corrente. Medimos em volts (V). O Arduino trabalha com 5 V.', example: 'Como a altura de uma caixa-d’água: quanto mais alta, mais forte a água desce pelo cano.' },
  { term: 'Resistência', def: 'É a dificuldade que um material oferece à passagem da corrente. Medimos em ohms (Ω).', example: 'Um cano mais fino deixa passar menos água: ele tem mais "resistência".' },
  { term: 'Circuito', def: 'Caminho fechado por onde a corrente sai do positivo, passa pelos componentes e volta ao negativo.', example: 'Uma pista de corrida: o carro precisa dar a volta completa para voltar à largada.' },
  { term: 'Alimentação', def: 'A fonte de energia do circuito: pode ser o USB, uma bateria ou uma fonte.', example: 'O alimento que dá energia para o nosso corpo funcionar.' },
  { term: 'Polaridade', def: 'Indica qual terminal é o positivo (+) e qual é o negativo (−). Componentes com polaridade só funcionam ligados no sentido certo.', example: 'As pilhas do controle remoto: se colocar ao contrário, ele não funciona.' },
  { term: 'GND', def: 'O "terra" ou negativo do circuito: o ponto de 0 V, para onde a corrente volta.', example: 'O ralo da pia: é para onde toda a água vai no final.' },
  { term: '5V', def: 'Pino que fornece 5 volts. É o positivo usado nos circuitos com Arduino.', example: 'É parecido com a tensão de um carregador de celular USB.' },
  { term: 'Entrada', def: 'Pino que RECEBE informação do mundo: botões e sensores.', example: 'Os ouvidos e os olhos, que recebem informações.' },
  { term: 'Saída', def: 'Pino que ENVIA comandos ao mundo: acender LEDs, tocar sons, mover motores.', example: 'A boca e as mãos, que agem.' },
  { term: 'Sinal digital', def: 'Sinal que só tem dois valores: ligado (HIGH, 1) ou desligado (LOW, 0).', example: 'Um interruptor de luz: ou está ligado, ou desligado.' },
  { term: 'Sinal analógico', def: 'Sinal que pode ter muitos valores entre o mínimo e o máximo.', example: 'O botão de volume: pode ficar baixinho, médio ou alto, com vários valores no meio.' },
  { term: 'Microcontrolador', def: 'Pequeno computador dentro de um único chip. Guarda e executa o programa. No Uno, é o ATmega328P.', example: 'Existe um microcontrolador dentro do micro-ondas, que controla o tempo e a potência.' },
  { term: 'Sensor', def: 'Componente que percebe algo do ambiente (luz, distância, temperatura) e transforma em sinal elétrico.', example: 'A porta automática do mercado tem um sensor que percebe quando alguém chega.' },
  { term: 'Atuador', def: 'Componente que age no mundo: faz luz, som ou movimento.', example: 'O motor que abre a porta automática é um atuador.' },
  { term: 'Algoritmo', def: 'Sequência de passos, em ordem, para resolver um problema.', example: 'Uma receita de bolo: siga os passos na ordem certa.' },
  { term: 'Variável', def: 'Espaço com nome na memória, que guarda um valor que pode mudar durante o programa.', example: 'O placar de um jogo: o número muda a cada gol.' },
  { term: 'Condição', def: 'Pergunta de sim ou não que o programa usa para decidir o que fazer (if / else).', example: 'SE estiver chovendo, ENTÃO levo o guarda-chuva.' },
  { term: 'Repetição', def: 'Instruções executadas várias vezes (loop, for, while).', example: 'Dar 10 voltas na quadra: a mesma ação, repetida.' },
  { term: 'Curto-circuito', def: 'Ligação direta entre o positivo e o negativo, sem componente no caminho. A corrente fica enorme e perigosa.', example: 'Como abrir uma comporta enorme de uma vez: a água sai toda de uma vez, sem controle.' },
  { term: 'PWM', def: 'Técnica de ligar e desligar um pino muito rápido. Variando o tempo ligado, controlamos o brilho de um LED ou a velocidade de um motor.', example: 'Piscar uma lanterna tão rápido que parece que ela está mais fraca.' },
  { term: 'Resistor de pull-up', def: 'Resistor que liga uma entrada ao 5V para ela não ficar "flutuando". O Arduino tem um interno: INPUT_PULLUP.', example: 'Uma mola que mantém a porta fechada até alguém empurrar.' },
  { term: 'Biblioteca', def: 'Conjunto de códigos prontos que facilita usar um componente. Ex.: Servo.h.', example: 'Um livro de receitas prontas: você não precisa inventar tudo do zero.' },
  { term: 'Protoboard', def: 'Placa com furos ligados por dentro, para montar circuitos sem solda.', example: 'Um tabuleiro de montar peças que encaixam e desencaixam.' },
];

const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function GlossaryPage() {
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const s = strip(q.trim());
    return GLOSSARY.filter((g) => !s || strip(`${g.term} ${g.def} ${g.example}`).includes(s)).sort((a, b) => a.term.localeCompare(b.term, 'pt-BR'));
  }, [q]);
  return (
    <div className="stack">
      <PageHead icon={<BookOpen size={30} />} color="#2453d6" title="Glossário de eletrônica" subtitle="Palavras importantes explicadas de um jeito simples, com exemplos do dia a dia." />
      <label className="card row" style={{ padding: 14, gap: 8 }}>
        <Search size={18} aria-hidden />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar palavra…" style={{ flex: 1 }} aria-label="Buscar palavra no glossário" />
      </label>
      {list.length === 0 && <div className="empty">Nenhuma palavra encontrada.</div>}
      <div className="grid cols-3">
        {list.map((g) => (
          <article key={g.term} className="card">
            <h3 style={{ color: 'var(--purple-700)' }}>{g.term}</h3>
            <p>{g.def}</p>
            <div className="callout tip small"><strong>No dia a dia:</strong>&nbsp;{g.example}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
