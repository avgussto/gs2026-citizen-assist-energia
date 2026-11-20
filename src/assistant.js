const assistantSources = {
  analysis: { label: 'Fórmulas nesta página', url: '#metodo' },
  epe: { label: 'EPE — consumo residencial', url: 'https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/anuario-estatistico-de-energia-eletrica' },
  aneelTariff: { label: 'ANEEL — tarifas', url: 'https://www.gov.br/aneel/pt-br/centrais-de-conteudos/relatorios-e-indicadores/tarifas-e-informacoes-economico-financeiras' },
  aneelSolar: { label: 'ANEEL — geração distribuída', url: 'https://www.gov.br/aneel/pt-br/assuntos/geracao-distribuida/' },
  lei14300: { label: 'Lei 14.300/2022 — marco da geração distribuída', url: 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14300.htm' },
  sundata: { label: 'CRESESB — SunData', url: 'https://www.cresesb.cepel.br/?section=sundata' },
  greener: { label: 'Greener — preços e payback de 2025', url: 'https://canalsolar.com.br/wp-content/uploads/2025/09/link.pdf' },
  mcti: { label: 'MCTI — fatores de emissão', url: 'https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/sirene/dados-e-ferramentas/fatores-de-emissao' }
};

const assistantSuggestions = [
  'Por onde começo?',
  'Quanto economizo no banho?',
  'Quanta água economizo no banho?',
  'Solar zera minha conta?',
  'Quanto custa instalar solar?',
  'Em quantos anos o solar se paga?',
  'Como funciona a geração solar?',
  'Qual opção vale mais para mim?',
  'Qual o impacto ambiental?',
  'O que é kWh?',
  'De onde vêm os números?',
  'Quais são as limitações?'
];

function normalizeQuestion(question) {
  return question.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function detectTopic(question) {
  const text = normalizeQuestion(question);
  const has = (pattern) => pattern.test(text);
  const solar = has(/\b(solar|painel|paineis|placa|fotovoltaic|telhado)\w*\b/);
  const bath = has(/\b(banho|chuveiro|ducha)\w*\b/);
  const water = has(/\b(agua|litro)\w*\b/);

  if (!text) return 'unknown';
  if (has(/\b(aquecedor|aquecimento|boiler|coletor|termossolar)\w*\b/) || (solar && water)) return 'solarThermal';
  if (water) return 'water';
  if (has(/\b(come[cç]|inici|primeiro|por onde|o que fazer)\w*\b/)) return 'first';
  if (has(/\b(o que e|o que significa|significa|diferenca)\b/) && has(/\b(kwh|kw|watt|watts|potencia|kwp)\b/)) return 'concept';
  if ((solar && bath) || has(/\b(compar|melhor opcao|qual opcao|vale mais|diferenc)\w*\b/)) return 'compare';
  if (has(/\b(ambient|co2|carbon|emiss|polui|sustent|clima)\w*\b/)) return 'environment';
  if (solar && has(/\b(vale a pena|se paga|paga|payback|retorno|quantos anos|compensa|viavel|viabilidade|investimento)\b/)) return 'solarPayback';
  if (has(/\b(payback|se paga|retorno do investimento|recuperar o investimento)\b/)) return 'solarPayback';
  if (has(/\b(limit|garant|certeza|confiav|precisao|estimativ)\w*\b/)) return 'limits';
  if (has(/\b(fonte|origem|numero|premiss|formula|calculo|dados)\w*\b/)) return 'sources';
  if (solar && has(/\b(cust|prec|valor|invest|financi)\w*\b/)) return 'solarCost';
  if (solar && has(/\b(zer|conta|fatura|descont|econom)\w*\b/)) return 'solarBill';
  if (solar) return 'solarHow';
  if (bath) return 'bath';
  if (has(/\b(kwh|potencia|watt|watts)\b/)) return 'concept';
  if (has(/\b(conta|fatura|tarifa|consumo|energia eletrica)\b/)) return 'bill';
  if (/^(oi|ola|e ai|opa|bom dia|boa tarde|boa noite|tudo bem|como vai|como voce esta|como esta)\b/.test(text)) return 'greeting';
  return 'unknown';
}

function answerEnergyQuestion(question, result) {
  const number = (value, digits = 1) => value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const years = Number.isFinite(result.solarPaybackAnos) ? `${number(result.solarPaybackAnos)} anos` : 'um prazo indefinido (não há consumo compensável)';
  const ligacaoNome = { monofasico: 'monofásica', bifasico: 'bifásica', trifasico: 'trifásica' }[result.ligacao];
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
      text: `O chuveiro responde por cerca de ${number(result.banhoParticipacao * 100, 0)}% do consumo informado. Pelos tempos informados, a redução calculada é de ${number(result.banhoEconomia)} kWh por mês, ou ${number(result.banhoEconomiaAnual)} kWh em 12 meses iguais. Ao valor por kWh informado, isso equivale a ${money(result.banhoValorAnual)} por ano como estimativa bruta. A economia depende de manter o novo tempo e da potência real do chuveiro.`,
      sources: ['analysis']
    },
    water: {
      text: `Com vazão de ${number(result.vazaoChuveiro)} litros por minuto, os banhos mais curtos economizariam cerca de ${number(result.aguaEconomiaMensalLitros, 0)} litros por mês, ou ${number(result.aguaEconomiaAnualLitros, 0)} litros em 12 meses. A vazão é uma hipótese: para medir a sua, encha um balde por 1 minuto com o chuveiro na posição de uso.`,
      sources: ['analysis']
    },
    solarThermal: {
      text: 'O aquecedor solar de água (coletor térmico) é outra tecnologia: aquece a água diretamente e pode substituir boa parte do uso do chuveiro elétrico. Este estudo calcula apenas a energia solar fotovoltaica, que gera eletricidade. Para aquecimento solar, peça um dimensionamento ao instalador; não estimamos custo nem economia dessa opção.',
      sources: ['analysis']
    },
    solarBill: {
      text: `Não. Numa ligação ${ligacaoNome}, a conta mantém o custo de disponibilidade de ${number(result.disponibilidade, 0)} kWh por mês, além de tributos e da cobrança gradual pelo uso da rede (Fio B, Lei 14.300). A geração estimada é ${number(result.geracaoSolar)} kWh por mês, mas só ${number(result.solarAproveitavel)} kWh podem abater a conta nesta simulação.`,
      sources: ['aneelSolar', 'lei14300', 'analysis']
    },
    solarCost: {
      text: `O custo informado para o sistema é ${money(result.solarCusto)}. O valor inicial de R$ 7.240 vem de uma média nacional de 2 kWp de junho de 2025, não de orçamento local. O valor anual bruto máximo da simulação é ${money(result.solarValorBrutoAnual)}, o que dá um retorno simples de cerca de ${years}.`,
      sources: ['greener', 'aneelSolar']
    },
    solarPayback: {
      text: `Retorno simples estimado: ${money(result.solarCusto)} ÷ ${money(result.solarValorBrutoAnual)} por ano ≈ ${years}. É um cálculo otimista: não inclui a cobrança do Fio B, tributos, reajustes, manutenção, troca do inversor nem financiamento. Para comparação, a Greener (junho de 2025) estimou retornos entre cerca de 2,6 e 4,5 anos, conforme o estado, para sistemas residenciais de 4 kWp, com premissas próprias. Peça orçamento e simulação para o seu imóvel.`,
      sources: ['greener', 'lei14300', 'analysis']
    },
    solarHow: {
      text: `Os painéis fotovoltaicos transformam luz solar em eletricidade. Para o tamanho informado, estimamos ${number(result.geracaoSolar)} kWh por mês usando 4,5 horas de sol pico por dia, rendimento de 75% e meses de 30 dias. A orientação, as sombras e o clima podem mudar a geração real.`,
      sources: ['sundata', 'analysis']
    },
    compare: {
      text: `As duas opções atendem à mesma conta de ${number(result.consumo)} kWh por mês. O banho proposto evita ${number(result.banhoEconomia)} kWh mensais (${money(result.banhoValorAnual)} por ano) sem investimento inicial. O sistema solar abate até ${number(result.solarAproveitavel)} kWh mensais (${money(result.solarValorBrutoAnual)} por ano no máximo) e exige ${money(result.solarCusto)}, com retorno simples de cerca de ${years}. Comece pela medida que pode testar sem obra e avalie solar com um projeto do imóvel. Os benefícios não devem ser somados diretamente.`,
      sources: ['analysis', 'aneelSolar']
    },
    environment: {
      text: `Usando o fator médio de emissão da rede brasileira (${number(result.fatorEmissao * 1000)} kg de CO₂ por MWh, MCTI, 2023), os banhos mais curtos evitariam cerca de ${number(result.banhoCo2AnualKg)} kg de CO₂ por ano e ${number(result.aguaEconomiaAnualLitros, 0)} litros de água. A geração solar estimada (${number(result.solarEnergiaAnual, 0)} kWh/ano) corresponde a cerca de ${number(result.solarCo2AnualKg)} kg de CO₂ por ano, sem contar fabricação e descarte dos painéis. A rede brasileira já é bastante renovável, por isso esses valores são pequenos.`,
      sources: ['mcti', 'analysis']
    },
    concept: {
      text: `Potência (W ou kW) é a rapidez com que um aparelho usa energia; energia (kWh) é a potência multiplicada pelo tempo de uso. Um chuveiro de ${number(5.5)} kW ligado por 1 hora consome 5,5 kWh. A conta de luz cobra pela energia (kWh). Já o kWp é a potência máxima de um sistema solar em condições de teste.`,
      sources: ['analysis']
    },
    sources: {
      text: 'O consumo inicial e o valor por kWh são hipóteses editáveis. Para energia solar, usamos 4,5 horas de sol pico por dia e rendimento de 75%; o custo inicial vem da pesquisa Greener de 2025. O custo de disponibilidade segue a regra da ANEEL e o fator de CO₂ vem do MCTI. A memória de cálculo separa premissas de dados publicados e mostra todas as fórmulas.',
      sources: ['analysis', 'epe', 'sundata', 'greener', 'mcti']
    },
    limits: {
      text: 'Os resultados usam 12 meses iguais e não calculam fatura completa, tributos, bandeiras, cobrança do Fio B, manutenção ou sombras no telhado. A economia no banho depende do hábito real. Antes de comprar um sistema solar, confira a conta e peça avaliação técnica e orçamento local.',
      sources: ['analysis', 'aneelTariff', 'aneelSolar']
    },
    bill: {
      text: `O consumo informado é ${number(result.consumo)} kWh por mês. Multiplicado pelo valor por kWh inserido, produz ${money(result.custoBaseMensal)} mensais como parcela variável simplificada. A fatura real também pode incluir tributos, bandeiras e outros itens.`,
      sources: ['aneelTariff', 'analysis']
    },
    unknown: {
      text: 'Ainda não consigo responder essa pergunta com os dados deste estudo. Posso ajudar com banho, água, energia solar, retorno do investimento, conta de luz, comparação, impacto ambiental, fontes e limitações. Tente uma das perguntas sugeridas.',
      sources: []
    }
  };
  return { topic, ...answers[topic], sources: answers[topic].sources.map((key) => assistantSources[key]) };
}

globalThis.assistantSuggestions = assistantSuggestions;
globalThis.answerEnergyQuestion = answerEnergyQuestion;
globalThis.detectEnergyTopic = detectTopic;
