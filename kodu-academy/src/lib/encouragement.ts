/** Mensagens de incentivo: diretas, sem infantilizar. */
const CHECK = [
  'Boa! Mais uma ação concluída.',
  'Isso. Siga para o próximo passo.',
  'Registrado. Teste no Kodu antes de seguir.',
  'Mais um passo feito.',
];
const QUIZ_PASS = [
  'Aprovado! Você mostrou que entendeu o conceito.',
  'Muito bem — conceito dominado.',
  'Aprovado. Agora escreva a reflexão para fechar a missão.',
];
const QUIZ_FAIL = [
  'Ainda não. Leia as explicações, revise a fase e tente de novo — errar faz parte de aprender.',
  'Quase lá. Volte ao conceito e aos passos indicados nas explicações.',
];
const COMPLETE = [
  'Missão concluída! A próxima fase foi liberada.',
  'Fase concluída. Você está construindo algo de verdade.',
  'Excelente trabalho. Próxima missão liberada.',
];

const pick = (list: string[], n: number) => list[Math.abs(n) % list.length];

export const encourage = {
  check: (n: number) => pick(CHECK, n),
  quizPass: (n: number) => pick(QUIZ_PASS, n),
  quizFail: (n: number) => pick(QUIZ_FAIL, n),
  complete: (n: number) => pick(COMPLETE, n),
};
