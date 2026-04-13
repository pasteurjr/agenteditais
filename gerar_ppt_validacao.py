#!/usr/bin/env python3
"""
Gera o PowerPoint didático: Facilitia.ia — Sprints 1 a 5
Saída: docs/APRESENTACAO_VALIDACAO_SPRINTS_1A5.pptx

Screenshots corretas por sprint:
  Sprint 1: runtime/screenshots/tutorial-sprint1-1/ (padrão F##_*)
  Sprint 2: runtime/screenshots/validacao-sprint2/  (padrão CV##-P##_*)
  Sprint 3: runtime/screenshots/validacao-sprint3/  (padrão P##_* e R##_*)
  Sprint 4: runtime/screenshots/validacao-sprint4/  (padrão I##_*, RE##_*, FU##_*)
  Sprint 5: runtime/screenshots/UC-CT##/ e UC-CRM##/ (padrão P##_resp.png)
"""

import os
import glob
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# ── Constantes ──────────────────────────────────────────────

BASE = os.path.dirname(os.path.abspath(__file__))
SS_DIR = os.path.join(BASE, "runtime", "screenshots")
OUT = os.path.join(BASE, "docs", "APRESENTACAO_VALIDACAO_SPRINTS_1A5.pptx")

BG_DARK = RGBColor(0x0F, 0x17, 0x2A)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
GRAY = RGBColor(0x94, 0xA3, 0xB8)
LIGHT_GRAY = RGBColor(0xCB, 0xD5, 0xE1)

SPRINT_COLORS = {
    1: RGBColor(0x1E, 0x40, 0xAF),
    2: RGBColor(0x05, 0x96, 0x69),
    3: RGBColor(0x7C, 0x3A, 0xED),
    4: RGBColor(0xDC, 0x26, 0x26),
    5: RGBColor(0xEA, 0x58, 0x0C),
}

SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)

# ── Mapeamento de screenshots corretas por UC ──────────────

# Sprint 1: tutorial-sprint1-1/F##_*
# Melhor screenshot = última _resp ou _salvo de cada UC
SPRINT1_SS = {
    "UC-F01": "tutorial-sprint1-1/F01_06_salvo.png",
    "UC-F02": "tutorial-sprint1-1/F02_04_area_padrao.png",
    "UC-F03": "tutorial-sprint1-1/F03_05_lista_documentos.png",
    "UC-F04": "tutorial-sprint1-1/F04_04_busca_concluida.png",
    "UC-F05": "tutorial-sprint1-1/F05_05_lista_responsaveis.png",
    "UC-F06": "VC/sprint1/F06_detalhe_produto.png",
    "UC-F07": "VC/sprint1/F07_com_produtos.png",
    "UC-F08": "tutorial-sprint1-1/F08_04_produto_salvo.png",
    "UC-F09": "tutorial-sprint1-1/F09_03_reprocessado.png",
    "UC-F10": "tutorial-sprint1-1/F10_04_resultado_web.png",
    "UC-F11": "tutorial-sprint1-1/F11_02_scores.png",
    "UC-F12": "VC/sprint1/F12_detalhes_metadados.png",
    "UC-F13": "tutorial-sprint1-1/F13_04_funil_monitoramento.png",
    "UC-F14": "tutorial-sprint1-1/F14_06_limiares_salvos.png",
    "UC-F15": "tutorial-sprint1-1/F15_07_modalidades_salvas.png",
    "UC-F16": "tutorial-sprint1-1/F16_07_ncms_salvos.png",
    "UC-F17": "tutorial-sprint1-1/F17_02_notificacoes_preenchidas.png",
}

# Sprint 2: validacao-sprint2/CV##_*
SPRINT2_SS = {
    "UC-CV01": "validacao-sprint2/CV01-P05_resp_resultados.png",
    "UC-CV02": "validacao-sprint2/CV02_resp_painel.png",
    "UC-CV03": "validacao-sprint2/CV03-P02_resp_salvos.png",
    "UC-CV04": "validacao-sprint2/CV04_resp_salva.png",
    "UC-CV05": "validacao-sprint2/CV05_resp_exportado.png",
    "UC-CV06": "validacao-sprint2/CV06_resp_criado.png",
    "UC-CV07": "validacao-sprint2/CV07_resp_selecionado.png",
    "UC-CV08": "validacao-sprint2/CV08_resp_scores.png",
    "UC-CV09": "validacao-sprint2/CV09_resp_itens.png",
    "UC-CV10": "validacao-sprint2/CV10_resp_documentacao.png",
    "UC-CV11": "validacao-sprint2/CV11_resp_riscos.png",
    "UC-CV12": "validacao-sprint2/CV12_resp_mercado.png",
    "UC-CV13": "validacao-sprint2/CV13_resp_resposta.png",
}

# Sprint 3: validacao-sprint3/P##_* e R##_*
SPRINT3_SS = {
    "UC-P01": "validacao-sprint3/P01_p7_tabela_itens.png",
    "UC-P02": "validacao-sprint3/P02_resp_vinculacao.png",
    "UC-P03": "validacao-sprint3/P03_p6_volumetria_calculada.png",
    "UC-P04": "validacao-sprint3/P04_p6_custos_salvos.png",
    "UC-P05": "validacao-sprint3/P05_resp_preco_base_salvo.png",
    "UC-P06": "validacao-sprint3/P06_resp_referencia_salva.png",
    "UC-P07": "validacao-sprint3/P07_resp_lances_salvos.png",
    "UC-P08": "validacao-sprint3/P08_p9_simulador_disputa.png",
    "UC-P09": "validacao-sprint3/P09_resp_historico_resultado.png",
    "UC-P10": "validacao-sprint3/P10_p4_comodato_salvo.png",
    "UC-P11": "validacao-sprint3/P11_resp_valor_aplicado.png",
    "UC-P12": "validacao-sprint3/P12_resp_relatorio_html.png",
    "UC-R01": "validacao-sprint3/R01_resp_proposta_gerada.png",
    "UC-R02": "validacao-sprint3/R02_p5_importado.png",
    "UC-R03": "validacao-sprint3/R03_p5_conteudo_salvo.png",
    "UC-R04": "validacao-sprint3/R04_p3_tabela_anvisa.png",
    "UC-R05": "validacao-sprint3/R05_p4_tabela_documentos.png",
    "UC-R06": "validacao-sprint3/R06_p3_botoes_export.png",
    "UC-R07": "validacao-sprint3/R07_resp_marcada_enviada.png",
}

# Sprint 4: validacao-sprint4/I##_*, RE##_*, FU##_*
SPRINT4_SS = {
    "UC-I01": "validacao-sprint4/I01_resp_tabela_inconsistencias.png",
    "UC-I02": "validacao-sprint4/I02_resp_checkboxes_marcados.png",
    "UC-I03": "validacao-sprint4/I03_resp_peticao_criada.png",
    "UC-I04": "validacao-sprint4/I04_resp_upload.png",
    "UC-I05": "validacao-sprint4/I05_resp_countdown.png",
    "UC-RE01": "validacao-sprint4/RE01_resp_timeline.png",
    "UC-RE02": "validacao-sprint4/RE02_resp_analise_vencedora.png",
    "UC-RE03": "validacao-sprint4/RE03_resp_resposta_chat.png",
    "UC-RE04": "validacao-sprint4/RE04_resp_laudo_criado.png",
    "UC-RE05": "validacao-sprint4/RE05_resp_contra_razao_criada.png",
    "UC-RE06": "validacao-sprint4/RE06_resp_submissao_registrada.png",
    "UC-FU01": "validacao-sprint4/FU01_resp_resultado_ganho.png",
    "UC-FU02": "validacao-sprint4/FU02_resp_alertas_configurados.png",
    "UC-FU03": "validacao-sprint4/FU03_resp_score_logistico.png",
}

# Sprint 5: UC-CT##/ e UC-CRM##/ (estes JÁ estão corretos)
# Usam a função best_screenshot_sp5() abaixo


# Overrides manuais para UCs onde a _acao é melhor que _resp
SCREENSHOT_OVERRIDES = {
    "UC-CR01-acao": "UC-CR01/P01_acao.png",
}


def screenshot_path(uc_code):
    """Retorna o caminho correto da screenshot para o UC."""
    # Overrides manuais
    if uc_code in SCREENSHOT_OVERRIDES:
        p = os.path.join(SS_DIR, SCREENSHOT_OVERRIDES[uc_code])
        return p if os.path.exists(p) else None
    # Sprint 1
    if uc_code in SPRINT1_SS:
        p = os.path.join(SS_DIR, SPRINT1_SS[uc_code])
        return p if os.path.exists(p) else None
    # Sprint 2
    if uc_code in SPRINT2_SS:
        p = os.path.join(SS_DIR, SPRINT2_SS[uc_code])
        return p if os.path.exists(p) else None
    # Sprint 3
    if uc_code in SPRINT3_SS:
        p = os.path.join(SS_DIR, SPRINT3_SS[uc_code])
        return p if os.path.exists(p) else None
    # Sprint 4
    if uc_code in SPRINT4_SS:
        p = os.path.join(SS_DIR, SPRINT4_SS[uc_code])
        return p if os.path.exists(p) else None
    # Sprint 5 — diretórios UC-CT## e UC-CRM## (corretos)
    d = os.path.join(SS_DIR, uc_code)
    if os.path.isdir(d):
        for pat in ["P03_resp*", "P02_resp*", "P01_resp*", "*_resp*"]:
            matches = sorted(glob.glob(os.path.join(d, pat)))
            if matches:
                return matches[0]
        pngs = sorted(glob.glob(os.path.join(d, "*.png")))
        return pngs[0] if pngs else None
    return None


def set_bg(slide, color):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color


def add_text_box(slide, left, top, width, height, text, font_size=16,
                 color=WHITE, bold=False, alignment=PP_ALIGN.LEFT):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.alignment = alignment
    return tf


def add_bullets(slide, left, top, width, height, items, font_size=14, color=LIGHT_GRAY):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, item in enumerate(items):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = f"• {item}"
        p.font.size = Pt(font_size)
        p.font.color.rgb = color
        p.space_after = Pt(4)
    return tf


def add_footer(slide, text):
    add_text_box(slide, Inches(0.5), Inches(6.9), Inches(12), Inches(0.4),
                 text, font_size=9, color=GRAY, alignment=PP_ALIGN.LEFT)


def add_screenshot(slide, img_path, left=None, top=None, max_w=None, max_h=None):
    if not img_path or not os.path.exists(img_path):
        return
    if left is None:
        left = Inches(6.5)
    if top is None:
        top = Inches(1.5)
    if max_w is None:
        max_w = Inches(6.2)
    if max_h is None:
        max_h = Inches(5.0)
    try:
        pic = slide.shapes.add_picture(img_path, left, top)
        ratio = min(max_w / pic.width, max_h / pic.height)
        if ratio < 1:
            pic.width = int(pic.width * ratio)
            pic.height = int(pic.height * ratio)
    except Exception:
        pass


def slide_title(slide, title, subtitle=None, sprint_num=None):
    color = SPRINT_COLORS.get(sprint_num, WHITE) if sprint_num else WHITE
    add_text_box(slide, Inches(0.5), Inches(0.3), Inches(12), Inches(0.8),
                 title, font_size=28, color=color, bold=True)
    if subtitle:
        add_text_box(slide, Inches(0.5), Inches(1.0), Inches(12), Inches(0.4),
                     subtitle, font_size=14, color=GRAY)


def make_cover_slide(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide, BG_DARK)
    add_text_box(slide, Inches(1), Inches(2), Inches(11), Inches(1.2),
                 "Facilitia.ia", font_size=48, color=WHITE, bold=True,
                 alignment=PP_ALIGN.CENTER)
    add_text_box(slide, Inches(1), Inches(3.2), Inches(11), Inches(0.6),
                 "Sistema Inteligente de Gestão de Editais e Licitações",
                 font_size=24, color=LIGHT_GRAY, alignment=PP_ALIGN.CENTER)
    add_text_box(slide, Inches(1), Inches(4.2), Inches(11), Inches(0.5),
                 "Guia para Validadores — Sprints 1 a 5",
                 font_size=18, color=GRAY, alignment=PP_ALIGN.CENTER)
    add_text_box(slide, Inches(1), Inches(5.2), Inches(11), Inches(0.4),
                 "Abril 2026",
                 font_size=16, color=GRAY, alignment=PP_ALIGN.CENTER)
    add_text_box(slide, Inches(1), Inches(6.0), Inches(11), Inches(0.4),
                 "Este PowerPoint apresenta o sistema e os resultados da validação automatizada.",
                 font_size=13, color=GRAY, alignment=PP_ALIGN.CENTER)


def make_content_slide(prs, title, subtitle, bullets, screenshot_uc=None,
                       footer=None, sprint_num=None):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide, BG_DARK)
    slide_title(slide, title, subtitle, sprint_num)

    img_path = screenshot_path(screenshot_uc) if screenshot_uc else None
    has_img = img_path is not None
    bullet_w = Inches(5.5) if has_img else Inches(11.5)

    add_bullets(slide, Inches(0.5), Inches(1.6), bullet_w, Inches(4.8), bullets)

    if has_img:
        add_screenshot(slide, img_path)

    if footer:
        add_footer(slide, footer)
    return slide


def make_sprint_cover(prs, sprint_num, title, subtitle, bullets):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    color = SPRINT_COLORS[sprint_num]
    set_bg(slide, color)
    add_text_box(slide, Inches(1), Inches(2.0), Inches(11), Inches(1.0),
                 f"Sprint {sprint_num}", font_size=44, color=WHITE, bold=True,
                 alignment=PP_ALIGN.CENTER)
    add_text_box(slide, Inches(1), Inches(3.2), Inches(11), Inches(0.8),
                 title, font_size=28, color=WHITE, alignment=PP_ALIGN.CENTER)
    add_text_box(slide, Inches(1), Inches(4.2), Inches(11), Inches(0.5),
                 subtitle, font_size=16, color=RGBColor(0xFF, 0xFF, 0xE0),
                 alignment=PP_ALIGN.CENTER)
    add_bullets(slide, Inches(2), Inches(5.0), Inches(9), Inches(2.0),
                bullets, font_size=14, color=RGBColor(0xFF, 0xFF, 0xFF))


def build_presentation():
    prs = Presentation()
    prs.slide_width = SLIDE_W
    prs.slide_height = SLIDE_H

    # ═══════════════════════════════════════════════════
    # SEÇÃO A: Capa e Visão Geral (slides 1-5)
    # ═══════════════════════════════════════════════════

    # Slide 1 — Capa
    make_cover_slide(prs)

    # Slide 2 — A jornada
    make_content_slide(prs,
        "A jornada de uma licitação",
        "O sistema cobre TODAS as etapas do ciclo de vida",
        [
            "A empresa existe no sistema (Sprint 1: cadastro, produtos, configurações)",
            "Ela descobre um edital interessante (Sprint 2: captação e validação com IA)",
            "Ela calcula o preço e monta a proposta (Sprint 3: 6 camadas de precificação)",
            "Ela se defende juridicamente se necessário (Sprint 4: impugnação, recursos)",
            "Ela acompanha resultados e gerencia contratos (Sprint 5: follow-up, CRM)",
        ])

    # Slide 3 — Organização
    make_content_slide(prs,
        "Como o sistema está organizado",
        "3 camadas que se complementam",
        [
            "FUNDAÇÃO: empresa, produtos, certificações, configurações (Sprint 1)",
            "FLUXO COMERCIAL: 11 etapas sequenciais do edital ao contrato",
            "PAINÉIS TRANSVERSAIS: CRM, KPIs, alertas, relatórios",
            "Cada sprint construiu uma parte deste quebra-cabeça",
            "As sprints são sequenciais — Sprint 2 depende da Sprint 1, e assim por diante",
        ])

    # Slide 4 — Em números
    make_content_slide(prs,
        "Em números",
        "O que foi entregue nas 5 sprints",
        [
            "79 casos de uso especificados e implementados",
            "60+ requisitos funcionais rastreados (RF-001 a RF-060)",
            "5 sprints entregues com 100% de aprovação nos testes automatizados",
            "322 testes Playwright executados com sucesso",
            "2 empresas de teste: CH Hospitalar (automação) + RP3X (validação manual)",
        ])

    # Slide 5 — Empresas
    make_content_slide(prs,
        "As duas empresas de teste",
        "Cada empresa tem um papel diferente na validação",
        [
            "CH Hospitalar — equipamentos médicos hospitalares (CNPJ 43.712.232)",
            "  → Usada nos testes automatizados (Playwright) — tutorial-1",
            "RP3X — reagentes para diagnóstico in vitro (CNPJ 68.218.593)",
            "  → Usada na validação manual pelo validador — tutorial-2",
            "Credenciais: valida1@valida.com.br (CH) / valida2@valida.com.br (RP3X) — senha: 123456",
        ])

    # ═══════════════════════════════════════════════════
    # SEÇÃO B: Processo de Validação (slides 6-12)
    # ═══════════════════════════════════════════════════

    make_content_slide(prs,
        "O ciclo de validação: 3 documentos por sprint",
        "Para cada sprint, existem 3 tipos de documento",
        [
            "CASOS DE USO — O que o sistema DEVE fazer (especificação detalhada)",
            "TUTORIAL-2 — Roteiro para o VALIDADOR testar manualmente (dados RP3X)",
            "RESULTADO DA VALIDAÇÃO — O que a automação Playwright comprovou (screenshots CH Hospitalar)",
            "Além disso: requisitos_completosv7.md (documento mestre de 60+ RFs)",
            "O validador recebe tudo pronto: especificação + roteiro + evidências",
        ])

    make_content_slide(prs,
        "O documento de Requisitos (requisitos_completosv7.md)",
        "O documento mestre — cada funcionalidade tem um código RF-XXX",
        [
            "Cada funcionalidade do sistema tem um código: RF-001, RF-019, RF-039...",
            "Exemplo: RF-019 = Buscar editais no PNCP com scores automáticos",
            "São 60+ requisitos organizados em 3 camadas (Fundação, Fluxo, Painéis)",
            "Cada caso de uso implementa um ou mais RFs — rastreabilidade completa",
            "O validador pode consultar este documento para entender o PORQUÊ de cada tela",
        ])

    make_content_slide(prs,
        "O que é um Caso de Uso?",
        "Descreve UMA funcionalidade específica do sistema",
        [
            "PRÉ-CONDIÇÕES: o que precisa existir antes (ex: empresa cadastrada)",
            "SEQUÊNCIA DE EVENTOS: o que o ator faz e o que o sistema responde",
            "TELA REPRESENTATIVA: layout hierárquico dos elementos visuais",
            "ASSERTIONS: como verificar que funcionou (ex: tabela tem ≥3 linhas)",
            "Cada UC tem código único: UC-F01, UC-CV08, UC-CRM01...",
        ])

    make_content_slide(prs,
        "O Tutorial-2: seu roteiro de validação",
        "O validador segue este roteiro usando a empresa RP3X",
        [
            "O tutorial-2 contém TODOS os dados que você precisa digitar",
            "Não precisa inventar nada — use os dados exatos do tutorial",
            "Empresa de teste: RP3X (valida2@valida.com.br / 123456)",
            "Execute na ordem: Sprint 1 → 2 → 3 → 4 → 5 (dependências entre sprints)",
            "Se algo estiver vazio ou diferente do esperado, reporte como problema",
        ])

    make_content_slide(prs,
        "A validação automatizada (Playwright)",
        "Testes automáticos JÁ EXECUTADOS com a empresa CH Hospitalar",
        [
            "O sistema Playwright executou os tutorial-1 automaticamente",
            "Para cada passo: 2 screenshots — AÇÃO (o que foi clicado) e RESPOSTA (resultado)",
            "Se a tela estivesse vazia, o teste REPROVARIA automaticamente",
            "Helper assertDataVisible: garante que há dados reais antes do screenshot",
            "Todos os 322 testes passaram com 100% de aprovação",
        ])

    make_content_slide(prs,
        "O Resultado da Validação",
        "Evidência de que cada UC funciona corretamente",
        [
            "Para cada sprint existe um documento: RESULTADO VALIDACAO SPRINT[N].md",
            "Tabela de cada UC: código, título, passos, screenshots, status (APROVADO)",
            "Screenshots da automação são a PROVA de que o sistema funciona",
            "Neste PowerPoint, cada slide de UC mostra a screenshot da validação real",
            "O validador pode comparar o que vê no tutorial-2 com estas evidências",
        ])

    make_content_slide(prs,
        "O Relatório de Aceitação",
        "Parecer final de cada sprint",
        [
            "Lista todos os requisitos funcionais (RF) atendidos",
            "Evidências: código dos testes, screenshots, seed de dados",
            "Conclusão: APROVADO INTEGRALMENTE em todas as 5 sprints",
            "Pode ser usado como checklist pelo validador",
            "Arquivos: relatorio_aceitacao_sprint[N].md",
        ])

    # ═══════════════════════════════════════════════════
    # SEÇÃO B.1: Exemplo real de Caso de Uso (UC-CV08)
    # ═══════════════════════════════════════════════════

    make_content_slide(prs,
        "Anatomia de um Caso de Uso — Exemplo real",
        "UC-CV08: Calcular scores multidimensionais e decidir GO/NO-GO",
        [
            "RF relacionados: RF-027, RF-028, RF-037",
            "Ator: Usuário analista/comercial",
            "Regras de Negócio: RN-047, RN-048, RN-049, RN-050, RN-052... (15 regras)",
            "Pré-condições: edital selecionado na ValidacaoPage + endpoint disponível",
            "Pós-condições: 6 scores visíveis + decisão assistida registrada",
        ],
        footer="docs/CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V3.md — UC-CV08")

    make_content_slide(prs,
        "UC-CV08 — Sequência de eventos (trecho)",
        "O que o validador deve fazer e o que o sistema responde",
        [
            "1. Usuário abre a [Aba: \"Aderência\"] no Painel de Abas",
            "2. Clica em [Botão: \"Calcular Scores IA\"]",
            "3. Sistema chama POST /api/editais/{id}/scores-validacao",
            "4. Tela atualiza: ScoreCircle (0-100) + 6 ScoreBars + Decisão IA (GO/NO-GO)",
            "5-8. Usuário escolhe GO/Acompanhar/NO-GO + justificativa → Salvar",
        ],
        footer="UC-CV08 passos 1-8 | RN-049: GO exige score_final≥70 + tec≥60 + jur≥60")

    make_content_slide(prs,
        "UC-CV08 — Assertions (como verificar que funcionou)",
        "O validador precisa ver estes elementos na tela",
        [
            "ScoreCircle central com valor numérico (ex: 78/100) colorido",
            "6 ScoreBars preenchidas: Técnica, Documental, Complexidade, Jurídico, Logístico, Comercial",
            "Badge \"Decisão IA\" com GO (verde), Acompanhar (amarelo) ou NO-GO (vermelho)",
            "Texto de justificativa com Pontos Positivos (verde) e Pontos de Atenção (amarelo)",
            "Se algo estiver vazio ou genérico = REPROVAR o UC e reportar ao Claude",
        ])

    # ═══════════════════════════════════════════════════
    # SEÇÃO B.2: Ordem de leitura dos documentos
    # ═══════════════════════════════════════════════════

    make_content_slide(prs,
        "Ordem de leitura — seu fluxo de validação",
        "Sempre leia na sequência: especificação → evidência → roteiro",
        [
            "1º) CASOS DE USO da sprint — entenda O QUE o sistema deve fazer",
            "2º) RESULTADO VALIDACAO SPRINT[N].md — veja o que a automação já comprovou",
            "3º) TUTORIAL-2 da sprint — use este roteiro para testar MANUALMENTE",
            "Por quê nesta ordem? UC ensina a teoria; resultado mostra a prática; tutorial é mão-na-massa",
            "Só após as 3 leituras você estará pronto para validar",
        ])

    # ═══════════════════════════════════════════════════
    # SEÇÃO B.3: Como registrar os resultados (ChatGPT → Claude)
    # ═══════════════════════════════════════════════════

    make_content_slide(prs,
        "Como registrar suas observações — Passo 1: capturar",
        "Durante a validação, grave tudo no ChatGPT enquanto testa",
        [
            "Abra o ChatGPT em uma janela separada do navegador de testes",
            "A cada tela testada, DIGITE ou DITE suas observações no prompt do ChatGPT",
            "Exemplo de observação: \"Tela de scores do UC-CV08. O score apareceu 78",
            "  mas os pontos positivos estavam em inglês. Decisão IA ficou em branco\"",
            "Não precisa formatar — fale solto, como se narrasse para um colega",
        ])

    make_content_slide(prs,
        "Como registrar — Passo 2: ChatGPT estrutura",
        "Peça ao ChatGPT que transforme sua narrativa em prompt para o Claude Code",
        [
            "Após terminar a sprint, diga ao ChatGPT:",
            "  \"Transforme tudo o que falei acima em um prompt BEM ESTRUTURADO",
            "   para o Claude Code entender o que precisa corrigir\"",
            "O ChatGPT devolverá um texto organizado: UC/tela/problema/severidade",
            "Exemplo de saída: \"[UC-CV08] Severidade ALTA — Decisão IA em branco",
            "  quando score=78. Esperado: badge GO (RN-049). Reproduzir via tutorial-2 passo 14\"",
        ])

    make_content_slide(prs,
        "Como registrar — Passo 3: entregar ao Claude",
        "Copie o texto estruturado, cole num documento e envie para o Claude",
        [
            "Copie o prompt gerado pelo ChatGPT",
            "Cole num documento (Google Docs, .md, .txt) — um por sprint",
            "Nome sugerido: observacoes_sprint[N]_validador_[seunome].md",
            "Entregue para o Claude Code via upload no chat do Anthropic",
            "O Claude analisará cada ponto, priorizará e enviará correções sob revisão",
        ])

    make_content_slide(prs,
        "Exemplo completo do fluxo ChatGPT → Claude Code",
        "Veja como uma observação informal vira uma tarefa acionável",
        [
            "VOCÊ no ChatGPT: \"A tela do kanban do CRM tá mostrando só 8 cards mas os",
            "  tutoriais falaram em 13 stages. Também não consegui arrastar cards\"",
            "CHATGPT devolve: \"[UC-CRM01] CRÍTICA — Pipeline exibe 8 stages ao invés de",
            "  13 conforme RN-165. Drag-and-drop inoperante. Reproduzir: login RP3X →",
            "  CRM → aba Pipeline → contar colunas e arrastar card de Captado p/ Análise\"",
            "CLAUDE CODE lê → investiga backend/crm_routes.py → corrige → reentrega",
        ])

    # ═══════════════════════════════════════════════════
    # SEÇÃO B.4: Fases Alfa e Beta Teste
    # ═══════════════════════════════════════════════════

    make_content_slide(prs,
        "Após o registro: Fase Alfa de Teste",
        "Teste interno fechado — primeira camada de qualidade",
        [
            "QUEM: validadores internos da empresa (time técnico + comercial)",
            "ESCOPO: todas as funcionalidades das 5 sprints em ambiente de homologação",
            "DURAÇÃO: 2 semanas, com rodadas diárias de feedback via ChatGPT→Claude",
            "OBJETIVO: caçar bugs críticos ANTES de expor a usuários externos",
            "SAÍDA: lista priorizada de correções + aprovação para avançar à fase Beta",
        ])

    make_content_slide(prs,
        "Fase Beta de Teste",
        "Teste aberto com usuários reais (empresas piloto)",
        [
            "QUEM: 3-5 empresas parceiras do setor de saúde (CH Hospitalar, RP3X, outras)",
            "ESCOPO: uso em cenários reais — editais verdadeiros do PNCP, propostas reais",
            "DURAÇÃO: 4-6 semanas, com suporte dedicado do time",
            "OBJETIVO: validar usabilidade, performance, precisão da IA em escala",
            "SAÍDA: relatório de maturidade + green-light para lançamento oficial",
        ])

    # ═══════════════════════════════════════════════════
    # SEÇÃO C: Sprint 1 (slides 13-21)
    # Screenshots: tutorial-sprint1-1/F##_*
    # ═══════════════════════════════════════════════════

    make_sprint_cover(prs, 1,
        "Construindo a Fundação",
        "17 casos de uso • RF-001 a RF-018",
        [
            "Cadastro completo da empresa com busca automática por CNPJ",
            "Portfolio de produtos com IA (consulta ANVISA, reprocessamento automático)",
            "Configurações: pesos GO/NO-GO, custos, regiões, fontes de busca",
        ])

    # Slide 14 — Cadastro empresa (screenshot: F01_06_salvo = dados salvos da CH Hospitalar)
    make_content_slide(prs,
        "Cadastro da empresa",
        "UC-F01, UC-F02 | RF-001, RF-005",
        [
            "O primeiro passo: cadastrar CNPJ, razão social, endereço, contatos",
            "O sistema busca dados automaticamente pelo CNPJ",
            "Na screenshot: dados da CH Hospitalar salvos com sucesso",
            "Inclui e-mails, telefones e área de atuação padrão (UC-F02)",
        ],
        screenshot_uc="UC-F01",
        footer="UC-F01/F02 | RF-001, RF-005 | Doc: CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V2.md | Validação: RELATORIO_VALIDACAO_SPRINT1_TUTORIAL1.md",
        sprint_num=1)

    # Slide 15 — Documentos e certidões (screenshot: F03_05 = lista de docs + F04_11 = certidões OK)
    make_content_slide(prs,
        "Documentos e certidões",
        "UC-F03, UC-F04 | RF-002, RF-004",
        [
            "Upload de documentos com tipo, validade e PDF anexo",
            "Busca automática de certidões (CND, FGTS) com frequência configurável",
            "Na screenshot: lista de documentos cadastrados para a CH Hospitalar",
            "O sistema alerta quando uma certidão está para vencer",
        ],
        screenshot_uc="UC-F03",
        footer="UC-F03/F04 | RF-002, RF-004 | Doc: CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V2.md | Validação: RELATORIO_VALIDACAO_SPRINT1_TUTORIAL1.md",
        sprint_num=1)

    # Slide 16 — Responsáveis técnicos (screenshot: F05_05 = lista de 3 responsáveis)
    make_content_slide(prs,
        "Responsáveis técnicos",
        "UC-F05 | RF-003",
        [
            "Cadastro de responsáveis técnicos e administrativos",
            "Nome, cargo, CPF, registro profissional (CRM, CREA etc.)",
            "Na screenshot: lista de responsáveis cadastrados para CH Hospitalar",
            "A IA consulta estes dados ao montar propostas e petições",
        ],
        screenshot_uc="UC-F05",
        footer="UC-F05 | RF-003 | Doc: CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V2.md | Validação: RELATORIO_VALIDACAO_SPRINT1_TUTORIAL1.md",
        sprint_num=1)

    # Slide 17 — Portfolio de produtos (screenshot: F06_04 = detalhe de produto)
    make_content_slide(prs,
        "Portfolio de produtos",
        "UC-F06, UC-F07 | RF-006 a RF-012",
        [
            "O coração do sistema: os produtos que a empresa vende",
            "Cadastro manual, via CSV, ou pela IA (consulta ANVISA + manual técnico)",
            "Na screenshot: tela de portfólio com listagem de produtos e filtros",
            "Listagem com filtros por área, classe, status e busca textual",
        ],
        screenshot_uc="UC-F06",
        footer="UC-F06/F07 | RF-006 a RF-012 | Doc: CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V2.md | Validação: RELATORIO_VALIDACAO_SPRINT1_TUTORIAL1.md",
        sprint_num=1)

    # Slide 18 — Edição e IA nos produtos
    make_content_slide(prs,
        "Edição e IA nos produtos",
        "UC-F08 a UC-F13 | RF-008, RF-010, RF-012",
        [
            "Edição de especificações técnicas e NCM (UC-F08)",
            "IA reprocessa specs a partir de manuais técnicos (UC-F09)",
            "Consulta ANVISA e busca web para dados complementares (UC-F10)",
            "Verificação de completude com scores (UC-F11)",
            "Na screenshot: produto reprocessado pela IA com specs atualizadas",
        ],
        screenshot_uc="UC-F09",
        footer="UC-F08..F13 | RF-008, RF-010, RF-012 | Doc: CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V2.md",
        sprint_num=1)

    # Slide 19 — Pesos GO/NO-GO (screenshot: F14_06 = limiares salvos)
    make_content_slide(prs,
        "Pesos GO/NO-GO",
        "UC-F14 | RF-018",
        [
            "Como a empresa define o que é mais importante para ela?",
            "6 dimensões com pesos: Técnico, Comercial, Jurídico, Logístico, Documental, Complexidade",
            "Limiares ajustáveis: abaixo de X = NO-GO automático",
            "Na screenshot: limiares configurados e salvos para CH Hospitalar",
        ],
        screenshot_uc="UC-F14",
        footer="UC-F14 | RF-018 | Doc: CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V2.md | Validação: RELATORIO_VALIDACAO_SPRINT1_TUTORIAL1.md",
        sprint_num=1)

    # Slide 20 — Parametrizações gerais
    make_content_slide(prs,
        "Parametrizações gerais",
        "UC-F15 a UC-F17 | RF-013 a RF-018",
        [
            "Custos fixos mensais, markup padrão, frete base (UC-F15)",
            "Fontes de busca: PNCP, Brave, Google, BEC-SP (UC-F16)",
            "Palavras-chave e NCMs de interesse para captação automática",
            "Notificações e preferências do sistema (UC-F17)",
            "Na screenshot: NCMs de interesse configurados e salvos",
        ],
        screenshot_uc="UC-F16",
        footer="UC-F15..F17 | RF-013 a RF-018 | Doc: CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V2.md",
        sprint_num=1)

    # ═══════════════════════════════════════════════════
    # SEÇÃO D: Sprint 2 (slides 22-30)
    # Screenshots: validacao-sprint2/CV##_*
    # ═══════════════════════════════════════════════════

    make_sprint_cover(prs, 2,
        "Encontrar e Avaliar Oportunidades",
        "13 casos de uso • RF-019 a RF-037",
        [
            "Busca automática de editais no PNCP (Portal Nacional de Contratações)",
            "Scores em 6 dimensões com recomendação GO/NO-GO da IA",
            "Monitoramentos automáticos para novos editais sem buscar todo dia",
        ])

    # Slide 22 — Buscar editais (screenshot: CV01-P05_resp = resultados de busca com filtros)
    make_content_slide(prs,
        "Buscar editais no PNCP",
        "UC-CV01 | RF-019, RF-021, RF-022, RF-026",
        [
            "O usuário digita um termo (ex: 'hemograma') e aplica filtros",
            "O sistema consulta o PNCP e retorna editais com scores automáticos",
            "Na screenshot: tela de Captação com resultados de busca e filtros aplicados",
            "5 cenários de busca testados na validação (monitor, ultrassom, etc.)",
        ],
        screenshot_uc="UC-CV01",
        footer="UC-CV01 | RF-019, RF-021, RF-022 | Doc: CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V2.md | Validação: RESULTADO VALIDACAO SPRINT2.md",
        sprint_num=2)

    # Slide 23 — Painel de detalhes (screenshot: CV02_resp_painel)
    make_content_slide(prs,
        "Painel de detalhes do edital",
        "UC-CV02 | RF-019, RF-020, RF-024",
        [
            "Ao clicar num edital, abre um painel lateral deslizante",
            "Visão completa: scores detalhados, itens, órgão, valor, prazo",
            "Na screenshot: painel lateral com detalhes do edital selecionado",
            "É a visão que o analista usa para decidir antes do GO/NO-GO",
        ],
        screenshot_uc="UC-CV02",
        footer="UC-CV02 | RF-019, RF-020, RF-024 | Doc: CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V2.md | Validação: RESULTADO VALIDACAO SPRINT2.md",
        sprint_num=2)

    # Slide 24 — Salvar e estratégia (screenshot: CV03-P02_resp_salvos)
    make_content_slide(prs,
        "Salvar edital e definir estratégia",
        "UC-CV03, UC-CV04 | RF-019, RF-023, RF-027",
        [
            "Gostou do edital? Salve no banco com itens e scores",
            "Na screenshot: tela de resultados com editais após salvamento",
            "Defina estratégia: participar, observar ou declinar (UC-CV04)",
            "Configure margem comercial e intenção específica",
        ],
        screenshot_uc="UC-CV03",
        footer="UC-CV03/CV04 | RF-019, RF-023, RF-027 | Doc: CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V2.md | Validação: RESULTADO VALIDACAO SPRINT2.md",
        sprint_num=2)

    # Slide 25 — Exportar e monitorar (screenshot: CV05_resp_exportado)
    make_content_slide(prs,
        "Exportar e monitorar automaticamente",
        "UC-CV05, UC-CV06 | RF-019, RF-025, RF-026",
        [
            "Exporte resultados em CSV/PDF para compartilhar com a equipe",
            "Na screenshot: resultado de busca exportado com sucesso",
            "Configure monitoramentos periódicos para receber alertas (UC-CV06)",
            "Novos editais são detectados sem buscar manualmente",
        ],
        screenshot_uc="UC-CV05",
        footer="UC-CV05/CV06 | RF-019, RF-025, RF-026 | Doc: CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V2.md | Validação: RESULTADO VALIDACAO SPRINT2.md",
        sprint_num=2)

    # Slide 26 — Scores e GO/NO-GO (screenshot: CV08_resp_scores)
    make_content_slide(prs,
        "Scores e decisão GO/NO-GO",
        "UC-CV07, UC-CV08 | RF-027, RF-028, RF-037",
        [
            "O momento crucial: a IA calcula 6 scores e recomenda GO ou NO-GO",
            "Técnico, Comercial, Jurídico, Logístico, Documental, Complexidade",
            "Na screenshot: scores calculados para o edital com cores e valores",
            "Justificativa escrita pela IA explicando a recomendação",
        ],
        screenshot_uc="UC-CV08",
        footer="UC-CV07/CV08 | RF-027, RF-028, RF-037 | Doc: CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V2.md | Validação: RESULTADO VALIDACAO SPRINT2.md",
        sprint_num=2)

    # Slide 27 — Importação de itens (screenshot: CV09_resp_itens)
    make_content_slide(prs,
        "Importação de itens e lotes",
        "UC-CV09 | RF-031, RF-036",
        [
            "O sistema importa itens do edital diretamente do PNCP",
            "Agrupamento automático em lotes via IA (por similaridade)",
            "Na screenshot: itens do edital importados na aba de lotes",
            "Cada item traz: descrição, quantidade, unidade, valor estimado",
        ],
        screenshot_uc="UC-CV09",
        footer="UC-CV09 | RF-031, RF-036 | Doc: CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V2.md | Validação: RESULTADO VALIDACAO SPRINT2.md",
        sprint_num=2)

    # Slide 28 — Análises avançadas (screenshot: CV11_resp_riscos)
    make_content_slide(prs,
        "Análises avançadas",
        "UC-CV10 a UC-CV12 | RF-029 a RF-034",
        [
            "Confronto automático: documentos exigidos vs documentos da empresa (UC-CV10)",
            "Na screenshot: análise de riscos com classificação de gravidade (UC-CV11)",
            "Recorrência do órgão, atas anteriores e concorrentes (UC-CV11)",
            "Análise de mercado: histórico de compras e volume (UC-CV12)",
        ],
        screenshot_uc="UC-CV11",
        footer="UC-CV10..CV12 | RF-029 a RF-034 | Doc: CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V2.md | Validação: RESULTADO VALIDACAO SPRINT2.md",
        sprint_num=2)

    # Slide 29 — Chat com IA (screenshot: CV13_resp_resposta)
    make_content_slide(prs,
        "Chat com IA na validação",
        "UC-CV13 | RF-026, RF-029, RF-030",
        [
            "Converse com a IA sobre o edital em linguagem natural",
            "'Resuma este edital', 'Quais os riscos?', 'Recomende ação'",
            "Na screenshot: resposta da IA com análise detalhada do edital",
            "Respostas baseadas nos dados reais do edital e da empresa",
        ],
        screenshot_uc="UC-CV13",
        footer="UC-CV13 | RF-026, RF-029, RF-030 | Doc: CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V2.md | Validação: RESULTADO VALIDACAO SPRINT2.md",
        sprint_num=2)

    # ═══════════════════════════════════════════════════
    # SEÇÃO E: Sprint 3 (slides 31-40)
    # Screenshots: validacao-sprint3/P##_* e R##_*
    # ═══════════════════════════════════════════════════

    make_sprint_cover(prs, 3,
        "Precificação em 6 Camadas + Proposta Automática",
        "19 casos de uso • RF-039 a RF-041",
        [
            "6 camadas de precificação: Volumetria → Custos → Preço Base → Referência → Lances → Histórico",
            "Motor de proposta técnica gerado automaticamente pela IA",
            "Auditoria ANVISA + checklist documental + exportação de dossiê",
        ])

    # Slide 31 — Organização por lotes (screenshot: P01_p7_tabela_itens)
    make_content_slide(prs,
        "Organização por lotes",
        "UC-P01 | RF-039-01",
        [
            "Os itens do edital são organizados em lotes com parâmetros técnicos",
            "Cada lote pode ter sua própria estratégia de preço",
            "Na screenshot: tabela de itens do edital organizados em lotes",
        ],
        screenshot_uc="UC-P01",
        footer="UC-P01 | RF-039-01 | Doc: CASOS DE USO PRECIFICACAO E PROPOSTA V2.md | Validação: RESULTADO VALIDACAO SPRINT3.md",
        sprint_num=3)

    # Slide 32 — Seleção + Volumetria
    make_content_slide(prs,
        "Seleção inteligente + Volumetria",
        "UC-P02, UC-P03 | RF-039-02, RF-039-07",
        [
            "A IA sugere quais produtos do portfolio atendem cada item do edital",
            "Na screenshot: lista de lotes com status de vinculação (UC-P02)",
            "Cálculo automático de quantidades técnicas por parâmetro (UC-P03)",
        ],
        screenshot_uc="UC-P02",
        footer="UC-P02/P03 | RF-039-02, RF-039-07 | Doc: CASOS DE USO PRECIFICACAO E PROPOSTA V2.md | Validação: RESULTADO VALIDACAO SPRINT3.md",
        sprint_num=3)

    # Slide 33 — Custos ERP
    make_content_slide(prs,
        "Custos ERP e tributário",
        "UC-P04 | RF-039-03, RF-039-04",
        [
            "Base de custos integrada: custo do produto + frete + impostos",
            "Regras tributárias por NCM aplicadas automaticamente",
            "Na screenshot: custos salvos com valores e impostos calculados",
        ],
        screenshot_uc="UC-P04",
        footer="UC-P04 | RF-039-03, RF-039-04 | Doc: CASOS DE USO PRECIFICACAO E PROPOSTA V2.md | Validação: RESULTADO VALIDACAO SPRINT3.md",
        sprint_num=3)

    # Slide 34 — Preço base e referência
    make_content_slide(prs,
        "Preço base e referência — Camadas B e C",
        "UC-P05, UC-P06 | RF-039-08, RF-039-09",
        [
            "Camada B: 3 modos — manual, custos + markup, ou histórico",
            "Na screenshot: preço base definido e salvo (UC-P05)",
            "Camada C: valor de referência do edital para comparação (UC-P06)",
        ],
        screenshot_uc="UC-P05",
        footer="UC-P05/P06 | RF-039-08, RF-039-09 | Doc: CASOS DE USO PRECIFICACAO E PROPOSTA V2.md | Validação: RESULTADO VALIDACAO SPRINT3.md",
        sprint_num=3)

    # Slide 35 — Lances e estratégia
    make_content_slide(prs,
        "Lances e estratégia competitiva",
        "UC-P07, UC-P08 | RF-039-10, RF-039-11",
        [
            "Camada D: primeiro lance, Camada E: lance mínimo",
            "Na screenshot: lances salvos com valores definidos (UC-P07)",
            "Estratégia agressiva ou conservadora com simulador de disputa (UC-P08)",
        ],
        screenshot_uc="UC-P07",
        footer="UC-P07/P08 | RF-039-10, RF-039-11 | Doc: CASOS DE USO PRECIFICACAO E PROPOSTA V2.md | Validação: RESULTADO VALIDACAO SPRINT3.md",
        sprint_num=3)

    # Slide 36 — Histórico + Comodato
    make_content_slide(prs,
        "Histórico de preços + Comodato",
        "UC-P09, UC-P10 | RF-039-12, RF-039-13",
        [
            "Camada F: preços de editais similares dos últimos 2 anos",
            "Na screenshot: resultado de busca histórica com filtros (UC-P09)",
            "Gestão de equipamentos em comodato com prazos (UC-P10)",
        ],
        screenshot_uc="UC-P09",
        footer="UC-P09/P10 | RF-039-12, RF-039-13 | Doc: CASOS DE USO PRECIFICACAO E PROPOSTA V2.md | Validação: RESULTADO VALIDACAO SPRINT3.md",
        sprint_num=3)

    # Slide 37 — Pipeline IA + Relatório
    make_content_slide(prs,
        "Pipeline IA + Relatório consolidado",
        "UC-P11, UC-P12 | RF-039-14, RF-039-15",
        [
            "A IA analisa TUDO: as 6 camadas + portfolio + edital",
            "Na screenshot: confirmação de precificação analisada pela IA (UC-P11)",
            "Relatório consolidado em HTML com recomendação de preço (UC-P12)",
        ],
        screenshot_uc="UC-P11",
        footer="UC-P11/P12 | RF-039-14, RF-039-15 | Doc: CASOS DE USO PRECIFICACAO E PROPOSTA V2.md | Validação: RESULTADO VALIDACAO SPRINT3.md",
        sprint_num=3)

    # Slide 38 — Motor de proposta técnica
    make_content_slide(prs,
        "Motor de proposta técnica",
        "UC-R01 a UC-R05 | RF-040",
        [
            "O sistema gera a proposta técnica automaticamente com dados do edital",
            "Na screenshot: página de detalhes da proposta com itens e parecer (UC-R01)",
            "Upload de proposta externa (UC-R02) + edição A/B (UC-R03)",
            "Auditoria ANVISA com semáforo regulatório (UC-R04) + checklist documental (UC-R05)",
        ],
        screenshot_uc="UC-R01",
        footer="UC-R01..R05 | RF-040 | Doc: CASOS DE USO PRECIFICACAO E PROPOSTA V2.md | Validação: RESULTADO VALIDACAO SPRINT3.md",
        sprint_num=3)

    # Slide 39 — Exportação e submissão
    make_content_slide(prs,
        "Exportação e submissão",
        "UC-R06, UC-R07 | RF-041",
        [
            "Dossiê completo exportado em PDF, DOCX ou ZIP",
            "Na screenshot: seleção de documentos/análises para exportação com checkboxes (UC-R06)",
            "Status rastreado: rascunho → enviada → aceita (UC-R07)",
        ],
        screenshot_uc="UC-R06",
        footer="UC-R06/R07 | RF-041 | Doc: CASOS DE USO PRECIFICACAO E PROPOSTA V2.md | Validação: RESULTADO VALIDACAO SPRINT3.md",
        sprint_num=3)

    # ═══════════════════════════════════════════════════
    # SEÇÃO F: Sprint 4 (slides 41-47)
    # Screenshots: validacao-sprint4/I##_*, RE##_*, FU##_*
    # ═══════════════════════════════════════════════════

    make_sprint_cover(prs, 4,
        "Defesa Jurídica Assistida por IA",
        "11 casos de uso • RF-043, RF-044 • Lei 14.133/2021",
        [
            "Análise de conformidade legal com classificação de gravidade",
            "Geração de petições de impugnação com fundamentação jurídica pela IA",
            "Recursos e contra-razões com motivações estruturadas",
        ])

    # Slide 41 — Validação legal (screenshot: I01_resp_tabela_inconsistencias)
    make_content_slide(prs,
        "Validação legal do edital",
        "UC-I01, UC-I02 | RF-043-01, RF-043-02",
        [
            "A IA analisa o edital contra a Lei 14.133/2021 e regulamentos",
            "Classifica inconsistências: ALTA, MÉDIA ou BAIXA gravidade",
            "Na screenshot: tabela de inconsistências com artigos de lei e gravidade",
            "Sugere esclarecimento ou impugnação para cada achado (UC-I02)",
        ],
        screenshot_uc="UC-I01",
        footer="UC-I01/I02 | RF-043-01, RF-043-02 | Doc: CASOS DE USO RECURSOS E IMPUGNACOES V2.md | Validação: RESULTADO VALIDACAO SPRINT4.md",
        sprint_num=4)

    # Slide 42 — Petição de impugnação (screenshot: I03_resp_peticao_criada)
    make_content_slide(prs,
        "Petição de impugnação",
        "UC-I03, UC-I04 | RF-043-03, RF-043-07",
        [
            "A IA gera minuta com fundamentação legal completa",
            "Na screenshot: modal de criação de petição com campos de artigos e argumentos",
            "Upload de petição redigida externamente (UC-I04)",
            "Edição completa com LOG de alterações",
        ],
        screenshot_uc="UC-I03",
        footer="UC-I03/I04 | RF-043-03, RF-043-07 | Doc: CASOS DE USO RECURSOS E IMPUGNACOES V2.md | Validação: RESULTADO VALIDACAO SPRINT4.md",
        sprint_num=4)

    # Slide 43 — Controle de prazo (screenshot: I05_resp_countdown)
    make_content_slide(prs,
        "Controle de prazo",
        "UC-I05 | RF-043-08",
        [
            "Countdown visual: quantos dias faltam para impugnar",
            "Na screenshot: tabela de prazos de impugnação com status e prazo restante",
            "Cores: verde (>5 dias), amarelo (3-5 dias), vermelho (<3 dias)",
            "Alertas automáticos quando o prazo é crítico",
        ],
        screenshot_uc="UC-I05",
        footer="UC-I05 | RF-043-08 | Doc: CASOS DE USO RECURSOS E IMPUGNACOES V2.md | Validação: RESULTADO VALIDACAO SPRINT4.md",
        sprint_num=4)

    # Slide 44 — Recursos (screenshot: RE01_resp_timeline)
    make_content_slide(prs,
        "Recursos — monitoramento e análise",
        "UC-RE01 a UC-RE03 | RF-044-01 a RF-044-03",
        [
            "Monitoramento da janela de recurso com timeline visual (UC-RE01)",
            "Na screenshot: badge de monitoramento ativo com acesso aos detalhes",
            "Análise da proposta vencedora para identificar fragilidades (UC-RE02)",
            "Chat jurídico interativo para perguntas específicas (UC-RE03)",
        ],
        screenshot_uc="UC-RE01",
        footer="UC-RE01..RE03 | RF-044-01 a RF-044-03 | Doc: CASOS DE USO RECURSOS E IMPUGNACOES V2.md | Validação: RESULTADO VALIDACAO SPRINT4.md",
        sprint_num=4)

    # Slide 45 — Laudos (screenshot: RE04_resp_laudo_criado)
    make_content_slide(prs,
        "Laudos de recurso e contra-razão",
        "UC-RE04, UC-RE05 | RF-044-07, RF-044-08",
        [
            "Recurso: quando a empresa perdeu e quer contestar (UC-RE04)",
            "Na screenshot: laudo de recurso criado com motivações estruturadas",
            "Contra-razão: quando a empresa ganhou e precisa se defender (UC-RE05)",
            "Geração automática com categorias e argumentos pela IA",
        ],
        screenshot_uc="UC-RE04",
        footer="UC-RE04/RE05 | RF-044-07, RF-044-08 | Doc: CASOS DE USO RECURSOS E IMPUGNACOES V2.md | Validação: RESULTADO VALIDACAO SPRINT4.md",
        sprint_num=4)

    # Slide 46 — Submissão assistida (screenshot: RE06_resp_submissao_registrada)
    make_content_slide(prs,
        "Submissão assistida no portal",
        "UC-RE06 | RF-044-12",
        [
            "O sistema auxilia o preenchimento nos portais da administração",
            "Na screenshot: submissão registrada com protocolo",
            "Dados pré-preenchidos a partir do laudo gerado",
        ],
        screenshot_uc="UC-RE06",
        footer="UC-RE06 | RF-044-12 | Doc: CASOS DE USO RECURSOS E IMPUGNACOES V2.md | Validação: RESULTADO VALIDACAO SPRINT4.md",
        sprint_num=4)

    # ═══════════════════════════════════════════════════
    # SEÇÃO G: Sprint 5 (slides 48-63)
    # Screenshots: UC-CT##/ e UC-CRM##/ (P##_resp.png)
    # ═══════════════════════════════════════════════════

    make_sprint_cover(prs, 5,
        "Pós-venda: Execução, Contratos e CRM",
        "19 casos de uso • RF-017, RF-035, RF-045, RF-046, RF-051, RF-052",
        [
            "Follow-up de resultados, atas de pregão, gestão de contratos",
            "Empenhos encadeados com auditoria cruzada automática",
            "CRM completo: pipeline 13 stages, mapa, agenda, KPIs, decisões",
        ])

    # Slide 48 — Follow-up
    make_content_slide(prs,
        "Follow-up de resultados",
        "UC-FU01 a UC-FU03 | RF-017, RF-046",
        [
            "Registrar resultado: vitória, derrota ou cancelamento (UC-FU01)",
            "Na screenshot: página de follow-up com contadores (1 ganho, 0 parcial) e editais pendentes",
            "Configurar alertas para marcos da execução (UC-FU02)",
            "Score logístico de desempenho calculado automaticamente (UC-FU03)",
        ],
        screenshot_uc="UC-FU01",
        footer="UC-FU01..FU03 | RF-017, RF-046 | Doc: CASOS DE USO SPRINT5 V3.md | Validação: RESULTADO VALIDACAO SPRINT4.md",
        sprint_num=5)

    # Slide 49 — Atas de pregão
    make_content_slide(prs,
        "Atas de pregão",
        "UC-AT01 a UC-AT03 | RF-035",
        [
            "Buscar atas diretamente no PNCP pelo número do processo",
            "Extrair vencedor, valor adjudicado e detalhes da ata em PDF",
            "Dashboard com histórico de atas consultadas e filtros",
        ],
        screenshot_uc="UC-AT01",
        footer="UC-AT01..AT03 | RF-035 | Doc: CASOS DE USO SPRINT5 V3.md | Validação: RESULTADO VALIDACAO SPRINT5.md",
        sprint_num=5)

    # Slide 50 — Contratos cadastro
    make_content_slide(prs,
        "Contratos — cadastro e entregas",
        "UC-CT01 a UC-CT03 | RF-046",
        [
            "Cadastrar contrato com dados: número, valor, vigência, objeto",
            "Na screenshot: listagem de contratos com stat cards (7 contratos, R$960.000)",
            "Registrar entregas com número NF, data e status (UC-CT02)",
            "Cronograma previsto × realizado com alertas de atraso (UC-CT03)",
        ],
        screenshot_uc="UC-CT01",
        footer="UC-CT01..CT03 | RF-046 | Doc: CASOS DE USO SPRINT5 V3.md | Validação: RESULTADO VALIDACAO SPRINT5.md",
        sprint_num=5)

    # Slide 51 — Aditivos
    make_content_slide(prs,
        "Aditivos, designações e ARP",
        "UC-CT04 a UC-CT06 | RF-046",
        [
            "Gestão de aditivos contratuais (prazo, valor, objeto)",
            "Designar gestor e fiscal do contrato com portaria",
            "Controle de saldo ARP (autorizado não recebido) e caronas",
            "Na screenshot: aba Aditivos na página de Execução de Contratos",
        ],
        screenshot_uc="UC-CT04",
        footer="UC-CT04..CT06 | RF-046 | Doc: CASOS DE USO SPRINT5 V3.md | Validação: RESULTADO VALIDACAO SPRINT5.md",
        sprint_num=5)

    # Slide 52 — Empenhos (screenshot: UC-CT07/P03_resp = stat cards + tabela)
    make_content_slide(prs,
        "Gestão de Empenhos",
        "UC-CT07 | RF-046-01",
        [
            "Tabela de empenhos: número EMPH-2026, tipo, valor, data",
            "Stat cards: total empenhado, faturado, saldo (com % colorido)",
            "Na screenshot: stat cards com valores e tabela de empenhos",
            "Itens incluem calibradores SEM VALOR com alerta visual",
            "Botão Novo Empenho para criar empenhos adicionais",
        ],
        screenshot_uc="UC-CT07",
        footer="UC-CT07 | RF-046-01 | Doc: CASOS DE USO SPRINT5 V3.md | Validação: RESULTADO VALIDACAO SPRINT5.md",
        sprint_num=5)

    # Slide 53 — Auditoria (screenshot: UC-CT08/P03_resp = cruzamento)
    make_content_slide(prs,
        "Auditoria Empenho × Fatura × Entrega",
        "UC-CT08 | RF-046-02",
        [
            "Cruzamento automático: empenhado vs faturado vs pago vs entregue",
            "Na screenshot: totais coloridos e tabela com divergências detectadas",
            "Detecta divergências com alerta laranja (ex: R$24.000 de diferença)",
            "Exportar relatório em CSV para auditoria externa",
        ],
        screenshot_uc="UC-CT08",
        footer="UC-CT08 | RF-046-02 | Doc: CASOS DE USO SPRINT5 V3.md | Validação: RESULTADO VALIDACAO SPRINT5.md",
        sprint_num=5)

    # Slide 54 — Contratos a vencer (screenshot: UC-CT09/P03_resp = 5 tiers)
    make_content_slide(prs,
        "Contratos a Vencer — 5 tiers",
        "UC-CT09 | RF-046-03",
        [
            "Cards organizados em 5 faixas de vencimento:",
            "Vence em 30 dias (urgente) — Vence em 90 dias (atenção)",
            "Em tratativa — Renovado — Não renovado",
            "Na screenshot: grid de cards coloridos em 5 colunas (tiers)",
        ],
        screenshot_uc="UC-CT09",
        footer="UC-CT09 | RF-046-03 | Doc: CASOS DE USO SPRINT5 V3.md | Validação: RESULTADO VALIDACAO SPRINT5.md",
        sprint_num=5)

    # Slide 55 — KPIs Execução (screenshot: UC-CT10/P03_resp = stat cards)
    make_content_slide(prs,
        "KPIs de Execução",
        "UC-CT10 | RF-046-04",
        [
            "6 stat cards numéricos com dados reais",
            "Contratos Ativos, Vence 30d, Vence 90d, Em Tratativa, Renovados, Não Renovados",
            "Na screenshot: indicadores com ícones coloridos e números",
            "Filtro de período para recálculo dinâmico",
        ],
        screenshot_uc="UC-CT10",
        footer="UC-CT10 | RF-046-04 | Doc: CASOS DE USO SPRINT5 V3.md | Validação: RESULTADO VALIDACAO SPRINT5.md",
        sprint_num=5)

    # Slide 56 — Contratado × Realizado
    make_content_slide(prs,
        "Contratado × Realizado",
        "UC-CR01 a UC-CR03 | RF-051, RF-052",
        [
            "Dashboard visual: valores contratados vs efetivamente recebidos",
            "Na screenshot: cards de totais, pedidos em atraso e próximos vencimentos",
            "Alertas multi-tier por gravidade com cores (rosa, amarelo, verde)",
        ],
        screenshot_uc="UC-CR01-acao",
        footer="UC-CR01..CR03 | RF-051, RF-052 | Doc: CASOS DE USO SPRINT5 V3.md | Validação: RESULTADO VALIDACAO SPRINT5.md",
        sprint_num=5)

    # Slide 57 — Pipeline CRM (screenshot: UC-CRM01/P03_resp = kanban)
    make_content_slide(prs,
        "Pipeline CRM — 13 stages",
        "UC-CRM01 | RF-045, RF-045-01",
        [
            "O CORAÇÃO do CRM: kanban horizontal com 13 colunas",
            "De 'Captado Não Divulgado' até 'Resultados Definitivos'",
            "Na screenshot: grid de cards organizados por stage",
            "Cada card mostra: edital, órgão, valor estimado, modalidade",
            "151 editais distribuídos no pipeline (dados reais do seed)",
        ],
        screenshot_uc="UC-CRM01",
        footer="UC-CRM01 | RF-045-01 | Doc: CASOS DE USO SPRINT5 V3.md | Validação: RESULTADO VALIDACAO SPRINT5.md",
        sprint_num=5)

    # Slide 58 — Parametrizações CRM (screenshot: UC-CRM02/P03_resp = tabela)
    make_content_slide(prs,
        "Parametrizações CRM",
        "UC-CRM02 | RF-045-02",
        [
            "3 sub-abas configuráveis pela empresa:",
            "Tipos de Edital (8 padrões), Agrupamentos Portfolio (12), Motivos de Derrota (7)",
            "Na screenshot: tabela de parametrizações com status (ativo/inativo)",
            "A empresa personaliza conforme sua realidade de mercado",
        ],
        screenshot_uc="UC-CRM02",
        footer="UC-CRM02 | RF-045-02 | Doc: CASOS DE USO SPRINT5 V3.md | Validação: RESULTADO VALIDACAO SPRINT5.md",
        sprint_num=5)

    # Slide 59 — Mapa + Agenda
    make_content_slide(prs,
        "Mapa geográfico + Agenda",
        "UC-CRM03, UC-CRM04 | RF-045-03, RF-045-04",
        [
            "Mapa: distribuição de editais por UF com contagem e valor",
            "Na screenshot: cards por estado com métricas (UC-CRM03)",
            "Agenda: 12 compromissos com datas e badges de urgência (UC-CRM04)",
            "Urgências: CRÍTICA (vermelho), ALTA (laranja), NORMAL (azul), BAIXA",
        ],
        screenshot_uc="UC-CRM03",
        footer="UC-CRM03/CRM04 | RF-045-03, RF-045-04 | Doc: CASOS DE USO SPRINT5 V3.md | Validação: RESULTADO VALIDACAO SPRINT5.md",
        sprint_num=5)

    # Slide 60 — KPIs CRM (screenshot: UC-CRM05/P03_resp = stat cards)
    make_content_slide(prs,
        "KPIs CRM",
        "UC-CRM05 | RF-045-05",
        [
            "8 stat cards com números reais:",
            "Total (121), Leads (23), Propostas (28), Perdidos (1)",
            "Na screenshot: métricas em cards com ícones coloridos",
            "Taxas de conversão e ticket médio calculados automaticamente",
        ],
        screenshot_uc="UC-CRM05",
        footer="UC-CRM05 | RF-045-05 | Doc: CASOS DE USO SPRINT5 V3.md | Validação: RESULTADO VALIDACAO SPRINT5.md",
        sprint_num=5)

    # Slide 61 — Decisões (screenshot: UC-CRM06/P03_resp = tabela de decisões)
    make_content_slide(prs,
        "Decisões: não-participação e perda",
        "UC-CRM06, UC-CRM07 | RF-045-01",
        [
            "Registro estruturado de: por que NÃO participou e por que PERDEU",
            "Na screenshot: tabela de decisões com motivos, datas e status",
            "Não-participação: motivo (ex: exclusivo ME/EPP) + justificativa",
            "Perda: categoria + descrição + checkbox contra-razão",
        ],
        screenshot_uc="UC-CRM06",
        footer="UC-CRM06/CRM07 | RF-045-01 | Doc: CASOS DE USO SPRINT5 V3.md | Validação: RESULTADO VALIDACAO SPRINT5.md",
        sprint_num=5)

    # ═══════════════════════════════════════════════════
    # SEÇÃO H: Encerramento (slides 62-66)
    # ═══════════════════════════════════════════════════

    make_content_slide(prs,
        "Resumo de conformidade",
        "Todas as 5 sprints aprovadas com 100% de testes passando",
        [
            "Sprint 1: 17 UCs — Empresa, Portfolio, Parametrizações ✅",
            "Sprint 2: 13 UCs — Captação e Validação com IA ✅",
            "Sprint 3: 19 UCs — Precificação 6 Camadas + Proposta ✅",
            "Sprint 4: 11 UCs — Impugnação, Recursos, Contra-Razões ✅",
            "Sprint 5: 19 UCs — Follow-up, Atas, Contratos, CRM ✅",
        ])

    make_content_slide(prs,
        "O que vem pela frente",
        "Sprints 6 a 10 planejadas",
        [
            "Sprint 6: CRM leads + Dashboard de Perdas + Análise de Concorrência",
            "Sprint 7: Flags, Monitoria, Auditoria completa, Notificações SMTP",
            "Sprint 8: Mercado TAM/SAM/SOM + Analytics com MindsDB",
            "Sprint 9: Dispensas de licitação + Classes avançadas + Máscaras",
            "Sprint 10: Disputa de Lances + Health Check + QA end-to-end",
        ])

    make_content_slide(prs,
        "Como acessar para validar",
        "Tudo pronto para você testar",
        [
            "URL: http://192.168.1.115:5179 (instância de validação)",
            "Usuário CH Hospitalar: valida1@valida.com.br / 123456",
            "Usuário RP3X: valida2@valida.com.br / 123456 (use este para validação manual)",
            "Documentos: pasta docs/ (tutoriais-2, casos de uso, resultados de validação)",
            "Siga os tutorialsprint#-2.md na ordem: Sprint 1 → 2 → 3 → 4 → 5",
        ])

    # Slide final
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide, BG_DARK)
    add_text_box(slide, Inches(1), Inches(2.5), Inches(11), Inches(1.0),
                 "Facilitia.ia", font_size=48, color=WHITE, bold=True,
                 alignment=PP_ALIGN.CENTER)
    add_text_box(slide, Inches(1), Inches(3.8), Inches(11), Inches(0.6),
                 "Obrigado — Bons testes!", font_size=28, color=LIGHT_GRAY,
                 alignment=PP_ALIGN.CENTER)
    add_text_box(slide, Inches(1), Inches(5.0), Inches(11), Inches(0.4),
                 "Abril 2026 • Sprints 1 a 5 • 79 casos de uso • 100% aprovados",
                 font_size=14, color=GRAY, alignment=PP_ALIGN.CENTER)

    # ── Slide oculto com roteiro de narração ──
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide, BG_DARK)
    add_text_box(slide, Inches(0.5), Inches(0.3), Inches(12), Inches(0.5),
                 "ROTEIRO DE NARRAÇÃO — Para uso no NotebookLM (slide oculto)",
                 font_size=20, color=GRAY, bold=True)
    roteiro = """O Facilitia.ia é um sistema completo de gestão de licitações que cobre desde a descoberta de um edital até a execução do contrato e o CRM pós-venda. Foi desenvolvido em 5 sprints, cada uma construindo sobre a anterior.

PROCESSO DE VALIDAÇÃO: A automação Playwright executou todos os testes com a empresa CH Hospitalar (tutorial-1), gerando screenshots como prova. O validador humano recebe: os requisitos completos, os casos de uso, o roteiro tutorial-2 (empresa RP3X), e os resultados da validação automática.

SPRINT 1 — FUNDAÇÃO: Cadastro da empresa, portfolio de produtos (com IA que consulta ANVISA), e todas as configurações: pesos de score, custos, regiões, fontes de busca. Screenshots mostram dados reais da CH Hospitalar salvos com sucesso.

SPRINT 2 — CAPTAÇÃO: Busca automática no PNCP, scores em 6 dimensões (técnico, comercial, jurídico, logístico, documental, complexidade), decisão GO/NO-GO com IA. Screenshots mostram resultados de busca, scores e análises reais.

SPRINT 3 — PREÇO E PROPOSTA: 6 camadas de precificação (A=volumetria até F=histórico), motor de proposta técnica com IA, auditoria ANVISA, checklist documental, exportação de dossiê completo.

SPRINT 4 — DEFESA JURÍDICA: Análise legal do edital contra Lei 14.133/2021, tabela de inconsistências com gravidade, petição de impugnação gerada pela IA, controle de prazo com countdown, recursos e contra-razões.

SPRINT 5 — PÓS-VENDA: Follow-up (vitória/derrota), atas de pregão, gestão de contratos com empenhos (incluindo itens sem valor com alerta), auditoria cruzada, contratos a vencer em 5 tiers, CRM com pipeline de 13 stages, parametrizações, mapa por UF, agenda com urgências, KPIs, decisões de não-participação e perda.

O validador deve seguir os tutorialsprint#-2.md na ordem (Sprint 1 a 5), usando os dados fornecidos para a empresa RP3X (valida2@valida.com.br / 123456). Cada tela deve mostrar dados reais — se algo estiver vazio, reportar como problema."""
    add_text_box(slide, Inches(0.5), Inches(1.0), Inches(12), Inches(6.0),
                 roteiro, font_size=11, color=LIGHT_GRAY)

    # ── Salvar ──
    prs.save(OUT)
    print(f"✅ PowerPoint salvo: {OUT}")
    print(f"   Total de slides: {len(prs.slides)}")


if __name__ == "__main__":
    build_presentation()
