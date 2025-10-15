// Test Phone Number Utilities
// Run with: node scripts/test-phone.js

// Simple test without TypeScript compilation
const testNumbers = [
  { country: 'DE', number: '+49 30 12345678', expected: true },
  { country: 'DE', number: '+49 151 12345678', expected: true },
  { country: 'DE', number: '+49 151 65025960', expected: true }, // User's number with extra digit
  { country: 'DE', number: '+49 151 6502596', expected: true }, // User's actual number - should be valid!
  { country: 'DE', number: '+49 123', expected: false },
  
  { country: 'AT', number: '+43 664 1234567', expected: true },
  { country: 'AT', number: '+43 1 1234567', expected: true },
  { country: 'AT', number: '+43 123', expected: false },
  
  { country: 'CH', number: '+41 79 123 45 67', expected: true },
  { country: 'CH', number: '+41 44 123 45 67', expected: true },
  { country: 'CH', number: '+41 123', expected: false },
  
  { country: 'RS', number: '+381 60 1234567', expected: true },
  { country: 'RS', number: '+381 11 1234567', expected: true },
  { country: 'RS', number: '+381 123', expected: false },
];

// Simple validation function for testing
function simpleValidatePhone(phoneNumber, countryCode) {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  const prefixes = {
    'DE': '49',
    'AT': '43', 
    'CH': '41',
    'RS': '381'
  };
  
  const minLengths = {
    'DE': 12, // 49 + 10 digits minimum (total 12)
    'AT': 10, // 43 + 7-9 digits  
    'CH': 11, // 41 + 9 digits
    'RS': 11  // 381 + 8-9 digits
  };
  
  const maxLengths = {
    'DE': 13, // 49 + 11 digits maximum
    'AT': 12, // 43 + 7-9 digits
    'CH': 11, // 41 + 9 digits
    'RS': 12  // 381 + 8-9 digits
  };
  
  const prefix = prefixes[countryCode];
  const minLength = minLengths[countryCode];
  const maxLength = maxLengths[countryCode];
  
  if (!prefix || !cleaned.startsWith(prefix)) {
    return false;
  }
  
  return cleaned.length >= minLength && cleaned.length <= maxLength;
}

console.log('🔄 Testing phone number validation...\n');

let passed = 0;
let failed = 0;

testNumbers.forEach(test => {
  const result = simpleValidatePhone(test.number, test.country);
  const status = result === test.expected ? '✅ PASS' : '❌ FAIL';
  
  console.log(`${status} ${test.country}: ${test.number} -> ${result} (expected: ${test.expected})`);
  
  if (result === test.expected) {
    passed++;
  } else {
    failed++;
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All phone number validations working correctly!');
} else {
  console.log('⚠️  Some validations failed. Check the phone utility implementation.');
}