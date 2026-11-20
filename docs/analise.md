# Memória de cálculo — energia residencial

## Problema e recorte

Público: famílias que precisam entender a conta de luz e avaliar opções de economia ou fornecimento renovável. Local de referência: São Paulo, SP. Comparamos **a mesma necessidade de eletricidade da casa** durante um mês de 30 dias e, para valores anuais, 12 meses iguais. O cenário padrão de 250 kWh/mês para uma família de 4 pessoas com chuveiro elétrico é uma **estimativa**, não a média oficial de São Paulo. A [EPE publica o consumo médio por região e unidade federativa](https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/anuario-estatistico-de-energia-eletrica); a família deve substituir o valor padrão pelo consumo da sua conta.

Dados e hipóteses auditáveis estão em [`data/premissas.json`](../data/premissas.json). Consulta das fontes: **19/11/2026**.

### Dados publicados e hipóteses

| Valor | Tipo | Origem |
| --- | --- | --- |
| Custo de disponibilidade: 30 / 50 / 100 kWh/mês | **Dado regulatório** | REN ANEEL 1.000/2021, conforme a ligação ser mono, bi ou trifásica |
| Preço do sistema: R$ 3,62/Wp (2 kWp) | **Dado publicado** | [Greener, junho de 2025, p. 55](https://canalsolar.com.br/wp-content/uploads/2025/09/link.pdf) |
| Fator de desempenho: 75% | **Dado publicado** (premissa de mercado) | Greener, 2025, premissa de PR usada no cálculo de payback |
| Fator de emissão: 38,5 kg CO₂/MWh | **Dado publicado** | Fator médio anual do SIN em 2023, [MCTI](https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/sirene/dados-e-ferramentas/fatores-de-emissao) |
| Transição do Fio B | **Dado regulatório** | [Lei 14.300/2022](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14300.htm) |
| Consumo de 250 kWh/mês, tarifa de R$ 0,90/kWh | Estimativa | Cenário editável; substituir pela fatura |
| Chuveiro de 5.500 W, banhos de 10 → 8 min, 4 pessoas | Estimativa | Cenário editável; conferir etiqueta e hábito |
| Vazão do chuveiro: 4 L/min | Estimativa | Faixa usual de 3 a 6 L/min; medir com balde por 1 minuto |
| 4,5 horas de sol pico por dia | Estimativa | Valor arredondado; conferir no [SunData do CRESESB](https://www.cresesb.cepel.br/?section=sundata) |

## Fórmulas e unidades

Potência (W, kW) é a taxa de uso de energia; energia (kWh) é potência × tempo. A conta cobra energia.

1. **Chuveiro**, em kWh/mês: `(potência em W ÷ 1000) × (minutos por banho ÷ 60) × pessoas × 30 dias`. Um banho por pessoa por dia é hipótese do cenário. A economia é a diferença entre o tempo atual e o proposto, limitada ao consumo mensal.
2. **Água**, em litros/mês: `vazão (L/min) × minutos a menos por banho × pessoas × 30`.
3. **Geração solar**, em kWh/mês: `kWp × horas de sol pico por dia × fator de desempenho × 30 dias`.
4. **Abate possível na conta**: `mínimo(geração, consumo − custo de disponibilidade)`. A conta nunca fica abaixo do mínimo da ligação, então gerar além disso não reduz a fatura. Esta simplificação **não implementa** o Fio B, os créditos acumulados nem a simultaneidade entre geração e consumo.
5. **Valor anual didático**: `energia mensal × R$/kWh × 12`. O valor solar é um teto bruto, pois a [tarifa divulgada pela ANEEL não inclui todos os itens da conta](https://www.gov.br/aneel/pt-br/centrais-de-conteudos/relatorios-e-indicadores/tarifas-e-informacoes-economico-financeiras) e a [microgeração tem regras de compensação](https://www.gov.br/aneel/pt-br/assuntos/geracao-distribuida/).
6. **Retorno simples (payback)**, em anos: `investimento ÷ valor anual solar`. Sem juros, reajustes, manutenção ou Fio B.
7. **CO₂ evitado**, em kg/ano: `kWh/ano × 0,0385 kg/kWh`. Usa o fator **médio** da rede; o MCTI indica fatores de margem para projetos formais, e não incluímos o ciclo de vida dos painéis.

## Exemplo reproduzível (cenário padrão)

| Item | Cálculo | Resultado |
| --- | --- | ---: |
| Conta de referência | 250 kWh × R$ 0,90/kWh | R$ 225,00/mês, só parcela variável hipotética |
| Banho atual | 5,5 kW × 10/60 h × 4 pessoas × 30 dias | 110 kWh/mês (44% do consumo) |
| Banho proposto | 5,5 kW × 8/60 h × 4 pessoas × 30 dias | 88 kWh/mês |
| Redução no banho | 110 − 88 | 22 kWh/mês; 264 kWh/ano |
| Valor da redução | 22 × R$ 0,90 × 12 | R$ 237,60/ano, estimativa bruta |
| Água economizada | 4 L/min × 2 min × 4 × 30 | 960 L/mês; 11.520 L/ano |
| CO₂ evitado (banho) | 264 kWh × 0,0385 | 10,2 kg/ano |
| Geração solar | 2 kWp × 4,5 h/dia × 0,75 × 30 | 202,5 kWh/mês; 2.430 kWh/ano |
| Abate possível | mínimo(202,5; 250 − 50) | 200 kWh/mês |
| Geração sem uso na conta | 202,5 − 200 | 2,5 kWh/mês, sem valor atribuído |
| Valor solar máximo | 200 × R$ 0,90 × 12 | R$ 2.160,00/ano, **teto teórico** |
| Retorno simples | R$ 7.240 ÷ R$ 2.160 | ≈ 3,4 anos, **otimista** |
| CO₂ evitado (solar) | 2.430 kWh × 0,0385 | 93,6 kg/ano |

O custo de referência solar é **R$ 7.240**: o levantamento da Greener de junho de 2025 apresenta R$ 3,62/Wp para um sistema instalado de 2 kWp; `2.000 Wp × R$ 3,62/Wp = R$ 7.240`. É média nacional, sem financiamento, manutenção ou condições do telhado. Como verificação, a mesma pesquisa (p. 62–63) estima retornos entre cerca de 2,6 e 4,5 anos, conforme o estado, para sistemas residenciais de 4 kWp; nosso 3,4 anos fica nessa faixa, mas tende a aumentar com o Fio B.

O cenário anterior usava 200 kWh/mês. Com os mesmos banhos, o chuveiro seria 55% da conta, pouco coerente com uma casa que também tem geladeira, iluminação e outros aparelhos. Ajustamos para 250 kWh (44%), o que também deixa o sistema de 2 kWp dimensionado para o consumo acima do mínimo bifásico (250 − 50 = 200 kWh).

## Comparação e recomendação

Mesmo período de referência: 12 meses, mesma casa.

| Critério | Banhos mais curtos (10 → 8 min) | Solar fotovoltaica (2 kWp) |
| --- | --- | --- |
| Energia por ano | 264 kWh a menos | 2.430 kWh gerados; até 2.400 kWh abatidos |
| Investimento inicial | R$ 0 (sem equipamento) | R$ 7.240 (referência de mercado) |
| Valor bruto por ano | R$ 237,60 | até R$ 2.160,00 |
| Retorno | Imediato | ≈ 3,4 anos (otimista) |
| CO₂ por ano | ≈ 10 kg | ≈ 94 kg |
| Água por ano | ≈ 11.500 L | — |
| Viabilidade | Ação imediata; depende de adesão diária | Requer telhado adequado, projeto, instalação profissional e aprovação da distribuidora |
| Limitações ambientais | Nenhum material novo | Fabricação e descarte dos painéis têm impactos não contabilizados |

**Orientação do assistente:** começar pela medida sem investimento (banhos mais curtos), que também economiza água. Para solar, usar a simulação como ponto de partida: com consumo acima do mínimo da ligação e telhado adequado, o retorno estimado é curto, mas deve ser confirmado com orçamento e estudo do imóvel. As duas ações podem ser combinadas, mas **os benefícios não devem ser somados diretamente**: ao reduzir o consumo, muda a energia solar aproveitável. Como a rede brasileira já é majoritariamente renovável, o ganho de CO₂ das duas opções é pequeno; o benefício principal para a família é financeiro e, no banho, também hídrico.

## Limitações decisivas

- O ano usa 12 meses idênticos e não representa estações, mudanças de tarifa ou hábitos.
- O preço de R$ 0,90/kWh é hipótese, não tarifa vigente; a fatura inclui outros itens.
- A cobrança do Fio B sobre a energia compensada (Lei 14.300) não é calculada e aumenta o retorno real.
- O fator de CO₂ é médio e de 2023; não substitui um inventário ou análise de ciclo de vida.
- O cenário de quatro pessoas e chuveiro de 5.500 W pode não corresponder à residência; a potência varia conforme a posição e o modelo.
- Aquecimento solar de água (coletor térmico) é uma alternativa relevante para o chuveiro, mas não foi calculada neste estudo.
- Nenhuma recomendação é garantia de economia ou autorização para instalar equipamentos.

## Histórico de ajustes

| Data | Ajuste | Motivo |
| --- | --- | --- |
| 19/11/2026 | Consumo padrão de 200 para 250 kWh/mês | O chuveiro representava 55% da conta, valor pouco coerente |
| 19/11/2026 | Custo de disponibilidade, retorno simples, CO₂ e água incluídos no cálculo | Completar a análise de custos, viabilidade e impacto ambiental |
| 19/11/2026 | Assistente passou a responder retorno do investimento, água, CO₂, conceito de kWh e aquecimento solar | Perguntas como "Vale a pena instalar placa solar?" recebiam resposta genérica |
