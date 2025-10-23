// Demo configuration for development
export const DEMO_CONFIG = {
  // Set to true to enable demo mode (no real SMS sending)
  DEMO_MODE: true,
  
  // Demo OTP code that will be accepted
  DEMO_OTP_CODE: '123456',
  
  // Messages
  DEMO_SMS_MESSAGE: 'Demo Modus: Verwende den Code 123456 für die Verifikation',
  DEMO_VERIFY_MESSAGE: 'Demo Modus: Verwende den Code 123456 für die Verifikation',
  
  // For production, set DEMO_MODE to false and configure real SMS provider in Supabase
  PRODUCTION_SETUP_NOTES: `
    Für Produktion:
    1. DEMO_MODE auf false setzen
    2. SMS-Provider in Supabase Dashboard konfigurieren (Twilio, MessageBird, etc.)
    3. Phone Authentication in Supabase Auth Settings aktivieren
    4. Rate Limiting und weitere Sicherheitsmaßnahmen konfigurieren
  `
};

export const isDemoMode = () => DEMO_CONFIG.DEMO_MODE;
export const getDemoOTP = () => DEMO_CONFIG.DEMO_OTP_CODE;