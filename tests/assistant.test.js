import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/calculator.js';
import '../src/assistant.js';

const { calculate, answerEnergyQuestion, detectEnergyTopic, assistantSuggestions } = globalThis;
const input = { consumo: 200, tarifa: 0.9, moradores: 4, potenciaChuveiro: 5500, banhoAtual: 10, banhoProposto: 8, dias: 30, solarKwp: 2, horasSol: 4.5, desempenho: 0.75, custoSolar: 7240 };

test('sugestões cobrem os temas prometidos', () => {
  assert.equal(assistantSuggestions.length, 9);
  assert.deepEqual(assistantSuggestions.map(detectEnergyTopic), ['first', 'bath', 'solarBill', 'solarCost', 'solarHow', 'compare', 'environment', 'sources', 'limits']);
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
