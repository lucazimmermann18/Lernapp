export const BUSINESS_VOCABULARY_LEVELS = [
  'Business Basics',
  'Office & Meetings',
  'Sales & Customers',
  'Marketing',
  'Finance',
  'Operations',
  'Management',
  'Strategy',
  'Legal & International Trade',
  'Advanced Business English'
];

const term = (english, german, simple, business, exampleEn, exampleDe, tags) => ({
  id: english.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  english,
  german,
  simple,
  business,
  exampleEn,
  exampleDe,
  tags,
  reviewStatus: 'new'
});

export const businessVocabularyUnits = [
  {
    id: 'business-unit-001',
    number: 1,
    level: 1,
    title: 'Business Basics 1',
    description: 'Grundbegriffe, die in fast jedem Business-Kontext vorkommen.',
    terms: [
      term('company','Unternehmen','Eine Organisation, die etwas anbietet oder verkauft.','Company ist ein allgemeines Wort für Firmen jeder Größe.','The company sells software.','Das Unternehmen verkauft Software.',['basics','company']),
      term('customer','Kunde','Jemand, der etwas kauft.','Customer meint Käufer oder Nutzer eines Angebots.','The customer needs support.','Der Kunde braucht Unterstützung.',['basics','sales']),
      term('product','Produkt','Etwas, das verkauft wird.','Product kann Ware, App, Kurs oder Servicepaket sein.','This product is easy to use.','Dieses Produkt ist leicht zu benutzen.',['basics','offer']),
      term('service','Dienstleistung','Arbeit oder Hilfe, die angeboten wird.','Service beschreibt immaterielle Leistungen wie Beratung oder Support.','We offer a fast service.','Wir bieten eine schnelle Dienstleistung an.',['basics','offer']),
      term('price','Preis','Der Betrag, den etwas kostet.','Price ist der angebotene oder vereinbarte Verkaufspreis.','The price is too high.','Der Preis ist zu hoch.',['basics','pricing']),
      term('cost','Kosten','Geld, das ausgegeben wird.','Cost beschreibt Aufwand für Einkauf, Produktion oder Betrieb.','The cost is lower than expected.','Die Kosten sind niedriger als erwartet.',['basics','finance']),
      term('profit','Gewinn','Geld, das nach den Kosten übrig bleibt.','Profit zeigt, ob ein Geschäft wirtschaftlich erfolgreich ist.','The project made a profit.','Das Projekt hat Gewinn gemacht.',['basics','finance']),
      term('revenue','Umsatz','Geld, das durch Verkäufe hereinkommt.','Revenue sind Einnahmen vor Abzug der Kosten.','Revenue increased this month.','Der Umsatz ist diesen Monat gestiegen.',['basics','finance']),
      term('market','Markt','Der Bereich, in dem Käufer und Anbieter zusammenkommen.','Market beschreibt Nachfrage, Kunden und Wettbewerb.','The market is growing.','Der Markt wächst.',['basics','strategy']),
      term('demand','Nachfrage','Wie stark etwas gekauft werden will.','Demand zeigt, ob Kunden ein Angebot brauchen.','Demand is high.','Die Nachfrage ist hoch.',['basics','market']),
      term('supply','Angebot','Was verfügbar ist oder geliefert werden kann.','Supply beschreibt verfügbare Menge und Lieferfähigkeit.','Supply is limited.','Das Angebot ist begrenzt.',['basics','operations']),
      term('order','Bestellung','Eine Kaufanfrage oder ein Kaufauftrag.','Order wird für Kundenbestellungen und Einkaufsaufträge genutzt.','We received an order.','Wir haben eine Bestellung erhalten.',['basics','sales']),
      term('invoice','Rechnung','Ein Dokument mit Betrag und Zahlungsdaten.','Invoice wird nach Leistung oder Lieferung zur Zahlung gesendet.','Please send the invoice.','Bitte sende die Rechnung.',['basics','finance']),
      term('payment','Zahlung','Das Bezahlen einer Rechnung.','Payment beschreibt den Geldtransfer zwischen Parteien.','The payment is due today.','Die Zahlung ist heute fällig.',['basics','finance']),
      term('supplier','Lieferant','Eine Firma oder Person, die etwas liefert.','Supplier ist wichtig für Einkauf, Qualität und Liefertermine.','We need a reliable supplier.','Wir brauchen einen zuverlässigen Lieferanten.',['basics','operations']),
      term('partner','Partner','Jemand, mit dem man zusammenarbeitet.','Partner beschreibt operative oder strategische Zusammenarbeit.','Our partner handles delivery.','Unser Partner übernimmt die Lieferung.',['basics','relationship']),
      term('contract','Vertrag','Eine verbindliche Vereinbarung.','Contract legt Pflichten, Preise, Laufzeiten und Risiken fest.','The contract starts tomorrow.','Der Vertrag beginnt morgen.',['basics','legal']),
      term('deadline','Frist','Ein Zeitpunkt, bis zu dem etwas fertig sein muss.','Deadline steuert Aufgaben, Lieferungen und Entscheidungen.','The deadline is Friday.','Die Frist ist Freitag.',['basics','planning']),
      term('meeting','Besprechung','Ein Termin, bei dem Menschen etwas besprechen.','Meeting dient Abstimmung, Entscheidung oder Statusklärung.','We have a meeting at nine.','Wir haben um neun eine Besprechung.',['basics','office']),
      term('decision','Entscheidung','Eine gewählte Option.','Decision ist eine verbindliche geschäftliche Festlegung.','We need a decision today.','Wir brauchen heute eine Entscheidung.',['basics','management'])
    ]
  },
  {
    id: 'business-unit-002',
    number: 2,
    level: 2,
    title: 'Office & Meetings 1',
    description: 'Wörter für Termine, Abstimmung, E-Mail und Bürokommunikation.',
    terms: [
      term('agenda','Tagesordnung','Eine Liste der Themen für ein Meeting.','Agenda hält ein Meeting strukturiert und fokussiert.','The agenda has three items.','Die Tagesordnung hat drei Punkte.',['office','meeting']),
      term('minutes','Protokoll','Notizen über Entscheidungen und Ergebnisse.','Minutes dokumentieren Beschlüsse, Aufgaben und Verantwortliche.','Please share the minutes.','Bitte teile das Protokoll.',['office','meeting']),
      term('schedule','Zeitplan','Eine geplante Reihenfolge von Terminen.','Schedule koordiniert Meetings, Lieferungen und Projektphasen.','The schedule is tight.','Der Zeitplan ist eng.',['office','planning']),
      term('appointment','Termin','Eine vereinbarte Zeit für ein Treffen.','Appointment wird oft für Kunden- oder Arzttermine genutzt.','I have an appointment.','Ich habe einen Termin.',['office','calendar']),
      term('availability','Verfügbarkeit','Ob jemand Zeit hat oder etwas verfügbar ist.','Availability betrifft Personen, Ressourcen und Produkte.','What is your availability?','Wie ist deine Verfügbarkeit?',['office','planning']),
      term('follow-up','Nachfassen','Eine weitere Nachricht nach einem Kontakt.','Follow-up hält Gespräche und Verkaufsprozesse in Bewegung.','I will send a follow-up.','Ich werde nachfassen.',['office','communication']),
      term('summary','Zusammenfassung','Eine kurze Darstellung der wichtigsten Punkte.','Summary macht komplexe Informationen schnell verständlich.','Here is a short summary.','Hier ist eine kurze Zusammenfassung.',['office','reporting']),
      term('note','Notiz','Eine kurze schriftliche Information.','Note hält kleine Informationen oder Beobachtungen fest.','I added a note.','Ich habe eine Notiz hinzugefügt.',['office','documentation']),
      term('document','Dokument','Eine Datei mit Informationen.','Document kann Vertrag, Bericht oder Angebot sein.','Please review the document.','Bitte prüfe das Dokument.',['office','documentation']),
      term('attachment','Anhang','Eine Datei, die einer E-Mail beigefügt ist.','Attachment wird für Rechnungen, Angebote und Nachweise genutzt.','The file is in the attachment.','Die Datei ist im Anhang.',['office','email']),
      term('inbox','Posteingang','Der Ort, an dem neue E-Mails ankommen.','Inbox ist wichtig für Kommunikation und Aufgabensteuerung.','My inbox is full.','Mein Posteingang ist voll.',['office','email']),
      term('draft','Entwurf','Eine noch nicht finale Version.','Draft ist eine Arbeitsversion vor Prüfung oder Freigabe.','This is a first draft.','Das ist ein erster Entwurf.',['office','writing']),
      term('revision','Überarbeitung','Eine geänderte Version.','Revision beschreibt Anpassung nach Feedback oder Prüfung.','The text needs a revision.','Der Text braucht eine Überarbeitung.',['office','review']),
      term('approval process','Freigabeprozess','Der Ablauf, um Zustimmung zu bekommen.','Approval process schützt Qualität, Budget und Verantwortung.','The approval process is simple.','Der Freigabeprozess ist einfach.',['office','governance']),
      term('status update','Statusmeldung','Eine kurze Information über den aktuellen Stand.','Status update zeigt Fortschritt, Blocker und nächste Schritte.','Send a status update.','Sende eine Statusmeldung.',['office','reporting']),
      term('action item','Aufgabe aus einem Meeting','Eine konkrete Aufgabe nach einem Meeting.','Action item verbindet Gespräch mit Umsetzung.','Each action item needs an owner.','Jede Aufgabe braucht einen Verantwortlichen.',['office','meeting']),
      term('owner','Verantwortlicher','Die Person, die für etwas zuständig ist.','Owner meint die Person mit Ergebnisverantwortung.','Who is the owner?','Wer ist verantwortlich?',['office','management']),
      term('alignment','Abstimmung','Gemeinsames Verständnis über Ziel und Vorgehen.','Alignment verhindert Missverständnisse zwischen Teams.','We need alignment first.','Wir brauchen zuerst Abstimmung.',['office','team']),
      term('decision maker','Entscheider','Die Person, die entscheiden darf.','Decision maker ist besonders im Vertrieb wichtig.','Who is the decision maker?','Wer ist der Entscheider?',['office','sales']),
      term('availability check','Verfügbarkeitsprüfung','Eine Prüfung, ob Zeit oder Ressourcen verfügbar sind.','Availability check hilft, Termine und Kapazitäten zu planen.','We need an availability check.','Wir brauchen eine Verfügbarkeitsprüfung.',['office','planning'])
    ]
  },
  {
    id: 'business-unit-003',
    number: 3,
    level: 3,
    title: 'Sales & Customers 1',
    description: 'Grundwortschatz für Vertrieb, Kundenkontakt und Angebote.',
    terms: [
      term('lead','Kontaktchance','Eine mögliche Verkaufschance.','Lead ist ein potenzieller Kunde am Anfang des Verkaufsprozesses.','This lead came from our website.','Diese Kontaktchance kam über unsere Website.',['sales','pipeline']),
      term('prospect','potenzieller Kunde','Eine Person oder Firma, die kaufen könnte.','Prospect ist qualifizierter als ein einfacher Lead.','The prospect asked for pricing.','Der potenzielle Kunde fragte nach Preisen.',['sales','pipeline']),
      term('buyer','Käufer','Eine Person oder Firma, die etwas kauft.','Buyer kann Einkaufsperson, Händler oder Endkunde sein.','The buyer needs more information.','Der Käufer braucht mehr Informationen.',['sales','customer']),
      term('offer','Angebot','Ein Vorschlag mit Preis und Bedingungen.','Offer beschreibt, was verkauft wird und zu welchen Konditionen.','We sent the offer yesterday.','Wir haben das Angebot gestern gesendet.',['sales','proposal']),
      term('proposal','Vorschlag','Ein strukturierter geschäftlicher Vorschlag.','Proposal erklärt Lösung, Nutzen, Preis und nächste Schritte.','The proposal includes three options.','Der Vorschlag enthält drei Optionen.',['sales','proposal']),
      term('deal','Geschäft','Eine Verkaufschance oder Vereinbarung.','Deal beschreibt oft eine konkrete Verkaufsverhandlung.','This deal is important.','Dieses Geschäft ist wichtig.',['sales','deal']),
      term('pipeline','Vertriebspipeline','Die Liste laufender Verkaufschancen.','Pipeline zeigt, welche Deals in welcher Phase sind.','Our pipeline is growing.','Unsere Vertriebspipeline wächst.',['sales','forecast']),
      term('quote','Preisangebot','Ein konkretes Angebot mit Preis.','Quote wird für angefragte Preise und Konditionen genutzt.','Please send a quote.','Bitte sende ein Preisangebot.',['sales','pricing']),
      term('discount','Rabatt','Eine Preisreduzierung.','Discount kann Verkauf fördern, aber Marge senken.','The client asked for a discount.','Der Kunde bat um Rabatt.',['sales','pricing']),
      term('negotiation','Verhandlung','Ein Gespräch über Bedingungen.','Negotiation betrifft Preis, Menge, Zahlung und Lieferung.','The negotiation took two weeks.','Die Verhandlung dauerte zwei Wochen.',['sales','deal']),
      term('objection','Einwand','Ein Grund, warum ein Kunde zögert.','Objection muss verstanden und beantwortet werden.','Price is the main objection.','Der Preis ist der wichtigste Einwand.',['sales','conversation']),
      term('closing','Abschluss','Der letzte Schritt zu einer Vereinbarung.','Closing macht aus einer Verkaufschance einen Auftrag.','We are close to closing.','Wir stehen kurz vor dem Abschluss.',['sales','deal']),
      term('retention','Kundenbindung','Kunden langfristig behalten.','Retention ist oft günstiger als neue Kunden zu gewinnen.','Retention improved this year.','Die Kundenbindung hat sich dieses Jahr verbessert.',['sales','customer']),
      term('churn','Kundenabwanderung','Wenn Kunden nicht bleiben.','Churn zeigt, wie viele Kunden verloren gehen.','We need to reduce churn.','Wir müssen die Kundenabwanderung senken.',['sales','customer']),
      term('account','Kundenkonto','Ein Kunde oder betreuter Geschäftskontakt.','Account beschreibt oft einen wichtigen B2B-Kunden.','This account needs support.','Dieses Kundenkonto braucht Unterstützung.',['sales','b2b']),
      term('relationship','Beziehung','Die Verbindung zu Kunden oder Partnern.','Relationship ist im B2B-Vertrieb sehr wichtig.','We have a strong relationship.','Wir haben eine starke Beziehung.',['sales','b2b']),
      term('requirement','Anforderung','Etwas, das erfüllt werden muss.','Requirement kann technisch, rechtlich oder geschäftlich sein.','The buyer has strict requirements.','Der Käufer hat strenge Anforderungen.',['sales','needs']),
      term('pain point','Problemstelle','Ein konkretes Problem des Kunden.','Pain point zeigt, wo ein Angebot Wert schaffen kann.','Delivery time is their pain point.','Lieferzeit ist ihre Problemstelle.',['sales','needs']),
      term('use case','Anwendungsfall','Eine konkrete Nutzungssituation.','Use case erklärt, wofür ein Produkt praktisch gebraucht wird.','This use case is common.','Dieser Anwendungsfall ist häufig.',['sales','product']),
      term('testimonial','Kundenreferenz','Eine positive Aussage eines Kunden.','Testimonial schafft Vertrauen in Marketing und Vertrieb.','We added a testimonial.','Wir haben eine Kundenreferenz ergänzt.',['sales','trust'])
    ]
  },
  {
    id: 'business-unit-004', number: 4, level: 4, title: 'Marketing 1', description: 'Wörter für Zielgruppen, Kampagnen und Markenaufbau.', terms: [
      term('brand','Marke','Das Bild, das Menschen von einem Unternehmen haben.','Brand umfasst Name, Vertrauen, Stil und Positionierung.','The brand feels modern.','Die Marke wirkt modern.',['marketing','brand']),
      term('audience','Zielgruppe','Die Menschen, die erreicht werden sollen.','Audience beschreibt Empfänger von Marketing und Kommunikation.','Our audience is very specific.','Unsere Zielgruppe ist sehr spezifisch.',['marketing','targeting']),
      term('campaign','Kampagne','Eine geplante Reihe von Marketingmaßnahmen.','Campaign verfolgt ein konkretes Ziel über mehrere Kanäle.','The campaign starts Monday.','Die Kampagne startet Montag.',['marketing','campaign']),
      term('channel','Kanal','Ein Weg, um Menschen zu erreichen.','Channel kann E-Mail, Social Media, Suche oder Vertrieb sein.','Which channel works best?','Welcher Kanal funktioniert am besten?',['marketing','channel']),
      term('content','Inhalt','Text, Bild, Video oder Audio.','Content informiert, überzeugt oder baut Vertrauen auf.','The content explains the product.','Der Inhalt erklärt das Produkt.',['marketing','content']),
      term('message','Botschaft','Die wichtigste Aussage.','Message verdichtet, was Zielgruppe verstehen soll.','The message is clear.','Die Botschaft ist klar.',['marketing','positioning']),
      term('positioning','Positionierung','Wie ein Angebot im Markt wahrgenommen werden soll.','Positioning erklärt, warum man anders oder besser ist.','Our positioning is premium.','Unsere Positionierung ist hochwertig.',['marketing','strategy']),
      term('awareness','Bekanntheit','Wie viele Menschen etwas kennen.','Awareness ist oft das erste Ziel einer Marke.','Brand awareness is increasing.','Die Markenbekanntheit steigt.',['marketing','brand']),
      term('conversion','Umwandlung','Wenn jemand eine gewünschte Aktion ausführt.','Conversion kann Kauf, Anmeldung oder Anfrage bedeuten.','The conversion rate improved.','Die Umwandlungsrate hat sich verbessert.',['marketing','analytics']),
      term('landing page','Landingpage','Eine Seite für ein bestimmtes Angebot.','Landing page soll Besucher zu einer Handlung führen.','The landing page needs a clear offer.','Die Landingpage braucht ein klares Angebot.',['marketing','web']),
      term('headline','Überschrift','Der wichtigste Titel eines Inhalts.','Headline entscheidet oft, ob Menschen weiterlesen.','The headline is too long.','Die Überschrift ist zu lang.',['marketing','copy']),
      term('call to action','Handlungsaufforderung','Eine Aufforderung zu einer Aktion.','Call to action sagt Nutzern, was sie als Nächstes tun sollen.','The call to action is clear.','Die Handlungsaufforderung ist klar.',['marketing','conversion']),
      term('lead magnet','Lead-Magnet','Ein kostenloser Wert gegen Kontaktdaten.','Lead magnet hilft, qualifizierte Kontakte aufzubauen.','The checklist is a lead magnet.','Die Checkliste ist ein Lead-Magnet.',['marketing','lead']),
      term('reach','Reichweite','Wie viele Menschen erreicht werden.','Reach misst Sichtbarkeit in Kampagnen.','The post had high reach.','Der Beitrag hatte hohe Reichweite.',['marketing','analytics']),
      term('engagement','Interaktion','Wie stark Menschen reagieren.','Engagement umfasst Likes, Kommentare, Klicks oder Antworten.','Engagement is low this week.','Die Interaktion ist diese Woche niedrig.',['marketing','analytics']),
      term('impression','Einblendung','Wie oft etwas angezeigt wurde.','Impression zählt Sichtkontakte mit Werbung oder Inhalt.','The ad received many impressions.','Die Anzeige bekam viele Einblendungen.',['marketing','ads']),
      term('click-through rate','Klickrate','Anteil der Menschen, die klicken.','Click-through rate misst Attraktivität von Anzeige oder Link.','The click-through rate is strong.','Die Klickrate ist stark.',['marketing','ads']),
      term('copywriting','Werbetexten','Texte schreiben, die überzeugen.','Copywriting verbindet Klarheit, Nutzen und Handlung.','Good copywriting increases sales.','Gutes Werbetexten steigert Verkäufe.',['marketing','copy']),
      term('social proof','sozialer Beweis','Vertrauen durch andere Menschen.','Social proof nutzt Bewertungen, Referenzen oder Zahlen.','Social proof builds trust.','Sozialer Beweis baut Vertrauen auf.',['marketing','trust']),
      term('targeting','Zielgruppenausrichtung','Auswahl, wen eine Kampagne erreichen soll.','Targeting macht Marketing relevanter und effizienter.','The targeting is too broad.','Die Zielgruppenausrichtung ist zu breit.',['marketing','ads'])
    ]
  },
  {
    id: 'business-unit-005', number: 5, level: 5, title: 'Finance 1', description: 'Finanzbegriffe für Budget, Cashflow und Reporting.', terms: [
      term('budget','Budget','Geplantes Geld für einen Zweck.','Budget begrenzt Ausgaben und schafft Kontrolle.','The project budget is limited.','Das Projektbudget ist begrenzt.',['finance','planning']),
      term('cash flow','Cashflow','Geld, das rein- und rausfließt.','Cash flow zeigt, ob genug Liquidität vorhanden ist.','Cash flow is tight this month.','Der Cashflow ist diesen Monat knapp.',['finance','liquidity']),
      term('margin','Marge','Unterschied zwischen Verkaufspreis und Kosten.','Margin zeigt, wie profitabel ein Verkauf ist.','Our margin is too low.','Unsere Marge ist zu niedrig.',['finance','profitability']),
      term('expense','Ausgabe','Geld, das ausgegeben wird.','Expense wird für operative Kosten genutzt.','Travel expenses increased.','Die Reisekosten sind gestiegen.',['finance','costs']),
      term('investment','Investition','Geld für zukünftigen Nutzen.','Investment soll Wachstum, Effizienz oder Rendite erzeugen.','This investment improves capacity.','Diese Investition verbessert die Kapazität.',['finance','capital']),
      term('forecast','Prognose','Eine Einschätzung zukünftiger Zahlen.','Forecast hilft bei Planung von Umsatz, Kosten und Liquidität.','The forecast looks strong.','Die Prognose sieht stark aus.',['finance','planning']),
      term('break-even point','Gewinnschwelle','Der Punkt, an dem Kosten und Einnahmen gleich sind.','Break-even zeigt, ab wann kein Verlust entsteht.','We reached break-even.','Wir haben die Gewinnschwelle erreicht.',['finance','profitability']),
      term('liability','Verbindlichkeit','Eine finanzielle oder rechtliche Verpflichtung.','Liability kann Schuld, Risiko oder Haftung bedeuten.','The loan is a liability.','Das Darlehen ist eine Verbindlichkeit.',['finance','accounting']),
      term('asset','Vermögenswert','Etwas mit wirtschaftlichem Wert.','Asset kann Geld, Maschine, Marke oder Forderung sein.','The warehouse is an asset.','Das Lager ist ein Vermögenswert.',['finance','accounting']),
      term('equity','Eigenkapital','Kapital der Eigentümer.','Equity zeigt Eigentumsanteil nach Abzug von Schulden.','The company raised equity.','Das Unternehmen hat Eigenkapital aufgenommen.',['finance','capital']),
      term('debt','Schulden','Geld, das zurückgezahlt werden muss.','Debt finanziert Wachstum, erhöht aber Risiko.','The company reduced debt.','Das Unternehmen hat Schulden reduziert.',['finance','capital']),
      term('interest rate','Zinssatz','Preis für geliehenes Geld.','Interest rate beeinflusst Kreditkosten.','The interest rate is high.','Der Zinssatz ist hoch.',['finance','banking']),
      term('payment term','Zahlungsziel','Zeitspanne bis zur Zahlung.','Payment term beeinflusst Cashflow und Risiko.','The payment term is 30 days.','Das Zahlungsziel beträgt 30 Tage.',['finance','payments']),
      term('overdue','überfällig','Nicht rechtzeitig bezahlt oder erledigt.','Overdue beschreibt verspätete Rechnungen oder Aufgaben.','The invoice is overdue.','Die Rechnung ist überfällig.',['finance','payments']),
      term('purchase order','Bestellauftrag','Ein formelles Einkaufsdokument.','Purchase order bestätigt, was gekauft wird.','We need a purchase order.','Wir brauchen einen Bestellauftrag.',['finance','procurement']),
      term('financial statement','Finanzbericht','Ein Bericht über die finanzielle Lage.','Financial statement zeigt Ergebnis, Bilanz und Cashflow.','The bank requested statements.','Die Bank verlangte Finanzberichte.',['finance','reporting']),
      term('balance sheet','Bilanz','Übersicht über Vermögen und Schulden.','Balance sheet zeigt die finanzielle Position.','The balance sheet is healthy.','Die Bilanz ist solide.',['finance','accounting']),
      term('income statement','Gewinn- und Verlustrechnung','Bericht über Umsatz, Kosten und Ergebnis.','Income statement zeigt Profitabilität.','The income statement shows higher costs.','Die Gewinn- und Verlustrechnung zeigt höhere Kosten.',['finance','accounting']),
      term('working capital','Betriebskapital','Geld für den laufenden Betrieb.','Working capital finanziert Lager und tägliche Abläufe.','We need more working capital.','Wir brauchen mehr Betriebskapital.',['finance','liquidity']),
      term('return on investment','Kapitalrendite','Nutzen im Verhältnis zur Investition.','Return on investment bewertet, ob sich eine Investition lohnt.','The return on investment is attractive.','Die Kapitalrendite ist attraktiv.',['finance','investment'])
    ]
  }
];

const operations = ['capacity/Kapazität','warehouse/Lager','inventory/Lagerbestand','shipment/Sendung','delivery/Lieferung','supplier management/Lieferantenmanagement','quality control/Qualitätskontrolle','workflow/Arbeitsablauf','bottleneck/Engpass','throughput/Durchsatz','procurement/Einkauf','lead time/Vorlaufzeit','fulfillment/Auftragsabwicklung','resource/Ressource','downtime/Ausfallzeit','maintenance/Wartung','standard operating procedure/Standardarbeitsanweisung','handover/Übergabe','traceability/Rückverfolgbarkeit','efficiency/Effizienz'];
const management = ['leadership/Führung','accountability/Verantwortlichkeit','delegation/Aufgabendelegation','performance/Leistung','objective/Zielsetzung','key result/Schlüsselergebnis','priority/Priorität','decision-making/Entscheidungsfindung','stakeholder/Interessengruppe','team morale/Teamstimmung','feedback loop/Rückkopplung','one-on-one/Einzelgespräch','workload/Arbeitsbelastung','capacity planning/Kapazitätsplanung','expectation/Erwartung','ownership/Eigenverantwortung','escalation/Eskalation','review cycle/Prüfzyklus','milestone/Meilenstein','roadmap/Fahrplan'];
const strategy = ['competitive advantage/Wettbewerbsvorteil','market entry/Markteintritt','business model/Geschäftsmodell','positioning/Positionierung','differentiation/Differenzierung','target segment/Zielsegment','value proposition/Wertversprechen','go-to-market strategy/Markteinführungsstrategie','growth driver/Wachstumstreiber','market share/Marktanteil','scenario planning/Szenarioplanung','assumption/Annahme','constraint/Einschränkung','trade-off/Zielkonflikt','strategic priority/strategische Priorität','operating model/Betriebsmodell','risk appetite/Risikobereitschaft','partnership strategy/Partnerstrategie','unit economics/Stückökonomie','execution plan/Umsetzungsplan'];
const legalTrade = ['agreement/Vereinbarung','clause/Klausel','liability/Haftung','compliance/Regelkonformität','regulation/Vorschrift','permit/Genehmigung','customs/Zoll','tariff/Zolltarif','certificate/Zertifikat','incoterms/Incoterms','export document/Exportdokument','import duty/Einfuhrabgabe','due diligence/Sorgfaltsprüfung','data protection/Datenschutz','intellectual property/geistiges Eigentum','termination/Kündigung','warranty/Gewährleistung','jurisdiction/Gerichtsstand','confidentiality/Vertraulichkeit','force majeure/höhere Gewalt'];
const advanced = ['benchmark/Vergleichswert','leverage/Hebelwirkung','scalability/Skalierbarkeit','resilience/Widerstandsfähigkeit','governance/Steuerung','operational excellence/operative Exzellenz','stakeholder alignment/Stakeholder-Abstimmung','capital allocation/Kapitalallokation','risk mitigation/Risikominderung','market validation/Marktvalidierung','pricing power/Preissetzungsmacht','customer acquisition cost/Kundenakquisitionskosten','lifetime value/Kundenwert','gross margin/Bruttomarge','net profit/Nettogewinn','cash conversion cycle/Geldumschlagsdauer','retention rate/Bindungsrate','forecast accuracy/Prognosegenauigkeit','change management/Veränderungsmanagement','strategic initiative/strategische Initiative'];

function generatedUnit(id, number, level, title, description, pairs, area) {
  return {
    id,
    number,
    level,
    title,
    description,
    terms: pairs.map(item => {
      const [english, german] = item.split('/');
      return term(
        english,
        german,
        `${german} ist ein wichtiger Begriff im Bereich ${area}.`,
        `${english} wird genutzt, um ${german.toLowerCase()} in professionellen Gesprächen, Reports oder Entscheidungen präzise zu benennen.`,
        `We need to discuss ${english}.`,
        `Wir müssen ${german.toLowerCase()} besprechen.`,
        [area.toLowerCase().replace(/\s+/g, '-'), `level-${level}`]
      );
    })
  };
}

businessVocabularyUnits.push(
  generatedUnit('business-unit-006',6,6,'Operations 1','Begriffe für Lieferfähigkeit, Abläufe und operative Steuerung.',operations,'Operations'),
  generatedUnit('business-unit-007',7,7,'Management 1','Begriffe für Führung, Verantwortung und Teamsteuerung.',management,'Management'),
  generatedUnit('business-unit-008',8,8,'Strategy 1','Begriffe für Strategie, Markt und Geschäftsmodell.',strategy,'Strategy'),
  generatedUnit('business-unit-009',9,9,'Legal & International Trade 1','Begriffe für Verträge, Regulierung und internationalen Handel.',legalTrade,'Legal & Trade'),
  generatedUnit('business-unit-010',10,10,'Advanced Business English 1','Professionelle Begriffe für Analyse, Wachstum und Steuerung.',advanced,'Advanced Business English')
);

export function getBusinessVocabularyUnit(unitId) {
  return businessVocabularyUnits.find(unit => unit.id === unitId) || null;
}

export function businessVocabularySummary() {
  return {
    units: businessVocabularyUnits.length,
    terms: businessVocabularyUnits.reduce((sum, unit) => sum + unit.terms.length, 0),
    direction: 'de-en',
    levels: BUSINESS_VOCABULARY_LEVELS.length
  };
}

export function assertBusinessVocabularyPhaseOne(units = businessVocabularyUnits) {
  if (units.length !== 10) throw new Error('Phase 1 braucht genau 10 Business-Vokabel-Units.');
  for (const unit of units) {
    if (unit.terms.length !== 20) throw new Error(`${unit.id} braucht genau 20 Begriffe.`);
    for (const item of unit.terms) {
      for (const key of ['english','german','simple','business','exampleEn','exampleDe','tags','reviewStatus']) {
        if (item[key] === undefined || item[key] === '') throw new Error(`${unit.id}/${item.id} fehlt ${key}.`);
      }
    }
  }
  return true;
}
