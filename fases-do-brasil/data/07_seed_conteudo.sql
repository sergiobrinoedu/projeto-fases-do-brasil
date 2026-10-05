-- 07_seed_conteudo.sql — GERADO por scripts/gen-seed.mjs (não edite à mão)
USE `fases_do_brasil`;

INSERT INTO `periods` (`id`,`name`,`start_year`,`end_year`,`description`,`sort_order`) VALUES
  ('colonia','Brasil Colônia',1500,1822,'Da chegada da esquadra de Cabral à Independência: ocupação do território, economia do açúcar e do ouro e a vinda da Família Real.',1),
  ('imperio','Brasil Império',1822,1889,'Da Proclamação da Independência por D. Pedro I à queda da monarquia: três fases marcadas por crises, revoltas e consolidação territorial.',2),
  ('republica','Brasil República',1889,NULL,'Da República Velha à Nova República: alternância entre democracia e autoritarismo, industrialização e redemocratização.',3)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`),`start_year`=VALUES(`start_year`),`end_year`=VALUES(`end_year`),`description`=VALUES(`description`),`sort_order`=VALUES(`sort_order`);

INSERT INTO `phases` (`id`,`period_id`,`title`,`subtitle`,`start_year`,`end_year`,`art`,`summary`,`sort_order`) VALUES
  ('pre-colonial','colonia','Período Pré-Colonial','Pau-brasil e feitorias',1500,1530,'ship','A esquadra de Cabral chega ao litoral e a Coroa explora o pau-brasil.',1),
  ('capitanias','colonia','Capitanias Hereditárias e Governo-Geral','Açúcar e ouro',1530,1808,'map','Início da ocupação sistemática: capitanias, Governo-Geral, açúcar e mineração.',2),
  ('joanino','colonia','Período Joanino','A Corte no Rio de Janeiro',1808,1821,'palace','A Família Real portuguesa transfere a Corte para o Rio de Janeiro.',3),
  ('primeiro-reinado','imperio','Primeiro Reinado','Independência e Constituição de 1824',1822,1831,'crown','D. Pedro I proclama a Independência e outorga a primeira Constituição.',4),
  ('regencial','imperio','Período Regencial','Regentes e revoltas',1831,1840,'torches','Regentes governam enquanto D. Pedro II é menor: o período mais instável do Império.',5),
  ('segundo-reinado','imperio','Segundo Reinado','O Império de D. Pedro II',1840,1889,'train','Quase 50 anos de governo de D. Pedro II, café, imigração e fim da escravidão.',6),
  ('republica-velha','republica','Primeira República (República Velha)','Café com leite',1889,1930,'coffee','Golpe militar derruba o Império; elites cafeicultoras dominam a política.',7),
  ('era-vargas','republica','Era Vargas','Industrialização e leis trabalhistas',1930,1945,'factory','Getúlio Vargas assume após a Revolução de 1930 e cria a CLT.',8),
  ('populista','republica','República Populista (ou Liberal)','Democracia e desenvolvimentismo',1945,1964,'arches','Período democrático, com Juscelino Kubitschek e a construção de Brasília.',9),
  ('ditadura','republica','Ditadura Militar','Regime autoritário',1964,1985,'bars','Regime comandado por generais, com censura, AI-5 e "milagre econômico".',10),
  ('nova-republica','republica','Nova República','Constituição Cidadã',1985,NULL,'book','Redemocratização, Constituição de 1988 e estabilização da moeda.',11)
ON DUPLICATE KEY UPDATE `period_id`=VALUES(`period_id`),`title`=VALUES(`title`),`subtitle`=VALUES(`subtitle`),`start_year`=VALUES(`start_year`),`end_year`=VALUES(`end_year`),`art`=VALUES(`art`),`summary`=VALUES(`summary`),`sort_order`=VALUES(`sort_order`);

INSERT INTO `phase_paragraphs` (`phase_id`,`position`,`content`) VALUES
  ('pre-colonial',1,'Fase inicial iniciada com a chegada da esquadra de Pedro Álvares Cabral. A Coroa Portuguesa concentrou seus esforços no comércio com a Índia e limitou-se ao reconhecimento do litoral brasileiro e à exploração do pau-brasil.'),
  ('pre-colonial',2,'A extração da madeira era feita por meio de feitorias e do trabalho indígena, organizado pelo escambo: a troca de mercadorias por trabalho.'),
  ('capitanias',1,'Início da ocupação sistemática. Para proteger o território, Portugal dividiu a terra em Capitanias Hereditárias. Posteriormente, centralizou a administração com o Governo-Geral.'),
  ('capitanias',2,'A economia foi baseada no cultivo da cana-de-açúcar no Nordeste, com mão de obra escravizada, e, no século XVIII, na extração aurífera em Minas Gerais.'),
  ('joanino',1,'Fugindo das invasões napoleônicas na Europa, a Família Real portuguesa transfere a sede da Corte para o Rio de Janeiro.'),
  ('joanino',2,'Dom João VI promove a Abertura dos Portos às Nações Amigas e eleva o Brasil à categoria de Reino Unido a Portugal e Algarves (1815), modernizando a infraestrutura e a cultura nacional.'),
  ('primeiro-reinado',1,'Iniciado com a Proclamação da Independência por D. Pedro I. Período conturbado politicamente, marcado pela outorga da primeira Constituição (1824) com o Poder Moderador, conflitos provinciais (como a Confederação do Equador) e crises financeiras.'),
  ('primeiro-reinado',2,'O período culminou na abdicação do imperador.'),
  ('regencial',1,'Fase de transição governada por regentes enquanto D. Pedro II era menor de idade.'),
  ('regencial',2,'Foi uma das épocas mais instáveis do país, marcada por graves revoltas separatistas e sociais pelo território, como a Cabanagem, a Farroupilha, a Sabinada e a Balaiada.'),
  ('segundo-reinado',1,'Iniciado com o "Golpe da Maioridade", marcando quase 50 anos do governo de D. Pedro II.'),
  ('segundo-reinado',2,'Época de consolidação territorial, expansão do café, imigração europeia, Guerra do Paraguai e fim da escravidão com a Lei Áurea em 1888, evento que enfraqueceu a base de apoio da monarquia.'),
  ('republica-velha',1,'Iniciada com o golpe militar que depôs o Império. Divide-se em República da Espada (governos militares de Deodoro e Floriano) e República Oligárquica, dominada pelas elites cafeicultoras na política do "café com leite" e marcada pelo coronelismo.'),
  ('era-vargas',1,'Getúlio Vargas assume após a Revolução de 1930. A Era Vargas é dividida em Governo Provisório, Governo Constitucional e o regime ditatorial do Estado Novo (1937–1945).'),
  ('era-vargas',2,'Caracterizou-se pela industrialização, centralização política e criação das leis trabalhistas (CLT).'),
  ('populista',1,'Período democrático com alternância de poder entre governos como Dutra, Vargas (eleito), Juscelino Kubitschek (construção de Brasília e desenvolvimentismo), Jânio Quadros e João Goulart.'),
  ('populista',2,'Encerrado pelo golpe militar de 1964.'),
  ('ditadura',1,'Regime autoritário comandado por generais. Caracterizou-se pelo fechamento político, censura à imprensa, suspensão de direitos civis (AI-5) e perseguição a opositores.'),
  ('ditadura',2,'Ao mesmo tempo, promoveu o "milagre econômico" e um grande endividamento externo.'),
  ('nova-republica',1,'Iniciada com a redemocratização e a promulgação da Constituição de 1988 ("Constituição Cidadã").'),
  ('nova-republica',2,'Marcada pela estabilização da moeda (Plano Real), alternância democrática de governos, programas sociais e fortalecimento das instituições republicanas.')
ON DUPLICATE KEY UPDATE `content`=VALUES(`content`);

INSERT INTO `phase_highlights` (`phase_id`,`position`,`text`) VALUES
  ('pre-colonial',1,'Chegada de Cabral'),
  ('pre-colonial',2,'Exploração do pau-brasil'),
  ('pre-colonial',3,'Feitorias no litoral'),
  ('pre-colonial',4,'Escambo com os indígenas'),
  ('capitanias',1,'Capitanias Hereditárias'),
  ('capitanias',2,'Governo-Geral'),
  ('capitanias',3,'Cana-de-açúcar no Nordeste'),
  ('capitanias',4,'Ciclo do ouro em Minas Gerais'),
  ('joanino',1,'Fuga das invasões napoleônicas'),
  ('joanino',2,'Abertura dos Portos às Nações Amigas'),
  ('joanino',3,'Reino Unido a Portugal e Algarves (1815)'),
  ('joanino',4,'Modernização da infraestrutura e da cultura'),
  ('primeiro-reinado',1,'Proclamação da Independência'),
  ('primeiro-reinado',2,'Constituição de 1824 e Poder Moderador'),
  ('primeiro-reinado',3,'Confederação do Equador'),
  ('primeiro-reinado',4,'Abdicação de D. Pedro I'),
  ('regencial',1,'Governo de regentes'),
  ('regencial',2,'Cabanagem'),
  ('regencial',3,'Farroupilha'),
  ('regencial',4,'Sabinada e Balaiada'),
  ('segundo-reinado',1,'Golpe da Maioridade'),
  ('segundo-reinado',2,'Expansão do café'),
  ('segundo-reinado',3,'Imigração europeia e Guerra do Paraguai'),
  ('segundo-reinado',4,'Lei Áurea (1888)'),
  ('republica-velha',1,'República da Espada (Deodoro e Floriano)'),
  ('republica-velha',2,'República Oligárquica'),
  ('republica-velha',3,'Política do "café com leite"'),
  ('republica-velha',4,'Coronelismo'),
  ('era-vargas',1,'Revolução de 1930'),
  ('era-vargas',2,'Estado Novo (1937–1945)'),
  ('era-vargas',3,'Industrialização'),
  ('era-vargas',4,'Criação da CLT'),
  ('populista',1,'Dutra e Vargas (eleito)'),
  ('populista',2,'Juscelino Kubitschek e Brasília'),
  ('populista',3,'Jânio Quadros e João Goulart'),
  ('populista',4,'Golpe militar de 1964'),
  ('ditadura',1,'Fechamento político'),
  ('ditadura',2,'Censura à imprensa'),
  ('ditadura',3,'AI-5'),
  ('ditadura',4,'Milagre econômico e endividamento externo'),
  ('nova-republica',1,'Redemocratização'),
  ('nova-republica',2,'Constituição de 1988'),
  ('nova-republica',3,'Plano Real'),
  ('nova-republica',4,'Alternância democrática')
ON DUPLICATE KEY UPDATE `text`=VALUES(`text`);
