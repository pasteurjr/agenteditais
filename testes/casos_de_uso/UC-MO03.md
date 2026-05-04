---
uc_id: UC-MO03
nome: "Analisar Documentos da Empresa (sob demanda)"
sprint: "Sprint 6"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT 6.md"
linha_inicio_no_doc: 576
split_gerado_em: "2026-05-04T01:10:45"
---

# UC-MO03 — Analisar Documentos da Empresa (sob demanda)

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT 6.md` (linha 576).
> Sprint origem: **Sprint 6**.

---

**RNs aplicadas:** RN-084 (cooldown), RN-132 (audit invocacao), RN-008 (status certidao), RN-031 (bloqueio certidao vencida), RN-039 (transicao automatica)

**RF relacionado:** RF-004 (Documentos da Empresa), RF-048, RF-001 (Cadastro Empresa), RF-002 (Gestao Certidoes)
**Ator:** Usuario (Analista, Gestor de Conformidade)

### Pre-condicoes
1. Usuario autenticado
2. Empresa possui documentos cadastrados (contrato social, certidoes, alvaras, licencas ANVISA)
3. Tool `tool_analisar_documentos_empresa` registrada

### Pos-condicoes
1. Analise realizada e resultado gravado em `AnaliseDocumentosEmpresa`
2. Inconsistencias detectadas geram alertas automaticos (UC-FL02)
3. Log de invocacao em `AuditoriaLog`

### Sequencia de Eventos

1. Usuario abre o Floating Chat (pode estar em qualquer pagina)
2. Digita: "Analisa os documentos da minha empresa e me diz se esta tudo coerente"
3. Clica Enviar
4. Sistema verifica cooldown (RN-084)
5. DeepSeek emite tool_call `tool_analisar_documentos_empresa` com `empresa_id=current_user.empresa_id`
6. Tool carrega: todos os documentos da empresa, todas as certidoes ativas/vencidas, dados cadastrais basicos
7. Tool envia ao DeepSeek (chamada aninhada) um prompt de analise: "Verifique coerencia entre os documentos abaixo. Procure: razao social divergente, datas fora de ordem, certidao vencida, CNPJ inconsistente, campos ausentes, alvaras vencidos, licencas ANVISA vencidas"
8. DeepSeek retorna JSON estruturado: `{inconsistencias: [{tipo: "razao_social_divergente", documentos: [...], gravidade: "alta"}, ...], resumo: "...", alertas_sugeridos: [...]}`
9. Tool persiste resultado em `AnaliseDocumentosEmpresa`
10. Para cada alerta sugerido com gravidade >= alta, tool cria entrada em `AlertaFlag` automaticamente
11. Para cada certidao vencida, tool chama `tool_configurar_alertas` aninhada
12. Tool retorna para DeepSeek original
13. IA gera resposta em PT-BR: "Analisei os 12 documentos da sua empresa. Encontrei 3 problemas: 1) A razao social no contrato social diverge da cadastrada no sistema, 2) A certidao FGTS vence em 5 dias, 3) A licenca da ANVISA 123456 venceu em 10/04. Ja criei 2 alertas criticos para voce. Quer ver o relatorio completo?"
14. Chatbox exibe mensagem com [Botao: "Ver relatorio completo"] que leva ao [Modal: "Analise de Documentos"]
15. Modal mostra lista completa de inconsistencias, agrupadas por gravidade

### Tela(s) Representativa(s)

#### Modal "Analise de Documentos"

```
+---------------------------------------------------------------+
|  Analise de Documentos da Empresa              [X]            |
|                                                               |
|  Empresa: CH Hospitalar LTDA                                 |
|  CNPJ: 12.345.678/0001-90                                    |
|  Analisado em: 15/04/2026 14:32                              |
|  Documentos analisados: 12                                    |
|  Inconsistencias encontradas: 3                              |
|                                                               |
|  +-----------------------------------------------------------+|
|  | [!] ALTA - Razao Social Divergente                       ||
|  |     Contrato Social: "CH Hospitalar LTDA - EPP"          ||
|  |     Cadastro Sistema: "CH Hospitalar LTDA"               ||
|  |     [Botao: Corrigir Cadastro]                           ||
|  +-----------------------------------------------------------+|
|                                                               |
|  +-----------------------------------------------------------+|
|  | [!] CRITICA - Certidao FGTS vence em 5 dias              ||
|  |     Validade: 20/04/2026                                 ||
|  |     Alerta automatico criado [ID: 123]                   ||
|  |     [Botao: Ver Alerta]                                  ||
|  +-----------------------------------------------------------+|
|                                                               |
|  +-----------------------------------------------------------+|
|  | [!] CRITICA - Licenca ANVISA 123456 VENCIDA              ||
|  |     Vencida em: 10/04/2026 (ha 5 dias)                   ||
|  |     Alerta automatico criado [ID: 124]                   ||
|  |     BLOQUEIA PARTICIPACAO EM EDITAIS (RN-031)            ||
|  |     [Botao: Renovar Licenca]                             ||
|  +-----------------------------------------------------------+|
|                                                               |
|  [Botao: Exportar PDF]  [Botao: Fechar]                       |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Metadados da analise, lista de inconsistencias com gravidade, alertas criados automaticamente
- **Preenchidos (input):** Comando em linguagem natural no chatbox
- **Obtidos (resposta do sistema):** Analise LLM estruturada, alertas criados automaticamente, modal detalhado, possibilidade de exportar PDF

### Excecoes
- **E1:** Empresa sem documentos - IA responde: "Sua empresa nao tem documentos cadastrados ainda. Peca para cadastrar em Empresa > Documentos"
- **E2:** Documentos muito grandes para LLM - tool faz chunking e informa: "Sua empresa tem muitos documentos (45 arquivos). Estou analisando em lotes, isso vai levar uns 2 minutos..."

---
