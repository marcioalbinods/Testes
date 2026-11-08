import type { ProjectForm } from '../types';
import { emptyForm, uid } from './constants';

/** Trabalho fictício, só para mostrar como o site funciona. */
export function exampleForm(): ProjectForm {
  return {
    ...emptyForm(),
    school: 'Escola Exemplo',
    grade: '8º ano',
    className: '8º B',
    period: 'Manhã',
    groupName: 'Conectados com Equilíbrio',
    members: ['Ana Exemplo', 'Bruno Exemplo', 'Carla Exemplo', 'Davi Exemplo'].map((name) => ({ id: uid(), name })),
    workTitle: 'Desconecta um pouco: o celular e o sono dos adolescentes',
    theme: 'O uso excessivo do celular e o sono dos adolescentes',
    problem: 'Muitos estudantes da nossa escola usam o celular até tarde da noite e chegam cansados na aula. Queremos entender como o uso do celular a noite atrapalha o sono e o aprendizado.',
    whyChosen: 'Nós escolhemos esse tema porque quase todo mundo da turma reclama de sono na primeira aula. Tambem percebemos que nós mesmos ficamos no celular depois da meia-noite.',
    whyImportant: 'Isso é importante porque o sono ajuda na memória, no humor e na saúde. Adolescentes que dormem pouco podem ter mais dificuldade para aprender e mais ansiedade.',
    affected: 'Adolescentes, estudantes que acordam cedo, famílias e professores',
    whereScope: ['Na escola', 'No Brasil'],
    whereDetail: 'Acontece principalmente em casa, a noite, mas as consequências aparecem na escola.',
    discoveries: [
      'Descobrimos que a luz da tela pode atrapalhar a produção de melatonina, que é o hormônio do sono.',
      'Na nossa pesquisa com colegas, a maioria disse que usa o celular na cama antes de dormir.',
      'Dormir pouco deixa a pessoa mais irritada e com menos atenção.',
      'Notificações durante a noite fazem a pessoa acordar sem perceber.',
      'A luz da tela atrapalha a melatonina, o hormônio do sono.',
    ].map((text) => ({ id: uid(), text })),
    causes: 'Vontade de ver redes sociais, jogos online, falta de regras em casa, notificações e medo de ficar por fora',
    consequences: 'Sono e cansaço na aula, dificuldade de concentração, irritação, notas mais baixas',
    dataText: 'Fizemos uma pesquisa com 60 colegas do 8º ano (exemplo).',
    dataPoints: [
      { id: uid(), value: '72', unit: '%', label: 'usam o celular na cama antes de dormir', origin: 'Pesquisa do grupo com 60 colegas (exemplo)' },
      { id: uid(), value: '55', unit: '%', label: 'dormem depois da meia-noite em dia de aula', origin: 'Pesquisa do grupo com 60 colegas (exemplo)' },
      { id: uid(), value: '40', unit: '%', label: 'já cochilaram durante uma aula', origin: 'Pesquisa do grupo com 60 colegas (exemplo)' },
    ],
    surprising: 'O que mais surpreendeu foi saber que a luz do celular engana o cérebro, como se ainda fosse dia. Também ficamos surpresos com quantos colegas dormem depois da meia-noite.',
    learned: 'Aprendemos que adolescentes precisam dormir mais horas do que os adultos. Aprendemos também que deixar o celular longe da cama ajuda muito.',
    conclusion: 'Acreditamos que o problema não é o celular em si, mas a falta de limites no horário de uso, principalmente antes de dormir.',
    sources: [
      { id: uid(), site: 'Pesquisa feita pelo grupo', title: 'Questionário sobre celular e sono no 8º ano', link: '', author: 'Grupo Conectados com Equilíbrio', accessDate: '', found: 'Quantos colegas usam o celular antes de dormir e a que horas dormem.' },
      { id: uid(), site: 'Entrevista na escola', title: 'Conversa com a professora de Ciências sobre o sono', link: '', author: '', accessDate: '', found: 'Explicação sobre a melatonina e a importância do sono para a memória.' },
    ],
    change: 'Queremos que os estudantes durmam melhor e usem o celular com mais equilíbrio a noite.',
    intervention: 'Uma campanha chamada “Desconecta às 22h” com cartazes na escola e vídeos curtos nas redes sociais da turma.',
    objective: 'Conscientizar os estudantes sobre os efeitos do celular no sono.',
    audience: 'Estudantes do 6º ao 9º ano e suas famílias',
    how: 'Primeiro, apresentar os resultados da pesquisa para a turma.\nDepois, criar cartazes com dicas para dormir melhor.\nGravar três vídeos curtos com depoimentos.\nPor fim, propor o desafio de uma semana sem celular depois das 22h.',
    resources: 'Cartolinas, canetas coloridas, celular para gravar, autorização da direção',
    results: 'Esperamos que pelo menos metade dos colegas participe do desafio e conte se dormiu melhor.',
    media: ['cartazes', 'redes', 'video'],
    mediaWhy: 'Os estudantes passam muito tempo nas redes sociais, então a mensagem chega onde eles estão. Os cartazes lembram a campanha todos os dias na escola.',
    mediaHow: 'Os cartazes ficam nos corredores e os vídeos de até 1 minuto serão postados no perfil da turma.',
    mediaMessage: 'Seu sono também precisa de bateria: desconecte às 22h!',
    mediaResult: 'Que os estudantes deixem o celular longe da cama.',
  };
}
