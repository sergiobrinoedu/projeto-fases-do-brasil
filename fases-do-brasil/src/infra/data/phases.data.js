/**
 * Fonte de dados (conteúdo extraído de "Fases da História do Brasil.pdf").
 * Módulo puro (sem DOM): usado tanto pelo front-end quanto pela API Node.
 *
 * Para usar fotos reais, coloque os arquivos em /public/images e informe
 * o caminho em `images`, ex.: images: ['/images/cabral-1.jpg'].
 * Se `images` estiver vazio, o app gera ilustrações temáticas automaticamente.
 */

export const PERIODS = [
  {
    id: 'colonia', name: 'Brasil Colônia', startYear: 1500, endYear: 1822,
    description: 'Da chegada da esquadra de Cabral à Independência: ocupação do território, economia do açúcar e do ouro e a vinda da Família Real.',
  },
  {
    id: 'imperio', name: 'Brasil Império', startYear: 1822, endYear: 1889,
    description: 'Da Proclamação da Independência por D. Pedro I à queda da monarquia: três fases marcadas por crises, revoltas e consolidação territorial.',
  },
  {
    id: 'republica', name: 'Brasil República', startYear: 1889, endYear: null,
    description: 'Da República Velha à Nova República: alternância entre democracia e autoritarismo, industrialização e redemocratização.',
  },
];

export const PHASES = [
  {
    id: 'pre-colonial', order: 1, period: 'colonia',
    title: 'Período Pré-Colonial', subtitle: 'Pau-brasil e feitorias',
    startYear: 1500, endYear: 1530, art: 'ship',
    summary: 'A esquadra de Cabral chega ao litoral e a Coroa explora o pau-brasil.',
    description: [
      'Fase inicial iniciada com a chegada da esquadra de Pedro Álvares Cabral. A Coroa Portuguesa concentrou seus esforços no comércio com a Índia e limitou-se ao reconhecimento do litoral brasileiro e à exploração do pau-brasil.',
      'A extração da madeira era feita por meio de feitorias e do trabalho indígena, organizado pelo escambo: a troca de mercadorias por trabalho.',
    ],
    highlights: ['Chegada de Cabral', 'Exploração do pau-brasil', 'Feitorias no litoral', 'Escambo com os indígenas'],
  },
  {
    id: 'capitanias', order: 2, period: 'colonia',
    title: 'Capitanias Hereditárias e Governo-Geral', subtitle: 'Açúcar e ouro',
    startYear: 1530, endYear: 1808, art: 'map',
    summary: 'Início da ocupação sistemática: capitanias, Governo-Geral, açúcar e mineração.',
    description: [
      'Início da ocupação sistemática. Para proteger o território, Portugal dividiu a terra em Capitanias Hereditárias. Posteriormente, centralizou a administração com o Governo-Geral.',
      'A economia foi baseada no cultivo da cana-de-açúcar no Nordeste, com mão de obra escravizada, e, no século XVIII, na extração aurífera em Minas Gerais.',
    ],
    highlights: ['Capitanias Hereditárias', 'Governo-Geral', 'Cana-de-açúcar no Nordeste', 'Ciclo do ouro em Minas Gerais'],
  },
  {
    id: 'joanino', order: 3, period: 'colonia',
    title: 'Período Joanino', subtitle: 'A Corte no Rio de Janeiro',
    startYear: 1808, endYear: 1821, art: 'palace',
    summary: 'A Família Real portuguesa transfere a Corte para o Rio de Janeiro.',
    description: [
      'Fugindo das invasões napoleônicas na Europa, a Família Real portuguesa transfere a sede da Corte para o Rio de Janeiro.',
      'Dom João VI promove a Abertura dos Portos às Nações Amigas e eleva o Brasil à categoria de Reino Unido a Portugal e Algarves (1815), modernizando a infraestrutura e a cultura nacional.',
    ],
    highlights: ['Fuga das invasões napoleônicas', 'Abertura dos Portos às Nações Amigas', 'Reino Unido a Portugal e Algarves (1815)', 'Modernização da infraestrutura e da cultura'],
  },
  {
    id: 'primeiro-reinado', order: 4, period: 'imperio',
    title: 'Primeiro Reinado', subtitle: 'Independência e Constituição de 1824',
    startYear: 1822, endYear: 1831, art: 'crown',
    summary: 'D. Pedro I proclama a Independência e outorga a primeira Constituição.',
    description: [
      'Iniciado com a Proclamação da Independência por D. Pedro I. Período conturbado politicamente, marcado pela outorga da primeira Constituição (1824) com o Poder Moderador, conflitos provinciais (como a Confederação do Equador) e crises financeiras.',
      'O período culminou na abdicação do imperador.',
    ],
    highlights: ['Proclamação da Independência', 'Constituição de 1824 e Poder Moderador', 'Confederação do Equador', 'Abdicação de D. Pedro I'],
  },
  {
    id: 'regencial', order: 5, period: 'imperio',
    title: 'Período Regencial', subtitle: 'Regentes e revoltas',
    startYear: 1831, endYear: 1840, art: 'torches',
    summary: 'Regentes governam enquanto D. Pedro II é menor: o período mais instável do Império.',
    description: [
      'Fase de transição governada por regentes enquanto D. Pedro II era menor de idade.',
      'Foi uma das épocas mais instáveis do país, marcada por graves revoltas separatistas e sociais pelo território, como a Cabanagem, a Farroupilha, a Sabinada e a Balaiada.',
    ],
    highlights: ['Governo de regentes', 'Cabanagem', 'Farroupilha', 'Sabinada e Balaiada'],
  },
  {
    id: 'segundo-reinado', order: 6, period: 'imperio',
    title: 'Segundo Reinado', subtitle: 'O Império de D. Pedro II',
    startYear: 1840, endYear: 1889, art: 'train',
    summary: 'Quase 50 anos de governo de D. Pedro II, café, imigração e fim da escravidão.',
    description: [
      'Iniciado com o "Golpe da Maioridade", marcando quase 50 anos do governo de D. Pedro II.',
      'Época de consolidação territorial, expansão do café, imigração europeia, Guerra do Paraguai e fim da escravidão com a Lei Áurea em 1888, evento que enfraqueceu a base de apoio da monarquia.',
    ],
    highlights: ['Golpe da Maioridade', 'Expansão do café', 'Imigração europeia e Guerra do Paraguai', 'Lei Áurea (1888)'],
  },
  {
    id: 'republica-velha', order: 7, period: 'republica',
    title: 'Primeira República (República Velha)', subtitle: 'Café com leite',
    startYear: 1889, endYear: 1930, art: 'coffee',
    summary: 'Golpe militar derruba o Império; elites cafeicultoras dominam a política.',
    description: [
      'Iniciada com o golpe militar que depôs o Império. Divide-se em República da Espada (governos militares de Deodoro e Floriano) e República Oligárquica, dominada pelas elites cafeicultoras na política do "café com leite" e marcada pelo coronelismo.',
    ],
    highlights: ['República da Espada (Deodoro e Floriano)', 'República Oligárquica', 'Política do "café com leite"', 'Coronelismo'],
  },
  {
    id: 'era-vargas', order: 8, period: 'republica',
    title: 'Era Vargas', subtitle: 'Industrialização e leis trabalhistas',
    startYear: 1930, endYear: 1945, art: 'factory',
    summary: 'Getúlio Vargas assume após a Revolução de 1930 e cria a CLT.',
    description: [
      'Getúlio Vargas assume após a Revolução de 1930. A Era Vargas é dividida em Governo Provisório, Governo Constitucional e o regime ditatorial do Estado Novo (1937–1945).',
      'Caracterizou-se pela industrialização, centralização política e criação das leis trabalhistas (CLT).',
    ],
    highlights: ['Revolução de 1930', 'Estado Novo (1937–1945)', 'Industrialização', 'Criação da CLT'],
  },
  {
    id: 'populista', order: 9, period: 'republica',
    title: 'República Populista (ou Liberal)', subtitle: 'Democracia e desenvolvimentismo',
    startYear: 1945, endYear: 1964, art: 'arches',
    summary: 'Período democrático, com Juscelino Kubitschek e a construção de Brasília.',
    description: [
      'Período democrático com alternância de poder entre governos como Dutra, Vargas (eleito), Juscelino Kubitschek (construção de Brasília e desenvolvimentismo), Jânio Quadros e João Goulart.',
      'Encerrado pelo golpe militar de 1964.',
    ],
    highlights: ['Dutra e Vargas (eleito)', 'Juscelino Kubitschek e Brasília', 'Jânio Quadros e João Goulart', 'Golpe militar de 1964'],
  },
  {
    id: 'ditadura', order: 10, period: 'republica',
    title: 'Ditadura Militar', subtitle: 'Regime autoritário',
    startYear: 1964, endYear: 1985, art: 'bars',
    summary: 'Regime comandado por generais, com censura, AI-5 e "milagre econômico".',
    description: [
      'Regime autoritário comandado por generais. Caracterizou-se pelo fechamento político, censura à imprensa, suspensão de direitos civis (AI-5) e perseguição a opositores.',
      'Ao mesmo tempo, promoveu o "milagre econômico" e um grande endividamento externo.',
    ],
    highlights: ['Fechamento político', 'Censura à imprensa', 'AI-5', 'Milagre econômico e endividamento externo'],
  },
  {
    id: 'nova-republica', order: 11, period: 'republica',
    title: 'Nova República', subtitle: 'Constituição Cidadã',
    startYear: 1985, endYear: null, art: 'book',
    summary: 'Redemocratização, Constituição de 1988 e estabilização da moeda.',
    description: [
      'Iniciada com a redemocratização e a promulgação da Constituição de 1988 ("Constituição Cidadã").',
      'Marcada pela estabilização da moeda (Plano Real), alternância democrática de governos, programas sociais e fortalecimento das instituições republicanas.',
    ],
    highlights: ['Redemocratização', 'Constituição de 1988', 'Plano Real', 'Alternância democrática'],
  },
];

export const SITE = {
  about: {
    title: 'Sobre o projeto',
    paragraphs: [
      'A história política do Brasil é dividida didaticamente em três grandes períodos: Brasil Colônia, Brasil Império e Brasil República. Cada período subdivide-se em fases marcadas por transformações sociais, econômicas e formas de governo.',
      'Esta linha do tempo interativa percorre os 11 momentos que vão de 1500 à atualidade, em ordem cronológica, com imagens e uma descrição de cada fase.',
    ],
    howto: [
      { title: 'Explore', text: 'Role a linha do tempo. Passe o mouse (ou toque) nos cards: eles saltam da tela para chamar a sua atenção.' },
      { title: 'Mergulhe', text: 'Clique em uma fase para abrir as imagens e a descrição do período.' },
      { title: 'Avance', text: 'Ao terminar, use "Próxima fase": você volta à linha do tempo e a fase lida fica marcada. Dá para reler quando quiser.' },
    ],
  },
  team: {
    title: 'Sobre nós',
    text: 'Projeto educacional desenvolvido para apresentação de trabalho escolar sobre as fases da História do Brasil.',
    // Edite os nomes da equipe aqui:
    members: [
      { name: 'Integrante 1', role: 'Pesquisa histórica' },
      { name: 'Integrante 2', role: 'Desenvolvimento' },
      { name: 'Integrante 3', role: 'Design e conteúdo' },
    ],
  },
};
