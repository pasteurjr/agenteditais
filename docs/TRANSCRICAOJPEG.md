# Transcrição Integral — Strategic Bidding Blueprint

**Fonte:** 6 imagens JPEG (srpint31.jpeg a srpint36.jpeg) geradas pelo NotebookLM
**Título original:** "Strategic Bidding Blueprint"
**Data da transcrição:** 05/03/2026

---

## IMAGEM 1 — srpint31.jpeg

Esta imagem contém 3 seções: a capa do blueprint, o objetivo da sprint e o mapa da jornada.

---

### Seção 1.1 — Capa do Blueprint

**Título:** Plataforma de Vendas Governamentais — Blueprint Funcional: Módulo de Precificação e Elaboração de Propostas

**Subtítulo:** "De um Edital Complexo a uma Proposta Vencedora e Auditada."

**Diagrama da Capa — Fluxo Sistêmico Central:**

O diagrama mostra uma arquitetura de processamento de licitações com um fluxo central e módulos de apoio conectados. No centro, há um monitor de computador representando a interface do sistema, rodeado por engrenagens (processamento automatizado). O fluxo funciona assim:

- **Entrada (topo esquerdo):** "Data de/a Vigência" — o período temporal do edital alimenta o sistema.
- **Processamento central:** O "Edital" entra no módulo de "Processamento e Análise", que é o coração do sistema.
- **Saída principal (direita):** "Cálculo de Preço Vencedor" → "Elaboração de Propostas Gerada" — o sistema calcula o preço competitivo e gera a proposta final.
- **Módulos de apoio (abaixo do fluxo central):** Cinco blocos conectados ao processamento:
  1. **Banco de Dados de Licitações** — repositório histórico de editais e preços praticados.
  2. **Análise de Concorrência** — inteligência sobre concorrentes e preços de mercado.
  3. **Verificação de Conformidade** — checagem regulatória (ANVISA, documentos exigidos).
  4. **Ponto Crítico de Auditoria** — validação de compliance antes da submissão.
  5. **Registro de Negociação** — log de todas as decisões de preço e lance.

A mensagem do diagrama é: o sistema não é linear — ele consulta múltiplas fontes de dados em paralelo para produzir uma proposta otimizada, auditada e conforme.

---

### Seção 1.2 — O Objetivo da Sprint

Dois painéis lado a lado comparam o problema atual com a solução proposta:

**Painel esquerdo — "O Desafio":**
Ilustração de uma pessoa trabalhando manualmente em um computador rodeada de engrenagens pesadas e documentos empilhados. Representa o estado atual: precificação manual, alto risco de não conformidade regulatória e tempo excessivo na formatação de propostas. A imagem transmite sobrecarga operacional e processos mecânicos.

**Painel direito — "O Módulo Inteligente":**
Ilustração de um fluxo automatizado com um raio (símbolo de velocidade/inteligência). O diagrama mostra:
- Um bloco "Precificação" (entrada) que alimenta dois outputs simultâneos: "Proposta Técnica" (acima) e "Proposta Comercial" (abaixo).
- Ambas convergem para um selo verde "Validated & Compliant" (Validado e Conforme) com checkmark.

O módulo inteligente deve:
- Estruturar a precificação estratégica por lotes e especialidades (ex: Hematologia, Bioquímica).
- Gerar automaticamente propostas técnicas e comerciais.
- Garantir 100% de aderência às exigências do órgão, validação regulatória e total editabilidade.

A mensagem visual é clara: sair de um processo manual fragmentado para um pipeline automatizado que gera dois documentos validados de uma só vez.

---

### Seção 1.3 — O Mapa da Jornada: Fluxo Macro do Sistema

**Diagrama — Pipeline de 7 etapas sequenciais:**

Uma linha horizontal com 7 ícones 3D conectados por setas verdes de progressão, representando o fluxo completo da licitação. Cada etapa tem um ícone distinto que representa visualmente sua função:

1. **Edital (Input Inicial)** — Ícone de documento com lupa. O edital do órgão público é recebido e analisado como ponto de partida de todo o processo.

2. **Seleção Inteligente (Match de Portfólio)** — Ícone de peças de quebra-cabeça se encaixando. O sistema cruza os itens do edital com o portfólio cadastrado da empresa para encontrar correspondências.

3. **Cálculo Técnico (Volumetria e Custos)** — Ícone de calculadora com engrenagem. Calcula quantidades reais de kits necessários e os custos associados.

4. **Estruturação de Lance (As 6 Camadas)** — Ícone de pirâmide em camadas (verde/azul). O preço é construído em 6 camadas estratégicas empilhadas (A até F), da base de custo até o valor final.

5. **Geração da Proposta (Motor Automático)** — Ícone de documento saindo de uma engrenagem. O motor automático gera a proposta técnica e comercial cruzando precificação e exigências do edital.

6. **Auditoria (ANVISA e Documental)** — Ícone de escudo com checkmark. Validação regulatória (registros ANVISA) e documental (todos os anexos exigidos) antes do envio.

7. **Exportação (Submissão)** — Ícone de pasta com seta de download. O pacote final (PDF, Word, dossiê completo) é exportado pronto para protocolo no portal do órgão.

As setas entre as etapas são verdes indicando progressão positiva. O diagrama comunica que o sistema é um pipeline end-to-end: do edital bruto à submissão final, tudo dentro da plataforma.

---

## IMAGEM 2 — srpint32.jpeg

Esta imagem contém 4 seções: gestão de portfólio, match assistido, cálculo de volumetria e início da base de custos.

---

### Seção 2.1 — Organização por Lotes e Gestão de Portfólio

**Diagrama — Arquitetura de Sincronização de Portfólio:**

O diagrama mostra como os dados dos produtos da empresa são mantidos atualizados no sistema. Há 3 componentes principais conectados por setas:

**Lado esquerdo — Inputs do Item (lista):**
Os dados que alimentam cada produto no portfólio:
- Tipo de amostra
- Volumetria
- Registro ANVISA
- Modelo/Marca
- NCM

Esses dados vêm do cadastro manual do usuário.

**Centro — "Fabricante Links" (ícone de corrente/link):**
Um módulo de integração que se conecta diretamente aos sites dos fabricantes. Abaixo dele, um bloco de automação explica: "Sincronização periódica via links do fabricante (ex: Wiener)". Isso significa que o sistema monitora periodicamente as páginas dos fabricantes para detectar atualizações (novos produtos, mudanças de especificação, novos registros).

**Ação do Sistema (seta entre Fabricante Links e Base de Dados):**
"Identifica alterações → Atualiza automaticamente o upload → Registra LOG." Quando o sistema detecta uma mudança no site do fabricante, ele atualiza o cadastro do produto automaticamente e registra um log de auditoria.

**Lado direito — "Base de Dados Central" (ícone de banco de dados com engrenagem):**
O repositório central onde todos os produtos ficam armazenados com seus dados atualizados.

**Detalhe adicional (canto direito):** "Opcional: Upload de imagens dos produtos para enriquecimento visual." O usuário pode adicionar fotos dos produtos para melhorar as propostas.

**Acima de tudo — bloco de "Automação":**
Destaca que a sincronização é periódica e automática via links do fabricante.

A mensagem do diagrama: o portfólio não é estático — ele se auto-atualiza via integração com fabricantes, com rastreabilidade total de cada mudança.

---

### Seção 2.2 — O Agente Inteligente: Match Assistido

**Diagrama — Correspondência Edital x Portfólio:**

O diagrama mostra visualmente o conceito de "match" entre o que o edital pede e o que a empresa tem. Há 3 elementos principais:

**Lado esquerdo — "Lote do Edital" (ícone de documento com lista):**
Representa os itens que o edital está solicitando. Cada edital é organizado por lotes (ex: Lote 1 — Hematologia, Lote 2 — Bioquímica).

**Centro — Peças de quebra-cabeça se encaixando (ilustração 3D):**
Duas peças de puzzle, uma azul (edital) e uma verde (portfólio), se encaixando perfeitamente. Representa visualmente o conceito de aderência/match: o agente de IA encontra quais produtos do portfólio "encaixam" nos itens do lote.

**Lado direito — "Itens Sugeridos" (ícone de estrela/destaque):**
Os produtos que o agente identificou como aderentes ao lote.

**Funcionalidades descritas:**
- **Análise:** O agente sugere itens do portfólio aderentes ao lote indicado no edital.
- **Destaque Automático:** Indica parâmetros técnicos obrigatórios para a proposta (ex: se o edital exige "faixa de medição de 0-200 mg/dL", o sistema destaca esse parâmetro para conferência).

**Alerta amarelo (parte inferior, com ícone de triângulo de atenção):**
"VALIDAÇÃO HUMANA OBRIGATÓRIA: Todos os itens pré-selecionados pelo agente exigem confirmação do usuário antes de prosseguir."

Isso é um princípio de design fundamental: a IA sugere, mas o humano valida. O sistema não faz match automaticamente sem aprovação — é "assistido", não "autônomo".

---

### Seção 2.3 — A Matemática da Volumetria (Cálculo Técnico)

**Diagrama — Motor de Cálculo de Kits (Engine):**

Este é um diagrama de processamento tipo funil. Mostra como o sistema calcula a quantidade real de kits que a empresa precisa oferecer para atender ao edital. É um cálculo técnico específico da indústria de diagnóstico laboratorial.

**Lado esquerdo — 5 Inputs (entram no Engine via setas):**
1. **Volume exigido no edital** — quantos testes o órgão precisa realizar no período.
2. **Repetições de amostras** — cada amostra pode precisar ser processada mais de uma vez (duplicata, triplicata).
3. **Repetições de calibradores** — calibradores consomem reagente adicional para calibrar o equipamento.
4. **Repetições de controles** — controles de qualidade internos que também consomem reagente.
5. **Rendimento do kit no equipamento** — quantos testes um kit de reagente rende no equipamento específico.

**Centro — Bloco "Engine" com engrenagens:**
O processamento calcula primeiro o "Volume Real Ajustado":

    Volume Real Ajustado = Volume do Edital + Amostras extras + Calibradores + Controles

Esse volume é maior que o do edital porque inclui todo o consumo adicional (controles, calibrações, repetições).

**Lado direito — Output (caixa dourada destacada):**

    Quantidade Final de Kits = Volume Real Ajustado ÷ Rendimento do Kit

**"Sempre arredondado para cima."** — Se der 4,2 kits, a empresa precisa ofertar 5 kits. Isso evita ofertar quantidade insuficiente, o que desclassificaria a proposta.

A mensagem: esse cálculo é crítico porque se a empresa erra a volumetria, perde o edital por oferta insuficiente ou perde margem por excesso. O motor automatiza esse cálculo que antes era feito manualmente em planilhas.

---

### Seção 2.4 — Base de Custos e Inteligência Tributária (início)

**Diagrama — Pipeline de duas fontes convergentes:**

Mostra o início da arquitetura de custos. Aparecem dois "streams" (fluxos) de dados:

**Stream 1: Importação ERP** — Ícone de servidor/data center.
O custo do item é importado automaticamente do sistema ERP da empresa (Preço de compra do fornecedor OU Custo de produção local). Ou seja, o sistema puxa o custo real do produto direto do sistema de gestão.

*(O diagrama é cortado aqui — a continuação completa aparece na imagem 3.)*

---

## IMAGEM 3 — srpint33.jpeg

Esta imagem contém 3 seções: base de custos completa, lógica de precificação em pirâmide (camadas A-C) e guerra de lances (camadas D-E).

---

### Seção 3.1 — Base de Custos e Inteligência Tributária (completa)

**Diagrama — Dois fluxos de dados convergindo para validação humana:**

O diagrama mostra duas fontes de informação (lado esquerdo) que convergem para um ponto de validação (lado direito):

**Stream 1 (topo): Importação ERP** — Ícone de servidor de dados.
- Uma seta horizontal leva ao texto: "Custo do item importado automaticamente (Preço de compra do fornecedor OU Custo de produção local)."
- Representa a integração direta com o ERP da empresa para puxar o custo real.

**Stream 2 (abaixo): Regras Tributárias (NCM)** — Ícone de selo fiscal/TAX.
- "Parametrização por NCM" — cada produto tem um NCM (Nomenclatura Comum do Mercosul) que determina sua tributação.
- **Gatilho Automático:** "Identificação de isenção de ICMS para a NCM 3822 (reagentes)." — O sistema detecta automaticamente que reagentes da NCM 3822 possuem isenção fiscal, ajustando o custo.

**Convergência (lado direito):** Ambos os streams convergem para um bloco verde escuro com checkmark:
"Permite validação e edição humana sobre as alíquotas aplicadas."

A mensagem: o sistema puxa custos e calcula tributos automaticamente, mas o usuário sempre pode revisar e ajustar as alíquotas antes de seguir. Automação com controle humano.

---

### Seção 3.2 — O Alicerce Estratégico: Lógica de Precificação (1/2)

**Diagrama — Pirâmide de 3 Camadas de Preço (A, B, C):**

Este é o diagrama mais importante do blueprint. Mostra uma pirâmide 3D com 3 camadas empilhadas, onde cada camada representa um nível de precificação. A camada A é a maior (base), B é média (meio) e C é a menor (topo). Cada camada tem uma cor distinta (tons de azul/verde escuro) e ícones representativos:

**Camada (A) — Base de Cálculo (base da pirâmide, a mais larga):**
Ícones de ERP + engrenagem fiscal (TAX).
- "Custo do item do ERP + Benefícios fiscais."
- O custo do item será importado automaticamente do ERP, podendo ser Preço de compra do fornecedor ou Custo de produção.
- O sistema deverá ter uma área de cadastro das NCMs que possuem benefícios fiscais, alertando sobre isenção de ICMS.
- Permitir parametrização tributária por item e Flag para reutilização.

Essa é a fundação: quanto o produto realmente custa para a empresa, já considerando benefícios fiscais.

**Camada (B) — Input do Preço Base (camada do meio):**
Ícone de tabela de preços.
- "Preenchimento manual, upload de tabela, ou Custo + Markup."
- Opções: (1) Preenchimento manual; (2) Upload de tabela de preços; (3) Upload de custo + markup.
- Possui flag para indicar se o Preço BASE será reutilizável em outros editais.

Essa camada é o preço de referência que a empresa pratica normalmente — pode vir de uma tabela, ser calculado sobre o custo, ou ser digitado manualmente.

**Camada (C) — Valor de Referência / Alvo (topo da pirâmide):**
Ícone de alvo/target.
- O "Target Estratégico".
- Ter importação automática do próprio edital, se disponível; Caso inexistente, aplicação de percentual sobre tabela de preço BASE para gerar valor-alvo.
- Esse valor funcionará como target estratégico.

Essa é a camada mais refinada: o valor que o órgão público já estimou (valor de referência do edital) ou um percentual estratégico sobre o preço base. É o alvo que a empresa quer atingir na disputa.

A pirâmide comunica visualmente que o preço é construído de baixo para cima: custo real → preço base → valor estratégico. Cada camada adiciona inteligência sobre a anterior.

---

### Seção 3.3 — A Guerra de Lances: Limites e Parametrização (2/2)

**Diagrama — Pirâmide de 2 Camadas adicionais (D, E) + Estratégia Competitiva:**

Este diagrama continua a pirâmide da seção anterior, agora com foco na disputa de lances. A pirâmide aparece novamente, mas agora com as camadas D e E, e ao lado direito dois caminhos estratégicos.

**Camada (D) — Valor Inicial (camada inferior da sub-pirâmide):**
- "Ponto de partida absoluto ou % de desconto sobre a Base. (Obrigatório)."
- É o primeiro lance que a empresa dará na disputa. Pode ser um valor fixo ou um percentual de desconto calculado sobre o preço base.

**Camada (E) — Valor Mínimo (camada superior):**
- "O limite de sangria. Valor mínimo absoluto ou desconto máximo aceitável. (Obrigatório)."
- É o piso: abaixo desse valor a empresa não pode ir, senão opera no prejuízo. O sistema impede lances abaixo desse limite.

**Lado direito — "Estratégia Competitiva" (ícone de escudo com engrenagem):**
Dois caminhos divergem a partir da estratégia, representados por ícones distintos:

- **Opção 1: "Quero ganhar"** — Ícone de checkmark verde. O sistema disputa agressivamente, fazendo lances decrescentes até atingir o limite mínimo (Camada E). É a estratégia para quando a empresa quer vencer a qualquer custo dentro do seu piso.

- **Opção 2: "Não ganhei no mínimo"** — Ícone de moeda/posicionamento. Se mesmo no valor mínimo a empresa não é a primeira colocada, o sistema reposiciona o lance para garantir a melhor colocação possível após o 1o lugar. Ou seja, em vez de dar um lance irracional, o sistema otimiza para ser a 2a ou 3a colocada, mantendo margem para possível chamamento posterior.

A mensagem: a parametrização de lances é uma decisão estratégica pré-configurada — o sistema executa a tática durante a disputa conforme os limites e a estratégia escolhidos pelo usuário.

---

## IMAGEM 4 — srpint34.jpeg

Esta imagem contém 3 seções: inteligência histórica com comodato, motor de geração de propostas e estratégia A/B na descrição técnica.

---

### Seção 4.1 — Inteligência Histórica e Cenário de Comodato

Dois painéis lado a lado:

**Painel esquerdo — Camada (F): Histórico de Preços:**

O diagrama mostra uma tela de dashboard com um gráfico de linha (tipo evolução temporal). O gráfico exibe a evolução dos preços praticados ao longo do tempo, com uma linha principal (preço) oscilando e uma área sombreada (margem).

Acima do gráfico há uma barra de filtros com 6 botões selecionáveis:
- **Todos** — todos os registros
- **Ativos** — apenas editais ativos
- **Preço Gerador** — preço que gerou a venda
- **Margem Aplicada** — a margem de lucro praticada
- **Órgão Público** — filtro por órgão comprador
- **Margem** — visualização da margem

Funcionalidades:
- Exibe preços praticados em editais ganhos anteriormente.
- Filtros por item, por órgão público e visualização da margem aplicada na data.

Essa camada F é consultiva — não entra no cálculo do preço, mas fornece inteligência histórica para o usuário tomar melhores decisões de preço.

**Painel direito — Gestão de Comodato (Roadmap):**

O diagrama mostra uma evolução em duas fases com seta de progressão:

- **Sprint Atual (ícone de pessoa com documento):** O processo de comodato (empréstimo de equipamentos vinculado ao fornecimento de reagentes) é estruturado como manual assistido. O sistema organiza as informações mas o cálculo é feito pelo usuário.

- **Fase Futura (ícone de robô IA com engrenagens):** Desenvolvimento de um Agente de IA específico para automatização completa do cálculo de comodato. Ou seja, num futuro próximo, a IA calculará automaticamente os termos de comodato (valor do equipamento diluído nos reagentes, prazos, amortização).

A seta entre as duas fases indica evolução planejada: hoje manual assistido, amanhã automatizado por IA.

---

### Seção 4.2 — Motor de Geração de Propostas

**Diagrama — Pipeline de geração automática de propostas:**

Este diagrama mostra o fluxo de geração de propostas em 3 estágios visuais, da esquerda para a direita:

**Estágio 1 (esquerda) — Dados de entrada:**
Uma tabela com dados numéricos (preços, quantidades, especificações) representando os dados de precificação calculados nas camadas A-F. Abaixo, um documento representando as exigências do edital.

**Estágio 2 (centro) — Processamento (engrenagens):**
Um conjunto de engrenagens mecânicas representando o "motor" que cruza os dados de precificação com as exigências do edital. Setas verdes grandes em formato de onda levam do estágio 1 ao estágio 3, passando pelas engrenagens.

**Estágio 3 (direita) — Saída: Proposta 100% Editável:**
Um documento gerado com um grande selo verde "100% Editável" com checkmark. Ao lado, ícone de edição (lápis) indicando que o documento pode ser completamente modificado.

**Automação de Layout:**
O sistema gera a proposta técnica e comercial cruzando os dados de precificação com as exigências do edital.

**A Regra de Ouro (alerta com ícone de exclamação amarelo):**
"A proposta gerada é 100% editável antes da submissão. Nada é engessado." Este é um princípio fundamental: a automação gera a proposta, mas o usuário tem total controle para modificar qualquer parte antes de enviar.

**Templates (canto inferior direito, ícone de engrenagem):**
"Ajuste automático de layout conforme exigência do órgão, com suporte a templates pré-parametrizados ou upload externo." O sistema adapta o formato da proposta conforme o que cada órgão exige, e aceita templates customizados.

---

### Seção 4.3 — Estratégia na Descrição Técnica

**Diagrama — Decisão A/B com ramificação e mitigação de risco:**

O diagrama mostra um fluxo de decisão tipo "fork" (bifurcação). No topo, o texto "Para cada item, o usuário possui controle total sobre a narrativa técnica." No centro, um ícone grande "A/B" representa a escolha binária.

**Duas ramificações saem do centro:**

**Opção 1 (seta para a esquerda, ícone de documento com checkmark):**
"Utilizar exatamente o texto técnico exigido no edital (Aderência total)."
Aqui o sistema copia literalmente a descrição técnica do edital para a proposta. É a opção mais segura: se o edital pede "Analisador hematológico com capacidade de 80 parâmetros", a proposta repete exatamente isso.

**Opção 2 (seta para a direita, ícone de escudo com alerta vermelho):**
"Inserir descritivo técnico personalizado do cliente (Estratégico para produtos parcialmente aderentes)."
Aqui o usuário escreve uma descrição técnica própria, diferente do texto do edital. É útil quando o produto não atende 100% ao texto literal mas atende ao requisito funcional. O ícone de escudo com alerta vermelho indica que esta opção tem risco.

**Mitigação de Risco (parte inferior, ícone de cadeado com alerta):**
Uma seta desce da Opção 2 para um bloco de segurança: "Toda inserção de texto próprio gera um LOG detalhado (usuário, data, hora) e a versão original do edital é salva como backup."

A mensagem: o sistema permite customização da descrição técnica, mas protege a empresa criando um registro imutável de quem alterou o quê, quando, e mantendo o texto original como referência. Isso é crucial para auditoria em caso de impugnação.

---

## IMAGEM 5 — srpint35.jpeg

Esta imagem contém 3 seções: compliance ANVISA, auditoria documental com fracionamento e início do escudo de rastreabilidade.

---

### Seção 5.1 — Auditoria de Ferro: Compliance ANVISA

**Texto:** "O módulo impacta diretamente a confiança do cliente e o risco legal da operação."

**Diagrama — Painel de Status Regulatório ANVISA:**

O diagrama mostra um painel escuro (tipo dark-mode) simulando uma tela do sistema. Dentro dele, há 3 linhas de status com semáforo de cores, cada uma representando um estado possível do registro ANVISA de um produto:

- **Verde (bolinha verde):** "Válido (Pronto para uso)" — O registro ANVISA do produto está ativo e dentro da validade. O produto pode ser incluído na proposta sem restrições.

- **Amarelo (bolinha amarela):** "Em Processo (Atenção requerida)" — O registro está em processo de renovação ou análise na ANVISA. O produto pode ser usado, mas exige atenção especial e verificação antes do envio.

- **Vermelho (bolinha vermelha):** "Vencido (Alerta de bloqueio)" — O registro expirou. O sistema bloqueia a inclusão deste produto na proposta, pois usar um registro vencido pode desclassificar a empresa e gerar penalidades legais.

**Ao lado direito do painel, dois blocos explicativos:**

**Mecanismo (ícone de lupa com engrenagem):**
"Consulta à base importada (com roadmap para API externa) garantindo o número do registro e validade." Hoje o sistema consulta uma base de dados interna importada; no futuro, fará consulta direta à API da ANVISA.

**O LOG Regulatório (ícone de documento com cadeado):**
"Registro imutável garantindo que, na data da consulta, o registro possuía aquele status específico." Isso é juridicamente crucial: mesmo que um registro expire depois, o log prova que no momento da consulta ele estava válido.

---

### Seção 5.2 — Auditoria Documental e Fracionamento Inteligente

**Texto:** "O sistema varre as exigências do edital e compila o dossiê."

**Diagrama — Pipeline de compilação documental com fracionamento:**

O diagrama mostra um fluxo da esquerda para a direita em 3 estágios:

**Estágio 1 (esquerda) — Documentos individuais em rotação:**
Quatro documentos são mostrados em perspectiva rotacionada (como cartas de baralho abertas em leque), cada um com uma etiqueta:
- **Registro ANVISA** (topo)
- **Instruções de Uso** (esquerda)
- **Manual Técnico** (abaixo)
- **FISPQ** (inferior) — Ficha de Informação de Segurança de Produtos Químicos

Ao lado, o texto "Checklist Automático" lista esses mesmos 4 documentos: o sistema gera automaticamente uma checklist dos documentos exigidos pelo edital.

**Estágio 2 (centro) — "Dossiê Consolidado":**
Os 4 documentos convergem para um dossiê único (ícone de pasta grossa), representando a compilação de todos os documentos em um pacote organizado.

**Estágio 3 (direita) — PDFs fracionados com indicadores de tamanho (SIZE):**
O dossiê é dividido em múltiplos PDFs menores, cada um com uma etiqueta "SIZE" embaixo. Isso representa o fracionamento inteligente.

**Gestão de Limites (Smart Split) — texto ao lado direito:**
"O sistema verifica os limites de upload do portal do órgão público e fraciona automaticamente os PDFs muito pesados em partes menores."

Muitos portais de licitação (como Comprasnet) têm limite de tamanho por arquivo (ex: 25MB). Se o dossiê completo tem 80MB, o sistema divide automaticamente em partes que cabem no limite de upload.

**Texto final:** "Gera um painel de checklist final para validação humana rápida antes do envio." Antes de enviar, o usuário vê um checklist visual de todos os documentos para conferência rápida.

---

### Seção 5.3 — O Escudo de Rastreabilidade (Global LOGs) — Parte 1

**Texto:** "No ecossistema governamental, a segurança da informação é inegociável. O sistema opera com rastreabilidade absoluta."

**Diagrama — Escudo de segurança com camadas concêntricas:**

A ilustração 3D mostra um escudo preto com um ícone de cadeado no centro, representando segurança máxima. Ao redor do escudo, anéis concêntricos azuis (tipo ondas de sonar) representam as camadas de rastreabilidade que envolvem toda a operação. Orbitando o escudo, há ícones de documento (representando logs) e cifrão (representando alterações financeiras), indicando que tanto alterações documentais quanto financeiras são capturadas.

**Auditoria Contínua — lista de eventos rastreados:**
- Alterações de preços e markups.
- Mudanças em descrições técnicas.
- Sincronizações e atualizações de portfólio.
- Resultados de consultas na base ANVISA.
- Substituições ou uploads de documentos manuais.

A mensagem visual: o escudo protege a empresa de questionamentos legais, pois cada ação no sistema é registrada de forma imutável.

---

## IMAGEM 6 — srpint36.jpeg

Esta imagem contém 3 seções: continuação do escudo de rastreabilidade, exportação do pacote e critérios de aceite.

---

### Seção 6.1 — O Escudo de Rastreabilidade (Global LOGs) — Parte 2

**Diagrama — mesmo escudo da imagem anterior (continuação visual).**

A ilustração é idêntica à seção 5.3: escudo preto com cadeado, anéis concêntricos azuis e ícones orbitantes de documento e cifrão. A seção foi dividida entre as imagens 5 e 6 por questão de espaço.

O texto repete os mesmos pontos de auditoria contínua:
- Alterações de preços e markups.
- Mudanças em descrições técnicas.
- Sincronizações e atualizações de portfólio.
- Resultados de consultas na base ANVISA.
- Substituições ou uploads de documentos manuais.

---

### Seção 6.2 — Exportação e Entrega do Pacote

**Texto:** "Após o fluxo de precisão, o resultado é um pacote pronto para protocolo."

**Diagrama — Dossiê aberto com formatos de exportação:**

A ilustração mostra uma pasta/dossiê aberta (ícone 3D de pasta amarela) com dois documentos saindo dela:

- **Documento PDF (topo direito):** Ícone com rótulo "PDF" em vermelho. Representa a "Proposta engessada para segurança" — o formato PDF garante que o documento não será alterado após a exportação, ideal para protocolo oficial.

- **Documento Word (abaixo):** Ícone com rótulo "W" em azul. Representa a "Proposta 100% livre para ajustes finos" — o formato Word permite edição completa caso o usuário precise fazer ajustes de última hora antes da submissão.

**Formatos disponíveis:**
- Proposta engessada para segurança (PDF).
- Proposta 100% livre para ajustes finos (Word).

**O Dossiê Completo:**
"Geração de um arquivo único ou pacote organizado contendo a proposta assinada, laudos, registros e todos os anexos documentais exigidos, já fracionados para upload."

A mensagem: o sistema entrega tudo pronto — não apenas a proposta, mas o pacote completo com todos os documentos exigidos, já dividido em partes compatíveis com os limites de upload do portal.

---

### Seção 6.3 — Critérios de Aceite da Sprint (Definition of Done)

**Diagrama — Lista de 7 critérios com checkmarks verdes:**

Uma lista vertical com 7 itens, cada um precedido por um ícone de checkmark verde (duplo check, tipo confirmação), representando os critérios que devem ser atendidos para a Sprint ser considerada completa:

1. **Cálculo técnico de kits operar com arredondamento preciso.** — O motor de volumetria (Seção 2.3) deve arredondar sempre para cima, sem erros.

2. **Integração de custo base com ERP estiver funcional.** — A Camada A (Seção 3.2) deve puxar custos do ERP automaticamente.

3. **Parametrização dos lances (Base ao Mínimo) estiver ativa.** — As Camadas D e E (Seção 3.3) devem estar configuráveis com valor inicial e valor mínimo.

4. **O motor gerar a proposta automaticamente com o edital.** — O Motor de Geração (Seção 4.2) deve criar a proposta cruzando dados de precificação com exigências do edital.

5. **O documento gerado for 100% editável e exportável.** — A proposta gerada deve ser editável (Word) e exportável (PDF/Word), conforme Seção 6.2.

6. **A auditoria de registros ANVISA apresentar o status correto.** — O módulo de Compliance (Seção 5.1) deve mostrar os 3 status (verde/amarelo/vermelho) corretamente.

7. **O Escudo de LOG rastrear todas as alterações críticas.** — O sistema de rastreabilidade (Seções 5.3/6.1) deve registrar todas as ações listadas na auditoria contínua.

**Texto:** "A Sprint será oficialmente validada quando:" — seguido dos 7 critérios.

Esses critérios formam a Definition of Done da Sprint, o contrato entre desenvolvimento e produto sobre o que significa "pronto".

---

*Fim da transcrição integral e interpretada dos 6 documentos JPEG do Strategic Bidding Blueprint.*
