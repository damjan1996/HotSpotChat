# Demo Authentication Setup

## 🚀 Aktueller Status
Die App läuft im **Demo-Modus** für die Entwicklung, da kein SMS-Provider konfiguriert ist.

## 📱 Registrierung testen

### Schritt 1: Registrierung starten
- Gehe zu `http://localhost:3001/register`
- Fülle alle 4 Schritte aus:
  1. **Name & Telefon** (beliebige Nummer verwenden)
  2. **Alter & Geschlecht**
  3. **Bilder hochladen** (mindestens 1 Bild)
  4. **Bio schreiben** (mindestens 10 Zeichen)

### Schritt 2: Verifikation
- Nach dem letzten Schritt wird automatisch eine Alert-Box angezeigt: **"Demo Modus: Verwende den Code 123456"**
- Auf der Verifikationsseite den Code **123456** eingeben
- Der Account wird automatisch erstellt und in der Datenbank gespeichert

## 🔧 Demo-Modus Details

### Was funktioniert:
- ✅ Vollständige Registrierung mit Bildupload
- ✅ Datenspeicherung in Supabase Database
- ✅ Bildupload zu Supabase Storage
- ✅ Demo-Verifikation mit Code 123456
- ✅ Automatische Profilerstellung

### Was simuliert wird:
- 📱 SMS-Versand (wird nur in Console geloggt)
- 🔐 OTP-Verifikation (akzeptiert nur 123456)
- 👤 User-Account über Email-Signup erstellt

## 🏗️ Für Produktion aktivieren

Um echte SMS-Verifikation zu aktivieren:

1. **In Supabase Dashboard:**
   - Gehe zu Authentication > Settings
   - Konfiguriere einen SMS-Provider (Twilio, MessageBird, etc.)
   - Aktiviere Phone Authentication

2. **Im Code:**
   - Öffne `lib/config/demo.ts`
   - Setze `DEMO_MODE: false`
   - Kommentiere die echten Supabase Auth Calls in `lib/auth/supabase-auth.ts` ein

3. **Environment Variables:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 📂 Geänderte Dateien
- `app/(auth)/register/page.tsx` - 4-Schritt Registrierung mit Bildupload
- `app/(auth)/verify/page.tsx` - Demo-Verifikation
- `lib/auth/supabase-auth.ts` - Demo SMS/OTP Handling
- `lib/services/supabase-database.ts` - Erweiterte Profile-Erstellung
- `lib/config/demo.ts` - Demo-Konfiguration

## 🎯 Nächste Schritte
Die Registrierung funktioniert jetzt vollständig im Demo-Modus. Du kannst:
1. Die Registrierung mit verschiedenen Daten testen
2. Mehrere Accounts erstellen
3. Die gespeicherten Daten in der Supabase Console überprüfen