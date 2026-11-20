import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/calculator.js';
import '../src/assistant.js';

const { calculate, answerEnergyQuestion, detectEnergyTopic, assistantSuggestions } = globalThis;
const input = { consumo: 250, tarifa: 0.9, moradores: 4, potenciaChuveiro: 5500, banhoAtual: 10, banhoProposto: 8, dias: 30, solarKwp: 2, horasSol: 4.5, desempenho: 0.75, custoSolar: 7240, ligacao: 'bifasico', vazaoChuveiro: 4, fatorEmissao: 0.0385 };

test('sugestões cobrem os temas prometidos', () => {
  assert.equal(assistantSuggestions.length, 12);
  assert.deepEqual(assistantSuggestions.map(detectEnergyTopic), ['first', 'bath', 'water', 'solarBill', 'solarCost', 'solarPayback', 'solarHow', 'compare', 'environment', 'concept', 'sources', 'limits']);
});

test('perguntas digitadas reconhecem variações e acentos', () => {
  assert.equal(detectEnergyTopic('Olá, tudo bem?'), 'greeting');
  assert.equal(detectEnergyTopic('Boa noite'), 'greeting');
  assert.equal(detectEnergyTopic('Oi, quanto custa instalar solar?'), 'solarCost');
  assert.equal(detectEnergyTopic('Quanto economizo com o chuveiro?'), 'bath');
  assert.equal(detectEnergyTopic('A energia solar vai zerar a fatura?'), 'solarBill');
  assert.equal(detectEnergyTopic('Qual é o preço das placas solares?'), 'solarCost');
  assert.equal(detectEnergyTopic('Banho e solar: qual compensa?'), 'compare');
  assert.equal(detectEnergyTopic('De onde vem esse cálculo?'), 'sources');
});

test('perguntas centrais de viabilidade, água e conceitos vão para o tema certo', () => {
  assert.equal(detectEnergyTopic('Vale a pena instalar placa solar?'), 'solarPayback');
  assert.equal(detectEnergyTopic('Em quantos anos o solar se paga?'), 'solarPayback');
  assert.equal(detectEnergyTopic('Quanto tempo leva para recuperar o investimento?'), 'solarPayback');
  assert.equal(detectEnergyTopic('Quanta água economizo no banho?'), 'water');
  assert.equal(detectEnergyTopic('aquecedor solar de água compensa?'), 'solarThermal');
  assert.equal(detectEnergyTopic('O que é kWh?'), 'concept');
  assert.equal(detectEnergyTopic('Qual a diferença entre kW e kWh?'), 'concept');
  assert.equal(detectEnergyTopic('Quanto de CO2 eu evito?'), 'environment');
});

test('respostas de retorno e ambiente trazem números do cálculo', () => {
  const result = calculate(input);
  assert.match(answerEnergyQuestion('Em quantos anos o solar se paga?', result).text, /3,4 anos/);
  assert.match(answerEnergyQuestion('Qual o impacto ambiental?', result).text, /10,2 kg/);
  assert.match(answerEnergyQuestion('Quanta água economizo?', result).text, /960 litros/);
  assert.match(answerEnergyQuestion('Solar zera minha conta?', result).text, /50 kWh/);
});

test('saudações recebem uma resposta acolhedora e delimitada ao estudo', () => {
  const answer = answerEnergyQuestion('Oi, tudo bem?', calculate(input));
  assert.equal(answer.topic, 'greeting');
  assert.match(answer.text, /Olá!/);
  assert.match(answer.text, /conta de luz/);
});

test('resposta usa o resultado atualizado e traz fonte', () => {
  const initial = answerEnergyQuestion('Quanto economizo no banho?', calculate(input));
  const updated = answerEnergyQuestion('Quanto economizo no banho?', calculate({ ...input, banhoProposto: 6 }));
  assert.match(initial.text, /22,0 kWh/);
  assert.match(updated.text, /44,0 kWh/);
  assert.notEqual(initial.text, updated.text);
  assert.ok(initial.sources[0].url);
});

test('pergunta fora do estudo recebe limite explícito', () => {
  const answer = answerEnergyQuestion('Qual é a previsão do tempo amanhã?', calculate(input));
  assert.equal(answer.topic, 'unknown');
  assert.match(answer.text, /não consigo responder/);
  assert.deepEqual(answer.sources, []);
});
