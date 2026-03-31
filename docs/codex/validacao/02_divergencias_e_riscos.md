# Divergências e Riscos

## Divergências confirmadas

### 1. Frontend não compila

Impacto:

- alto

Descrição:

- `npm --prefix frontend run build` falhou com grande volume de erros TypeScript

Leitura:

- qualquer validação de cliente precisa considerar que a árvore atual não representa um baseline tecnicamente estável

### 2. Há páginas ainda mockadas expostas na navegação principal

Impacto:

- alto

Páginas confirmadas:

- `CRMPage.tsx`
- `PerdasPage.tsx`
- `ConcorrenciaPage.tsx`
- `FlagsPage.tsx`
- `MonitoriaPage.tsx`
- `MercadoPage.tsx`
- `LancesPage.tsx`

Leitura:

- o cliente pode interpretar como produto entregue algo que ainda é apenas simulação de UI

### 3. Configuração sensível hardcoded/default

Impacto:

- alto

Arquivo:

- `backend/config.py`

Achados:

- host, usuário e senha de MySQL com defaults explícitos
- `JWT_SECRET`/`JWT_SECRET_KEY` com valor padrão inseguro

Leitura:

- risco operacional e de segurança

### 4. Modelo de usuário contém `password_plain`

Impacto:

- crítico

Arquivo:

- `backend/models.py`

Leitura:

- mesmo que o campo seja legado, sua presença em modelo ativo é tecnicamente inadequada

### 5. Repositório com remote contendo token na URL

Impacto:

- crítico

Achado:

- `git remote -v` expôs token embutido na URL do GitHub

Leitura:

- esse token deve ser rotacionado e removido da configuração local

## Riscos estruturais

### 1. Monólito de backend

Arquivos:

- `backend/app.py`
- `backend/tools.py`

Risco:

- regressões frequentes
- alto custo de manutenção
- difícil isolamento de testes

### 2. Acoplamento de tipagem no frontend

Risco:

- qualquer evolução em componentes comuns propaga erros para muitas páginas

### 3. Mistura de documentação ativa com histórico e artefato bruto

Risco:

- dificuldade de o cliente ou a equipe identificar qual documento é a verdade corrente

### 4. Working tree muito ruidosa

Risco:

- commits indevidos de artefatos
- perda de rastreabilidade real

## Prioridades objetivas

### Prioridade 1

- limpar o remote com token embutido
- remover/neutralizar `password_plain`
- corrigir `frontend build`

### Prioridade 2

- esconder ou sinalizar páginas mockadas no menu
- estabilizar baseline de testes executáveis

### Prioridade 3

- modularizar backend por domínio
- consolidar documentação ativa e arquivar histórico
