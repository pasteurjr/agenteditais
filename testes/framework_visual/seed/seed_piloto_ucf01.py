"""
Migration retroativa do piloto UC-F01 (executado em 2026-04-27T16-07-30).

Cria no banco testesvalidacoes:
- 1 teste do user pasteur, sprint 1, projeto Facilicita.IA
- 1 conjunto + 1 ConjuntoCasosDeTeste (CT-F01-FP)
- 1 ExecucaoCasoDeTeste (estado=reprovado, vereditos consolidados)
- 10 PassosExecucao (1 por screenshot par before/after que existe em disco)
- 1 Relatorio com path apontando pro .md ja gerado

Idempotente: nao duplica se ja rodado (titulo='Piloto UC-F01 (retroativo)').
"""
from __future__ import annotations

import sys
from datetime import datetime
from pathlib import Path

_HERE = Path(__file__).resolve().parent
_FW_VISUAL = _HERE.parent
_PROJECT = _FW_VISUAL.parent.parent
sys.path.insert(0, str(_FW_VISUAL))

from db.engine import get_db  # type: ignore
from db.models import (  # type: ignore
    User, Projeto, Sprint, CasoDeUso, CasoDeTeste,
    Teste, ConjuntoDeTeste, ConjuntoCasosDeTeste,
    ExecucaoCasoDeTeste, PassoExecucao, Observacao, Relatorio,
)


PILOTO_TS = "2026-04-27T16-07-30"
PILOTO_DIR = _PROJECT / "testes" / "relatorios" / "visual" / "UC-F01" / PILOTO_TS
PILOTO_RELATORIO = _PROJECT / "testes" / "relatorios" / "visual" / f"UC-F01_fp_{PILOTO_TS}.md"

# Mapeamento dos 10 passos do tutorial UC-F01 fp + vereditos sabidos do log
PASSOS_PILOTO = [
    # (passo_id, titulo, veredito_auto)
    ("passo_00_login",                          "Login (FA-07 entrada)",            "APROVADO"),
    ("passo_01_criar_via_fa07a",                "Criar Nova Empresa (FA-07.A)",     "APROVADO"),
    ("passo_02_clicar_novo",                    "Clicar [Novo] no CRUD",            "APROVADO"),
    ("passo_03_preencher_dados_basicos_crud",   "Preencher TODOS os campos do CRUD","APROVADO"),
    ("passo_04_salvar_no_crud",                 "Salvar empresa no CRUD",           "REPROVADO"),
    ("passo_05_selecionar_empresa",             "Selecionar empresa criada",        "REPROVADO"),
    ("passo_06_navegar_empresa_page",           "Navegar Configuracoes > Empresa",  "APROVADO"),
    ("passo_07_verificar_dados_carregados",     "Verificar dados carregados",       "APROVADO"),
    ("passo_08_completar_presenca_digital",     "Completar redes sociais",          "APROVADO"),
    ("passo_09_salvar_e_confirmar",             "Salvar e confirmar Salvo!",        "APROVADO"),
]


def main():
    print("=== seed_piloto_ucf01 ===")

    # Sanity: arquivos existem?
    if not PILOTO_DIR.exists():
        print(f"  ERRO: dir de evidencias nao encontrado: {PILOTO_DIR}")
        return 1
    if not PILOTO_RELATORIO.exists():
        print(f"  WARN: relatorio MD nao encontrado: {PILOTO_RELATORIO}")

    db = get_db()
    try:
        pasteur = db.query(User).filter_by(email="pasteur@valida.com").first()
        if not pasteur:
            print("  ERRO: user pasteur nao existe — rode seed_testesvalidacoes primeiro")
            return 2

        proj = db.query(Projeto).filter_by(nome="Facilicita.IA").first()
        sprint = db.query(Sprint).filter_by(projeto_id=proj.id, numero=1).first()
        ct_fp = db.query(CasoDeTeste).join(CasoDeUso).filter(
            CasoDeUso.uc_id == "UC-F01",
            CasoDeTeste.ct_id == "CT-F01-FP",
        ).first()
        if not ct_fp:
            print("  ERRO: CT-F01-FP nao existe")
            return 3

        # Idempotencia
        teste_existente = db.query(Teste).filter_by(
            user_id=pasteur.id, titulo="Piloto UC-F01 (retroativo)"
        ).first()
        if teste_existente:
            print(f"  Piloto ja existe (id={teste_existente.id}); abortando seed.")
            return 0

        # Cria teste
        iniciado = datetime.fromisoformat("2026-04-27T16:07:30")
        concluido = datetime.fromisoformat("2026-04-27T16:13:00")
        teste = Teste(
            projeto_id=proj.id,
            sprint_id=sprint.id,
            user_id=pasteur.id,
            titulo="Piloto UC-F01 (retroativo)",
            descricao="Migration retroativa do piloto end-to-end executado em 2026-04-27.",
            ciclo_id="piloto-ucf01",
            estado="concluido",
            iniciado_em=iniciado,
            concluido_em=concluido,
        )
        db.add(teste)
        db.flush()

        # Conjunto + item
        conj = ConjuntoDeTeste(
            teste_id=teste.id,
            nome="Piloto UC-F01",
            descricao="1 CT (CT-F01-FP) — fluxo principal completo + FA-07.A",
        )
        db.add(conj)
        db.flush()

        db.add(ConjuntoCasosDeTeste(
            conjunto_id=conj.id,
            caso_de_teste_id=ct_fp.id,
            ordem=1,
        ))

        # Execucao do CT
        # Vereditos: 8 APROVADOS + 2 REPROVADOS → CT consolidado: REPROVADO
        primeiro_ss = None
        ultimo_ss = None
        execucao = ExecucaoCasoDeTeste(
            teste_id=teste.id,
            caso_de_teste_id=ct_fp.id,
            ordem=1,
            estado="reprovado",
            veredito_automatico="REPROVADO",
            veredicto_po="REPROVADO",
            iniciado_em=iniciado,
            concluido_em=concluido,
            duracao_ms=int((concluido - iniciado).total_seconds() * 1000),
        )
        db.add(execucao)
        db.flush()

        # 10 passos
        for ordem, (passo_id, titulo, veredito_auto) in enumerate(PASSOS_PILOTO, start=1):
            antes = PILOTO_DIR / f"before_{passo_id}.png"
            depois = PILOTO_DIR / f"after_{passo_id}.png"
            antes_path = str(antes.relative_to(_PROJECT)) if antes.exists() else None
            depois_path = str(depois.relative_to(_PROJECT)) if depois.exists() else None
            if ordem == 1 and antes_path:
                primeiro_ss = antes_path
            if depois_path:
                ultimo_ss = depois_path

            p = PassoExecucao(
                execucao_id=execucao.id,
                ordem=ordem,
                passo_id=passo_id,
                passo_titulo=titulo,
                screenshot_antes_path=antes_path,
                screenshot_depois_path=depois_path,
                screenshot_antes_url=f"/teste/{teste.id}/screenshot/before_{passo_id}.png?legacy=1" if antes_path else None,
                screenshot_depois_url=f"/teste/{teste.id}/screenshot/after_{passo_id}.png?legacy=1" if depois_path else None,
                veredito_automatico=veredito_auto,
                veredicto_po=veredito_auto,  # tester aprovou/reprovou de acordo com automatic
                iniciado_em=iniciado,
                concluido_em=concluido,
            )
            db.add(p)
        db.flush()

        # Atualiza screenshots resumo na execucao
        if primeiro_ss:
            execucao.screenshot_antes_path = primeiro_ss
        if ultimo_ss:
            execucao.screenshot_depois_path = ultimo_ss

        # Relatorio
        if PILOTO_RELATORIO.exists():
            conteudo = PILOTO_RELATORIO.read_text(encoding="utf-8")
            db.add(Relatorio(
                teste_id=teste.id,
                formato="md",
                conteudo_md=conteudo,
                path_arquivo=str(PILOTO_RELATORIO.relative_to(_PROJECT)),
                gerado_em=concluido,
            ))

        db.commit()
        print(f"  OK piloto criado:")
        print(f"    teste_id: {teste.id}")
        print(f"    user: pasteur@valida.com")
        print(f"    estado: {teste.estado}")
        print(f"    passos: {len(PASSOS_PILOTO)}")
        print(f"    relatorio: {PILOTO_RELATORIO if PILOTO_RELATORIO.exists() else '(nao encontrado)'}")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
