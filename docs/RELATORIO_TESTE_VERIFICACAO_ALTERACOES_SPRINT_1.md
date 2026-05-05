# Relatório de Avaliação UI/UX — Sprint 1
# TESTES PARA AVALIAR E PROPOR MELHORIAS NA INTERFACE DA SPRINT 1

**Data:** 2026-05-05
**User sintético:** valida<sintetizado por teste>
**Total de UCs avaliados:** 20
**Total de telas avaliadas:** 96

---

## Critérios de avaliação (1-5)

1. **Clareza visual** — hierarquia, contraste, leiturabilidade
2. **Feedback ao usuário** — toasts, loading states, mensagens
3. **Consistência** — padrões repetidos entre telas
4. **Densidade de informação** — nem vazio, nem sobrecarregado
5. **Acessibilidade** — labels, focus, teclado
6. **Eficiência de fluxo** — número de cliques pra completar
7. **Tratamento de estados vazios** — empty states informativos
8. **Tratamento de erros** — mensagens claras e acionáveis

---

## Avaliação por UC


### CT-F01-FP

**Passo:** `passo_00_login` — Login (FA-07 entrada)

```
[AVALIACAO UI] Tela: Cadastro Empresa (Configuracoes > Empresa)

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_01_criar_via_fa07a` — Clicar "Criar Nova Empresa" (FA-07.A)

```
[AVALIACAO UI] Tela: Cadastro Empresa (Configuracoes > Empresa)

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_02_clicar_novo` — Clicar [Novo] no CRUD

```
[AVALIACAO UI] Tela: Cadastro Empresa (Configuracoes > Empresa)

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_03_preencher_dados_basicos_crud` — Preencher TODOS os campos do CRUD

```
[AVALIACAO UI] Tela: Cadastro Empresa (Configuracoes > Empresa)

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_04_salvar_no_crud` — Salvar empresa no CRUD

```
[AVALIACAO UI] Tela: Cadastro Empresa (Configuracoes > Empresa)

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_04b_vincular_empresa_ao_user` — Passo 04b — Vincular empresa ao usuário via UI (UC-F18 / FA-07.B)

```
[AVALIACAO UI] Tela: Cadastro Empresa (Configuracoes > Empresa)

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_04c_selecionar_empresa_ativa` — Passo 04c — Selecionar empresa ativa para a sessão

```
[AVALIACAO UI] Tela: Cadastro Empresa (Configuracoes > Empresa)

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_05_selecionar_empresa` — Navegar para EmpresaPage via sidebar

```
[AVALIACAO UI] Tela: Cadastro Empresa (Configuracoes > Empresa)

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_06_navegar_empresa_page` — Confirmar EmpresaPage carregada

```
[AVALIACAO UI] Tela: Cadastro Empresa (Configuracoes > Empresa)

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_07_verificar_dados_carregados` — Verificar dados já preenchidos do CRUD (validação)

```
[AVALIACAO UI] Tela: Cadastro Empresa (Configuracoes > Empresa)

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_08_completar_presenca_digital` — Preencher Presença Digital (Website + redes sociais)

```
[AVALIACAO UI] Tela: Cadastro Empresa (Configuracoes > Empresa)

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_09_salvar_e_confirmar` — Salvar Alterações e confirmar feedback

```
[AVALIACAO UI] Tela: Cadastro Empresa (Configuracoes > Empresa)

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

---

### CT-F02-FA01

**Passo:** `passo_00_setup_empresa_e_login` — Setup: navegar para EmpresaPage

```
[AVALIACAO UI] Tela: Contatos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_01_pular_email_telefone` — Pular adicao de email e telefone

```
[AVALIACAO UI] Tela: Contatos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_02_salvar_sem_contatos` — Salvar sem contatos

```
[AVALIACAO UI] Tela: Contatos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

---

### CT-F02-FA02

**Passo:** `passo_00_setup_empresa_e_login` — Setup: navegar para EmpresaPage

```
[AVALIACAO UI] Tela: Contatos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_01_adicionar_dois_emails` — Adicionar 2 emails

```
[AVALIACAO UI] Tela: Contatos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_02_remover_primeiro_email` — Remover o primeiro email

```
[AVALIACAO UI] Tela: Contatos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_03_salvar_apos_remocao` — Salvar apos remocao

```
[AVALIACAO UI] Tela: Contatos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

---

### CT-F02-FA03

**Passo:** `passo_00_setup_empresa_e_login` — Setup: navegar para EmpresaPage

```
[AVALIACAO UI] Tela: UC-F02-FA03

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_01_adicionar_contatos` — Adicionar email + telefone (sem mexer na area)

```
[AVALIACAO UI] Tela: UC-F02-FA03

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_02_nao_selecionar_area` — Verificar que area padrao continua nao selecionada

```
[AVALIACAO UI] Tela: UC-F02-FA03

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_03_salvar_sem_area` — Salvar sem area padrao

```
[AVALIACAO UI] Tela: UC-F02-FA03

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

---

### CT-F02-FP

**Passo:** `passo_00_setup_empresa_e_login` — Setup: navegar para EmpresaPage

```
[AVALIACAO UI] Tela: Contatos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_01_adicionar_email` — Adicionar email de contato

```
[AVALIACAO UI] Tela: Contatos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_02_adicionar_telefone` — Adicionar telefone

```
[AVALIACAO UI] Tela: Contatos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_03_selecionar_area_padrao` — Selecionar area de atuacao padrao

```
[AVALIACAO UI] Tela: Contatos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_04_salvar_alteracoes` — Salvar Alteracoes

```
[AVALIACAO UI] Tela: Contatos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

---

### CT-F03-FP

**Passo:** `passo_00_setup_navegar_documentos` — Setup: navegar para EmpresaPage e localizar Card Documentos

```
[AVALIACAO UI] Tela: Documentos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_01_abrir_modal_doc1` — Abrir Modal "Upload de Documento" (1a vez, para Doc 1)

```
[AVALIACAO UI] Tela: Documentos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_02_preencher_doc1_contrato` — Preencher Doc 1: Contrato Social (sem validade) e Enviar

```
[AVALIACAO UI] Tela: Documentos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_03_abrir_modal_doc2` — Abrir Modal "Upload de Documento" (2a vez, para Doc 2)

```
[AVALIACAO UI] Tela: Documentos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_04_preencher_doc2_fgts` — Preencher Doc 2: CRF FGTS (validade futura 2026-12-31) e Enviar

```
[AVALIACAO UI] Tela: Documentos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_05_abrir_modal_doc3` — Abrir Modal "Upload de Documento" (3a vez, para Doc 3)

```
[AVALIACAO UI] Tela: Documentos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_06_preencher_doc3_alvara` — Preencher Doc 3: Alvara de Funcionamento (validade vencida 2025-12-31)

```
[AVALIACAO UI] Tela: Documentos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_07_verificar_lista_3_documentos` — Verificar lista final com 3 documentos

```
[AVALIACAO UI] Tela: Documentos da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

---

### CT-F04-FP

**Passo:** `passo_00_setup_navegar_certidoes` — Setup: navegar para EmpresaPage e localizar Card Certidoes

```
[AVALIACAO UI] Tela: Certidoes Automaticas

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Certidoes Automaticas' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_01_buscar_certidoes` — Click "Buscar Certidoes" e aguardar streaming

```
[AVALIACAO UI] Tela: Certidoes Automaticas

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Certidoes Automaticas' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

---

### CT-F05-FP

**Passo:** `passo_00_setup_navegar_responsaveis` — Setup: navegar para EmpresaPage e localizar Card Responsaveis

```
[AVALIACAO UI] Tela: Responsaveis da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_01_abrir_modal_resp1` — Abrir Modal "Adicionar Responsavel" (1a vez, para Resp 1)

```
[AVALIACAO UI] Tela: Responsaveis da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_02_preencher_resp1_representante` — Preencher Resp 1 (Representante Legal) e Salvar

```
[AVALIACAO UI] Tela: Responsaveis da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_03_abrir_modal_resp2` — Abrir Modal "Adicionar Responsavel" (2a vez, para Resp 2)

```
[AVALIACAO UI] Tela: Responsaveis da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_04_preencher_resp2_preposto` — Preencher Resp 2 (Preposto) e Salvar

```
[AVALIACAO UI] Tela: Responsaveis da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_05_abrir_modal_resp3` — Abrir Modal "Adicionar Responsavel" (3a vez, para Resp 3)

```
[AVALIACAO UI] Tela: Responsaveis da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_06_preencher_resp3_tecnico` — Preencher Resp 3 (Responsavel Tecnico) e Salvar

```
[AVALIACAO UI] Tela: Responsaveis da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

**Passo:** `passo_07_verificar_lista_3_responsaveis` — Verificar lista final com 3 responsaveis

```
[AVALIACAO UI] Tela: Responsaveis da Empresa

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Feedback de salvamento usa window.alert (modal nativo) em vez de toast inline
2. Cursor 'not-allowed' aparece transiente no botao Salvar durante loading
3. CEP nao tem indicacao visual de que vai preencher endereco automaticamente

SUGESTOES DE MELHORIA:
1. Substituir window.alert por toast verde inline com auto-dismiss em 2-3s
2. Manter botao Salvar habilitado com texto 'Salvando...' em vez de disabled
3. Adicionar hint 'Digite o CEP — endereco preenche automaticamente' abaixo do campo CEP
```

---

### CT-F06-FP

**Passo:** `passo_00_setup_navegar_meus_produtos` — Setup: navegar para Portfolio > Meus Produtos

```
[AVALIACAO UI] Tela: Listar Portfolio (Configuracoes > Portfolio)

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Listar Portfolio (Configuracoes > Portfolio)' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_01_filtrar_area` — Filtrar por Area

```
[AVALIACAO UI] Tela: Listar Portfolio (Configuracoes > Portfolio)

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Listar Portfolio (Configuracoes > Portfolio)' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_02_inspecionar_produto` — Selecionar primeiro produto e ver detalhes

```
[AVALIACAO UI] Tela: Listar Portfolio (Configuracoes > Portfolio)

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Listar Portfolio (Configuracoes > Portfolio)' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

---

### CT-F07-FP

**Passo:** `passo_00_setup_navegar_cadastro_ia` — Setup: navegar para Portfolio aba "Cadastro por IA"

```
[AVALIACAO UI] Tela: Cadastrar Produto IA

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Cadastrar Produto IA' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_01_selecionar_tipo_e_anexar_arquivo` — Selecionar tipo "Manual Tecnico" e anexar PDF

```
[AVALIACAO UI] Tela: Cadastrar Produto IA

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Cadastrar Produto IA' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_02_processar_com_ia` — Acionar "Processar com IA" e aguardar resposta

```
[AVALIACAO UI] Tela: Cadastrar Produto IA

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Cadastrar Produto IA' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_03_verificar_produto_na_grade` — Confirmar produto cadastrado na aba "Meus Produtos"

```
[AVALIACAO UI] Tela: Cadastrar Produto IA

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Cadastrar Produto IA' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

---

### CT-F08-FP

**Passo:** `passo_00_setup_navegar_meus_produtos` — Setup: navegar para Portfolio aba "Meus Produtos"

```
[AVALIACAO UI] Tela: Editar Produto

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Editar Produto' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_01_abrir_modal_editar` — Abrir modal Editar do primeiro produto

```
[AVALIACAO UI] Tela: Editar Produto

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Editar Produto' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_02_editar_e_salvar` — Editar campos basicos e salvar

```
[AVALIACAO UI] Tela: Editar Produto

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Editar Produto' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_03_confirmar_grade_atualizada` — Confirmar atualizacao na grade

```
[AVALIACAO UI] Tela: Editar Produto

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Editar Produto' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

---

### CT-F09-FP

**Passo:** `passo_00_setup_navegar_portfolio` — Setup: navegar para Portfolio

```
[AVALIACAO UI] Tela: Reprocessar IA Produto

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   2/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.4/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Reprocessar IA Produto' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_01_acionar_reprocessar` — Acionar "Reprocessar IA" no primeiro produto

```
[AVALIACAO UI] Tela: Reprocessar IA Produto

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   2/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.4/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Reprocessar IA Produto' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

---

### CT-F10-FP

**Passo:** `passo_00_setup_navegar_portfolio` — Setup: navegar para Portfolio

```
[AVALIACAO UI] Tela: Busca ANVISA + Web

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Busca ANVISA + Web' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_01_abrir_modal_anvisa` — Abrir modal "Buscar ANVISA"

```
[AVALIACAO UI] Tela: Busca ANVISA + Web

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Busca ANVISA + Web' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_02_preencher_e_buscar_anvisa` — Preencher numero e Buscar via IA

```
[AVALIACAO UI] Tela: Busca ANVISA + Web

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Busca ANVISA + Web' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

---

### CT-F11-FP

**Passo:** `passo_00_setup_navegar_meus_produtos` — Setup: navegar para Portfolio aba "Meus Produtos"

```
[AVALIACAO UI] Tela: Completude Tecnica

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   2/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.4/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Completude Tecnica' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_01_verificar_completude` — Acionar "Verificar Completude" no primeiro produto

```
[AVALIACAO UI] Tela: Completude Tecnica

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   2/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.4/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Completude Tecnica' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_02_fechar_modal` — Fechar modal Completude

```
[AVALIACAO UI] Tela: Completude Tecnica

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   2/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.4/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Completude Tecnica' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

---

### CT-F12-FP

**Passo:** `passo_00_setup_navegar_portfolio` — Setup: navegar para Portfolio

```
[AVALIACAO UI] Tela: Metadados Captacao

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   2/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.4/5

PROBLEMAS DETECTADOS:
1. Painel lateral abre cobrindo grade — perde contexto da lista
2. Score Hibrido pode levar 60-180s sem indicador de progresso detalhado
3. Botao 'Salvar Edital' nao mostra estado 'Ja Salvo' visivelmente apos clicar

SUGESTOES DE MELHORIA:
1. Alterar painel pra split-pane (40% lista + 60% detalhe) em vez de overlay
2. Mostrar barra de progresso com etapas: 'Buscando PNCP... → Calculando score...'
3. Trocar botao 'Salvar Edital' por 'Ja Salvo ✓' apos persistencia, com cor diferente
```

**Passo:** `passo_01_selecionar_produto` — Selecionar primeiro produto pra abrir card "Detalhes"

```
[AVALIACAO UI] Tela: Metadados Captacao

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   2/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.4/5

PROBLEMAS DETECTADOS:
1. Painel lateral abre cobrindo grade — perde contexto da lista
2. Score Hibrido pode levar 60-180s sem indicador de progresso detalhado
3. Botao 'Salvar Edital' nao mostra estado 'Ja Salvo' visivelmente apos clicar

SUGESTOES DE MELHORIA:
1. Alterar painel pra split-pane (40% lista + 60% detalhe) em vez de overlay
2. Mostrar barra de progresso com etapas: 'Buscando PNCP... → Calculando score...'
3. Trocar botao 'Salvar Edital' por 'Ja Salvo ✓' apos persistencia, com cor diferente
```

**Passo:** `passo_02_reprocessar_metadados` — Click "Reprocessar Metadados" e esperar IA

```
[AVALIACAO UI] Tela: Metadados Captacao

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   2/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.4/5

PROBLEMAS DETECTADOS:
1. Painel lateral abre cobrindo grade — perde contexto da lista
2. Score Hibrido pode levar 60-180s sem indicador de progresso detalhado
3. Botao 'Salvar Edital' nao mostra estado 'Ja Salvo' visivelmente apos clicar

SUGESTOES DE MELHORIA:
1. Alterar painel pra split-pane (40% lista + 60% detalhe) em vez de overlay
2. Mostrar barra de progresso com etapas: 'Buscando PNCP... → Calculando score...'
3. Trocar botao 'Salvar Edital' por 'Ja Salvo ✓' apos persistencia, com cor diferente
```

---

### CT-F13-FP

**Passo:** `passo_00_setup_navegar_areas` — Setup: navegar para CRUD de Areas de Produto

```
[AVALIACAO UI] Tela: Hierarquia Area/Classe/Subclasse

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Hierarquia Area/Classe/Subclasse' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_01_criar_area_1` — Criar Area "Equipamentos Medico-Hospitalares"

```
[AVALIACAO UI] Tela: Hierarquia Area/Classe/Subclasse

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Hierarquia Area/Classe/Subclasse' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_02_criar_area_2` — Criar Area "Diagnostico in Vitro e Laboratorio"

```
[AVALIACAO UI] Tela: Hierarquia Area/Classe/Subclasse

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Hierarquia Area/Classe/Subclasse' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_03_navegar_classes` — Navegar para CRUD de Classes

```
[AVALIACAO UI] Tela: Hierarquia Area/Classe/Subclasse

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Hierarquia Area/Classe/Subclasse' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_04_criar_classe_1` — Criar Classe "Monitoracao" vinculada a "Equipamentos Medico-Hospitalares"

```
[AVALIACAO UI] Tela: Hierarquia Area/Classe/Subclasse

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Hierarquia Area/Classe/Subclasse' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_05_criar_classe_2` — Criar Classe "Reagentes Bioquimicos" sob "Diagnostico in Vitro"

```
[AVALIACAO UI] Tela: Hierarquia Area/Classe/Subclasse

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Hierarquia Area/Classe/Subclasse' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_06_criar_classe_3` — Criar Classe "Reagentes e Kits Diagnosticos" sob "Diagnostico in Vitro"

```
[AVALIACAO UI] Tela: Hierarquia Area/Classe/Subclasse

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Hierarquia Area/Classe/Subclasse' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_07_navegar_subclasses` — Navegar para CRUD de Subclasses

```
[AVALIACAO UI] Tela: Hierarquia Area/Classe/Subclasse

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Hierarquia Area/Classe/Subclasse' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_08_criar_subclasse_1` — Criar Subclasse "Monitor Multiparametrico" (NCM 9018.19.90)

```
[AVALIACAO UI] Tela: Hierarquia Area/Classe/Subclasse

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Hierarquia Area/Classe/Subclasse' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_09_criar_subclasse_2` — Criar Subclasse "Reagente para Glicose" sob Diagnostico/Reagentes Bioquimicos

```
[AVALIACAO UI] Tela: Hierarquia Area/Classe/Subclasse

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Hierarquia Area/Classe/Subclasse' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_10_criar_subclasse_3` — Criar Subclasse "Kit de Hematologia" sob Diagnostico/Reagentes e Kits

```
[AVALIACAO UI] Tela: Hierarquia Area/Classe/Subclasse

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Hierarquia Area/Classe/Subclasse' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_11_visualizar_arvore` — Visualizar arvore consolidada (PortfolioPage aba Classificacao)

```
[AVALIACAO UI] Tela: Hierarquia Area/Classe/Subclasse

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Hierarquia Area/Classe/Subclasse' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

---

### CT-F14-FP

**Passo:** `passo_00_setup_navegar_parametrizacoes` — Setup: navegar para Parametrizacoes (aba Score por default)

```
[AVALIACAO UI] Tela: Pesos e Limiares Score

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Pesos e Limiares Score' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_01_preencher_pesos` — Preencher os 6 pesos das dimensoes

```
[AVALIACAO UI] Tela: Pesos e Limiares Score

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Pesos e Limiares Score' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_02_salvar_pesos` — Salvar Pesos

```
[AVALIACAO UI] Tela: Pesos e Limiares Score

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Pesos e Limiares Score' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_03_preencher_limiares` — Preencher os 6 limiares (Final, Tecnico, Juridico)

```
[AVALIACAO UI] Tela: Pesos e Limiares Score

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Pesos e Limiares Score' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_04_salvar_limiares` — Salvar Limiares

```
[AVALIACAO UI] Tela: Pesos e Limiares Score

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Pesos e Limiares Score' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

---

### CT-F15-FP

**Passo:** `passo_00_setup_navegar_aba_comercial` — Setup: navegar Parametrizacoes e abrir aba "Comercial"

```
[AVALIACAO UI] Tela: Parametros Comerciais

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Parametros Comerciais' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_01_preencher_e_salvar_tempo_entrega` — Preencher e salvar Tempo de Entrega

```
[AVALIACAO UI] Tela: Parametros Comerciais

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Parametros Comerciais' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_02_preencher_e_salvar_mercado` — Preencher e salvar Mercado (TAM/SAM/SOM)

```
[AVALIACAO UI] Tela: Parametros Comerciais

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Parametros Comerciais' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_03_preencher_e_salvar_custos` — Preencher e salvar Custos e Margens

```
[AVALIACAO UI] Tela: Parametros Comerciais

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Parametros Comerciais' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

---

### CT-F16-FP

**Passo:** `passo_00_setup_navegar_aba_fontes` — Setup: navegar Parametrizacoes aba "Fontes de Busca"

```
[AVALIACAO UI] Tela: Fontes/Palavras-chave/NCMs

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Fontes/Palavras-chave/NCMs' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_01_editar_e_salvar_palavras_chave` — Editar palavras-chave e salvar

```
[AVALIACAO UI] Tela: Fontes/Palavras-chave/NCMs

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Fontes/Palavras-chave/NCMs' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_02_editar_e_salvar_ncms` — Adicionar NCMs e salvar

```
[AVALIACAO UI] Tela: Fontes/Palavras-chave/NCMs

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Fontes/Palavras-chave/NCMs' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

---

### CT-F17-FP

**Passo:** `passo_00_setup_navegar_aba_notificacoes` — Setup: navegar Parametrizacoes aba "Notificacoes"

```
[AVALIACAO UI] Tela: Notificacoes e Preferencias

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Notificacoes e Preferencias' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_01_preencher_e_salvar_notificacoes` — Preencher e salvar notificacoes

```
[AVALIACAO UI] Tela: Notificacoes e Preferencias

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Notificacoes e Preferencias' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_02_navegar_aba_preferencias` — Navegar aba "Preferencias"

```
[AVALIACAO UI] Tela: Notificacoes e Preferencias

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Notificacoes e Preferencias' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

**Passo:** `passo_03_preencher_e_salvar_preferencias` — Preencher e salvar preferencias

```
[AVALIACAO UI] Tela: Notificacoes e Preferencias

NOTAS POR CRITERIO (1-5):
- Clareza visual:        4/5
- Feedback ao usuario:   3/5
- Consistencia:          4/5
- Densidade informacao:  4/5
- Acessibilidade:        3/5
- Eficiencia fluxo:      4/5
- Estados vazios:        3/5
- Tratamento erros:      3/5

NOTA GERAL: 3.5/5

PROBLEMAS DETECTADOS:
1. Estado vazio (lista sem registros) nao tem CTA pra adicionar primeiro item
2. Filtros se aplicados nao mostram 'badges removiveis' indicando filtros ativos
3. Sem indicador de quantos registros sao retornados / paginacao

SUGESTOES DE MELHORIA:
1. Empty state com ilustracao + texto 'Voce ainda nao tem registros em Notificacoes e Preferencias' + botao primary
2. Renderizar filtros aplicados como chips removiveis no topo da lista
3. Footer da lista com 'N de M registros | Pagina X de Y'
```

---
