/*
 * Regras da PRÉ-LISTA ESTIMADA da JK Fixadores.
 * ------------------------------------------------------------------
 * A lista oficial sai do sistema da JK (Mim). Isto é só uma estimativa
 * para o cliente enxergar o pedido. TODOS os valores abaixo são padrões
 * de mercado e precisam ser validados com a JK.
 * Para ajustar: mude apenas o objeto REGRAS. O resto não precisa mexer.
 */
(function (raiz) {
  const REGRAS = {
    folgaEntrePlacas: 20,   // mm entre uma placa e outra na linha
    sobraPonta: 50,         // mm de trilho sobrando em cada ponta
    trilhosPorLinha: 2,     // trilhos por linha de placas
    vaoMaximo: {            // mm entre suportes no mesmo trilho
      ceramico: 1200, 'fibro-madeira': 1200, 'fibro-metal': 1200,
      laje: 1200, kalhetao: 1200, single: 1200,
    },
    miniTrilhoMedida: 300,  // mm (JK620 250 · JK621 300 · JK622 500 · JK623 600)
  };

  // Códigos do catálogo 2025, pela espessura da moldura (30/35/40 mm)
  const KIT_FINAL = { 30: 'JK301', 35: 'JK306', 40: 'JK311' };
  const KIT_INTER = {
    U: { 30: 'JK300', 35: 'JK305', 40: 'JK310' },
    RETO: { 30: 'JK302', 35: 'JK307', 40: 'JK312' },
  };
  const MINI_TRILHO = { 250: 'JK620', 300: 'JK621', 500: 'JK622', 600: 'JK623' };

  const PERFIS = {
    H: { nome: 'Perfil tubular H', emenda: 'JK315' },
    H2: { nome: 'Perfil tubular H2', emenda: 'JK315' },
    H2R: { nome: 'Perfil tubular H2 reforçado', emenda: 'JK316' },
    LIGHT: { nome: 'Perfil tubular Light', emenda: 'JK315' },
  };

  // Suporte de fixação por tipo de telhado
  const SUPORTE = {
    ceramico: { codigo: null, nome: 'Kit gancho cerâmico (telha baixa ou alta)' }, // código depende da telha e do trilho
    'fibro-madeira': { codigo: 'JK400', nome: 'Kit fibromadeira (haste M10×200 inox)' },
    'fibro-metal': { codigo: 'JK406', nome: 'Kit fibrocimento ponta broca (inox)' },
    laje: { codigo: 'JK107', nome: 'Suporte para concreto' },
    kalhetao: { codigo: 'JK037', nome: 'Suporte kalhetão (alumínio)' },
    single: { codigo: 'JK038', nome: 'Suporte single (alumínio)' },
  };

  const inteiro = n => Math.max(0, Math.floor(Number(n) || 0));

  function calcular(p) {
    const linhas = (p.linhas || []).map(inteiro).filter(n => n > 0);
    const placas = linhas.reduce((s, n) => s + n, 0);
    const resumo = {
      placas,
      linhas: linhas.length,
      kwp: p.potencia ? Math.round(placas * Number(p.potencia) / 100) / 10 : null,
    };
    const avisos = ['Estimativa. O vendedor confere a lista no sistema da JK.'];

    if (p.telhado === 'solo') {
      return { itens: [], avisos: ['Estrutura de solo é projeto sob medida: o vendedor monta a lista com você.'], semEstimativa: true, resumo };
    }
    if (!placas) return { itens: [], avisos, semEstimativa: false, resumo };

    const esp = [30, 35, 40].includes(Number(p.placa?.esp)) ? Number(p.placa.esp) : 30;
    const larguraNaLinha = p.orientacao === 'paisagem' ? Number(p.placa.comp) : Number(p.placa.larg);
    const tipoInter = p.intermediario === 'RETO' ? 'RETO' : 'U';

    const finais = 4 * linhas.length;
    const inters = linhas.reduce((s, n) => s + 2 * (n - 1), 0);
    const itens = [
      { id: 'final', codigo: KIT_FINAL[esp], nome: `Kit perfil final ${esp} mm`, qtd: finais },
      { id: 'intermediario', codigo: KIT_INTER[tipoInter][esp], nome: `Kit intermediário ${tipoInter === 'U' ? 'U' : 'reto'} ${esp} mm`, qtd: inters },
    ];

    if (p.telhado === 'metalico') {
      const mm = REGRAS.miniTrilhoMedida;
      const minis = linhas.reduce((s, n) => s + 2 * (n + 1), 0);
      itens.push({ id: 'minitrilho', codigo: MINI_TRILHO[mm], nome: `Suporte mini trilho ${mm} mm (aluzinco)`, qtd: minis });
    } else {
      const perfil = PERFIS[p.perfil] || PERFIS.H2;
      const barra = Number(p.barra) === 6000 ? 6000 : 4800;
      const vao = REGRAS.vaoMaximo[p.telhado] || 1200;
      let barras = 0, emendas = 0, suportes = 0;
      for (const n of linhas) {
        const comp = n * larguraNaLinha + (n - 1) * REGRAS.folgaEntrePlacas + 2 * REGRAS.sobraPonta;
        const porTrilho = Math.ceil(comp / barra);
        barras += porTrilho * REGRAS.trilhosPorLinha;
        emendas += (porTrilho - 1) * REGRAS.trilhosPorLinha;
        suportes += (Math.ceil(comp / vao) + 1) * REGRAS.trilhosPorLinha;
      }
      itens.push({ id: 'trilho', codigo: null, nome: `${perfil.nome} · barra ${barra} mm`, qtd: barras });
      itens.push({ id: 'emenda', codigo: perfil.emenda, nome: `Kit emenda ${p.perfil === 'H2R' ? 'perfil reforçado' : 'perfil H'}`, qtd: emendas });
      const sup = SUPORTE[p.telhado] || SUPORTE.ceramico;
      itens.push({ id: 'suporte', codigo: sup.codigo, nome: sup.nome, qtd: suportes });
    }

    return { itens: itens.filter(i => i.qtd > 0), avisos, semEstimativa: false, resumo };
  }

  const api = { calcular, REGRAS, KIT_FINAL, KIT_INTER, SUPORTE, PERFIS };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.JKRegras = api;
})(typeof window !== 'undefined' ? window : globalThis);
