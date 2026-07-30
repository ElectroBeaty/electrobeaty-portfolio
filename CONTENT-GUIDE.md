# Portfolio bearbeiten

Die Website ist jetzt eine Next.js Portfolio-App mit privatem Admin-Bereich.

## Lokal ansehen

```bash
npm install
npm run dev
```

Danach:

- Website: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

## Wichtige Umgebungsvariablen

Lege lokal eine `.env.local` Datei an. Auf Vercel setzt du dieselben Variablen in den Project Settings.

```env
ADMIN_PASSWORD=dein-sicheres-passwort
BLOB_STORE_ID=store_deine-vercel-blob-store-id
NEXT_PUBLIC_SITE_URL=https://deine-domain.vercel.app
```

`ADMIN_PASSWORD` schuetzt `/admin`.

`BLOB_STORE_ID` kommt automatisch von der verbundenen Vercel Blob Datenbank. Vercel nutzt dafuer OIDC im Deployment. Lokal kannst du die Werte mit `vercel env pull .env.local --yes` ziehen.

Falls dein Blob Store noch den alten Read-Write-Token nutzt, funktioniert `BLOB_READ_WRITE_TOKEN` weiterhin als Fallback.

`NEXT_PUBLIC_SITE_URL` sorgt fuer saubere Link-Vorschauen, wenn du die Website teilst.

## Neuen Song hochladen

1. Gehe auf `/admin`.
2. Logge dich mit deinem Passwort ein.
3. Oeffne `Game Tracks` oder `Personal Tracks`.
4. Klicke `Add track`.
5. Lade die Audiodatei hoch oder fuege eine URL ein.
6. Titel, Beschreibung, Kategorie und Tags bearbeiten.
7. `Save changes` klicken.

Die oeffentliche Seite aktualisiert sich danach innerhalb von etwa einer Minute.

## Kategorien bearbeiten

Im Admin gibt es den Tab `Categories`.

- `Name` ist der sichtbare Name auf der Website.
- `Slug` ist der interne Wert fuer Filter und Zuordnung.
- `Icon` steuert das Symbol im Track-Badge.
- `Farbe` steuert den Track-Akzent, den Filter-Button und das kleine Track-Badge.

Neue Songs bekommen ihre Kategorie danach ueber ein Auswahlfeld. Dadurch entstehen keine leeren Kategorie-Badges mehr durch Tippfehler.

## Fanart oder Bilder hochladen

1. Gehe auf `/admin`.
2. Oeffne `Fanart`.
3. Klicke `Add fanart`.
4. Bild hochladen.
5. Titel, Beschreibung, Artist und Links eintragen.
6. `Save changes` klicken.

## Projekte und Links bearbeiten

Im Admin gibt es Tabs fuer:

- `Projects`
- `Featured`
- `Contact`

Links werden im Format `Label|URL` eingetragen. Mehrere Links trennst du mit Komma.

Beispiel:

```text
Play Game|https://example.com, Soundtrack|https://example.com/music
```

## Startdaten

Wenn noch kein Vercel Blob eingerichtet ist, zeigt die Seite die Startdaten aus `lib/seed-data.js`.
Sobald du im Admin speicherst, werden die Live-Daten aus Vercel Blob verwendet.
