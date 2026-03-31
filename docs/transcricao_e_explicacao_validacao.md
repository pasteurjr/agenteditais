# Transcrição Integral + Explicação

---

## TRANSCRIÇÃO INTEGRAL

Assistentes de codificação com IA. A gente ama eles, mas eles são na verdade muito ruins em validar o próprio trabalho, a menos que você dê a eles um framework para seguir. E é isso que eu tenho experimentado por centenas de horas até agora, sendo muito específico para o agente de codificação. Para que ele não economize na validação. Ele faz isso o tempo todo. E para que ele realmente teste a aplicação como um usuário faria. Então eu empacotei todo o meu processo de validação que uso para a maior parte do meu código gerado por IA e coloquei em um único comando.

Esse diagrama que você está vendo aqui descreve tudo o que eu preparei para você. E a melhor parte é que isso é bastante genérico. Então vou deixar um link na descrição para esse comando. Você pode literalmente ir e rodar isso em qualquer base de código agora mesmo, desde que ela tenha um frontend. Então quero explicar agora como esse comando funciona e ajudar você a entender algumas das ideias que estão por trás dele para que você possa melhorar seus próprios workflows para que seus agentes de codificação validem o próprio trabalho. Há muitas pepitas de ouro aqui para você. Tenho iterado bastante nisso.

E a razão pela qual isso é tão importante é que os agentes de codificação agora estão gerando código de forma incrivelmente rápida, que é quase impossível para nós acompanhar a validação. E o código gerado por IA ainda é sua responsabilidade. Então você precisa validar. Não vou ser um defensor do "vibe coding". Então o que esse workflow está fazendo é essencialmente delegar o máximo possível da validação para o agente de codificação. Esse é o workflow que vou mostrar em breve, apenas uma prévia rápida. Queremos que ele corrija o máximo de problemas antecipadamente, até mesmo nos apontar onde devemos resolver coisas nós mesmos, para que quando o controle voltar para nós, haja muito menos dessa carga mental, esse peso de ter que revisar centenas ou mesmo milhares de linhas de código que foram geradas nos últimos 20 minutos. E cara, deixa eu te dizer, parece um peso saindo dos meus ombros ao usar esse tipo de processo, especialmente com a evolução que estou vivendo atualmente. É por isso que estou tão animado em mostrar isso a você agora. É por isso que estou chamando de workflow de codificação de IA auto-curativo. Não é que os agentes de codificação vão ser perfeitos com isso, mas chega bem perto. Tenho ficado realmente impressionado com os resultados recentemente.

Então vou mostrar cada pequeno componente desse workflow rapidamente, como funciona. Vamos vê-lo em ação, e também vou falar sobre como você pode incorporar algo assim em seus próprios workflows de codificação com IA. Aqui está o comando ou a skill do Claude Code que vamos usar agora. Vou deixar um link para esse skill.md exato na descrição se você quiser simplesmente pegar esse comando, usá-lo em qualquer base de código agora mesmo. Funciona imediatamente. Ele até instala automaticamente o Vercel Agent Browser CLI. Essa é a ferramenta de automação de navegador em que tenho me apoiado muito ultimamente. Também fiz um vídeo sobre ela que vou linkar aqui. Essa é uma grande parte do processo, mas vai funcionar para qualquer agente de codificação também. Você também pode modificar isso para trabalhar com qualquer outra ferramenta de automação de navegador, como Chrome DevTools, MCP, o que você quiser. E está realmente apenas dando muita especificidade, um framework para o agente de codificação sobre como fazer pesquisa, como deve ser o fluxo para a auto-validação.

Achei que em vez de percorrer todo esse documento markdown, seria muito melhor explicar as coisas mais visualmente. É por isso que tenho esse diagrama que vou cobrir rapidamente para que você entenda todos os componentes que construí nele. Então para sua própria engenharia agêntica, há duas formas que você pode usar esse workflow. Você pode usá-lo sempre que quiser fora de qualquer desenvolvimento de funcionalidade. Talvez você apenas queira em algum momento executar testes completos de ponta a ponta em sua base de código. Isso é o que vou cobrir primeiro como uma demo ao vivo. E então a outra forma que vou abordar mais para o final do vídeo é que você pode construir esse workflow diretamente em seu processo de implementação de funcionalidades. Então, depois que o agente de codificação escrever qualquer tipo de funcionalidade, ele vai mergulhar direto nisso para fazer testes de regressão e garantir que o que acabou de construir está funcionando bem.

Então primeiro de tudo, já que isso é um comando, vamos invocá-lo com /e2e test. E isso vai disparar o workflow de seis etapas que temos aqui. Começando com nossa verificação de pré-requisitos. Como estamos usando uma ferramenta de automação de navegador muito intensamente nesse processo, exijo que você tenha um frontend para sua base de código, o que para mim pessoalmente é a maioria das minhas aplicações — provavelmente é para você também — razão pela qual estou dizendo que podemos usar esse comando para praticamente qualquer base de código. Se você quiser fazer qualquer tipo de teste para apps somente de backend, definitivamente requer um tipo diferente de workflow que vou cobrir em conteúdo futuro. Outra verificação aqui é se você está rodando no Windows, porque se estiver, não pode usar o Vercel Agent Browser CLI, mas pode simplesmente usar o WSL. É literalmente o que estou fazendo neste vídeo.

Então verificamos todos os pré-requisitos. Se estiver tudo bem, vamos para a fase um, nossa fase de pesquisa. O ponto dessa fase é nos fundamentar na aplicação: quais são todas as formas que os usuários realmente usariam essa aplicação para que possamos testar tudo isso, e também entendendo nosso schema de dados e como estamos trabalhando com o banco de dados no geral, porque quase toda aplicação full stack trabalha com um banco de dados. A parte legal disso é que temos três sub-agentes que rodam em paralelo. Isso está construído diretamente no workflow. Então um agente vai entender a estrutura da base de código e como os usuários vão usá-la, outro entende o schema do banco de dados, e o outro está fazendo a parte de revisão de código da nossa validação. O restante desse processo é mais: vamos percorrer a aplicação como um usuário faria. Mas esse sub-agente vai encontrar coisas como erros de lógica que temos em nosso código. Então todos os três sub-agentes rodam em paralelo. Depois a pesquisa é compilada no contexto para nosso agente primário. E então estamos prontos para entrar em nosso teste completo de ponta a ponta.

Instruímos o agente a iniciar o servidor de desenvolvimento. Então ele vai subir toda a aplicação para que ela esteja pronta para acessar a URL. E então vai definir uma lista de tarefas. Cada uma das tarefas vai ser uma das jornadas de usuário que queremos testar. Garantindo que podemos fazer login, garantindo que podemos editar nosso perfil, ou muitas outras coisas que vão ficar bem específicas para sua base de código. Mas ele vai descobrir isso em tempo real com base em sua compreensão aqui. Tudo bem, quais são cada uma das tarefas que temos para definir? E vai realmente gastar um bom tempo com cada uma delas.

Então a seguir com nosso workflow, temos praticamente um loop for construído diretamente, porque vamos olhar essa lista de tarefas e vamos extrair cada uma das jornadas de usuário e completá-las uma de cada vez de forma muito abrangente. Apenas para dar uma pequena demonstração do que a linha do tempo parece. Isso é o que nosso agente de codificação vai passar. Ele vai usar uma combinação do Agent Browser CLI para navegar no site e consultas ao banco de dados para garantir que as coisas estão bem no backend enquanto estamos criando, atualizando e deletando registros. Estou sendo específico para Postgres aqui porque atualmente estou usando Neon com Postgres, mas você pode realmente usar qualquer banco de dados e o comando vai se adaptar.

Como exemplo, o agente vai tirar um snapshot. É assim que ele entende o que temos atualmente na página. Depois vai consultar o banco de dados para garantir que as coisas estão bem, interagir com um determinado elemento e verificar — se há um registro que deveria ter sido criado, por exemplo — e depois vai tirar screenshots ao longo do caminho. Então não só pode verificar que os fluxos estão funcionando corretamente, mas também que a UI está boa, porque os agentes de codificação hoje em dia podem analisar imagens. Teremos um monte de PNGs que ele vai criar ao longo do caminho e armazenar em um diretório para revisarmos depois. Então os screenshots são ótimos para o agente revisar a si mesmo, mas também para nós validarmos depois que o teste de ponta a ponta realmente está completo.

Então nesse ponto, o agente de codificação vai verificar seu trabalho e vai descobrir: há algum problema grave que precisamos resolver aqui? Se houver algo que esteja completamente bloqueando o agente de codificação de realmente validar a jornada do usuário, então ele vai corrigir o código, retestar, tirar novos screenshots, validar e fazer isso em loop até que a jornada do usuário esteja completa. Agora, a distinção realmente importante a fazer aqui é que ainda haverá problemas restantes após o teste de ponta a ponta. Na verdade, geralmente há mais problemas restantes do que os que são corrigidos, porque especificamente instruí o agente de codificação a corrigir apenas os grandes bloqueadores. Então para todos os outros problemas mais moderados ou menores, quero trabalhar com o agente de codificação para descobrir se quero abordá-los e como quero fazer isso.

Então está apenas corrigindo essas coisas para chegar ao ponto em que pode testar toda a jornada do usuário. E depois que fizer isso, vai voltar ao início e percorrer a próxima jornada do usuário que temos na lista de tarefas. Muito sistematicamente completando essas uma de cada vez, fazendo alguma verificação responsiva no final — apenas uma verificação mais leve de percorrer as páginas e garantir que fica bem em mobile, tablet e desktop. E então nos dá o relatório de ponta a ponta no final.

E isso é muito importante. Não estou apenas dizendo a ele para compartilhar com o usuário o que aconteceu de qualquer jeito. Tenho muita estrutura construída no fundo do prompt, no fundo do skill.md. Então está sempre me fornecendo da mesma forma exata toda vez. Aqui está o que corrigimos. Aqui estão os problemas que restaram. E aqui está tudo pelo que passei. Então o objetivo aqui é que com o relatório combinado com os screenshots, posso revisar as coisas muito rapidamente e garantir que o agente realmente fez um bom trabalho identificando todas as jornadas do usuário e percorrendo-as. E opcionalmente, pode gerar um relatório em markdown.

Nesse ponto, a janela de contexto vai estar bastante congestionada com o agente de codificação passando por todos esses testes. Então se houver algo mais com o qual eu queira trabalhar com o agente para raciocinar e abordar, quero fazer isso em uma nova janela de contexto. Então vou pegar o relatório da saída aqui, enviar para uma nova sessão com meu agente de codificação.

O patrocinador do vídeo de hoje é Bright Data, a plataforma que desbloqueia a web para seus agentes de IA, construída para lidar com centenas de agentes rodando em paralelo. Neste vídeo, estamos focados em automação de navegador para localhost — não há proteção anti-bot. Mas quando seus agentes precisam acessar a internet real, coisas como perfis do LinkedIn, sites de e-commerce — todos esses sites estão ativamente tentando bloquear seu agente. É por isso que você precisa da Bright Data. A forma como funciona é genuinamente impressionante. Suas requisições dos agentes são roteadas através de 150 milhões de IPs residenciais. Captchas são resolvidos automaticamente. Fingerprints do navegador são rotacionadas. Seu agente se torna uma pessoa real. E a Bright Data tem um servidor MCP que torna muito fácil começar.

Eles também têm uma API. É o que estou usando para esta demo rápida para mostrar o poder da Bright Data obtendo dados públicos estruturados sob demanda. Por exemplo, posso dizer que estou procurando 10 engenheiros de software em Minneapolis. E olha, veja todos os logs. Ele resolveu os captchas automaticamente. Está puxando informações do LinkedIn. Então tenho todos os perfis deles. Posso pesquisar uma pessoa individual. Agora, isso é apenas uma demonstração. Há um milhão de coisas diferentes que você pode fazer com a Bright Data — puxando qualquer tipo de informação mesmo de fontes como o LinkedIn que geralmente são muito difíceis de rastrear. Agora, 14 dos 20 principais laboratórios de IA já estão rodando seus agentes através da Bright Data. Mais de 100 milhões de interações passam pela plataforma deles todo dia. Então eles realmente são a solução mais confiável quando você precisa de acesso em tempo real à web para seus agentes. Além disso, você pode usar o código Cole Medine. Também tenho um link na descrição para obter seus primeiros $20 de créditos gratuitamente. Então, definitivamente confira a Bright Data.

Muito bem, então vamos fazer uma demo ao vivo agora que entendemos como o comando funciona, todos os componentes dele. Tenho o skill.md aqui no meu repositório local para uma aplicação que construí no último vídeo do meu canal. Construí esse construtor de página link-e-bio. É como o Linktree onde você pode criar seu próprio site onde coloca todos os seus links. Você pode enviar isso para as pessoas — olha, é aqui que você pode ir para ver todas as minhas redes sociais e coisas assim. Então essa é a aplicação que estamos testando aqui. Há bastante coisa construída nessa aplicação para autenticação e gerenciamento de diferentes temas e poder criar seus próprios links. Então teremos bastantes jornadas de usuário para percorrer aqui.

Então vou fazer /e2e test. Sem parâmetros ou nada. E se você estiver usando um agente de codificação que não suporta comandos, você pode literalmente apenas apontá-lo para o skill.md, dizer a ele para ler isso como seu prompt e executar essas instruções. Então vou enviar isso e vai começar imediatamente verificando esses pré-requisitos. Vai garantir que tenho o Vercel Agent Browser CLI, que estou rodando no Linux — neste caso no WSL — e em breve vai disparar os sub-agentes para pesquisa. Olha isso. Está disparando o primeiro para entender a estrutura do app e as jornadas. Agora o próximo para entender o schema do banco de dados. E daqui a pouco veremos o de revisão de código. Aí está. A análise de código para caça de bugs. Obviamente não vou passar por tudo isso com você. Então deixa eu pausar e voltar quando avançar para o próximo estágio. Vou te mostrar tudo de importante aqui.

Muito bem, ótimo. Podemos ver que todos os três sub-agentes terminaram e agora avança para o próximo passo de iniciar toda a nossa aplicação — e sabe como fazer isso, o comando exato a executar, porque é uma das coisas que esse sub-agente encontra para nós. E então mesmo que sua aplicação tenha alguns passos, como containers Docker que você tem que subir, ainda vai descobrir tudo isso. E pode até se deparar com alguns desses problemas de vez em quando onde tem que se autocorrigir. Então não se preocupe, você pode ver muitos erros ao longo de todo o processo. Como aqui, tentou visitar o site antes de ser compilado e iniciado como um app Next.js. Então ele se corrige. Espera um pouco. Finalmente, o servidor está rodando. Agora estamos usando o Agent Browser CLI para visitá-lo. Tirando um screenshot aqui também. Já podemos dar uma olhada nisso se quisermos acompanhar seu progresso enquanto valida. E aqui está nossa lista de tarefas.

Agora que visitou o site pela primeira vez apenas para ter noção, está percorrendo todas as jornadas do usuário. E essa é a parte que demora mais com certeza, porque temos esse loop for. Estamos fazendo bastante coisa para validar cada uma das tarefas que temos aqui. E vamos ver uma combinação do agente de navegador e quaisquer chamadas que fará para visitar o banco de dados e validar nossos registros.

Muito bem. Agora estamos chegando em algumas das partes interessantes da validação onde ele tem que fazer operações de escrita a partir da interface do usuário. Como por exemplo, atualizar nosso perfil para esse site. Vai salvar e depois verificar a atualização no banco de dados. Então vemos ele tirar um snapshot para que entenda. Ok, aqui está o botão salvar. Agora deixa eu clicar nisso. Agora deixa eu tirar um screenshot. Ler o screenshot para garantir que temos uma boa UX de salvar. Diz que salvamos. Temos um pop-up e tudo mais. E depois faz uma chamada ao banco de dados. Então cria uma query aqui para garantir que o registro está confirmado. O perfil foi atualizado com o novo nome de exibição, bio e URL do avatar. Então está ótimo no frontend e está ótimo no nosso banco de dados.

Só indo rapidamente ao console do Neon aqui. Há apenas algumas tabelas que tenho para essa aplicação. Então perfis — aqui é onde acabamos de fazer uma atualização. Você pode ver aqui que temos alguns desses usuários de teste E2E que foram criados. Então o agente de codificação cria um usuário completamente novo, garantindo que pode atualizar perfis e depois entrar e criar itens de link para esse perfil vinculado ao perfil correto. Há muita coisa que acontece com o banco de dados por baixo dos panos e se houver algum problema lá, pode não necessariamente ser refletido no frontend — razão pela qual é realmente importante que estejamos fazendo esse nível de validação também.

E enquanto estamos no painel do Neon, uma coisa que quero mencionar rapidamente é que quando estamos fazendo esse tipo de teste de ponta a ponta e estamos construindo todos esses perfis falsos e links e apenas entradas de banco de dados em geral, isso meio que infla nosso banco de dados. Mesmo com um banco de dados de dev, podemos não querer ter todos esses registros apenas por aí. E então uma coisa que gosto de fazer com o Neon é criar um branch. Isso é algo específico do Neon e de como eles trabalham com Postgres. Podemos criar esses branches onde vai essencialmente tirar um snapshot dos nossos dados atuais e nos dar esse banco de dados secundário com o qual podemos fazer o que quisermos e depois podemos deletar isso e voltar ao nosso branch principal sempre que quisermos. Dessa forma, posso apenas criar esse banco de dados de teste de ponta a ponta e é o banco de dados ao qual estou conectado para meu teste e você pode até construir isso diretamente no workflow.

Não estou fazendo isso agora porque quero que isso seja um workflow mais geral que funcione independentemente do seu banco de dados. Mas há coisas bastante poderosas que você pode fazer para manter seus testes em isolamento, manter seu banco de dados limpo enquanto ainda dá ao seu agente total controle sobre seu banco de dados para criar registros e validar registros, tudo que tem que fazer.

Muito bem, olha isso. Nossa validação está concluída e na verdade corrigiu bastante coisa durante seus testes de ponta a ponta e depois alguns outros problemas que precisaremos resolver com nosso agente depois. Então encontrou alguns dos testes de ponta a ponta e também alguns do sub-agente de caça de bugs que rodou no início. Temos nossa pasta de screenshots de ponta a ponta. Então também podemos validar muitas dessas coisas para garantir que realmente fez todos os testes que esperamos. Mas sim, isso está parecendo muito, muito bom. E então também pergunta se gostaríamos de criar um markdown para enviar para outro agente de codificação para resolver esses problemas. E a partir daqui você pode levar como quiser. Você pode resolver cada um desses problemas um de cada vez. Você pode simplesmente enviar todo esse markdown para outro agente de codificação. Totalmente com você.

Mas a coisa importante aqui é que encontramos até os pequenos problemas — isso é tão detalhado. Adoro a especificidade que esse workflow dá aos nossos agentes de codificação. O tipo de coisa que o agente realmente nunca vai pegar por si mesmo, ou pelo menos muito raramente.

Então um último grande insight que quero cobrir com você rapidamente é como podemos usar essa skill de teste de ponta a ponta diretamente em nosso desenvolvimento de funcionalidades. No último vídeo do meu canal que já linkei, cobri meu processo completo para codificação de IA com desenvolvimento greenfield. E o loop PIV é o framework central aqui. Planejar, Implementar e Validar. E o que sempre faço para meu planejamento é criar um documento markdown estruturado que descreve tudo que precisamos construir e toda a estratégia de validação antes de entrarmos na implementação. E essa é nossa oportunidade de especificar. Podemos literalmente apenas dizer ao agente: quero que você use a skill de teste de ponta a ponta depois de escrever o código para testar as coisas de uma forma muito abrangente.

E para a skill que tenho linkada no repositório do GitHub, na verdade desabilitei a invocação do modelo. Você pode fazer isso com todas as skills do Claude Code. Então se eu remover essa linha, você pode fazer isso você mesmo. Então o agente pode usar a skill de teste de ponta a ponta. Isso é apenas uma segurança porque na maioria das vezes você pode apenas querer invocar isso você mesmo. Mas você remove essa linha e então — cobri isso no último vídeo, é claro — tenho meu comando de funcionalidade de planejamento. É aqui onde descrevo a estrutura exata para meus planos que quero enviar para implementação. Então podemos apenas adicionar uma linha aqui. Tenho os comandos de validação. Tenho uma seção para qualquer validação adicional. É exatamente o template que tenho no último vídeo. Então podemos apenas mudar isso e dizer: use a skill de teste E2E para fazer testes abrangentes. Literalmente tão simples quanto isso. É tudo que temos que fazer.

E então agora vai basicamente usar isso como uma sub-skill. É como um sub-workflow como parte desse workflow de implementação maior — para o qual você tem que ter cuidado com o uso de tokens aqui. E esse realmente é o último aviso que tenho para você para todo esse processo. É um pouco pesado em tokens e vai demorar um pouco. Então definitivamente é o tipo de coisa onde você quer enviar isso e depois trabalhar em outra coisa. Saia do computador, o que for. Apenas deixe isso rodar. Mas o objetivo não é ser rápido. O objetivo é ser abrangente. E o tempo que tenho que esperar que isso termine e os tokens que tenho que gastar, vale a pena para mim. Na verdade, acho que está me poupando tokens no final, porque está encontrando todos esses problemas que de outra forma eu teria que lidar com meus agentes de codificação mais tarde.

E tenho rodado isso dezenas de vezes na última semana e nem mesmo cheguei ao limite de taxa para minha assinatura Claude Code Max. Então é bastante eficiente em tokens no geral. Principalmente o motivo pelo qual demora tanto é apenas porque temos que esperar por todas essas interações de página e às vezes vai rodar um sleep após cliques em um botão para esperar que as coisas carreguem — coisas assim. Então é bastante eficiente em tokens no geral.

Então sim, incentivaria você a pegar essa skill, esse comando, e aplicá-lo agora em alguma base de código com um frontend. Acho que você vai ficar bem impressionado com os tipos de coisa que pode encontrar, os problemas que vai expor. E então se apreciou esse vídeo e está animado com mais coisas sobre codificação de IA e workflows de codificação de IA auto-curativos, realmente apreciaria um like e uma inscrição. E com isso, te vejo no próximo vídeo.

---

## EXPLICAÇÃO COMPLETA

### Sobre o que é esse conteúdo?

O texto é a transcrição de um vídeo técnico em inglês sobre um **workflow de validação automatizada para código gerado por IA**, criado por um desenvolvedor que chama o método de *"self-healing AI coding workflow"* (workflow de codificação IA auto-curativo).

---

### Problema central abordado

Agentes de codificação com IA (como Claude Code, Cursor, etc.) geram código **muito rapidamente**, mas são péssimos em **validar o próprio trabalho** sem uma estrutura formal para isso. O resultado: o desenvolvedor herda centenas ou milhares de linhas de código não testadas, com a responsabilidade de garantir que tudo funciona.

---

### A solução proposta: um comando único `/e2e test`

O autor criou um arquivo `SKILL.md` que instrui o agente de codificação a executar um **processo de validação de 6 etapas** automaticamente. Esse arquivo pode ser copiado e usado em qualquer projeto que tenha frontend.

---

### As 6 etapas do workflow

**1. Verificação de Pré-requisitos**
Checa se o ambiente está pronto: sistema operacional compatível (Linux/WSL), ferramenta de automação de navegador instalada (Vercel Agent Browser CLI), etc.

**2. Fase de Pesquisa (3 sub-agentes em paralelo)**
Três agentes rodam ao mesmo tempo:
- Um mapeia a estrutura do projeto e as jornadas do usuário
- Um analisa o schema do banco de dados
- Um faz revisão de código, buscando erros de lógica

**3. Início do servidor de desenvolvimento**
O agente sobe a aplicação automaticamente, descobrindo sozinho o comando correto para isso.

**4. Geração da lista de tarefas (jornadas do usuário)**
O agente acessa o site rodando e monta a lista de fluxos que precisa testar (login, edição de perfil, criação de registros, etc.).

**5. Loop de testes E2E (ponta a ponta)**
Para cada jornada, o agente:
- Navega no site via automação de navegador
- Tira screenshots para verificar visualmente a UI
- Consulta diretamente o banco de dados para confirmar que os dados foram persistidos corretamente
- Se encontrar um bloqueador total, corrige o código, retesta e continua
- Problemas menores são apenas registrados para resolução posterior

**6. Relatório final estruturado**
Sempre no mesmo formato:
- O que foi corrigido automaticamente
- Quais problemas restaram (para revisão humana)
- Screenshots de todas as jornadas testadas
- Opção de gerar um arquivo markdown para enviar a uma nova sessão do agente

---

### Conceitos-chave para entender

**Por que só corrigir bloqueadores?**
Porque se o agente sair corrigindo tudo, pode introduzir novos bugs ou tomar decisões de produto que são do domínio humano. Problemas menores ficam documentados para revisão consciente.

**Por que usar uma nova janela de contexto no final?**
Porque após rodar todos os testes, a janela de contexto fica muito longa e cara. O relatório markdown permite continuar o trabalho em uma sessão limpa e eficiente.

**Eficiência de tokens**
Apesar de parecer pesado, o autor afirma que na prática é eficiente, pois o tempo gasto é principalmente esperando interações de página (não processamento), e encontrar bugs cedo é mais barato do que corrigir depois.

**Integração no loop de desenvolvimento (PIV)**
O workflow pode ser incorporado diretamente ao processo de desenvolvimento: Planejar → Implementar → Validar (com o skill E2E rodando automaticamente após cada implementação).

---

### Resumo em uma frase

> É um sistema que instrui o próprio agente de IA a testar o código que ele mesmo gerou, simulando o comportamento real do usuário, verificando banco de dados e UI, corrigindo apenas o que bloqueia o teste, e entregando um relatório estruturado — reduzindo drasticamente a carga de validação manual do desenvolvedor.
