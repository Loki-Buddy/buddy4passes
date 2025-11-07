# Wir entwickeln einen Passwort-Manager für den Privaten Gebrauch. 
## Arbeitstitel "buddy4passes"
Eine Web-Applikation, die mittels eines bestimmten Frameworks (Tauri)
als native Desktop-App verwendet wird.

- Durch clientseitige Verschlüsselng der User-Daten und Passwörter haben wir einen hohen Sicherheitsstandard.

## Mindestanforderungen (Unser Werkzeugkasten)
- Tauri Framework
  	- Frontend: JavaScript/React
  	- Backend: Rust
- Database: PostgreSQL
  	- Tabelle 1: User mit Vor- / Nachname, Geburtsdatum, Main-E-Mail, Main-Passwort
  	- Tabelle 2: Gesammelte eigene Accounts
  	- Tabelle 3: Geteilte Accounts

## Im MVP 
- wollen wir ein fertiges Frontend liefern, in dem sicher der User in sein Konto einloggt (Benutzername / E-Mail und NUR NOCH EIN Passwort) und seine gespeicherten Accounts einsehen kann.
- Die Accounts können in selbsterstellten / -verwalteten Gruppen geordnet werden (z.B. Social-Media, Bank, Gaming etc.) --> Wichtig: Eigene Favoriten können markiert werden (Für Daily Use)
- Der User kann neue Logindaten mit Benutzername und Passwort hinzufügen sowie bestehende Accounts ändern und/oder löschen.
	- User kann dem Account ein "Tag" und / oder direkt die URL zuweisen
	- ZUSATZ: E-Mail-Adresse kann als Standard / default hinterlegt werden. Spart Zeit und ist einfacher in der Anwendung.
- Die App soll über eine Website (eigene einfache statische Website?)  als Download zur Verfügung stehen.
  	- Website-URL über AWS bereitstellen, gehostet im S3 Bucket --> Datei heißt "mellon.zip"
- Automatisierungen im vollen Umfang mittels Github-Actions
- Physiche Sicherheit implementieren:
	- Neuanmeldung erforderlich, nach Minimieren oder 3 Minuten Inaktivität. (Kein MUSS, erforderliche Passowrteingabe kann in den Einstellungen angepasst / ausgeschaltet werden --> Sicherheits-Hinweis einblenden!)
- Die App soll auf dem Client als DEMON laufen und mit einem Tray-Icon in der Taskleiste erreichbar sein.
	- Wahlweise Aufnahme in die Autostart-Programme
	
## Sicherheit - 
- Die Daten sollen auf dem Client gehasht werden und in der cloud serverseitig mit SHA-256 verschlüsselt abgespeichert werden (Das sind die anfänglichen Überlegungen was die Sicherheit betrifft: Anpassungen möglich).

## Nice-To-Have - 
- Der User hat die Möglichkeit, einen kompletten Eintrag seines Passwort-Managers mit einem anderen *User* der App zu teilen. (Sicherheitswarnungen müssen erfolgen/angezeigt werden etc.)
	- Der andere User MUSS registrierter Nutzer der App sein (Hinweis zum Sicherheitsrisiko!)
- Browser-Addon für Autofill und Speicherung
- Erweiterung auf eine Mobile-Version der App
- Offline-Version mit lokaler Speicherung (SQLite)
- Paywall für mehr als 30 Accounts
- Jederzeit die Möglichkeit zu spenden
	

## Allgemeine Anforderungen des Abschlussprojekts
- Als Cloud-Provider soll AWS verwendet werden.
- Infrastruktur wird mittels Terraform bereitgestellt.
- Planung für eine Dev-, Test- und Prod-Umgebung steht noch im Raum.
