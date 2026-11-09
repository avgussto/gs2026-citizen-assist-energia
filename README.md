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

Abra `http://127.0.0.1:4173`. Para conferir os cálculos:

```bash
npm test
```

Não há instalação de pacotes, cadastro, banco de dados ou chave de API.

## Usar o assistente

1. Informe consumo mensal e valor por kWh. Os valores iniciais são **ilustrativos**; não são uma fatura real.
2. Ajuste quantidade de pessoas, potência do chuveiro, tempo de banho e custo de instalação solar.
3. Clique em **Atualizar comparação**. Leia os resultados, as limitações e as respostas às perguntas guiadas.

A comparação usa a mesma casa, o mesmo mês de 30 dias e 12 meses de referência. O consumo evitado por banhos é limitado ao consumo da casa; a geração solar acima do consumo é exibida separadamente e não recebe valor financeiro. O valor anual solar é um **máximo bruto didático**, não uma promessa de economia na fatura.

## Análise e evidências

- [Dados e premissas](data/premissas.json): valores padrão, origem e condição de uso.
- [Memória de cálculo e comparação](docs/analise.md): fórmulas, exemplo reproduzível, custos, viabilidade, impactos e fontes.
- [Testes com usuários](docs/testes-usuarios.md): tarefas e formulário para registrar testes reais e ajustes. **Pendente de aplicação pelo grupo**; nenhum depoimento foi inventado.
- [Roteiro do vídeo](docs/roteiro-video.md): demonstração técnica de até 3 minutos.

## Limitações

Não calcula a fatura completa, tributos, bandeiras tarifárias, parcelas de uso da rede, compensação de créditos, manutenção, financiamento ou variação sazonal. A irradiação e o custo solar de referência devem ser substituídos por dados do local e por orçamento profissional antes de uma decisão de compra. A aplicação não dimensiona nem aprova instalações elétricas.

Prazo informado para a entrega: **19/11/2026**. O arquivo `.txt` exigido pelo enunciado será criado quando os links do repositório e do vídeo não listado estiverem disponíveis.
