// Custo de disponibilidade (REN ANEEL 1.000/2021): mínimo faturado por tipo de ligação, em kWh/mês.
const custoDisponibilidadeKwh = { monofasico: 30, bifasico: 50, trifasico: 100 };

function calculate(input) {
  const {
    consumo, tarifa, moradores, potenciaChuveiro, banhoAtual, banhoProposto, dias, solarKwp, horasSol, desempenho, custoSolar,
    ligacao = 'bifasico', vazaoChuveiro = 4, fatorEmissao = 0.0385
  } = input;
  const numeric = { consumo, tarifa, moradores, potenciaChuveiro, banhoAtual, banhoProposto, dias, solarKwp, horasSol, desempenho, custoSolar, vazaoChuveiro, fatorEmissao };
  if (Object.values(numeric).some((value) => !Number.isFinite(value))) throw new Error('Preencha todos os campos com números válidos.');
  if (!(ligacao in custoDisponibilidadeKwh)) throw new Error('Escolha o tipo de ligação: monofásica, bifásica ou trifásica.');
  if (consumo <= 0 || tarifa <= 0 || moradores <= 0 || potenciaChuveiro <= 0 || banhoAtual <= 0 || banhoProposto < 0 || dias <= 0 || solarKwp <= 0 || horasSol <= 0 || desempenho <= 0 || desempenho > 1 || custoSolar < 0 || vazaoChuveiro < 0 || fatorEmissao < 0) {
    throw new Error('Use valores positivos e um fator solar entre 0 e 1.');
  }
  if (banhoProposto >= banhoAtual) throw new Error('O banho proposto deve durar menos que o banho atual.');
  if (moradores > 30 || banhoAtual > 120 || potenciaChuveiro > 15000 || consumo > 100000 || tarifa > 100 || solarKwp > 100 || horasSol > 12 || vazaoChuveiro > 30) {
    throw new Error('Confira os valores: um ou mais campos estão fora do intervalo desta simulação residencial.');
  }

  // Energia (kWh) = potência (kW) × tempo (h). Um banho por pessoa por dia.
  const banhoBase = (potenciaChuveiro / 1000) * (banhoAtual / 60) * moradores * dias;
  const banhoEconomiaCalculada = (potenciaChuveiro / 1000) * ((banhoAtual - banhoProposto) / 60) * moradores * dias;
  const banhoEconomia = Math.min(banhoEconomiaCalculada, consumo);
  const aguaEconomiaMensalLitros = vazaoChuveiro * (banhoAtual - banhoProposto) * moradores * dias;

  // Geração (kWh) = kWp × horas de sol pico × fator de desempenho × dias.
  const geracaoSolar = solarKwp * horasSol * desempenho * dias;
  const disponibilidade = custoDisponibilidadeKwh[ligacao];
  // A conta não fica abaixo do custo de disponibilidade: só o consumo acima dele pode ser abatido.
  const consumoCompensavel = Math.max(0, consumo - disponibilidade);
  const solarAproveitavel = Math.min(geracaoSolar, consumoCompensavel);
  const solarExcedente = Math.max(0, geracaoSolar - consumoCompensavel);
  const solarValorBrutoAnual = solarAproveitavel * tarifa * 12;
  const solarPaybackAnos = solarValorBrutoAnual > 0 ? custoSolar / solarValorBrutoAnual : Infinity;

  return {
    consumo,
    custoBaseMensal: consumo * tarifa,
    banhoBase,
    banhoEconomia,
    banhoEconomiaAnual: banhoEconomia * 12,
    banhoValorAnual: banhoEconomia * tarifa * 12,
    banhoParticipacao: banhoBase / consumo,
    banhoCo2AnualKg: banhoEconomia * 12 * fatorEmissao,
    aguaEconomiaMensalLitros,
    aguaEconomiaAnualLitros: aguaEconomiaMensalLitros * 12,
    vazaoChuveiro,
    geracaoSolar,
    ligacao,
    disponibilidade,
    consumoCompensavel,
    solarAproveitavel,
    solarExcedente,
    solarEnergiaAnual: geracaoSolar * 12,
    solarValorBrutoAnual,
    solarPaybackAnos,
    solarCo2AnualKg: geracaoSolar * 12 * fatorEmissao,
    solarCusto: custoSolar,
    fatorEmissao,
    consumoAposBanho: consumo - banhoEconomia
  };
}

globalThis.calculate = calculate;
globalThis.custoDisponibilidadeKwh = custoDisponibilidadeKwh;
