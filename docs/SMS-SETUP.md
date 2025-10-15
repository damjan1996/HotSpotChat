# 📱 SMS Authentifizierung Setup

## 🚀 Schnell-Setup (15 Minuten)

### Schritt 1: Twilio Account erstellen
1. Gehe zu [twilio.com](https://twilio.com)
2. Kostenlosen Account erstellen
3. Phone Number kaufen (~1€/Monat)
4. Diese Credentials kopieren:
   - **Account SID**
   - **Auth Token**
   - **Phone Number**

### Schritt 2: Supabase SMS konfigurieren
1. Gehe zu deinem Supabase Dashboard
2. **Authentication → Settings → Phone Auth**
3. **Enable phone confirmations** aktivieren
4. **SMS Provider**: Twilio auswählen
5. Twilio Credentials eingeben:
   ```
   Account SID: [Dein Twilio Account SID]
   Auth Token: [Dein Twilio Auth Token]
   Phone Number: [Deine Twilio Phone Number]
   ```

### Schritt 3: Supabase API Keys aktualisieren
Stelle sicher, dass deine `.env.local` die richtigen Keys hat:
```env
NEXT_PUBLIC_SUPABASE_URL=https://mjdzrksckoexefncgaqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Dein echter anon key]
SUPABASE_SERVICE_ROLE_KEY=[Dein echter service role key]
```

### Schritt 4: Code aktivieren
Ich habe bereits den SMS-Code vorbereitet. Du musst nur:
1. Die echten Supabase API Keys in `.env.local` eintragen
2. Twilio in Supabase konfigurieren
3. App neu starten

## 💰 Kosten

### Twilio Pricing:
- **Phone Number**: ~1€/Monat
- **SMS senden**: ~0,05€ pro SMS
- **Für Tests**: ~5-10€ reichen für Monate

### Alternative: Supabase Edge Functions
Für Produktion kann man auch:
- AWS SNS verwenden
- Andere SMS-Provider integrieren
- Edge Functions für Custom Logic

## 🧪 Test-Modus

**Aktuell läuft Test-Modus:**
- Keine echten SMS
- Simulation mit 6-stelligem Code
- Perfekt für UI-Tests

**Nach SMS-Setup:**
- Echte SMS an deine Nummer
- Produktions-ready
- Internationale Nummern funktionieren

## 🔧 Troubleshooting

### SMS kommt nicht an:
1. **Twilio Console** checken (Logs)
2. **Phone Number** richtig formatiert?
3. **Supabase Logs** prüfen
4. **Rate Limits** beachten

### Fehler bei Verifikation:
1. **Code** richtig eingegeben?
2. **Timeout** (5 Minuten) überschritten?
3. **Supabase Auth** Logs checken

## 🚀 Nächste Schritte

1. **Twilio Account** erstellen
2. **Supabase** konfigurieren  
3. **API Keys** aktualisieren
4. **Testen** mit deiner Nummer
5. **Live gehen**! 🎉

---

**Brauchst du Hilfe bei der Einrichtung?** Ich kann dir bei jedem Schritt helfen!