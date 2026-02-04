#!/usr/bin/env python3
"""
Script de teste para funcionalidades 4-9 da Sprint 1
Gera relatório em Markdown
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:5007"
REPORT_FILE = "docs/RELATORIO_TESTES_SPRINT1.md"

# Credenciais
EMAIL = "teste@teste.com"
PASSWORD = "123456"

def get_token():
    """Obtém token de autenticação"""
    resp = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": EMAIL, "password": PASSWORD}
    )
    if resp.status_code == 200:
        return resp.json()["access_token"]
    raise Exception(f"Falha no login: {resp.text}")

def create_session(token: str):
    """Cria uma nova sessão"""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    resp = requests.post(
        f"{BASE_URL}/api/sessions",
        headers=headers,
        json={"name": "Teste Sprint 1"}
    )
    if resp.status_code in [200, 201]:
        return resp.json().get("id") or resp.json().get("session_id")
    # Tentar listar e pegar a primeira
    resp = requests.get(f"{BASE_URL}/api/sessions", headers=headers)
    if resp.status_code == 200:
        sessions = resp.json()
        if sessions:
            return sessions[0].get("id")
    raise Exception(f"Falha ao criar sessão: {resp.text}")

def send_chat(token: str, message: str, session_id: str = "test-sprint1"):
    """Envia mensagem para o chat"""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    resp = requests.post(
        f"{BASE_URL}/api/chat",
        headers=headers,
        json={"message": message, "session_id": session_id},
        timeout=120
    )
    return resp.json()

def run_tests():
    """Executa todos os testes"""
    print("Obtendo token...")
    token = get_token()
    print(f"Token obtido: {token[:50]}...")

    print("Criando sessão...")
    session_id = create_session(token)
    print(f"Sessão: {session_id}")

    results = []

    # Testes organizados por funcionalidade
    tests = [
        # Funcionalidade 4: Buscar Preços no PNCP
        {
            "funcionalidade": "4 - Buscar Preços no PNCP",
            "intencao": "buscar_precos_pncp",
            "prompts": [
                "Busque preços de hematologia no PNCP",
                "Qual o preço de mercado para analisador bioquímico?",
            ]
        },
        # Funcionalidade 5: Histórico de Preços
        {
            "funcionalidade": "5 - Histórico de Preços",
            "intencao": "historico_precos",
            "prompts": [
                "Mostre o histórico de preços de hematologia",
                "Quais preços já registramos?",
            ]
        },
        # Funcionalidade 6: Análise de Concorrentes
        {
            "funcionalidade": "6 - Análise de Concorrentes",
            "intencao": "listar_concorrentes / analisar_concorrente",
            "prompts": [
                "Liste os concorrentes conhecidos",
                "Analise o concorrente MedLab",
            ]
        },
        # Funcionalidade 7: Recomendação de Preços
        {
            "funcionalidade": "7 - Recomendação de Preços",
            "intencao": "recomendar_preco",
            "prompts": [
                "Recomende preço para analisador hematológico",
                "Qual preço sugerir para equipamento laboratorial?",
            ]
        },
        # Funcionalidade 8: Classificação de Editais
        {
            "funcionalidade": "8 - Classificação de Editais",
            "intencao": "classificar_edital",
            "prompts": [
                "Classifique este edital: Aquisição de analisador hematológico automático",
                "Que tipo de edital é: Locação de equipamento com fornecimento de reagentes",
            ]
        },
        # Funcionalidade 9: Verificar Completude
        {
            "funcionalidade": "9 - Verificar Completude do Produto",
            "intencao": "verificar_completude",
            "prompts": [
                "Verifique completude do produto Mindray",
                "O produto BC-5000 está completo?",
            ]
        },
    ]

    for test_group in tests:
        func_name = test_group["funcionalidade"]
        print(f"\n{'='*60}")
        print(f"Testando: {func_name}")
        print('='*60)

        for prompt in test_group["prompts"]:
            print(f"\nPrompt: {prompt}")
            start_time = time.time()

            try:
                resp = send_chat(token, prompt, session_id)
                elapsed = time.time() - start_time

                response_text = resp.get("response", resp.get("error", "Sem resposta"))
                success = "error" not in resp or resp.get("response")

                print(f"Tempo: {elapsed:.2f}s")
                print(f"Status: {'OK' if success else 'ERRO'}")
                print(f"Resposta (primeiros 300 chars): {response_text[:300]}...")

                results.append({
                    "funcionalidade": func_name,
                    "intencao": test_group["intencao"],
                    "prompt": prompt,
                    "success": success,
                    "response": response_text,
                    "time": elapsed
                })

            except Exception as e:
                print(f"ERRO: {e}")
                results.append({
                    "funcionalidade": func_name,
                    "intencao": test_group["intencao"],
                    "prompt": prompt,
                    "success": False,
                    "response": str(e),
                    "time": 0
                })

            # Pequena pausa entre requests
            time.sleep(1)

    return results

def generate_report(results):
    """Gera relatório em Markdown"""
    report = f"""# Relatório de Testes - Sprint 1

**Data:** {datetime.now().strftime("%d/%m/%Y %H:%M")}

## Resumo

| Funcionalidade | Testes | Sucessos | Falhas |
|----------------|--------|----------|--------|
"""

    # Agrupar por funcionalidade
    by_func = {}
    for r in results:
        func = r["funcionalidade"]
        if func not in by_func:
            by_func[func] = {"total": 0, "success": 0, "failed": 0}
        by_func[func]["total"] += 1
        if r["success"]:
            by_func[func]["success"] += 1
        else:
            by_func[func]["failed"] += 1

    for func, stats in by_func.items():
        report += f"| {func} | {stats['total']} | {stats['success']} | {stats['failed']} |\n"

    report += "\n---\n\n## Detalhes dos Testes\n\n"

    current_func = ""
    for r in results:
        if r["funcionalidade"] != current_func:
            current_func = r["funcionalidade"]
            report += f"\n### {current_func}\n\n"
            report += f"**Intenção:** `{r['intencao']}`\n\n"

        status = "✅" if r["success"] else "❌"
        report += f"#### {status} Teste: {r['prompt']}\n\n"
        report += f"**Tempo de resposta:** {r['time']:.2f}s\n\n"
        report += f"**Resposta:**\n\n"

        # Limitar tamanho da resposta
        response = r["response"]
        if len(response) > 2000:
            response = response[:2000] + "\n\n... (resposta truncada)"

        report += f"```\n{response}\n```\n\n"
        report += "---\n\n"

    return report

def main():
    print("="*60)
    print("TESTES SPRINT 1 - Funcionalidades 4-9")
    print("="*60)

    results = run_tests()

    print("\n\nGerando relatório...")
    report = generate_report(results)

    with open(REPORT_FILE, "w") as f:
        f.write(report)

    print(f"\nRelatório salvo em: {REPORT_FILE}")

    # Resumo
    total = len(results)
    success = sum(1 for r in results if r["success"])
    print(f"\nResultado: {success}/{total} testes passaram")

if __name__ == "__main__":
    main()
