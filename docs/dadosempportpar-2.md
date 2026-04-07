# Conjunto de Dados 2 — Empresa, Portfolio e Parametrizações
# Validação Automatizada e pelo Dono do Produto

**Empresa:** RP3X Comércio e Representações Ltda. (RP3X Científica)
**Perfil:** Fornecedora de reagentes, filtros de laboratório, equipamentos de purificação de água e materiais para pesquisa e controle de qualidade laboratorial, atuante em licitações estaduais e municipais via PNCP. Fundada em 1992, sediada em Ribeirão Preto/SP.
**Uso:** Conjunto alternativo — dados distintos do Conjunto 1 para cobrir variações de fluxo, campos opcionais diferentes e cenários de borda.

---

## Contexto de Acesso — Usuários e Empresas

### Usuário de Validação (Conjunto 2)

| Campo | Valor |
|---|---|
| Email | valida2@valida.com.br |
| Senha | 123456 |
| Perfil | Superusuário |
| Empresa alvo | RP3X Comércio e Representações Ltda. |

### Fluxo de Preparação (executar antes dos UCs)

Como valida2 é superusuário, pode criar uma nova empresa diretamente:

1. Login com `valida2@valida.com.br` / `123456`
2. Na tela de seleção de empresa, clicar "Criar Nova Empresa" (ou acessar menu Empresa após selecionar qualquer empresa disponível)
3. Preencher os dados da RP3X conforme UC-F01 deste conjunto
4. Salvar — a empresa RP3X fica disponível para valida2 automaticamente
5. Alternativamente: valida1 pode criar a empresa e associar valida2 via "Associar Empresa/Usuario"

### Fluxo de Login (Superusuário)

1. Acessar `http://localhost:5175`
2. Email: `valida2@valida.com.br` / Senha: `123456`
3. Tela de seleção de empresa aparece — selecionar RP3X Comércio e Representações Ltda.
4. Dashboard carrega com RP3X como empresa ativa

### Menus exclusivos de Superusuário

| Menu | Função |
|---|---|
| Usuarios | Criar, editar, listar usuários |
| Associar Empresa/Usuario | Vincular usuários a empresas |
| Selecionar Empresa | Trocar empresa ativa |

---

## UC-F01 — Cadastro Principal da Empresa

### Dados Cadastrais

| Campo | Valor |
|---|---|
| Razão Social | RP3X Comércio e Representações Ltda. |
| Nome Fantasia | RP3X Científica |
| CNPJ | 68.218.593/0001-09 |
| Inscrição Estadual | 557.123.890.110 |
| Website | https://rp3x.com.br |
| Instagram | @rp3xcientifica |
| LinkedIn | rp3x |
| Facebook | (deixar em branco — campo opcional) |
| Endereço | Rua Mario Mondi, 22 |
| Cidade | Ribeirão Preto |
| UF | SP |
| CEP | 14092-570 |

---

## UC-F02 — Contatos e Área Padrão

### Emails de Contato

| # | Email |
|---|---|
| 1 | licitacoes@rp3x.com.br |
| 2 | comercial@rp3x.com.br |

### Celulares / Telefones

| # | Telefone |
|---|---|
| 1 | (16) 3512-4600 |
| 2 | (16) 99823-7700 |
| 3 | (16) 99777-5544 |

### Área de Atuação Padrão

| Campo | Valor |
|---|---|
| Área de Atuação Padrão | Diagnóstico in Vitro e Laboratório |

---

## UC-F03 — Documentos da Empresa

### Documento 1 — Alvará Sanitário

| Campo | Valor |
|---|---|
| Tipo de Documento | Alvará / Licença Sanitária |
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Validade | 2026-05-30 |

### Documento 2 — Autorização de Funcionamento (ANVISA)

| Campo | Valor |
|---|---|
| Tipo de Documento | Autorização de Funcionamento ANVISA (AFE) |
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Validade | 2027-05-15 |

### Documento 3 — ISO 13485 (Qualidade Dispositivos Médicos)

| Campo | Valor |
|---|---|
| Tipo de Documento | Certificado ISO / Acreditação |
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Validade | 2026-09-30 |

### Documento 4 — Certidão Estadual (upload manual)

| Campo | Valor |
|---|---|
| Tipo de Documento | Certidão Negativa Estadual |
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Validade | 2026-12-31 |

### Verificação de Status Esperados

| Documento | Status Esperado | Cor |
|---|---|---|
| Alvará Sanitário | Vence | Amarelo (prazo curto) |
| AFE ANVISA | OK | Verde |
| ISO 13485 | OK | Verde |
| Certidão Estadual | OK | Verde |

---

## UC-F04 — Certidões Automáticas

### CNPJ para busca automática

| Campo | Valor |
|---|---|
| CNPJ | 68.218.593/0001-09 |

### Frequência de busca automática

| Campo | Valor |
|---|---|
| Frequência | Quinzenal |

### Upload manual de certidão

| Campo | Valor |
|---|---|
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Data de Vencimento | 2026-09-30 |
| Número | PGFN-2025-68218 |

### Edição de certidão via modal de detalhe

| Campo | Valor |
|---|---|
| Status | Upload manual |
| Validade | 2026-09-30 |
| Número | PGFN-2025-68218 |
| Órgão Emissor | Procuradoria-Geral da Fazenda Nacional |

---

## UC-F05 — Responsáveis da Empresa

### Responsável 1 — Representante Legal

| Campo | Valor |
|---|---|
| Tipo | Representante Legal |
| Nome | Fernanda Lima Costa |
| Cargo | Sócia-Administradora |
| Email | fernanda.costa@rp3x.com.br |
| Telefone | (16) 99823-7700 |

### Responsável 2 — Responsável Técnico

| Campo | Valor |
|---|---|
| Tipo | Responsável Técnico |
| Nome | Dr. Ricardo Alves Nunes |
| Cargo | Farmacêutico-Bioquímico Responsável |
| Email | ricardo.nunes@rp3x.com.br |
| Telefone | (16) 99777-5544 |

> **Diferença do Conjunto 1:** apenas 2 responsáveis (sem Preposto). Testa a lista com número mínimo de itens.

---

## UC-F06 — Listar, Filtrar e Inspecionar Produtos

### Filtros para validação

| Filtro | Valor de Teste |
|---|---|
| Área | Diagnóstico in Vitro e Laboratório |
| Classe | Reagentes e Kits Diagnósticos |
| Subclasse | Kit de Hematologia |
| Busca por texto | "reagente" |
| Busca por texto alternativa | "hematologia" |

### Produto esperado na lista (cadastrado via UC-F07)

| Campo | Valor |
|---|---|
| Nome | Kit de Reagentes para Hemograma Completo Sysmex XN |
| Fabricante | Sysmex |
| SKU | SX-XN-HC-BR |
| Status Pipeline | Cadastrado |

---

## UC-F07 — Cadastro de Produto por IA

### Opção A — Website do Fabricante

| Campo | Valor |
|---|---|
| Tipo de Documento | Website |
| URL do Website | https://www.sysmex.com.br/products |
| Área (opcional) | Diagnóstico in Vitro e Laboratório |
| Classe (opcional) | Reagentes e Kits Diagnósticos |
| Subclasse (opcional) | Kit de Hematologia |

### Opção B — Instrução de Uso (IFU)

| Campo | Valor |
|---|---|
| Tipo de Documento | Instruções de Uso / IFU |
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Nome do Produto (opcional) | Kit para Glicose Enzimática Wiener BioGlic-100 |
| Área (opcional) | Diagnóstico in Vitro e Laboratório |
| Classe (opcional) | Reagentes Bioquímicos |
| Subclasse (opcional) | Reagente para Glicose |

### Opção C — Plano de Contas (ERP) — múltiplos itens

| Campo | Valor |
|---|---|
| Tipo de Documento | Plano de Contas (ERP) |
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Nome do Produto (opcional) | (deixar em branco) |

> **Diferença do Conjunto 1:** usa IFU e Plano de Contas em vez de Manual Técnico e NFS. Testa os prompts distintos por tipo de origem.

---

## UC-F08 — Editar Produto e Especificações Técnicas

### Produto alvo para edição

| Campo | Valor atual | Valor novo |
|---|---|---|
| Nome | Kit para Glicose Enzimática Wiener BioGlic-100 | Kit para Glicose Enzimática Wiener BioGlic-100 Automação |
| Fabricante | Wiener Lab Group | Wiener Lab Group Argentina |
| Modelo | BioGlic-100 | BioGlic-100 Auto |
| SKU / Código Interno | WL-BG100 | WL-BG100-AUTO-BR |
| NCM | 3822.19.90 | 3822.19.90 |
| Descrição | Reagente enzimático para dosagem de glicose | Reagente enzimático para dosagem de glicose em equipamentos automáticos; 100 determinações por kit |

### Classificação

| Campo | Valor |
|---|---|
| Área | Diagnóstico in Vitro e Laboratório |
| Classe | Reagentes Bioquímicos |
| Subclasse | Reagente para Glicose |

### Especificações Técnicas (campos típicos da máscara de Reagente para Glicose)

| Especificação | Valor | Unidade |
|---|---|---|
| Número de determinações | 100 | det/kit |
| Método | Enzimático (GOD-PAP) | — |
| Tipo de amostra | Soro, plasma | — |
| Comprimento de onda | 505 | nm |
| Linearidade | 0 – 500 | mg/dL |
| Temperatura de reação | 37 | °C |
| Tempo de incubação | 5 | minutos |
| Conservação | 2–8 | °C |
| Validade do kit | 24 | meses |
| Volume da amostra | 10 | µL |
| Registro ANVISA | 10386890001 | — |
| Automação compatível | Cobas, Architect, Mindray BS | — |

---

## UC-F09 — Reprocessar Especificações com IA

### Produto alvo

| Campo | Valor |
|---|---|
| Produto | Kit para Glicose Enzimática Wiener BioGlic-100 Automação |
| Ação | Clicar "Reprocessar IA" no Card de Detalhes |

---

## UC-F10 — Consultar ANVISA e Busca Web

### Busca ANVISA

| Campo | Valor |
|---|---|
| Número de Registro ANVISA | 10386890001 |
| ou Nome do Produto | Kit Glicose BioGlic Wiener |

### Busca na Web

| Campo | Valor |
|---|---|
| Nome do Produto | Kit de Reagentes para Hemograma Completo Sysmex XN |
| Fabricante (opcional) | Sysmex |

---

## UC-F11 — Verificar Completude Técnica

### Produto alvo

| Campo | Valor |
|---|---|
| Produto | Kit para Glicose Enzimática Wiener BioGlic-100 Automação |
| Resultado esperado Geral | 65–80% (amarelo, pois o kit é mais simples) |
| Resultado esperado Dados Básicos | ≥ 85% |
| Resultado esperado Especificações | ≥ 60% |

> **Diferença do Conjunto 1:** resultado esperado em faixa amarela — testa a visualização do indicador em estado intermediário, não só verde.

---

## UC-F12 — Reprocessar Metadados de Captação

### Produto alvo

| Campo | Valor |
|---|---|
| Produto | Kit para Glicose Enzimática Wiener BioGlic-100 Automação |

### Metadados esperados após reprocessamento

| Metadado | Valor Esperado |
|---|---|
| Códigos CATMAT | 256, 258 (reagentes e produtos laboratoriais) |
| Códigos CATSER | (vazio para produto físico) |
| Termos de Busca Semânticos | "reagente glicose", "kit glicose", "kit bioquimico", "reagente laboratorio", "glicose enzimatica" |

---

## UC-F13 — Classificação e Funil de Monitoramento

### Árvore de Classificação para navegação

| Nível | Valor |
|---|---|
| Área | Diagnóstico in Vitro e Laboratório |
| Classe | Reagentes Bioquímicos |
| Subclasse | Reagente para Glicose |
| NCM da subclasse | 3822.19.90 |
| Campos da máscara | ≥ 6 campos |

### Exploração adicional (para teste de expand/collapse)

| Nível | Valor |
|---|---|
| Área (expandir) | Diagnóstico in Vitro e Laboratório |
| Classe (expandir) | Reagentes e Kits Diagnósticos |
| Subclasse (visualizar) | Kit de Hematologia |
| NCM | 3822.19.90 |

---

## UC-F14 — Configurar Pesos e Limiares de Score

### Pesos das Dimensões — Cenário Reagentes (prioridade técnica e jurídica)

| Dimensão | Peso |
|---|---|
| Peso Técnico | 0.30 |
| Peso Documental | 0.25 |
| Peso Complexidade | 0.05 |
| Peso Jurídico | 0.20 |
| Peso Logístico | 0.10 |
| Peso Comercial | 0.10 |
| **Soma** | **1.00** |

### Limiares de Decisão GO / NO-GO — Cenário Reagentes

| Dimensão | Mínimo GO | Máximo NO-GO |
|---|---|---|
| Score Final | 0.75 | 0.45 |
| Score Técnico | 0.70 | 0.40 |
| Score Jurídico | 0.85 | 0.55 |

### Teste de soma inválida (validação de erro)

| Dimensão | Peso (inválido) |
|---|---|
| Peso Técnico | 0.30 |
| Peso Documental | 0.25 |
| Peso Complexidade | 0.10 |
| Peso Jurídico | 0.20 |
| Peso Logístico | 0.10 |
| Peso Comercial | 0.10 |
| **Soma** | **1.05 (INVÁLIDA)** |

> **Ação esperada:** sistema deve exibir indicador vermelho e bloquear o salvamento.

---

## UC-F15 — Parâmetros Comerciais, Regiões e Modalidades

### Região de Atuação — Todo o Brasil

| Campo | Valor |
|---|---|
| Atuar em todo o Brasil | ✅ Sim (marcar checkbox) |
| Estados selecionados | (todos — automaticamente) |

> **Diferença do Conjunto 1:** testa o checkbox "Todo o Brasil" em vez de seleção individual de estados.

### Tempo de Entrega

| Campo | Valor |
|---|---|
| Prazo máximo aceito (dias) | 15 |
| Frequência máxima | Quinzenal |

### Mercado (TAM/SAM/SOM)

| Campo | Valor |
|---|---|
| TAM (Mercado Total) | R$ 4.200.000.000,00 |
| SAM (Mercado Alcançável) | R$ 950.000.000,00 |
| SOM (Mercado Objetivo) | R$ 62.000.000,00 |

> **Fonte:** estimativas baseadas no mercado público de reagentes e kits diagnósticos no Brasil — Ministério da Saúde, Programa de Qualificação das Ações de Vigilância em Saúde (QUALIVISA 2023) e dados PNCP 2022-2024.

### Custos e Margens

| Campo | Valor |
|---|---|
| Markup Padrão (%) | 35 |
| Custos Fixos Mensais (R$) | 42.000 |
| Frete Base (R$) | 180 |

### Modalidades de Licitação Desejadas

| Modalidade | Habilitado |
|---|---|
| Pregão Eletrônico | ✅ Sim |
| Concorrência | Não |
| Tomada de Preços | Não |
| Dispensa de Licitação | ✅ Sim |
| Inexigibilidade | ✅ Sim |
| Credenciamento | Não |

---

## UC-F16 — Fontes, Palavras-chave e NCMs de Busca

### Fontes de Editais — ações

| Fonte | Ação de Teste |
|---|---|
| PNCP | Manter Ativa |
| ComprasNet | Desativar |
| BLL (Bolsa de Licitações) | Manter Ativa |

> **Diferença do Conjunto 1:** desativa ComprasNet em vez de BLL — testa o comportamento de fonte inativa diferente.

### Palavras-chave de Busca

```
reagente hematologia, kit diagnostico, reagente bioquimico, controle qualidade laboratorio, glicose enzimatica, hemograma completo, kit elisa, reagente pcr, kit sorologia, medio lote reagente
```

### NCMs para Busca

```
3822.19.90, 3822.90.90, 3002.12.10, 3002.90.99, 3006.50.00
```

> **Referência NCM:**
> - 3822.19.90 — Outros reagentes de diagnóstico e de laboratório
> - 3822.90.90 — Outros preparados e materiais de referência para análises
> - 3002.12.10 — Soros e vacinas (diagnóstico)
> - 3002.90.99 — Outros produtos farmacológicos para diagnóstico
> - 3006.50.00 — Meios de cultivo para microrganismos

---

## UC-F17 — Notificações e Preferências

### Configurações de Notificação

| Campo | Valor |
|---|---|
| Email para notificações | licitacoes@rp3x.com.br |
| Receber por — Email | ✅ Sim |
| Receber por — Sistema | ✅ Sim |
| Receber por — SMS | ✅ Sim |
| Frequência do resumo | Semanal |

> **Diferença do Conjunto 1:** SMS ativado e frequência Semanal (vs. Diario no Conj. 1).

### Preferências do Sistema

| Campo | Valor |
|---|---|
| Tema | Claro |
| Idioma | Português (pt-BR) |
| Fuso horário | America/Sao_Paulo |

> **Diferença do Conjunto 1:** tema Claro (vs. Escuro no Conj. 1).

---

## Dados Auxiliares — Fixtures e Arquivos

### Arquivos de teste recomendados

| Uso | Caminho sugerido | Alternativa |
|---|---|---|
| PDF genérico | `tests/fixtures/teste_upload.pdf` | qualquer PDF < 2 MB |
| Imagem (foto de documento) | `tests/fixtures/test_image.png` | qualquer PNG/JPG < 1 MB |
| IFU simulada | `tests/fixtures/teste_upload.pdf` | — |
| Plano de contas simulado | `tests/fixtures/teste_upload.pdf` | — |

### URLs de fabricantes reais (para UC-F07 via Website)

| Fabricante | URL para uso em teste |
|---|---|
| Sysmex (hematologia) | https://www.sysmex.com.br/products |
| Wiener Lab (reagentes) | https://www.wiener-lab.com/en/products/hematology |
| Roche Diagnostics | https://diagnostics.roche.com/br/pt/products.html |

---

## Cenários de Borda Cobertos por Este Conjunto

| Cenário | UC | Detalhe |
|---|---|---|
| Facebook em branco | F01 | Campo opcional não preenchido |
| 3 telefones cadastrados | F02 | Mais telefones que no Conj. 1 |
| 4 documentos (mais que 3) | F03 | Testa lista maior na DataTable |
| Status "Vence" e "Upload manual" | F04 | Estados distintos do Conj. 1 |
| Apenas 2 responsáveis | F05 | Sem Preposto |
| Busca por "hematologia" | F06 | Termo diferente de "ultrassom" |
| IFU e Plano de Contas | F07 | Tipos de origem distintos |
| Reagente bioquímico (não equipamento) | F08 | Máscara de specs diferente |
| Completude em faixa amarela | F11 | Indicador intermediário |
| Todo o Brasil (checkbox) | F15 | Não seleção individual |
| Soma inválida de pesos (1.05) | F14 | Teste de validação de erro |
| SMS ativado | F17 | Canal adicional |
| Tema Claro | F17 | Preferência diferente |
| ComprasNet desativada | F16 | Fonte desativada diferente |

---

## Notas para o Dono do Produto

1. **Fluxo completo sugerido para inspeção manual:** F01 → F02 → F03 → F04 → F05 → F07 (IFU) → F06 → F08 → F11 → F14 (incluir teste soma inválida) → F15 (Todo o Brasil) → F16 → F17.
2. **Soma inválida no UC-F14:** ao usar os pesos do "Teste de soma inválida" (soma = 1.05), o botão "Salvar Pesos" deve ser bloqueado e o indicador deve aparecer em vermelho. Após verificar, corrigir para os pesos válidos (soma = 1.00) e salvar.
3. **UC-F07 via Website:** as URLs indicadas são de fabricantes reais. A IA tentará acessá-las via web. Em ambiente sem internet, usar a Opção B (IFU com arquivo) como fallback.
4. **Completude amarela no UC-F11:** espera-se que o Kit de Glicose tenha completude entre 65-80%, por ter menos especificações preenchidas que o Monitor do Conjunto 1. Isso valida a exibição do indicador em amarelo.
5. **NCMs de reagentes:** os NCMs 3822.xx.xx são da posição "Reagentes de diagnóstico e laboratório" da TEC/NBM; confirmar que estão na base de classificação do sistema.
6. **Empresa real:** RP3X Comércio e Representações Ltda. — CNPJ 68.218.593/0001-09 — ATIVA na Receita Federal desde 04/08/1992 — Ribeirão Preto/SP.
