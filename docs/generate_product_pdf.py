from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER

OUTPUT = "/Users/robertocorradino/property-operations-manager/app/docs/PropOps_Product_Overview.pdf"

DARK = colors.HexColor("#1C1C1E")
ACCENT = colors.HexColor("#0A84FF")
LIGHT_BG = colors.HexColor("#F2F2F7")
GRAY = colors.HexColor("#6C6C70")
WHITE = colors.white

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    leftMargin=2.5*cm,
    rightMargin=2.5*cm,
    topMargin=2.5*cm,
    bottomMargin=2.5*cm,
)

styles = getSampleStyleSheet()

title_style = ParagraphStyle("title", fontSize=28, textColor=WHITE, fontName="Helvetica-Bold", leading=34, alignment=TA_LEFT)
subtitle_style = ParagraphStyle("subtitle", fontSize=13, textColor=colors.HexColor("#EBEBF5"), fontName="Helvetica", leading=18, alignment=TA_LEFT)
h2_style = ParagraphStyle("h2", fontSize=15, textColor=ACCENT, fontName="Helvetica-Bold", leading=20, spaceBefore=18, spaceAfter=6)
h3_style = ParagraphStyle("h3", fontSize=12, textColor=DARK, fontName="Helvetica-Bold", leading=16, spaceBefore=10, spaceAfter=4)
body_style = ParagraphStyle("body", fontSize=10, textColor=DARK, fontName="Helvetica", leading=15, spaceAfter=4)
bullet_style = ParagraphStyle("bullet", fontSize=10, textColor=DARK, fontName="Helvetica", leading=15, leftIndent=14, spaceAfter=3, bulletIndent=0)
label_style = ParagraphStyle("label", fontSize=9, textColor=GRAY, fontName="Helvetica", leading=13)
bold_body = ParagraphStyle("bold_body", fontSize=10, textColor=DARK, fontName="Helvetica-Bold", leading=15)

story = []

# ── COVER ──────────────────────────────────────────────────────────────────
cover_data = [[
    Table(
        [[Paragraph("PropOps", title_style)],
         [Paragraph("Product Overview", subtitle_style)],
         [Spacer(1, 8)],
         [Paragraph("Documento di presentazione del prodotto", label_style)]],
        colWidths=[14*cm],
        style=TableStyle([("BACKGROUND", (0,0), (-1,-1), DARK),
                          ("LEFTPADDING", (0,0), (-1,-1), 0),
                          ("TOPPADDING", (0,0), (0,0), 0)])
    )
]]
cover_table = Table(cover_data, colWidths=[16*cm])
cover_table.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), DARK),
    ("LEFTPADDING", (0,0), (-1,-1), 20),
    ("RIGHTPADDING", (0,0), (-1,-1), 20),
    ("TOPPADDING", (0,0), (-1,-1), 30),
    ("BOTTOMPADDING", (0,0), (-1,-1), 30),
    ("ROUNDEDCORNERS", (0,0), (-1,-1), 10),
]))
story.append(cover_table)
story.append(Spacer(1, 24))

def section(title):
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_BG, spaceAfter=4))
    story.append(Paragraph(title, h2_style))

def bullet(text):
    story.append(Paragraph(f"&bull;&nbsp;&nbsp;{text}", bullet_style))

def body(text):
    story.append(Paragraph(text, body_style))

def spacer():
    story.append(Spacer(1, 8))

# ── 1. IL PROBLEMA ─────────────────────────────────────────────────────────
section("1. Il problema")
body("Gestire appartamenti turistici in modo professionale significa coordinare ogni giorno pulizie, manutenzioni, check-in, check-out e comunicazioni tra persone diverse — manager, addetti alle pulizie, manutentori, supervisori e proprietari.")
spacer()
body("La maggior parte delle aziende del settore gestisce queste operazioni con WhatsApp, fogli Excel e chiamate telefoniche. Il risultato è informazione dispersa, errori operativi, appartamenti non pronti in tempo e impossibilità di scalare.")

# ── 2. LA SOLUZIONE ────────────────────────────────────────────────────────
section("2. La soluzione")
body("<b>PropOps</b> è un'app mobile per la gestione operativa di appartamenti turistici. Centralizza tutto il lavoro operativo in un'unica piattaforma: ogni ruolo ha la propria dashboard, vede solo quello che gli serve e sa esattamente cosa fare.")
spacer()
body("Il manager vede lo stato di tutti gli appartamenti in tempo reale. Il cleaner riceve la pulizia sul telefono con checklist e istruzioni. Il manutentore gestisce i ticket. Il supervisore approva i lavori. Il proprietario segue il calendario in sola lettura.")

# ── 3. FUNZIONALITÀ ────────────────────────────────────────────────────────
section("3. Funzionalità principali")
features = [
    ("Calendario operativo", "stato di tutti gli appartamenti in tempo reale: pronto, in pulizia, occupato, in manutenzione"),
    ("Gestione pulizie", "assegnazione, checklist personalizzabile, foto, avanzamento, revisione e approvazione"),
    ("Gestione manutenzioni", "ticket con priorità, messaggi, allegati, ciclo di revisione"),
    ("Import prenotazioni", "sincronizzazione automatica da Airbnb, Booking.com e qualsiasi fonte iCal"),
    ("Assistente AI", "supporto operativo contestuale e ricerca web esterna con citazione delle fonti"),
    ("Gestione biancheria", "calcolo automatico di lenzuola, federe e copripiumino in base al tipo di letto e al numero di ospiti"),
    ("Gestione prodotti e forniture", "catalogo personalizzabile per appartamento con scorte, soglie minime e consumo automatico al check-in"),
    ("Multilingua", "interfaccia disponibile in più lingue per team internazionali"),
    ("Notifiche push", "aggiornamenti in tempo reale su iOS e Android"),
    ("Analytics", "statistiche su pulizie e manutenzioni per appartamento e per operatore"),
]
for label, desc in features:
    story.append(Paragraph(f"<b>{label}</b> — {desc}", bullet_style))

# ── 4. RUOLI ───────────────────────────────────────────────────────────────
section("4. Ruoli e utenti")
roles_data = [
    [Paragraph("<b>Ruolo</b>", bold_body), Paragraph("<b>Chi è</b>", bold_body)],
    [Paragraph("Manager", body_style), Paragraph("Responsabile operativo — supervisione completa", body_style)],
    [Paragraph("Supervisor", body_style), Paragraph("Controlla e approva i lavori del team", body_style)],
    [Paragraph("Cleaner", body_style), Paragraph("Addetto alle pulizie — lavora da mobile", body_style)],
    [Paragraph("Maintenance", body_style), Paragraph("Manutentore — gestisce i ticket di intervento", body_style)],
    [Paragraph("Owner", body_style), Paragraph("Proprietario — visibilità read-only sul proprio immobile", body_style)],
]
roles_table = Table(roles_data, colWidths=[5*cm, 11*cm])
roles_table.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), DARK),
    ("TEXTCOLOR", (0,0), (-1,0), WHITE),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, LIGHT_BG]),
    ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#D1D1D6")),
    ("LEFTPADDING", (0,0), (-1,-1), 8),
    ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ("TOPPADDING", (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
]))
story.append(roles_table)

# ── 5. TARGET ──────────────────────────────────────────────────────────────
section("5. Target di mercato")
story.append(Paragraph("<b>Clienti primari:</b>", bold_body))
for t in ["Property manager professionisti con più appartamenti in gestione",
          "Agenzie di affitti brevi (short-term rental)",
          "Società di pulizie che operano per conto terzi",
          "Singoli proprietari con un portfolio di appartamenti"]:
    bullet(t)
spacer()
story.append(Paragraph("<b>Clienti secondari / integrazioni:</b>", bold_body))
for t in ["Property Management System (PMS) già esistenti che cercano un modulo operativo",
          "Piattaforme di gestione immobiliare che vogliono aggiungere funzionalità operative"]:
    bullet(t)

# ── 6. MERCATI ─────────────────────────────────────────────────────────────
section("6. Mercati geografici")
body("Attualmente attivo in <b>Italia</b>. Espansione pianificata in:")
bullet("<b>Spagna</b>")
bullet("<b>Regno Unito</b>")
spacer()
body("L'app è progettata per essere multilingua e multi-organizzazione, pronta per la crescita internazionale.")

# ── 7. MODELLO DI BUSINESS ─────────────────────────────────────────────────
section("7. Modello di business")
story.append(Paragraph("<b>SaaS (Software as a Service)</b>", bold_body))
body("Abbonamento mensile per organizzazione, scalabile in base al numero di appartamenti o utenti.")
spacer()
story.append(Paragraph("<b>Modelli alternativi esplorabili:</b>", bold_body))
bullet("<b>White label</b> — la piattaforma viene personalizzata con il brand del cliente")
bullet("<b>Integrazione con PMS</b> — PropOps come modulo operativo da integrare in sistemi già esistenti (Lodgify, Guesty, Hostaway, ecc.)")

# ── 8. STATO DEL PRODOTTO ──────────────────────────────────────────────────
section("8. Stato del prodotto")
bullet("<b>In produzione</b> — utilizzato da clienti reali")
bullet("App nativa disponibile su <b>iOS</b> e <b>Android</b>")
bullet("Backend deployato su <b>Vercel</b> con database PostgreSQL")
bullet("Architettura multi-tenant: ogni organizzazione è completamente isolata")

# ── 9. ASSISTENTE AI ───────────────────────────────────────────────────────
section("9. Assistente AI")
body("L'assistente AI integrato in PropOps non è un chatbot generico — conosce il contesto operativo reale dell'organizzazione: appartamenti, prenotazioni, pulizie in corso e storico manutenzioni.")
spacer()
story.append(Paragraph("<b>Cosa può fare:</b>", bold_body))
bullet("Rispondere a domande operative sugli appartamenti e sullo stato dei lavori")
bullet("Effettuare ricerche web esterne tramite Perplexity, con citazione delle fonti")
bullet("Supportare cleaner e manutentori durante il lavoro sul campo")
spacer()
story.append(Paragraph("<b>Limiti per organizzazione:</b>", bold_body))
body("Ogni organizzazione ha un limite mensile configurabile di token AI e di ricerche web. Il contatore si azzera automaticamente il 1° di ogni mese. Il superadmin può configurare i limiti per ogni cliente.")

# ── 10. BIANCHERIA E PRODOTTI ──────────────────────────────────────────────
section("10. Gestione biancheria e prodotti")
story.append(Paragraph("<b>Biancheria</b>", h3_style))
body("Il sistema calcola automaticamente la biancheria necessaria per ogni pulizia in base a:")
bullet("tipo e numero di letti dell'appartamento (matrimoniali, singoli, divani)")
bullet("numero di ospiti della prenotazione")
bullet("presenza di culla")
spacer()
body("La configurazione dei letti è completamente personalizzabile per ogni appartamento. Il cleaner vede direttamente nella checklist quante lenzuola, federe e copripiumini preparare.")
spacer()
story.append(Paragraph("<b>Prodotti e forniture</b>", h3_style))
body("Ogni appartamento ha un catalogo prodotti completamente personalizzabile (es. sapone, shampoo, caffè, carta igienica). Per ogni prodotto si configurano:")
bullet("<b>Unità di misura</b> (pz, ml, rotoli, ecc.)")
bullet("<b>Scorta attuale</b> e <b>soglia minima</b> — sotto questa quantità scatta un alert")
bullet("<b>Tipo di consumo</b>: fisso oppure dinamico per ospite")
spacer()
body("Al momento del check-in le scorte vengono scalate automaticamente. Se un prodotto scende sotto la soglia minima, il manager riceve una notifica push in tempo reale.")

# ── 11. DIFFERENZIATORI ────────────────────────────────────────────────────
section("11. Differenziatori")
diff_data = [
    ["App nativa mobile-first", "Progettata per chi lavora sul campo, non davanti a un computer"],
    ["Ciclo di revisione integrato", "Il supervisore approva, rifiuta e richiede correzioni con foto direttamente nell'app"],
    ["Assistente AI contestuale", "Conosce appartamenti, prenotazioni e storia operativa"],
    ["Biancheria e scorte automatiche", "Nessun calcolo manuale, tutto si aggiorna in base agli ospiti"],
    ["Multi-organizzazione", "Ogni cliente ha il proprio ambiente isolato, pronto per il white label"],
    ["Nessun WhatsApp", "Tutta la comunicazione operativa avviene dentro la piattaforma"],
]
diff_table = Table(
    [[Paragraph(f"<b>{r[0]}</b>", body_style), Paragraph(r[1], body_style)] for r in diff_data],
    colWidths=[5.5*cm, 10.5*cm]
)
diff_table.setStyle(TableStyle([
    ("ROWBACKGROUNDS", (0,0), (-1,-1), [WHITE, LIGHT_BG]),
    ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#D1D1D6")),
    ("LEFTPADDING", (0,0), (-1,-1), 8),
    ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ("TOPPADDING", (0,0), (-1,-1), 7),
    ("BOTTOMPADDING", (0,0), (-1,-1), 7),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
]))
story.append(diff_table)

# ── 12. CONTATTI ───────────────────────────────────────────────────────────
section("12. Contatti")
body("Per informazioni commerciali, partnership o integrazioni contattare il team PropOps.")

doc.build(story)
print(f"PDF creato: {OUTPUT}")
