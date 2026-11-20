# Citizen Assist AI — energia em casa

Assistente digital introdutório para famílias que querem entender o consumo de eletricidade. A contribuição de **Soluções em Energias Renováveis e Sustentáveis** compara duas ações para a mesma conta residencial: reduzir o tempo de banho com chuveiro elétrico e instalar geração solar fotovoltaica. As respostas são guiadas por cálculos transparentes; não há IA generativa nem envio de dados a um servidor.

## Integrantes

| Integrante | RM |
| --- | --- |
| Sergio Augusto | 570184 |
| Giovanni Merlotti | 573721 |
| Gabriel Freitas | 572943 |

## Executar

Requer Node.js 20 ou superior. No terminal, dentro desta pasta:

```bash
npm start
```

Abra `http://127.0.0.1:4173`. Também é possível abrir `index.html` diretamente para uma demonstração rápida; nesse modo, a página usa os valores iniciais do próprio HTML e as premissas fixas descritas em `data/premissas.json`. Para conferir os cálculos:

```bash
npm test
```

Não há instalação de pacotes, cadastro, banco de dados ou chave de API.

## Usar o assistente

1. Informe consumo mensal e valor por kWh. Os valores iniciais são **ilustrativos**; não são uma fatura real.
2. Ajuste o tipo de ligação, quantidade de pessoas, potência e vazão do chuveiro, tempo de banho e custo de instalação solar.
3. Clique em **Atualizar comparação**. Leia os resultados e as limitações.
4. Use o botão flutuante **Perguntar** ou **Abrir conversa** para escolher uma pergunta sugerida ou digitar a sua. O assistente responde sobre os temas estudados e mostra as fontes. Se não reconhecer a pergunta, informa seu limite. Ao atualizar a simulação, a conversa é reiniciada para não manter números antigos.

A comparação usa a mesma casa, o mesmo mês de 30 dias e 12 meses de referência, e mostra para cada opção: energia, valor anual, investimento, retorno simples, CO₂ evitado (fator médio da rede, MCTI) e, no banho, água economizada. A geração solar só abate o consumo acima do custo de disponibilidade da ligação (30, 50 ou 100 kWh, REN ANEEL 1.000/2021); o restante é exibido sem valor financeiro. O valor anual solar é um **máximo bruto didático**, não uma promessa de economia na fatura.

| Cenário padrão (12 meses) | Banhos 10 → 8 min | Solar 2 kWp |
| --- | ---: | ---: |
| Energia | 264 kWh evitados | 2.430 kWh gerados |
| Valor bruto | R$ 237,60 | até R$ 2.160,00 |
| Investimento | R$ 0 | R$ 7.240 |
| Retorno simples | imediato | ≈ 3,4 anos |
| CO₂ evitado | ≈ 10 kg | ≈ 94 kg |
| Água | ≈ 11.500 L | — |

**Recomendação:** começar pelos banhos mais curtos (sem custo, economiza energia e água) e avaliar solar com orçamento e estudo do imóvel.

## Análise e evidências

- [Dados e premissas](data/premissas.json): valores padrão, origem e condição de uso.
- [Memória de cálculo e comparação](docs/analise.md): fórmulas, exemplo reproduzível, custos, viabilidade, impactos e fontes.
- [Testes com usuários](docs/testes-usuarios.md): tarefas e formulário para registrar testes reais e ajustes. **Pendente de aplicação pelo grupo**; nenhum depoimento foi inventado.
- [Roteiro do vídeo](docs/roteiro-video.md): demonstração técnica de até 3 minutos.

## Limitações

Não calcula a fatura completa, tributos, bandeiras tarifárias, a cobrança do Fio B (Lei 14.300), créditos acumulados, manutenção, financiamento ou variação sazonal. O fator de CO₂ é médio e não inclui o ciclo de vida dos painéis. A irradiação e o custo solar de referência devem ser substituídos por dados do local e por orçamento profissional antes de uma decisão de compra. A aplicação não dimensiona nem aprova instalações elétricas.

## Vídeo de apresentação

[Global Solutions - SERS](https://youtu.be/kYq6kptzg-A) (YouTube, não listado, 2:10): demonstração técnica seguindo o [roteiro](docs/roteiro-video.md).

O vídeo foi gravado antes da revisão de 19/11/2026, com consumo inicial de 200 kWh/mês. Os valores demonstrados (44 kWh/mês a menos com banhos de 6 minutos e 202,5 kWh/mês de geração) continuam iguais; a revisão alterou o consumo padrão para 250 kWh e acrescentou custo de disponibilidade, retorno simples, CO₂ e água. Veja o histórico em [docs/analise.md](docs/analise.md#histórico-de-ajustes).
