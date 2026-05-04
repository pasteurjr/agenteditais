import random
from typing import Dict, Any, Callable, Optional

class EstadoGlobal:
    """
    Representa o estado global da rede de Petri, semelhante ao AgentState do LangGraph.
    """
    def __init__(self, dados: Optional[Dict[str, Any]] = None):
        self.dados = dados if dados else {}

    def atualizar(self, novos_dados: Dict[str, Any]):
        """Atualiza o estado global com novos dados."""
        if isinstance(novos_dados, dict):
            self.dados.update(novos_dados)
        else:
            raise ValueError("Novos dados devem ser um dicionário.")

    def __str__(self):
        return f"EstadoGlobal(dados={self.dados})"


class Lugar:
    """
    Representa um lugar na Petri Net, que pode ter tokens e uma função associada.
    A função recebe e retorna o estado global.
    """
    def __init__(self, nome: str, funcao: Optional[Callable] = None, numero_tokens: int = 0):
        self.nome = nome
        if funcao is not None and not callable(funcao):
            raise ValueError("A função associada ao lugar deve ser callable.")
        self.funcao = funcao
        self.numero_tokens = numero_tokens

    def executar(self, estado_global: EstadoGlobal, entrada: Optional[Dict[str, Any]] = None) -> EstadoGlobal:
        """
        Executa a função associada ao lugar, se existir.
        A função recebe o estado global e retorna o estado atualizado.
        """
        if self.funcao:
            novo_estado = self.funcao(estado_global, entrada)
            if isinstance(novo_estado, EstadoGlobal):
                return novo_estado
            else:
                raise ValueError("A função deve retornar um objeto do tipo EstadoGlobal.")
        return estado_global

    def atualizar_tokens(self, delta: int):
        """
        Atualiza o número de tokens no lugar.
        """
        self.numero_tokens += delta
        if self.numero_tokens < 0:
            raise ValueError(f"Número de tokens em {self.nome} não pode ser negativo.")

    def __str__(self):
        return f"Lugar(nome={self.nome}, tokens={self.numero_tokens}, funcao={self.funcao is not None})"


class Arco:
    """
    Representa a conexão entre um lugar e uma transição, com um peso associado.
    """
    def __init__(self, lugar: Lugar, peso: int = 1):
        self.lugar = lugar
        self.peso = peso

    def __str__(self):
        return f"Arco(lugar={self.lugar.nome}, peso={self.peso})"


class Transicao:
    """
    Representa uma transição na Petri Net, conectando lugares de entrada e saída.
    Pode incluir uma função de guarda que determina se a transição pode disparar.
    """
    def __init__(self, nome: str, entrada: Optional[list[Arco]] = None, 
                 saida: Optional[list[Arco]] = None, prioridade: int = 0,
                 guarda: Optional[Callable[[EstadoGlobal], bool]] = None):
        self.nome = nome
        self.entrada = entrada if entrada else []
        self.saida = saida if saida else []
        self.prioridade = prioridade
        self.guarda = guarda

    def verificar_habilitacao(self, estado_global: Optional[EstadoGlobal] = None) -> bool:
        """
        Verifica se a transição está habilitada, considerando:
        1. Se há tokens suficientes nos lugares de entrada
        2. Se a função de guarda (quando existir) retorna True
        """
        # Primeiro verifica os tokens
        if not all(arco.lugar.numero_tokens >= arco.peso for arco in self.entrada):
            return False
            
        # Depois verifica a guarda, se existir
        if self.guarda is not None and estado_global is not None:
            try:
                return self.guarda(estado_global)
            except Exception as e:
                print(f"Erro ao avaliar guarda da transição {self.nome}: {e}")
                return False
                
        return True

    def disparar(self, estado_global: Optional[EstadoGlobal] = None):
        """
        Dispara a transição se estiver habilitada, considerando a guarda.
        """
        if not self.verificar_habilitacao(estado_global):
            raise Exception(f"Transição {self.nome} não está habilitada!")

        # Verificar se os tokens não ficarão negativos
        for arco in self.entrada:
            if arco.lugar.numero_tokens < arco.peso:
                raise Exception(f"Transição {self.nome} não pode ser disparada: tokens insuficientes em {arco.lugar.nome}.")

        # Consumir tokens dos lugares de entrada
        for arco in self.entrada:
            arco.lugar.atualizar_tokens(-arco.peso)

        # Produzir tokens nos lugares de saída
        for arco in self.saida:
            arco.lugar.atualizar_tokens(arco.peso)

    def __str__(self):
        entrada_nomes = [f"{arco.lugar.nome} (peso={arco.peso})" for arco in self.entrada]
        saida_nomes = [f"{arco.lugar.nome} (peso={arco.peso})" for arco in self.saida]
        return f"Transicao(nome={self.nome}, prioridade={self.prioridade}, entrada={entrada_nomes}, saida={saida_nomes}, guarda={'sim' if self.guarda else 'não'})"


class PetriNet:
    """
    Representa a rede de Petri, que contém lugares, transições e um método de execução.
    """
    def __init__(self, nome: str):
        self.nome = nome
        self.lugares = []
        self.transicoes = []
        self.log_execucao = []
        self.estado_global = EstadoGlobal()

    def adicionar_lugar(self, lugar: Lugar):
        """Adiciona um lugar à rede."""
        self.lugares.append(lugar)

    def adicionar_transicao(self, transicao: Transicao):
        """Adiciona uma transição à rede."""
        self.transicoes.append(transicao)

    def verificar_consistencia(self):
        """Verifica a consistência da rede."""
        for transicao in self.transicoes:
            for arco in transicao.entrada + transicao.saida:
                if arco.lugar not in self.lugares:
                    raise Exception(f"Arco conectado a lugar inexistente: {arco.lugar.nome}.")

    def executar(self, max_iteracoes: int = 1000):
        """
        Executa a rede de Petri, disparando as transições habilitadas em ordem de prioridade.
        """
        self.verificar_consistencia()
        iteracao = 0
        while iteracao < max_iteracoes:
            iteracao += 1
            # Encontrar transições habilitadas, considerando guardas
            habilitadas = [t for t in self.transicoes if t.verificar_habilitacao(self.estado_global)]
            if not habilitadas:
                print("Nenhuma transição habilitada. Execução encerrada.")
                break

            # Escolher a transição com maior prioridade
            max_prioridade = max(t.prioridade for t in habilitadas)
            candidatas = [t for t in habilitadas if t.prioridade == max_prioridade]

            # Em caso de empate na prioridade, escolher aleatoriamente
            transicao_escolhida = random.choice(candidatas)

            # Disparar a transição escolhida
            transicao_escolhida.disparar(self.estado_global)
            self.log_execucao.append(f"Transição {transicao_escolhida.nome} disparada.")
            print(f"Iteração {iteracao}: Transição {transicao_escolhida.nome} disparada.")

            # Executar funções associadas aos lugares de saída
            for arco in transicao_escolhida.saida:
                self.estado_global = arco.lugar.executar(self.estado_global)

        if iteracao == max_iteracoes:
            print(f"Atingido o limite máximo de iterações ({max_iteracoes}). Execução interrompida.")

    def obter_estado_rede(self) -> dict:
        """Retorna o estado atual da rede (tokens em cada lugar)."""
        return {lugar.nome: lugar.numero_tokens for lugar in self.lugares}

    def executar_vetor_transicoes(self, vetor_transicoes: list[str]) -> dict:
        """
        Executa um vetor de transições na ordem especificada.
        Retorna o estado final da rede.
        """
        for nome_transicao in vetor_transicoes:
            transicao = next((t for t in self.transicoes if t.nome == nome_transicao), None)
            if not transicao:
                return {
                    "sucesso": False,
                    "mensagem": f"Transição '{nome_transicao}' não encontrada.",
                    "estado_final": self.obter_estado_rede()
                }
            
            if not transicao.verificar_habilitacao(self.estado_global):
                return {
                    "sucesso": False,
                    "mensagem": f"Transição '{nome_transicao}' não habilitada.",
                    "estado_final": self.obter_estado_rede()
                }
                
            try:
                transicao.disparar(self.estado_global)
                self.log_execucao.append(f"Transição '{nome_transicao}' disparada.")
                
                # Executar funções dos lugares de saída
                for arco in transicao.saida:
                    self.estado_global = arco.lugar.executar(self.estado_global)
                    
            except Exception as e:
                return {
                    "sucesso": False,
                    "mensagem": str(e),
                    "estado_final": self.obter_estado_rede()
                }

        return {
            "sucesso": True,
            "mensagem": "Todas as transições foram executadas com sucesso.",
            "estado_final": self.obter_estado_rede()
        }

    def __str__(self):
        return f"PetriNet(nome={self.nome}, lugares={len(self.lugares)}, transições={len(self.transicoes)})"