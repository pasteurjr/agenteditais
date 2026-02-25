"""
Scheduler - Jobs de Background para Sprint 2
- Verificação de Alertas de Prazo
- Execução de Monitoramentos
- Envio de Notificações por Email
"""

import os
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# APScheduler
try:
    from apscheduler.schedulers.background import BackgroundScheduler
    from apscheduler.triggers.interval import IntervalTrigger
    from apscheduler.triggers.cron import CronTrigger
    SCHEDULER_AVAILABLE = True
except ImportError:
    SCHEDULER_AVAILABLE = False
    print("[SCHEDULER] APScheduler não instalado. pip install apscheduler")

from models import SessionLocal, Alerta, Monitoramento, Notificacao, PreferenciasNotificacao, Edital, User, EmpresaCertidao, FonteCertidao, Empresa
from sqlalchemy import and_, or_

# Importar templates de notificação
try:
    from notifications import (
        enviar_email_notificacao, template_novo_edital,
        template_alerta_prazo, template_resumo_diario, smtp_configurado
    )
    NOTIFICATIONS_AVAILABLE = True
except ImportError:
    NOTIFICATIONS_AVAILABLE = False


# =============================================================================
# CONFIGURAÇÕES
# =============================================================================

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "alertas@agenteditais.com.br")

# Intervalo de verificação em minutos
CHECK_ALERTAS_INTERVAL = int(os.getenv("CHECK_ALERTAS_INTERVAL", "5"))
CHECK_MONITORAMENTOS_INTERVAL = int(os.getenv("CHECK_MONITORAMENTOS_INTERVAL", "60"))


# =============================================================================
# JOB: VERIFICAR ALERTAS DE PRAZO
# =============================================================================

def job_verificar_alertas():
    """
    Job que verifica alertas agendados e dispara notificações.
    Executa a cada 5 minutos.
    """
    print(f"[SCHEDULER] {datetime.now()} - Verificando alertas de prazo...")

    db = SessionLocal()
    try:
        agora = datetime.now()

        # Buscar alertas que devem ser disparados
        alertas_para_disparar = db.query(Alerta).filter(
            and_(
                Alerta.status == 'agendado',
                Alerta.data_disparo <= agora
            )
        ).all()

        print(f"[SCHEDULER] {len(alertas_para_disparar)} alertas para disparar")

        for alerta in alertas_para_disparar:
            try:
                # Buscar edital relacionado
                edital = db.query(Edital).filter(Edital.id == alerta.edital_id).first()
                if not edital:
                    print(f"[SCHEDULER] Edital não encontrado para alerta {alerta.id}")
                    alerta.status = 'cancelado'
                    continue

                # Buscar usuário
                user = db.query(User).filter(User.id == alerta.user_id).first()
                if not user:
                    print(f"[SCHEDULER] Usuário não encontrado para alerta {alerta.id}")
                    alerta.status = 'cancelado'
                    continue

                # Calcular tempo restante
                if edital.data_abertura:
                    tempo_restante = edital.data_abertura - agora
                    horas = int(tempo_restante.total_seconds() / 3600)
                    minutos = int((tempo_restante.total_seconds() % 3600) / 60)
                    tempo_str = f"{horas}h{minutos}min" if horas > 0 else f"{minutos} minutos"
                else:
                    tempo_str = "em breve"

                # Criar título e mensagem
                tipo_texto = {
                    'abertura': 'Abertura do Pregão',
                    'impugnacao': 'Prazo de Impugnação',
                    'recursos': 'Prazo de Recursos',
                    'proposta': 'Prazo para Proposta',
                    'personalizado': 'Alerta Personalizado'
                }.get(alerta.tipo, 'Alerta')

                titulo = f"⏰ {tipo_texto} - {edital.numero}"
                mensagem = f"""
Olá {user.name},

O edital **{edital.numero}** ({edital.orgao}) tem um prazo se aproximando!

**Tipo:** {tipo_texto}
**Tempo restante:** {tempo_str}
**Data/Hora:** {edital.data_abertura.strftime('%d/%m/%Y %H:%M') if edital.data_abertura else 'Não definida'}

Acesse o Agente Editais para mais detalhes.
"""

                # Criar notificação
                notificacao = Notificacao(
                    user_id=alerta.user_id,
                    alerta_id=alerta.id,
                    tipo='alerta_prazo',
                    titulo=titulo,
                    mensagem=mensagem.strip()
                )
                db.add(notificacao)

                # Enviar email se habilitado
                if alerta.canal_email:
                    prefs = db.query(PreferenciasNotificacao).filter(
                        PreferenciasNotificacao.user_id == alerta.user_id
                    ).first()

                    email_destino = prefs.email_notificacao if prefs and prefs.email_notificacao else user.email

                    if email_destino and prefs and prefs.email_habilitado:
                        # Verificar horário permitido
                        hora_atual = agora.hour
                        hora_inicio = int(prefs.horario_inicio.split(':')[0]) if prefs.horario_inicio else 0
                        hora_fim = int(prefs.horario_fim.split(':')[0]) if prefs.horario_fim else 23

                        if hora_inicio <= hora_atual <= hora_fim:
                            enviar_email_alerta(email_destino, titulo, mensagem)

                # Atualizar status do alerta
                alerta.status = 'disparado'
                alerta.data_disparo_real = agora

                print(f"[SCHEDULER] Alerta {alerta.id} disparado para {user.email}")

            except Exception as e:
                print(f"[SCHEDULER] Erro ao processar alerta {alerta.id}: {e}")

        db.commit()

    except Exception as e:
        print(f"[SCHEDULER] Erro no job de alertas: {e}")
        db.rollback()
    finally:
        db.close()


# =============================================================================
# JOB: EXECUTAR MONITORAMENTOS
# =============================================================================

def job_executar_monitoramentos():
    """
    Job que executa monitoramentos ativos e busca novos editais.
    Usa _buscar_editais_multifonte (mesma lógica da Captação e Chat).
    Executa a cada hora; cada monitoramento respeita sua frequencia_horas.
    """
    print(f"[SCHEDULER] {datetime.now()} - Executando monitoramentos...")

    db = SessionLocal()
    try:
        agora = datetime.now()

        # Buscar monitoramentos ativos que devem ser executados
        monitoramentos = db.query(Monitoramento).filter(
            Monitoramento.ativo == True
        ).all()

        executados = 0
        pulados = 0

        for mon in monitoramentos:
            try:
                # Verificar se é hora de executar
                if mon.ultima_execucao:
                    proxima_execucao = mon.ultima_execucao + timedelta(hours=mon.frequencia_horas or 24)
                    if agora < proxima_execucao:
                        pulados += 1
                        continue

                # Montar termo de busca (termo + NCM, igual à Captação)
                termo_busca = mon.termo
                if mon.ncm:
                    termo_busca += " NCM " + mon.ncm

                # UF: pegar primeira UF da lista (API aceita uma)
                uf_filtro = None
                if mon.ufs and len(mon.ufs) > 0:
                    uf_filtro = mon.ufs[0]

                print(f"[SCHEDULER] Executando monitoramento: '{termo_busca}' UF={uf_filtro} encerrados={mon.incluir_encerrados}")

                # Usar mesma função da Captação e do Chat
                from app import _buscar_editais_multifonte
                resultado = _buscar_editais_multifonte(
                    termo=termo_busca,
                    user_id=mon.user_id,
                    uf=uf_filtro,
                    incluir_encerrados=bool(mon.incluir_encerrados),
                    buscar_detalhes=False,
                )

                editais = resultado.get("editais", [])

                # Filtrar por UFs adicionais (se há mais de uma)
                if mon.ufs and len(mon.ufs) > 1:
                    ufs_set = set(u.upper() for u in mon.ufs)
                    editais = [e for e in editais if (e.get('uf') or '').upper() in ufs_set]

                # Filtrar por valor se especificado
                if mon.valor_minimo:
                    editais = [e for e in editais
                               if (e.get('valor_referencia') or e.get('valor_estimado') or 0) >= float(mon.valor_minimo)]
                if mon.valor_maximo:
                    editais = [e for e in editais
                               if (e.get('valor_referencia') or e.get('valor_estimado') or float('inf')) <= float(mon.valor_maximo)]

                # Filtrar por score mínimo se especificado
                if mon.score_minimo_alerta and mon.score_minimo_alerta > 0:
                    editais = [e for e in editais
                               if (e.get('score_tecnico') or 0) >= mon.score_minimo_alerta]

                # Atualizar contagem e última execução
                mon.ultima_execucao = agora
                mon.proximo_check = agora + timedelta(hours=mon.frequencia_horas or 24)
                mon.editais_encontrados = (mon.editais_encontrados or 0) + len(editais)
                executados += 1

                # Se encontrou editais, notificar
                if editais:
                    titulo = f"{len(editais)} novos editais - {mon.termo}"
                    mensagem = f"O monitoramento '{mon.termo}' encontrou {len(editais)} novos editais!\n\n"

                    for i, e in enumerate(editais[:5], 1):
                        mensagem += f"{i}. {e.get('numero', 'S/N')} - {(e.get('orgao', 'N/A') or 'N/A')[:40]}\n"

                    if len(editais) > 5:
                        mensagem += f"\n... e mais {len(editais) - 5} editais."

                    notificacao = Notificacao(
                        user_id=mon.user_id,
                        monitoramento_id=mon.id,
                        tipo='novo_edital',
                        titulo=titulo,
                        mensagem=mensagem
                    )
                    db.add(notificacao)

                    # Enviar email se configurado
                    user = db.query(User).filter(User.id == mon.user_id).first()
                    prefs = db.query(PreferenciasNotificacao).filter(
                        PreferenciasNotificacao.user_id == mon.user_id
                    ).first()

                    if user and prefs and prefs.email_habilitado:
                        email_destino = prefs.email_notificacao or user.email
                        if email_destino:
                            if NOTIFICATIONS_AVAILABLE:
                                assunto_html, corpo_html = template_novo_edital(editais, mon.termo)
                                enviar_email_notificacao(email_destino, assunto_html, corpo_html)
                            else:
                                enviar_email_alerta(email_destino, titulo, mensagem)

                print(f"[SCHEDULER] Monitoramento '{mon.termo}' concluido: {len(editais)} editais")

            except Exception as e:
                print(f"[SCHEDULER] Erro no monitoramento {mon.id}: {e}")

        db.commit()
        print(f"[SCHEDULER] Monitoramentos: {executados} executados, {pulados} aguardando proximo ciclo")

    except Exception as e:
        print(f"[SCHEDULER] Erro no job de monitoramentos: {e}")
        db.rollback()
    finally:
        db.close()


# =============================================================================
# FUNÇÕES AUXILIARES
# =============================================================================

def enviar_email_alerta(destinatario: str, titulo: str, mensagem: str) -> bool:
    """
    Envia email de alerta/notificação.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"[EMAIL] SMTP não configurado. Ignorando envio para {destinatario}")
        return False

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = titulo
        msg['From'] = SMTP_FROM
        msg['To'] = destinatario

        # Versão texto
        part_text = MIMEText(mensagem, 'plain', 'utf-8')
        msg.attach(part_text)

        # Versão HTML
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2563eb;">{titulo}</h2>
            <div style="white-space: pre-line; line-height: 1.6;">
                {mensagem.replace('**', '<strong>').replace('**', '</strong>')}
            </div>
            <hr style="margin-top: 30px;">
            <p style="color: #666; font-size: 12px;">
                Este email foi enviado automaticamente pelo Agente Editais.
            </p>
        </body>
        </html>
        """
        part_html = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(part_html)

        # Conectar e enviar
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, destinatario, msg.as_string())

        print(f"[EMAIL] Enviado para {destinatario}: {titulo}")
        return True

    except Exception as e:
        print(f"[EMAIL] Erro ao enviar para {destinatario}: {e}")
        return False


# =============================================================================
# JOB: VERIFICAR CERTIDÕES (vencimento + busca automática)
# =============================================================================

def job_verificar_certidoes():
    """
    Job diário que:
    1. Verifica certidões que vencem nos próximos 15 dias → cria Alerta + Notificação
    2. Verifica certidões vencidas com fonte automática → registra alerta de renovação
    """
    db = SessionLocal()
    try:
        from datetime import date, timedelta
        import uuid

        hoje = date.today()
        prazo_alerta = hoje + timedelta(days=15)

        # Buscar todas as empresas com certidões
        empresas = db.query(Empresa).all()
        total_alertas = 0
        total_vencidas = 0

        for empresa in empresas:
            if not empresa.user_id:
                continue

            # 1. Certidões que vencem nos próximos 15 dias
            certidoes_vencendo = db.query(EmpresaCertidao).filter(
                EmpresaCertidao.empresa_id == empresa.id,
                EmpresaCertidao.status == 'valida',
                EmpresaCertidao.data_vencimento != None,
                EmpresaCertidao.data_vencimento <= prazo_alerta,
                EmpresaCertidao.data_vencimento > hoje,
            ).all()

            for cert in certidoes_vencendo:
                dias_restantes = (cert.data_vencimento - hoje).days
                nome_cert = cert.orgao_emissor or cert.tipo

                # Verificar se já existe alerta recente para esta certidão
                alerta_existente = db.query(Alerta).filter(
                    Alerta.user_id == empresa.user_id,
                    Alerta.tipo == 'prazo',
                    Alerta.referencia_id == cert.id,
                    Alerta.status.in_(['agendado', 'disparado']),
                ).first()

                if not alerta_existente:
                    # Criar alerta
                    alerta = Alerta()
                    alerta.id = str(uuid.uuid4())
                    alerta.user_id = empresa.user_id
                    alerta.tipo = 'prazo'
                    alerta.titulo = f"Certidão vencendo: {nome_cert}"
                    alerta.mensagem = f"A certidão '{nome_cert}' da empresa {empresa.razao_social} vence em {dias_restantes} dia(s) ({cert.data_vencimento.isoformat()})."
                    alerta.referencia_tipo = 'certidao'
                    alerta.referencia_id = cert.id
                    alerta.data_disparo = datetime.now()
                    alerta.status = 'disparado'
                    db.add(alerta)

                    # Criar notificação no sistema
                    notif = Notificacao()
                    notif.id = str(uuid.uuid4())
                    notif.user_id = empresa.user_id
                    notif.tipo = 'sistema'
                    notif.titulo = f"Certidão vencendo em {dias_restantes} dias"
                    notif.mensagem = f"A certidão '{nome_cert}' vence em {cert.data_vencimento.isoformat()}. Renove antes do vencimento."
                    notif.lida = False
                    notif.created_at = datetime.now()
                    db.add(notif)
                    total_alertas += 1

            # 2. Certidões já vencidas → marcar status
            certidoes_expiradas = db.query(EmpresaCertidao).filter(
                EmpresaCertidao.empresa_id == empresa.id,
                EmpresaCertidao.status == 'valida',
                EmpresaCertidao.data_vencimento != None,
                EmpresaCertidao.data_vencimento <= hoje,
            ).all()

            for cert in certidoes_expiradas:
                cert.status = 'vencida'
                total_vencidas += 1

                nome_cert = cert.orgao_emissor or cert.tipo
                # Criar notificação de vencimento
                notif = Notificacao()
                notif.id = str(uuid.uuid4())
                notif.user_id = empresa.user_id
                notif.tipo = 'sistema'
                notif.titulo = f"Certidão vencida: {nome_cert}"
                notif.mensagem = f"A certidão '{nome_cert}' da empresa {empresa.razao_social} venceu em {cert.data_vencimento.isoformat()}. Providencie a renovação."
                notif.lida = False
                notif.created_at = datetime.now()
                db.add(notif)

        # 3. Re-buscar certidões automaticamente conforme frequência configurada
        freq_map = {
            'diaria': timedelta(days=1),
            'semanal': timedelta(days=7),
            'quinzenal': timedelta(days=15),
            'mensal': timedelta(days=30),
        }
        total_rebuscadas = 0

        for empresa in empresas:
            freq = getattr(empresa, 'frequencia_busca_certidoes', None) or 'diaria'
            if freq == 'desativada':
                continue

            intervalo = freq_map.get(freq, timedelta(days=1))

            # Buscar fontes ativas do usuário com busca automática
            fontes_auto = db.query(FonteCertidao).filter(
                FonteCertidao.user_id == empresa.user_id,
                FonteCertidao.ativo == True,
                FonteCertidao.permite_busca_automatica == True,
            ).all()

            cnpj = (empresa.cnpj or "").replace('.', '').replace('/', '').replace('-', '').strip()
            if not cnpj:
                continue

            upload_dir = os.path.join(os.path.dirname(__file__), 'uploads', 'certidoes')
            os.makedirs(upload_dir, exist_ok=True)

            rebuscadas_empresa = 0
            for fonte in fontes_auto:
                # Verificar se precisa re-buscar (última consulta + intervalo < agora)
                ultima = fonte.ultima_consulta
                if ultima and (datetime.now() - ultima) < intervalo:
                    continue  # Ainda dentro do intervalo, pular

                # Buscar certidão existente
                cert = db.query(EmpresaCertidao).filter(
                    EmpresaCertidao.empresa_id == empresa.id,
                    EmpresaCertidao.fonte_certidao_id == fonte.id,
                ).first()

                # Chamar função de busca real
                try:
                    from app import _tentar_obter_certidao
                    resultado = _tentar_obter_certidao(fonte, cnpj, empresa, upload_dir)

                    if resultado["sucesso"] and cert:
                        from datetime import date
                        cert.status = 'valida'
                        cert.data_emissao = date.today()
                        if resultado.get("data_vencimento"):
                            cert.data_vencimento = resultado["data_vencimento"]
                        if resultado.get("path_arquivo"):
                            cert.path_arquivo = resultado["path_arquivo"]
                        if resultado.get("numero"):
                            cert.numero_certidao = resultado["numero"]
                        cert.observacoes = resultado.get("mensagem", "")
                        rebuscadas_empresa += 1

                    # Atualizar última consulta na fonte
                    fonte.ultima_consulta = datetime.now()
                except Exception as ex:
                    print(f"[CERTIDÕES] Erro ao re-buscar {fonte.nome}: {ex}")

            total_rebuscadas += rebuscadas_empresa
            if rebuscadas_empresa > 0:
                print(f"[CERTIDÕES] Empresa {empresa.razao_social}: {rebuscadas_empresa} certidões re-buscadas")

        db.commit()
        print(f"[CERTIDÕES] Verificação concluída: {total_alertas} alertas criados, {total_vencidas} certidões marcadas como vencidas, {total_rebuscadas} certidões re-buscadas")

    except Exception as e:
        db.rollback()
        print(f"[CERTIDÕES] Erro na verificação: {e}")
    finally:
        db.close()


# =============================================================================
# INICIALIZAÇÃO DO SCHEDULER
# =============================================================================

scheduler = None

def iniciar_scheduler():
    """
    Inicia o scheduler em background.
    """
    global scheduler

    if not SCHEDULER_AVAILABLE:
        print("[SCHEDULER] APScheduler não disponível. Jobs não serão executados.")
        return False

    if scheduler and scheduler.running:
        print("[SCHEDULER] Scheduler já está rodando.")
        return True

    try:
        scheduler = BackgroundScheduler()

        # Job de verificação de alertas - a cada 5 minutos
        scheduler.add_job(
            job_verificar_alertas,
            IntervalTrigger(minutes=CHECK_ALERTAS_INTERVAL),
            id='verificar_alertas',
            name='Verificar Alertas de Prazo',
            replace_existing=True
        )

        # Job de execução de monitoramentos - a cada hora
        scheduler.add_job(
            job_executar_monitoramentos,
            IntervalTrigger(minutes=CHECK_MONITORAMENTOS_INTERVAL),
            id='executar_monitoramentos',
            name='Executar Monitoramentos',
            replace_existing=True
        )

        # Job de limpeza de notificações antigas - uma vez por dia às 3h
        scheduler.add_job(
            job_limpar_notificacoes_antigas,
            CronTrigger(hour=3, minute=0),
            id='limpar_notificacoes',
            name='Limpar Notificações Antigas',
            replace_existing=True
        )

        # Job de verificação de certidões - diário às 6h
        scheduler.add_job(
            job_verificar_certidoes,
            CronTrigger(hour=6, minute=0),
            id='verificar_certidoes',
            name='Verificar Certidões (vencimento e alertas)',
            replace_existing=True
        )

        scheduler.start()
        print(f"[SCHEDULER] Iniciado com sucesso!")
        print(f"[SCHEDULER] - Verificação de alertas: a cada {CHECK_ALERTAS_INTERVAL} minutos")
        print(f"[SCHEDULER] - Monitoramentos: a cada {CHECK_MONITORAMENTOS_INTERVAL} minutos")
        print(f"[SCHEDULER] - Limpeza de notificações: diária às 3h")
        print(f"[SCHEDULER] - Verificação de certidões: diária às 6h")

        return True

    except Exception as e:
        print(f"[SCHEDULER] Erro ao iniciar: {e}")
        return False


def parar_scheduler():
    """
    Para o scheduler.
    """
    global scheduler

    if scheduler and scheduler.running:
        scheduler.shutdown()
        print("[SCHEDULER] Parado.")
        scheduler = None


def job_limpar_notificacoes_antigas():
    """
    Remove notificações lidas com mais de 30 dias.
    """
    print(f"[SCHEDULER] {datetime.now()} - Limpando notificações antigas...")

    db = SessionLocal()
    try:
        limite = datetime.now() - timedelta(days=30)

        # Deletar notificações lidas antigas
        deleted = db.query(Notificacao).filter(
            and_(
                Notificacao.lida == True,
                Notificacao.created_at < limite
            )
        ).delete()

        db.commit()
        print(f"[SCHEDULER] {deleted} notificações antigas removidas")

    except Exception as e:
        print(f"[SCHEDULER] Erro na limpeza: {e}")
        db.rollback()
    finally:
        db.close()


# =============================================================================
# EXECUÇÃO DIRETA (para testes)
# =============================================================================

if __name__ == "__main__":
    print("=== Teste do Scheduler ===")
    print("1. Testar verificação de alertas")
    print("2. Testar execução de monitoramentos")
    print("3. Iniciar scheduler")

    opcao = input("Escolha: ")

    if opcao == "1":
        job_verificar_alertas()
    elif opcao == "2":
        job_executar_monitoramentos()
    elif opcao == "3":
        iniciar_scheduler()
        input("Pressione Enter para parar...")
        parar_scheduler()
