import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/calculator.js';

const { calculate } = globalThis;

const input = { consumo: 200, tarifa: 0.9, moradores: 4, potenciaChuveiro: 5500, banhoAtual: 10, banhoProposto: 8, dias: 30, solarKwp: 2, horasSol: 4.5, desempenho: 0.75, custoSolar: 7240 };

test('compara alternativas sobre a mesma base mensal', () => {
  const result = calculate(input);
  assert.equal(result.banhoBase, 110);
  assert.ok(Math.abs(result.banhoEconomia - 22) < 1e-10);
  assert.equal(result.geracaoSolar, 202.5);
  assert.equal(result.solarAproveitavel, 200);
  assert.equal(result.solarExcedente, 2.5);
  assert.ok(Math.abs(result.banhoValorAnual - 237.6) < 1e-10);
  assert.equal(result.solarValorBrutoAnual, 2160);
});

test('limita energia aproveitável ao consumo sem esconder excedente', () => {
  const result = calculate({ ...input, consumo: 50 });
  assert.equal(result.solarAproveitavel, 50);
  assert.equal(result.solarExcedente, 152.5);
  assert.equal(result.banhoEconomia, 22);
});

test('impede recomendações quando os dados são incoerentes', () => {
  assert.throws(() => calculate({ ...input, banhoProposto: 12 }), /menos/);
  assert.throws(() => calculate({ ...input, tarifa: 0 }), /positivos/);
  assert.throws(() => calculate({ ...input, horasSol: Number.NaN }), /números/);
});
