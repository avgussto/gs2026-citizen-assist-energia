import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/calculator.js';

const { calculate } = globalThis;

const input = { consumo: 250, tarifa: 0.9, moradores: 4, potenciaChuveiro: 5500, banhoAtual: 10, banhoProposto: 8, dias: 30, solarKwp: 2, horasSol: 4.5, desempenho: 0.75, custoSolar: 7240, ligacao: 'bifasico', vazaoChuveiro: 4, fatorEmissao: 0.0385 };
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≠ ${expected}`);

test('compara alternativas sobre a mesma base mensal', () => {
  const result = calculate(input);
  assert.equal(result.banhoBase, 110);
  close(result.banhoParticipacao, 0.44);
  close(result.banhoEconomia, 22);
  assert.equal(result.geracaoSolar, 202.5);
  assert.equal(result.solarAproveitavel, 200);
  assert.equal(result.solarExcedente, 2.5);
  close(result.banhoValorAnual, 237.6);
  assert.equal(result.solarValorBrutoAnual, 2160);
});

test('desconta o custo de disponibilidade conforme a ligação', () => {
  assert.equal(calculate({ ...input, ligacao: 'monofasico' }).solarAproveitavel, 202.5);
  assert.equal(calculate({ ...input, ligacao: 'trifasico' }).solarAproveitavel, 150);
  assert.equal(calculate({ ...input, ligacao: 'trifasico' }).solarExcedente, 52.5);
  assert.throws(() => calculate({ ...input, ligacao: 'outra' }), /ligação/);
});

test('calcula retorno simples, CO2 e água no mesmo período', () => {
  const result = calculate(input);
  close(result.solarPaybackAnos, 7240 / 2160);
  close(result.banhoCo2AnualKg, 264 * 0.0385);
  close(result.solarCo2AnualKg, 2430 * 0.0385);
  assert.equal(result.aguaEconomiaMensalLitros, 960);
  assert.equal(result.aguaEconomiaAnualLitros, 11520);
});

test('limita energia aproveitável ao consumo sem esconder excedente', () => {
  const result = calculate({ ...input, consumo: 50, ligacao: 'monofasico' });
  assert.equal(result.solarAproveitavel, 20);
  assert.equal(result.solarExcedente, 182.5);
  assert.equal(result.banhoEconomia, 22);
  assert.equal(calculate({ ...input, consumo: 40 }).solarPaybackAnos, Infinity);
});

test('impede recomendações quando os dados são incoerentes', () => {
  assert.throws(() => calculate({ ...input, banhoProposto: 12 }), /menos/);
  assert.throws(() => calculate({ ...input, tarifa: 0 }), /positivos/);
  assert.throws(() => calculate({ ...input, horasSol: Number.NaN }), /números/);
});
