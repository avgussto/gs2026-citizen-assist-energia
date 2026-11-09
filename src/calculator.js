function calculate(input) {
  const { consumo, tarifa, moradores, potenciaChuveiro, banhoAtual, banhoProposto, dias, solarKwp, horasSol, desempenho, custoSolar } = input;
  const values = Object.values(input);
  if (values.some((value) => !Number.isFinite(value))) throw new Error('Preencha todos os campos com números válidos.');
  if (consumo <= 0 || tarifa <= 0 || moradores <= 0 || potenciaChuveiro <= 0 || banhoAtual <= 0 || banhoProposto < 0 || dias <= 0 || solarKwp <= 0 || horasSol <= 0 || desempenho <= 0 || desempenho > 1 || custoSolar < 0) {
    throw new Error('Use valores positivos e um fator solar entre 0 e 1.');
  }
  if (banhoProposto >= banhoAtual) throw new Error('O banho proposto deve durar menos que o banho atual.');
  if (moradores > 30 || banhoAtual > 120 || potenciaChuveiro > 15000 || consumo > 100000 || tarifa > 100 || solarKwp > 100 || horasSol > 12) {
    throw new Error('Confira os valores: um ou mais campos estão fora do intervalo desta simulação residencial.');
  }

  const banhoBase = (potenciaChuveiro / 1000) * (banhoAtual / 60) * moradores * dias;
  const banhoEconomiaCalculada = (potenciaChuveiro / 1000) * ((banhoAtual - banhoProposto) / 60) * moradores * dias;
  const banhoEconomia = Math.min(banhoEconomiaCalculada, consumo);
  const geracaoSolar = solarKwp * horasSol * desempenho * dias;
  const solarAproveitavel = Math.min(geracaoSolar, consumo);
  const solarExcedente = Math.max(0, geracaoSolar - consumo);

  return {
    consumo,
    custoBaseMensal: consumo * tarifa,
    banhoBase,
    banhoEconomia,
    banhoEconomiaAnual: banhoEconomia * 12,
    banhoValorAnual: banhoEconomia * tarifa * 12,
    banhoParticipacao: banhoBase / consumo,
    geracaoSolar,
    solarAproveitavel,
    solarExcedente,
    solarEnergiaAnual: geracaoSolar * 12,
    solarValorBrutoAnual: solarAproveitavel * tarifa * 12,
    solarCusto: custoSolar,
    consumoAposBanho: consumo - banhoEconomia
  };
}

globalThis.calculate = calculate;
