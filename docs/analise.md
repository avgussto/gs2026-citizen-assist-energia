# Memória de cálculo — energia residencial

## Problema e recorte

Público: famílias que precisam entender a conta de luz e avaliar opções de economia ou fornecimento renovável. Local de referência: São Paulo, SP. Comparamos **a mesma necessidade de eletricidade da casa** durante um mês de 30 dias e, para valores anuais, 12 meses iguais. O cenário padrão de 200 kWh/mês é uma hipótese pedagógica, não a média oficial de São Paulo. A [EPE publica o consumo médio por região e unidade federativa](https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/anuario-estatistico-de-energia-eletrica); a família deve substituir o valor padrão pelo consumo da sua conta.

Dados e hipóteses auditáveis estão em [`data/premissas.json`](../data/premissas.json). Consulta das fontes: **09/11/2026**.

## Fórmulas e unidades

1. Consumo do chuveiro por mês, em kWh: `(potência em W ÷ 1000) × (minutos por banho ÷ 60) × pessoas × 30 dias`. Um banho por pessoa por dia é uma hipótese do cenário. A economia é a diferença entre o tempo atual e o proposto, limitada ao consumo mensal informado.
2. Geração solar por mês, em kWh: `potência em kWp × horas de sol pico por dia × fator de desempenho × 30 dias`. As 4,5 horas de sol pico são uma **hipótese arredondada** para exercício, a conferir por coordenada e inclinação no [SunData do CRESESB](https://www.cresesb.cepel.br/?section=sundata). O fator 0,75 representa perdas agregadas de 25% e acompanha a premissa de PR 75% usada no [estudo Greener 2025](https://canalsolar.com.br/wp-content/uploads/2025/09/link.pdf). Nenhum desses valores representa medição do imóvel.
3. Energia solar considerada para valor financeiro: `mínimo(geração, consumo mensal)`. O excedente é mostrado, sem valor monetário. Esta simplificação **não implementa** as regras reais de compensação.
4. Valor anual didático: `energia mensal × R$/kWh × 12`. O valor solar é um teto bruto, pois a [tarifa divulgada pela ANEEL não inclui todos os itens da conta](https://www.gov.br/aneel/pt-br/centrais-de-conteudos/relatorios-e-indicadores/tarifas-e-informacoes-economico-financeiras) e a [microgeração tem regras de compensação e custo de disponibilidade](https://www.gov.br/aneel/pt-br/assuntos/geracao-distribuida/).

## Exemplo reproduzível

| Item | Cálculo | Resultado |
| --- | --- | ---: |
| Conta de referência | 200 kWh × R$ 0,90/kWh | R$ 180,00/mês, somente parcela variável hipotética |
| Banho atual | 5,5 kW × 10/60 h × 4 pessoas × 30 dias | 110 kWh/mês |
| Banho proposto | 5,5 kW × 8/60 h × 4 pessoas × 30 dias | 88 kWh/mês |
| Redução no banho | 110 − 88 | 22 kWh/mês; 264 kWh/ano |
| Valor da redução | 22 × R$ 0,90 × 12 | R$ 237,60/ano, estimativa bruta |
| Geração solar | 2 kWp × 4,5 h/dia × 0,75 × 30 | 202,5 kWh/mês; 2.430 kWh/ano |
| Energia solar considerada | mínimo(202,5; 200) | 200 kWh/mês |
| Excedente | 202,5 − 200 | 2,5 kWh/mês, sem valor atribuído |
| Valor solar máximo | 200 × R$ 0,90 × 12 | R$ 2.160,00/ano, **teto teórico** |

O custo de referência solar é **R$ 7.240**: o [levantamento da Greener de junho de 2025](https://canalsolar.com.br/wp-content/uploads/2025/09/link.pdf) apresenta R$ 3,62/Wp para um sistema instalado de 2 kWp; `2.000 Wp × R$ 3,62/Wp = R$ 7.240`. É média nacional histórica, sem financiamento, manutenção ou condições específicas do telhado. O usuário pode informar um orçamento diferente no aplicativo. O custo inicial da redução do tempo de banho é R$ 0 **sem aquisição de equipamento**.

## Comparação e recomendação

| Critério | Banhos mais curtos | Solar fotovoltaica |
| --- | --- | --- |
| Energia | Evita consumo do chuveiro; depende de adesão diária | Gera eletricidade renovável; depende de sol, orientação e perdas |
| Custo | Sem investimento inicial no cenário | R$ 7.240 como referência de mercado, não orçamento |
| Viabilidade | Ação imediata, desde que o tempo e a potência correspondam ao uso real | Requer telhado adequado, projeto, instalação profissional e análise de conexão à rede |
| Meio ambiente | Menor demanda por eletricidade; pode reduzir água, mas não quantificamos litros sem vazão medida | Fonte renovável durante operação; fabricação e descarte dos componentes também têm impactos |

**Orientação do assistente:** começar por medir o consumo e experimentar a ação sem investimento. Para solar, usar a simulação como ponto de partida e solicitar orçamento e estudo do imóvel. As duas ações podem ser combinadas, mas **os benefícios não devem ser somados diretamente**: ao reduzir o consumo, muda a energia solar aproveitável para a mesma casa. Não estimamos CO₂ evitado porque o fator adequado e os impactos do ciclo de vida exigem análise específica; o [MCTI publica fatores de emissão e explica suas finalidades](https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/sirene/dados-e-ferramentas/fatores-de-emissao).

## Limitações decisivas

- O ano usa 12 meses idênticos e não representa estações, mudanças de tarifa ou hábitos.
- O preço de R$ 0,90/kWh é hipótese, não tarifa vigente; a fatura inclui outros itens.
- A geração solar não é integralmente convertida em desconto. As regras de compensação, custo de disponibilidade e tributos exigem a conta e a distribuidora reais.
- O cenário de quatro pessoas e chuveiro de 5.500 W pode não corresponder à residência; a potência pode variar conforme a posição e o modelo.
- Nenhuma recomendação é garantia de economia ou autorização para instalar equipamentos.
