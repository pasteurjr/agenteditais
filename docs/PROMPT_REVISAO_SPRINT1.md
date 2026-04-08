# TAREFA: Revisar Dados de Teste, Limpar DB e Regenerar Relatório de Validação — Sprint 1

## Contexto

O sistema "Agente de Editais" é uma aplicação React+Flask para gestão de licitações.
- Frontend: Vite React em `http://localhost:5175`
- Backend: Flask em `http://localhost:5007`
- Banco: MySQL em `camerascasas.no-ip.info:3308`, database `editais`
- Playwright para testes E2E
- Screenshots em `runtime/screenshots/tutorial-sprint1-1/`

**IMPORTANTE — Mudança recente no login:**
O sistema agora tem superuser e relação N:N usuario_empresa. O helper de login em
`tests/e2e/playwright/helpers.ts` faz login com `pasteurjr@gmail.com` / `123456`.
Este usuário é superuser e tem uma empresa vinculada. Se tiver mais de uma empresa,
o login mostra uma tela de seleção de empresa — o helper precisa lidar com isso
(clicar no card da empresa ou pular se só tem uma). Verifique se o helper `login()`
já trata este caso; se não, ajuste-o.

---

## PARTE 1 — Revisar e Corrigir Dados nos Arquivos de Dados

### Arquivos:
- `docs/dadosempportpar-1.md` — dados da empresa "MedSupply Hospitalar Ltda."
- `docs/dadosempportpar-2.md` — dados da empresa "BioTech Soluções Diagnósticas Ltda."

### O que fazer:

1. **Revisar CNPJ:** Os CNPJs usados (12.345.678/0001-90 e 98.765.432/0001-11) são fictícios
   e inválidos. Pesquisar na web CNPJs válidos de empresas REAIS do setor de material hospitalar
   e diagnóstico. Usar empresas reais que tenham dados públicos na Receita Federal.
   Substituir nos arquivos: CNPJ, Razão Social, Nome Fantasia, Endereço, Cidade, UF, CEP,
   Inscrição Estadual (consultar SINTEGRA se possível).

2. **Revisar dados de contato:** Os emails e telefones são fictícios. Substituir por dados
   plausíveis baseados nas empresas reais encontradas (ou gerar dados verossímeis que
   correspondam ao domínio da empresa).

3. **Verificar coerência de produtos:** Os produtos listados em UC-F07 devem ser coerentes
   com a empresa escolhida. Se a empresa real vende tipos específicos de equipamentos,
   ajustar os nomes dos produtos para corresponder ao catálogo real da empresa.

4. **Manter a estrutura do documento intacta.** Não alterar nomes de UCs, formato das tabelas,
   nem instruções de validação. Só alterar os DADOS (valores nas tabelas).

5. **Datas de validade:** Ajustar todas as datas de validade de documentos e certidões
   para serem futuras (2026-2027) de forma que os status de badges (OK/Vence/Falta)
   permaneçam conforme documentado.

---

## PARTE 2 — Revisar Tutoriais

### Arquivos:
- `docs/tutorialsprint1-1.md` — tutorial Playwright (Conjunto 1 / MedSupply)
- `docs/tutorialsprint1-2.md` — tutorial manual (Conjunto 2 / BioTech)

### O que fazer:

1. **Atualizar todos os dados inline** que referenciam MedSupply/BioTech para corresponder
   aos novos dados corrigidos na Parte 1. Isso inclui:
   - Código Playwright nos blocos ```typescript``` de tutorialsprint1-1.md
   - Dados escritos nas tabelas de passos de tutorialsprint1-2.md
   - Nomes de empresa, CNPJ, endereço, emails, telefones, produtos etc.

2. **Atualizar o fluxo de login** em tutorialsprint1-1.md: o login agora pode incluir
   uma etapa de seleção de empresa. Ajustar as instruções e código de exemplo.

3. **NÃO alterar** nomes de UC, estrutura de seções, nem lógica de verificação.

---

## PARTE 3 — Limpar o Banco de Dados

### Conexão MySQL:
```
Host: camerascasas.no-ip.info
Porta: 3308
Database: editais
User: root
Password: (verificar em backend/app.py a variável SQLALCHEMY_DATABASE_URI)
```

### O que limpar:

Executar queries SQL para apagar dados criados em validações anteriores da MedSupply:

1. **Produtos e especificações** da empresa MedSupply (tabelas `produtos`, `produtos_especificacoes`)
   - Primeiro identificar o `empresa_id` da empresa cujos dados serão usados
   - DELETE FROM produtos_especificacoes WHERE produto_id IN (SELECT id FROM produtos WHERE empresa_id = '<id>');
   - DELETE FROM produtos WHERE empresa_id = '<id>';

2. **Responsáveis** da empresa (tabela `responsaveis`)
   - DELETE FROM responsaveis WHERE empresa_id = '<id>';

3. **Documentos** da empresa (tabela `documentos_empresa`)
   - DELETE FROM documentos_empresa WHERE empresa_id = '<id>';

4. **Contatos** da empresa (tabelas `emails_empresa`, `telefones_empresa`)
   - DELETE FROM emails_empresa WHERE empresa_id = '<id>';
   - DELETE FROM telefones_empresa WHERE empresa_id = '<id>';

5. **Certidões** (tabela `certidoes`)
   - DELETE FROM certidoes WHERE empresa_id = '<id>';

6. **Parâmetros, pesos, fontes** se houver dados empresa-specific
   - Verificar quais tabelas têm empresa_id e limpar

7. **NÃO apagar** a empresa em si, nem o vínculo em `usuario_empresa`. Apenas os dados
   operacionais que serão recriados pelos testes.

**IMPORTANTE:** Antes de deletar, fazer um SELECT COUNT para confirmar o que vai ser apagado.
Listar as queries e o resultado esperado antes de executar.

---

## PARTE 4 — Atualizar e Executar o Teste Playwright

### Arquivo: `tests/e2e/playwright/tutorial-sprint1-1.spec.ts`

### O que fazer:

1. **Atualizar todos os dados de teste** no spec para corresponder aos novos dados
   corrigidos (Parte 1). Buscar todas as ocorrências de "MedSupply", CNPJ, endereço,
   emails, telefones, nomes de produtos, e substituir pelos dados corrigidos.

2. **Verificar o helper `login()`** em `tests/e2e/playwright/helpers.ts`:
   - Após o submit do login, pode aparecer uma tela de seleção de empresa
   - Se aparecer, clicar no card da empresa correta
   - Se não aparecer (usuário tem só 1 empresa), continuar normalmente
   - Verificar se o helper já faz isso; se não, ajustar

3. **Executar o teste:**
   ```bash
   # Garantir que backend e frontend estão rodando
   cd /mnt/data1/progpython/agenteditais
   # Backend (se não estiver rodando):
   cd backend && python app.py &
   # Frontend (se não estiver rodando):
   cd frontend && npm run dev &
   # Aguardar inicialização
   sleep 10
   # Executar o teste
   npx playwright test tests/e2e/playwright/tutorial-sprint1-1.spec.ts --reporter=list
   ```

4. **Se algum teste falhar:**
   - Ler o erro com atenção
   - Verificar se é problema de selector (a UI pode ter mudado)
   - Verificar se é problema de dados (campo não encontrado, label diferente)
   - Corrigir e re-executar até 17/17 testes passarem

5. **Screenshots:** Os testes já salvam screenshots em `runtime/screenshots/tutorial-sprint1-1/`.
   Verificar que os arquivos foram criados corretamente após a execução.

---

## PARTE 5 — Regenerar o Relatório de Validação

### Arquivo a gerar: `docs/RELATORIO_VALIDACAO_SPRINT1_TUTORIAL1.md`

### Formato:
Seguir EXATAMENTE o formato do relatório existente. Ler o arquivo atual para entender a estrutura.

### O que incluir:

1. **Cabeçalho** com empresa correta (dados atualizados), data de execução (hoje),
   resultado geral, quantidade de screenshots.

2. **Sumário de Resultados** — tabela com todos os 17 UCs, tempo real (do output do Playwright)
   e status.

3. **Detalhamento por UC** — para CADA um dos 17 UCs:
   - Tabela de passos: Ação | Resposta Esperada | Screenshot
   - Resultado
   - **Evidências Visuais:** Inserir CADA screenshot inline com caminho relativo
     `../runtime/screenshots/tutorial-sprint1-1/NOME.png`
   - Usar 2 screenshots por passo relevante (ação + resposta) conforme padrão do projeto

4. **Seção final:** Resumo executivo, métricas, recomendações.

### Regras de screenshots:
- Caminho relativo: `../runtime/screenshots/tutorial-sprint1-1/`
- Formato markdown: `![DESCRICAO](../runtime/screenshots/tutorial-sprint1-1/ARQUIVO.png)`
- Incluir TODAS as screenshots geradas, não pular nenhuma
- A ordem deve seguir a sequência dos passos do teste

---

## CHECKLIST FINAL

- [ ] dadosempportpar-1.md com dados REAIS de empresa hospitalar (CNPJ válido)
- [ ] dadosempportpar-2.md com dados REAIS de empresa de diagnóstico (CNPJ válido)
- [ ] tutorialsprint1-1.md atualizado com novos dados
- [ ] tutorialsprint1-2.md atualizado com novos dados
- [ ] Banco de dados limpo (dados antigos da MedSupply removidos)
- [ ] tutorial-sprint1-1.spec.ts atualizado com novos dados
- [ ] helpers.ts atualizado para tratar seleção de empresa no login (se necessário)
- [ ] 17/17 testes passando
- [ ] Screenshots em runtime/screenshots/tutorial-sprint1-1/ atualizadas
- [ ] RELATORIO_VALIDACAO_SPRINT1_TUTORIAL1.md regenerado com screenshots inline corretas
- [ ] Backend e frontend PARADOS após concluir (matar processos na porta 5007 e 5175)

---

## NOTAS IMPORTANTES

1. **SEMPRE parar backend/frontend** ao terminar — `pkill -f "python app.py"` e `pkill -f "vite"`
2. O usuário de teste é `pasteurjr@gmail.com` / `123456` — é superuser
3. A empresa de teste deve ser a que está vinculada a este usuário em `usuario_empresa`
4. Não criar empresas novas — usar a empresa existente vinculada ao usuário
5. Se precisar verificar a empresa vinculada: `SELECT ue.*, e.razao_social FROM usuario_empresa ue JOIN empresas e ON e.id = ue.empresa_id WHERE ue.user_id = (SELECT id FROM users WHERE email='pasteurjr@gmail.com');`
6. O campo `super` na tabela users identifica superusuários
7. Fixtures de upload estão em `tests/fixtures/teste_upload.pdf`
