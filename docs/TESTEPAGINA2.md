# TESTE DA PÁGINA 2 — EMPRESA
## Guia Completo de Testes com Dados de Entrada e Saídas Esperadas

**Referência:** WORKFLOW SISTEMA.pdf — Página 2
**Módulo:** EmpresaPage + Chat com Agente

---

## DADOS DE TESTE PADRÃO (usar em todos os testes)

| Campo | Valor para digitar |
|---|---|
| Razão Social | Áquila Diagnóstico Ltda |
| Nome Fantasia | Áquila |
| CNPJ | 12.345.678/0001-90 |
| Inscrição Estadual | 123.456.789.012 |
| Website | http://aquila.com.br |
| Instagram | @aquila_diagnostico |
| LinkedIn | aquila-diagnostico-ltda |
| Facebook | aquiladiagnostico |
| Endereço | Rua das Análises, 500 |
| Cidade | São Paulo |
| UF | SP |
| CEP | 01310-100 |
| Email 1 | contato@aquila.com.br |
| Email 2 | vendas@aquila.com.br |
| Celular 1 | (11) 99999-0001 |
| Celular 2 | (11) 98888-0002 |

---

# TESTE 1 — Cadastro Completo da Empresa

### O que diz o WORKFLOW:
> **Cadastro:** Razão Social, CNPJ, Inscrição Estadual, Website, Instagram, LinkedIn, Facebook, Emails, Celulares, etc.

### Onde testar:
Menu lateral → **Empresa**

### Passos:

| # | Ação | Dados de Entrada |
|---|---|---|
| 1 | Acessar a página Empresa pelo menu lateral | — |
| 2 | Preencher campo "Razão Social" | `Áquila Diagnóstico Ltda` |
| 3 | Preencher campo "Nome Fantasia" | `Áquila` |
| 4 | Preencher campo "CNPJ" | `12.345.678/0001-90` |
| 5 | Preencher campo "Inscrição Estadual" | `123.456.789.012` |
| 6 | Preencher campo "Website" | `http://aquila.com.br` |
| 7 | Preencher campo "Instagram" | `@aquila_diagnostico` |
| 8 | Preencher campo "LinkedIn" | `aquila-diagnostico-ltda` |
| 9 | Preencher campo "Facebook" | `aquiladiagnostico` |
| 10 | Preencher campo "Endereço" | `Rua das Análises, 500` |
| 11 | Preencher campo "Cidade" | `São Paulo` |
| 12 | Preencher campo "UF" | `SP` |
| 13 | Preencher campo "CEP" | `01310-100` |
| 14 | Na seção "Emails de Contato", digitar no campo | `contato@aquila.com.br` |
| 15 | Clicar botão **"Adicionar"** ao lado do campo de email | — |
| 16 | Digitar segundo email | `vendas@aquila.com.br` |
| 17 | Clicar **"Adicionar"** novamente | — |
| 18 | Na seção "Celulares/Telefones", digitar | `(11) 99999-0001` |
| 19 | Clicar **"Adicionar"** | — |
| 20 | Digitar segundo celular | `(11) 98888-0002` |
| 21 | Clicar **"Adicionar"** | — |
| 22 | Clicar botão **"Salvar Alterações"** | — |

### Saída Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Mensagem na tela | Nenhum erro exibido; salvamento com sucesso |
| Recarregar a página (F5) | Todos os 13 campos continuam preenchidos com os valores digitados |
| Lista de emails | Mostra 2 itens: `contato@aquila.com.br` e `vendas@aquila.com.br` |
| Lista de celulares | Mostra 2 itens: `(11) 99999-0001` e `(11) 98888-0002` |
| Cada email/celular tem botão X | Sim, para remoção individual |

### Teste extra — Remover um email:
1. Clicar no **X** ao lado de `vendas@aquila.com.br`
2. Clicar "Salvar Alterações"
3. Recarregar a página

**Saída esperada:** Apenas `contato@aquila.com.br` aparece na lista.

---

# TESTE 2 — Upload de Documentos da Empresa

### O que diz o WORKFLOW:
> **Uploads:** Contrato Social, AFE, CBPAD, CBPP, Corpo de Bombeiros, ....

### Onde testar:
Página Empresa → Card **"Documentos da Empresa"** → Botão **"Upload Documento"**

### Pré-condição:
- Teste 1 concluído (empresa cadastrada)
- Ter um arquivo PDF qualquer no computador (ex: `contrato_social_teste.pdf`)

### Passos:

| # | Ação | Dados de Entrada |
|---|---|---|
| 1 | Localizar o card "Documentos da Empresa" na página | — |
| 2 | Clicar botão **"Upload Documento"** (canto superior direito do card) | — |
| 3 | No modal que abre, selecionar "Tipo de Documento" | `Contrato Social` (dentro do grupo "Habilitação Jurídica") |
| 4 | Clicar em "Escolher Arquivo" e selecionar o PDF | `contrato_social_teste.pdf` |
| 5 | Preencher "Validade" (opcional) | `2027-12-31` |
| 6 | Clicar botão **"Enviar"** | — |

### Saída Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Modal fecha | Sim, automaticamente após envio |
| Tabela de documentos | Nova linha aparece: Documento="Contrato Social", Tipo="Contrato Social", Validade="2027-12-31", Status=**"OK"** (badge verde) |
| Coluna Ações | Botões Visualizar (olho) e Download (seta) e Excluir (lixeira) aparecem |

### Repetir o upload para cada tipo exigido pelo WORKFLOW:

| # | Tipo de Documento | Grupo no Select |
|---|---|---|
| 1 | Contrato Social | Habilitação Jurídica |
| 2 | Procuração | Habilitação Jurídica |
| 3 | AFE (ANVISA) | Sanitárias/Regulatórias |
| 4 | CBPAD | Sanitárias/Regulatórias |
| 5 | CBPP | Sanitárias/Regulatórias |
| 6 | Corpo de Bombeiros | Sanitárias/Regulatórias |
| 7 | Habilitação Econômica | Habilitação Econômica/Financeira |
| 8 | Habilitação Fiscal | Habilitação Fiscal |
| 9 | Qualificação Técnica | Qualificação Técnica |

### Saída Esperada após todos os uploads:
- Tabela mostra **9 documentos**
- Todos com status **"OK"** (verde)
- Cada um com botões Visualizar/Download/Excluir

### Teste do Download:
1. Clicar no ícone de **Download** (seta para baixo) de qualquer documento
2. **Saída esperada:** O arquivo PDF é baixado para o computador

### Teste da Visualização:
1. Clicar no ícone de **Visualizar** (olho) de qualquer documento
2. **Saída esperada:** O PDF abre para visualização (inline ou nova aba)

### Teste de Exclusão:
1. Clicar no ícone de **Excluir** (lixeira) de um documento
2. **Saída esperada:** Confirmação "Excluir este documento?" aparece
3. Confirmar
4. **Saída esperada:** Documento removido da tabela

---

# TESTE 3 — Certidões Automáticas

### O que diz o WORKFLOW:
> O sistema já pega as certidões de forma automática, na linha do que é feito no ComLicitações

### Onde testar:
Página Empresa → Card **"Certidões Automáticas"**

### Pré-condição:
- Empresa cadastrada com CNPJ preenchido
- Backend rodando com acesso à internet

### Passos:

| # | Ação | Dados de Entrada |
|---|---|---|
| 1 | Localizar card "Certidões Automáticas" | — |
| 2 | O botão mostra "Buscar Certidões (Em breve)" — este botão precisa ser ativado via API | — |
| 3 | **Alternativa via API (curl/Postman):** enviar POST | `POST /api/empresa-certidoes/buscar-automatica` com body: `{"tipos": ["cnd_federal", "cnd_estadual", "cnd_municipal", "fgts", "trabalhista"]}` |
| 4 | Recarregar a página Empresa | — |

### Saída Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Resposta da API | JSON com `"success": true` e lista de `"resultados"` |
| Cada resultado contém | `tipo`, `status` ("criado" ou "atualizado"), `url_consulta` (link real), `acao` |
| Tabela de Certidões na UI | 5 linhas aparecem (uma para cada tipo) |
| Status de cada certidão | **"Pendente"** (amarelo) — porque ainda não foi feito upload do arquivo real |
| URL de consulta | Link válido para portal oficial (Receita Federal, SEFAZ, Caixa, TST) |

### Detalhe dos 5 tipos e portais esperados:

| Tipo | Órgão Emissor Esperado | Portal |
|---|---|---|
| cnd_federal | Receita Federal do Brasil | https://solucoes.receita.fazenda.gov.br/... |
| cnd_estadual | SEFAZ do estado (SP) | https://www.fazenda.sp.gov.br/... |
| cnd_municipal | Prefeitura Municipal | (varia por cidade) |
| fgts | Caixa Econômica Federal | https://consulta-crf.caixa.gov.br/... |
| trabalhista | Tribunal Superior do Trabalho (TST) | https://cndt-certidao.tst.jus.br/... |

---

# TESTE 4 — Responsáveis / Representantes

### O que diz o WORKFLOW:
> (implícito no cadastro da empresa — representantes legais)

### Onde testar:
Página Empresa → Card **"Responsáveis"** → Botão **"Adicionar"**

### Passos:

| # | Ação | Dados de Entrada |
|---|---|---|
| 1 | Localizar card "Responsáveis" | — |
| 2 | Clicar botão **"Adicionar"** | — |
| 3 | No modal, preencher Nome | `João Carlos Silva` |
| 4 | Preencher Cargo | `Diretor Técnico` |
| 5 | Preencher Email | `joao.silva@aquila.com.br` |
| 6 | Preencher Telefone | `(11) 97777-0003` |
| 7 | Clicar **"Salvar"** | — |
| 8 | Repetir para segundo responsável: | Nome: `Maria Souza`, Cargo: `Gerente Comercial`, Email: `maria@aquila.com.br`, Telefone: `(11) 96666-0004` |

### Saída Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Modal fecha após salvar | Sim |
| Tabela mostra | 2 linhas: João Carlos Silva (Diretor Técnico) e Maria Souza (Gerente Comercial) |
| Coluna Ações | Botão de excluir (lixeira) em cada linha |
| Recarregar a página | Dados persistem |

### Teste de Exclusão:
1. Clicar lixeira ao lado de "Maria Souza"
2. Confirmar exclusão
3. **Saída esperada:** Apenas "João Carlos Silva" permanece na tabela

---

# TESTE 5 — Fontes de Obtenção do Portfolio (via Chat)

### O que diz o WORKFLOW:
> **a. Várias fontes de obtenção do portfolio:**
> Uploads (manuais, folders, instruções de uso, etc.); Acesso à ANVISA / registros dos produtos; Acesso ao banco de plano de contas do ERP; Acesso ao website e redes sociais do cliente; Acesso a todos os editais que o cliente já participou, etc.

### Onde testar:
**Chat com Agente** (painel lateral direito)

### Teste 5.1 — Upload de manual via chat

| # | Ação | Dados de Entrada |
|---|---|---|
| 1 | Abrir o chat lateral | — |
| 2 | Selecionar do dropdown de prompts | Categoria "Cadastro de Produtos" → "Faça upload do manual..." |
| 3 | Anexar arquivo PDF de um manual técnico | `manual_microscopio.pdf` (qualquer PDF de equipamento) |
| 4 | Enviar | — |

**Saída esperada:**
- Agente responde que processou o upload
- Produto novo criado automaticamente (ex: "Microscópio Óptico Binocular")
- Especificações técnicas extraídas pela IA (nome, potência, voltagem, etc.)
- Mensagem mostra: nome do produto, specs encontradas, confirma cadastro

### Teste 5.2 — Buscar no website da empresa

| # | Ação | Dados de Entrada |
|---|---|---|
| 1 | No chat, digitar | `Busque manuais e datasheets no site http://aquila.com.br` |
| 2 | Aguardar resposta | — |

**Saída esperada:**
- Agente busca na web por manuais/datasheets
- Retorna links encontrados (se houver)
- Oferece baixar e processar os documentos

### Teste 5.3 — Consultar ANVISA

| # | Ação | Dados de Entrada |
|---|---|---|
| 1 | No chat, digitar | `Busque o registro ANVISA do produto Kit Diagnóstico Rápido HIV` |
| 2 | Aguardar resposta | — |

**Saída esperada:**
- Agente busca na web registros ANVISA
- Retorna informações encontradas (número registro, validade, fabricante)
- Se não encontrar, informa e sugere busca manual

### Teste 5.4 — Listar editais anteriores

| # | Ação | Dados de Entrada |
|---|---|---|
| 1 | No chat, digitar | `Liste os editais que já participamos` |
| 2 | Aguardar resposta | — |

**Saída esperada:**
- Lista de editais salvos no sistema (se houver)
- Se nenhum: "Nenhum edital salvo ainda. Deseja buscar editais?"

---

# TESTE 6 — Fontes de Busca / Palavras-chave (via Chat)

### O que diz o WORKFLOW:
> **b. Cadastro das Diferentes Fontes de Buscas:**
> Palavras chaves (geradas pela IA, em função dos nomes dos produtos); Busca pelos NCMs, afunilados no portfolio

### Onde testar:
**Chat com Agente** + **Página Parametrizações** (aba "Fontes de Busca")

### Teste 6.1 — Gerar palavras-chave via chat

| # | Ação | Dados de Entrada |
|---|---|---|
| 1 | No chat, digitar | `Gere palavras-chave de busca a partir dos meus produtos` |
| 2 | Aguardar resposta | — |

**Saída esperada:**
- IA analisa os produtos cadastrados
- Retorna lista de palavras-chave sugeridas (ex: "microscópio óptico", "reagente diagnóstico HIV", "kit imunocromatografia")
- Indica NCMs associados (9011.10.00, 3822.00.90)

### Teste 6.2 — Listar fontes de busca

| # | Ação | Dados de Entrada |
|---|---|---|
| 1 | No chat, selecionar do dropdown | Categoria "Fontes de Editais" → "Liste as fontes de busca disponíveis" |
| 2 | Aguardar resposta | — |

**Saída esperada:**
- Lista de fontes: PNCP, ComprasNet, BEC-SP, SICONV / +Brasil, etc.
- Cada fonte com status (ativa/inativa) e tipo (api/scraper)

---

# TESTE 7 — Classificação / Agrupamento de Produtos via IA

### O que diz o WORKFLOW:
> **c. Cadastro da estrutura de classificação / agrupamento dos produtos pelos clientes:**
> A IA deveria gerar esses agrupamentos, caso o cliente não os parametrize no sistema (na área de parametrização)

### Onde testar:
**Página Parametrizações** → Aba "Produtos" → Botão **"Gerar com IA"**

### Pré-condição:
- Pelo menos 2-3 produtos cadastrados (Microscópio e Kit HIV do teste 5)

### Passos:

| # | Ação | Dados de Entrada |
|---|---|---|
| 1 | Acessar menu → "Parametrizações" | — |
| 2 | Clicar aba "Produtos" | — |
| 3 | Clicar botão **"Gerar com IA"** | — |
| 4 | Aguardar processamento (10-30 segundos) | — |

### Saída Esperada:

| O que verificar | Resultado esperado |
|---|---|
| Preview aparece | Estrutura de classes gerada pela IA |
| Classes sugeridas | Ex: "Equipamentos Ópticos" (NCM: 9011), "Reagentes Diagnósticos" (NCM: 3822) |
| Subclasses | Ex: sob "Equipamentos Ópticos" → "Microscópios" (NCM: 9011.10.00) |
| Botão "Aplicar" | Ao clicar, classes são criadas no sistema |
| Botão "Cancelar" | Descarta a sugestão, nada é salvo |

### Teste alternativo via API:

```
POST /api/parametrizacoes/gerar-classes
Headers: Authorization: Bearer <token>
```

**Saída esperada (JSON):**
```json
{
  "success": true,
  "total_produtos": 2,
  "classes": [
    {
      "nome": "Equipamentos Ópticos",
      "ncm_sugerido": "9011",
      "subclasses": [
        {"nome": "Microscópios", "ncm": "9011.10.00"}
      ]
    },
    {
      "nome": "Reagentes Diagnósticos",
      "ncm_sugerido": "3822",
      "subclasses": [
        {"nome": "Kits Rápidos", "ncm": "3822.00.90"}
      ]
    }
  ]
}
```

---

# TESTE 8 — IA compara edital vs documentos da empresa

### O que diz o WORKFLOW:
> Sistema traz o que o edital pede, compara com o que é exigido, verifica em editais passados as impugnações e jurisprudência e a IA alerta quanto a exigência de documentos a mais ou não.

### Onde testar:
**Chat com Agente**

### Pré-condição:
- Empresa com documentos uploadados (Teste 2)
- Pelo menos 1 edital salvo no sistema (buscar antes se necessário)

### Teste 8.1 — Comparar documentos

| # | Ação | Dados de Entrada |
|---|---|---|
| 1 | No chat, digitar | `Compare os documentos da minha empresa com os requisitos do edital PE-001/2026` |
| 2 | Aguardar resposta (pode demorar 20-40s) | — |

**Saída esperada:**
- Agente lista os requisitos documentais do edital
- Para cada requisito, informa se a empresa tem o documento:
  - **Atendido** — documento presente e válido
  - **Parcial** — documento presente mas incompleto/vencido
  - **Não atendido** — documento faltante
- Score de aderência documental (ex: 75%)
- Recomendação de ação (ex: "Providenciar Atestado de Capacidade Técnica")

### Teste 8.2 — Verificar impugnações

| # | Ação | Dados de Entrada |
|---|---|---|
| 1 | No chat, digitar | `Verifique se há possibilidade de impugnação no edital PE-001/2026` |
| 2 | Aguardar resposta | — |

**Saída esperada:**
- Agente analisa flags jurídicos do edital
- Identifica exigências inusitadas (se houver)
- Referência à Lei 14.133/2021
- Indica se há "candidato a impugnação" ou não
- Menciona jurisprudência relevante (se aplicável)

### Teste 8.3 — Alerta de documentos a mais

| # | Ação | Dados de Entrada |
|---|---|---|
| 1 | No chat, digitar | `O edital PE-001/2026 está pedindo documentos a mais do que deveria?` |
| 2 | Aguardar resposta | — |

**Saída esperada:**
- Agente compara requisitos do edital com o padrão da Lei 14.133
- Se houver exigência excessiva: alerta com explicação
- Se tudo normal: confirma que exigências estão dentro do esperado

---

# RESUMO — CHECKLIST RÁPIDO

| # | Teste | Status |
|---|---|---|
| 1 | Cadastro completo (13 campos + emails + celulares) | ⬜ |
| 2 | Upload dos 9 tipos de documentos | ⬜ |
| 2b | Download de documento uploadado | ⬜ |
| 2c | Visualização de documento uploadado | ⬜ |
| 2d | Exclusão de documento | ⬜ |
| 3 | Busca automática de 5 certidões (via API) | ⬜ |
| 4 | Adicionar 2 responsáveis | ⬜ |
| 4b | Excluir 1 responsável | ⬜ |
| 5.1 | Upload de manual via chat → produto criado pela IA | ⬜ |
| 5.2 | Buscar manuais no website via chat | ⬜ |
| 5.3 | Consultar ANVISA via chat | ⬜ |
| 5.4 | Listar editais anteriores via chat | ⬜ |
| 6.1 | Gerar palavras-chave via chat | ⬜ |
| 6.2 | Listar fontes de busca via chat | ⬜ |
| 7 | Gerar classes/subclasses via IA | ⬜ |
| 8.1 | Comparar documentos empresa vs edital via chat | ⬜ |
| 8.2 | Verificar impugnações via chat | ⬜ |
| 8.3 | Verificar exigência de documentos a mais via chat | ⬜ |

**Total: 18 testes cobrindo 100% da Página 2 do WORKFLOW SISTEMA**
