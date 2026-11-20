const form = document.querySelector('#energy-form');
const error = document.querySelector('#form-error');
const chatPanel = document.querySelector('#chat-panel');
const chatLog = document.querySelector('#chat-log');
const chatInput = document.querySelector('#chat-input');
const chatForm = document.querySelector('#chat-form');
const chatSuggestions = document.querySelector('#chat-suggestions');
const openButtons = document.querySelectorAll('[data-open-assistant]');
const number = (value, digits = 0) => value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const currency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
let result;
let lastOpener = null;
let assumptions = { periodoDias: 30, irradiacaoHorasSolPico: 4.5, fatorDesempenhoSolar: 0.75, fatorEmissaoTco2PorMwh: 0.0385 };

function value(id) { return Number(document.getElementById(id).value); }
function put(id, text) { document.getElementById(id).textContent = text; }

function inputValues() {
  return {
    consumo: value('consumo'), tarifa: value('tarifa'), moradores: value('moradores'),
    potenciaChuveiro: value('potencia'), banhoAtual: value('banho-atual'), banhoProposto: value('banho-proposto'),
    dias: assumptions.periodoDias, solarKwp: value('solar-kwp'), horasSol: assumptions.irradiacaoHorasSolPico,
    desempenho: assumptions.fatorDesempenhoSolar, custoSolar: value('solar-custo'),
    ligacao: document.getElementById('ligacao').value, vazaoChuveiro: value('vazao'), fatorEmissao: assumptions.fatorEmissaoTco2PorMwh
  };
}

function addMessage(kind, text, sources = []) {
  const message = document.createElement('div');
  message.className = `chat-message chat-message-${kind}`;
  const body = document.createElement('p');
  body.textContent = text;
  message.append(body);
  if (sources.length) {
    const references = document.createElement('div');
    references.className = 'chat-references';
    for (const source of sources) {
      const link = document.createElement('a');
      link.href = source.url;
      link.textContent = source.label;
      if (!source.url.startsWith('#')) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      references.append(link);
    }
    message.append(references);
  }
  chatLog.append(message);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function resetConversation(updated = false) {
  chatLog.replaceChildren();
  addMessage('assistant', updated
    ? 'Dados atualizados. A conversa anterior foi reiniciada para que as próximas respostas usem os novos números.'
    : 'Olá! Posso explicar os cálculos, comparar as opções e mostrar as fontes. Escolha uma pergunta ou escreva a sua.');
  chatInput.value = '';
}

function ask(question) {
  const clean = question.trim();
  if (!clean || !result) return;
  addMessage('user', clean);
  const response = answerEnergyQuestion(clean, result);
  addMessage('assistant', response.text, response.sources);
  chatInput.value = '';
  chatInput.focus();
}

function openAssistant(opener) {
  lastOpener = opener;
  chatPanel.hidden = false;
  openButtons.forEach((button) => button.setAttribute('aria-expanded', 'true'));
  chatInput.focus();
}

function closeAssistant() {
  chatPanel.hidden = true;
  openButtons.forEach((button) => button.setAttribute('aria-expanded', 'false'));
  lastOpener?.focus();
}

function render(resetChat = false) {
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
    put('bath-share', `${number(result.banhoParticipacao * 100, 0)}% do consumo`);
    put('bath-water', `${number(result.aguaEconomiaMensalLitros, 0)} L/mês`);
    put('bath-co2', `${number(result.banhoCo2AnualKg, 1)} kg/ano`);
    put('solar-energy', `${number(result.geracaoSolar, 1)} kWh`);
    put('solar-value', currency(result.solarValorBrutoAnual));
    put('solar-cost', currency(result.solarCusto));
    put('solar-excess', `${number(result.solarExcedente, 1)} kWh/mês`);
    put('solar-usable', `${number(result.solarAproveitavel, 1)} kWh/mês`);
    put('solar-payback', Number.isFinite(result.solarPaybackAnos) ? `${number(result.solarPaybackAnos, 1)} anos` : 'indefinido');
    put('solar-co2', `${number(result.solarCo2AnualKg, 1)} kg/ano`);
    const warning = result.banhoBase > result.consumo
      ? ' Atenção: os banhos calculados consomem mais que o total informado; confira as entradas.'
      : '';
    put('interpretation-text', `O banho proposto reduziria cerca de ${number(result.banhoEconomia, 1)} kWh/mês sem investimento inicial. O sistema solar exige ${currency(result.solarCusto)} de investimento de referência, com retorno simples de cerca de ${Number.isFinite(result.solarPaybackAnos) ? number(result.solarPaybackAnos, 1) + ' anos' : 'prazo indefinido'}, e avaliação técnica do telhado. Os valores financeiros são aproximações brutas.${warning}`);
    if (resetChat) resetConversation(true);
  } catch (cause) {
    error.textContent = cause.message;
    error.hidden = false;
  }
}

form.addEventListener('submit', (event) => { event.preventDefault(); render(true); });
openButtons.forEach((button) => button.addEventListener('click', () => openAssistant(button)));
document.querySelector('#chat-close').addEventListener('click', closeAssistant);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !chatPanel.hidden) closeAssistant();
});
chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  ask(chatInput.value);
});
for (const question of assistantSuggestions) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = question;
  button.addEventListener('click', () => ask(question));
  chatSuggestions.append(button);
}
resetConversation();
async function initialize() {
  try {
    const response = await fetch('/data/premissas.json');
    if (!response.ok) throw new Error('Não foi possível carregar as premissas do estudo.');
    assumptions = await response.json();
    const fields = {
      consumo: assumptions.consumoMensalKwh, tarifa: assumptions.tarifaReaisKwh,
      moradores: assumptions.moradores, potencia: assumptions.potenciaChuveiroWatts,
      'banho-atual': assumptions.banhoAtualMinutos, 'banho-proposto': assumptions.banhoPropostoMinutos,
      'solar-kwp': assumptions.potenciaSolarKwp, 'solar-custo': assumptions.precoSolarInstaladoReais,
      ligacao: assumptions.ligacao, vazao: assumptions.vazaoChuveiroLitrosMinuto
    };
    for (const [id, entry] of Object.entries(fields)) document.getElementById(id).value = entry;
    render();
  } catch (cause) {
    error.textContent = cause.message;
    error.hidden = false;
  }
}

if (location.protocol === 'file:') render();
else initialize();
