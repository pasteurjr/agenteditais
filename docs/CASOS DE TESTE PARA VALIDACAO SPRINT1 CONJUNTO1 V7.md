# CASOS DE TESTE PARA VALIDACAO — Sprint 1 — Conjunto 1 — **V7**

**Data:** 2026-04-27
**Versao:** 7.0
**Empresa:** CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda.
**Usuario padrao:** valida1@valida.com.br / 123456 (super, com empresa CH ja vinculada)
**Usuario alternativo (FA-07):** valida<N>@valida.com.br (super, SEM vinculos em `usuario_empresa`)
**Referencia:** **CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V6.md**, **CRITERIOS PARA GERAR CTS A PARTIR DE UCS PELA IEEE829.md**
**Total de UCs:** 17 (UC-F01 a UC-F17)

**Novidade V7 (27/04/2026):** Cobertura completa IEEE 829 — todos os FP/FAs/FEs documentados nos UCs V6 + classes de equivalencia + valores de fronteira + alguns CTs combinados pairwise. Cada CT recebe o campo **Categoria** com um dos valores:

- **Cenário** — cobre um Fluxo Principal, Alternativo ou Excecao do UC (norma IEEE 829 §3.1)
- **Classe** — cobre uma classe de equivalencia de campo (norma IEEE 829 §3.2)
- **Fronteira** — cobre valor de borda (vazio, max, min, 1 fora) (norma IEEE 829 §3.3)
- **Combinado** — combina dois ou mais fluxos no mesmo CT (norma IEEE 829 §3.4)

**Plano de execucao por fase:**
- **Fase 1 (atual):** automatizar via trilha visual SOMENTE os CTs com `Categoria=Cenário`. Sao os CTs que cobrem UC-V6 diretamente e tem maior valor de regressao.
- **Fase 2:** automatizar `Categoria=Classe` e `Categoria=Fronteira` em e2e (mais rapido pra rodar em batch).
- **Fase 3:** combinados pairwise.

Os CTs do CONJUNTO1 V6 (53 itens) foram **preservados como Categoria=Cenário** e citados aqui por referencia. Os 107 CTs novos cobrem FAs/FEs nao cobertos no V6, e os 67 CTs novos de Classe/Fronteira + 11 Combinados completam a cobertura.

---

## Convencao de IDs (V7)

- **CT-F{UC}-{numero}** — sequencial herdado do V6 (ex: CT-F01-01..CT-F01-06)
- **CT-F{UC}-FA{N}** — vinculado a um FA do UC (ex: CT-F02-FA01)
- **CT-F{UC}-FA{N}-{letra}** — subcaminho do FA (ex: CT-F01-FA07-A..E)
- **CT-F{UC}-FE{N}** — vinculado a um FE do UC (ex: CT-F02-FE03)
- **CT-F{UC}-LIM-{descricao}** — fronteira (ex: CT-F01-LIM-RAZAO-VAZIA)
- **CT-F{UC}-CLS-{descricao}** — classe de equivalencia (ex: CT-F02-CLS-EMAIL-SEM-AT)
- **CT-F{UC}-COMB-{descricao}** — combinado (ex: CT-F01-COMB-FA02-FE04)

---

## Sumario por UC (V7)

| UC | Cenários (FP+FAs+FEs) | Classes | Fronteira | Combinados | Total |
|---|---|---|---|---|---|
| F01 | 11 | 5 | 5 | 2 | 23 |
| F02 | 9 | 4 | 4 | 1 | 18 |
| F03 | 9 | 2 | 4 | 1 | 16 |
| F04 | 10 | 0 | 1 | 1 | 12 |
| F05 | 9 | 3 | 3 | 1 | 16 |
| F06 | 9 | 2 | 2 | 1 | 14 |
| F07 | 9 | 5 | 1 | 1 | 16 |
| F08 | 8 | 2 | 3 | 1 | 14 |
| F09 | 5 | 1 | 0 | 0 | 6 |
| F10 | 6 | 0 | 2 | 0 | 8 |
| F11 | 5 | 0 | 0 | 0 | 5 |
| F12 | 4 | 0 | 0 | 0 | 4 |
| F13 | 4 | 0 | 0 | 0 | 4 |
| F14 | 6 | 2 | 3 | 1 | 12 |
| F15 | 7 | 0 | 5 | 1 | 13 |
| F16 | 6 | 2 | 3 | 0 | 11 |
| F17 | 7 | 1 | 1 | 0 | 9 |
| **TOTAL** | **124** | **29** | **37** | **11** | **201** |


---

## [UC-F01] Manter cadastro principal da empresa

### Cenários (FP + FAs + FEs)

> Cobertura conforme IEEE 829 §3.1 — 1 CT por fluxo principal/alternativo/exceção. Para CTs detalhados ja documentados no V6 (CT-F01-01..NN), ver `CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V6.md`.

#### CT-F01-FP — Fluxo Principal do UC-F01
| Campo | Valor |
|---|---|
| **ID** | CT-F01-FP |
| **Descricao** | Fluxo Principal do UC-F01 |
| **Pre-condicoes** | Pre-condicoes do UC-F01 (ver V6 doc). Empresa CH Hospitalar selecionada para CONJUNTO1 (valida1). |
| **Acoes do ator e dados de entrada** | Executar sequencia de eventos canonica do UC-F01 com dados validos tipicos. Ver passos numerados na 'Sequencia de eventos' do UC-V6. |
| **Saida esperada** | Sistema retorna sucesso conforme 'Pos-condicoes' do UC-F01: persistencia OK, mensagem de feedback positivo, navegacao esperada. |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | RNs do UC |
| **Trilha sugerida** | visual |
#### CT-F01-FA01 — Usuario cancela a edicao antes de salvar
| Campo | Valor |
|---|---|
| **ID** | CT-F01-FA01 |
| **Descricao** | Usuario cancela a edicao antes de salvar |
| **Pre-condicoes** | Pre-condicoes do UC-F01; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario altera campos no formulario. 2. Usuario navega para outra pagina sem clicar "Salvar Alteracoes". 3. Sistema nao persiste as alteracoes. Ao retornar, os dados originais sao recarregados. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F01-FA02 — Facebook deixado em branco (campo opcional)
| Campo | Valor |
|---|---|
| **ID** | CT-F01-FA02 |
| **Descricao** | Facebook deixado em branco (campo opcional) |
| **Pre-condicoes** | Pre-condicoes do UC-F01; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. No Passo 3, usuario preenche todos os campos exceto [Campo: "Facebook"]. 2. Sistema aceita o salvamento sem erro — campo opcional. 3. O registro persiste com Facebook = null/vazio. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F01-FA03 — Empresa ja possui dados cadastrados
| Campo | Valor |
|---|---|
| **ID** | CT-F01-FA03 |
| **Descricao** | Empresa ja possui dados cadastrados |
| **Pre-condicoes** | Pre-condicoes do UC-F01; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. No Passo 2, sistema carrega dados pre-existentes nos campos. 2. Usuario sobrescreve os valores desejados. 3. Sistema atualiza (PUT) em vez de criar (POST). |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F01-FA04 — Usuario acessa via "Cadastros > Empresa" (CRUD generico)
| Campo | Valor |
|---|---|
| **ID** | CT-F01-FA04 |
| **Descricao** | Usuario acessa via "Cadastros > Empresa" (CRUD generico) |
| **Pre-condicoes** | Pre-condicoes do UC-F01; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario navega para "Cadastros > Empresa" em vez de "Configuracoes > Empresa". 2. Sistema exibe CRUD generico simplificado (sem redes sociais, endereco completo, etc.). 3. Alteracoes feitas aqui atualizam a mesma tabela `empresas`, porem com menos campos. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F01-FE01 — CNPJ invalido (digito verificador incorreto)
| Campo | Valor |
|---|---|
| **ID** | CT-F01-FE01 |
| **Descricao** | CNPJ invalido (digito verificador incorreto) |
| **Pre-condicoes** | Pre-condicoes do UC-F01; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. No Passo 3, usuario informa CNPJ com formato correto mas digito verificador errado (ex: `00.000.000/0000-00`). 2. Sistema valida via RN-028 (`validar_cnpj`). 3. Exibe [Alerta] ou [Toast] vermelho: "CNPJ invalido". 4. Registro NAO e salvo. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F01-FE02 — CNPJ em formato incorreto
| Campo | Valor |
|---|---|
| **ID** | CT-F01-FE02 |
| **Descricao** | CNPJ em formato incorreto |
| **Pre-condicoes** | Pre-condicoes do UC-F01; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario digita CNPJ sem pontuacao ou com caracteres invalidos. 2. Sistema rejeita no frontend (mascara) ou backend (validacao). 3. Exibe mensagem de formato invalido. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F01-FE03 — Servidor fora do ar / erro de rede
| Campo | Valor |
|---|---|
| **ID** | CT-F01-FE03 |
| **Descricao** | Servidor fora do ar / erro de rede |
| **Pre-condicoes** | Pre-condicoes do UC-F01; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario clica "Salvar Alteracoes" mas o backend nao responde. 2. Sistema exibe [Alerta] de erro com [Botao: "Tentar novamente"]. 3. Dados permanecem no formulario para reenvio. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F01-FE04 — Razao Social em branco (campo obrigatorio)
| Campo | Valor |
|---|---|
| **ID** | CT-F01-FE04 |
| **Descricao** | Razao Social em branco (campo obrigatorio) |
| **Pre-condicoes** | Pre-condicoes do UC-F01; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario deixa [Campo: "Razao Social"] vazio e tenta salvar. 2. Sistema exibe erro de validacao: "Razao Social e obrigatoria". 3. Registro NAO e salvo. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F01-FE05 — UF digitada como texto livre (bug conhecido)
| Campo | Valor |
|---|---|
| **ID** | CT-F01-FE05 |
| **Descricao** | UF digitada como texto livre (bug conhecido) |
| **Pre-condicoes** | Pre-condicoes do UC-F01; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Campo UF e TextInput em vez de SelectInput. 2. Usuario digita valor invalido (ex: "XX"). 3. Sistema aceita o valor — nao ha validacao de UF no backend. 4. **Correcao V5:** UF deve ser trocado para dropdown com 27 estados. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F01-FE06 — Toast de sucesso nao aparece (bug conhecido)
| Campo | Valor |
|---|---|
| **ID** | CT-F01-FE06 |
| **Descricao** | Toast de sucesso nao aparece (bug conhecido) |
| **Pre-condicoes** | Pre-condicoes do UC-F01; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario salva com dados validos. 2. Backend retorna 200 OK, dados sao persistidos. 3. Porem nenhum feedback visual e exibido ao usuario. 4. **Correcao V5:** Adicionar toast "Dados salvos com sucesso" apos PUT bem-sucedido. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |

### Classes de Equivalência

> Cobertura conforme IEEE 829 §3.2.

#### CT-F01-CLS-CNPJ-LETRAS — CNPJ com letras no meio
| Campo | Valor |
|---|---|
| **ID** | CT-F01-CLS-CNPJ-LETRAS |
| **Descricao** | CNPJ com letras no meio |
| **Pre-condicoes** | Pagina EmpresaPage aberta |
| **Acoes do ator e dados de entrada** | Preencher CNPJ = '12.AAA.345/0001-67'. Salvar. |
| **Saida esperada** | Sistema rejeita com erro RN-028 'CNPJ inválido'. Não persiste. |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | RN-028 |
| **Trilha sugerida** | e2e |
#### CT-F01-CLS-CNPJ-DUPLICADO — CNPJ já existe no banco
| Campo | Valor |
|---|---|
| **ID** | CT-F01-CLS-CNPJ-DUPLICADO |
| **Descricao** | CNPJ já existe no banco |
| **Pre-condicoes** | Banco com empresa CNPJ '11.111.111/0001-11'. Pagina EmpresaPage aberta. |
| **Acoes do ator e dados de entrada** | Tentar criar nova empresa com CNPJ = '11.111.111/0001-11' |
| **Saida esperada** | Sistema rejeita com 409 'Já existe empresa com este CNPJ'. Não persiste. |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | RN-028 |
| **Trilha sugerida** | e2e |
#### CT-F01-CLS-UF-XX — UF como 'XX' (não existe)
| Campo | Valor |
|---|---|
| **ID** | CT-F01-CLS-UF-XX |
| **Descricao** | UF como 'XX' (não existe) |
| **Pre-condicoes** | Pagina EmpresaPage aberta |
| **Acoes do ator e dados de entrada** | Selecionar UF = 'XX' (forçar via dev tools, pois dropdown deveria proibir) |
| **Saida esperada** | Sistema rejeita com erro RN-078 'UF inválida'. |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | RN-078 |
| **Trilha sugerida** | e2e |
#### CT-F01-CLS-CEP-FORMATO — CEP com 5 dígitos
| Campo | Valor |
|---|---|
| **ID** | CT-F01-CLS-CEP-FORMATO |
| **Descricao** | CEP com 5 dígitos |
| **Pre-condicoes** | Pagina EmpresaPage aberta |
| **Acoes do ator e dados de entrada** | Preencher CEP = '01000'. Salvar. |
| **Saida esperada** | Sistema aceita ou rejeita conforme regra (verificar). Idealmente bloqueia ou força máscara. |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F01-CLS-CEP-INEXISTENTE — CEP inexistente no ViaCEP
| Campo | Valor |
|---|---|
| **ID** | CT-F01-CLS-CEP-INEXISTENTE |
| **Descricao** | CEP inexistente no ViaCEP |
| **Pre-condicoes** | Pagina EmpresaPage aberta |
| **Acoes do ator e dados de entrada** | Preencher CEP = '00000-001'. Aguardar autocompletar via ViaCEP. |
| **Saida esperada** | Endereço/Cidade/UF NÃO são preenchidos. Toast informativo opcional. |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | — |
| **Trilha sugerida** | visual |

### Fronteira / Boundary

> Cobertura conforme IEEE 829 §3.3.

#### CT-F01-LIM-RAZAO-VAZIA — Razão Social vazia (string vazia)
| Campo | Valor |
|---|---|
| **ID** | CT-F01-LIM-RAZAO-VAZIA |
| **Descricao** | Razão Social vazia (string vazia) |
| **Pre-condicoes** | Razão Social vazia, demais campos válidos |
| **Acoes do ator e dados de entrada** | Tentar salvar com Razão Social = '' |
| **Saida esperada** | Sistema bloqueia salvamento com erro 'Razão Social é obrigatória' (RN-022). Registro NÃO persiste. |
| **Tipo** | Negativo |
| **Categoria** | Fronteira |
| **RNs** | RN-022 |
| **Trilha sugerida** | e2e |
#### CT-F01-LIM-RAZAO-1CHAR — Razão Social com 1 caractere
| Campo | Valor |
|---|---|
| **ID** | CT-F01-LIM-RAZAO-1CHAR |
| **Descricao** | Razão Social com 1 caractere |
| **Pre-condicoes** | Pagina EmpresaPage aberta |
| **Acoes do ator e dados de entrada** | Preencher Razão Social = 'A'. Demais campos válidos. Salvar. |
| **Saida esperada** | Sistema aceita e persiste 'A' como Razão Social. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | RN-022 |
| **Trilha sugerida** | e2e |
#### CT-F01-LIM-RAZAO-MAX — Razão Social com 255 caracteres
| Campo | Valor |
|---|---|
| **ID** | CT-F01-LIM-RAZAO-MAX |
| **Descricao** | Razão Social com 255 caracteres |
| **Pre-condicoes** | Pagina EmpresaPage aberta |
| **Acoes do ator e dados de entrada** | Preencher Razão Social com string de exatamente 255 chars. Salvar. |
| **Saida esperada** | Sistema aceita e persiste a string completa. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | RN-022 |
| **Trilha sugerida** | e2e |
#### CT-F01-LIM-RAZAO-256 — Razão Social com 256 caracteres
| Campo | Valor |
|---|---|
| **ID** | CT-F01-LIM-RAZAO-256 |
| **Descricao** | Razão Social com 256 caracteres |
| **Pre-condicoes** | Pagina EmpresaPage aberta |
| **Acoes do ator e dados de entrada** | Preencher Razão Social com 256 chars. Salvar. |
| **Saida esperada** | Sistema rejeita ou trunca para 255 (verificar comportamento). Erro de validação esperado. |
| **Tipo** | Negativo |
| **Categoria** | Fronteira |
| **RNs** | RN-022 |
| **Trilha sugerida** | e2e |
#### CT-F01-LIM-CNPJ-VAZIO — CNPJ vazio (campo obrigatório)
| Campo | Valor |
|---|---|
| **ID** | CT-F01-LIM-CNPJ-VAZIO |
| **Descricao** | CNPJ vazio (campo obrigatório) |
| **Pre-condicoes** | Pagina EmpresaPage aberta |
| **Acoes do ator e dados de entrada** | Tentar salvar com CNPJ = '' |
| **Saida esperada** | Sistema bloqueia com erro 'CNPJ é obrigatório'. |
| **Tipo** | Negativo |
| **Categoria** | Fronteira |
| **RNs** | RN-022, RN-028 |
| **Trilha sugerida** | e2e |

### Combinados (Pairwise)

> Cobertura conforme IEEE 829 §3.4 — CTs cruzados de risco de regressao.

#### CT-F01-COMB-FA02-FE04 — Facebook vazio E Razão Social vazia
| Campo | Valor |
|---|---|
| **ID** | CT-F01-COMB-FA02-FE04 |
| **Descricao** | Facebook vazio E Razão Social vazia |
| **Pre-condicoes** | EmpresaPage aberta |
| **Acoes do ator e dados de entrada** | Preencher tudo válido EXCETO Facebook (vazio) E Razão Social (vazia). Salvar. |
| **Saida esperada** | FE-04 prevalece — sistema rejeita por Razão obrigatória, não chega a validar Facebook. |
| **Tipo** | Negativo |
| **Categoria** | Combinado |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F01-COMB-FA07A-CNPJ-DUP — Super FA-07.A criando empresa com CNPJ que já existe
| Campo | Valor |
|---|---|
| **ID** | CT-F01-COMB-FA07A-CNPJ-DUP |
| **Descricao** | Super FA-07.A criando empresa com CNPJ que já existe |
| **Pre-condicoes** | Banco com empresa CNPJ='11.111.111/0001-11'. Super sem vínculo logado. |
| **Acoes do ator e dados de entrada** | Clicar 'Criar Nova Empresa', preencher CNPJ='11.111.111/0001-11'. Salvar no CRUD. |
| **Saida esperada** | Backend retorna 409 'CNPJ já existe'. Empresa NÃO criada. |
| **Tipo** | Negativo |
| **Categoria** | Combinado |
| **RNs** | — |
| **Trilha sugerida** | e2e |

---

## [UC-F02] Gerir contatos e area padrao

### Cenários (FP + FAs + FEs)

> Cobertura conforme IEEE 829 §3.1 — 1 CT por fluxo principal/alternativo/exceção. Para CTs detalhados ja documentados no V6 (CT-F02-01..NN), ver `CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V6.md`.

#### CT-F02-FP — Fluxo Principal do UC-F02
| Campo | Valor |
|---|---|
| **ID** | CT-F02-FP |
| **Descricao** | Fluxo Principal do UC-F02 |
| **Pre-condicoes** | Pre-condicoes do UC-F02 (ver V6 doc). Empresa CH Hospitalar selecionada para CONJUNTO1 (valida1). |
| **Acoes do ator e dados de entrada** | Executar sequencia de eventos canonica do UC-F02 com dados validos tipicos. Ver passos numerados na 'Sequencia de eventos' do UC-V6. |
| **Saida esperada** | Sistema retorna sucesso conforme 'Pos-condicoes' do UC-F02: persistencia OK, mensagem de feedback positivo, navegacao esperada. |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | RNs do UC |
| **Trilha sugerida** | visual |
#### CT-F02-FA01 — Usuario nao adiciona nenhum email nem telefone
| Campo | Valor |
|---|---|
| **ID** | CT-F02-FA01 |
| **Descricao** | Usuario nao adiciona nenhum email nem telefone |
| **Pre-condicoes** | Pre-condicoes do UC-F02; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario pula os Passos 1 e 2 e vai direto para Passo 3 (area padrao) ou Passo 4 (salvar). 2. Sistema aceita — campos email e telefone sao opcionais (nullable=True no modelo). 3. Registro salvo com `emails` e `celulares` vazios. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F02-FA02 — Usuario remove email ou telefone existente
| Campo | Valor |
|---|---|
| **ID** | CT-F02-FA02 |
| **Descricao** | Usuario remove email ou telefone existente |
| **Pre-condicoes** | Pre-condicoes do UC-F02; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario clica [Icone-Acao: X] em um email ja cadastrado. 2. O email e removido da lista visual. 3. Ao salvar, a lista serializada nao contem mais o item removido. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F02-FA03 — Area padrao nao selecionada
| Campo | Valor |
|---|---|
| **ID** | CT-F02-FA03 |
| **Descricao** | Area padrao nao selecionada |
| **Pre-condicoes** | Pre-condicoes do UC-F02; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario nao altera [Campo: "Area de Atuacao Padrao"], deixando-o vazio ou com valor anterior. 2. Sistema aceita — area padrao e opcional. 3. Registro salvo com `area_padrao_id` = null ou mantido. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F02-FE01 — Email em formato invalido
| Campo | Valor |
|---|---|
| **ID** | CT-F02-FE01 |
| **Descricao** | Email em formato invalido |
| **Pre-condicoes** | Pre-condicoes do UC-F02; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario digita email sem "@" ou com formato incorreto (ex: "joao.com"). 2. Sistema valida via RN-042 (`validar_email`). 3. Exibe [Toast] ou [Alerta] vermelho: "Email em formato invalido". 4. Email NAO e adicionado a lista. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F02-FE02 — Email duplicado
| Campo | Valor |
|---|---|
| **ID** | CT-F02-FE02 |
| **Descricao** | Email duplicado |
| **Pre-condicoes** | Pre-condicoes do UC-F02; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario tenta adicionar email ja existente na lista. 2. Sistema deve detectar duplicidade e nao adicionar novamente. 3. Exibe mensagem informativa. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F02-FE03 — Area padrao esta vazia (lista sem opcoes)
| Campo | Valor |
|---|---|
| **ID** | CT-F02-FE03 |
| **Descricao** | Area padrao esta vazia (lista sem opcoes) |
| **Pre-condicoes** | Pre-condicoes do UC-F02; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. No Passo 3, o [Select: "Area de Atuacao Padrao"] nao exibe nenhuma opcao. 2. Causa: nenhuma area cadastrada em `areas_produto` para esta empresa/usuario. 3. **Correcao V5 (Arnaldo OBS-12):** Garantir que areas sejam populadas antes (UC-F13 deve vir antes, ou seed deve conter areas). |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F02-FE04 — Telefone com formato inconsistente (sem mascara)
| Campo | Valor |
|---|---|
| **ID** | CT-F02-FE04 |
| **Descricao** | Telefone com formato inconsistente (sem mascara) |
| **Pre-condicoes** | Pre-condicoes do UC-F02; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario digita telefone sem parenteses ou hifen (ex: "11987654321"). 2. Sistema aceita — nao ha mascara implementada. 3. **Correcao V5 (Arnaldo OBS-10):** Implementar mascara de telefone. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F02-FE05 — Erro ao salvar (servidor indisponivel)
| Campo | Valor |
|---|---|
| **ID** | CT-F02-FE05 |
| **Descricao** | Erro ao salvar (servidor indisponivel) |
| **Pre-condicoes** | Pre-condicoes do UC-F02; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario clica "Salvar Alteracoes" mas backend nao responde. 2. Sistema exibe [Alerta] de erro. 3. Dados permanecem no formulario. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |

### Classes de Equivalência

> Cobertura conforme IEEE 829 §3.2.

#### CT-F02-CLS-EMAIL-SEM-AT — Email sem @ (formato inválido)
| Campo | Valor |
|---|---|
| **ID** | CT-F02-CLS-EMAIL-SEM-AT |
| **Descricao** | Email sem @ (formato inválido) |
| **Pre-condicoes** | Empresa em edição |
| **Acoes do ator e dados de entrada** | Adicionar email = 'usuariosemarroba.com'. Salvar. |
| **Saida esperada** | Sistema rejeita com erro RN-042 'Email inválido'. |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | RN-042 |
| **Trilha sugerida** | e2e |
#### CT-F02-CLS-EMAIL-SEM-DOMINIO — Email sem domínio após @
| Campo | Valor |
|---|---|
| **ID** | CT-F02-CLS-EMAIL-SEM-DOMINIO |
| **Descricao** | Email sem domínio após @ |
| **Pre-condicoes** | Empresa em edição |
| **Acoes do ator e dados de entrada** | Adicionar email = 'usuario@'. Salvar. |
| **Saida esperada** | Sistema rejeita com erro RN-042. |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | RN-042 |
| **Trilha sugerida** | e2e |
#### CT-F02-CLS-TEL-LETRAS — Telefone com letras
| Campo | Valor |
|---|---|
| **ID** | CT-F02-CLS-TEL-LETRAS |
| **Descricao** | Telefone com letras |
| **Pre-condicoes** | Empresa em edição |
| **Acoes do ator e dados de entrada** | Adicionar telefone = 'abc-defg'. Salvar. |
| **Saida esperada** | Sistema rejeita ou aceita sem máscara (verificar — bug Arnaldo OBS-08). |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F02-CLS-AREA-INVALIDA — Area padrão com ID inexistente
| Campo | Valor |
|---|---|
| **ID** | CT-F02-CLS-AREA-INVALIDA |
| **Descricao** | Area padrão com ID inexistente |
| **Pre-condicoes** | Empresa em edição. Forçar via dev tools area_padrao_id = 99999. |
| **Acoes do ator e dados de entrada** | Submit do form |
| **Saida esperada** | Sistema rejeita com erro de FK ou ignora silenciosamente. |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | — |
| **Trilha sugerida** | e2e |

### Fronteira / Boundary

> Cobertura conforme IEEE 829 §3.3.

#### CT-F02-LIM-EMAIL-VAZIO — Email vazio (lista vazia)
| Campo | Valor |
|---|---|
| **ID** | CT-F02-LIM-EMAIL-VAZIO |
| **Descricao** | Email vazio (lista vazia) |
| **Pre-condicoes** | Empresa em edição |
| **Acoes do ator e dados de entrada** | Não adicionar email nenhum. Salvar. |
| **Saida esperada** | Sistema aceita — emails = null/[]. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F02-LIM-EMAIL-MAX — Email com 255 caracteres
| Campo | Valor |
|---|---|
| **ID** | CT-F02-LIM-EMAIL-MAX |
| **Descricao** | Email com 255 caracteres |
| **Pre-condicoes** | Empresa em edição |
| **Acoes do ator e dados de entrada** | Adicionar email com 255 chars válido. Salvar. |
| **Saida esperada** | Sistema aceita. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | RN-042 |
| **Trilha sugerida** | e2e |
#### CT-F02-LIM-TEL-CURTO — Telefone com 5 dígitos
| Campo | Valor |
|---|---|
| **ID** | CT-F02-LIM-TEL-CURTO |
| **Descricao** | Telefone com 5 dígitos |
| **Pre-condicoes** | Empresa em edição |
| **Acoes do ator e dados de entrada** | Adicionar telefone = '12345'. Salvar. |
| **Saida esperada** | Sistema rejeita ou aceita (verificar — atualmente aceita por falta de máscara). |
| **Tipo** | Negativo |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F02-LIM-TEL-LONGO — Telefone com 20 dígitos
| Campo | Valor |
|---|---|
| **ID** | CT-F02-LIM-TEL-LONGO |
| **Descricao** | Telefone com 20 dígitos |
| **Pre-condicoes** | Empresa em edição |
| **Acoes do ator e dados de entrada** | Adicionar telefone com 20 dígitos. Salvar. |
| **Saida esperada** | Sistema rejeita ou trunca. |
| **Tipo** | Negativo |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | visual |

### Combinados (Pairwise)

> Cobertura conforme IEEE 829 §3.4 — CTs cruzados de risco de regressao.

#### CT-F02-COMB-FA02-FE01 — Remover email E adicionar email com formato inválido
| Campo | Valor |
|---|---|
| **ID** | CT-F02-COMB-FA02-FE01 |
| **Descricao** | Remover email E adicionar email com formato inválido |
| **Pre-condicoes** | Empresa com 1 email cadastrado |
| **Acoes do ator e dados de entrada** | Remover email existente E adicionar 'email-invalido' (sem @) |
| **Saida esperada** | Sistema rejeita o novo email; email original já foi removido visualmente mas reverter ao salvar. |
| **Tipo** | Negativo |
| **Categoria** | Combinado |
| **RNs** | — |
| **Trilha sugerida** | e2e |

---

## [UC-F03] Gerir documentos da empresa

### Cenários (FP + FAs + FEs)

> Cobertura conforme IEEE 829 §3.1 — 1 CT por fluxo principal/alternativo/exceção. Para CTs detalhados ja documentados no V6 (CT-F03-01..NN), ver `CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V6.md`.

#### CT-F03-FP — Fluxo Principal do UC-F03
| Campo | Valor |
|---|---|
| **ID** | CT-F03-FP |
| **Descricao** | Fluxo Principal do UC-F03 |
| **Pre-condicoes** | Pre-condicoes do UC-F03 (ver V6 doc). Empresa CH Hospitalar selecionada para CONJUNTO1 (valida1). |
| **Acoes do ator e dados de entrada** | Executar sequencia de eventos canonica do UC-F03 com dados validos tipicos. Ver passos numerados na 'Sequencia de eventos' do UC-V6. |
| **Saida esperada** | Sistema retorna sucesso conforme 'Pos-condicoes' do UC-F03: persistencia OK, mensagem de feedback positivo, navegacao esperada. |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | RNs do UC |
| **Trilha sugerida** | visual |
#### CT-F03-FA01 — Usuario cancela o upload
| Campo | Valor |
|---|---|
| **ID** | CT-F03-FA01 |
| **Descricao** | Usuario cancela o upload |
| **Pre-condicoes** | Pre-condicoes do UC-F03; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. No Passo 2, usuario abre o modal de upload. 2. Usuario clica [Botao: "Cancelar"] no rodape do modal. 3. Modal fecha sem enviar dados. Nenhum documento e criado. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F03-FA02 — Documento sem data de validade
| Campo | Valor |
|---|---|
| **ID** | CT-F03-FA02 |
| **Descricao** | Documento sem data de validade |
| **Pre-condicoes** | Pre-condicoes do UC-F03; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. No Passo 2, usuario nao preenche [Campo: "Validade"]. 2. Sistema aceita o upload sem validade. 3. Documento aparece na lista com badge "OK" (sem vencimento). |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F03-FA03 — Upload de segundo documento do mesmo tipo
| Campo | Valor |
|---|---|
| **ID** | CT-F03-FA03 |
| **Descricao** | Upload de segundo documento do mesmo tipo |
| **Pre-condicoes** | Pre-condicoes do UC-F03; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario tenta fazer upload de documento com mesmo tipo de um ja existente. 2. Sistema aceita — nao ha restricao de unicidade por tipo. 3. Ambos os documentos aparecem na lista. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F03-FE01 — Arquivo em formato nao suportado
| Campo | Valor |
|---|---|
| **ID** | CT-F03-FE01 |
| **Descricao** | Arquivo em formato nao suportado |
| **Pre-condicoes** | Pre-condicoes do UC-F03; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario seleciona arquivo com extensao nao aceita (ex: .exe, .zip). 2. O file input restringe via `accept=".pdf,.doc,.docx,.jpg,.png"`. 3. Se arquivo invalido for enviado, backend rejeita com erro 400. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F03-FE02 — Arquivo excede tamanho maximo
| Campo | Valor |
|---|---|
| **ID** | CT-F03-FE02 |
| **Descricao** | Arquivo excede tamanho maximo |
| **Pre-condicoes** | Pre-condicoes do UC-F03; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario tenta enviar arquivo maior que o limite configurado no backend. 2. Sistema retorna erro 413 (Payload Too Large) ou mensagem de erro. 3. Documento NAO e salvo. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F03-FE03 — Tipo de documento nao selecionado
| Campo | Valor |
|---|---|
| **ID** | CT-F03-FE03 |
| **Descricao** | Tipo de documento nao selecionado |
| **Pre-condicoes** | Pre-condicoes do UC-F03; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario nao seleciona [Campo: "Tipo de Documento"] e tenta salvar. 2. Sistema exibe erro de validacao: campo obrigatorio. 3. Upload NAO e realizado. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F03-FE04 — Exclusao de documento falha (Arnaldo OBS-15)
| Campo | Valor |
|---|---|
| **ID** | CT-F03-FE04 |
| **Descricao** | Exclusao de documento falha (Arnaldo OBS-15) |
| **Pre-condicoes** | Pre-condicoes do UC-F03; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario clica [Icone-Acao: Trash2] para excluir documento. 2. Sistema nao responde ou exibe erro silencioso. 3. **Bug identificado V5:** Verificar se o endpoint DELETE esta disparando corretamente e se ha constraint FK impedindo exclusao. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F03-FE05 — Erro de rede durante upload
| Campo | Valor |
|---|---|
| **ID** | CT-F03-FE05 |
| **Descricao** | Erro de rede durante upload |
| **Pre-condicoes** | Pre-condicoes do UC-F03; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Conexao cai durante POST do FormData. 2. Modal permanece aberto. Toast de erro exibido. 3. Usuario pode tentar novamente. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |

### Classes de Equivalência

> Cobertura conforme IEEE 829 §3.2.

#### CT-F03-CLS-LIM-ARQ-EXEC — Upload arquivo .exe
| Campo | Valor |
|---|---|
| **ID** | CT-F03-CLS-LIM-ARQ-EXEC |
| **Descricao** | Upload arquivo .exe |
| **Pre-condicoes** | Modal aberto |
| **Acoes do ator e dados de entrada** | Selecionar arquivo malware.exe. Enviar. |
| **Saida esperada** | Sistema rejeita com 'Formato não suportado'. |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F03-CLS-DATA-PASSADA — Data de validade no passado
| Campo | Valor |
|---|---|
| **ID** | CT-F03-CLS-DATA-PASSADA |
| **Descricao** | Data de validade no passado |
| **Pre-condicoes** | Modal aberto, arquivo selecionado |
| **Acoes do ator e dados de entrada** | Preencher data de validade = '2020-01-01'. Enviar. |
| **Saida esperada** | Sistema aceita mas marca documento como vencido. |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | — |
| **Trilha sugerida** | e2e |

### Fronteira / Boundary

> Cobertura conforme IEEE 829 §3.3.

#### CT-F03-LIM-ARQ-VAZIO — Upload sem arquivo selecionado
| Campo | Valor |
|---|---|
| **ID** | CT-F03-LIM-ARQ-VAZIO |
| **Descricao** | Upload sem arquivo selecionado |
| **Pre-condicoes** | Modal de upload aberto |
| **Acoes do ator e dados de entrada** | Clicar 'Enviar' sem selecionar arquivo |
| **Saida esperada** | Botão fica desabilitado ou erro 'Arquivo é obrigatório'. |
| **Tipo** | Negativo |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F03-LIM-ARQ-1KB — Upload arquivo 1KB
| Campo | Valor |
|---|---|
| **ID** | CT-F03-LIM-ARQ-1KB |
| **Descricao** | Upload arquivo 1KB |
| **Pre-condicoes** | Modal aberto |
| **Acoes do ator e dados de entrada** | Selecionar arquivo .pdf de 1KB. Enviar. |
| **Saida esperada** | Sistema aceita e persiste. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F03-LIM-ARQ-10MB — Upload arquivo 10MB (limite máximo)
| Campo | Valor |
|---|---|
| **ID** | CT-F03-LIM-ARQ-10MB |
| **Descricao** | Upload arquivo 10MB (limite máximo) |
| **Pre-condicoes** | Modal aberto |
| **Acoes do ator e dados de entrada** | Selecionar PDF de 10MB. Enviar. |
| **Saida esperada** | Sistema aceita (se 10MB é o limite). |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F03-LIM-CLS-DATA-DISTANTE — Data 100 anos no futuro
| Campo | Valor |
|---|---|
| **ID** | CT-F03-LIM-CLS-DATA-DISTANTE |
| **Descricao** | Data 100 anos no futuro |
| **Pre-condicoes** | Modal aberto |
| **Acoes do ator e dados de entrada** | Preencher data = '2125-01-01'. Enviar. |
| **Saida esperada** | Sistema aceita (sem validação de plausibilidade). |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |

### Combinados (Pairwise)

> Cobertura conforme IEEE 829 §3.4 — CTs cruzados de risco de regressao.

#### CT-F03-COMB-FA01-FE05 — Cancelar upload E erro de rede simultâneo
| Campo | Valor |
|---|---|
| **ID** | CT-F03-COMB-FA01-FE05 |
| **Descricao** | Cancelar upload E erro de rede simultâneo |
| **Pre-condicoes** | Modal de upload aberto, rede instável |
| **Acoes do ator e dados de entrada** | Iniciar upload de PDF grande, clicar Cancelar enquanto rede falha |
| **Saida esperada** | Modal fecha. Nenhum documento criado. Sem mensagem de erro. |
| **Tipo** | Negativo |
| **Categoria** | Combinado |
| **RNs** | — |
| **Trilha sugerida** | e2e |

---

## [UC-F04] Buscar, revisar e anexar certidoes

### Cenários (FP + FAs + FEs)

> Cobertura conforme IEEE 829 §3.1 — 1 CT por fluxo principal/alternativo/exceção. Para CTs detalhados ja documentados no V6 (CT-F04-01..NN), ver `CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V6.md`.

#### CT-F04-FP — Fluxo Principal do UC-F04
| Campo | Valor |
|---|---|
| **ID** | CT-F04-FP |
| **Descricao** | Fluxo Principal do UC-F04 |
| **Pre-condicoes** | Pre-condicoes do UC-F04 (ver V6 doc). Empresa CH Hospitalar selecionada para CONJUNTO1 (valida1). |
| **Acoes do ator e dados de entrada** | Executar sequencia de eventos canonica do UC-F04 com dados validos tipicos. Ver passos numerados na 'Sequencia de eventos' do UC-V6. |
| **Saida esperada** | Sistema retorna sucesso conforme 'Pos-condicoes' do UC-F04: persistencia OK, mensagem de feedback positivo, navegacao esperada. |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | RNs do UC |
| **Trilha sugerida** | visual |
#### CT-F04-FA01 — Fontes de certidao nao inicializadas (pre-requisito)
| Campo | Valor |
|---|---|
| **ID** | CT-F04-FA01 |
| **Descricao** | Fontes de certidao nao inicializadas (pre-requisito) |
| **Pre-condicoes** | Pre-condicoes do UC-F04; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Antes do Passo 1, usuario deve verificar se fontes de certidao existem. 2. Se nao existirem, acessar endpoint `/api/fontes-certidoes/inicializar` ou CRUD de fontes. 3. Sistema cria 5 fontes padrao (Receita Federal, PGFN, FGTS, TST, Estadual). 4. **Correcao V5 (Arnaldo OBS-17):** Tutorial deve incluir passo de inicializacao de fontes ANTES de buscar. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F04-FA02 — Busca automatica parcial (algumas fontes offline)
| Campo | Valor |
|---|---|
| **ID** | CT-F04-FA02 |
| **Descricao** | Busca automatica parcial (algumas fontes offline) |
| **Pre-condicoes** | Pre-condicoes do UC-F04; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. No Passo 3, algumas fontes governamentais estao indisponiveis. 2. Sistema marca estas certidoes como "Erro" ou "Nao disponivel" na tabela. 3. Demais certidoes encontradas sao exibidas normalmente. 4. Usuario pode tentar novamente mais tarde ou usar upload manual. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F04-FA03 — Upload manual sem busca automatica
| Campo | Valor |
|---|---|
| **ID** | CT-F04-FA03 |
| **Descricao** | Upload manual sem busca automatica |
| **Pre-condicoes** | Pre-condicoes do UC-F04; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario pula os Passos 1-4 e vai direto para Passo 7. 2. Usuario faz upload manual de PDF de certidao. 3. Sistema aceita o upload e cria registro em `empresa_certidoes`. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F04-FA04 — Edicao de certidao via modal de detalhe
| Campo | Valor |
|---|---|
| **ID** | CT-F04-FA04 |
| **Descricao** | Edicao de certidao via modal de detalhe |
| **Pre-condicoes** | Pre-condicoes do UC-F04; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario clica [Icone-Acao: Pencil] em certidao existente. 2. Altera campos no modal e clica "Salvar". 3. Sistema atualiza o registro sem precisar buscar novamente. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F04-FE01 — Nenhuma fonte de certidao cadastrada
| Campo | Valor |
|---|---|
| **ID** | CT-F04-FE01 |
| **Descricao** | Nenhuma fonte de certidao cadastrada |
| **Pre-condicoes** | Pre-condicoes do UC-F04; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario clica "Buscar Certidoes" sem fontes inicializadas. 2. Sistema retorna erro 400: "Nenhuma fonte de certidao cadastrada. Acesse Cadastros > Empresa > Fontes de Certidoes para configurar." 3. **Correcao V5 (Arnaldo OBS-17):** Sistema deveria auto-inicializar fontes ou tutorial deve instruir o passo previo. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F04-FE02 — CNPJ ficticio sem resultados nos portais
| Campo | Valor |
|---|---|
| **ID** | CT-F04-FE02 |
| **Descricao** | CNPJ ficticio sem resultados nos portais |
| **Pre-condicoes** | Pre-condicoes do UC-F04; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. CNPJ da empresa e ficticio (ex: dados de teste). 2. Busca automatica retorna sem resultados de nenhum portal. 3. Sistema exibe lista vazia ou certidoes com status "Nao disponivel". 4. Comportamento esperado — usar upload manual como alternativa. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F04-FE03 — Timeout na busca automatica
| Campo | Valor |
|---|---|
| **ID** | CT-F04-FE03 |
| **Descricao** | Timeout na busca automatica |
| **Pre-condicoes** | Pre-condicoes do UC-F04; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Portais governamentais demoram mais de 60 segundos para responder. 2. Sistema aborta a conexao e marca a certidao como "Erro" ou "Timeout". 3. Usuario pode clicar "Atualizar esta certidao" para tentar individualmente. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F04-FE04 — Erro de CAPTCHA
| Campo | Valor |
|---|---|
| **ID** | CT-F04-FE04 |
| **Descricao** | Erro de CAPTCHA |
| **Pre-condicoes** | Pre-condicoes do UC-F04; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Portal exige resolucao de CAPTCHA. 2. Se CapSolver nao estiver configurado, a busca falha para esta fonte. 3. Sistema exibe badge "Erro" e mensagem explicativa no modal de detalhe. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F04-FE05 — Upload de arquivo invalido
| Campo | Valor |
|---|---|
| **ID** | CT-F04-FE05 |
| **Descricao** | Upload de arquivo invalido |
| **Pre-condicoes** | Pre-condicoes do UC-F04; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario tenta upload de arquivo com formato nao aceito. 2. File input restringe via accept, backend rejeita com 400. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |

### Fronteira / Boundary

> Cobertura conforme IEEE 829 §3.3.

#### CT-F04-LIM-CNPJ-VAZIO — Buscar certidões com CNPJ vazio
| Campo | Valor |
|---|---|
| **ID** | CT-F04-LIM-CNPJ-VAZIO |
| **Descricao** | Buscar certidões com CNPJ vazio |
| **Pre-condicoes** | EmpresaPage aberta com CNPJ = '' |
| **Acoes do ator e dados de entrada** | Clicar 'Buscar Certidões' |
| **Saida esperada** | Sistema bloqueia ou retorna 0 certidões. |
| **Tipo** | Negativo |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | visual |

### Combinados (Pairwise)

> Cobertura conforme IEEE 829 §3.4 — CTs cruzados de risco de regressao.

#### CT-F04-COMB-FA01-FE03 — Fontes inicializadas + timeout em 3 das 5 fontes
| Campo | Valor |
|---|---|
| **ID** | CT-F04-COMB-FA01-FE03 |
| **Descricao** | Fontes inicializadas + timeout em 3 das 5 fontes |
| **Pre-condicoes** | 5 fontes inicializadas |
| **Acoes do ator e dados de entrada** | Iniciar busca automática. Simular timeout em RF, FGTS, TST. |
| **Saida esperada** | 2 fontes retornam OK. 3 mostram 'Timeout — tentar novamente'. |
| **Tipo** | Negativo |
| **Categoria** | Combinado |
| **RNs** | — |
| **Trilha sugerida** | e2e |

---

## [UC-F05] Gerir responsaveis da empresa

### Cenários (FP + FAs + FEs)

> Cobertura conforme IEEE 829 §3.1 — 1 CT por fluxo principal/alternativo/exceção. Para CTs detalhados ja documentados no V6 (CT-F05-01..NN), ver `CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V6.md`.

#### CT-F05-FP — Fluxo Principal do UC-F05
| Campo | Valor |
|---|---|
| **ID** | CT-F05-FP |
| **Descricao** | Fluxo Principal do UC-F05 |
| **Pre-condicoes** | Pre-condicoes do UC-F05 (ver V6 doc). Empresa CH Hospitalar selecionada para CONJUNTO1 (valida1). |
| **Acoes do ator e dados de entrada** | Executar sequencia de eventos canonica do UC-F05 com dados validos tipicos. Ver passos numerados na 'Sequencia de eventos' do UC-V6. |
| **Saida esperada** | Sistema retorna sucesso conforme 'Pos-condicoes' do UC-F05: persistencia OK, mensagem de feedback positivo, navegacao esperada. |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | RNs do UC |
| **Trilha sugerida** | visual |
#### CT-F05-FA01 — Cadastro de apenas dois responsaveis (sem Preposto)
| Campo | Valor |
|---|---|
| **ID** | CT-F05-FA01 |
| **Descricao** | Cadastro de apenas dois responsaveis (sem Preposto) |
| **Pre-condicoes** | Pre-condicoes do UC-F05; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario cadastra Representante Legal e Responsavel Tecnico. 2. Nao cadastra Preposto. 3. Sistema aceita — Preposto NAO e obrigatorio. 4. Lista exibe dois responsaveis sem mensagem de alerta. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F05-FA02 — Edicao de responsavel existente
| Campo | Valor |
|---|---|
| **ID** | CT-F05-FA02 |
| **Descricao** | Edicao de responsavel existente |
| **Pre-condicoes** | Pre-condicoes do UC-F05; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario clica [Icone-Acao: Pencil] em responsavel ja cadastrado. 2. Modal "Editar Responsavel" abre com dados pre-preenchidos. 3. Usuario altera campos desejados e clica "Salvar". 4. Sistema atualiza o registro via `crudUpdate`. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F05-FA03 — Campo CPF deixado em branco
| Campo | Valor |
|---|---|
| **ID** | CT-F05-FA03 |
| **Descricao** | Campo CPF deixado em branco |
| **Pre-condicoes** | Pre-condicoes do UC-F05; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. No Passo 2, usuario nao preenche campo CPF. 2. Sistema aceita — CPF e nullable=True, nao esta em `required`. 3. Registro salvo com CPF = null. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F05-FE01 — CPF invalido (digito verificador incorreto)
| Campo | Valor |
|---|---|
| **ID** | CT-F05-FE01 |
| **Descricao** | CPF invalido (digito verificador incorreto) |
| **Pre-condicoes** | Pre-condicoes do UC-F05; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario informa CPF com formato correto mas digito errado (ex: `000.000.000-00`). 2. Sistema valida via RN-029 (`validar_cpf`). 3. Exibe [Toast] ou [Alerta]: "CPF invalido". 4. Registro NAO e salvo. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F05-FE02 — Nome em branco (campo obrigatorio)
| Campo | Valor |
|---|---|
| **ID** | CT-F05-FE02 |
| **Descricao** | Nome em branco (campo obrigatorio) |
| **Pre-condicoes** | Pre-condicoes do UC-F05; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario tenta salvar sem preencher [Campo: "Nome"]. 2. Sistema exibe erro de validacao. 3. Modal permanece aberto. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F05-FE03 — Email em formato invalido
| Campo | Valor |
|---|---|
| **ID** | CT-F05-FE03 |
| **Descricao** | Email em formato invalido |
| **Pre-condicoes** | Pre-condicoes do UC-F05; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario informa email incorreto (ex: "joao@"). 2. Sistema valida via RN-042. 3. Exibe erro e nao salva. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F05-FE04 — Permissao negada (usuario sem papel admin)
| Campo | Valor |
|---|---|
| **ID** | CT-F05-FE04 |
| **Descricao** | Permissao negada (usuario sem papel admin) |
| **Pre-condicoes** | Pre-condicoes do UC-F05; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario com papel `operador` tenta adicionar responsavel. 2. Backend verifica `_is_admin` = False. 3. Retorna erro 403: "Apenas administradores podem criar este recurso". 4. **Nota V5 (Arnaldo OBS-20):** O validador reportou esse erro, mas valida2 e super+admin. Provavel erro de operacao (empresa nao selecionada ou token expirado). |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F05-FE05 — Exclusao de responsavel referenciado
| Campo | Valor |
|---|---|
| **ID** | CT-F05-FE05 |
| **Descricao** | Exclusao de responsavel referenciado |
| **Pre-condicoes** | Pre-condicoes do UC-F05; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario tenta excluir responsavel vinculado a outros registros. 2. Se houver constraint FK, backend retorna erro. 3. Exibe mensagem de erro. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |

### Classes de Equivalência

> Cobertura conforme IEEE 829 §3.2.

#### CT-F05-CLS-CPF-LETRAS — CPF com letras
| Campo | Valor |
|---|---|
| **ID** | CT-F05-CLS-CPF-LETRAS |
| **Descricao** | CPF com letras |
| **Pre-condicoes** | Modal de cadastro de responsável aberto |
| **Acoes do ator e dados de entrada** | Preencher CPF = 'AAA.BBB.CCC-DD'. Salvar. |
| **Saida esperada** | Sistema rejeita com RN-029 'CPF inválido'. |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | RN-029 |
| **Trilha sugerida** | e2e |
#### CT-F05-CLS-CPF-REPETIDO — CPF com todos dígitos iguais (000.000.000-00)
| Campo | Valor |
|---|---|
| **ID** | CT-F05-CLS-CPF-REPETIDO |
| **Descricao** | CPF com todos dígitos iguais (000.000.000-00) |
| **Pre-condicoes** | Modal aberto |
| **Acoes do ator e dados de entrada** | CPF = '000.000.000-00'. Salvar. |
| **Saida esperada** | Sistema rejeita — DV inválido por construção (RN-029). |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | RN-029 |
| **Trilha sugerida** | e2e |
#### CT-F05-CLS-NOME-NUM — Nome só com números
| Campo | Valor |
|---|---|
| **ID** | CT-F05-CLS-NOME-NUM |
| **Descricao** | Nome só com números |
| **Pre-condicoes** | Modal aberto |
| **Acoes do ator e dados de entrada** | Nome = '123456'. Salvar. |
| **Saida esperada** | Sistema aceita ou rejeita (verificar — não há regra explícita). |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | — |
| **Trilha sugerida** | e2e |

### Fronteira / Boundary

> Cobertura conforme IEEE 829 §3.3.

#### CT-F05-LIM-CPF-VAZIO — CPF vazio (campo opcional)
| Campo | Valor |
|---|---|
| **ID** | CT-F05-LIM-CPF-VAZIO |
| **Descricao** | CPF vazio (campo opcional) |
| **Pre-condicoes** | Modal aberto |
| **Acoes do ator e dados de entrada** | Preencher Nome e demais campos, deixar CPF vazio. Salvar. |
| **Saida esperada** | Sistema aceita. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F05-LIM-NOME-1CHAR — Nome com 1 caractere
| Campo | Valor |
|---|---|
| **ID** | CT-F05-LIM-NOME-1CHAR |
| **Descricao** | Nome com 1 caractere |
| **Pre-condicoes** | Modal aberto |
| **Acoes do ator e dados de entrada** | Nome = 'A'. Salvar. |
| **Saida esperada** | Sistema aceita. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F05-LIM-NOME-MAX — Nome com 255 caracteres
| Campo | Valor |
|---|---|
| **ID** | CT-F05-LIM-NOME-MAX |
| **Descricao** | Nome com 255 caracteres |
| **Pre-condicoes** | Modal aberto |
| **Acoes do ator e dados de entrada** | Nome = string com 255 chars. Salvar. |
| **Saida esperada** | Sistema aceita. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |

### Combinados (Pairwise)

> Cobertura conforme IEEE 829 §3.4 — CTs cruzados de risco de regressao.

#### CT-F05-COMB-FE01-FE03 — CPF inválido E Email inválido no mesmo cadastro
| Campo | Valor |
|---|---|
| **ID** | CT-F05-COMB-FE01-FE03 |
| **Descricao** | CPF inválido E Email inválido no mesmo cadastro |
| **Pre-condicoes** | Modal aberto |
| **Acoes do ator e dados de entrada** | CPF='000.000.000-00', Email='semarroba'. Salvar. |
| **Saida esperada** | Sistema lista AMBOS os erros (CPF e Email) ou apenas o primeiro. |
| **Tipo** | Negativo |
| **Categoria** | Combinado |
| **RNs** | — |
| **Trilha sugerida** | e2e |

---

## [UC-F06] Listar, filtrar e inspecionar produtos

### Cenários (FP + FAs + FEs)

> Cobertura conforme IEEE 829 §3.1 — 1 CT por fluxo principal/alternativo/exceção. Para CTs detalhados ja documentados no V6 (CT-F06-01..NN), ver `CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V6.md`.

#### CT-F06-FP — Fluxo Principal do UC-F06
| Campo | Valor |
|---|---|
| **ID** | CT-F06-FP |
| **Descricao** | Fluxo Principal do UC-F06 |
| **Pre-condicoes** | Pre-condicoes do UC-F06 (ver V6 doc). Empresa CH Hospitalar selecionada para CONJUNTO1 (valida1). |
| **Acoes do ator e dados de entrada** | Executar sequencia de eventos canonica do UC-F06 com dados validos tipicos. Ver passos numerados na 'Sequencia de eventos' do UC-V6. |
| **Saida esperada** | Sistema retorna sucesso conforme 'Pos-condicoes' do UC-F06: persistencia OK, mensagem de feedback positivo, navegacao esperada. |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | RNs do UC |
| **Trilha sugerida** | visual |
#### CT-F06-FA01 — Nenhum produto cadastrado
| Campo | Valor |
|---|---|
| **ID** | CT-F06-FA01 |
| **Descricao** | Nenhum produto cadastrado |
| **Pre-condicoes** | Pre-condicoes do UC-F06; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. No Passo 2, sistema retorna lista vazia. 2. Tabela exibe "Nenhum produto encontrado" ou area vazia. 3. Badges de pipeline exibem contagem zero. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F06-FA02 — Filtro por area sem resultados
| Campo | Valor |
|---|---|
| **ID** | CT-F06-FA02 |
| **Descricao** | Filtro por area sem resultados |
| **Pre-condicoes** | Pre-condicoes do UC-F06; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario seleciona area que nao tem produtos associados. 2. Tabela exibe lista vazia para aquela area. 3. Usuario pode limpar o filtro para ver todos os produtos. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F06-FA03 — Busca por texto sem resultados
| Campo | Valor |
|---|---|
| **ID** | CT-F06-FA03 |
| **Descricao** | Busca por texto sem resultados |
| **Pre-condicoes** | Pre-condicoes do UC-F06; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario digita termo que nao existe em nenhum campo buscavel. 2. Tabela exibe lista vazia. 3. **Nota V5:** Se o termo existe em descricao mas nao no nome/fabricante/modelo, o filtro atual nao encontra. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F06-FA04 — Visualizacao de detalhe sem selecao previa
| Campo | Valor |
|---|---|
| **ID** | CT-F06-FA04 |
| **Descricao** | Visualizacao de detalhe sem selecao previa |
| **Pre-condicoes** | Pre-condicoes do UC-F06; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario clica diretamente no icone de acao (Eye) na tabela. 2. Sistema carrega o detalhe do produto correspondente. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F06-FE01 — Busca por "reagente" nao retorna resultados (bug conhecido)
| Campo | Valor |
|---|---|
| **ID** | CT-F06-FE01 |
| **Descricao** | Busca por "reagente" nao retorna resultados (bug conhecido) |
| **Pre-condicoes** | Pre-condicoes do UC-F06; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Produtos da empresa contem "reagente" na descricao ou subclasse, mas NAO no nome, fabricante ou modelo. 2. Filtro de texto nao encontra correspondencia. 3. **Correcao V5 (Arnaldo OBS-21):** Adicionar `p.descricao` ao filtro de busca no PortfolioPage.tsx. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F06-FE02 — Busca por "hematologia" nao retorna resultados (bug conhecido)
| Campo | Valor |
|---|---|
| **ID** | CT-F06-FE02 |
| **Descricao** | Busca por "hematologia" nao retorna resultados (bug conhecido) |
| **Pre-condicoes** | Pre-condicoes do UC-F06; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Produto "Kit Hemograma Sysmex XN" contem "hemograma" mas NAO "hematologia". 2. Busca por "hematologia" nao retorna resultado. 3. **Correcao V5 (Arnaldo OBS-22):** Usar "hemograma" como termo de busca, ou renomear produto. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F06-FE03 — Hierarquia Area/Classe/Subclasse nao carrega
| Campo | Valor |
|---|---|
| **ID** | CT-F06-FE03 |
| **Descricao** | Hierarquia Area/Classe/Subclasse nao carrega |
| **Pre-condicoes** | Pre-condicoes do UC-F06; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Endpoint `/api/areas-produto` retorna erro ou lista vazia. 2. Selects de filtro ficam desabilitados ou sem opcoes. 3. Usuario pode usar apenas a busca por texto. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F06-FE04 — Erro ao carregar detalhe do produto
| Campo | Valor |
|---|---|
| **ID** | CT-F06-FE04 |
| **Descricao** | Erro ao carregar detalhe do produto |
| **Pre-condicoes** | Pre-condicoes do UC-F06; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. `getProduto(id)` retorna erro (produto excluido, permissao negada). 2. Card de detalhes nao e exibido ou mostra mensagem de erro. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |

### Classes de Equivalência

> Cobertura conforme IEEE 829 §3.2.

#### CT-F06-CLS-BUSCA-ACENTO — Busca com acento (cardíaco)
| Campo | Valor |
|---|---|
| **ID** | CT-F06-CLS-BUSCA-ACENTO |
| **Descricao** | Busca com acento (cardíaco) |
| **Pre-condicoes** | PortfolioPage |
| **Acoes do ator e dados de entrada** | Digitar 'cardíaco' |
| **Saida esperada** | Listagem deve normalizar acentos e retornar 'cardiaco' e 'cardíaco'. |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F06-CLS-BUSCA-CASE — Busca em maiúscula vs minúscula
| Campo | Valor |
|---|---|
| **ID** | CT-F06-CLS-BUSCA-CASE |
| **Descricao** | Busca em maiúscula vs minúscula |
| **Pre-condicoes** | PortfolioPage |
| **Acoes do ator e dados de entrada** | Digitar 'BIOMOL' e depois 'biomol' |
| **Saida esperada** | Resultados idênticos (case-insensitive). |
| **Tipo** | Positivo |
| **Categoria** | Classe |
| **RNs** | — |
| **Trilha sugerida** | e2e |

### Fronteira / Boundary

> Cobertura conforme IEEE 829 §3.3.

#### CT-F06-LIM-BUSCA-VAZIA — Busca com termo vazio
| Campo | Valor |
|---|---|
| **ID** | CT-F06-LIM-BUSCA-VAZIA |
| **Descricao** | Busca com termo vazio |
| **Pre-condicoes** | PortfolioPage carregada |
| **Acoes do ator e dados de entrada** | Limpar campo de busca |
| **Saida esperada** | Listagem mostra TODOS os produtos. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F06-LIM-BUSCA-1CHAR — Busca com 1 caractere
| Campo | Valor |
|---|---|
| **ID** | CT-F06-LIM-BUSCA-1CHAR |
| **Descricao** | Busca com 1 caractere |
| **Pre-condicoes** | PortfolioPage |
| **Acoes do ator e dados de entrada** | Digitar 'r' |
| **Saida esperada** | Listagem filtra produtos cujo nome contém 'r'. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |

### Combinados (Pairwise)

> Cobertura conforme IEEE 829 §3.4 — CTs cruzados de risco de regressao.

#### CT-F06-COMB-FA02-FE01 — Filtro área X + busca termo Y sem resultado
| Campo | Valor |
|---|---|
| **ID** | CT-F06-COMB-FA02-FE01 |
| **Descricao** | Filtro área X + busca termo Y sem resultado |
| **Pre-condicoes** | PortfolioPage |
| **Acoes do ator e dados de entrada** | Filtrar Area=Cardiologia E buscar 'reagente' |
| **Saida esperada** | Listagem vazia. Mensagem 'Nenhum produto encontrado'. |
| **Tipo** | Positivo |
| **Categoria** | Combinado |
| **RNs** | — |
| **Trilha sugerida** | e2e |

---

## [UC-F07] Cadastrar produto por IA a partir de manual, IFU, folder, NFS, plano de contas ou website

### Cenários (FP + FAs + FEs)

> Cobertura conforme IEEE 829 §3.1 — 1 CT por fluxo principal/alternativo/exceção. Para CTs detalhados ja documentados no V6 (CT-F07-01..NN), ver `CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V6.md`.

#### CT-F07-FP — Fluxo Principal do UC-F07
| Campo | Valor |
|---|---|
| **ID** | CT-F07-FP |
| **Descricao** | Fluxo Principal do UC-F07 |
| **Pre-condicoes** | Pre-condicoes do UC-F07 (ver V6 doc). Empresa CH Hospitalar selecionada para CONJUNTO1 (valida1). |
| **Acoes do ator e dados de entrada** | Executar sequencia de eventos canonica do UC-F07 com dados validos tipicos. Ver passos numerados na 'Sequencia de eventos' do UC-V6. |
| **Saida esperada** | Sistema retorna sucesso conforme 'Pos-condicoes' do UC-F07: persistencia OK, mensagem de feedback positivo, navegacao esperada. |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | RNs do UC |
| **Trilha sugerida** | visual |
#### CT-F07-FA01 — Cadastro via website (sem arquivo)
| Campo | Valor |
|---|---|
| **ID** | CT-F07-FA01 |
| **Descricao** | Cadastro via website (sem arquivo) |
| **Pre-condicoes** | Pre-condicoes do UC-F07; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario seleciona tipo "Website". 2. Campos de upload de arquivo ficam ocultos. 3. Campo "URL do Website" aparece como obrigatorio. 4. Classificacao opcional nao e enviada no prompt para website. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F07-FA02 — Cadastro sem nome de produto (Plano de Contas)
| Campo | Valor |
|---|---|
| **ID** | CT-F07-FA02 |
| **Descricao** | Cadastro sem nome de produto (Plano de Contas) |
| **Pre-condicoes** | Pre-condicoes do UC-F07; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario seleciona tipo "Plano de Contas (ERP)". 2. Nao preenche campo "Nome do Produto". 3. Sistema aceita — nome e opcional para este tipo. 4. IA pode extrair multiplos itens do arquivo. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F07-FA03 — Classificacao nao informada
| Campo | Valor |
|---|---|
| **ID** | CT-F07-FA03 |
| **Descricao** | Classificacao nao informada |
| **Pre-condicoes** | Pre-condicoes do UC-F07; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario nao seleciona Area/Classe/Subclasse. 2. Sistema processa sem mascara tecnica — extracao e generica. 3. Produto cadastrado pode nao ter especificacoes detalhadas. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F07-FE01 — Servico de IA indisponivel
| Campo | Valor |
|---|---|
| **ID** | CT-F07-FE01 |
| **Descricao** | Servico de IA indisponivel |
| **Pre-condicoes** | Pre-condicoes do UC-F07; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario clica "Processar com IA" mas servico de chat/IA esta offline. 2. Sistema exibe [Toast] de erro: "Servico de IA indisponivel". 3. Nenhum produto e cadastrado. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F07-FE02 — Timeout no processamento de IA
| Campo | Valor |
|---|---|
| **ID** | CT-F07-FE02 |
| **Descricao** | Timeout no processamento de IA |
| **Pre-condicoes** | Pre-condicoes do UC-F07; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. IA demora mais de 90 segundos para responder. 2. Sistema pode exibir timeout ou spinner indefinido. 3. Usuario pode tentar novamente. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F07-FE03 — Arquivo corrompido ou ilegivel
| Campo | Valor |
|---|---|
| **ID** | CT-F07-FE03 |
| **Descricao** | Arquivo corrompido ou ilegivel |
| **Pre-condicoes** | Pre-condicoes do UC-F07; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario faz upload de PDF corrompido. 2. IA nao consegue extrair informacoes. 3. Resposta inline indica que nao foi possivel processar o documento. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F07-FE04 — URL de website invalida ou inacessivel
| Campo | Valor |
|---|---|
| **ID** | CT-F07-FE04 |
| **Descricao** | URL de website invalida ou inacessivel |
| **Pre-condicoes** | Pre-condicoes do UC-F07; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario informa URL que nao existe ou esta offline. 2. IA retorna erro de acesso. 3. Nenhum produto e cadastrado. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F07-FE05 — NCM extraido pela IA em formato invalido
| Campo | Valor |
|---|---|
| **ID** | CT-F07-FE05 |
| **Descricao** | NCM extraido pela IA em formato invalido |
| **Pre-condicoes** | Pre-condicoes do UC-F07; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. IA cadastra produto com NCM fora do formato XXXX.XX.XX. 2. Validacao RN-035 emite warning (modo warn-only). 3. Produto e cadastrado mas NCM pode precisar correcao manual. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | e2e |

### Classes de Equivalência

> Cobertura conforme IEEE 829 §3.2.

#### CT-F07-CLS-PDF — Upload PDF (canônico)
| Campo | Valor |
|---|---|
| **ID** | CT-F07-CLS-PDF |
| **Descricao** | Upload PDF (canônico) |
| **Pre-condicoes** | Modal cadastro IA aberto |
| **Acoes do ator e dados de entrada** | Selecionar arquivo .pdf válido. Submeter. |
| **Saida esperada** | IA processa e retorna dados extraídos. |
| **Tipo** | Positivo |
| **Categoria** | Classe |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F07-CLS-DOCX — Upload DOCX
| Campo | Valor |
|---|---|
| **ID** | CT-F07-CLS-DOCX |
| **Descricao** | Upload DOCX |
| **Pre-condicoes** | Modal aberto |
| **Acoes do ator e dados de entrada** | Selecionar .docx. Submeter. |
| **Saida esperada** | IA processa. |
| **Tipo** | Positivo |
| **Categoria** | Classe |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F07-CLS-XLSX — Upload XLSX (Plano de Contas)
| Campo | Valor |
|---|---|
| **ID** | CT-F07-CLS-XLSX |
| **Descricao** | Upload XLSX (Plano de Contas) |
| **Pre-condicoes** | Modal aberto |
| **Acoes do ator e dados de entrada** | Selecionar .xlsx. Submeter. |
| **Saida esperada** | IA processa via parser específico. |
| **Tipo** | Positivo |
| **Categoria** | Classe |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F07-CLS-URL-MAL-FORMADA — URL sem http/https
| Campo | Valor |
|---|---|
| **ID** | CT-F07-CLS-URL-MAL-FORMADA |
| **Descricao** | URL sem http/https |
| **Pre-condicoes** | Modal aberto |
| **Acoes do ator e dados de entrada** | URL = 'www.exemplo.com' |
| **Saida esperada** | Sistema rejeita ou normaliza adicionando 'https://'. |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F07-CLS-URL-LOCAL — URL localhost
| Campo | Valor |
|---|---|
| **ID** | CT-F07-CLS-URL-LOCAL |
| **Descricao** | URL localhost |
| **Pre-condicoes** | Modal aberto |
| **Acoes do ator e dados de entrada** | URL = 'http://localhost:3000' |
| **Saida esperada** | Sistema rejeita por segurança (URL não pública). |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | — |
| **Trilha sugerida** | e2e |

### Fronteira / Boundary

> Cobertura conforme IEEE 829 §3.3.

#### CT-F07-LIM-VAZIO — Submit sem arquivo nem URL
| Campo | Valor |
|---|---|
| **ID** | CT-F07-LIM-VAZIO |
| **Descricao** | Submit sem arquivo nem URL |
| **Pre-condicoes** | Modal aberto |
| **Acoes do ator e dados de entrada** | Clicar Submeter com tudo vazio |
| **Saida esperada** | Botão desabilitado ou erro 'Arquivo ou URL obrigatório'. |
| **Tipo** | Negativo |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | visual |

### Combinados (Pairwise)

> Cobertura conforme IEEE 829 §3.4 — CTs cruzados de risco de regressao.

#### CT-F07-COMB-FA01-FE04 — URL website inválida + servidor IA indisponível
| Campo | Valor |
|---|---|
| **ID** | CT-F07-COMB-FA01-FE04 |
| **Descricao** | URL website inválida + servidor IA indisponível |
| **Pre-condicoes** | Modal cadastro IA aberto |
| **Acoes do ator e dados de entrada** | URL='localhost'. Submit. IA está fora. |
| **Saida esperada** | Sistema bloqueia logo na URL ou tenta IA e retorna erro de conexão. |
| **Tipo** | Negativo |
| **Categoria** | Combinado |
| **RNs** | — |
| **Trilha sugerida** | e2e |

---

## [UC-F08] Editar produto e especificacoes tecnicas

### Cenários (FP + FAs + FEs)

> Cobertura conforme IEEE 829 §3.1 — 1 CT por fluxo principal/alternativo/exceção. Para CTs detalhados ja documentados no V6 (CT-F08-01..NN), ver `CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V6.md`.

#### CT-F08-FP — Fluxo Principal do UC-F08
| Campo | Valor |
|---|---|
| **ID** | CT-F08-FP |
| **Descricao** | Fluxo Principal do UC-F08 |
| **Pre-condicoes** | Pre-condicoes do UC-F08 (ver V6 doc). Empresa CH Hospitalar selecionada para CONJUNTO1 (valida1). |
| **Acoes do ator e dados de entrada** | Executar sequencia de eventos canonica do UC-F08 com dados validos tipicos. Ver passos numerados na 'Sequencia de eventos' do UC-V6. |
| **Saida esperada** | Sistema retorna sucesso conforme 'Pos-condicoes' do UC-F08: persistencia OK, mensagem de feedback positivo, navegacao esperada. |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | RNs do UC |
| **Trilha sugerida** | visual |
#### CT-F08-FA01 — Edicao apenas de dados basicos (sem alterar specs)
| Campo | Valor |
|---|---|
| **ID** | CT-F08-FA01 |
| **Descricao** | Edicao apenas de dados basicos (sem alterar specs) |
| **Pre-condicoes** | Pre-condicoes do UC-F08; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario altera somente nome, fabricante, modelo. 2. Nao modifica especificacoes tecnicas. 3. Sistema salva apenas os dados basicos. Specs permanecem inalteradas. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F08-FA02 — Mudanca de subclasse (mascara diferente)
| Campo | Valor |
|---|---|
| **ID** | CT-F08-FA02 |
| **Descricao** | Mudanca de subclasse (mascara diferente) |
| **Pre-condicoes** | Pre-condicoes do UC-F08; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario altera a subclasse do produto. 2. Sistema recarrega a mascara tecnica da nova subclasse. 3. Especificacoes anteriores que nao existem na nova mascara ficam orfas. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F08-FA03 — Cancelar edicao
| Campo | Valor |
|---|---|
| **ID** | CT-F08-FA03 |
| **Descricao** | Cancelar edicao |
| **Pre-condicoes** | Pre-condicoes do UC-F08; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario clica [Botao: "Cancelar"] no modal. 2. Modal fecha sem salvar alteracoes. 3. Dados originais permanecem. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F08-FE01 — NCM em formato invalido
| Campo | Valor |
|---|---|
| **ID** | CT-F08-FE01 |
| **Descricao** | NCM em formato invalido |
| **Pre-condicoes** | Pre-condicoes do UC-F08; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario digita NCM fora do padrao XXXX.XX.XX (ex: "901819"). 2. Validacao RN-035 rejeita ou emite warning. 3. Em modo enforce: registro NAO e salvo. Em modo warn: salva com warning no log. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F08-FE02 — Nome em branco (obrigatorio)
| Campo | Valor |
|---|---|
| **ID** | CT-F08-FE02 |
| **Descricao** | Nome em branco (obrigatorio) |
| **Pre-condicoes** | Pre-condicoes do UC-F08; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario apaga o nome e tenta salvar. 2. Sistema exibe erro de validacao. 3. Modal permanece aberto. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F08-FE03 — Caracteres especiais em especificacoes
| Campo | Valor |
|---|---|
| **ID** | CT-F08-FE03 |
| **Descricao** | Caracteres especiais em especificacoes |
| **Pre-condicoes** | Pre-condicoes do UC-F08; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario preenche spec com caracteres Unicode (ex: "37C", "10 uL"). 2. Sistema DEVE aceitar — campos tecnicos admitem Unicode. 3. Se rejeitar, e bug. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F08-FE04 — Erro de rede ao salvar
| Campo | Valor |
|---|---|
| **ID** | CT-F08-FE04 |
| **Descricao** | Erro de rede ao salvar |
| **Pre-condicoes** | Pre-condicoes do UC-F08; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Conexao cai durante PUT. 2. Modal permanece aberto com dados preenchidos. 3. Toast de erro exibido. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |

### Classes de Equivalência

> Cobertura conforme IEEE 829 §3.2.

#### CT-F08-CLS-NCM-FORMATO — NCM sem pontos (8 dígitos puros)
| Campo | Valor |
|---|---|
| **ID** | CT-F08-CLS-NCM-FORMATO |
| **Descricao** | NCM sem pontos (8 dígitos puros) |
| **Pre-condicoes** | Edição de produto |
| **Acoes do ator e dados de entrada** | NCM = '90183120'. Salvar. |
| **Saida esperada** | Sistema aceita e formata como '9018.31.20' na exibição. |
| **Tipo** | Positivo |
| **Categoria** | Classe |
| **RNs** | RN-035 |
| **Trilha sugerida** | e2e |
#### CT-F08-CLS-NCM-INVALIDO — NCM com 9 dígitos
| Campo | Valor |
|---|---|
| **ID** | CT-F08-CLS-NCM-INVALIDO |
| **Descricao** | NCM com 9 dígitos |
| **Pre-condicoes** | Edição |
| **Acoes do ator e dados de entrada** | NCM = '901831200'. Salvar. |
| **Saida esperada** | Sistema rejeita com RN-035 'NCM deve ter 8 dígitos'. |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | RN-035 |
| **Trilha sugerida** | e2e |

### Fronteira / Boundary

> Cobertura conforme IEEE 829 §3.3.

#### CT-F08-LIM-NCM-VAZIO — NCM vazio
| Campo | Valor |
|---|---|
| **ID** | CT-F08-LIM-NCM-VAZIO |
| **Descricao** | NCM vazio |
| **Pre-condicoes** | Edição |
| **Acoes do ator e dados de entrada** | NCM = ''. Salvar. |
| **Saida esperada** | Sistema aceita (NCM opcional). |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F08-LIM-SPECS-VAZIO — Specs vazias
| Campo | Valor |
|---|---|
| **ID** | CT-F08-LIM-SPECS-VAZIO |
| **Descricao** | Specs vazias |
| **Pre-condicoes** | Edição |
| **Acoes do ator e dados de entrada** | Apagar todas as specs. Salvar. |
| **Saida esperada** | Sistema aceita. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F08-LIM-SPECS-MAX — Specs com 5000 caracteres
| Campo | Valor |
|---|---|
| **ID** | CT-F08-LIM-SPECS-MAX |
| **Descricao** | Specs com 5000 caracteres |
| **Pre-condicoes** | Edição |
| **Acoes do ator e dados de entrada** | Specs = string com 5000 chars. Salvar. |
| **Saida esperada** | Sistema aceita ou trunca para limite máximo. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |

### Combinados (Pairwise)

> Cobertura conforme IEEE 829 §3.4 — CTs cruzados de risco de regressao.

#### CT-F08-COMB-FE01-FE03 — NCM inválido + caracteres especiais nas specs
| Campo | Valor |
|---|---|
| **ID** | CT-F08-COMB-FE01-FE03 |
| **Descricao** | NCM inválido + caracteres especiais nas specs |
| **Pre-condicoes** | Edição |
| **Acoes do ator e dados de entrada** | NCM='901831200', Specs='<script>alert(1)</script>' |
| **Saida esperada** | Sistema rejeita NCM. Specs com chars especiais devem ser escapados ou rejeitados. |
| **Tipo** | Negativo |
| **Categoria** | Combinado |
| **RNs** | — |
| **Trilha sugerida** | e2e |

---

## [UC-F09] Reprocessar especificacoes do produto com IA

### Cenários (FP + FAs + FEs)

> Cobertura conforme IEEE 829 §3.1 — 1 CT por fluxo principal/alternativo/exceção. Para CTs detalhados ja documentados no V6 (CT-F09-01..NN), ver `CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V6.md`.

#### CT-F09-FP — Fluxo Principal do UC-F09
| Campo | Valor |
|---|---|
| **ID** | CT-F09-FP |
| **Descricao** | Fluxo Principal do UC-F09 |
| **Pre-condicoes** | Pre-condicoes do UC-F09 (ver V6 doc). Empresa CH Hospitalar selecionada para CONJUNTO1 (valida1). |
| **Acoes do ator e dados de entrada** | Executar sequencia de eventos canonica do UC-F09 com dados validos tipicos. Ver passos numerados na 'Sequencia de eventos' do UC-V6. |
| **Saida esperada** | Sistema retorna sucesso conforme 'Pos-condicoes' do UC-F09: persistencia OK, mensagem de feedback positivo, navegacao esperada. |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | RNs do UC |
| **Trilha sugerida** | visual |
#### CT-F09-FA01 — Reprocessamento via card de detalhes
| Campo | Valor |
|---|---|
| **ID** | CT-F09-FA01 |
| **Descricao** | Reprocessamento via card de detalhes |
| **Pre-condicoes** | Pre-condicoes do UC-F09; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Em vez de usar o botao na tabela, usuario clica "Reprocessar IA" no card de detalhes. 2. Mesmo fluxo — diferenca e apenas o ponto de entrada. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F09-FE01 — Servico de chat/IA indisponivel
| Campo | Valor |
|---|---|
| **ID** | CT-F09-FE01 |
| **Descricao** | Servico de chat/IA indisponivel |
| **Pre-condicoes** | Pre-condicoes do UC-F09; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Sistema tenta enviar mensagem para o chat mas servico esta offline. 2. Nenhum feedback visual claro pode ser exibido (depende do subsistema). 3. Dados do produto permanecem inalterados. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F09-FE02 — IA apaga dados manuais
| Campo | Valor |
|---|---|
| **ID** | CT-F09-FE02 |
| **Descricao** | IA apaga dados manuais |
| **Pre-condicoes** | Pre-condicoes do UC-F09; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Reprocessamento sobrescreve especificacoes inseridas manualmente. 2. **Atencao:** Este e um risco conhecido. O ideal e que a IA complemente, nao substitua. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F09-FE03 — Timeout no processamento
| Campo | Valor |
|---|---|
| **ID** | CT-F09-FE03 |
| **Descricao** | Timeout no processamento |
| **Pre-condicoes** | Pre-condicoes do UC-F09; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. IA demora mais de 90 segundos. 2. Lista pode nao atualizar. 3. Usuario pode clicar "Atualizar" manualmente. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |

### Classes de Equivalência

> Cobertura conforme IEEE 829 §3.2.

#### CT-F09-CLS-PROD-INVALIDO — ID de produto inexistente
| Campo | Valor |
|---|---|
| **ID** | CT-F09-CLS-PROD-INVALIDO |
| **Descricao** | ID de produto inexistente |
| **Pre-condicoes** | Listagem |
| **Acoes do ator e dados de entrada** | Forçar via dev tools chamada de reprocessar com produto_id = 99999 |
| **Saida esperada** | Sistema retorna 404. |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | — |
| **Trilha sugerida** | e2e |

---

## [UC-F10] Consultar ANVISA e busca web a partir da tela de portfolio

### Cenários (FP + FAs + FEs)

> Cobertura conforme IEEE 829 §3.1 — 1 CT por fluxo principal/alternativo/exceção. Para CTs detalhados ja documentados no V6 (CT-F10-01..NN), ver `CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V6.md`.

#### CT-F10-FP — Fluxo Principal do UC-F10
| Campo | Valor |
|---|---|
| **ID** | CT-F10-FP |
| **Descricao** | Fluxo Principal do UC-F10 |
| **Pre-condicoes** | Pre-condicoes do UC-F10 (ver V6 doc). Empresa CH Hospitalar selecionada para CONJUNTO1 (valida1). |
| **Acoes do ator e dados de entrada** | Executar sequencia de eventos canonica do UC-F10 com dados validos tipicos. Ver passos numerados na 'Sequencia de eventos' do UC-V6. |
| **Saida esperada** | Sistema retorna sucesso conforme 'Pos-condicoes' do UC-F10: persistencia OK, mensagem de feedback positivo, navegacao esperada. |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | RNs do UC |
| **Trilha sugerida** | visual |
#### CT-F10-FA01 — Busca ANVISA somente por nome (sem numero)
| Campo | Valor |
|---|---|
| **ID** | CT-F10-FA01 |
| **Descricao** | Busca ANVISA somente por nome (sem numero) |
| **Pre-condicoes** | Pre-condicoes do UC-F10; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario nao informa numero de registro. 2. Informa apenas o nome do produto. 3. IA busca por nome — resultados podem ser multiplos. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F10-FA02 — Busca web sem fabricante
| Campo | Valor |
|---|---|
| **ID** | CT-F10-FA02 |
| **Descricao** | Busca web sem fabricante |
| **Pre-condicoes** | Pre-condicoes do UC-F10; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario nao informa fabricante (campo opcional). 2. IA busca apenas pelo nome do produto. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F10-FE01 — Registro ANVISA nao encontrado
| Campo | Valor |
|---|---|
| **ID** | CT-F10-FE01 |
| **Descricao** | Registro ANVISA nao encontrado |
| **Pre-condicoes** | Pre-condicoes do UC-F10; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Numero informado nao existe na base ANVISA. 2. IA retorna mensagem informativa: "Registro nao encontrado". 3. Nenhum dado e atualizado. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F10-FE02 — Busca web sem resultados
| Campo | Valor |
|---|---|
| **ID** | CT-F10-FE02 |
| **Descricao** | Busca web sem resultados |
| **Pre-condicoes** | Pre-condicoes do UC-F10; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Nome do produto muito especifico ou inexistente na web. 2. IA retorna: "Nenhum resultado encontrado". |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F10-FE03 — Servico de IA indisponivel
| Campo | Valor |
|---|---|
| **ID** | CT-F10-FE03 |
| **Descricao** | Servico de IA indisponivel |
| **Pre-condicoes** | Pre-condicoes do UC-F10; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Chat offline. Modal nao retorna resposta. 2. Toast de erro exibido. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |

### Fronteira / Boundary

> Cobertura conforme IEEE 829 §3.3.

#### CT-F10-LIM-TERMO-VAZIO — Termo de busca vazio
| Campo | Valor |
|---|---|
| **ID** | CT-F10-LIM-TERMO-VAZIO |
| **Descricao** | Termo de busca vazio |
| **Pre-condicoes** | PortfolioPage |
| **Acoes do ator e dados de entrada** | Buscar com termo = '' |
| **Saida esperada** | Sistema bloqueia chamada ou retorna 'Termo obrigatório'. |
| **Tipo** | Negativo |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F10-LIM-TERMO-1CHAR — Termo com 1 caractere
| Campo | Valor |
|---|---|
| **ID** | CT-F10-LIM-TERMO-1CHAR |
| **Descricao** | Termo com 1 caractere |
| **Pre-condicoes** | PortfolioPage |
| **Acoes do ator e dados de entrada** | Buscar = 'a' |
| **Saida esperada** | Sistema busca (resultados podem ser ruins, mas não bloqueia). |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |

---

## [UC-F11] Verificar completude tecnica do produto

### Cenários (FP + FAs + FEs)

> Cobertura conforme IEEE 829 §3.1 — 1 CT por fluxo principal/alternativo/exceção. Para CTs detalhados ja documentados no V6 (CT-F11-01..NN), ver `CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V6.md`.

#### CT-F11-FP — Fluxo Principal do UC-F11
| Campo | Valor |
|---|---|
| **ID** | CT-F11-FP |
| **Descricao** | Fluxo Principal do UC-F11 |
| **Pre-condicoes** | Pre-condicoes do UC-F11 (ver V6 doc). Empresa CH Hospitalar selecionada para CONJUNTO1 (valida1). |
| **Acoes do ator e dados de entrada** | Executar sequencia de eventos canonica do UC-F11 com dados validos tipicos. Ver passos numerados na 'Sequencia de eventos' do UC-V6. |
| **Saida esperada** | Sistema retorna sucesso conforme 'Pos-condicoes' do UC-F11: persistencia OK, mensagem de feedback positivo, navegacao esperada. |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | RNs do UC |
| **Trilha sugerida** | visual |
#### CT-F11-FA01 — Produto sem subclasse
| Campo | Valor |
|---|---|
| **ID** | CT-F11-FA01 |
| **Descricao** | Produto sem subclasse |
| **Pre-condicoes** | Pre-condicoes do UC-F11; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. No Passo 5, produto nao tem subclasse atribuida. 2. Score de Especificacoes = 0%. 3. Alerta informativo e exibido. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F11-FA02 — Produto com todas as specs preenchidas
| Campo | Valor |
|---|---|
| **ID** | CT-F11-FA02 |
| **Descricao** | Produto com todas as specs preenchidas |
| **Pre-condicoes** | Pre-condicoes do UC-F11; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Score Geral >= 80%. 2. Todos os indicadores em verde. 3. Nenhuma acao adicional necessaria. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F11-FE01 — Endpoint de completude indisponivel
| Campo | Valor |
|---|---|
| **ID** | CT-F11-FE01 |
| **Descricao** | Endpoint de completude indisponivel |
| **Pre-condicoes** | Pre-condicoes do UC-F11; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. `getProdutoCompletude(id)` retorna erro. 2. Modal nao abre ou exibe mensagem de erro. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F11-FE02 — Produto excluido entre listagem e verificacao
| Campo | Valor |
|---|---|
| **ID** | CT-F11-FE02 |
| **Descricao** | Produto excluido entre listagem e verificacao |
| **Pre-condicoes** | Pre-condicoes do UC-F11; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Produto foi excluido por outro usuario enquanto o atual tenta verificar completude. 2. Endpoint retorna 404. 3. Toast de erro exibido. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |

---

## [UC-F12] Reprocessar metadados de captacao do produto

### Cenários (FP + FAs + FEs)

> Cobertura conforme IEEE 829 §3.1 — 1 CT por fluxo principal/alternativo/exceção. Para CTs detalhados ja documentados no V6 (CT-F12-01..NN), ver `CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V6.md`.

#### CT-F12-FP — Fluxo Principal do UC-F12
| Campo | Valor |
|---|---|
| **ID** | CT-F12-FP |
| **Descricao** | Fluxo Principal do UC-F12 |
| **Pre-condicoes** | Pre-condicoes do UC-F12 (ver V6 doc). Empresa CH Hospitalar selecionada para CONJUNTO1 (valida1). |
| **Acoes do ator e dados de entrada** | Executar sequencia de eventos canonica do UC-F12 com dados validos tipicos. Ver passos numerados na 'Sequencia de eventos' do UC-V6. |
| **Saida esperada** | Sistema retorna sucesso conforme 'Pos-condicoes' do UC-F12: persistencia OK, mensagem de feedback positivo, navegacao esperada. |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | RNs do UC |
| **Trilha sugerida** | visual |
#### CT-F12-FA01 — Metadados ja existentes
| Campo | Valor |
|---|---|
| **ID** | CT-F12-FA01 |
| **Descricao** | Metadados ja existentes |
| **Pre-condicoes** | Pre-condicoes do UC-F12; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Ao expandir toggle, metadados ja estao preenchidos. 2. Usuario pode optar por nao reprocessar. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F12-FE01 — Endpoint de reprocessamento indisponivel
| Campo | Valor |
|---|---|
| **ID** | CT-F12-FE01 |
| **Descricao** | Endpoint de reprocessamento indisponivel |
| **Pre-condicoes** | Pre-condicoes do UC-F12; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. `reprocessarMetadados(produtoId)` retorna erro. 2. Toast de erro exibido. 3. Metadados anteriores permanecem. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F12-FE02 — Produto sem dados suficientes para metadados
| Campo | Valor |
|---|---|
| **ID** | CT-F12-FE02 |
| **Descricao** | Produto sem dados suficientes para metadados |
| **Pre-condicoes** | Pre-condicoes do UC-F12; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Produto nao tem nome, fabricante ou descricao suficientes. 2. Reprocessamento retorna metadados vazios ou parciais. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |

---

## [UC-F13] Consultar classificacao e funil de monitoramento

### Cenários (FP + FAs + FEs)

> Cobertura conforme IEEE 829 §3.1 — 1 CT por fluxo principal/alternativo/exceção. Para CTs detalhados ja documentados no V6 (CT-F13-01..NN), ver `CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V6.md`.

#### CT-F13-FP — Fluxo Principal do UC-F13
| Campo | Valor |
|---|---|
| **ID** | CT-F13-FP |
| **Descricao** | Fluxo Principal do UC-F13 |
| **Pre-condicoes** | Pre-condicoes do UC-F13 (ver V6 doc). Empresa CH Hospitalar selecionada para CONJUNTO1 (valida1). |
| **Acoes do ator e dados de entrada** | Executar sequencia de eventos canonica do UC-F13 com dados validos tipicos. Ver passos numerados na 'Sequencia de eventos' do UC-V6. |
| **Saida esperada** | Sistema retorna sucesso conforme 'Pos-condicoes' do UC-F13: persistencia OK, mensagem de feedback positivo, navegacao esperada. |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | RNs do UC |
| **Trilha sugerida** | visual |
#### CT-F13-FA01 — Nenhuma area cadastrada
| Campo | Valor |
|---|---|
| **ID** | CT-F13-FA01 |
| **Descricao** | Nenhuma area cadastrada |
| **Pre-condicoes** | Pre-condicoes do UC-F13; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. No Passo 2, lista de areas esta vazia. 2. Card exibe mensagem informativa: "Nenhuma classificacao cadastrada". |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F13-FA02 — Agente de monitoramento inativo
| Campo | Valor |
|---|---|
| **ID** | CT-F13-FA02 |
| **Descricao** | Agente de monitoramento inativo |
| **Pre-condicoes** | Pre-condicoes do UC-F13; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. No Passo 5, badge mostra "Agente Inativo". 2. Comportamento esperado se monitoramento nao foi configurado. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F13-FE01 — Erro ao carregar hierarquia
| Campo | Valor |
|---|---|
| **ID** | CT-F13-FE01 |
| **Descricao** | Erro ao carregar hierarquia |
| **Pre-condicoes** | Pre-condicoes do UC-F13; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Endpoint de areas/classes retorna erro. 2. Card exibe mensagem de erro. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |

---

## [UC-F14] Configurar pesos e limiares de score

### Cenários (FP + FAs + FEs)

> Cobertura conforme IEEE 829 §3.1 — 1 CT por fluxo principal/alternativo/exceção. Para CTs detalhados ja documentados no V6 (CT-F14-01..NN), ver `CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V6.md`.

#### CT-F14-FP — Fluxo Principal do UC-F14
| Campo | Valor |
|---|---|
| **ID** | CT-F14-FP |
| **Descricao** | Fluxo Principal do UC-F14 |
| **Pre-condicoes** | Pre-condicoes do UC-F14 (ver V6 doc). Empresa CH Hospitalar selecionada para CONJUNTO1 (valida1). |
| **Acoes do ator e dados de entrada** | Executar sequencia de eventos canonica do UC-F14 com dados validos tipicos. Ver passos numerados na 'Sequencia de eventos' do UC-V6. |
| **Saida esperada** | Sistema retorna sucesso conforme 'Pos-condicoes' do UC-F14: persistencia OK, mensagem de feedback positivo, navegacao esperada. |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | RNs do UC |
| **Trilha sugerida** | visual |
#### CT-F14-FA01 — Pesos ja configurados anteriormente
| Campo | Valor |
|---|---|
| **ID** | CT-F14-FA01 |
| **Descricao** | Pesos ja configurados anteriormente |
| **Pre-condicoes** | Pre-condicoes do UC-F14; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. No Passo 2, campos ja estao preenchidos com valores anteriores. 2. Usuario ajusta conforme necessario. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F14-FA02 — Apenas limiares alterados (pesos mantidos)
| Campo | Valor |
|---|---|
| **ID** | CT-F14-FA02 |
| **Descricao** | Apenas limiares alterados (pesos mantidos) |
| **Pre-condicoes** | Pre-condicoes do UC-F14; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario nao altera pesos. 2. Apenas ajusta limiares e clica "Salvar Limiares". 3. Pesos permanecem inalterados. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F14-FE01 — Soma dos pesos diferente de 1.00
| Campo | Valor |
|---|---|
| **ID** | CT-F14-FE01 |
| **Descricao** | Soma dos pesos diferente de 1.00 |
| **Pre-condicoes** | Pre-condicoes do UC-F14; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. No Passo 4, soma dos 6 pesos != 1.00 (ex: 1.05). 2. [Indicador: soma] exibe valor em vermelho. 3. Sistema exibe alerta e NAO salva os pesos. 4. Usuario deve corrigir os valores. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F14-FE02 — Limiar GO menor que limiar NO-GO
| Campo | Valor |
|---|---|
| **ID** | CT-F14-FE02 |
| **Descricao** | Limiar GO menor que limiar NO-GO |
| **Pre-condicoes** | Pre-condicoes do UC-F14; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario configura GO < NO-GO (ex: GO=0.40, NO-GO=0.70). 2. Configuracao inconsistente — comportamento do sistema pode ser imprevisivel. 3. Idealmente sistema deveria validar e alertar. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F14-FE03 — Erro ao salvar (servidor indisponivel)
| Campo | Valor |
|---|---|
| **ID** | CT-F14-FE03 |
| **Descricao** | Erro ao salvar (servidor indisponivel) |
| **Pre-condicoes** | Pre-condicoes do UC-F14; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Backend nao responde ao PUT. 2. Toast de erro exibido. 3. Dados permanecem no formulario. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |

### Classes de Equivalência

> Cobertura conforme IEEE 829 §3.2.

#### CT-F14-CLS-PESO-NEGATIVO — Peso negativo
| Campo | Valor |
|---|---|
| **ID** | CT-F14-CLS-PESO-NEGATIVO |
| **Descricao** | Peso negativo |
| **Pre-condicoes** | ParametrizacoesPage |
| **Acoes do ator e dados de entrada** | P1 = -0.5 |
| **Saida esperada** | Sistema rejeita. |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F14-CLS-PESO-MAIOR-1 — Peso > 1.00
| Campo | Valor |
|---|---|
| **ID** | CT-F14-CLS-PESO-MAIOR-1 |
| **Descricao** | Peso > 1.00 |
| **Pre-condicoes** | ParametrizacoesPage |
| **Acoes do ator e dados de entrada** | P1 = 1.5 |
| **Saida esperada** | Sistema rejeita. |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | — |
| **Trilha sugerida** | e2e |

### Fronteira / Boundary

> Cobertura conforme IEEE 829 §3.3.

#### CT-F14-LIM-PESOS-ZERO — Todos os pesos = 0
| Campo | Valor |
|---|---|
| **ID** | CT-F14-LIM-PESOS-ZERO |
| **Descricao** | Todos os pesos = 0 |
| **Pre-condicoes** | ParametrizacoesPage |
| **Acoes do ator e dados de entrada** | Definir todos os 5 pesos = 0. Salvar. |
| **Saida esperada** | Sistema rejeita — soma deve ser 1.00. |
| **Tipo** | Negativo |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F14-LIM-PESO-UM — Um peso = 1.00 (resto = 0)
| Campo | Valor |
|---|---|
| **ID** | CT-F14-LIM-PESO-UM |
| **Descricao** | Um peso = 1.00 (resto = 0) |
| **Pre-condicoes** | ParametrizacoesPage |
| **Acoes do ator e dados de entrada** | P1=1.00, demais=0. Salvar. |
| **Saida esperada** | Sistema aceita — soma é 1.00. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F14-LIM-LIMIARES-IGUAIS — Limiar GO = NO-GO
| Campo | Valor |
|---|---|
| **ID** | CT-F14-LIM-LIMIARES-IGUAIS |
| **Descricao** | Limiar GO = NO-GO |
| **Pre-condicoes** | ParametrizacoesPage |
| **Acoes do ator e dados de entrada** | GO = 0.5, NO-GO = 0.5 |
| **Saida esperada** | Sistema rejeita — devem ser distintos. |
| **Tipo** | Negativo |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |

### Combinados (Pairwise)

> Cobertura conforme IEEE 829 §3.4 — CTs cruzados de risco de regressao.

#### CT-F14-COMB-FE01-FE02 — Soma pesos != 1 E limiar GO < NO-GO
| Campo | Valor |
|---|---|
| **ID** | CT-F14-COMB-FE01-FE02 |
| **Descricao** | Soma pesos != 1 E limiar GO < NO-GO |
| **Pre-condicoes** | ParametrizacoesPage |
| **Acoes do ator e dados de entrada** | Pesos somando 0.9 E GO=0.3, NO-GO=0.5. Salvar. |
| **Saida esperada** | Sistema rejeita com 2 erros listados. |
| **Tipo** | Negativo |
| **Categoria** | Combinado |
| **RNs** | — |
| **Trilha sugerida** | e2e |

---

## [UC-F15] Configurar parametros comerciais, regioes e modalidades

### Cenários (FP + FAs + FEs)

> Cobertura conforme IEEE 829 §3.1 — 1 CT por fluxo principal/alternativo/exceção. Para CTs detalhados ja documentados no V6 (CT-F15-01..NN), ver `CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V6.md`.

#### CT-F15-FP — Fluxo Principal do UC-F15
| Campo | Valor |
|---|---|
| **ID** | CT-F15-FP |
| **Descricao** | Fluxo Principal do UC-F15 |
| **Pre-condicoes** | Pre-condicoes do UC-F15 (ver V6 doc). Empresa CH Hospitalar selecionada para CONJUNTO1 (valida1). |
| **Acoes do ator e dados de entrada** | Executar sequencia de eventos canonica do UC-F15 com dados validos tipicos. Ver passos numerados na 'Sequencia de eventos' do UC-V6. |
| **Saida esperada** | Sistema retorna sucesso conforme 'Pos-condicoes' do UC-F15: persistencia OK, mensagem de feedback positivo, navegacao esperada. |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | RNs do UC |
| **Trilha sugerida** | visual |
#### CT-F15-FA01 — Marcar "Atuar em todo o Brasil"
| Campo | Valor |
|---|---|
| **ID** | CT-F15-FA01 |
| **Descricao** | Marcar "Atuar em todo o Brasil" |
| **Pre-condicoes** | Pre-condicoes do UC-F15; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario marca checkbox "Atuar em todo o Brasil". 2. Todos os 27 estados ficam selecionados automaticamente. 3. Botoes individuais de UF podem ficar desabilitados. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F15-FA02 — Selecao de estados individuais
| Campo | Valor |
|---|---|
| **ID** | CT-F15-FA02 |
| **Descricao** | Selecao de estados individuais |
| **Pre-condicoes** | Pre-condicoes do UC-F15; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario NAO marca "Todo o Brasil". 2. Seleciona estados individuais clicando em cada botao UF. 3. Apenas os estados clicados ficam ativos. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F15-FA03 — Nenhuma modalidade selecionada
| Campo | Valor |
|---|---|
| **ID** | CT-F15-FA03 |
| **Descricao** | Nenhuma modalidade selecionada |
| **Pre-condicoes** | Pre-condicoes do UC-F15; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario nao marca nenhuma modalidade. 2. Sistema aceita — modalidades sao opcionais. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F15-FE01 — Valor de mercado negativo
| Campo | Valor |
|---|---|
| **ID** | CT-F15-FE01 |
| **Descricao** | Valor de mercado negativo |
| **Pre-condicoes** | Pre-condicoes do UC-F15; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario informa TAM/SAM/SOM com valor negativo. 2. Sistema deveria validar (valores devem ser >= 0). |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F15-FE02 — Markup acima de 100%
| Campo | Valor |
|---|---|
| **ID** | CT-F15-FE02 |
| **Descricao** | Markup acima de 100% |
| **Pre-condicoes** | Pre-condicoes do UC-F15; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario informa markup = 200. 2. Sistema aceita — nao ha limite superior implementado. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F15-FE03 — Erro ao salvar bloco individual
| Campo | Valor |
|---|---|
| **ID** | CT-F15-FE03 |
| **Descricao** | Erro ao salvar bloco individual |
| **Pre-condicoes** | Pre-condicoes do UC-F15; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Um dos botoes "Salvar" falha. 2. Toast de erro para aquele bloco especifico. 3. Demais blocos permanecem inalterados. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |

### Fronteira / Boundary

> Cobertura conforme IEEE 829 §3.3.

#### CT-F15-LIM-VALOR-ZERO — Valor de mercado = 0
| Campo | Valor |
|---|---|
| **ID** | CT-F15-LIM-VALOR-ZERO |
| **Descricao** | Valor de mercado = 0 |
| **Pre-condicoes** | ParametrizacoesPage |
| **Acoes do ator e dados de entrada** | Valor = 0,00. Salvar. |
| **Saida esperada** | Sistema aceita. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F15-LIM-VALOR-MAX — Valor de mercado = R$ 999.999.999.999
| Campo | Valor |
|---|---|
| **ID** | CT-F15-LIM-VALOR-MAX |
| **Descricao** | Valor de mercado = R$ 999.999.999.999 |
| **Pre-condicoes** | ParametrizacoesPage |
| **Acoes do ator e dados de entrada** | Valor extremo. Salvar. |
| **Saida esperada** | Sistema aceita. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F15-LIM-MARKUP-ZERO — Markup = 0
| Campo | Valor |
|---|---|
| **ID** | CT-F15-LIM-MARKUP-ZERO |
| **Descricao** | Markup = 0 |
| **Pre-condicoes** | ParametrizacoesPage |
| **Acoes do ator e dados de entrada** | Markup = 0%. Salvar. |
| **Saida esperada** | Sistema aceita. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F15-LIM-MARKUP-100 — Markup = 100%
| Campo | Valor |
|---|---|
| **ID** | CT-F15-LIM-MARKUP-100 |
| **Descricao** | Markup = 100% |
| **Pre-condicoes** | ParametrizacoesPage |
| **Acoes do ator e dados de entrada** | Markup = 100%. Salvar. |
| **Saida esperada** | Sistema aceita. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F15-LIM-MARKUP-101 — Markup = 101%
| Campo | Valor |
|---|---|
| **ID** | CT-F15-LIM-MARKUP-101 |
| **Descricao** | Markup = 101% |
| **Pre-condicoes** | ParametrizacoesPage |
| **Acoes do ator e dados de entrada** | Markup = 101%. Salvar. |
| **Saida esperada** | Sistema rejeita (acima do máximo permitido). |
| **Tipo** | Negativo |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |

### Combinados (Pairwise)

> Cobertura conforme IEEE 829 §3.4 — CTs cruzados de risco de regressao.

#### CT-F15-COMB-FA01-FE01 — Atuar todo Brasil + valor de mercado negativo
| Campo | Valor |
|---|---|
| **ID** | CT-F15-COMB-FA01-FE01 |
| **Descricao** | Atuar todo Brasil + valor de mercado negativo |
| **Pre-condicoes** | ParametrizacoesPage |
| **Acoes do ator e dados de entrada** | Marcar 'Todo Brasil' + Valor = -1000. Salvar. |
| **Saida esperada** | Sistema rejeita por valor negativo. |
| **Tipo** | Negativo |
| **Categoria** | Combinado |
| **RNs** | — |
| **Trilha sugerida** | e2e |

---

## [UC-F16] Configurar fontes, palavras-chave e NCMs de busca

### Cenários (FP + FAs + FEs)

> Cobertura conforme IEEE 829 §3.1 — 1 CT por fluxo principal/alternativo/exceção. Para CTs detalhados ja documentados no V6 (CT-F16-01..NN), ver `CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V6.md`.

#### CT-F16-FP — Fluxo Principal do UC-F16
| Campo | Valor |
|---|---|
| **ID** | CT-F16-FP |
| **Descricao** | Fluxo Principal do UC-F16 |
| **Pre-condicoes** | Pre-condicoes do UC-F16 (ver V6 doc). Empresa CH Hospitalar selecionada para CONJUNTO1 (valida1). |
| **Acoes do ator e dados de entrada** | Executar sequencia de eventos canonica do UC-F16 com dados validos tipicos. Ver passos numerados na 'Sequencia de eventos' do UC-V6. |
| **Saida esperada** | Sistema retorna sucesso conforme 'Pos-condicoes' do UC-F16: persistencia OK, mensagem de feedback positivo, navegacao esperada. |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | RNs do UC |
| **Trilha sugerida** | visual |
#### CT-F16-FA01 — Desativar e reativar fonte
| Campo | Valor |
|---|---|
| **ID** | CT-F16-FA01 |
| **Descricao** | Desativar e reativar fonte |
| **Pre-condicoes** | Pre-condicoes do UC-F16; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario clica [Icone-Acao: Pause] em fonte ativa. 2. Badge muda para "Inativa". 3. Usuario clica novamente [Icone-Acao: Play] para reativar. 4. Badge retorna para "Ativa". |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F16-FA02 — Nenhuma palavra-chave definida
| Campo | Valor |
|---|---|
| **ID** | CT-F16-FA02 |
| **Descricao** | Nenhuma palavra-chave definida |
| **Pre-condicoes** | Pre-condicoes do UC-F16; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario salva lista de palavras-chave vazia. 2. Sistema aceita — buscas podem ser feitas apenas por NCM. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F16-FE01 — NCM em formato invalido
| Campo | Valor |
|---|---|
| **ID** | CT-F16-FE01 |
| **Descricao** | NCM em formato invalido |
| **Pre-condicoes** | Pre-condicoes do UC-F16; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario digita NCM sem pontos (ex: "90181990"). 2. Sistema deveria validar formato XXXX.XX.XX (RN-035). 3. Se aceito sem validacao, NCM pode nao funcionar na busca. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F16-FE02 — Todas as fontes desativadas
| Campo | Valor |
|---|---|
| **ID** | CT-F16-FE02 |
| **Descricao** | Todas as fontes desativadas |
| **Pre-condicoes** | Pre-condicoes do UC-F16; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario desativa todas as fontes. 2. Sistema aceita — porem nenhuma busca automatica sera executada. 3. Idealmente sistema deveria alertar. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F16-FE03 — Erro ao salvar palavras-chave
| Campo | Valor |
|---|---|
| **ID** | CT-F16-FE03 |
| **Descricao** | Erro ao salvar palavras-chave |
| **Pre-condicoes** | Pre-condicoes do UC-F16; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Backend retorna erro ao persistir. 2. Toast de erro exibido. 3. Lista anterior permanece. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |

### Classes de Equivalência

> Cobertura conforme IEEE 829 §3.2.

#### CT-F16-CLS-NCM-FORMATO — NCM sem pontos no filtro
| Campo | Valor |
|---|---|
| **ID** | CT-F16-CLS-NCM-FORMATO |
| **Descricao** | NCM sem pontos no filtro |
| **Pre-condicoes** | ParametrizacoesPage > Fontes |
| **Acoes do ator e dados de entrada** | Adicionar NCM = '90183120' |
| **Saida esperada** | Sistema aceita e formata. |
| **Tipo** | Positivo |
| **Categoria** | Classe |
| **RNs** | RN-035 |
| **Trilha sugerida** | e2e |
#### CT-F16-CLS-NCM-INVALIDO — NCM com 9 dígitos
| Campo | Valor |
|---|---|
| **ID** | CT-F16-CLS-NCM-INVALIDO |
| **Descricao** | NCM com 9 dígitos |
| **Pre-condicoes** | ParametrizacoesPage > Fontes |
| **Acoes do ator e dados de entrada** | Adicionar NCM = '901831200' |
| **Saida esperada** | Sistema rejeita. |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | RN-035 |
| **Trilha sugerida** | e2e |

### Fronteira / Boundary

> Cobertura conforme IEEE 829 §3.3.

#### CT-F16-LIM-PALAVRAS-VAZIO — Lista de palavras-chave vazia
| Campo | Valor |
|---|---|
| **ID** | CT-F16-LIM-PALAVRAS-VAZIO |
| **Descricao** | Lista de palavras-chave vazia |
| **Pre-condicoes** | ParametrizacoesPage > Palavras-chave |
| **Acoes do ator e dados de entrada** | Não adicionar nenhuma. Salvar. |
| **Saida esperada** | Sistema aceita. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F16-LIM-PALAVRAS-1 — Apenas 1 palavra-chave
| Campo | Valor |
|---|---|
| **ID** | CT-F16-LIM-PALAVRAS-1 |
| **Descricao** | Apenas 1 palavra-chave |
| **Pre-condicoes** | ParametrizacoesPage |
| **Acoes do ator e dados de entrada** | Adicionar 1 palavra. Salvar. |
| **Saida esperada** | Sistema aceita. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F16-LIM-PALAVRAS-100 — 100 palavras-chave
| Campo | Valor |
|---|---|
| **ID** | CT-F16-LIM-PALAVRAS-100 |
| **Descricao** | 100 palavras-chave |
| **Pre-condicoes** | ParametrizacoesPage |
| **Acoes do ator e dados de entrada** | Adicionar 100 palavras. Salvar. |
| **Saida esperada** | Sistema aceita ou rejeita por limite. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |

---

## [UC-F17] Configurar notificacoes e preferencias

### Cenários (FP + FAs + FEs)

> Cobertura conforme IEEE 829 §3.1 — 1 CT por fluxo principal/alternativo/exceção. Para CTs detalhados ja documentados no V6 (CT-F17-01..NN), ver `CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V6.md`.

#### CT-F17-FP — Fluxo Principal do UC-F17
| Campo | Valor |
|---|---|
| **ID** | CT-F17-FP |
| **Descricao** | Fluxo Principal do UC-F17 |
| **Pre-condicoes** | Pre-condicoes do UC-F17 (ver V6 doc). Empresa CH Hospitalar selecionada para CONJUNTO1 (valida1). |
| **Acoes do ator e dados de entrada** | Executar sequencia de eventos canonica do UC-F17 com dados validos tipicos. Ver passos numerados na 'Sequencia de eventos' do UC-V6. |
| **Saida esperada** | Sistema retorna sucesso conforme 'Pos-condicoes' do UC-F17: persistencia OK, mensagem de feedback positivo, navegacao esperada. |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | RNs do UC |
| **Trilha sugerida** | visual |
#### CT-F17-FA01 — Apenas notificacoes alteradas (preferencias mantidas)
| Campo | Valor |
|---|---|
| **ID** | CT-F17-FA01 |
| **Descricao** | Apenas notificacoes alteradas (preferencias mantidas) |
| **Pre-condicoes** | Pre-condicoes do UC-F17; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario altera somente as configuracoes de notificacao. 2. Nao abre aba de Preferencias. 3. Preferencias anteriores permanecem. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F17-FA02 — SMS desmarcado (somente Email e Sistema)
| Campo | Valor |
|---|---|
| **ID** | CT-F17-FA02 |
| **Descricao** | SMS desmarcado (somente Email e Sistema) |
| **Pre-condicoes** | Pre-condicoes do UC-F17; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario desmarca checkbox SMS. 2. Sistema aceita — SMS e opcional. 3. Notificacoes enviadas apenas por email e sistema. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F17-FA03 — Tema alterado para Escuro
| Campo | Valor |
|---|---|
| **ID** | CT-F17-FA03 |
| **Descricao** | Tema alterado para Escuro |
| **Pre-condicoes** | Pre-condicoes do UC-F17; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario seleciona tema "Escuro". 2. Interface muda visualmente apos salvar (ou ao selecionar). |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Positivo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F17-FE01 — Email de notificacao em formato invalido
| Campo | Valor |
|---|---|
| **ID** | CT-F17-FE01 |
| **Descricao** | Email de notificacao em formato invalido |
| **Pre-condicoes** | Pre-condicoes do UC-F17; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario digita email invalido no campo de notificacoes. 2. Sistema deveria validar formato. 3. Se nao validar, notificacoes podem nao ser enviadas. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | e2e |
#### CT-F17-FE02 — Nenhum canal de notificacao selecionado
| Campo | Valor |
|---|---|
| **ID** | CT-F17-FE02 |
| **Descricao** | Nenhum canal de notificacao selecionado |
| **Pre-condicoes** | Pre-condicoes do UC-F17; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Usuario desmarca todos os checkboxes (Email, Sistema, SMS). 2. Sistema aceita — porem nenhuma notificacao sera enviada. 3. Idealmente sistema deveria alertar. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |
#### CT-F17-FE03 — Erro ao salvar preferencias
| Campo | Valor |
|---|---|
| **ID** | CT-F17-FE03 |
| **Descricao** | Erro ao salvar preferencias |
| **Pre-condicoes** | Pre-condicoes do UC-F17; ver doc V6 secao 'Pre-condicoes'. |
| **Acoes do ator e dados de entrada** | 1. Backend retorna erro. 2. Badge "Salvo!" nao aparece. 3. Toast de erro exibido. |
| **Saida esperada** | Sistema responde conforme descrito no fluxo do UC-V6 (ver Saida esperada do fluxo correspondente). |
| **Tipo** | Negativo |
| **Categoria** | Cenário |
| **RNs** | — |
| **Trilha sugerida** | visual |

### Classes de Equivalência

> Cobertura conforme IEEE 829 §3.2.

#### CT-F17-CLS-EMAIL-INVALIDO — Email de notificação sem @
| Campo | Valor |
|---|---|
| **ID** | CT-F17-CLS-EMAIL-INVALIDO |
| **Descricao** | Email de notificação sem @ |
| **Pre-condicoes** | ParametrizacoesPage > Notificações |
| **Acoes do ator e dados de entrada** | Email = 'semarroba.com'. Salvar. |
| **Saida esperada** | Sistema rejeita. |
| **Tipo** | Negativo |
| **Categoria** | Classe |
| **RNs** | RN-042 |
| **Trilha sugerida** | e2e |

### Fronteira / Boundary

> Cobertura conforme IEEE 829 §3.3.

#### CT-F17-LIM-EMAIL-VAZIO — Email vazio
| Campo | Valor |
|---|---|
| **ID** | CT-F17-LIM-EMAIL-VAZIO |
| **Descricao** | Email vazio |
| **Pre-condicoes** | ParametrizacoesPage |
| **Acoes do ator e dados de entrada** | Email = ''. Desabilitar notificação por email. Salvar. |
| **Saida esperada** | Sistema aceita. |
| **Tipo** | Limite |
| **Categoria** | Fronteira |
| **RNs** | — |
| **Trilha sugerida** | e2e |


---

## Resumo da cobertura V7

| Categoria | Quantidade | Trilha sugerida principal |
|---|---|---|
| Cenário | 124 | visual (Fase 1) |
| Classe | 29 | e2e (Fase 2) |
| Fronteira | 37 | e2e (Fase 2) |
| Combinado | 11 | e2e (Fase 3) |
| **TOTAL** | **201** | — |

**Auditoria de aderência ao IEEE 829 (CRITERIOS V1):**
- ✅ Cobertura de cenários (§3.1): 100% dos FP/FAs/FEs têm ao menos 1 CT
- ✅ Cobertura de classes (§3.2): campos com regras explícitas têm CTs por classe
- ✅ Cobertura de fronteira (§3.3): valores de borda exercitados
- ✅ Combinações (§3.4): CTs pairwise gerados onde há risco de regressão cruzada
- ✅ Tipologia: cada CT marcado como Positivo/Negativo/Limite
- ✅ Categoria: cada CT classificado como Cenário/Classe/Fronteira/Combinado
- ✅ Trilha: cada CT recebe sugestao de execucao (visual/e2e/humana)

---

*Documento gerado em 2026-04-27 a partir dos UCs V6 da Sprint 1 e do documento normativo `CRITERIOS PARA GERAR CTS A PARTIR DE UCS PELA IEEE829.md`. Para regerar, ver script Python no commit que introduziu V7.*
