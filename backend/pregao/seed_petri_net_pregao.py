"""Cria/atualiza projeto 'Simulador Pregao Eletronico' na tabela langnet.projects.

Petri Net: 9 lugares, 15 transicoes, ~25 arcos, 6 agentes (5 licitantes + 1 pregoeiro).

Schema do project_data segue exatamente o do TropicalSales:
- lugares[] com id/nome/tokens/agentId/input_data/output_data/logica
- transicoes[] com id/nome/prioridade/probabilidade/tempo
- arcos[] com origem/destino/peso
- agentes[] com id/nome/coordenadas
"""
import json
import uuid
from sqlalchemy import create_engine, text

LANGNET_URL = "mysql+mysqlconnector://producao:112358123@camerascasas.no-ip.info:3308/langnet?charset=utf8mb4"
USER_ID = "11111111-1111-1111-1111-111111111111"  # Admin Tropical
PROJECT_NAME = "Simulador Pregao Eletronico (agenteditais)"

PETRI_NET = {
    "nome": "Pregao Eletronico Lei 14.133/2021",
    "version": "1.0",
    "description": "Simulador multi-agente: 5 licitantes IA + 1 pregoeiro IA. Modalidade aberto/aberto-fechado.",
    "lugares": [
        {
            "id": "P_INICIO", "nome": "Inicio Sessao",
            "tokens": 1, "coordenadas": {"x": 50, "y": 300}, "delay": 0, "subnet": {},
            "agentId": None,
            "input_data": {"edital_id": "{{edital_id}}", "config": "{{config}}"},
            "output_data": {},
            "logica": "// inicializa sessao no estado_global"
        },
        {
            "id": "P_PROPOSTAS", "nome": "Coleta Propostas Iniciais",
            "tokens": 0, "coordenadas": {"x": 200, "y": 300}, "delay": 0, "subnet": {},
            "agentId": "submeter_propostas",
            "input_data": {"agentes": [], "valor_referencia": 0},
            "output_data": {},
            "logica": ""
        },
        {
            "id": "P_CLASSIFICACAO", "nome": "Classificacao",
            "tokens": 0, "coordenadas": {"x": 350, "y": 300}, "delay": 0, "subnet": {},
            "agentId": "classificar",
            "input_data": {"propostas": [], "valor_referencia": 0},
            "output_data": {},
            "logica": ""
        },
        {
            "id": "P_LANCES_ABERTOS", "nome": "Rodadas Lances Abertos",
            "tokens": 0, "coordenadas": {"x": 500, "y": 300}, "delay": 0, "subnet": {},
            "agentId": "decidir_lances",
            "input_data": {"classificados": [], "rodada": 1, "max_rodadas": 10},
            "output_data": {},
            "logica": ""
        },
        {
            "id": "P_LANCES_FECHADOS", "nome": "Lance Fechado Final",
            "tokens": 0, "coordenadas": {"x": 650, "y": 200}, "delay": 0, "subnet": {},
            "agentId": "lance_fechado",
            "input_data": {"top3": []},
            "output_data": {},
            "logica": ""
        },
        {
            "id": "P_NEGOCIACAO", "nome": "Negociacao com Vencedor",
            "tokens": 0, "coordenadas": {"x": 800, "y": 300}, "delay": 0, "subnet": {},
            "agentId": "negociar",
            "input_data": {"vencedor_atual": {}, "valor_referencia": 0},
            "output_data": {},
            "logica": ""
        },
        {
            "id": "P_HABILITACAO", "nome": "Habilitacao Documental",
            "tokens": 0, "coordenadas": {"x": 950, "y": 300}, "delay": 0, "subnet": {},
            "agentId": "habilitar",
            "input_data": {"vencedor": {}},
            "output_data": {},
            "logica": ""
        },
        {
            "id": "P_ADJUDICACAO", "nome": "Adjudicacao",
            "tokens": 0, "coordenadas": {"x": 1100, "y": 300}, "delay": 0, "subnet": {},
            "agentId": "adjudicar",
            "input_data": {"vencedor_habilitado": {}},
            "output_data": {},
            "logica": ""
        },
        {
            "id": "P_RESULTADO", "nome": "Ata + Resultado",
            "tokens": 0, "coordenadas": {"x": 1250, "y": 300}, "delay": 0, "subnet": {},
            "agentId": "gerar_ata",
            "input_data": {"sessao_completa": {}},
            "output_data": {},
            "logica": ""
        },
    ],
    "transicoes": [
        {"id": "T_ABRIR_PROPOSTAS", "nome": "Abrir Propostas",
         "orientacao": "vert", "coordenadas": {"x": 125, "y": 300},
         "prioridade": 10, "probabilidade": 1, "tempo": 0},
        {"id": "T_TODAS_PROPOSTAS", "nome": "Todas Propostas Submetidas",
         "orientacao": "vert", "coordenadas": {"x": 275, "y": 300},
         "prioridade": 9, "probabilidade": 1, "tempo": 0},
        {"id": "T_INICIAR_LANCES", "nome": "Iniciar Lances",
         "orientacao": "vert", "coordenadas": {"x": 425, "y": 300},
         "prioridade": 8, "probabilidade": 1, "tempo": 0},
        {"id": "T_NOVA_RODADA", "nome": "Nova Rodada",
         "orientacao": "vert", "coordenadas": {"x": 500, "y": 400},
         "prioridade": 7, "probabilidade": 1, "tempo": 0},
        {"id": "T_SEM_MAIS_LANCES_ABERTO_FECHADO", "nome": "Sem Mais Lances (aberto+fechado)",
         "orientacao": "vert", "coordenadas": {"x": 575, "y": 250},
         "prioridade": 6, "probabilidade": 1, "tempo": 0},
        {"id": "T_SEM_MAIS_LANCES_ABERTO", "nome": "Sem Mais Lances (so aberto)",
         "orientacao": "vert", "coordenadas": {"x": 575, "y": 350},
         "prioridade": 6, "probabilidade": 1, "tempo": 0},
        {"id": "T_FECHADO_PARA_NEGOCIACAO", "nome": "Apos Fechado",
         "orientacao": "vert", "coordenadas": {"x": 725, "y": 250},
         "prioridade": 5, "probabilidade": 1, "tempo": 0},
        {"id": "T_NEGOCIAR", "nome": "Negociar",
         "orientacao": "vert", "coordenadas": {"x": 875, "y": 300},
         "prioridade": 4, "probabilidade": 1, "tempo": 0},
        {"id": "T_PULAR_NEGOCIACAO", "nome": "Pular Negociacao",
         "orientacao": "vert", "coordenadas": {"x": 875, "y": 350},
         "prioridade": 4, "probabilidade": 1, "tempo": 0},
        {"id": "T_HABILITAR", "nome": "Habilitar",
         "orientacao": "vert", "coordenadas": {"x": 1025, "y": 300},
         "prioridade": 3, "probabilidade": 0.9, "tempo": 0},
        {"id": "T_INABILITAR", "nome": "Inabilitar e Chamar Proximo",
         "orientacao": "vert", "coordenadas": {"x": 1025, "y": 400},
         "prioridade": 3, "probabilidade": 0.1, "tempo": 0},
        {"id": "T_ADJUDICAR", "nome": "Adjudicar",
         "orientacao": "vert", "coordenadas": {"x": 1175, "y": 300},
         "prioridade": 2, "probabilidade": 1, "tempo": 0},
        {"id": "T_GERAR_ATA", "nome": "Gerar Ata",
         "orientacao": "vert", "coordenadas": {"x": 1325, "y": 300},
         "prioridade": 1, "probabilidade": 1, "tempo": 0},
    ],
    "arcos": [
        # Fluxo principal
        {"origem": "P_INICIO", "destino": "T_ABRIR_PROPOSTAS", "peso": 1},
        {"origem": "T_ABRIR_PROPOSTAS", "destino": "P_PROPOSTAS", "peso": 1},
        {"origem": "P_PROPOSTAS", "destino": "T_TODAS_PROPOSTAS", "peso": 1},
        {"origem": "T_TODAS_PROPOSTAS", "destino": "P_CLASSIFICACAO", "peso": 1},
        {"origem": "P_CLASSIFICACAO", "destino": "T_INICIAR_LANCES", "peso": 1},
        {"origem": "T_INICIAR_LANCES", "destino": "P_LANCES_ABERTOS", "peso": 1},
        # Loop de rodadas
        {"origem": "P_LANCES_ABERTOS", "destino": "T_NOVA_RODADA", "peso": 1},
        {"origem": "T_NOVA_RODADA", "destino": "P_LANCES_ABERTOS", "peso": 1},
        # Saida pra fechado ou direto pra negociacao
        {"origem": "P_LANCES_ABERTOS", "destino": "T_SEM_MAIS_LANCES_ABERTO_FECHADO", "peso": 1},
        {"origem": "T_SEM_MAIS_LANCES_ABERTO_FECHADO", "destino": "P_LANCES_FECHADOS", "peso": 1},
        {"origem": "P_LANCES_ABERTOS", "destino": "T_SEM_MAIS_LANCES_ABERTO", "peso": 1},
        {"origem": "T_SEM_MAIS_LANCES_ABERTO", "destino": "P_NEGOCIACAO", "peso": 1},
        {"origem": "P_LANCES_FECHADOS", "destino": "T_FECHADO_PARA_NEGOCIACAO", "peso": 1},
        {"origem": "T_FECHADO_PARA_NEGOCIACAO", "destino": "P_NEGOCIACAO", "peso": 1},
        # Negociacao
        {"origem": "P_NEGOCIACAO", "destino": "T_NEGOCIAR", "peso": 1},
        {"origem": "T_NEGOCIAR", "destino": "P_HABILITACAO", "peso": 1},
        {"origem": "P_NEGOCIACAO", "destino": "T_PULAR_NEGOCIACAO", "peso": 1},
        {"origem": "T_PULAR_NEGOCIACAO", "destino": "P_HABILITACAO", "peso": 1},
        # Habilitacao
        {"origem": "P_HABILITACAO", "destino": "T_HABILITAR", "peso": 1},
        {"origem": "T_HABILITAR", "destino": "P_ADJUDICACAO", "peso": 1},
        {"origem": "P_HABILITACAO", "destino": "T_INABILITAR", "peso": 1},
        {"origem": "T_INABILITAR", "destino": "P_NEGOCIACAO", "peso": 1},
        # Adjudicacao + Resultado
        {"origem": "P_ADJUDICACAO", "destino": "T_ADJUDICAR", "peso": 1},
        {"origem": "T_ADJUDICAR", "destino": "P_RESULTADO", "peso": 1},
        {"origem": "P_RESULTADO", "destino": "T_GERAR_ATA", "peso": 1},
    ],
    "agentes": [
        {"id": "licitante_agressivo", "nome": "Licitante Agressivo",
         "coordenadas": {"x": 100, "y": 50}, "width": 150, "height": 60},
        {"id": "licitante_conservador", "nome": "Licitante Conservador",
         "coordenadas": {"x": 270, "y": 50}, "width": 150, "height": 60},
        {"id": "licitante_erratico", "nome": "Licitante Erratico",
         "coordenadas": {"x": 440, "y": 50}, "width": 150, "height": 60},
        {"id": "licitante_calculista", "nome": "Licitante Calculista",
         "coordenadas": {"x": 610, "y": 50}, "width": 150, "height": 60},
        {"id": "licitante_reativo", "nome": "Licitante Reativo",
         "coordenadas": {"x": 780, "y": 50}, "width": 150, "height": 60},
        {"id": "pregoeiro_ia", "nome": "Pregoeiro IA",
         "coordenadas": {"x": 950, "y": 50}, "width": 150, "height": 60},
    ],
}


def main():
    e = create_engine(LANGNET_URL)
    with e.connect() as c:
        # Verifica se ja existe (UPSERT por nome)
        existente = c.execute(
            text("SELECT id FROM projects WHERE name = :n"), {"n": PROJECT_NAME}
        ).fetchone()
        pdata = json.dumps(PETRI_NET, ensure_ascii=False)
        if existente:
            pid = existente[0]
            c.execute(text("UPDATE projects SET project_data=:d, updated_at=NOW() WHERE id=:i"),
                      {"d": pdata, "i": pid})
            print(f"[update] projeto {pid} atualizado ({len(pdata)} bytes)")
        else:
            pid = str(uuid.uuid4())
            c.execute(text("""INSERT INTO projects
                (id, name, description, domain, framework, default_llm, status,
                 project_data, user_id, created_at, updated_at)
                VALUES (:id, :n, :desc, :dom, :fw, :llm, 'active', :d, :u, NOW(), NOW())"""),
                {"id": pid, "n": PROJECT_NAME,
                 "desc": "Simulador multi-agente Lei 14.133/2021. 5 personalidades + pregoeiro IA. Roda em agenteditais.",
                 "dom": "licitacoes", "fw": "custom", "llm": "deepseek-chat",
                 "d": pdata, "u": USER_ID})
            print(f"[novo] projeto {pid} criado ({len(pdata)} bytes)")
        c.commit()
        # Confere
        r = c.execute(text("SELECT id, name, LENGTH(project_data) FROM projects WHERE id=:i"),
                      {"i": pid}).fetchone()
        print(f"[ok] confirmado: {r}")
        return pid


if __name__ == "__main__":
    pid = main()
    print(f"\nLANGNET_PROJECT_ID={pid}")
