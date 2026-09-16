# VELOX Studios — Website veröffentlichen (Deployment)

Die App bringt alles mit: **Datenbank-Schema und Katalog werden beim ersten
Start automatisch angelegt** (idempotent). Du musst nur Host + Datenbank +
Env-Variablen setzen.

---

## A) Vercel + Neon (empfohlen, ~15 Min, kostenlos)

1. **GitHub:** Repo erstellen und Code pushen.
2. **Datenbank:** Auf [neon.tech](https://neon.tech) ein kostenloses Postgres-Projekt
   anlegen → Connection-String kopieren (alternativ Supabase/Railway).
3. **Vercel:** [vercel.com](https://vercel.com) → „Import Repository" →
   Env-Variablen setzen (siehe unten) → Deploy.
4. **Domain:** In Vercel unter *Settings → Domains* deine Domain verbinden
   (oder erst einmal die kostenlose `*.vercel.app`-URL nutzen).

## B) Eigener Server via Docker

```bash
docker build -t velox-studios .
docker run -d --name velox -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/app_db" \
  -e NEXT_PUBLIC_BASE_URL="https://deine-domain.de" \
  ...weitere Env-Vars...
  velox-studios
```

Davor Caddy/Nginx als Reverse-Proxy mit HTTPS auf Port 3000 zeigen lassen.

---

## Benötigte Environment Variables

| Variable | Pflicht | Beschreibung |
|---|---|---|
| `DATABASE_URL` | ✅ | Postgres Connection-String |
| `NEXT_PUBLIC_BASE_URL` | ✅ | `https://deine-domain.de` (aktiviert Secure-Cookies) |
| `ADMIN_ROBLOX_IDS` | ✅ (Prod) | Deine Roblox User-ID → echter Admin-Login |
| `ADMIN_EMAILS` | ✅ | `damon0wendt@gmail.com` — Demo-Owner gesperrt auf diese Adresse |
| `ROBLOX_CLIENT_ID` | ✅ (Prod) | Siehe Roblox OAuth unten |
| `ROBLOX_CLIENT_SECRET` | ✅ (Prod) | Siehe Roblox OAuth unten |
| `ROBLOX_REDIRECT_URI` | ➖ | Default: `BASE_URL + /api/auth/roblox/callback` |
| `NEXT_PUBLIC_DISCORD_INVITE` | ➖ | Dein Discord-Invite |
| `ALLOW_DEMO_LOGIN` | ➖ | `false` lassen — Demo deaktiviert sich mit OAuth selbst |

## Roblox OAuth einrichten (echtes „Login with Roblox")

1. [create.roblox.com/dashboard/credentials](https://create.roblox.com/dashboard/credentials)
   → **OAuth2 App** erstellen
2. **Redirect URI:** `https://deine-domain.de/api/auth/roblox/callback`
3. **Scopes:** `openid` + `profile`
4. Client ID + Secret bei Vercel/Docker als Env-Vars setzen → Demo-Login
   deaktiviert sich automatisch.

> **Hinweis E-Mail:** Roblox OAuth gibt keine E-Mail-Adressen der Nutzer
> heraus. Deshalb hängen Admin-Rechte bei echtem Login an deiner **Roblox
> User-ID** (`ADMIN_ROBLOX_IDS`). Die E-Mail-Prüfung (`ADMIN_EMAILS`) gilt
> für den Owner-Account im Demo-Modus.

## Admin werden (Produktion)

1. Deine Roblox User-ID in `ADMIN_ROBLOX_IDS` eintragen
2. Einmal mit deinem Roblox-Account einloggen → Account bekommt automatisch
   Admin-Rechte → „Admin Dashboard" erscheint im Profilmenü
3. Nur dieser Account kann Produkte/Bundles erstellen, bearbeiten, löschen
   und Verkäufe sehen. Alle anderen Nutzer sehen das Dashboard niemals.

## Go-Live-Checkliste

- [ ] `NEXT_PUBLIC_BASE_URL` = https-Domain
- [ ] `ROBLOX_CLIENT_ID` + `ROBLOX_CLIENT_SECRET` gesetzt
- [ ] `ADMIN_ROBLOX_IDS` = deine Roblox-ID, `ADMIN_EMAILS` = deine E-Mail
- [ ] Pro Produkt im Admin-Dashboard die **Game-Pass-ID** eintragen,
      damit Käufe offiziell über roblox.com laufen
- [ ] Demo-Daten (Demo-Käufe, Beispielprodukte) ggf. ersetzen/löschen
