"""
Módulo de Notificações por Email (B3)
Provê funções de envio de email com templates HTML.
Usa SMTP configurável via variáveis de ambiente.
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Optional


# Configurações SMTP
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "alertas@agenteditais.com.br")


def smtp_configurado() -> bool:
    """Verifica se o SMTP está configurado."""
    return bool(SMTP_USER and SMTP_PASSWORD)


def enviar_email_notificacao(destinatario: str, assunto: str, corpo_html: str,
                              corpo_texto: Optional[str] = None) -> bool:
    """
    Envia email de notificação.

    Args:
        destinatario: Email do destinatário
        assunto: Assunto do email
        corpo_html: Corpo em HTML
        corpo_texto: Corpo em texto puro (opcional, gerado automaticamente se não fornecido)

    Returns:
        True se enviado com sucesso, False caso contrário
    """
    if not smtp_configurado():
        print(f"[EMAIL] SMTP não configurado. Ignorando envio para {destinatario}")
        return False

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = assunto
        msg['From'] = SMTP_FROM
        msg['To'] = destinatario

        # Texto puro (fallback)
        if not corpo_texto:
            import re
            corpo_texto = re.sub(r'<[^>]+>', '', corpo_html)
        msg.attach(MIMEText(corpo_texto, 'plain', 'utf-8'))

        # HTML
        html_completo = f"""
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="background: #1e3a5f; padding: 20px 30px;">
                    <h1 style="color: white; margin: 0; font-size: 20px;">Agente Editais</h1>
                </div>
                <div style="padding: 30px;">
                    {corpo_html}
                </div>
                <div style="background: #f0f0f0; padding: 15px 30px; font-size: 12px; color: #666;">
                    <p>Este email foi enviado automaticamente pelo Agente Editais.</p>
                    <p>Para alterar suas preferências de notificação, acesse o sistema.</p>
                </div>
            </div>
        </body>
        </html>
        """
        msg.attach(MIMEText(html_completo, 'html', 'utf-8'))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, destinatario, msg.as_string())

        print(f"[EMAIL] Enviado para {destinatario}: {assunto}")
        return True

    except Exception as e:
        print(f"[EMAIL] Erro ao enviar para {destinatario}: {e}")
        return False


# ===== Templates de email =====

def template_novo_edital(editais: list, termo_busca: str) -> tuple:
    """
    Template para notificação de novos editais encontrados pelo monitoramento.

    Returns:
        (assunto, corpo_html)
    """
    assunto = f"📋 {len(editais)} novos editais encontrados - {termo_busca}"

    itens_html = ""
    for i, e in enumerate(editais[:10], 1):
        numero = e.get('numero', 'S/N')
        orgao = e.get('orgao', 'N/A')[:50]
        valor = e.get('valor_referencia', '')
        valor_str = f"R$ {valor:,.2f}" if valor else "N/I"
        url = e.get('url', '#')
        itens_html += f"""
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px;">{i}</td>
            <td style="padding: 8px;"><a href="{url}" style="color: #2563eb;">{numero}</a></td>
            <td style="padding: 8px;">{orgao}</td>
            <td style="padding: 8px;">{valor_str}</td>
        </tr>
        """

    corpo_html = f"""
    <h2 style="color: #1e3a5f; margin-top: 0;">Novos editais encontrados!</h2>
    <p>O monitoramento <strong>"{termo_busca}"</strong> encontrou {len(editais)} novo(s) edital(is):</p>

    <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <tr style="background: #f0f4f8;">
            <th style="padding: 8px; text-align: left;">#</th>
            <th style="padding: 8px; text-align: left;">Número</th>
            <th style="padding: 8px; text-align: left;">Órgão</th>
            <th style="padding: 8px; text-align: left;">Valor</th>
        </tr>
        {itens_html}
    </table>

    {"<p><em>... e mais " + str(len(editais) - 10) + " editais.</em></p>" if len(editais) > 10 else ""}

    <p><a href="#" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Ver no Agente Editais</a></p>
    """

    return assunto, corpo_html


def template_alerta_prazo(edital_numero: str, orgao: str, tipo_prazo: str,
                           tempo_restante: str, data_hora: str) -> tuple:
    """
    Template para alerta de prazo se aproximando.

    Returns:
        (assunto, corpo_html)
    """
    assunto = f"⏰ {tipo_prazo} - {edital_numero}"

    corpo_html = f"""
    <h2 style="color: #dc2626; margin-top: 0;">⏰ Prazo se aproximando!</h2>

    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; border-radius: 4px;">
        <p style="margin: 0;"><strong>{tipo_prazo}</strong></p>
        <p style="margin: 5px 0 0 0;">Tempo restante: <strong>{tempo_restante}</strong></p>
    </div>

    <table style="margin: 15px 0;">
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Edital:</td><td>{edital_numero}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Órgão:</td><td>{orgao}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Data/Hora:</td><td>{data_hora}</td></tr>
    </table>

    <p><a href="#" style="display: inline-block; padding: 10px 20px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px;">Ver Edital</a></p>
    """

    return assunto, corpo_html


def template_resumo_diario(total_novos: int, total_prazos: int, editais_destaque: list) -> tuple:
    """
    Template para resumo diário/semanal.

    Returns:
        (assunto, corpo_html)
    """
    data_str = datetime.now().strftime('%d/%m/%Y')
    assunto = f"📊 Resumo diário - {data_str}"

    destaques_html = ""
    for e in editais_destaque[:5]:
        destaques_html += f"<li>{e.get('numero', 'S/N')} - {e.get('orgao', 'N/A')[:40]} (Score: {e.get('score', 'N/A')}%)</li>"

    corpo_html = f"""
    <h2 style="color: #1e3a5f; margin-top: 0;">Resumo do dia - {data_str}</h2>

    <div style="display: flex; gap: 15px; margin: 15px 0;">
        <div style="flex: 1; background: #eff6ff; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #2563eb;">{total_novos}</div>
            <div style="font-size: 12px; color: #666;">Novos editais</div>
        </div>
        <div style="flex: 1; background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #d97706;">{total_prazos}</div>
            <div style="font-size: 12px; color: #666;">Prazos próximos</div>
        </div>
    </div>

    {"<h3>Destaques:</h3><ul>" + destaques_html + "</ul>" if editais_destaque else ""}

    <p><a href="#" style="display: inline-block; padding: 10px 20px; background: #1e3a5f; color: white; text-decoration: none; border-radius: 6px;">Acessar o Sistema</a></p>
    """

    return assunto, corpo_html
