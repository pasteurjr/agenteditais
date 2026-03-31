# Revisao de Requisitos — Sprint 3: Modulo de Precificacao e Elaboracao de Propostas

**Plataforma de Vendas Governamentais — facilicita.ia**
**Data de consolidacao:** 05/03/2026
**Fontes:** Blueprint Funcional (6 imagens), Documento Tecnico Funcional Revisado (PDF 14p), Anotacoes de Reuniao (PDF 4p)

---

## 1. OBJETIVO DA SPRINT

Desenvolver o modulo responsavel por:

1. **Estruturar a precificacao tecnica e estrategica por lotes e especialidades** (ex.: Hematologia, Bioquimica), considerando regras tecnicas e economicas do edital.
2. **Gerar automaticamente a proposta tecnica e comercial**, totalmente editavel, aderente as exigencias do orgao publico e com validacao regulatoria.
3. **Implementar mecanismos de auditoria regulatoria e documental.**
4. **Garantir rastreabilidade (LOG) e validacao humana em pontos criticos.**

### Fluxo Macro do Sistema

```
Edital (Input Inicial)
  -> Selecao Inteligente (Match de Portfolio)
    -> Calculo Tecnico (Volumetria e Custos)
      -> Estruturacao de Lance (As 6 Camadas)
        -> Geracao da Proposta (Motor Automatico)
          -> Auditoria (ANVISA e Documental)
            -> Exportacao (Submissao)
```

### O Desafio

Precificacao manual, alto risco de nao conformidade regulatoria e tempo excessivo na formatacao de propostas.

### O Modulo Inteligente

- Estruturar a precificacao estrategica por lotes e especialidades (ex.: Hematologia, Bioquimica).
- Gerar automaticamente propostas tecnicas e comerciais.
- Garantir 100% de aderencia as exigencias do orgao, validacao regulatoria e total editabilidade.

---

## 2. ESCOPO FUNCIONAL

O modulo sera dividido em dois grandes blocos:

- **Bloco A — Precificacao**
- **Bloco B — Geracao e Auditoria de Proposta**

---

# BLOCO A — PRECIFICACAO

---

## 3. ESTRUTURA DE PARTICIPACAO

### 3.1 Participacao por Lotes

- Editais organizados por especialidade (ex.: Hematologia, Bioquimica etc.).
- Cada lote contem parametros tecnicos que devem ser atendidos.

**Requisito Funcional:**
O sistema deve permitir:
- Cadastro de lotes por edital;
- Associacao de parametros a cada lote;
- Associacao de multiplos itens do portfolio a um lote.

---

## 4. CALCULO TECNICO DE VOLUMETRIA

Para cada item participante:

### Inputs obrigatorios:

- Rendimento do kit no equipamento;
- Numero de repeticoes de amostras;
- Numero de repeticoes de calibradores;
- Numero de repeticoes de controles;
- Volume de testes exigido no edital por parametro.

### Regra de Negocio:

```
Volume real ajustado =
  Volume edital + repeticoes amostras + repeticoes calibradores + repeticoes controles

Quantidade de kits =
  Volume real ajustado / rendimento por kit

Arredondamento SEMPRE para cima.
```

---

## 5. BASE DE CUSTOS

### 5.1 Integracao com ERP (Stream 1: Importacao ERP)

O sistema deve importar o custo unitario do kit:
- Preco de compra do fornecedor; ou
- Custo de producao (caso o cliente seja fabricante).

Permite validacao e edicao humana sobre as aliquotas aplicadas.

### 5.2 Regras Tributarias (Stream 2: Regras Tributarias por NCM)

- Parametrizacao por NCM;
- **Gatilho Automatico:** Identificacao de isencao de ICMS para NCM 3822 (reagentes);
- Campo editavel para validacao humana.

---

## 6. GESTAO DO PORTFOLIO

### 6.1 Cadastro de Itens

Cada item deve conter:
- Tipo de amostra
- Volumetria
- Numero de registro Anvisa
- Modelo
- Marca
- Fabricante
- Procedencia
- NCM
- Fotos (opcional) — para enriquecimento visual da proposta

### 6.2 Atualizacao Automatica

Caso importado de link do fabricante (ex.: modelo Wiener):
- Registrar data da ultima atualizacao;
- Rotina agendada para verificacao periodica (frequencia parametrizavel);
- Se houver alteracao, atualizar automaticamente o upload;
- Registrar LOG da atualizacao.

**Acao do Sistema:** Identifica alteracoes -> Atualiza automaticamente o upload -> Registra LOG.

### 6.3 Selecao Inteligente (Agente Assistido — Match Assistido)

O sistema devera:
- **Analise:** O agente sugere itens do portfolio aderentes ao lote indicado no edital;
- **Destaque Automatico:** Indica parametros tecnicos obrigatorios para a proposta;
- Exigir **validacao humana obrigatoria** antes de confirmar selecao.

> **VALIDACAO HUMANA OBRIGATORIA:** Todos os itens pre-selecionados pelo agente exigem confirmacao do usuario antes de prosseguir.

---

## 7. LOGICA ESTRATEGICA DE PRECIFICACAO

O sistema devera estruturar a precificacao em seis camadas (A) a (F):

### Camada (A) — Base de Calculo

**Calculo do Preco BASE de cada item a partir do Custo do item.**

O custo do item sera importado automaticamente do ERP, podendo ser Preco de compra do fornecedor ou Custo de producao. O sistema devera ter uma area de **cadastro das NCMs que possuem beneficios fiscais**, alertando sobre os produtos do lote que terao **isencao de ICMS** pelo fato de suas NCMs estarem na lista de beneficios fiscais.

- Permitir parametrizacao tributaria por item;
- Flag para indicar se o Preco BASE sera reutilizavel em outros editais.

### Camada (B) — Input do Preco Base

Opcoes:
1. Preenchimento manual;
2. Upload de tabela de precos;
3. Upload de custo + markup.

Flag para indicar se o Preco BASE sera reutilizavel em outros editais.

### Camada (C) — Valor de Referencia do Edital (Alvo / Target Estrategico)

Alguns editais trazem o preco referencia de cada item dos lotes de participacao.

- Ter importacao automatica do proprio edital, se disponivel;
- Caso inexistente, aplicacao de percentual sobre tabela de preco BASE para gerar valor-alvo.

Esse valor funcionara como **target estrategico**.

### Camada (D) — Valor Inicial do Lance

Campo **obrigatorio**. E o valor a partir do qual serao iniciados os lances do leilao.

Pode ser:
- Input individual do Preco de cada item (valor absoluto); ou
- Percentual de desconto sobre tabela de preco BASE.

### Camada (E) — Valor Minimo do Lance

Campo **obrigatorio**. O limite de sangria — valor minimo que cada item podera alcancar ao longo dos lances do leilao (desconto maximo aceitavel).

Pode ser:
- Input manual do preco minimo de cada item (valor absoluto); ou
- Desconto maximo aceitavel sobre tabela de preco BASE dos itens.

### Camada (F) — Historico de Precos

O sistema devera apresentar como referencia:
- Precos praticados em editais anteriormente ganhos para os lotes em questao;
- Historico por item e por orgao publico;
- Visualizacao da margem aplicada na data;
- Filtros por item, por orgao publico e por data.

Isso permitira decisoes de definicao dos precos target mais embasadas.

### 7.4 Estrategia Competitiva

Configuracao do usuario para parametrizacao da logica estrategica de lances:

- **Opcao 1: "Quero ganhar"** -> O sistema disputa agressivamente ate atingir o limite minimo;
- **Opcao 2: "Nao ganhei no minimo"** -> O sistema reposiciona o lance para garantir a melhor colocacao possivel apos o 1o lugar.

O sistema deve:
- Bloquear lance abaixo do minimo;
- Permitir simulacao de cenarios.

### 7.6 Comodato

**Sprint Atual (Fase 1):**
- Processo manual assistido. A rotina de precificacao de comodato e manual.

**Fase Futura:**
- Desenvolvimento de um **agente de IA especifico** para automatizacao completa do calculo de comodato. Esse agente sera um instrumento para automatizar todo o setor.

---

# BLOCO B — GERACAO E AUDITORIA DA PROPOSTA

---

## 8. GERACAO AUTOMATICA DA PROPOSTA (Motor de Geracao)

### 8.1 Motor de Geracao

O sistema devera:
- Gerar proposta tecnica e comercial automaticamente, cruzando os dados de precificacao com as exigencias do edital;
- Ajustar automaticamente o layout conforme modelo exigido no edital, com suporte a templates pre-parametrizados ou upload externo;
- Permitir parametrizacao previa de layouts/templates.

> **A Regra de Ouro:** A proposta gerada e **100% editavel** antes da submissao. Nada e engessado.

### 8.2 Editabilidade

A proposta gerada deve:
- Ser 100% editavel antes da exportacao;
- Registrar LOG de todas as alteracoes.

---

## 9. ALTERNATIVAS DE ENTRADA

O sistema deve permitir:
1. **Geracao automatica** da Proposta, como descrito acima;
2. **Upload de proposta** previamente elaborada externamente;
3. (Avaliar) Upload de template padrao da empresa como layout base.

**Nota sobre ERP:** A Argus usa o modulo de proposta do Supra (ERP) para elaborar as propostas, para cada empenho recebido, pois ja busca os custos, tabelas de precos etc. que foram cadastrados para aqueles itens, diretamente do sistema. Avaliar esse modulo do ERP da Argus para elaborar o modulo de proposta do nosso sistema.

---

## 10. AUDITORIA REGULATORIA — ANVISA (Compliance)

O modulo impacta diretamente a confianca do cliente e o risco legal da operacao.

### 10.1 Validacao de Registro

Para cada item, verificar validade do registro e indicar status:
- **Verde — Valido (Pronto para uso)**
- **Amarelo — Em Processo (Atencao requerida)**
- **Vermelho — Vencido (Alerta de bloqueio)**

**Mecanismo:** Consulta a base importada (com roadmap para API externa) garantindo o numero do registro e validade.

**O LOG Regulatorio:** Registro imutavel garantindo que, na data da consulta, o registro possuia aquele status especifico.

### 10.2 Base de Consulta

**Fase inicial:**
- Consulta a base importada no sistema;
- Na area de cadastro do portfolio, podera haver um campo opcional para cadastro do link oficial do website da Anvisa remetendo ao registro do item (produto).

**Fase futura:**
- Consulta externa (mediante autorizacao do cliente) diretamente no website da ANVISA para verificar numeros de registros associados a cada item e suas respectivas validades.

> Esse modulo precisa ter **alta confiabilidade**, pois impacta diretamente a confianca do cliente.

### 10.3 LOG de Auditoria

O sistema deve registrar:
- Data da consulta;
- Fonte da informacao;
- Resultado da validacao.

---

## 11. AUDITORIA DOCUMENTAL DO EDITAL (Fracionamento Inteligente)

O sistema varre as exigencias do edital e compila o dossie:

1. **Identificar documentos exigidos:**
   - Instrucoes de Uso
   - Registro Anvisa
   - Manual Tecnico
   - FISPQ
   - Outros

2. Validar upload de todos os documentos;
3. Verificar limites de tamanho de arquivo permitidos pelo portal do orgao publico;
4. **Fracionar automaticamente** arquivos que ultrapassem o limite (Smart Split — PDFs muito pesados em partes menores);
5. Selecionar automaticamente os arquivos de cada documentacao e acomoda-los em uma pasta;
6. Gerar **checklist** dos documentos selecionados para consulta e **validacao humana rapida** antes do envio;
7. Permitir a exportacao automatica para submissao completa da proposta e seus anexos ao orgao.

---

## 12. DESCRICAO TECNICA DO PRODUTO (Estrategia A/B)

Para cada item, o usuario possui controle total sobre a narrativa tecnica:

**Opcoes:**
1. **Opcao A:** Utilizar exatamente o texto tecnico exigido no edital para descrever tecnicamente o produto (Aderencia total);
2. **Opcao B:** Inserir descritivo tecnico personalizado do cliente para cada produto (Estrategico para produtos parcialmente aderentes).

**Se texto proprio (Opcao B):**
- Registrar LOG da alteracao (atrelando o nome do usuario que alterou, data e hora);
- Destacar que houve alteracao;
- Manter versao original salva como backup.

**Mitigacao de Risco:** Toda insercao de texto proprio gera um LOG detalhado (usuario, data, hora) e a versao original do edital e salva como backup.

> **Nota estrategica:** Esse ponto e importante, pois ha empresas que querem participar de edital mesmo com um item que nao seja 100% aderente a proposta. Esse e um dos fatores que justifica o uso do nosso layout, pois haverao areas para colarmos os descritivos do equipamento, em linha com o colocado nas paginas do manual do fabricante.

---

## 13. EXPORTACAO E FINALIZACAO (Entrega do Pacote)

Apos o fluxo de precificacao, o resultado e um pacote pronto para protocolo.

**Formatos:**
- Proposta engessada para seguranca (PDF);
- Proposta 100% livre para ajustes finos (Word/DOCX).

**O Dossie Completo:**
- Geracao de um arquivo unico ou pacote organizado contendo a proposta assinada, laudos, registros e todos os anexos documentais exigidos, ja fracionados para upload.

---

## 14. CONTROLE DE LOG E RASTREABILIDADE (Escudo de Rastreabilidade — Global LOGs)

No ecossistema governamental, a seguranca da informacao e inegociavel. O sistema opera com rastreabilidade absoluta.

**Auditoria Continua — O sistema deve registrar:**
- Alteracoes de precos e markups;
- Mudancas em descricoes tecnicas;
- Sincronizacoes e atualizacoes de portfolio;
- Resultados de consultas na base ANVISA;
- Substituicoes ou uploads de documentos manuais.

---

## 15. CRITERIOS DE ACEITE DA SPRINT (Definition of Done)

A Sprint sera considerada oficialmente validada quando:

- [ ] Calculo tecnico de kits operar com arredondamento preciso
- [ ] Integracao de custo base com ERP estiver funcional
- [ ] Parametrizacao dos lances (Base ao Minimo) estiver ativa
- [ ] O motor gerar a proposta automaticamente com o edital
- [ ] O documento gerado for 100% editavel e exportavel
- [ ] A auditoria de registros ANVISA apresentar o status correto
- [ ] O Escudo de LOG rastrear todas as alteracoes criticas

---

# ANOTACOES DA REUNIAO

As notas abaixo foram coletadas durante reuniao de alinhamento e complementam os requisitos acima com o contexto de negocio da operacao real.

---

## Precificacao — Notas de Reuniao

A participacao e em lotes por especialidades: Hemato, Bioquimica, etc.

Para cada item do lote:
- **Equipamento** — identificar o equipamento associado
- **Rendimento do Kit no equipamento** — quantos testes o kit rende naquele equipamento
- **Repeticoes para passar as amostras** — quantas vezes a amostra precisa ser processada
- **Repeticao para passar os calibradores e os controles** — repetições adicionais

As repeticoes readequam os volumes de testes, para cada parametro, passado pelo edital. A partir disso, calcula-se a quantidade de kits necessarios.

**Custo do Kit:** E importado do ERP (preco de compra do fornecedor ou custo de producao, se for fabricante).

**Atencao tributaria:** Ficar atento a isencao do ICMS para os NCMs 3822.

**Comodatos:** A rotina de precificacao de comodato e manual. Mas podemos criar um agente de IA para plugar no sistema. Esse agente se torna instrumento para automatizar todo o setor.

### Logica de Precificacao (Reuniao)

- O edital gera valor de referencia de preco para cada parametro. Esse pode ser o target.
- O nosso sistema pode pedir o preco Maximo e preco Minimo para cada item, alem do preco de referencia.
- Essa passa a ser a tabela que o nosso sistema utilizara. Pode ser uma referencia para upload no nosso sistema.
- Devo informar ao sistema se eu quero ganhar. Caso eu nao ganhe com os precos praticados (porque, antes de chegar no meu minimo, o concorrente ultrapassou o nosso minimo), eu posso dar um comando ao sistema que quero ganhar a melhor posicao possivel depois do 1o lugar.

### Portfolio e Selecao Inteligente (Reuniao)

- O nosso sistema tera um agente que selecionara os itens do portfolio que farao parte do lote que se deseja concorrer. Esses itens serao extraidos do nosso portfolio, cadastrado no sistema. Esses itens serao validados por um humano.
- O portfolio, a exemplo da Wiener, pode ser importado dos links disponibilizados pelo fabricante. Nesse link, ha a data da ultima modificacao do conteudo. Nosso sistema pode, a cada periodo de tempo (parametrizavel), consultar estas datas. Se houver mudanca, ele atualiza o upload automaticamente.
- O nosso sistema tera um agente que indique os parametros do item (tipo de amostra, volumetria, nr registro anvisa, modelo, marca, fabricantes, procedencia, etc.) que deverao estar evidenciados na proposta. Esses itens serao validados por um humano.
- Pensar na opcao de cadastrar as fotos dos itens no portfolio de produtos, para melhor ilustracao do item na proposta.

### Inputs de Precificacao por Item (Reuniao)

Para cada um dos itens que participarao do edital:

**INPUT DO PRECO (indicar se sera reutilizavel ou nao):**
1. Preencher manual (mandatorio 1 ou 2), ou Upload da tabela de preco (mandatorio 2 ou 1)
2. Upload da tabela de custo mais markup (mandatorio 1 ou 2)

**INPUT DO VALOR DE REFERENCIA DO EDITAL:**
3. Valor de referencia do edital — Importa diretamente do edital (mandatorio) se tiver disponibilizado no edital
4. Se nao houver valor de referencia, aplica-se um percentual sobre a tabela de preco para o valor desejado

**VALOR INICIAL DO LANCE:**
5. Valor inicial do lance (Mandatorio), que sera o preco inicial dos lances e que pode ser um desconto sobre a tabela de preco

**VALOR MINIMO DO LANCE:**
6. Valor Minimo do Lance (Mandatorio), que pode ser preenchido por campo de desconto sobre a tabela de preco

**INPUT DOS PRECOS PASSADOS QUE DARAO REFERENCIA SOBRE OS LANCES:**
7. O sistema trara, como referencia de outros editais ganhos, os precos dos itens com base nos editais ganhos no passado

---

## Proposta — Notas de Reuniao

O sistema dara as seguintes opcoes. Ponto importante e que a proposta e gerada automaticamente, mas a mesma devera ser **100% editavel**.

1. **Gera a proposta a partir dos dados imputados.** Para isso havera uma area de parametrizacao do layout da proposta **(essa parametrizacao ja esta contida em todos os editais; dessa forma, nosso sistema deveria ajustar o layout a este modelo indicado no edital).** Podemos permitir que o sistema faca o upload da proposta da propria empresa. (Pensar sobre essa funcionalidade.) A Argus usa o modulo de proposta do Supra (ERP) para elaborar as propostas. Avaliar esse modulo do ERP da Argus para elaborar o modulo de proposta do nosso sistema. A proposta gerada sera passivel de ser editada e modificada manualmente os itens desejados.

2. **Fazer o upload de uma proposta ja pronta**, com todos os dados e conteudo ja imputados e elaborados externamente (anteriormente) pelo usuario.

3. **Devera haver uma auditoria** sobre o quanto os registros da Anvisa estao validos para os itens que farao parte da proposta **(modulo de auditoria)**.

4. **O nosso sistema devera identificar, no edital, a relacao de toda a documentacao** exigida pelo orgao, relativo ao portfolio, ex: Instrucoes de Uso, Registros da Anvisa, Manuais Tecnicos, Fichas FISPQ, etc. Devera ainda, verificar os tamanhos maximos dos arquivos, para serem transferidos, e adequar o fracionamento dos documentos, adequando-se aos limites dos arquivos. Para a relacao dos documentos, devera haver um comando para validacao pelo humano. Quanto ao Registro, devera haver um **modulo de auditoria (com geracao de um LOG da validacao das consultas)**, para verificar no website da anvisa, o quanto o registro realmente esta valido ou o quanto ha um processo em curso, etc. Temos que ter certeza que essa funcao trabalha bem, com poucos erros, para que o cliente tenha confianca. Para tal, a nossa ferramenta devera fazer a consulta nos bancos de dados que foram importados para o nosso sistema. Pensar no formato de consultas externas, o quanto estas deveriam ser autorizadas pelo cliente ou nao. Verificar se vale, na area de cadastro, colocar o link do caminho do registro da Anvisa, quando este for o caso.

5. **Na parte da Descricao tecnica do produto** (cujo texto esta descrito no edital), a proposta devera dar a opcao do cliente acatar o texto do edital ou utilizar um texto cujo proprio cliente queira colocar. Optando por utilizar o descritivo do cliente, ficara o LOG desse registro para que estejamos precavidos. Isso e muito importante, pois tem empresas que querem participar de edital, mesmo com um item que nao seja 100% aderente a esta proposta. Esse e um dos fatores que justifica o uso de nosso layout, pois haverao areas para colarmos os descritivos do equipamento, em linha com o colocado nas paginas do manual do fabricante.

**Nota futura:** Pensar depois nas leituras dos empenhos / pedidos para o monitoramento dos pedidos e registros.

---

## RESULTADO ESPERADO DA SPRINT

Ao final, o modulo devera permitir:

- Selecao inteligente de itens por lote
- Calculo tecnico-economico completo
- Estruturacao estrategica de lances
- Geracao automatica de proposta aderente ao edital
- Auditoria regulatoria e documental
- Total editabilidade com rastreabilidade

---

*Documento consolidado em 05/03/2026 a partir de: 6 imagens do Blueprint Funcional (srpint31-36.jpeg), PDF "SPRINT PRECO e PROPOSTA - REVISADA" (14 paginas) e PDF "SPRINT PRECO e PROPOSTA - ANOTACOES REUNIAO" (4 paginas).*
