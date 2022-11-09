# Google Classroom Data Export

1) Google Konto anmelden...

2) URL: script.google.com

3) Neues Projekt

4) 'Code.gs' mit dieser Version ersetzen...

5) Dienste hinzufügen: Classroom API, Drive API

6) Projekt-Einstellungen > Manifestdatei "appsscript.json" im Editor anzeigen

7) appsscript.json mit dieser Version ersetzen...

8) Die Ausführungszeit in dieser Umgebung ist begrenzt - sprich alle Kurse auf einmal zu kopieren geht nicht. FROM und TO in 'Code.gs' sind Bereiche. (z.B: bei 64 Kursen, muss man den Bereich immer wieder anpassen... 1-5, 6-10, 11-15, bis 61-64)

9) Sicherung beginnen und in neuen Bereichen immer wiederholen... in Drive findet man die Ordner 'Google Export VON-BIS'. Fehler ignorieren.

10) Ordner aus Google Drive herunterladen...

11) In jeder Ordner-Struktur 'Google Export VON-BIS' findet man ERROR-Files. Diese Dateien enhalten Kursname, Aufgabenname und Link. Die Dateien sind >2GB gewesen und konnten daher nicht automatisch heruntergelden werden. Hinterlegten Link aufrufen und manuell an entsprechender Stelle einfügen.

12) Alle Kursdaten sind nun gesichert. (inklusive Aufgabentexte, Datum, Zeit, Punkte, ...)
