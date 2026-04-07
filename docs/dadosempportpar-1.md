# Conjunto de Dados 1 — Empresa, Portfolio e Parametrizações
# Validação Automatizada e pelo Dono do Produto

**Empresa:** CH Hospitalar Comércio de Equipamentos Médicos e Hospitalares Ltda.
**Perfil:** Fornecedora de equipamentos médico-hospitalares para cirurgia, UTI, emergência e diagnóstico por imagem, atuante em licitações públicas via PNCP.
**Uso:** Conjunto principal — dados completos e válidos para fluxo feliz de todos os UC-F01 a UC-F17.

---

## Contexto de Acesso — Usuários e Empresas

### Usuários de Validação

| Campo | Usuário Principal | Usuário Secundário |
|---|---|---|
| Email | valida1@valida.com.br | valida2@valida.com.br |
| Senha | 123456 | 123456 |
| Perfil | Superusuário | Superusuário |
| Empresa vinculada | CH Hospitalar | (nenhuma — a ser associada) |
| Papel | admin | — |

### Fluxo de Login (Superusuário)

1. Acessar o sistema em `http://localhost:5175`
2. Preencher email e senha
3. Após autenticação, aparece **tela de seleção de empresa** (lista todas as empresas disponíveis)
4. Clicar em "CH Hospitalar Comércio de Equipamentos Médicos e Hospitalares Ltda."
5. Sistema carrega o Dashboard com a empresa selecionada

### Menus exclusivos de Superusuário (visíveis no Sidebar)

| Menu | Função |
|---|---|
| Usuarios | Criar, editar, listar usuários do sistema |
| Associar Empresa/Usuario | Vincular ou desvincular usuários a empresas, definir papel (admin/operador) |
| Selecionar Empresa | Trocar a empresa ativa sem sair do sistema |

### Pré-requisito: Associar valida2 à CH Hospitalar

Antes de usar valida2 nos testes de UC-F01 a UC-F17, é necessário:
1. Fazer login com valida1
2. Acessar menu "Associar Empresa/Usuario"
3. Selecionar empresa: CH Hospitalar
4. Selecionar usuário: valida2@valida.com.br
5. Papel: admin
6. Clicar "Vincular"

---

## UC-F01 — Cadastro Principal da Empresa

### Dados Cadastrais

| Campo | Valor |
|---|---|
| Razão Social | CH Hospitalar Comércio de Equipamentos Médicos e Hospitalares Ltda. |
| Nome Fantasia | CH Hospitalar |
| CNPJ | 43.712.232/0001-85 |
| Inscrição Estadual | 136.432.789.110 |
| Website | https://www.chhospitalar.com.br |
| Instagram | @chhospitalar |
| LinkedIn | ch-hospitalar-equipamentos |
| Facebook | CHHospitalar |
| Endereço | Rua Maria Curupaiti, 627, Andar 3 Sala 02 |
| Cidade | São Paulo |
| UF | SP |
| CEP | 02452-001 |

---

## UC-F02 — Contatos e Área Padrão

### Emails de Contato

| # | Email |
|---|---|
| 1 | licitacoes@chhospitalar.com.br |
| 2 | comercial@chhospitalar.com.br |
| 3 | fiscal@chhospitalar.com.br |

### Celulares / Telefones

| # | Telefone |
|---|---|
| 1 | (11) 2934-5600 |
| 2 | (11) 98723-4100 |

### Área de Atuação Padrão

| Campo | Valor |
|---|---|
| Área de Atuação Padrão | Equipamentos Médico-Hospitalares |

---

## UC-F03 — Documentos da Empresa

### Documento 1 — CNPJ

| Campo | Valor |
|---|---|
| Tipo de Documento | Certidão / Comprovante de CNPJ |
| Arquivo | `tests/fixtures/teste_upload.pdf` (arquivo de teste, PDF) |
| Validade | 2026-12-31 |

### Documento 2 — Contrato Social

| Campo | Valor |
|---|---|
| Tipo de Documento | Contrato Social / Estatuto |
| Arquivo | `tests/fixtures/teste_upload.pdf` (arquivo de teste, PDF) |
| Validade | (sem validade — campo deixado em branco) |

### Documento 3 — Alvará de Funcionamento

| Campo | Valor |
|---|---|
| Tipo de Documento | Alvará de Funcionamento |
| Arquivo | `tests/fixtures/teste_upload.pdf` (arquivo de teste, PDF) |
| Validade | 2026-04-30 |

### Verificação de Status Esperados

| Documento | Status Esperado | Cor |
|---|---|---|
| CNPJ | OK | Verde |
| Contrato Social | OK | Verde |
| Alvará de Funcionamento | Vence | Amarelo (< 30 dias) |

> **Nota para validação:** usar o arquivo `tests/fixtures/teste_upload.pdf` como substituto de qualquer PDF.

---

## UC-F04 — Certidões Automáticas

### CNPJ para busca automática

| Campo | Valor |
|---|---|
| CNPJ | 43.712.232/0001-85 |

### Frequência de busca automática

| Campo | Valor |
|---|---|
| Frequência | Semanal |

### Upload manual de certidão (quando busca automática retorna "Erro" ou "Não disponível")

| Campo | Valor |
|---|---|
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Data de Vencimento | 2026-12-31 |
| Número | CND-2025-43712 |

### Edição de certidão via modal de detalhe

| Campo | Valor |
|---|---|
| Status | Valida |
| Validade | 2026-12-31 |
| Número | CND-2025-43712 |
| Órgão Emissor | Receita Federal do Brasil |

### Certidões esperadas na lista após busca

| Certidão | Status Típico |
|---|---|
| Certidão Negativa de Débitos Federais (RFB/PGFN) | Valida ou Pendente |
| Certidão de Débitos Trabalhistas (TST) | Valida ou Pendente |
| Certidão Negativa FGTS (CEF) | Valida ou Pendente |
| Certidão Negativa Estadual (SP) | Valida ou Pendente |
| Certidão Negativa Municipal (SP) | Valida ou Pendente |

---

## UC-F05 — Responsáveis da Empresa

### Responsável 1 — Representante Legal

| Campo | Valor |
|---|---|
| Tipo | Representante Legal |
| Nome | Diego Ricardo Munoz |
| Cargo | Sócio-Administrador |
| Email | diego.munoz@chhospitalar.com.br |
| Telefone | (11) 98723-4100 |

### Responsável 2 — Preposto

| Campo | Valor |
|---|---|
| Tipo | Preposto |
| Nome | Carla Regina Souza |
| Cargo | Gerente de Licitações |
| Email | carla.souza@chhospitalar.com.br |
| Telefone | (11) 2934-5601 |

### Responsável 3 — Responsável Técnico

| Campo | Valor |
|---|---|
| Tipo | Responsável Técnico |
| Nome | Dr. Paulo Roberto Menezes |
| Cargo | Engenheiro Biomédico |
| Email | paulo.menezes@chhospitalar.com.br |
| Telefone | (11) 2934-5602 |

---

## UC-F06 — Listar, Filtrar e Inspecionar Produtos

### Filtros para validação

| Filtro | Valor de Teste |
|---|---|
| Área | Equipamentos Médico-Hospitalares |
| Classe | Equipamentos de Diagnóstico por Imagem |
| Subclasse | Ultrassonógrafo |
| Busca por texto | "ultrassom" |
| Busca por texto alternativa | "monitor" |

### Produto esperado na lista (cadastrado via UC-F07)

| Campo | Valor |
|---|---|
| Nome | Ultrassonógrafo Portátil Mindray M7T |
| Fabricante | Mindray |
| SKU | MD-M7T-BR-2024 |
| Status Pipeline | Cadastrado |

---

## UC-F07 — Cadastro de Produto por IA

### Opção A — Website do Fabricante

| Campo | Valor |
|---|---|
| Tipo de Documento | Website |
| URL do Website | https://www.mindray.com/en/products/ultrasound/general-imaging.html |
| Área (opcional) | Equipamentos Médico-Hospitalares |
| Classe (opcional) | Equipamentos de Diagnóstico por Imagem |
| Subclasse (opcional) | Ultrassonógrafo |

### Opção B — Manual Técnico (arquivo)

| Campo | Valor |
|---|---|
| Tipo de Documento | Manual Técnico |
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Nome do Produto (opcional) | Monitor Multiparamétrico Mindray iMEC10 |
| Área (opcional) | Equipamentos Médico-Hospitalares |
| Classe (opcional) | Monitoração |
| Subclasse (opcional) | Monitor Multiparamétrico |

### Opção C — Nota Fiscal (NFS) — múltiplos itens

| Campo | Valor |
|---|---|
| Tipo de Documento | Nota Fiscal (NFS) |
| Arquivo | `tests/fixtures/teste_upload.pdf` |
| Nome do Produto (opcional) | (deixar em branco — IA extrai da NF) |

---

## UC-F08 — Editar Produto e Especificações Técnicas

### Produto alvo para edição

| Campo | Valor atual | Valor novo |
|---|---|---|
| Nome | Monitor Multiparamétrico Mindray iMEC10 | Monitor Multiparamétrico Mindray iMEC10 Plus |
| Fabricante | Mindray | Mindray Bio-Medical Electronics |
| Modelo | iMEC10 | iMEC10 Plus |
| SKU / Código Interno | MD-IMEC10 | MD-IMEC10-PLUS-BR |
| NCM | 9018.19.90 | 9018.19.90 |
| Descrição | Monitor multiparamétrico para UTI | Monitor multiparamétrico para UTI e pronto-socorro, 10 parâmetros simultâneos, tela touch 12" |

### Classificação

| Campo | Valor |
|---|---|
| Área | Equipamentos Médico-Hospitalares |
| Classe | Monitoração |
| Subclasse | Monitor Multiparamétrico |

### Especificações Técnicas (campos típicos da máscara de Monitor Multiparamétrico)

| Especificação | Valor | Unidade |
|---|---|---|
| Número de parâmetros | 10 | parâmetros |
| Tamanho do display | 12,1 | polegadas |
| Tipo de display | TFT Touch colorido | — |
| SpO2 | Sim | — |
| ECG | Sim (12 derivações) | — |
| NIBP | Sim | — |
| Temperatura | Sim | °C |
| Frequência respiratória | Sim | irpm |
| EtCO2 | Sim | — |
| Bateria | 6 | horas |
| Peso | 4,1 | kg |
| Alimentação | 100-240 V | VAC |
| Registro ANVISA | 80262090001 | — |

---

## UC-F09 — Reprocessar Especificações com IA

### Produto alvo

| Campo | Valor |
|---|---|
| Produto | Monitor Multiparamétrico Mindray iMEC10 Plus |
| Ação | Clicar "Reprocessar IA" na linha da DataTable |

> A validação consiste em verificar que o botão responde, o chat recebe a instrução e a lista é recarregada após alguns segundos.

---

## UC-F10 — Consultar ANVISA e Busca Web

### Busca ANVISA

| Campo | Valor |
|---|---|
| Número de Registro ANVISA | 80262090001 |
| ou Nome do Produto | Monitor Multiparamétrico Mindray |

### Busca na Web

| Campo | Valor |
|---|---|
| Nome do Produto | Ultrassonógrafo Portátil Mindray M7T |
| Fabricante (opcional) | Mindray |

---

## UC-F11 — Verificar Completude Técnica

### Produto alvo

| Campo | Valor |
|---|---|
| Produto | Monitor Multiparamétrico Mindray iMEC10 Plus |
| Resultado esperado Geral | ≥ 80% (verde) após edição completa |
| Resultado esperado Dados Básicos | ≥ 90% |
| Resultado esperado Especificações | ≥ 75% |

---

## UC-F12 — Reprocessar Metadados de Captação

### Produto alvo

| Campo | Valor |
|---|---|
| Produto | Monitor Multiparamétrico Mindray iMEC10 Plus |

### Metadados esperados após reprocessamento

| Metadado | Valor Esperado |
|---|---|
| Códigos CATMAT | 462, 444 (equipamentos médico-hospitalares) |
| Códigos CATSER | (vazio para produto físico) |
| Termos de Busca Semânticos | "monitor multiparametrico", "monitor sinais vitais", "monitor uti", "bedside monitor" |

---

## UC-F13 — Classificação e Funil de Monitoramento

### Árvore de Classificação para navegação

| Nível | Valor |
|---|---|
| Área | Equipamentos Médico-Hospitalares |
| Classe | Monitoração |
| Subclasse | Monitor Multiparamétrico |
| NCM da subclasse | 9018.19.90 |
| Campos da máscara | ≥ 8 campos |

### Funil de Monitoramento — estado esperado

| Elemento | Valor Esperado |
|---|---|
| Monitoramento Contínuo | ≥ 1 ativo |
| Filtro Inteligente (tags) | "Monitoração", "Diagnóstico por Imagem" |
| Classificação Automática | ≥ 2 classes |
| StatusBadge | "Agente Ativo" ou "Agente Inativo" (qualquer) |

---

## UC-F14 — Configurar Pesos e Limiares de Score

### Pesos das Dimensões (devem somar 1.00)

| Dimensão | Peso |
|---|---|
| Peso Técnico | 0.25 |
| Peso Documental | 0.20 |
| Peso Complexidade | 0.10 |
| Peso Jurídico | 0.15 |
| Peso Logístico | 0.15 |
| Peso Comercial | 0.15 |
| **Soma** | **1.00** |

### Limiares de Decisão GO / NO-GO

| Dimensão | Mínimo GO | Máximo NO-GO |
|---|---|---|
| Score Final | 0.70 | 0.40 |
| Score Técnico | 0.65 | 0.35 |
| Score Jurídico | 0.80 | 0.50 |

### Regra resultante esperada

```
GO: Score Final ≥ 0.70 E Score Técnico ≥ 0.65 E Score Jurídico ≥ 0.80
NO-GO: Score Final ≤ 0.40 OU Score Técnico ≤ 0.35 OU Score Jurídico ≤ 0.50
AVALIAR: demais
```

---

## UC-F15 — Parâmetros Comerciais, Regiões e Modalidades

### Região de Atuação

| Campo | Valor |
|---|---|
| Atuar em todo o Brasil | Não |
| Estados selecionados | SP, RJ, MG, RS, PR, SC, DF, GO, BA, PE |

### Tempo de Entrega

| Campo | Valor |
|---|---|
| Prazo máximo aceito (dias) | 30 |
| Frequência máxima | Mensal |

### Mercado (TAM/SAM/SOM)

| Campo | Valor |
|---|---|
| TAM (Mercado Total) | R$ 12.500.000.000,00 |
| SAM (Mercado Alcançável) | R$ 2.800.000.000,00 |
| SOM (Mercado Objetivo) | R$ 180.000.000,00 |

### Custos e Margens

| Campo | Valor |
|---|---|
| Markup Padrão (%) | 28 |
| Custos Fixos Mensais (R$) | 85.000 |
| Frete Base (R$) | 350 |

### Modalidades de Licitação Desejadas

| Modalidade | Habilitado |
|---|---|
| Pregão Eletrônico | ✅ Sim |
| Concorrência | ✅ Sim |
| Tomada de Preços | ✅ Sim |
| Dispensa de Licitação | ✅ Sim |
| Inexigibilidade | Não |
| Credenciamento | Não |

---

## UC-F16 — Fontes, Palavras-chave e NCMs de Busca

### Fontes de Editais — ações

| Fonte | Ação de Teste |
|---|---|
| PNCP | Manter Ativa |
| ComprasNet | Manter Ativa |
| BLL (Bolsa de Licitações) | Desativar, depois reativar |

### Palavras-chave de Busca

```
monitor multiparametrico, ultrassonografo, equipamento hospitalar, material hospitalar, ventilador pulmonar, oximetro, desfibrilador, bisturi eletrico, autoclave, mesa cirurgica
```

### NCMs para Busca

```
9018.19.90, 9018.90.99, 9021.90.90, 9018.11.00, 9402.90.00
```

> **Referência NCM:**
> - 9018.19.90 — Outros instrumentos e aparelhos de medicina (monitores, etc.)
> - 9018.90.99 — Outros instrumentos médico-cirúrgicos
> - 9021.90.90 — Outros artigos e aparelhos de prótese
> - 9018.11.00 — Eletrocardiógrafos
> - 9402.90.00 — Mobiliário para uso médico-cirúrgico

---

## UC-F17 — Notificações e Preferências

### Configurações de Notificação

| Campo | Valor |
|---|---|
| Email para notificações | licitacoes@chhospitalar.com.br |
| Receber por — Email | ✅ Sim |
| Receber por — Sistema | ✅ Sim |
| Receber por — SMS | Não |
| Frequência do resumo | Diario |

### Preferências do Sistema

| Campo | Valor |
|---|---|
| Tema | Escuro |
| Idioma | Português (pt-BR) |
| Fuso horário | America/Sao_Paulo |

---

## Dados Auxiliares — Fixtures e Arquivos

### Arquivos de teste recomendados

| Uso | Caminho sugerido | Alternativa |
|---|---|---|
| PDF genérico (documentos, certidões) | `tests/fixtures/teste_upload.pdf` | qualquer PDF < 2 MB |
| Imagem (foto de documento) | `tests/fixtures/test_image.png` | qualquer PNG/JPG < 1 MB |
| Manual técnico simulado | `tests/fixtures/teste_upload.pdf` | — |
| NFS simulada | `tests/fixtures/teste_upload.pdf` | — |

### URLs de fabricantes reais (para UC-F07 via Website)

| Fabricante | URL para uso em teste |
|---|---|
| Mindray (ultrassom e monitores) | https://www.mindray.com/en/products/ultrasound/general-imaging.html |
| Philips (monitores) | https://www.philips.com.br/healthcare/medical-products/patient-monitoring |
| GE Healthcare | https://www.gehealthcare.com/products/monitoring |

---

## Notas para o Dono do Produto

1. **Fluxo completo sugerido para inspeção manual:** F01 → F02 → F03 → F04 → F05 → F07 → F06 → F08 → F11 → F12 → F13 → F14 → F15 → F16 → F17.
2. **UC-F04 (Certidões):** a busca automática depende de CapSolver configurado e de conexão externa. Em ambiente sem acesso à internet, usar o fluxo de upload manual.
3. **UC-F07 via Website:** requer acesso externo real para que a IA extraia dados. Verificar conectividade antes.
4. **UC-F09 e UC-F12 (Reprocessar IA/Metadados):** os botões disparam ações assíncronas; aguardar 10-30 segundos antes de verificar o resultado.
5. **UC-F14 Pesos:** o sistema bloqueia o salvamento se a soma != 1.00. Sempre conferir o indicador de soma antes de clicar "Salvar Pesos".
6. **UC-F16 Fontes:** o botão "Gerenciar Fontes" redireciona ao CRUD de fontes — verificar se a rota está acessível.
7. **Dados de mercado (TAM/SAM/SOM):** baseados em estimativas do mercado público de saúde brasileiro (fonte: Ministério da Saúde — relatórios de execução orçamentária 2023/2024).
8. **Empresa real:** CH Hospitalar — CNPJ 43.712.232/0001-85 — ATIVA na Receita Federal desde 30/09/2021 — Sócio: Diego Ricardo Munoz.
