#!/usr/bin/env python3
"""
Gera 15 PDFs simulados de documentos da empresa QUANTICA IA LTDA
para teste de upload no sistema facilicita.ia
"""

from fpdf import FPDF
import os
from datetime import date

OUTPUT_DIR = "docs/docs_quantica"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Dados da empresa
EMPRESA = {
    "razao": "QUANTICA IA LTDA",
    "fantasia": "quantica.ia",
    "cnpj": "62.164.030/0001-90",
    "ie": "149.574.832.118",
    "im": "3.456.789-0",
    "endereco": "Rua Dr. Braulio Gomes, 125, 3o andar, sala 302",
    "bairro": "Republica",
    "cidade": "Sao Paulo",
    "uf": "SP",
    "cep": "01047-020",
    "telefone": "(11) 3256-7890",
    "email": "contato@quanticaia.com.br",
    "socio1": "Dr. Ricardo Almeida Pasteur Junior",
    "cpf_socio1": "123.456.789-00",
    "socio2": "Dra. Mariana Costa Silva",
    "cpf_socio2": "987.654.321-00",
    "responsavel_tecnico": "Dr. Carlos Eduardo Ferreira",
    "crq_rt": "CRQ-IV 04-123456",
    "capital_social": "R$ 2.500.000,00",
    "atividade": "Desenvolvimento, fabricacao e comercializacao de reagentes para diagnostico in vitro, equipamentos de laboratorio e solucoes de inteligencia artificial para saude",
    "cnae": "2110-6/00 - Fabricacao de produtos farmoquimicos",
}


class DocPDF(FPDF):
    def header_orgao(self, orgao, subtitulo=""):
        self.set_font("Helvetica", "B", 14)
        self.cell(0, 8, orgao, new_x="LMARGIN", new_y="NEXT", align="C")
        if subtitulo:
            self.set_font("Helvetica", "", 10)
            self.cell(0, 5, subtitulo, new_x="LMARGIN", new_y="NEXT", align="C")
        self.ln(3)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)

    def titulo(self, texto):
        self.set_font("Helvetica", "B", 13)
        self.cell(0, 8, texto, new_x="LMARGIN", new_y="NEXT", align="C")
        self.ln(3)

    def subtitulo(self, texto):
        self.set_font("Helvetica", "B", 11)
        self.cell(0, 7, texto, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def corpo(self, texto):
        self.set_font("Helvetica", "", 10)
        self.multi_cell(0, 5, texto)
        self.ln(2)

    def campo(self, label, valor):
        self.set_font("Helvetica", "B", 10)
        self.cell(55, 6, label + ":", new_x="END")
        self.set_font("Helvetica", "", 10)
        self.cell(0, 6, valor, new_x="LMARGIN", new_y="NEXT")

    def assinatura(self, nome, cargo, local_data=None):
        self.ln(15)
        if local_data:
            self.set_font("Helvetica", "", 10)
            self.cell(0, 5, local_data, new_x="LMARGIN", new_y="NEXT", align="C")
            self.ln(10)
        x_center = 105
        self.line(x_center - 40, self.get_y(), x_center + 40, self.get_y())
        self.ln(2)
        self.set_font("Helvetica", "B", 10)
        self.cell(0, 5, nome, new_x="LMARGIN", new_y="NEXT", align="C")
        self.set_font("Helvetica", "", 9)
        self.cell(0, 5, cargo, new_x="LMARGIN", new_y="NEXT", align="C")

    def codigo_verificacao(self, codigo):
        self.ln(8)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 4, f"Codigo de verificacao: {codigo}", new_x="LMARGIN", new_y="NEXT", align="C")
        self.cell(0, 4, "Documento gerado eletronicamente. Validade pode ser conferida no portal do orgao emissor.", new_x="LMARGIN", new_y="NEXT", align="C")
        self.set_text_color(0, 0, 0)


def gerar_contrato_social():
    pdf = DocPDF()
    pdf.add_page()
    pdf.header_orgao("JUNTA COMERCIAL DO ESTADO DE SAO PAULO - JUCESP", "Registro de Empresas Mercantis")
    pdf.titulo("CONTRATO SOCIAL DE CONSTITUICAO DE SOCIEDADE LIMITADA")
    pdf.ln(2)
    pdf.campo("NIRE", "35.228.456.789-0")
    pdf.campo("Data de Registro", "15/03/2022")
    pdf.campo("Razao Social", EMPRESA["razao"])
    pdf.campo("Nome Fantasia", EMPRESA["fantasia"])
    pdf.campo("CNPJ", EMPRESA["cnpj"])
    pdf.ln(4)

    pdf.subtitulo("CLAUSULA PRIMEIRA - DENOMINACAO SOCIAL")
    pdf.corpo(f'A sociedade girara sob a denominacao social "{EMPRESA["razao"]}", com nome fantasia "{EMPRESA["fantasia"]}".')

    pdf.subtitulo("CLAUSULA SEGUNDA - SEDE")
    pdf.corpo(f'A sede da sociedade esta localizada na {EMPRESA["endereco"]}, {EMPRESA["bairro"]}, {EMPRESA["cidade"]}-{EMPRESA["uf"]}, CEP {EMPRESA["cep"]}.')

    pdf.subtitulo("CLAUSULA TERCEIRA - OBJETO SOCIAL")
    pdf.corpo(f'{EMPRESA["atividade"]}. CNAE Principal: {EMPRESA["cnae"]}. CNAEs secundarios: 7210-0/00 - Pesquisa e desenvolvimento experimental em ciencias fisicas e naturais; 6202-3/00 - Desenvolvimento e licenciamento de programas de computador customizaveis; 4664-8/00 - Comercio atacadista de maquinas, aparelhos e equipamentos para uso odonto-medico-hospitalar.')

    pdf.subtitulo("CLAUSULA QUARTA - CAPITAL SOCIAL")
    pdf.corpo(f'O capital social e de {EMPRESA["capital_social"]} (dois milhoes e quinhentos mil reais), dividido em 2.500.000 (dois milhoes e quinhentas mil) quotas, no valor nominal de R$ 1,00 (um real) cada uma, totalmente integralizadas em moeda corrente.')

    pdf.subtitulo("CLAUSULA QUINTA - QUADRO SOCIETARIO")
    pdf.corpo(f'Socio 1: {EMPRESA["socio1"]}, CPF {EMPRESA["cpf_socio1"]}, brasileiro, casado, engenheiro, detentor de 1.500.000 quotas (60% do capital social).')
    pdf.corpo(f'Socio 2: {EMPRESA["socio2"]}, CPF {EMPRESA["cpf_socio2"]}, brasileira, solteira, farmaceutica-bioquimica, detentora de 1.000.000 quotas (40% do capital social).')

    pdf.subtitulo("CLAUSULA SEXTA - ADMINISTRACAO")
    pdf.corpo(f'A sociedade sera administrada pelo socio {EMPRESA["socio1"]}, que exercera o cargo de Diretor Presidente, com poderes para representar a sociedade ativa e passivamente, em juizo ou fora dele, podendo praticar todos os atos necessarios a administracao da sociedade.')

    pdf.subtitulo("CLAUSULA SETIMA - PRAZO DE DURACAO")
    pdf.corpo("A sociedade e constituida por prazo indeterminado, iniciando suas atividades na data do registro deste contrato.")

    pdf.subtitulo("CLAUSULA OITAVA - EXERCICIO SOCIAL")
    pdf.corpo("O exercicio social coincidira com o ano civil, encerrando-se em 31 de dezembro de cada ano, quando serao levantados o balanco patrimonial e a demonstracao do resultado do exercicio.")

    pdf.assinatura(EMPRESA["socio1"], "Socio Administrador", "Sao Paulo, 15 de marco de 2022")
    pdf.output(f"{OUTPUT_DIR}/contrato_social.pdf")
    print("  [OK] contrato_social.pdf")


def gerar_alvara():
    pdf = DocPDF()
    pdf.add_page()
    pdf.header_orgao("PREFEITURA DO MUNICIPIO DE SAO PAULO", "Secretaria Municipal de Urbanismo e Licenciamento - SMUL")
    pdf.titulo("ALVARA DE FUNCIONAMENTO")
    pdf.ln(2)
    pdf.campo("No do Alvara", "ALV-2024-SP-0045892")
    pdf.campo("Processo", "2024.0.123.456-7")
    pdf.campo("Data de Emissao", "10/01/2024")
    pdf.campo("Validade", "10/01/2025")
    pdf.ln(3)
    pdf.subtitulo("DADOS DO ESTABELECIMENTO")
    pdf.campo("Razao Social", EMPRESA["razao"])
    pdf.campo("CNPJ", EMPRESA["cnpj"])
    pdf.campo("Inscricao Municipal", EMPRESA["im"])
    pdf.campo("Endereco", f'{EMPRESA["endereco"]}, {EMPRESA["bairro"]}')
    pdf.campo("CEP", EMPRESA["cep"])
    pdf.campo("Cidade/UF", f'{EMPRESA["cidade"]}/{EMPRESA["uf"]}')
    pdf.campo("Area Total", "250,00 m2")
    pdf.ln(3)
    pdf.subtitulo("ATIVIDADE AUTORIZADA")
    pdf.corpo(f'Fica autorizado o funcionamento do estabelecimento acima identificado para exercer a(s) seguinte(s) atividade(s): {EMPRESA["atividade"]}.')
    pdf.corpo("CNAE Principal: 2110-6/00 - Fabricacao de produtos farmoquimicos")
    pdf.corpo("CNAEs Secundarios: 7210-0/00, 6202-3/00, 4664-8/00")
    pdf.ln(2)
    pdf.subtitulo("CONDICOES E RESTRICOES")
    pdf.corpo("1. O presente alvara nao substitui nem dispensa a obtencao de outras licencas e autorizacoes exigidas pela legislacao vigente.")
    pdf.corpo("2. O estabelecimento devera manter as condicoes de seguranca, higiene e habitabilidade conforme normas vigentes.")
    pdf.corpo("3. Qualquer alteracao nas atividades ou no local devera ser comunicada a esta Secretaria.")
    pdf.corpo("4. Este alvara devera ser mantido em local visivel no estabelecimento.")
    pdf.assinatura("Maria Helena Rodrigues", "Secretaria Municipal de Urbanismo e Licenciamento", "Sao Paulo, 10 de janeiro de 2024")
    pdf.codigo_verificacao("ALV-2024-SP-0045892-XKFR9T")
    pdf.output(f"{OUTPUT_DIR}/alvara_funcionamento.pdf")
    print("  [OK] alvara_funcionamento.pdf")


def gerar_procuracao():
    pdf = DocPDF()
    pdf.add_page()
    pdf.header_orgao("CARTORIO DO 15o TABELIONATO DE NOTAS DE SAO PAULO", "Tabeliao: Dr. Antonio Carlos Mendes")
    pdf.titulo("PROCURACAO PUBLICA")
    pdf.ln(2)
    pdf.campo("Livro", "1.245")
    pdf.campo("Folha", "089")
    pdf.campo("Ato", "PRO-2024-089456")
    pdf.campo("Data", "20/02/2024")
    pdf.ln(3)
    pdf.corpo(f'SAIBAM quantos esta publica procuracao virem que, aos vinte dias do mes de fevereiro do ano de dois mil e vinte e quatro (20/02/2024), nesta cidade e comarca de Sao Paulo, Estado de Sao Paulo, perante mim, Tabeliao, compareceu como OUTORGANTE:')
    pdf.ln(2)
    pdf.corpo(f'{EMPRESA["razao"]}, pessoa juridica de direito privado, inscrita no CNPJ sob o no {EMPRESA["cnpj"]}, com sede na {EMPRESA["endereco"]}, {EMPRESA["bairro"]}, {EMPRESA["cidade"]}-{EMPRESA["uf"]}, CEP {EMPRESA["cep"]}, neste ato representada por seu socio administrador {EMPRESA["socio1"]}, portador do CPF no {EMPRESA["cpf_socio1"]}.')
    pdf.ln(2)
    pdf.corpo(f'Que, pela presente procuracao, nomeia e constitui como seu OUTORGADO e bastante PROCURADOR:')
    pdf.ln(2)
    pdf.corpo(f'{EMPRESA["socio2"]}, brasileira, farmaceutica-bioquimica, portadora do CPF no {EMPRESA["cpf_socio2"]}, residente e domiciliada nesta Capital.')
    pdf.ln(2)
    pdf.corpo("A quem confere poderes especiais para, em nome da outorgante, representar a empresa em licitacoes publicas, pregoes eletronicos e presenciais, assinar propostas comerciais, interpor recursos administrativos, renunciar a prazos recursais, assinar contratos administrativos, e praticar todos os atos necessarios a participacao em processos licitatorios, perante quaisquer orgaos publicos federais, estaduais e municipais.")
    pdf.ln(2)
    pdf.corpo("A presente procuracao tera validade de 01 (um) ano a contar desta data, podendo ser substabelecida no todo ou em parte.")
    pdf.assinatura(EMPRESA["socio1"], f"Representante Legal - {EMPRESA['razao']}", "Sao Paulo, 20 de fevereiro de 2024")
    pdf.ln(8)
    pdf.set_font("Helvetica", "I", 9)
    pdf.corpo("RECONHECO A FIRMA SUPRA COMO VERDADEIRA. Dou fe. Eu, Antonio Carlos Mendes, Tabeliao, subscrevi e assinei. Taxa: R$ 85,62 (Tabela 9.2 do TJSP).")
    pdf.output(f"{OUTPUT_DIR}/procuracao.pdf")
    print("  [OK] procuracao.pdf")


def gerar_afe_anvisa():
    pdf = DocPDF()
    pdf.add_page()
    pdf.header_orgao("AGENCIA NACIONAL DE VIGILANCIA SANITARIA - ANVISA", "Gerencia-Geral de Inspecao, Monitoramento da Qualidade, Controle e Fiscalizacao de Insumos, Medicamentos, Produtos, Propaganda e Publicidade")
    pdf.titulo("AUTORIZACAO DE FUNCIONAMENTO DE EMPRESA - AFE")
    pdf.ln(2)
    pdf.campo("No da AFE", "AFE 8.04567/2023")
    pdf.campo("Processo", "25351.567890/2023-12")
    pdf.campo("Publicacao DOU", "Secao 1, No 145, 01/08/2023, pag. 78")
    pdf.campo("Data de Emissao", "01/08/2023")
    pdf.campo("Validade", "Indeterminada (sujeita a inspecao)")
    pdf.ln(3)
    pdf.subtitulo("DADOS DA EMPRESA")
    pdf.campo("Razao Social", EMPRESA["razao"])
    pdf.campo("CNPJ", EMPRESA["cnpj"])
    pdf.campo("Endereco", f'{EMPRESA["endereco"]}, {EMPRESA["bairro"]}')
    pdf.campo("Cidade/UF", f'{EMPRESA["cidade"]}/{EMPRESA["uf"]}')
    pdf.campo("Responsavel Tecnico", EMPRESA["responsavel_tecnico"])
    pdf.campo("Conselho/No", EMPRESA["crq_rt"])
    pdf.ln(3)
    pdf.subtitulo("ATIVIDADES AUTORIZADAS")
    pdf.corpo("Ficam autorizadas as seguintes atividades:")
    pdf.corpo("- FABRICAR: Produtos para diagnostico de uso in vitro")
    pdf.corpo("- DISTRIBUIR: Produtos para diagnostico de uso in vitro, equipamentos medico-hospitalares")
    pdf.corpo("- IMPORTAR: Produtos para diagnostico de uso in vitro, reagentes, equipamentos")
    pdf.corpo("- ARMAZENAR: Produtos para diagnostico de uso in vitro, reagentes, insumos")
    pdf.corpo("- TRANSPORTAR: Produtos para diagnostico de uso in vitro (com controle de temperatura)")
    pdf.ln(2)
    pdf.subtitulo("CLASSE DE PRODUTOS")
    pdf.corpo("Classe I - Produtos para diagnostico de uso in vitro de baixo risco")
    pdf.corpo("Classe II - Produtos para diagnostico de uso in vitro de medio risco")
    pdf.corpo("Classe III - Produtos para diagnostico de uso in vitro de alto risco")
    pdf.corpo("Classe IV - Equipamentos de laboratorio clinico")
    pdf.ln(2)
    pdf.corpo("Esta autorizacao nao dispensa o cumprimento das demais exigencias legais e regulamentares aplicaveis, incluindo a obtencao de registro/cadastro dos produtos junto a ANVISA.")
    pdf.assinatura("Dr. Paulo Roberto de Souza", "Gerente-Geral de Inspecao - ANVISA", "Brasilia-DF, 01 de agosto de 2023")
    pdf.codigo_verificacao("AFE-8045672023-ANVISA-7HK3M9PQ")
    pdf.output(f"{OUTPUT_DIR}/afe_anvisa.pdf")
    print("  [OK] afe_anvisa.pdf")


def gerar_cbpad():
    pdf = DocPDF()
    pdf.add_page()
    pdf.header_orgao("AGENCIA NACIONAL DE VIGILANCIA SANITARIA - ANVISA", "Certificacao de Boas Praticas")
    pdf.titulo("CERTIFICADO DE BOAS PRATICAS DE ARMAZENAGEM E DISTRIBUICAO - CBPAD")
    pdf.ln(2)
    pdf.campo("No do Certificado", "CBPAD No 0892/2024")
    pdf.campo("Processo", "25351.678901/2024-03")
    pdf.campo("Data de Emissao", "15/04/2024")
    pdf.campo("Validade", "15/04/2026 (2 anos)")
    pdf.ln(3)
    pdf.subtitulo("EMPRESA CERTIFICADA")
    pdf.campo("Razao Social", EMPRESA["razao"])
    pdf.campo("CNPJ", EMPRESA["cnpj"])
    pdf.campo("Endereco Inspecionado", f'{EMPRESA["endereco"]}, {EMPRESA["bairro"]}, {EMPRESA["cidade"]}-{EMPRESA["uf"]}')
    pdf.campo("Responsavel Tecnico", EMPRESA["responsavel_tecnico"])
    pdf.ln(3)
    pdf.corpo("A Agencia Nacional de Vigilancia Sanitaria, no uso de suas atribuicoes legais, e com base na Resolucao RDC No 430/2020, CERTIFICA que a empresa acima identificada foi inspecionada e encontra-se em conformidade com as Boas Praticas de Armazenagem e Distribuicao de produtos para saude.")
    pdf.ln(2)
    pdf.subtitulo("ESCOPO DA CERTIFICACAO")
    pdf.corpo("- Armazenagem de reagentes para diagnostico in vitro (temperatura ambiente e refrigerada 2-8oC)")
    pdf.corpo("- Distribuicao de reagentes para diagnostico in vitro")
    pdf.corpo("- Armazenagem de equipamentos de laboratorio clinico")
    pdf.corpo("- Distribuicao de equipamentos de laboratorio clinico")
    pdf.ln(2)
    pdf.subtitulo("RESULTADO DA INSPECAO")
    pdf.corpo("Inspecao realizada nos dias 08 a 12/04/2024.")
    pdf.corpo("Resultado: SATISFATORIO")
    pdf.corpo("Nao conformidades criticas: 0 (zero)")
    pdf.corpo("Nao conformidades maiores: 0 (zero)")
    pdf.corpo("Nao conformidades menores: 2 (duas) - sanadas durante a inspecao")
    pdf.assinatura("Dra. Fernanda Lima Goncalves", "Coordenadora de Inspecao - GGFIS/ANVISA", "Brasilia-DF, 15 de abril de 2024")
    pdf.codigo_verificacao("CBPAD-0892-2024-ANVISA-RT45KLP2")
    pdf.output(f"{OUTPUT_DIR}/cbpad.pdf")
    print("  [OK] cbpad.pdf")


def gerar_cbpp():
    pdf = DocPDF()
    pdf.add_page()
    pdf.header_orgao("AGENCIA NACIONAL DE VIGILANCIA SANITARIA - ANVISA", "Certificacao de Boas Praticas")
    pdf.titulo("CERTIFICADO DE BOAS PRATICAS DE PRODUCAO - CBPP")
    pdf.ln(2)
    pdf.campo("No do Certificado", "CBPP No 0456/2024")
    pdf.campo("Processo", "25351.789012/2024-07")
    pdf.campo("Data de Emissao", "20/05/2024")
    pdf.campo("Validade", "20/05/2026 (2 anos)")
    pdf.ln(3)
    pdf.subtitulo("EMPRESA CERTIFICADA")
    pdf.campo("Razao Social", EMPRESA["razao"])
    pdf.campo("CNPJ", EMPRESA["cnpj"])
    pdf.campo("Planta Fabril", f'{EMPRESA["endereco"]}, {EMPRESA["bairro"]}, {EMPRESA["cidade"]}-{EMPRESA["uf"]}')
    pdf.campo("Responsavel Tecnico", EMPRESA["responsavel_tecnico"])
    pdf.campo("CRQ", EMPRESA["crq_rt"])
    pdf.ln(3)
    pdf.corpo("A Agencia Nacional de Vigilancia Sanitaria, com fundamento na RDC No 665/2022 e na RDC No 430/2020, CERTIFICA que a planta fabril da empresa acima identificada foi inspecionada e atende aos requisitos de Boas Praticas de Fabricacao/Producao.")
    pdf.ln(2)
    pdf.subtitulo("LINHAS DE PRODUCAO CERTIFICADAS")
    pdf.corpo("1. Reagentes liquidos para diagnostico in vitro (Hematologia)")
    pdf.corpo("2. Reagentes liquidos para diagnostico in vitro (Bioquimica)")
    pdf.corpo("3. Controles e calibradores para equipamentos de diagnostico")
    pdf.corpo("4. Solucoes de limpeza e manutencao para analisadores automaticos")
    pdf.ln(2)
    pdf.subtitulo("RESULTADO DA INSPECAO")
    pdf.corpo("Inspecao realizada nos dias 13 a 17/05/2024.")
    pdf.corpo("Resultado: SATISFATORIO")
    pdf.corpo("A empresa demonstrou conformidade com os requisitos de BPF aplicaveis, incluindo: controle de qualidade, validacao de processos, rastreabilidade de lotes, controle ambiental das salas limpas (Classe ISO 7) e gestao de residuos.")
    pdf.assinatura("Dr. Marcos Antonio Ribeiro", "Inspetor Federal de Saude - GGFIS/ANVISA", "Brasilia-DF, 20 de maio de 2024")
    pdf.codigo_verificacao("CBPP-0456-2024-ANVISA-MN78QRS5")
    pdf.output(f"{OUTPUT_DIR}/cbpp.pdf")
    print("  [OK] cbpp.pdf")


def gerar_bombeiros():
    pdf = DocPDF()
    pdf.add_page()
    pdf.header_orgao("CORPO DE BOMBEIROS DO ESTADO DE SAO PAULO", "Policia Militar do Estado de Sao Paulo - Diretoria de Atividades Tecnicas")
    pdf.titulo("AUTO DE VISTORIA DO CORPO DE BOMBEIROS - AVCB")
    pdf.ln(2)
    pdf.campo("No do AVCB", "AVCB No 2024/SP/034567")
    pdf.campo("Processo SIGOM", "CB-2024.00.034567-8")
    pdf.campo("Data de Emissao", "05/03/2024")
    pdf.campo("Validade", "05/03/2027 (3 anos)")
    pdf.ln(3)
    pdf.subtitulo("DADOS DO ESTABELECIMENTO")
    pdf.campo("Razao Social", EMPRESA["razao"])
    pdf.campo("CNPJ", EMPRESA["cnpj"])
    pdf.campo("Endereco", f'{EMPRESA["endereco"]}, {EMPRESA["bairro"]}, {EMPRESA["cidade"]}-{EMPRESA["uf"]}')
    pdf.campo("Area Total Construida", "250,00 m2")
    pdf.campo("Tipo de Ocupacao", "Grupo I - Div. I-2 (Industrial)")
    pdf.campo("Risco de Incendio", "Medio")
    pdf.ln(3)
    pdf.corpo("O Corpo de Bombeiros da Policia Militar do Estado de Sao Paulo, com base no Decreto Estadual No 63.911/2018 e no Regulamento de Seguranca contra Incendio das Edificacoes e Areas de Risco, CERTIFICA que o estabelecimento acima identificado foi vistoriado e atende as exigencias de seguranca contra incendio e panico.")
    pdf.ln(2)
    pdf.subtitulo("MEDIDAS DE SEGURANCA VERIFICADAS")
    pdf.corpo("- Extintores de incendio (ABC) conforme IT-21")
    pdf.corpo("- Sinalizacao de emergencia conforme IT-20")
    pdf.corpo("- Iluminacao de emergencia conforme IT-18")
    pdf.corpo("- Saidas de emergencia conforme IT-11")
    pdf.corpo("- Alarme de incendio conforme IT-19")
    pdf.corpo("- Controle de materiais de acabamento conforme IT-10")
    pdf.corpo("- Brigada de incendio conforme IT-17 (minimo 4 brigadistas treinados)")
    pdf.corpo("- Armazenamento de produtos quimicos conforme IT-25")
    pdf.assinatura("Ten. Cel. PM Roberto Nascimento", "Chefe da Secao de Prevencao - 1o Grupamento de Bombeiros", "Sao Paulo, 05 de marco de 2024")
    pdf.codigo_verificacao("AVCB-2024-SP-034567-CBPMESP-V3K9R")
    pdf.output(f"{OUTPUT_DIR}/bombeiros.pdf")
    print("  [OK] bombeiros.pdf")


def gerar_cnd_federal():
    pdf = DocPDF()
    pdf.add_page()
    pdf.header_orgao("MINISTERIO DA FAZENDA", "Secretaria da Receita Federal do Brasil / Procuradoria-Geral da Fazenda Nacional")
    pdf.titulo("CERTIDAO NEGATIVA DE DEBITOS RELATIVOS AOS TRIBUTOS FEDERAIS E A DIVIDA ATIVA DA UNIAO")
    pdf.ln(3)
    pdf.campo("Certidao No", "0123.4567.8901.2345")
    pdf.campo("Data de Emissao", "01/03/2026")
    pdf.campo("Validade", "27/08/2026 (180 dias)")
    pdf.ln(4)
    pdf.campo("Nome/Razao Social", EMPRESA["razao"])
    pdf.campo("CNPJ", EMPRESA["cnpj"])
    pdf.ln(4)
    pdf.corpo(f'Ressalvado o direito de a Fazenda Nacional cobrar e inscrever quaisquer dividas de responsabilidade do sujeito passivo acima identificado que vierem a ser apuradas, e certificado que NAO CONSTAM pendencias em seu nome, relativas a creditos tributarios administrados pela Secretaria da Receita Federal do Brasil (RFB) e a inscricoes em Divida Ativa da Uniao (DAU) junto a Procuradoria-Geral da Fazenda Nacional (PGFN).')
    pdf.ln(2)
    pdf.corpo("Esta certidao e emitida com base nas informacoes obtidas nos sistemas da RFB e da PGFN e se refere a situacao do contribuinte no ambito da Uniao.")
    pdf.ln(2)
    pdf.corpo("Certidao emitida gratuitamente com base na Portaria Conjunta RFB/PGFN No 1.751, de 02/10/2014.")
    pdf.ln(2)
    pdf.corpo("A aceitacao desta certidao esta condicionada a verificacao de sua autenticidade na Internet, no endereco <http://servicos.receita.fazenda.gov.br>.")
    pdf.assinatura("Sistema Receita Federal", "Emissao Automatica", "Brasilia-DF, 01 de marco de 2026")
    pdf.codigo_verificacao("CND-FED-0123456789012345-RFB-PGFN")
    pdf.output(f"{OUTPUT_DIR}/cnd_federal.pdf")
    print("  [OK] cnd_federal.pdf")


def gerar_cnd_estadual():
    pdf = DocPDF()
    pdf.add_page()
    pdf.header_orgao("SECRETARIA DA FAZENDA E PLANEJAMENTO DO ESTADO DE SAO PAULO", "SEFAZ-SP - Coordenadoria da Administracao Tributaria")
    pdf.titulo("CERTIDAO NEGATIVA DE DEBITOS TRIBUTARIOS NAO INSCRITOS NA DIVIDA ATIVA")
    pdf.ln(3)
    pdf.campo("Certidao No", "CND-SP-2026-0089234")
    pdf.campo("Data de Emissao", "01/03/2026")
    pdf.campo("Validade", "29/05/2026 (90 dias)")
    pdf.ln(4)
    pdf.campo("Razao Social", EMPRESA["razao"])
    pdf.campo("CNPJ", EMPRESA["cnpj"])
    pdf.campo("Inscricao Estadual", EMPRESA["ie"])
    pdf.ln(4)
    pdf.corpo(f'CERTIFICAMOS, com base nos registros deste orgao, que NAO CONSTAM debitos tributarios estaduais NAO INSCRITOS na Divida Ativa, em nome de {EMPRESA["razao"]}, inscrita no CNPJ sob o no {EMPRESA["cnpj"]} e Inscricao Estadual no {EMPRESA["ie"]}.')
    pdf.ln(2)
    pdf.corpo("Esta certidao abrange todos os tributos estaduais administrados pela Secretaria da Fazenda e Planejamento, incluindo ICMS, IPVA e ITCMD.")
    pdf.ln(2)
    pdf.corpo("OBSERVACAO: Esta certidao nao abrange os debitos tributarios inscritos na Divida Ativa do Estado, cuja certidao devera ser requerida junto a Procuradoria Geral do Estado (PGE).")
    pdf.ln(2)
    pdf.corpo("Autenticidade verificavel em: https://www10.fazenda.sp.gov.br/CertidaoNegativaDebito/")
    pdf.assinatura("Sistema SEFAZ-SP", "Emissao Automatica", "Sao Paulo-SP, 01 de marco de 2026")
    pdf.codigo_verificacao("CND-SEFAZ-SP-2026-0089234-KT7R2M")
    pdf.output(f"{OUTPUT_DIR}/cnd_estadual.pdf")
    print("  [OK] cnd_estadual.pdf")


def gerar_cnd_municipal():
    pdf = DocPDF()
    pdf.add_page()
    pdf.header_orgao("PREFEITURA DO MUNICIPIO DE SAO PAULO", "Secretaria Municipal da Fazenda - Departamento de Arrecadacao e Cobranca")
    pdf.titulo("CERTIDAO NEGATIVA DE TRIBUTOS MOBILIARIOS")
    pdf.ln(3)
    pdf.campo("Certidao No", "CCM-2026-SP-0067891")
    pdf.campo("Data de Emissao", "01/03/2026")
    pdf.campo("Validade", "29/05/2026 (90 dias)")
    pdf.ln(4)
    pdf.campo("Razao Social", EMPRESA["razao"])
    pdf.campo("CNPJ", EMPRESA["cnpj"])
    pdf.campo("CCM (Inscricao Municipal)", EMPRESA["im"])
    pdf.campo("Endereco", f'{EMPRESA["endereco"]}, {EMPRESA["bairro"]}')
    pdf.ln(4)
    pdf.corpo(f'CERTIFICO que, consultados os registros desta Secretaria, NAO CONSTAM debitos de tributos mobiliarios (ISS, Taxas de Fiscalizacao, Taxas de Funcionamento) em nome do contribuinte acima identificado, nem como responsavel ou corresponsavel.')
    pdf.ln(2)
    pdf.corpo("A presente certidao refere-se exclusivamente aos tributos mobiliarios municipais e nao abrange os tributos imobiliarios (IPTU, ITBI), cuja certidao devera ser requerida especificamente.")
    pdf.ln(2)
    pdf.corpo("Autenticidade verificavel em: https://ccm.prefeitura.sp.gov.br/CertidaoMobiliaria")
    pdf.assinatura("Sistema SF/PMSP", "Emissao Automatica", "Sao Paulo-SP, 01 de marco de 2026")
    pdf.codigo_verificacao("CND-MUN-SP-2026-0067891-PMSP-WX3N")
    pdf.output(f"{OUTPUT_DIR}/cnd_municipal.pdf")
    print("  [OK] cnd_municipal.pdf")


def gerar_crf_fgts():
    pdf = DocPDF()
    pdf.add_page()
    pdf.header_orgao("CAIXA ECONOMICA FEDERAL", "Fundo de Garantia do Tempo de Servico - FGTS")
    pdf.titulo("CERTIFICADO DE REGULARIDADE DO FGTS - CRF")
    pdf.ln(3)
    pdf.campo("CRF No", "2026031000123456")
    pdf.campo("Data de Emissao", "01/03/2026")
    pdf.campo("Validade", "29/03/2026 (30 dias)")
    pdf.ln(4)
    pdf.campo("Razao Social", EMPRESA["razao"])
    pdf.campo("CNPJ", EMPRESA["cnpj"])
    pdf.campo("Inscricao CEI/CNO", "N/A")
    pdf.ln(4)
    pdf.corpo(f'A Caixa Economica Federal, na qualidade de Agente Operador do FGTS, no uso das atribuicoes que lhe sao conferidas pelo artigo 7o da Lei No 8.036/90, CERTIFICA que o empregador acima identificado encontra-se em situacao REGULAR perante o Fundo de Garantia do Tempo de Servico - FGTS.')
    pdf.ln(2)
    pdf.corpo("O presente Certificado de Regularidade do FGTS - CRF nao sera aceito para nenhum fim quando apresentado via fax ou com rasuras.")
    pdf.ln(2)
    pdf.corpo("A comprovacao de autenticidade pode ser verificada no site da Caixa: https://consulta-crf.caixa.gov.br/")
    pdf.ln(2)
    pdf.corpo("IMPORTANTE: O CRF tem validade de 30 (trinta) dias a contar da data de emissao, conforme legislacao vigente.")
    pdf.assinatura("Sistema FGTS/CEF", "Emissao Automatica", "Brasilia-DF, 01 de marco de 2026")
    pdf.codigo_verificacao("CRF-FGTS-2026-031000123456-CEF")
    pdf.output(f"{OUTPUT_DIR}/crf_fgts.pdf")
    print("  [OK] crf_fgts.pdf")


def gerar_cndt_trabalhista():
    pdf = DocPDF()
    pdf.add_page()
    pdf.header_orgao("PODER JUDICIARIO - JUSTICA DO TRABALHO", "Tribunal Superior do Trabalho - Conselho Superior da Justica do Trabalho")
    pdf.titulo("CERTIDAO NEGATIVA DE DEBITOS TRABALHISTAS - CNDT")
    pdf.ln(3)
    pdf.campo("Certidao No", "CNDT-100234567/2026")
    pdf.campo("Data de Emissao", "01/03/2026")
    pdf.campo("Validade", "27/08/2026 (180 dias)")
    pdf.ln(4)
    pdf.campo("Razao Social", EMPRESA["razao"])
    pdf.campo("CNPJ", EMPRESA["cnpj"])
    pdf.ln(4)
    pdf.corpo(f'CERTIFICO que NAO EXISTEM debitos pendentes de pagamento no Banco Nacional de Devedores Trabalhistas em nome de {EMPRESA["razao"]}, inscrita no CNPJ sob o no {EMPRESA["cnpj"]}.')
    pdf.ln(2)
    pdf.corpo("Esta certidao e expedida nos termos do Titulo VII-A da Consolidacao das Leis do Trabalho, acrescentado pela Lei No 12.440, de 7 de julho de 2011.")
    pdf.ln(2)
    pdf.corpo("Certidao emitida com base no art. 642-A da CLT. A aceitacao desta certidao esta condicionada a verificacao de autenticidade no portal: https://www.tst.jus.br/certidao")
    pdf.ln(2)
    pdf.corpo("OBSERVACAO: A presente certidao nao serve como prova de inexistencia de acoes trabalhistas em curso ou de condenacoes transitadas em julgado com debitos ainda nao exigiveis.")
    pdf.assinatura("Sistema BNDT/TST", "Emissao Automatica", "Brasilia-DF, 01 de marco de 2026")
    pdf.codigo_verificacao("CNDT-100234567-2026-TST-BNDT-P5RT")
    pdf.output(f"{OUTPUT_DIR}/cndt_trabalhista.pdf")
    print("  [OK] cndt_trabalhista.pdf")


def gerar_atestado_capacidade():
    pdf = DocPDF()
    pdf.add_page()
    pdf.header_orgao("HOSPITAL DAS CLINICAS DA FACULDADE DE MEDICINA DA USP", "Divisao de Laboratorio Central - DLC/HCFMUSP")
    pdf.titulo("ATESTADO DE CAPACIDADE TECNICA")
    pdf.ln(3)
    pdf.campo("No do Atestado", "ACT-DLC-2024/0089")
    pdf.campo("Referencia", "Contrato No 2023/0456 - HC/FMUSP")
    pdf.campo("Data", "15/12/2024")
    pdf.ln(4)
    pdf.corpo(f'O Hospital das Clinicas da Faculdade de Medicina da Universidade de Sao Paulo, por intermedio da Divisao de Laboratorio Central, ATESTA para os devidos fins que a empresa {EMPRESA["razao"]}, inscrita no CNPJ sob o no {EMPRESA["cnpj"]}, com sede na {EMPRESA["endereco"]}, {EMPRESA["cidade"]}-{EMPRESA["uf"]}, executou e/ou vem executando satisfatoriamente os servicos e fornecimentos abaixo descritos:')
    pdf.ln(3)
    pdf.subtitulo("OBJETO DO CONTRATO")
    pdf.corpo("Fornecimento de reagentes para diagnostico in vitro e equipamentos em regime de comodato para o Laboratorio Central do HC/FMUSP, conforme especificacoes:")
    pdf.ln(2)
    pdf.corpo("1. Analisador hematologico automatizado Sysmex XN-1000, com capacidade de 100 amostras/hora, incluindo reagentes de linha completa (diluente, lisante, corante, limpeza).")
    pdf.corpo("2. Analisador bioquimico Mindray BS-240, com capacidade de 200 testes/hora, incluindo reagentes para 45 analitos (glicose, colesterol, TGO, TGP, creatinina, ureia, acido urico, entre outros).")
    pdf.corpo("3. Assistencia tecnica preventiva e corretiva com SLA de 4 horas para atendimento.")
    pdf.corpo("4. Treinamento da equipe tecnica do laboratorio (40 horas).")
    pdf.ln(2)
    pdf.subtitulo("PERIODO DE EXECUCAO")
    pdf.corpo("De 01/01/2023 a 31/12/2024 (24 meses)")
    pdf.ln(1)
    pdf.subtitulo("VALOR TOTAL DO CONTRATO")
    pdf.corpo("R$ 3.850.000,00 (tres milhoes, oitocentos e cinquenta mil reais)")
    pdf.ln(1)
    pdf.subtitulo("AVALIACAO DO DESEMPENHO")
    pdf.corpo("A empresa demonstrou excelente desempenho na execucao do contrato, com: (a) entregas dentro do prazo; (b) qualidade dos reagentes em conformidade com as especificacoes tecnicas; (c) assistencia tecnica eficiente com tempo medio de resposta de 2,5 horas; (d) zero interrupcoes de servico por falha de fornecimento.")
    pdf.assinatura("Prof. Dr. Jose Eduardo Levi", "Diretor da Divisao de Laboratorio Central - DLC/HCFMUSP\nCRM-SP 78.456 | CRF-SP 12.345", "Sao Paulo, 15 de dezembro de 2024")
    pdf.output(f"{OUTPUT_DIR}/atestado_capacidade.pdf")
    print("  [OK] atestado_capacidade.pdf")


def gerar_registro_conselho():
    pdf = DocPDF()
    pdf.add_page()
    pdf.header_orgao("CONSELHO REGIONAL DE QUIMICA - IV REGIAO", "CRQ-IV (Sao Paulo e Mato Grosso do Sul)")
    pdf.titulo("CERTIFICADO DE REGISTRO DE PESSOA JURIDICA")
    pdf.ln(3)
    pdf.campo("Registro No", "CRQ-IV PJ 04-056789")
    pdf.campo("Data de Registro", "20/06/2022")
    pdf.campo("Validade do Registro", "31/12/2026 (anuidade vigente)")
    pdf.campo("Situacao", "REGULAR")
    pdf.ln(4)
    pdf.subtitulo("DADOS DA EMPRESA")
    pdf.campo("Razao Social", EMPRESA["razao"])
    pdf.campo("CNPJ", EMPRESA["cnpj"])
    pdf.campo("Endereco", f'{EMPRESA["endereco"]}, {EMPRESA["cidade"]}-{EMPRESA["uf"]}')
    pdf.ln(3)
    pdf.subtitulo("RESPONSAVEL TECNICO")
    pdf.campo("Nome", EMPRESA["responsavel_tecnico"])
    pdf.campo("CRQ", EMPRESA["crq_rt"])
    pdf.campo("Categoria", "Quimico Industrial")
    pdf.campo("Habilitacao", "Quimica Analitica, Controle de Qualidade, Producao de Reagentes")
    pdf.ln(3)
    pdf.subtitulo("ATIVIDADES REGISTRADAS")
    pdf.corpo("A empresa esta registrada para exercer as seguintes atividades quimicas:")
    pdf.corpo("- Fabricacao de reagentes quimicos para diagnostico in vitro")
    pdf.corpo("- Controle de qualidade de produtos quimicos")
    pdf.corpo("- Armazenagem e distribuicao de produtos quimicos")
    pdf.corpo("- Pesquisa e desenvolvimento de novos reagentes")
    pdf.ln(2)
    pdf.corpo(f"O Conselho Regional de Quimica - IV Regiao CERTIFICA que a empresa {EMPRESA['razao']} encontra-se devidamente registrada neste Conselho e com as anuidades em dia, estando apta a exercer as atividades quimicas acima descritas.")
    pdf.assinatura("Dr. Alexandre Costa Pereira", "Presidente do CRQ-IV Regiao", "Sao Paulo, 02 de janeiro de 2026")
    pdf.codigo_verificacao("CRQ4-PJ-056789-2026-VALIDO-RT9K")
    pdf.output(f"{OUTPUT_DIR}/registro_conselho.pdf")
    print("  [OK] registro_conselho.pdf")


def gerar_balanco():
    pdf = DocPDF()
    pdf.add_page()
    pdf.header_orgao(EMPRESA["razao"], f'CNPJ: {EMPRESA["cnpj"]}')
    pdf.titulo("BALANCO PATRIMONIAL - EXERCICIO 2025")
    pdf.ln(2)
    pdf.corpo("Balanco Patrimonial levantado em 31 de dezembro de 2025, elaborado em conformidade com a Lei No 6.404/76 e suas alteracoes, e com as Normas Brasileiras de Contabilidade (NBC).")
    pdf.ln(3)

    pdf.subtitulo("ATIVO")
    pdf.set_font("Courier", "", 10)
    ativos = [
        ("ATIVO CIRCULANTE", "", ""),
        ("  Caixa e Equivalentes de Caixa", "R$   1.245.678,90", "R$     987.654,32"),
        ("  Contas a Receber", "R$   2.356.789,01", "R$   1.876.543,21"),
        ("  Estoques", "R$   1.567.890,12", "R$   1.234.567,89"),
        ("  Tributos a Recuperar", "R$     345.678,90", "R$     278.901,23"),
        ("  Outros Creditos", "R$     189.012,34", "R$     156.789,01"),
        ("  TOTAL CIRCULANTE", "R$   5.705.049,27", "R$   4.534.455,66"),
        ("", "", ""),
        ("ATIVO NAO CIRCULANTE", "", ""),
        ("  Imobilizado", "R$   3.456.789,01", "R$   2.987.654,32"),
        ("  Intangivel", "R$     890.123,45", "R$     678.901,23"),
        ("  Investimentos", "R$     234.567,89", "R$     198.765,43"),
        ("  TOTAL NAO CIRCULANTE", "R$   4.581.480,35", "R$   3.865.320,98"),
        ("", "", ""),
        ("TOTAL DO ATIVO", "R$  10.286.529,62", "R$   8.399.776,64"),
    ]
    pdf.cell(90, 5, "Descricao", border="B")
    pdf.cell(50, 5, "2025", border="B", align="R")
    pdf.cell(50, 5, "2024", border="B", align="R", new_x="LMARGIN", new_y="NEXT")
    for desc, v2025, v2024 in ativos:
        bold = desc.strip().startswith("TOTAL") or desc.strip().startswith("ATIVO")
        if bold:
            pdf.set_font("Courier", "B", 10)
        else:
            pdf.set_font("Courier", "", 10)
        pdf.cell(90, 5, desc)
        pdf.cell(50, 5, v2025, align="R")
        pdf.cell(50, 5, v2024, align="R", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    pdf.subtitulo("PASSIVO E PATRIMONIO LIQUIDO")
    pdf.set_font("Courier", "", 10)
    passivos = [
        ("PASSIVO CIRCULANTE", "", ""),
        ("  Fornecedores", "R$   1.234.567,89", "R$     987.654,32"),
        ("  Obrigacoes Trabalhistas", "R$     567.890,12", "R$     456.789,01"),
        ("  Obrigacoes Tributarias", "R$     345.678,90", "R$     289.012,34"),
        ("  Emprestimos CP", "R$     456.789,01", "R$     378.901,23"),
        ("  TOTAL CIRCULANTE", "R$   2.604.925,92", "R$   2.112.356,90"),
        ("", "", ""),
        ("PASSIVO NAO CIRCULANTE", "", ""),
        ("  Emprestimos LP", "R$   1.234.567,89", "R$   1.567.890,12"),
        ("  Provisoes", "R$     234.567,89", "R$     198.765,43"),
        ("  TOTAL NAO CIRCULANTE", "R$   1.469.135,78", "R$   1.766.655,55"),
        ("", "", ""),
        ("PATRIMONIO LIQUIDO", "", ""),
        ("  Capital Social", "R$   2.500.000,00", "R$   2.500.000,00"),
        ("  Reservas de Lucros", "R$   2.456.789,01", "R$   1.234.567,89"),
        ("  Lucros Acumulados", "R$   1.255.678,91", "R$     786.196,30"),
        ("  TOTAL PL", "R$   6.212.467,92", "R$   4.520.764,19"),
        ("", "", ""),
        ("TOTAL PASSIVO + PL", "R$  10.286.529,62", "R$   8.399.776,64"),
    ]
    pdf.cell(90, 5, "Descricao", border="B")
    pdf.cell(50, 5, "2025", border="B", align="R")
    pdf.cell(50, 5, "2024", border="B", align="R", new_x="LMARGIN", new_y="NEXT")
    for desc, v2025, v2024 in passivos:
        bold = desc.strip().startswith("TOTAL") or desc.strip().startswith("PASSIVO") or desc.strip().startswith("PATRIMONIO")
        if bold:
            pdf.set_font("Courier", "B", 10)
        else:
            pdf.set_font("Courier", "", 10)
        pdf.cell(90, 5, desc)
        pdf.cell(50, 5, v2025, align="R")
        pdf.cell(50, 5, v2024, align="R", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(8)
    pdf.set_font("Helvetica", "", 9)
    pdf.corpo("As demonstracoes contabeis foram elaboradas em conformidade com as praticas contabeis adotadas no Brasil (BR GAAP) e aprovadas pela Assembleia de Socios em 28/02/2026.")
    pdf.ln(3)

    pdf.set_font("Helvetica", "", 10)
    # Duas assinaturas lado a lado
    y = pdf.get_y() + 10
    pdf.line(25, y, 85, y)
    pdf.line(125, y, 185, y)
    pdf.set_y(y + 2)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(95, 5, EMPRESA["socio1"], align="C")
    pdf.cell(95, 5, "Paulo Henrique Martins", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8)
    pdf.cell(95, 4, "Socio Administrador", align="C")
    pdf.cell(95, 4, "Contador - CRC-SP 1SP-234567/O-8", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.output(f"{OUTPUT_DIR}/balanco_patrimonial.pdf")
    print("  [OK] balanco_patrimonial.pdf")


if __name__ == "__main__":
    print(f"Gerando 15 PDFs simulados em {OUTPUT_DIR}/...")
    print()
    print("=== DOCUMENTOS DA EMPRESA ===")
    gerar_contrato_social()
    gerar_alvara()
    gerar_procuracao()
    gerar_afe_anvisa()
    gerar_cbpad()
    gerar_cbpp()
    gerar_bombeiros()
    print()
    print("=== CERTIDOES FISCAIS ===")
    gerar_cnd_federal()
    gerar_cnd_estadual()
    gerar_cnd_municipal()
    gerar_crf_fgts()
    gerar_cndt_trabalhista()
    print()
    print("=== QUALIFICACAO TECNICA ===")
    gerar_atestado_capacidade()
    gerar_registro_conselho()
    gerar_balanco()
    print()
    print(f"Pronto! {len(os.listdir(OUTPUT_DIR))} PDFs gerados em {OUTPUT_DIR}/")
