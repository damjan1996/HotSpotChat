export interface CountryCode {
  code: string;
  name: string;
  flag: string;
  prefix: string;
  format: string;
}

export const supportedCountries: CountryCode[] = [
  {
    code: 'DE',
    name: 'Nemačka',
    flag: '🇩🇪',
    prefix: '+49',
    format: '+49 XXX XXXXXXXX'
  },
  {
    code: 'AT',
    name: 'Austrija',
    flag: '🇦🇹',
    prefix: '+43',
    format: '+43 XXX XXXXXXX'
  },
  {
    code: 'CH',
    name: 'Švajcarska',
    flag: '🇨🇭',
    prefix: '+41',
    format: '+41 XX XXX XX XX'
  },
  {
    code: 'RS',
    name: 'Srbija',
    flag: '🇷🇸',
    prefix: '+381',
    format: '+381 XX XXX XXXX'
  },
  {
    code: 'FR',
    name: 'Francuska',
    flag: '🇫🇷',
    prefix: '+33',
    format: '+33 X XX XX XX XX'
  },
  {
    code: 'IT',
    name: 'Italija',
    flag: '🇮🇹',
    prefix: '+39',
    format: '+39 XXX XXX XXXX'
  },
  {
    code: 'ES',
    name: 'Španija',
    flag: '🇪🇸',
    prefix: '+34',
    format: '+34 XXX XXX XXX'
  },
  {
    code: 'NL',
    name: 'Holandija',
    flag: '🇳🇱',
    prefix: '+31',
    format: '+31 X XXXX XXXX'
  }
];

export function detectCountryFromNumber(phoneNumber: string): CountryCode | null {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  for (const country of supportedCountries) {
    const prefix = country.prefix.replace('+', '');
    if (cleaned.startsWith(prefix)) {
      return country;
    }
  }
  
  return null;
}

export function formatPhoneNumber(value: string, selectedCountry: CountryCode): string {
  // Remove all non-numeric characters
  const cleaned = value.replace(/\D/g, '');
  const prefix = selectedCountry.prefix.replace('+', '');
  
  let nationalNumber = '';
  
  if (cleaned.startsWith(prefix)) {
    // Number already has country code
    nationalNumber = cleaned.substring(prefix.length);
  } else if (cleaned.startsWith('0')) {
    // National format (remove leading 0)
    nationalNumber = cleaned.substring(1);
  } else {
    nationalNumber = cleaned;
  }
  
  // Apply country-specific formatting
  let formatted = selectedCountry.prefix + ' ';
  
  switch (selectedCountry.code) {
    case 'DE':
      // German format: +49 XXX XXXXXXXX
      if (nationalNumber.length > 0) {
        formatted += nationalNumber.substring(0, 3);
        if (nationalNumber.length > 3) {
          formatted += ' ' + nationalNumber.substring(3, 11);
        }
      }
      break;
      
    case 'AT':
      // Austrian format: +43 XXX XXXXXXX  
      if (nationalNumber.length > 0) {
        formatted += nationalNumber.substring(0, 3);
        if (nationalNumber.length > 3) {
          formatted += ' ' + nationalNumber.substring(3, 10);
        }
      }
      break;
      
    case 'CH':
      // Swiss format: +41 XX XXX XX XX
      if (nationalNumber.length > 0) {
        formatted += nationalNumber.substring(0, 2);
        if (nationalNumber.length > 2) {
          formatted += ' ' + nationalNumber.substring(2, 5);
          if (nationalNumber.length > 5) {
            formatted += ' ' + nationalNumber.substring(5, 7);
            if (nationalNumber.length > 7) {
              formatted += ' ' + nationalNumber.substring(7, 9);
            }
          }
        }
      }
      break;
      
    case 'RS':
      // Serbian format: +381 XX XXX XXXX
      if (nationalNumber.length > 0) {
        formatted += nationalNumber.substring(0, 2);
        if (nationalNumber.length > 2) {
          formatted += ' ' + nationalNumber.substring(2, 5);
          if (nationalNumber.length > 5) {
            formatted += ' ' + nationalNumber.substring(5, 9);
          }
        }
      }
      break;
      
    case 'FR':
      // French format: +33 X XX XX XX XX
      if (nationalNumber.length > 0) {
        formatted += nationalNumber.substring(0, 1);
        if (nationalNumber.length > 1) {
          formatted += ' ' + nationalNumber.substring(1, 3);
          if (nationalNumber.length > 3) {
            formatted += ' ' + nationalNumber.substring(3, 5);
            if (nationalNumber.length > 5) {
              formatted += ' ' + nationalNumber.substring(5, 7);
              if (nationalNumber.length > 7) {
                formatted += ' ' + nationalNumber.substring(7, 9);
              }
            }
          }
        }
      }
      break;
      
    default:
      // Default formatting
      formatted += nationalNumber;
      break;
  }
  
  return formatted;
}

export function validatePhoneNumber(phoneNumber: string, country: CountryCode): boolean {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const prefix = country.prefix.replace('+', '');
  
  // Check if number starts with country code
  if (!cleaned.startsWith(prefix)) {
    return false;
  }
  
  const nationalNumber = cleaned.substring(prefix.length);
  
  // Country-specific validation
  switch (country.code) {
    case 'DE':
      return nationalNumber.length >= 10 && nationalNumber.length <= 11;
    case 'AT':
      return nationalNumber.length >= 9 && nationalNumber.length <= 11;
    case 'CH':
      return nationalNumber.length === 9;
    case 'RS':
      return nationalNumber.length >= 8 && nationalNumber.length <= 9;
    case 'FR':
      return nationalNumber.length === 9;
    default:
      return nationalNumber.length >= 7 && nationalNumber.length <= 15;
  }
}

export function normalizePhoneNumber(phoneNumber: string): string {
  // Return clean international format
  return phoneNumber.replace(/\s/g, '');
}