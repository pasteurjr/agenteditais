# Mapa da Tela Inicial (Pagina 1 do PDF CARA SISTEMA)

Este documento mapeia cada item da primeira pagina do PDF "CARA SISTEMA.pdf" para as telas do sistema facilicita.ia, identificando o que esta implementado e o que falta.

---

## 1. EMPRESA (Menu: Configuracoes > Empresa)

### 1.1 Cadastro

| Item do PDF | Onde esta na Tela | Status |
|-------------|-------------------|--------|
| Razao Social | `EmpresaPage` - Card "Informacoes Cadastrais" | ✅ Implementado |
| CNPJ | `EmpresaPage` - Card "Informacoes Cadastrais" | ✅ Implementado |
| Inscricao Estadual | `EmpresaPage` - Card "Informacoes Cadastrais" | ✅ Implementado |
| Website | `EmpresaPage` - Secao "Presenca Digital" | ✅ Implementado |
| Instagram | `EmpresaPage` - Secao "Presenca Digital" | ✅ Implementado |
| LinkedIn | `EmpresaPage` - Secao "Presenca Digital" | ✅ Implementado |
| Facebook | `EmpresaPage` | ❌ **FALTA** |
| Emails, Celulares | `EmpresaPage` - Campo "Email Principal" e "Telefone" | ✅ Implementado |

### 1.2 Uploads

| Item do PDF | Onde esta na Tela | Status |
|-------------|-------------------|--------|
| Contrato Social | `EmpresaPage` - Card "Documentos da Empresa" | ✅ Implementado |
| AFE | `EmpresaPage` - Card "Documentos da Empresa" | ✅ Implementado |
| CBPAD | `EmpresaPage` - Card "Documentos da Empresa" | ✅ Implementado |
| CBPP | `EmpresaPage` - Card "Documentos da Empresa" | ✅ Implementado |
| Corpo de Bombeiros | `EmpresaPage` - Card "Documentos da Empresa" | ✅ Implementado |

---

## 2. PORTFOLIO (Menu: Configuracoes > Portfolio)

### 2.1 Uploads

| Item do PDF | Onde esta na Tela | Status |
|-------------|-------------------|--------|
| Upload de Manuais | `PortfolioPage` - Botao "Upload PDF" | ✅ Implementado |
| Upload de Instrucoes de Uso | `PortfolioPage` - Botao "Upload PDF" (mesmo campo) | ✅ Implementado |
| Upload NFS | `PortfolioPage` | ❌ **FALTA** |
| Upload Plano de Contas | `PortfolioPage` | ❌ **FALTA** |
| Upload Folders | `PortfolioPage` - Botao "Upload PDF" | ✅ Implementado (aceita PDF) |
| Website de Consultas | `PortfolioPage` - Botao "Buscar na Web" | ✅ Implementado |

### 2.2 Cadastro

| Item do PDF | Onde esta na Tela | Status |
|-------------|-------------------|--------|
| Classe de Produtos | `ParametrizacoesPage` - Aba "Produtos" > Card "Estrutura de Classificacao" | ✅ Implementado |
| NCM de cada Classe | `ParametrizacoesPage` - Aba "Produtos" > Tabela com coluna "NCMs" | ✅ Implementado |
| Subclasse de Produtos | `ParametrizacoesPage` - Aba "Produtos" > Coluna "Subclasses" | ⚠️ Parcial (mostra qtd, nao expande) |
| NCM de cada Subclasse | `ParametrizacoesPage` | ❌ **FALTA** |

---

## 3. PARAMETRIZACOES (Menu: Configuracoes > Parametrizacoes)

### 3.1 Produtos

| Item do PDF | Onde esta na Tela | Status |
|-------------|-------------------|--------|
| Arquitetura das Classes | `ParametrizacoesPage` - Aba "Produtos" | ✅ Implementado |
| Arquitetura das Subclasses | `ParametrizacoesPage` - Aba "Produtos" | ⚠️ Parcial |
| IA gera modelo do website/folders | `ParametrizacoesPage` - Botao "Gerar com IA" | ⚠️ Botao existe, funcao nao implementada |

### 3.2 Comerciais

| Item do PDF | Onde esta na Tela | Status |
|-------------|-------------------|--------|
| Regiao de atuacao | `ParametrizacoesPage` - Aba "Comercial" > Card "Regiao de Atuacao" | ⚠️ Placeholder (mapa nao interativo) |
| Tempo de entrega | `ParametrizacoesPage` - Aba "Comercial" > Card "Tempo de Entrega" | ✅ Implementado |
| TAM | `ParametrizacoesPage` - Aba "Comercial" > Card "Mercado (TAM/SAM/SOM)" | ✅ Implementado |
| SAM | `ParametrizacoesPage` - Aba "Comercial" > Card "Mercado (TAM/SAM/SOM)" | ✅ Implementado |
| SOM | `ParametrizacoesPage` - Aba "Comercial" > Card "Mercado (TAM/SAM/SOM)" | ✅ Implementado |

---

## 4. FLUXO COMERCIAL (Menu Lateral Esquerdo)

| Item do PDF | Menu | Tela | Arquivo | Status |
|-------------|------|------|---------|--------|
| Captacao | Fluxo Comercial > Captacao | `CaptacaoPage` | `CaptacaoPage.tsx` | ✅ Implementado |
| Validacao | Fluxo Comercial > Validacao | `ValidacaoPage` | `ValidacaoPage.tsx` | ✅ Implementado |
| Precificacao | Fluxo Comercial > Precificacao | `PrecificacaoPage` | `PrecificacaoPage.tsx` | ✅ Implementado |
| Proposta | Fluxo Comercial > Proposta | `PropostaPage` | `PropostaPage.tsx` | ✅ Implementado |
| Submissao | Fluxo Comercial > Submissao | `SubmissaoPage` | `SubmissaoPage.tsx` | ✅ Implementado |
| Lances | Fluxo Comercial > Lances | `LancesPage` | `LancesPage.tsx` | ✅ Implementado |
| Followup | Fluxo Comercial > Followup | `FollowupPage` | `FollowupPage.tsx` | ✅ Implementado |
| Impugnacao | Fluxo Comercial > Impugnacao | `ImpugnacaoPage` | `ImpugnacaoPage.tsx` | ✅ Implementado |
| Producao | Fluxo Comercial > Producao | `ProducaoPage` | `ProducaoPage.tsx` | ✅ Implementado |
| CRM | - | - | - | ❌ **FALTA** |

---

## 5. INDICADORES (Menu Lateral Direito)

| Item do PDF | Menu | Tela | Arquivo | Status |
|-------------|------|------|---------|--------|
| Flags | Indicadores > Flags | `FlagsPage` | `FlagsPage.tsx` | ✅ Implementado |
| Monitoria | Indicadores > Monitoria | `MonitoriaPage` | `MonitoriaPage.tsx` | ✅ Implementado |
| Concorrencia | Indicadores > Concorrencia | `ConcorrenciaPage` | `ConcorrenciaPage.tsx` | ✅ Implementado |
| Mercado | Indicadores > Mercado | `MercadoPage` | `MercadoPage.tsx` | ✅ Implementado |
| Contratado X Realizado | Indicadores > Contratado X Realizado | `ContratadoRealizadoPage` | `ContratadoRealizadoPage.tsx` | ✅ Implementado |
| Pedidos em Atraso | Indicadores > Contratado X Realizado | `ContratadoRealizadoPage` | `ContratadoRealizadoPage.tsx` | ✅ Implementado (mesma tela) |
| Perdas | Indicadores > Perdas | `PerdasPage` | `PerdasPage.tsx` | ✅ Implementado |

---

## 6. RESUMO DO QUE FALTA IMPLEMENTAR

### 6.1 Campos Faltantes

| Tela | Campo | Prioridade |
|------|-------|------------|
| `EmpresaPage` | Facebook | Baixa |
| `PortfolioPage` | Upload de NFS | Media |
| `PortfolioPage` | Upload de Plano de Contas | Media |
| `ParametrizacoesPage` | NCM por Subclasse (detalhe) | Alta |

### 6.2 Tela Faltante

| Tela | Descricao | Prioridade |
|------|-----------|------------|
| `CRMPage` | Integracao com CRM para Leads, acoes pos-perda, metas de vendedores | Alta |

### 6.3 Funcionalidades Parciais

| Tela | Funcionalidade | O que falta | Prioridade |
|------|----------------|-------------|------------|
| `ParametrizacoesPage` | Mapa de Regiao de Atuacao | Tornar mapa interativo (selecao de estados) | Media |
| `ParametrizacoesPage` | Arquitetura de Subclasses | Permitir expandir e ver/editar subclasses | Alta |
| `ParametrizacoesPage` | Botao "Gerar com IA" | Implementar geracao automatica de classes/subclasses | Alta |
| `PortfolioPage` | Integracao ANVISA | Buscar registros de produtos na ANVISA | Media |
| `PortfolioPage` | Integracao ERP | Importar plano de contas do ERP | Baixa |

---

## 7. ACOES NECESSARIAS PARA COMPLETAR

### 7.1 EmpresaPage.tsx

```typescript
// Adicionar campo Facebook na secao "Presenca Digital"
<FormField label="Facebook">
  <TextInput value={facebook} onChange={setFacebook} />
</FormField>
```

### 7.2 PortfolioPage.tsx

```typescript
// Adicionar opcoes de upload para NFS e Plano de Contas no modal de upload
<FormField label="Tipo de Arquivo" required>
  <SelectInput
    value={tipoArquivo}
    onChange={setTipoArquivo}
    options={[
      { value: "manual", label: "Manual Tecnico" },
      { value: "instrucoes", label: "Instrucoes de Uso" },
      { value: "folder", label: "Folder" },
      { value: "nfs", label: "NFS (Nota Fiscal de Servico)" },
      { value: "plano_contas", label: "Plano de Contas" },
    ]}
  />
</FormField>
```

### 7.3 ParametrizacoesPage.tsx

```typescript
// Adicionar modal para editar subclasses com NCMs
// Tornar a linha da tabela expansivel para mostrar subclasses
// Implementar funcao no botao "Gerar com IA" para chamar API
```

### 7.4 Nova Tela: CRMPage.tsx

Criar nova tela com:
- Lista de Leads (editais com aderencia)
- Acoes pos-perda
- Metas de vendedores (editais ganhos)
- Integracao com CRM externo via API

---

## 8. ARQUIVOS DO SISTEMA

### 8.1 Estrutura de Paginas

```
frontend/src/pages/
├── index.ts                    # Exports
├── LoginPage.tsx               # Autenticacao
├── RegisterPage.tsx            # Registro
│
├── # FLUXO COMERCIAL
├── CaptacaoPage.tsx            ✅
├── ValidacaoPage.tsx           ✅
├── PrecificacaoPage.tsx        ✅
├── PropostaPage.tsx            ✅
├── SubmissaoPage.tsx           ✅
├── LancesPage.tsx              ✅
├── FollowupPage.tsx            ✅
├── ImpugnacaoPage.tsx          ✅
├── ProducaoPage.tsx            ✅
├── CRMPage.tsx                 ❌ FALTA CRIAR
│
├── # INDICADORES
├── FlagsPage.tsx               ✅
├── MonitoriaPage.tsx           ✅
├── ConcorrenciaPage.tsx        ✅
├── MercadoPage.tsx             ✅
├── ContratadoRealizadoPage.tsx ✅ (inclui Pedidos em Atraso)
├── PerdasPage.tsx              ✅
│
├── # CONFIGURACOES
├── EmpresaPage.tsx             ✅ (falta Facebook)
├── PortfolioPage.tsx           ✅ (falta NFS, Plano de Contas)
└── ParametrizacoesPage.tsx     ✅ (falta NCM por subclasse, IA)
```

### 8.2 Rotas no App.tsx

```typescript
// Rota para CRM precisa ser adicionada
case "crm":
  return <CRMPage />;
```

### 8.3 Menu na Sidebar

```typescript
// Adicionar item CRM no menu Fluxo Comercial
{ id: "crm", label: "CRM", icon: <Users size={18} /> }
```

---

## 9. CHECKLIST DE IMPLEMENTACAO

### Prioridade Alta
- [ ] Criar `CRMPage.tsx`
- [ ] Adicionar rota "crm" no `App.tsx`
- [ ] Adicionar menu CRM na `Sidebar.tsx`
- [ ] Implementar expansao de subclasses em `ParametrizacoesPage.tsx`
- [ ] Implementar cadastro de NCM por subclasse
- [ ] Implementar funcao "Gerar com IA" para classes/subclasses

### Prioridade Media
- [ ] Adicionar upload de NFS em `PortfolioPage.tsx`
- [ ] Adicionar upload de Plano de Contas em `PortfolioPage.tsx`
- [ ] Tornar mapa de regiao interativo em `ParametrizacoesPage.tsx`
- [ ] Implementar integracao com ANVISA

### Prioridade Baixa
- [ ] Adicionar campo Facebook em `EmpresaPage.tsx`
- [ ] Implementar integracao com ERP para plano de contas

---

## 10. CONCLUSAO

O sistema facilicita.ia tem **90% das telas** da pagina 1 do PDF implementadas. Os principais gaps sao:

1. **Tela CRM** - Completamente ausente
2. **Subclasses com NCM** - Estrutura incompleta
3. **Geracao automatica pela IA** - Botao existe, funcao nao
4. **Tipos de upload adicionais** - NFS e Plano de Contas

A prioridade deve ser criar a tela CRM e completar a estrutura de classificacao de produtos com NCMs por subclasse.
