/* Dados do Catálogo JK 2025 (PDF oficial). Códigos conferidos no catálogo;
   onde o PDF deixa a correspondência ambígua, o item mostra mais de um código. */
(function (raiz) {
  const IMG = 'assets/img/';

  const KIT_COMUM = [
    ['JK301 · 306 · 311', 'Kit perfil final 30 / 35 / 40 mm'],
    ['JK300 · 305 · 310', 'Kit intermediário U 30 / 35 / 40 mm'],
    ['JK302 · 307 · 312', 'Kit intermediário reto 30 / 35 / 40 mm'],
    ['JK315', 'Kit emenda perfil H'],
    ['JK316', 'Kit emenda perfil reforçado'],
  ];

  const TELHADOS = [
    { id: 'ceramico', nome: 'Telha cerâmica', foto: 'rf-ceramico', peca: 'pr-gancho-ceramico',
      resumo: 'Gancho de alumínio que passa por baixo da telha e fixa direto no caibro. Versões para telha baixa e alta, trilho H ou H2.',
      kit: [['—', 'Kit gancho cerâmico telha baixa (trilho H ou H2)'], ['—', 'Kit gancho cerâmico telha alta (trilho H2)'], ['JK642', 'Kit cerâmico em aço galvanizado'], ['JK317', 'Kit L']] },
    { id: 'fibro-madeira', nome: 'Fibrocimento na madeira', foto: 'rf-fibromadeira', peca: 'pr-haste-madeira',
      resumo: 'Haste M10 que atravessa a telha e prende na terça de madeira, com borracha de vedação. Inox ou zincada a fogo.',
      kit: [['JK400 · JK403', 'Kit fibromadeira inox M10×200'], ['JK402 · JK405', 'Kit fibromadeira inox M10×250'], ['JK401 · JK404', 'Kit fibromadeira zincado a fogo'], ['JK207', 'Borracha de vedação da haste']] },
    { id: 'fibro-metal', nome: 'Fibrocimento no metal', foto: 'rf-fibrometal', peca: 'pr-haste-metal-2',
      resumo: 'Haste com ponta broca: fura e fixa na terça metálica numa operação só. Inox ou Nanotec.',
      kit: [['JK406 · JK408', 'Kit fibrocimento ponta broca inox'], ['JK407 · JK409', 'Kit fibrocimento ponta broca Nanotec'], ['JK410', 'Kit ponta broca inox M10×250'], ['JK317', 'Kit L']] },
    { id: 'metalico', nome: 'Telha metálica', foto: 'rf-metalico', peca: 'pr-mini-trilho',
      resumo: 'Mini trilho de aluzinco parafusado direto na onda da telha. Sem trilho longo e com montagem rápida.',
      kit: [['JK620 – 623', 'Suporte mini trilho 250 / 300 / 500 / 600 mm'], ['JK624 – 627', 'Suporte mini alto 250 / 300 / 500 / 600 mm'], ['JK064', 'Parafuso brocante 7/8 (costura)']] },
    { id: 'laje', nome: 'Laje de concreto', foto: 'rf-laje', peca: 'pr-suporte-laje',
      resumo: 'Suporte chumbado na laje com trilho H ou H2 em inox ou zincado a fogo, na inclinação do projeto.',
      kit: [['JK107', 'Suporte para concreto'], ['JK108', 'Suporte para concreto (variação)'], ['—', 'Trilho H ou H2 inox ou zincado a fogo']] },
    { id: 'kalhetao', nome: 'Telha kalhetão', foto: 'rf-kalhetao', peca: 'pr-kalhetao',
      resumo: 'Suporte que abraça a aba do kalhetão, em alumínio ou ferro, sem furar a calha da telha.',
      kit: [['JK037', 'Suporte kalhetão em alumínio'], ['JK0105', 'Suporte kalhetão em ferro']] },
    { id: 'single', nome: 'Telha shingle', foto: 'rf-shingle', peca: 'pr-single',
      resumo: 'Suporte single de perfil baixo para telha shingle, em alumínio ou ferro.',
      kit: [['JK038', 'Suporte single em alumínio'], ['JK0106', 'Suporte single em ferro']] },
    { id: 'solo', nome: 'Solo', foto: 'rf-solo', peca: 'pr-solo',
      resumo: 'Estrutura de solo sob medida, com pilar de concreto, J viga e clamps de solo. O projeto é montado com você.',
      kit: [['JK114 · JK115', 'Pilar de concreto e capacete'], ['JK633 · JK634', 'J viga 50 e J viga 68'], ['JK0637 · JK0638', 'Clamp fixador solo chapa 14 e 12'], ['JK0641 · JK0640', 'Clamp solo cantoneira LD e LE'], ['JK0039', 'Clamp jacaré']] },
  ];

  const GRUPOS = [
    ['perfis', 'Perfis e trilhos'],
    ['kits', 'Kits de fixação'],
    ['suportes', 'Suportes por telhado'],
    ['solo', 'Estrutura solo'],
    ['parafusaria', 'Parafusaria'],
  ];

  const v = (rotulo, codigo) => ({ rotulo, codigo });
  const PRODUTOS = [
    // Perfis
    { id: 'perfil-h', grupo: 'perfis', nome: 'Perfil tubular H', img: 'pr-trilho-h', det: 'Alumínio · fixação horizontal', vars: [v('2400 mm'), v('3000 mm'), v('4800 mm'), v('6000 mm')] },
    { id: 'perfil-h2', grupo: 'perfis', nome: 'Perfil tubular H2', img: 'pr-trilho-h2', det: 'Alumínio · fixação horizontal', vars: [v('2400 mm'), v('3000 mm'), v('4800 mm'), v('6000 mm')] },
    { id: 'perfil-h2r', grupo: 'perfis', nome: 'Perfil tubular H2 reforçado', img: 'pr-perfil-reforcado', det: 'Alumínio · para vãos maiores', vars: [v('4800 mm'), v('6000 mm')] },
    { id: 'perfil-h2i', grupo: 'perfis', nome: 'Perfil tubular H2 intermediário', img: 'pr-perfil-h2', det: 'Alumínio · fixação lateral', vars: [v('2400 mm'), v('3000 mm'), v('4800 mm'), v('6000 mm')] },
    { id: 'perfil-light', grupo: 'perfis', nome: 'Perfil tubular Light', img: 'pr-perfil-light', det: 'Alumínio · fixação horizontal', vars: [v('2400 mm'), v('4800 mm')] },
    { id: 'mini-trilho', grupo: 'perfis', nome: 'Mini trilho', img: 'pr-mini-trilho', det: 'Alumínio', vars: [v('250 mm'), v('300 mm'), v('500 mm'), v('1000 mm')] },
    { id: 'perfil-l', grupo: 'perfis', nome: 'Perfil suporte L', img: 'pr-perfil-l', det: 'Alumínio ou ferro', vars: [v('Alumínio', 'JK033'), v('Ferro', 'JK103')] },
    { id: 'perfil-z', grupo: 'perfis', nome: 'Perfil Z', img: 'pr-perfil-z', det: 'Alumínio ou ferro', vars: [v('Ferro', 'JK101'), v('Z pequeno · ferro', 'JK104')] },
    { id: 'cantoneira', grupo: 'perfis', nome: 'Cantoneira 10 furos', img: 'pr-cantoneira', det: 'Ferro', vars: [v('Ferro', 'JK100')] },
    // Kits
    { id: 'kit-final', grupo: 'kits', nome: 'Kit perfil final', img: 'pr-kit-final', det: 'Alumínio · pela espessura da moldura', vars: [v('30 mm · 8×35', 'JK301'), v('35 mm · 8×40', 'JK306'), v('40 mm · 8×50', 'JK311')] },
    { id: 'kit-inter-u', grupo: 'kits', nome: 'Kit intermediário U', img: 'pr-kit-inter-u', det: 'Alumínio', vars: [v('30 mm · 8×30', 'JK300'), v('35 mm · 8×35', 'JK305'), v('40 mm · 8×40', 'JK310')] },
    { id: 'kit-inter-reto', grupo: 'kits', nome: 'Kit intermediário reto', img: 'pr-kit-inter-reto', det: 'Alumínio', vars: [v('30 mm', 'JK302'), v('35 mm', 'JK307'), v('40 mm', 'JK312')] },
    { id: 'kit-emenda-h', grupo: 'kits', nome: 'Kit emenda perfil H', img: 'pr-emenda', det: 'Para trilho H e H2', vars: [v('Unidade', 'JK315')] },
    { id: 'kit-emenda-r', grupo: 'kits', nome: 'Kit emenda perfil reforçado', img: 'pr-emenda-h', det: 'Para trilho reforçado', vars: [v('Unidade', 'JK316')] },
    { id: 'kit-l', grupo: 'kits', nome: 'Kit L', img: 'pr-kit-l', det: 'Alumínio', vars: [v('Unidade', 'JK317')] },
    // Suportes
    { id: 'gancho-ceramico', grupo: 'suportes', nome: 'Kit gancho cerâmico', img: 'pr-gancho-ceramico', det: 'Telha baixa ou alta · trilho H ou H2', vars: [v('Telha baixa · trilho H'), v('Telha baixa · trilho H2'), v('Telha alta · trilho H2'), v('Aço galvanizado', 'JK642')] },
    { id: 'fibromadeira', grupo: 'suportes', nome: 'Kit fibromadeira', img: 'pr-haste-madeira', det: 'Fibrocimento sobre madeira', vars: [v('Inox M10×200', 'JK400'), v('Inox M10×250', 'JK402'), v('Zincado a fogo', 'JK401')] },
    { id: 'pontabroca', grupo: 'suportes', nome: 'Kit fibrocimento ponta broca', img: 'pr-haste-metal-2', det: 'Fibrocimento sobre metal', vars: [v('Inox', 'JK406'), v('Nanotec', 'JK407'), v('Inox M10×200 · trilho H', 'JK408'), v('Inox M10×250 · trilho H', 'JK410')] },
    { id: 'concreto', grupo: 'suportes', nome: 'Suporte para concreto', img: 'pr-suporte-laje', det: 'Laje', vars: [v('Modelo 1', 'JK107'), v('Modelo 2', 'JK108')] },
    { id: 'sup-mini', grupo: 'suportes', nome: 'Suporte mini trilho', img: 'pr-mini-trilho', det: 'Aluzinco · telha metálica', vars: [v('250 mm', 'JK620'), v('300 mm', 'JK621'), v('500 mm', 'JK622'), v('600 mm', 'JK623')] },
    { id: 'sup-mini-alto', grupo: 'suportes', nome: 'Suporte mini alto', img: 'pr-sup-mini-alto', det: 'Aluzinco · telha metálica', vars: [v('250 mm', 'JK624'), v('300 mm', 'JK625'), v('500 mm', 'JK626'), v('600 mm', 'JK627')] },
    { id: 'kalhetao', grupo: 'suportes', nome: 'Suporte kalhetão', img: 'pr-kalhetao', det: 'Telha kalhetão', vars: [v('Alumínio', 'JK037'), v('Ferro', 'JK0105')] },
    { id: 'single', grupo: 'suportes', nome: 'Suporte single', img: 'pr-single', det: 'Telha shingle', vars: [v('Alumínio', 'JK038'), v('Ferro', 'JK0106')] },
    // Solo
    { id: 'pilar', grupo: 'solo', nome: 'Pilar de concreto', img: 'pr-pilar', det: 'Com capacete opcional', vars: [v('Pilar', 'JK114'), v('Capacete', 'JK115')] },
    { id: 'jviga', grupo: 'solo', nome: 'J viga', img: 'pr-solo', det: 'Ferro', vars: [v('J viga 50', 'JK633'), v('J viga 68', 'JK634'), v('J viga 75', 'JK111')] },
    { id: 'clamp-solo', grupo: 'solo', nome: 'Clamp fixador solo', img: 'pr-clamp-solo', det: 'Chapa 14 ou 12', vars: [v('Chapa 14', 'JK0637'), v('Chapa 12', 'JK0638'), v('Viga enrijecida', 'JK0639')] },
    { id: 'clamp-cant', grupo: 'solo', nome: 'Clamp solo cantoneira', img: 'pr-clamp-cant', det: 'Lado direito ou esquerdo', vars: [v('LD', 'JK0641'), v('LE', 'JK0640')] },
    { id: 'clamp-jacare', grupo: 'solo', nome: 'Clamp jacaré', img: 'pr-clamp-jacare', det: 'Solo', vars: [v('Unidade', 'JK0039')] },
    { id: 'cant-j', grupo: 'solo', nome: 'Cantoneira J solo', img: 'pr-cant-j', det: 'Ferro', vars: [v('Unidade', 'JK112')] },
    { id: 'perfil-u', grupo: 'solo', nome: 'Perfil U', img: 'pr-perfil-u', det: 'Ferro', vars: [v('Unidade', 'JK113')] },
    // Parafusaria
    { id: 'allen', grupo: 'parafusaria', nome: 'Parafuso Allen cilíndrico inox', img: 'pr-allen', det: 'M8', vars: [v('8×20', 'JK058'), v('8×35', 'JK054'), v('8×40', 'JK053'), v('8×45', 'JK052'), v('8×50', 'JK051'), v('8×60', 'JK050')] },
    { id: 'brocante', grupo: 'parafusaria', nome: 'Parafuso brocante', img: 'pr-parafuso', det: 'Inox e costura', vars: [v('8×20 inox', 'JK060'), v('8×25 inox', 'JK061'), v('7/8 costura', 'JK064')] },
    { id: 'haste', grupo: 'parafusaria', nome: 'Haste M10', img: 'pr-haste', det: 'Inox, zincada a fogo ou Nanotec', vars: [v('M10×200 zincada a fogo', 'JK200'), v('M10×200 inox', 'JK201'), v('M10×250 inox', 'JK202'), v('M10×200 Nanotec', 'JK206'), v('M10×250 inox', 'JK250')] },
    { id: 'porcas', grupo: 'parafusaria', nome: 'Porcas', img: 'pr-porcas', det: 'Inox e zincadas', vars: [v('Sextavada flangeada M8 inox', 'JK080'), v('Sextavada M8 inox', 'JK090'), v('Sextavada M10 serrilhada inox', 'JK087'), v('Sextavada M12', 'JK082'), v('1/2 zincada a fogo', 'JK086')] },
    { id: 'arruelas', grupo: 'parafusaria', nome: 'Arruelas', img: 'pr-arruela', det: 'M8 e M12', vars: [v('Pressão M8', 'JK081'), v('Lisa M12', 'JK083')] },
    { id: 'vedacao', grupo: 'parafusaria', nome: 'Borracha de vedação de haste', img: 'pr-vedacao', det: 'Para fibrocimento', vars: [v('Unidade', 'JK207')] },
  ];

  const CONTATO = {
    whatsapp: '5545998520414',
    whatsappTxt: '(45) 99852-0414',
    fixo: '(45) 3016-0377',
    fixoTel: '+554530160377',
    endereco: 'Rod. BR-277, km 585, Quadra 1, Lote 5A1',
    referencia: 'Lateral do Parthenon Eventos · Cascavel, PR',
    mapa: 'https://www.google.com/maps/search/?api=1&query=JK+Fixadores+BR-277+km+585+Cascavel+PR',
    instagram: 'https://www.instagram.com/jkfixadoresoficial/',
  };

  raiz.JKCatalogo = { IMG, TELHADOS, KIT_COMUM, GRUPOS, PRODUTOS, CONTATO };
})(window);
