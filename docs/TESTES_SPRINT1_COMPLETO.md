# Testes Sprint 1 - Fundamentos Comerciais

## Visão Geral

Este documento contém todos os prompts para testar as 9 funcionalidades da Sprint 1.

| # | Funcionalidade | Intenção | Status |
|---|----------------|----------|--------|
| 1 | Registrar Resultado de Certame | `registrar_resultado` | ✅ Implementado |
| 2 | Extrair Resultados de Ata (PDF) | `extrair_ata` | ✅ Implementado |
| 3 | Buscar/Baixar Atas do PNCP | `buscar_atas_pncp` | ✅ Implementado |
| 4 | Buscar Preços no PNCP | `buscar_precos_pncp` | ✅ Implementado |
| 5 | Histórico de Preços | `historico_precos` | ✅ Implementado |
| 6 | Análise de Concorrentes | `listar_concorrentes` / `analisar_concorrente` | ✅ Implementado |
| 7 | Recomendação de Preços | `recomendar_preco` | ✅ Implementado |
| 8 | Classificação de Editais | `classificar_edital` | ✅ Implementado |
| 9 | Verificar Completude do Produto | `verificar_completude` | ✅ Implementado |

---

## Funcionalidade 1: Registrar Resultado de Certame

### Intenção: `registrar_resultado`

**Pré-requisitos:**
- Ter um edital cadastrado no sistema (ex: PE-001/2026)

### Prompts de Teste

```
1. Perdemos o edital PE-001/2026 por preço. Vencedor MedLab R$ 365k

2. Ganhamos o edital PE-002/2026 com R$ 290.000

3. PE-003/2026 foi cancelado

4. O edital PE-001 foi para MedLab por R$ 400k, segundo TechSaúde R$ 412k, terceiro nós com R$ 425k

5. Registre derrota no PE-005, perdemos por documentação

6. Perdemos o pregão 15/2026 para Diagnóstica Brasil com R$ 180.000, nosso preço era R$ 195.000

7. Ganhamos! Pregão 20/2026 com valor de R$ 520.000

8. O edital PE-010 ficou deserto

9. Edital 25/2026 foi revogado
```

### Resultado Esperado
- Status do edital atualizado (ganho/perdido/cancelado)
- Preço histórico registrado
- Concorrente vencedor cadastrado/atualizado
- Participações registradas

---

## Funcionalidade 2: Extrair Resultados de Ata (PDF)

### Intenção: `extrair_ata`

**Pré-requisitos:**
- Ter um arquivo PDF de ata de sessão de pregão

### Prompts de Teste (com upload de PDF)

```
1. Extraia os resultados desta ata
   [Anexar: ata_sessao.pdf]

2. Quem ganhou este pregão?
   [Anexar: ata_pregao.pdf]

3. Registre os resultados desta ata
   [Anexar: ata_registro_precos.pdf]

4. Extraia os vencedores desta ata
   [Anexar: ata.pdf]

5. Resultado da licitação
   [Anexar: ata_homologacao.pdf]
```

### Resultado Esperado
- Extração do número do edital
- Lista de vencedores com preços
- Participantes identificados
- Dados salvos no histórico

---

## Funcionalidade 3: Buscar/Baixar Atas do PNCP

### Intenção: `buscar_atas_pncp`

### Prompts de Teste

```
1. Busque atas de hematologia

2. Encontre atas de pregão de equipamentos hospitalares

3. Baixe atas de reagentes laboratoriais

4. Busque atas de registro de preço de analisadores

5. Atas de sessão de pregão de bioquímica

6. Encontre atas de equipamentos médicos

7. Busque atas de material de laboratório

8. Baixe atas do PNCP sobre centrífugas
```

### Resultado Esperado
- Lista de atas encontradas
- Links para download
- Informações do órgão e data
- Instruções de como usar as atas

---

## Funcionalidade 4: Buscar Preços no PNCP

### Intenção: `buscar_precos_pncp`

### Prompts de Teste

```
1. Busque preços de hematologia no PNCP

2. Qual o preço de mercado para analisador bioquímico?

3. Quanto custa um equipamento de laboratório em licitações?

4. Busque preços de contratos de reagentes

5. Preços de centrífugas no PNCP

6. Quanto custa um analisador hematológico nas licitações?

7. Busque preços praticados de equipamentos hospitalares

8. Valores de contrato de bioquímica
```

### Resultado Esperado
- Estatísticas de preços (min, max, médio, mediano)
- Lista de principais fornecedores
- Últimos contratos encontrados
- Links para contratos no PNCP

---

## Funcionalidade 5: Histórico de Preços

### Intenção: `historico_precos`

**Pré-requisitos:**
- Ter resultados de editais registrados no sistema

### Prompts de Teste

```
1. Mostre o histórico de preços de hematologia

2. Histórico de preços do produto analisador

3. Quais preços já registramos?

4. Preços registrados de equipamentos

5. Histórico de preços de reagentes

6. Ver preços salvos no sistema

7. Histórico de preços de bioquímica

8. Mostre preços registrados de centrífugas
```

### Resultado Esperado
- Lista de preços históricos
- Estatísticas (min, max, médio)
- Data e fonte de cada registro
- Empresa vencedora de cada registro

---

## Funcionalidade 6: Análise de Concorrentes

### Intenção: `listar_concorrentes` / `analisar_concorrente`

**Pré-requisitos:**
- Ter resultados de editais registrados com concorrentes

### Prompts de Teste - Listar

```
1. Liste os concorrentes conhecidos

2. Quais concorrentes conhecemos?

3. Mostre os concorrentes

4. Ver concorrentes cadastrados

5. Nossos concorrentes
```

### Prompts de Teste - Analisar

```
1. Analise o concorrente MedLab

2. Como está a empresa TechSaúde?

3. Histórico do concorrente Diagnóstica Brasil

4. Qual a taxa de vitória do concorrente MedLab?

5. Analise a empresa Bioclin
```

### Resultado Esperado
- Lista de concorrentes com estatísticas
- Taxa de vitória de cada concorrente
- Histórico de participações
- Preços praticados pelo concorrente

---

## Funcionalidade 7: Recomendação de Preços

### Intenção: `recomendar_preco`

**Pré-requisitos:**
- Ter histórico de preços registrado (local ou via PNCP)

### Prompts de Teste

```
1. Recomende preço para analisador hematológico

2. Qual preço sugerir para reagentes de bioquímica?

3. Que preço colocar no edital de equipamentos?

4. Qual a faixa de preço para centrífugas?

5. Recomende um preço para o produto hemograma

6. Que preço devo colocar para ganhar?

7. Sugira preço para equipamento laboratorial

8. Faixa de preço para analisadores
```

### Resultado Esperado
- Preço agressivo (para ganhar)
- Preço ideal (equilíbrio)
- Preço conservador (com margem)
- Justificativa baseada em dados
- Referência de mercado

---

## Funcionalidade 8: Classificação de Editais

### Intenção: `classificar_edital`

### Prompts de Teste

```
1. Classifique este edital: Aquisição de analisador hematológico automático

2. Que tipo de edital é este: Locação de equipamento com fornecimento de reagentes

3. Este edital é comodato ou venda: Cessão de equipamento sem ônus com fornecimento de insumos

4. Classifique: Contratação de serviço de locação de equipamentos laboratoriais

5. Tipo de edital: Compra de reagentes para análises clínicas

6. É comodato ou aluguel: Empréstimo de equipamento com manutenção

7. Classifique o edital: Aquisição de material hospitalar descartável

8. Qual modalidade: Fornecimento de kits diagnósticos
```

### Resultado Esperado
- Categoria identificada (comodato, venda, aluguel, etc.)
- Nível de confiança
- Palavras-chave detectadas
- Justificativa da classificação

---

## Funcionalidade 9: Verificar Completude do Produto

### Intenção: `verificar_completude`

**Pré-requisitos:**
- Ter produtos cadastrados no sistema

### Prompts de Teste

```
1. Verifique completude do produto Analisador XYZ

2. O produto BC-5000 está completo?

3. Falta informação no produto Mindray?

4. Verificar completude do analisador hematológico

5. Produto Sysmex está completo?

6. Informações faltando no produto centrífuga

7. Verifique se o produto hemograma está completo

8. Falta algo no cadastro do produto bioquímica?
```

### Resultado Esperado
- Percentual de completude
- Status (completo, quase completo, incompleto)
- Lista de campos faltantes
- Quantidade de especificações
- Recomendações de melhoria

---

## Fluxo de Teste Completo

### Cenário: Participação em Edital de Hematologia

1. **Buscar preços de referência:**
   ```
   Busque preços de analisador hematológico no PNCP
   ```

2. **Buscar atas para referência:**
   ```
   Busque atas de hematologia no PNCP
   ```

3. **Verificar produto:**
   ```
   Verifique completude do produto Mindray BC-5000
   ```

4. **Classificar edital:**
   ```
   Classifique: Locação de analisador hematológico com fornecimento de reagentes
   ```

5. **Recomendar preço:**
   ```
   Recomende preço para analisador hematológico
   ```

6. **Registrar resultado (após certame):**
   ```
   Perdemos o PE-001/2026 para MedLab com R$ 350.000, nosso era R$ 380.000
   ```

7. **Verificar histórico:**
   ```
   Mostre histórico de preços de hematologia
   ```

8. **Analisar concorrente:**
   ```
   Analise o concorrente MedLab
   ```

---

## Notas

- Substitua `[TERMO]`, `[NOME]`, `[NUMERO]` pelos valores reais
- Alguns testes requerem dados previamente cadastrados
- As funcionalidades 5-9 dependem de dados no banco local
- A funcionalidade 4 (PNCP) busca dados externos

---

*Documento gerado em: 04/02/2026*
*Sprint 1 - Sistema de Editais*
