"""
Sprint 6 — SMTPService consolidado.
Substitui envio direto por fila (EmailQueue) rastreável.
Suporta dry-run (smtp_live_mode=False) e templates com variáveis.
"""
import smtplib
import re
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime
import os

from models import get_db, ConfiguracaoSMTP, EmailTemplate, EmailQueue
from crypto_utils import decrypt_password


class SMTPService:
    def __init__(self):
        self._config = None

    def load_config(self, empresa_id=None):
        db = get_db()
        try:
            cfg = db.query(ConfiguracaoSMTP).filter(
                ConfiguracaoSMTP.empresa_id == empresa_id
            ).first()
            if not cfg and empresa_id:
                cfg = db.query(ConfiguracaoSMTP).filter(
                    ConfiguracaoSMTP.empresa_id.is_(None)
                ).first()
            if cfg:
                self._config = {
                    "host": cfg.host,
                    "port": cfg.port,
                    "user": cfg.user,
                    "password": decrypt_password(cfg.password_encrypted) if cfg.password_encrypted else None,
                    "from_email": cfg.from_email,
                    "from_name": cfg.from_name,
                    "tls_enabled": cfg.tls_enabled,
                    "smtp_live_mode": cfg.smtp_live_mode,
                }
            else:
                self._config = {
                    "host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
                    "port": int(os.getenv("SMTP_PORT", "587")),
                    "user": os.getenv("SMTP_USER", ""),
                    "password": os.getenv("SMTP_PASSWORD", ""),
                    "from_email": os.getenv("SMTP_FROM", "alertas@agenteditais.com.br"),
                    "from_name": "Agente Editais",
                    "tls_enabled": True,
                    "smtp_live_mode": bool(os.getenv("SMTP_USER")),
                }
        finally:
            db.close()
        return self._config

    def enqueue(self, destinatario, template_slug=None, assunto=None,
                corpo_html=None, variaveis=None, agendado_para=None,
                empresa_id=None, user_id=None):
        if template_slug and not (assunto and corpo_html):
            rendered = self.render_template(template_slug, variaveis or {}, empresa_id)
            if rendered:
                assunto = assunto or rendered["assunto"]
                corpo_html = corpo_html or rendered["corpo_html"]

        if not assunto:
            assunto = "(sem assunto)"

        db = get_db()
        try:
            item = EmailQueue(
                empresa_id=empresa_id,
                user_id=user_id,
                destinatario=destinatario,
                template_slug=template_slug,
                assunto=assunto,
                corpo_html=corpo_html,
                corpo_text=re.sub(r"<[^>]+>", "", corpo_html) if corpo_html else None,
                variaveis_json=variaveis,
                status="pending",
                agendado_para=agendado_para,
            )
            db.add(item)
            db.commit()
            queue_id = item.id
            print(f"[SMTP] Enfileirado: {queue_id} → {destinatario} ({assunto})")
            return queue_id
        finally:
            db.close()

    def render_template(self, slug, variaveis, empresa_id=None):
        db = get_db()
        try:
            tpl = db.query(EmailTemplate).filter(
                EmailTemplate.slug == slug,
                EmailTemplate.ativo == True,
            ).filter(
                (EmailTemplate.empresa_id == empresa_id) | (EmailTemplate.empresa_id.is_(None))
            ).order_by(EmailTemplate.empresa_id.desc()).first()
            if not tpl:
                return None
            assunto = tpl.assunto
            corpo = tpl.corpo_html
            for key, val in variaveis.items():
                assunto = assunto.replace(f"{{{{{key}}}}}", str(val))
                corpo = corpo.replace(f"{{{{{key}}}}}", str(val))
            return {"assunto": assunto, "corpo_html": corpo}
        finally:
            db.close()

    def send_now(self, queue_id):
        db = get_db()
        try:
            item = db.query(EmailQueue).filter(EmailQueue.id == queue_id).first()
            if not item:
                return False, "Item não encontrado"

            item.status = "sending"
            db.commit()

            cfg = self.load_config(item.empresa_id)

            if not cfg.get("smtp_live_mode"):
                print(f"[SMTP DRY-RUN] {item.destinatario}: {item.assunto}")
                item.status = "sent"
                item.enviado_em = datetime.now()
                db.commit()
                return True, "dry-run ok"

            if not cfg.get("user") or not cfg.get("password"):
                item.status = "failed"
                item.erro_mensagem = "SMTP não configurado (user/password vazios)"
                item.retry_count = (item.retry_count or 0) + 1
                db.commit()
                return False, item.erro_mensagem

            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = item.assunto
                from_addr = cfg["from_email"]
                if cfg.get("from_name"):
                    msg["From"] = f"{cfg['from_name']} <{from_addr}>"
                else:
                    msg["From"] = from_addr
                msg["To"] = item.destinatario

                if item.corpo_text:
                    msg.attach(MIMEText(item.corpo_text, "plain", "utf-8"))
                if item.corpo_html:
                    msg.attach(MIMEText(item.corpo_html, "html", "utf-8"))

                with smtplib.SMTP(cfg["host"], cfg["port"]) as server:
                    if cfg.get("tls_enabled"):
                        server.starttls()
                    server.login(cfg["user"], cfg["password"])
                    server.sendmail(from_addr, item.destinatario, msg.as_string())

                item.status = "sent"
                item.enviado_em = datetime.now()
                db.commit()
                print(f"[SMTP] Enviado: {item.destinatario} — {item.assunto}")
                return True, "ok"

            except Exception as e:
                item.status = "failed"
                item.erro_mensagem = str(e)[:500]
                item.retry_count = (item.retry_count or 0) + 1
                db.commit()
                print(f"[SMTP] Falha: {item.destinatario} — {e}")
                return False, str(e)
        finally:
            db.close()

    def test_config(self, destinatario_teste, empresa_id=None):
        cfg = self.load_config(empresa_id)
        if not cfg.get("smtp_live_mode"):
            return True, f"dry-run: email seria enviado para {destinatario_teste}"
        if not cfg.get("user") or not cfg.get("password"):
            return False, "SMTP não configurado (user/password ausentes)"
        try:
            msg = MIMEMultipart()
            msg["Subject"] = "[Agente Editais] Teste de configuração SMTP"
            msg["From"] = cfg["from_email"]
            msg["To"] = destinatario_teste
            body = "<p>Este é um email de teste do Agente Editais. Configuração SMTP validada com sucesso.</p>"
            msg.attach(MIMEText(body, "html", "utf-8"))

            with smtplib.SMTP(cfg["host"], cfg["port"]) as server:
                if cfg.get("tls_enabled"):
                    server.starttls()
                server.login(cfg["user"], cfg["password"])
                server.sendmail(cfg["from_email"], destinatario_teste, msg.as_string())
            return True, f"Email de teste enviado para {destinatario_teste}"
        except Exception as e:
            return False, f"Falha no teste: {e}"

    def process_queue(self, limit=50):
        db = get_db()
        try:
            now = datetime.now()
            items = db.query(EmailQueue).filter(
                EmailQueue.status == "pending",
                (EmailQueue.agendado_para.is_(None)) | (EmailQueue.agendado_para <= now),
            ).order_by(EmailQueue.created_at).limit(limit).all()

            results = {"sent": 0, "failed": 0, "skipped": 0}
            for item in items:
                if (item.retry_count or 0) >= (item.max_retries or 3):
                    item.status = "failed"
                    item.erro_mensagem = "Max retries atingido"
                    db.commit()
                    results["skipped"] += 1
                    continue

                ok, msg = self.send_now(item.id)
                if ok:
                    results["sent"] += 1
                else:
                    results["failed"] += 1

            if any(v > 0 for v in results.values()):
                print(f"[SMTP] Queue processada: {results}")
            return results
        finally:
            db.close()
