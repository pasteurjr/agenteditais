# Detalhamento dos Scores — Parametrização e Cálculo

## 1) Os pesos das dimensões são parametrizáveis?

Sim e não. A tabela `ParametroScore` existe no banco com campos configuráveis:

| Campo | Default | Descrição |
|---|---|---|
| `peso_tecnico` | 0.25 | Peso da dimensão técnica |
| `peso_comercial` | 0.15 | Peso da dimensão comercial |
| `peso_participacao` | 0.05 | Peso de participação |
| `peso_ganho` | 0.10 | Peso de ganho |
| `peso_documental` | 0.15 | Peso documental |
| `peso_complexidade` | 0.10 | Peso complexidade |
| `peso_juridico` | 0.10 | Peso jurídico |
| `peso_logistico` | 0.10 | Peso logístico |
| `limiar_go` | 70.0 | Score mínimo para GO |
| `limiar_nogo` | 40.0 | Score máximo para NO-GO |
| `margem_minima` | null | Margem mínima aceitável |

A tela de Parametrização permite editar esses valores.

**Porém, o score profundo (6 dimensões) NÃO usa esses pesos.** Os pesos estão hardcoded no prompt da IA:

| Dimensão | Peso no prompt | Peso no banco (ignorado) |
|---|---|---|
| Técnico | 35% | peso_tecnico (0.25) |
| Documental | 15% | peso_documental (0.15) |
| Complexidade | 15% | peso_complexidade (0.10) |
| Jurídico | 20% | peso_juridico (0.10) |
| Logístico | 5% | peso_logistico (0.10) |
| Comercial | 10% | peso_comercial (0.15) |

O score **rápido** usa parcialmente — carrega `peso_tecnico` e `limiar_go` do banco para ajustar o score bruto retornado pela IA. Mas o score **profundo** ignora completamente a tabela `ParametroScore`.

### Conclusão
Os parâmetros existem no banco e na UI, mas o cálculo de score profundo não os consulta. Para que funcionem, seria necessário:
- Carregar os pesos de `ParametroScore` dentro de `tool_calcular_scores_validacao`
- Injetar os pesos no prompt (substituindo os hardcoded 35/15/15/20/5/10)
- Ou calcular o `score_final` no backend usando os pesos do banco em vez de pedir à IA

---

## 2) Como cada dimensão é calculada?

**É 100% o LLM (DeepSeek-chat) que calcula.** O sistema não tem nenhuma lógica de cálculo própria para as 6 dimensões.

### Fluxo do cálculo:

```
1. Backend monta prompt com:
   - Dados do edital (número, órgão, objeto[600 chars], valor, modalidade, UF, data)
   - Dados do produto (melhor match do portfolio: nome, fabricante, modelo, 5 specs)
   - Dados da empresa (razão social, CNPJ, porte, regime tributário, UF, cidade)

2. Envia ao DeepSeek-chat (temperature=0, max_tokens=1500)

3. IA analisa subjetivamente e retorna JSON:
   {
     "score_tecnico": 75,
     "score_documental": 80,
     "score_complexidade": 65,
     "score_juridico": 70,
     "score_logistico": 85,
     "score_comercial": 60,
     "score_final": 72,
     "decisao": "GO",
     "justificativa": "...",
     "pontos_positivos": ["...", "..."],
     "pontos_atencao": ["...", "..."]
   }

4. Backend faz parse do JSON e salva no banco (tabela Analise)
```

### O que a IA NÃO tem acesso:
- PDF do edital (só o campo "objeto" truncado em 600 caracteres)
- Itens do edital (quantidades, valores unitários)
- Lotes do edital
- Dados de mercado (histórico de preços, concorrentes)
- Documentação real da empresa (certidões, atestados)
- Localização geográfica detalhada (só UF)

### Critérios que a IA usa para cada dimensão:

**Técnico (peso 35%):**
A IA compara o texto do objeto do edital com o nome, categoria, fabricante e specs do produto. Se o produto é "Autoclave Horizontal" e o edital pede "reagentes de hematologia", o score técnico será baixo. Se pede "autoclaves para esterilização", será alto. É puramente baseado em semântica textual.

**Documental (peso 15%):**
A IA infere a complexidade documental pela modalidade (pregão eletrônico = mais simples, concorrência = mais documentação) e pelo tipo de órgão (federal = mais exigente). Não verifica documentos reais.

**Complexidade (peso 15%):**
Inversamente proporcional. A IA avalia pelo texto do objeto se o edital parece simples ("aquisição de material") ou complexo ("locação com comodato, instalação, treinamento, manutenção preventiva e corretiva"). Quanto mais requisitos implícitos no texto, menor o score.

**Jurídico (peso 20%):**
A IA busca sinais de risco no texto: exclusividade ME/EPP vs porte da empresa, termos como "penalidade", "suspensão", "direcionamento". Sem acesso ao edital completo, é uma avaliação superficial.

**Logístico (peso 5%):**
Compara a UF da empresa com a UF do edital. Mesmo estado = score alto. Regiões distantes = score menor. Avalia também se o objeto implica instalação/suporte presencial.

**Comercial (peso 10%):**
A IA avalia pelo valor estimado, modalidade e tipo de órgão se há margem comercial. Pregão eletrônico com muitos concorrentes = menor score. Valor alto com baixa concorrência = maior score. Considera benefícios ME/EPP se aplicável.

### Limitações do cálculo atual:
1. **Subjetivo** — A IA "chuta" os scores com base em texto limitado (600 chars do objeto)
2. **Sem dados reais** — Não verifica documentação, não consulta mercado, não lê o PDF
3. **Não determinístico** — Mesmo com temperature=0, respostas podem variar ligeiramente
4. **Pesos ignorados** — Os pesos configurados na Parametrização não são usados
5. **Produto único** — Analisa apenas o "melhor match" do portfolio, não todos os produtos
