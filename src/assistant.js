const assistantSources = {
  analysis: { label: 'Fórmulas nesta página', url: '#metodo' },
  epe: { label: 'EPE — consumo residencial', url: 'https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/anuario-estatistico-de-energia-eletrica' },
  aneelTariff: { label: 'ANEEL — tarifas', url: 'https://www.gov.br/aneel/pt-br/centrais-de-conteudos/relatorios-e-indicadores/tarifas-e-informacoes-economico-financeiras' },
  aneelSolar: { label: 'ANEEL — geração distribuída', url: 'https://www.gov.br/aneel/pt-br/assuntos/geracao-distribuida/' },
  sundata: { label: 'CRESESB — SunData', url: 'https://www.cresesb.cepel.br/?section=sundata' },
  greener: { label: 'Greener — preços de 2025', url: 'https://canalsolar.com.br/wp-content/uploads/2025/09/link.pdf' },
  mcti: { label: 'MCTI — fatores de emissão', url: 'https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/sirene/dados-e-ferramentas/fatores-de-emissao' }
};

const assistantSuggestions = [
  'Por onde começo?',
  'Quanto economizo no banho?',
  'Solar zera minha conta?',
  'Quanto custa instalar solar?',
  'Como funciona a geração solar?',
  'Qual opção vale mais para mim?',
  'Qual o impacto ambiental?',
  'De onde vêm os números?',
  'Quais são as limitações?'
];

function normalizeQuestion(question) {
  return question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function detectTopic(question) {
  const text = normalizeQuestion(question);
  const has = (pattern) => pattern.test(text);
  const solar = has(/\b(solar|painel|placa|fotovoltaic|telhado)\w*\b/);
  const bath = has(/\b(banho|chuveiro|ducha)\w*\b/);

  if (!text) return 'unknown';
  if (has(/\b(come[cç]|inici|primeiro|por onde|o que fazer)\w*\b/)) return 'first';
  if ((solar && bath) || has(/\b(compar|melhor opcao|qual opcao|vale mais|diferenc)\w*\b/)) return 'compare';
  if (has(/\b(ambient|co2|carbon|emiss|polui|sustent)\w*\b/)) return 'environment';
  if (has(/\b(limit|garant|certeza|confiav|precisao|estimativ)\w*\b/)) return 'limits';
  if (has(/\b(fonte|origem|numero|premiss|formula|calculo|dados)\w*\b/)) return 'sources';
  if (solar && has(/\b(cust|prec|valor|invest|retorno|payback|financi)\w*\b/)) return 'solarCost';
  if (solar && has(/\b(zer|conta|fatura|descont|econom)\w*\b/)) return 'solarBill';
  if (solar) return 'solarHow';
  if (bath) return 'bath';
  if (has(/\b(conta|fatura|tarifa|kwh|consumo|energia eletrica)\b/)) return 'bill';
  if (/^(oi|ola|e ai|opa|bom dia|boa tarde|boa noite|tudo bem|como vai|como voce esta|como esta)\b/.test(text)) return 'greeting';
  return 'unknown';
}

function answerEnergyQuestion(question, result) {
  const number = (value, digits = 1) => value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const topic = detectTopic(question);
  const answers = {
    greeting: {
      text: 'Olá! Estou bem e pronto para ajudar com a sua conta de luz. Posso comparar banhos mais curtos e energia solar, explicar os números e mostrar as fontes. Abra os temas sugeridos ou escreva sua pergunta.',
      sources: []
    },
    first: {
      text: `Comece conferindo o consumo na fatura e a potência do chuveiro. Neste cenário, reduzir cada banho como você propôs evitaria cerca de ${number(result.banhoEconomia)} kWh por mês, sem comprar equipamento. Para avaliar solar, peça um orçamento para o imóvel.`,
      sources: ['analysis', 'aneelTariff']
    },
    bath: {
      text: `Pelos tempos informados, a redução calculada é de ${number(result.banhoEconomia)} kWh por mês, ou ${number(result.banhoEconomiaAnual)} kWh em 12 meses iguais. Ao valor por kWh informado, isso equivale a ${money(result.banhoValorAnual)} por ano como estimativa bruta. A economia depende de manter o novo tempo e da potência real do chuveiro.`,
      sources: ['analysis']
    },
    solarBill: {
      text: `Não necessariamente. A geração estimada é ${number(result.geracaoSolar)} kWh por mês, mas a conta pode manter custo de disponibilidade, tributos e cobranças pelo uso da rede. Esta simulação considera no máximo ${number(result.solarAproveitavel)} kWh por mês para o valor bruto; a compensação real depende das regras da distribuidora.`,
      sources: ['aneelSolar', 'analysis']
    },
    solarCost: {
      text: `O custo informado para o sistema é ${money(result.solarCusto)}. O valor inicial de R$ 7.240 vem de uma média nacional de 2 kWp de junho de 2025, não de orçamento local. O valor anual bruto máximo da simulação é ${money(result.solarValorBrutoAnual)}, mas não serve sozinho para prever retorno: faltam tributos, regras da rede, manutenção e condições do telhado.`,
      sources: ['greener', 'aneelSolar']
    },
    solarHow: {
      text: `Os painéis fotovoltaicos transformam luz solar em eletricidade. Para o tamanho informado, estimamos ${number(result.geracaoSolar)} kWh por mês usando 4,5 horas de sol pico por dia, rendimento de 75% e meses de 30 dias. A orientação, as sombras e o clima podem mudar a geração real.`,
      sources: ['sundata', 'analysis']
    },
    compare: {
      text: `As duas opções atendem à mesma conta de ${number(result.consumo)} kWh por mês. O banho proposto evita ${number(result.banhoEconomia)} kWh mensais sem investimento inicial; o sistema solar geraria ${number(result.geracaoSolar)} kWh mensais e exige ${money(result.solarCusto)} de referência. Comece pela medida que pode testar sem obra e avalie solar com um projeto do imóvel. Os benefícios não devem ser somados diretamente.`,
      sources: ['analysis', 'aneelSolar']
    },
    environment: {
      text: `Banhos mais curtos evitariam ${number(result.banhoEconomiaAnual)} kWh de consumo da rede em 12 meses iguais. A geração solar estimada é ${number(result.solarEnergiaAnual)} kWh nesse período, mas fabricação e descarte dos painéis também têm impactos. Não atribuímos um número de CO₂ evitado sem análise adequada.`,
      sources: ['analysis', 'mcti']
    },
    sources: {
      text: 'O consumo inicial e o valor por kWh são hipóteses editáveis. Para energia solar, usamos 4,5 horas de sol pico por dia e rendimento de 75%; o custo inicial vem da pesquisa Greener de 2025. A memória de cálculo separa essas premissas dos dados publicados e mostra todas as fórmulas.',
      sources: ['analysis', 'epe', 'sundata', 'greener']
    },
    limits: {
      text: 'Os resultados usam 12 meses iguais e não calculam fatura completa, tributos, bandeiras, compensação de créditos, manutenção ou sombras no telhado. A economia no banho depende do hábito real. Antes de comprar um sistema solar, confira a conta e peça avaliação técnica e orçamento local.',
      sources: ['analysis', 'aneelTariff', 'aneelSolar']
    },
    bill: {
      text: `O consumo informado é ${number(result.consumo)} kWh por mês. Multiplicado pelo valor por kWh inserido, produz ${money(result.custoBaseMensal)} mensais como parcela variável simplificada. A fatura real também pode incluir tributos, bandeiras e outros itens.`,
      sources: ['aneelTariff', 'analysis']
    },
    unknown: {
      text: 'Ainda não consigo responder essa pergunta com os dados deste estudo. Posso ajudar com banho, energia solar, conta de luz, comparação, impacto ambiental, fontes e limitações. Tente uma dessas perguntas sugeridas.',
      sources: []
    }
  };
  return { topic, ...answers[topic], sources: answers[topic].sources.map((key) => assistantSources[key]) };
}

globalThis.assistantSuggestions = assistantSuggestions;
globalThis.answerEnergyQuestion = answerEnergyQuestion;
globalThis.detectEnergyTopic = detectTopic;
