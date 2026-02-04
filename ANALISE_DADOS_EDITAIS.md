# Análise de Qualidade dos Dados de Editais

## Diagnóstico Atual

### Campos do Banco vs API PNCP

| Campo Banco | Campo API PNCP | Status | Problema |
|-------------|----------------|--------|----------|
| numero | numeroCompra | OK | - |
| orgao | orgaoEntidade.razaoSocial | OK | - |
| objeto | objetoCompra | OK | - |
| modalidade | modalidadeNome | OK | - |
| valor_referencia | valorTotalEstimado | PARCIAL | Não está sendo salvo |
| data_abertura | dataAberturaProposta | PARCIAL | Não está sendo salvo |
| data_publicacao | dataPublicacaoPncp | PARCIAL | Não está sendo salvo |
| uf | unidadeOrgao.ufSigla | FALTANDO | 78% dos editais sem UF |
| cidade | unidadeOrgao.municipioNome | FALTANDO | 78% dos editais sem cidade |
| url | linkSistemaOrigem | ERRADO | URLs genéricas, não funcionais |
| fonte | - | OK | - |

### Campos da API PNCP Não Utilizados

1. **processo** - Número do processo administrativo
2. **dataEncerramentoProposta** - Data limite para envio de proposta
3. **numeroControlePNCP** - Identificador único no PNCP (CRÍTICO para URL correta!)
4. **situacaoCompraNome** - Status no PNCP (Divulgada, Suspensa, etc)
5. **srp** - Se é Sistema de Registro de Preços
6. **amparoLegal** - Base legal (Lei 14.133, 13.303, etc)
7. **modoDisputaNome** - Aberto, Fechado, Aberto-Fechado

### Problemas Identificados

1. **URL Errada** (Crítico)
   - `linkSistemaOrigem` às vezes é genérico ou nulo
   - Deveria usar `numeroControlePNCP` para construir URL do PNCP
   - URL correta: `https://pncp.gov.br/app/editais/{cnpj}-1-{seq}/{ano}`

2. **Dados de Localização** (78% faltando)
   - UF está disponível em `unidadeOrgao.ufSigla`
   - Cidade está disponível em `unidadeOrgao.municipioNome`

3. **Datas** (13% faltando)
   - `data_abertura` disponível como `dataAberturaProposta`
   - `data_publicacao` disponível como `dataPublicacaoPncp`

4. **Valor de Referência** (15% faltando)
   - Disponível como `valorTotalEstimado`

5. **Itens do Edital** (NÃO EXISTE TABELA)
   - API PNCP tem endpoint para listar itens: `/itens`
   - Precisamos criar tabela `editais_itens`

## Plano de Ação

### Fase 1: Corrigir Extração da API PNCP

1. Corrigir mapeamento de campos em `tool_buscar_editais_scraper`
2. Usar `numeroControlePNCP` para construir URL correta
3. Extrair UF e cidade de `unidadeOrgao`
4. Garantir extração de datas e valor

### Fase 2: Criar Tabela de Itens

```sql
CREATE TABLE editais_itens (
    id VARCHAR(36) PRIMARY KEY,
    edital_id VARCHAR(36) NOT NULL,
    numero_item INT,
    descricao TEXT,
    unidade VARCHAR(50),
    quantidade DECIMAL(15,4),
    valor_unitario_estimado DECIMAL(15,2),
    valor_total_estimado DECIMAL(15,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (edital_id) REFERENCES editais(id)
);
```

### Fase 3: Endpoint para Buscar Itens do PNCP

- API: `https://pncp.gov.br/api/consulta/v1/contratacoes/{cnpj}/{ano}/{seq}/itens`
- Chamar após salvar edital para popular itens

### Fase 4: Melhorar Download de PDF

1. Usar URL do PNCP para acessar página do edital
2. Na página, buscar links de documentos (edital, termo de referência, anexos)
3. API de documentos: `/documentos`

## URLs Corretas

### Página do Edital no PNCP
```
https://pncp.gov.br/app/editais/{numeroControlePNCP}
Exemplo: https://pncp.gov.br/app/editais/18629840000183-1-000251/2025
```

### API de Itens
```
https://pncp.gov.br/api/consulta/v1/contratacoes/{cnpj}/{ano}/{seq}/itens
Exemplo: https://pncp.gov.br/api/consulta/v1/contratacoes/18629840000183/2025/251/itens
```

### API de Documentos
```
https://pncp.gov.br/api/consulta/v1/contratacoes/{cnpj}/{ano}/{seq}/documentos
```
