import { calculate } from './calculator.js';

const form = document.querySelector('#energy-form');
const error = document.querySelector('#form-error');
const answer = document.querySelector('#answer');
const questions = document.querySelectorAll('[data-question]');
const number = (value, digits = 0) => value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const currency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
let result;
let activeQuestion = null;
let assumptions = { periodoDias: 30, irradiacaoHorasSolPico: 4.5, fatorDesempenhoSolar: 0.75 };

function value(id) { return Number(document.getElementById(id).value); }
function put(id, text) { document.getElementById(id).textContent = text; }

function inputValues() {
  return {
    consumo: value('consumo'), tarifa: value('tarifa'), moradores: value('moradores'),
    potenciaChuveiro: value('potencia'), banhoAtual: value('banho-atual'), banhoProposto: value('banho-proposto'),
    dias: assumptions.periodoDias, solarKwp: value('solar-kwp'), horasSol: assumptions.irradiacaoHorasSolPico,
    desempenho: assumptions.fatorDesempenhoSolar, custoSolar: value('solar-custo')
  };
}

function responseFor(question) {
  if (!result) return 'Atualize a comparação para receber uma orientação.';
  if (question === 'first') {
    return `Pelos seus dados, reduzir o banho pouparia cerca de ${number(result.banhoEconomia, 1)} kWh por mês, sem compra de equipamento. Comece por medir o tempo e conferir a potência do chuveiro. A estimativa só se mantém se o hábito mudar todos os dias.`;
  }
  if (question === 'solar') {
    return `Não. O sistema geraria aproximadamente ${number(result.geracaoSolar, 1)} kWh por mês neste cenário, dos quais até ${number(result.solarAproveitavel, 1)} kWh foram considerados aqui. A fatura ainda pode incluir custo de disponibilidade, tributos e cobrança pelo uso da rede. Consulte as regras da ANEEL e peça um projeto e orçamento para o imóvel.`;
  }
  return `Banhos mais curtos evitam aproximadamente ${number(result.banhoEconomiaAnual, 1)} kWh de consumo da rede em 12 meses iguais. A geração solar estimada é de ${number(result.solarEnergiaAnual, 1)} kWh no mesmo período, mas gerar não é o mesmo que evitar emissões nessa proporção. A matriz elétrica brasileira já inclui fontes renováveis; fabricação e descarte dos painéis também têm impactos. Sem estudo do ciclo de vida, não atribuímos um número de CO₂ evitado.`;
}

function render() {
  try {
    if (!form.checkValidity()) {
      form.reportValidity();
      throw new Error('Preencha todos os campos nos intervalos indicados.');
    }
    result = calculate(inputValues());
    error.hidden = true;
    put('hero-consumo', number(result.consumo, Number.isInteger(result.consumo) ? 0 : 1));
    put('hero-valor', currency(result.custoBaseMensal));
    put('bath-energy', `${number(result.banhoEconomia, 1)} kWh`);
    put('bath-value', currency(result.banhoValorAnual));
    put('bath-remaining', `${number(result.consumoAposBanho, 1)} kWh/mês`);
    put('solar-energy', `${number(result.geracaoSolar, 1)} kWh`);
    put('solar-value', currency(result.solarValorBrutoAnual));
    put('solar-cost', currency(result.solarCusto));
    put('solar-excess', `${number(result.solarExcedente, 1)} kWh/mês`);
    const warning = result.banhoBase > result.consumo
      ? ' Atenção: os banhos calculados consomem mais que o total informado; confira as entradas.'
      : '';
    put('interpretation-text', `O banho proposto reduziria cerca de ${number(result.banhoEconomia, 1)} kWh/mês sem investimento inicial. O sistema solar exige ${currency(result.solarCusto)} de investimento de referência e avaliação técnica do telhado. Os valores financeiros são aproximações brutas.${warning}`);
    if (activeQuestion) answer.textContent = responseFor(activeQuestion);
  } catch (cause) {
    error.textContent = cause.message;
    error.hidden = false;
  }
}

form.addEventListener('submit', (event) => { event.preventDefault(); render(); });
questions.forEach((button) => button.addEventListener('click', () => {
  activeQuestion = button.dataset.question;
  questions.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  answer.textContent = responseFor(activeQuestion);
}));
async function initialize() {
  try {
    const response = await fetch('/data/premissas.json');
    if (!response.ok) throw new Error('Não foi possível carregar as premissas do estudo.');
    assumptions = await response.json();
    const fields = {
      consumo: assumptions.consumoMensalKwh, tarifa: assumptions.tarifaReaisKwh,
      moradores: assumptions.moradores, potencia: assumptions.potenciaChuveiroWatts,
      'banho-atual': assumptions.banhoAtualMinutos, 'banho-proposto': assumptions.banhoPropostoMinutos,
      'solar-kwp': assumptions.potenciaSolarKwp, 'solar-custo': assumptions.precoSolarInstaladoReais
    };
    for (const [id, entry] of Object.entries(fields)) document.getElementById(id).value = entry;
    render();
  } catch (cause) {
    error.textContent = cause.message;
    error.hidden = false;
  }
}

initialize();
