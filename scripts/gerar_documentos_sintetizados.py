#!/usr/bin/env python3
"""
Gera documentos sintetizados (PDFs ficticios) para todos os UCs das 5 sprints.

Estrutura de saida:
    docs/documentos_sintetizados/
        sprint1/UC-F01/contrato_social.pdf
        sprint1/UC-F03/contrato_social.pdf, cnd_federal.pdf, ...
        sprint2/UC-CV05/relatorio.pdf
        sprint3-4/UC-R01/proposta_tecnica.pdf, proposta_comercial.pdf
        sprint4/UC-I04/peticao_impugnacao.pdf
        sprint5/UC-CT01/contrato.pdf
        ...

Uso:
    python3 scripts/gerar_documentos_sintetizados.py
"""
from __future__ import annotations

import sys
from datetime import datetime, timedelta
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "testes" / "framework_provisionamento"))

# Empresa fakes diferentes por sprint pra mostrar variedade
EMPRESAS = {
    "sprint1": {
        "razao_social": "DEMO SPRINT1 Comercio e Representacoes Ltda",
        "nome_fantasia": "DEMO SPRINT1",
        "cnpj": "11.111.111/0001-11",
        "endereco": "Av. da Validacao, 1000 — Sao Paulo/SP — CEP 01000-000",
    },
    "sprint2": {
        "razao_social": "DEMO SPRINT2 Servicos Hospitalares Ltda",
        "nome_fantasia": "DEMO SPRINT2",
        "cnpj": "22.222.222/0001-22",
        "endereco": "Rua dos Editais, 200 — Sao Paulo/SP — CEP 02000-000",
    },
    "sprint3-4": {
        "razao_social": "DEMO SPRINT34 Equipamentos Medicos S/A",
        "nome_fantasia": "DEMO SPRINT34",
        "cnpj": "33.333.333/0001-33",
        "endereco": "Rua das Propostas, 300 — Sao Paulo/SP — CEP 03000-000",
    },
    "sprint4": {
        "razao_social": "DEMO SPRINT4 Distribuidora Ltda",
        "nome_fantasia": "DEMO SPRINT4",
        "cnpj": "44.444.444/0001-44",
        "endereco": "Rua dos Recursos, 400 — Sao Paulo/SP — CEP 04000-000",
    },
    "sprint5": {
        "razao_social": "DEMO SPRINT5 Industrial e Comercial Ltda",
        "nome_fantasia": "DEMO SPRINT5",
        "cnpj": "55.555.555/0001-55",
        "endereco": "Rua dos Contratos, 500 — Sao Paulo/SP — CEP 05000-000",
    },
}

EDITAL_PADRAO = {
    "numero": "001/2026",
    "modalidade": "Pregao Eletronico",
    "tipo": "Menor Preco",
    "forma_disputa": "Aberta + Fechada",
    "criterio": "Menor Preco por Item",
    "regime": "Empreitada por Preco Unitario",
    "modo_compra": "SRP — Sistema de Registro de Precos",
    "orgao": "Secretaria Municipal de Saude — Sao Paulo",
    "cnpj_orgao": "46.392.130/0001-18",
    "uasg": "925456",
    "pregoeiro": "Maria Santos da Silva",
    "objeto": "Aquisicao de equipamentos medico-hospitalares destinados ao atendimento das unidades de saude municipais.",
    "valor_estimado": "R$ 2.500.000,00 (dois milhoes e quinhentos mil reais)",
    "dt_publicacao": "15/01/2026",
    "dt_esclarecimento": "22/01/2026",
    "dt_impugnacao": "22/01/2026",
    "dt_abertura": "30/01/2026 as 09:00",
}

PRODUTO_PADRAO = {
    "nome": "Monitor Multiparametros Pro",
    "modelo": "GEN-2024-PRO",
    "fabricante": "FabGenerico Industrial S/A",
    "cnpj_fabricante": "11.222.333/0001-44",
    "afe": "AFE 1.23.456-7",
    "registro_anvisa": "80149340136",
    "data_registro": "15/03/2024",
    "validade_anvisa": "15/03/2034",
    "classe_risco": "II — Medio Risco",
    "categoria": "Equipamento Medico-Hospitalar",
    "linha": "Monitoramento de Pacientes",
    "aplicacao": "UTI / Centro Cirurgico / Pronto Atendimento",
    "indicacao": "Monitoramento de parametros vitais em ambiente hospitalar.",
}

# Mapeamento UC -> documentos a gerar
# Baseado no levantamento dos UCs V5/V6 + tutoriais + casos de teste
DOCUMENTOS_POR_UC: dict[str, dict[str, list[str]]] = {
    "sprint1": {
        # UCs com docs reais (uploads, anexos)
        "UC-F01": ["contrato_social"],
        "UC-F03": [
            "contrato_social", "cnd_federal", "cnd_estadual", "cnd_municipal",
            "fgts", "trabalhista", "alvara", "sicaf", "estatuto_social",
            "atestado_capacidade_tecnica", "balanco_patrimonial",
        ],
        "UC-F04": [
            "cnd_federal", "cnd_estadual", "cnd_municipal",
            "fgts", "trabalhista", "sicaf",
        ],
        "UC-F07": [
            "manual_tecnico", "instrucoes_uso", "folder_catalogo",
            "nota_fiscal", "registro_anvisa",
        ],
    },
    "sprint2": {
        # UC-CV (Captacao Validacao)
        "UC-CV01": ["edital", "termo_referencia"],
        "UC-CV02": ["edital", "termo_referencia"],
        "UC-CV03": ["edital", "termo_referencia"],
        "UC-CV05": ["edital"],  # exporta relatorio mas a base eh edital
        "UC-CV09": ["edital", "termo_referencia"],
        "UC-CV10": [
            "edital", "termo_referencia",
            "contrato_social", "cnd_federal", "fgts", "trabalhista",
            "balanco_patrimonial", "atestado_capacidade_tecnica",
        ],
        "UC-CV11": ["ata_pregao", "edital"],
        "UC-CV12": ["ata_pregao"],
        "UC-CV13": ["edital", "termo_referencia"],
    },
    "sprint3-4": {
        # UC-P (Precificacao) e UC-R (Proposta/Recursos)
        "UC-P01": ["edital", "termo_referencia"],
        "UC-P02": ["edital", "termo_referencia"],
        "UC-P09": ["edital"],
        "UC-P12": ["proposta_comercial"],  # relatorio de custos
        "UC-R01": ["proposta_tecnica", "proposta_comercial", "edital"],
        "UC-R02": ["proposta_comercial", "proposta_tecnica"],
        "UC-R05": [
            "proposta_comercial", "proposta_tecnica",
            "contrato_social", "cnd_federal", "cnd_estadual", "cnd_municipal",
            "fgts", "trabalhista", "balanco_patrimonial",
            "atestado_capacidade_tecnica", "registro_anvisa", "manual_tecnico",
        ],
        "UC-R06": ["proposta_comercial", "proposta_tecnica"],
        "UC-R07": ["proposta_comercial", "proposta_tecnica"],
    },
    "sprint4": {
        # UC-I (Impugnacao) e UC-RE (Recursos)
        "UC-I01": ["edital", "termo_referencia"],
        "UC-I03": ["peticao_impugnacao"],
        "UC-I04": ["peticao_impugnacao"],
        "UC-RE01": ["ata_pregao", "edital"],
        "UC-RE02": ["proposta_comercial", "proposta_tecnica", "ata_pregao"],
        "UC-RE04": ["laudo_recurso"],
        "UC-RE05": ["laudo_recurso"],  # contra-razao - mesmo template
        "UC-RE06": ["laudo_recurso"],
    },
    "sprint5": {
        # UC-AT (Atas), UC-CT (Contratos), UC-CR (Acompanhamento)
        "UC-AT01": ["ata_pregao"],
        "UC-AT02": ["ata_pregao"],
        "UC-CT01": ["contrato"],
        "UC-CT02": ["nota_fiscal", "comprovante_entrega"],
        "UC-CT04": ["aditivo_contrato", "contrato"],
    },
}


def main():
    print("=== Gerador de Documentos Sintetizados ===")
    from document_renderer import renderizar  # type: ignore

    saida_root = PROJECT_ROOT / "docs" / "documentos_sintetizados"
    saida_root.mkdir(parents=True, exist_ok=True)

    total_pdfs = 0
    total_ucs = 0
    falhas: list[tuple[str, str, str]] = []

    for sprint, ucs in DOCUMENTOS_POR_UC.items():
        empresa = EMPRESAS[sprint]
        print(f"\n[{sprint}] {len(ucs)} UCs com documentos")

        for uc_id, docs in ucs.items():
            if not docs:
                continue
            destino = saida_root / sprint / uc_id
            destino.mkdir(parents=True, exist_ok=True)
            extra = {
                "edital": EDITAL_PADRAO,
                "produto": PRODUTO_PADRAO,
            }
            for doc_tipo in docs:
                try:
                    pdf_path = renderizar(doc_tipo, empresa, destino, extra=extra)
                    total_pdfs += 1
                    print(f"  ✓ {sprint}/{uc_id}/{doc_tipo}.pdf")
                except Exception as e:
                    falhas.append((sprint, uc_id, doc_tipo))
                    print(f"  ✗ {sprint}/{uc_id}/{doc_tipo}.pdf — {e}")
            total_ucs += 1

    print(f"\n=== RESUMO ===")
    print(f"  Sprints: {len(DOCUMENTOS_POR_UC)}")
    print(f"  UCs com documentos: {total_ucs}")
    print(f"  PDFs gerados: {total_pdfs}")
    print(f"  Falhas: {len(falhas)}")
    if falhas:
        print(f"  Detalhes:")
        for s, u, d in falhas:
            print(f"    - {s}/{u}/{d}")
    print(f"  Diretorio: {saida_root}")

    # Gera ZIP pra download via app
    import shutil
    zip_path = PROJECT_ROOT / "docs" / "documentos_sintetizados"
    zip_out = shutil.make_archive(str(zip_path), "zip", str(saida_root.parent), saida_root.name)
    print(f"  ZIP: {zip_out}")

    return 0 if not falhas else 1


if __name__ == "__main__":
    sys.exit(main())
