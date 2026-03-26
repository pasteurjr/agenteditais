# Manual de Testes — Fase 2: Proposta
**Versao:** 1.0
**Data:** 26/03/2026
**Modulo:** Geracao e Gestao de Propostas

---

## Sumario

1. [UC-R01] Gerar Proposta Tecnica
2. [UC-R02] Upload de Proposta Externa
3. [UC-R03] Descricao Tecnica A/B
4. [UC-R04] Auditoria ANVISA
5. [UC-R05] Auditoria Documental + Smart Split
6. [UC-R06] Exportar Dossie Completo
7. [UC-R07] Gerenciar Status e Submissao
8. Testes via Chat
9. Problemas Conhecidos e Limitacoes

---

## [UC-R01] Gerar Proposta Tecnica

**RF relacionado:** RF-040-01
**Ator:** Usuario (Analista Comercial)

### Pre-requisitos
- Edital Fiocruz salvo no sistema
- Lote 2 com Kit TTPA vinculado
- Precificacao completa (camadas A a E preenchidas)

### Passos do Teste

| Passo | Acao | Resultado Esperado |
|-------|------|--------------------|
| 1 | Ir para a pagina **Proposta** e clicar **"Nova Proposta"** | Modal/formulario de criacao abre |
| 2 | Selecionar edital **"46/2026 — FUNDACAO OSWALDO CRUZ"** | Lotes do edital sao carregados |
| 3 | Selecionar Lote **"2 — Coagulacao"** | Produtos vinculados ao lote sao listados |
| 4 | Selecionar Produto **"Kit TTPA Coagulacao Celer Wondfo"** | Produto selecionado com sucesso |
| 5 | Verificar campos de Preco e Quantidade | Devem estar pre-preenchidos a partir da PrecoCamada (valores da precificacao) |
| 6 | Selecionar Template (se disponivel) ou deixar padrao | Template carregado ou padrao aplicado |
| 7 | Clicar **"Gerar Proposta"** | Sistema chama motor IA e gera proposta |
| 8 | Verificar editor rico | Editor aparece com proposta gerada contendo **7 secoes**: Objeto, Descricao Tecnica, Especificacoes, Conformidade, Condicoes Comerciais, Prazo/Entrega, Observacoes |
| 9 | Editar texto no editor | Edicao funciona normalmente no editor rico |
| 10 | Verificar LOG de edicao | Em **Cadastros → Propostas**, LOG de alteracao deve estar registrado |
| 11 | Clicar **"Salvar Rascunho"** | Proposta salva com status **"rascunho"** |
| 12 | Verificar na lista de propostas | Proposta aparece na lista com status "rascunho", edital e produto corretos |

### Resultado Esperado Final
Proposta criada com status "rascunho", conteudo gerado por IA com 7 secoes, preco e quantidade pre-preenchidos da precificacao, LOG de edicao registrado.

---

## [UC-R02] Upload de Proposta Externa

**RF relacionado:** RF-040-02
**Ator:** Usuario (Analista Comercial)

### Pre-requisitos
- Arquivo .docx com texto de proposta elaborado externamente
- Edital salvo no sistema

### Passos do Teste

| Passo | Acao | Resultado Esperado |
|-------|------|--------------------|
| 1 | Criar arquivo .docx com texto de proposta manual (fora do sistema) | Arquivo disponivel no computador |
| 2 | Na pagina de Proposta, clicar **"Upload Proposta Externa"** | Modal de upload abre |
| 3 | Selecionar edital | Edital selecionado |
| 4 | Selecionar produto | Produto vinculado |
| 5 | Selecionar arquivo .docx | Arquivo carregado |
| 6 | Preencher preco e quantidade | Campos aceitos |
| 7 | Clicar **"Importar"** | Sistema processa upload e extrai texto |

### Resultado Esperado Final
Proposta criada no sistema com conteudo extraido do arquivo .docx, preco e quantidade informados, visivel na lista de propostas.

---

## [UC-R03] Descricao Tecnica A/B

**RF relacionado:** RF-040-03
**Ator:** Usuario (Analista Comercial)

### Pre-requisitos
- Proposta existente gerada (via UC-R01 ou UC-R02)

### Passos do Teste

| Passo | Acao | Resultado Esperado |
|-------|------|--------------------|
| 1 | Abrir proposta existente no editor | Editor carrega com conteudo da proposta |
| 2 | Localizar secao **"Descricao Tecnica"** | Secao visivel no editor |
| 3 | Verificar toggle de opcao | Toggle deve estar em **"Opcao A (Texto do Edital)"** por padrao |
| 4 | Mudar para **"Opcao B (Personalizado)"** | Campo de texto personalizado aparece |
| 5 | Verificar badge | Badge **"TEXTO PERSONALIZADO"** deve aparecer na secao |
| 6 | Digitar texto personalizado | Texto aceito no campo |
| 7 | Verificar LOG | LOG de alteracao de descricao registrado no sistema |
| 8 | Clicar **"Ver versao original"** | Texto original do edital e exibido (sem perder o personalizado) |
| 9 | Salvar proposta | Proposta salva com descricao personalizada |

### Resultado Esperado Final
Proposta salva com descricao tecnica personalizada (Opcao B), texto original do edital acessivel via "Ver versao original", LOG de alteracao registrado.

---

## [UC-R04] Auditoria ANVISA

**RF relacionado:** RF-040-04
**Ator:** Usuario (Analista Comercial)

### Pre-requisitos
- Proposta existente com produto que possui registro ANVISA cadastrado

### Passos do Teste

| Passo | Acao | Resultado Esperado |
|-------|------|--------------------|
| 1 | Abrir proposta com produto que tem registro ANVISA | Proposta carrega normalmente |
| 2 | Verificar card **"Auditoria ANVISA"** | Card deve aparecer automaticamente |
| 3 | Clicar **"Verificar Registros"** | Sistema consulta base interna de registros |
| 4 | Verificar tabela de resultados | Tabela com colunas: Produto, Registro, Validade, Status |
| 5 | Verificar semaforo — Status verde | Registro valido, validade > 6 meses da data do certame |
| 6 | Verificar semaforo — Status amarelo | Registro valido, validade < 6 meses (alerta) |
| 7 | Verificar semaforo — Status vermelho | Registro vencido → proposta **BLOQUEADA** para envio |
| 8 | Verificar LOG de validacao | LOG de auditoria ANVISA registrado no sistema |

### Legenda do Semaforo

| Cor | Icone | Significado | Acao |
|-----|-------|-------------|------|
| Verde | Registro valido, validade > 6 meses | Liberado |
| Amarelo | Registro valido, validade < 6 meses | Alerta — renovar antes do certame |
| Vermelho | Registro vencido ou inexistente | **BLOQUEADO** — nao permite envio |

### Resultado Esperado Final
Semaforo correto para cada produto, bloqueio efetivo para registros vencidos, LOG de validacao registrado.

---

## [UC-R05] Auditoria Documental + Smart Split

**RF relacionado:** RF-040-05
**Ator:** Usuario (Analista Comercial)

### Pre-requisitos
- Proposta existente
- Documentos exigidos pelo edital cadastrados

### Passos do Teste

| Passo | Acao | Resultado Esperado |
|-------|------|--------------------|
| 1 | Abrir proposta | Proposta carrega normalmente |
| 2 | Verificar card **"Auditoria Documental"** | Card lista todos os documentos exigidos pelo edital |
| 3 | Verificar checklist de documentos | Docs presentes marcados com check, faltantes marcados sem check |
| 4 | Verificar documento > 25MB | Botao **"Fracionar"** disponivel para documentos grandes |
| 5 | Clicar **"Fracionar"** em documento > 25MB | Sistema divide PDF em partes < 25MB (Smart Split) |
| 6 | Verificar partes fracionadas | Partes listadas com tamanhos corretos, todas < 25MB |
| 7 | Marcar todos os documentos como revisados na checklist | Check em todos os itens |
| 8 | Clicar **"Aprovar Checklist"** | Checklist aprovado, status atualizado |

### Resultado Esperado Final
Todos os documentos validados, documentos grandes fracionados corretamente, checklist completo aprovado.

---

## [UC-R06] Exportar Dossie Completo

**RF relacionado:** RF-041-01
**Ator:** Usuario (Analista Comercial)

### Pre-requisitos
- Proposta existente com dados preenchidos (preferencialmente aprovada)

### Passos do Teste

| Passo | Acao | Resultado Esperado |
|-------|------|--------------------|
| 1 | Na proposta, clicar **"Baixar PDF"** | Proposta em formato PDF abre em nova aba do navegador |
| 2 | Verificar PDF | Conteudo completo da proposta, formatacao correta |
| 3 | Clicar **"Baixar DOCX"** | Arquivo Word (.docx) baixado para o computador |
| 4 | Abrir DOCX e verificar conteudo | Texto completo, formatacao preservada |
| 5 | Clicar **"Baixar Dossie ZIP"** | Arquivo ZIP baixado contendo proposta + anexos |
| 6 | Abrir ZIP e verificar conteudo | Deve conter: `proposta.pdf`, `proposta.docx`, pasta `anexos/` com documentos |

### Resultado Esperado Final
Dossie completo exportado com sucesso em todos os formatos (PDF, DOCX, ZIP), contendo proposta e todos os anexos documentais.

---

## [UC-R07] Gerenciar Status e Submissao

**RF relacionado:** RF-041-02
**Ator:** Usuario (Analista Comercial)

### Pre-requisitos
- Proposta existente com status "rascunho"

### Passos do Teste

| Passo | Acao | Resultado Esperado |
|-------|------|--------------------|
| 1 | Na lista de propostas, verificar status atual | Status deve ser **"rascunho"** |
| 2 | Clicar **"Enviar para Revisao"** | Status muda para **"revisao"** |
| 3 | Clicar **"Aprovar"** | Status muda para **"aprovada"** |
| 4 | Clicar **"Marcar Enviada"** | Status muda para **"enviada"** |
| 5 | Tentar transicao invalida (ex: rascunho → enviada) | Sistema bloqueia transicao e exibe mensagem de erro |
| 6 | Verificar checklist dinamico | Checklist baseado nos documentos exigidos pelo edital |
| 7 | Fazer upload real de documento | Arquivo salvo no servidor, checklist atualizado |

### Fluxo de Status Valido

```
rascunho → revisao → aprovada → enviada
```

Transicoes fora desta sequencia devem ser bloqueadas pelo sistema.

### Resultado Esperado Final
Fluxo completo de status executado: rascunho → revisao → aprovada → enviada. Transicoes invalidas bloqueadas. Checklist dinamico funcional com upload de documentos.

---

## Testes via Chat

O sistema suporta comandos de proposta via chat com linguagem natural. Testar os seguintes comandos:

| # | Comando | Resultado Esperado |
|---|---------|-------------------|
| 1 | "Gere proposta para o edital 46/2026 lote 2 com produto Kit TTPA" | Sistema identifica intencao, gera proposta automaticamente e exibe no chat |
| 2 | "Verifique registros ANVISA da proposta [ID]" | Sistema executa auditoria ANVISA e retorna semaforo |
| 3 | "Faca auditoria documental da proposta [ID]" | Sistema executa auditoria documental e retorna checklist |
| 4 | "Exporte dossie completo da proposta [ID]" | Sistema gera e disponibiliza link para download do dossie |
| 5 | "Liste templates de proposta disponiveis" | Sistema lista templates cadastrados |
| 6 | "Liste minhas propostas geradas" | Sistema lista todas as propostas do usuario |

**Nota:** Substituir `[ID]` pelo ID real da proposta gerada nos testes anteriores.

---

## Problemas Conhecidos e Limitacoes

1. **Upload de proposta externa:** Suporta apenas arquivos `.docx` para extracao de texto. Outros formatos (PDF, ODT) nao sao processados automaticamente.

2. **Smart Split:** Requer biblioteca `PyPDF2` instalada no ambiente. Sem ela, o fracionamento de PDFs grandes nao funciona.

3. **Auditoria ANVISA:** Consulta base interna de registros cadastrados no sistema. Nao consulta o website da ANVISA em tempo real.

4. **Dossie ZIP:** Pode demorar para propostas com muitos anexos. Tempo proporcional ao volume de documentos.

5. **Templates:** Sao compartilhados por empresa, nao por usuario individual. Todos os usuarios da mesma empresa veem os mesmos templates.

---

*Manual gerado em 26/03/2026. Cada caso de teste foi elaborado com base nos casos de uso UC-R01 a UC-R07 do documento CASOS DE USO PRECIFICACAO E PROPOSTA v2.*
