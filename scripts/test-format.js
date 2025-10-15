// Test phone formatting specifically for user's number
console.log('🔄 Testing phone formatting...\n');

// Simulate the German formatting logic
function testFormatPhoneNumber(value, countryPrefix = '+49') {
  console.log(`Input: "${value}"`);
  
  // Remove all non-numeric characters
  const cleaned = value.replace(/\D/g, '');
  console.log(`Cleaned: "${cleaned}"`);
  
  const prefix = countryPrefix.replace('+', ''); // '49'
  
  let nationalNumber = '';
  
  if (cleaned.startsWith(prefix)) {
    // Number already has country code
    nationalNumber = cleaned.substring(prefix.length);
    console.log(`National number (with country code): "${nationalNumber}"`);
  } else if (cleaned.startsWith('0')) {
    // National format (remove leading 0)
    nationalNumber = cleaned.substring(1);
    console.log(`National number (remove 0): "${nationalNumber}"`);
  } else {
    nationalNumber = cleaned;
    console.log(`National number (as is): "${nationalNumber}"`);
  }
  
  // Apply German formatting: +49 XXX XXXXXXXX
  let formatted = countryPrefix + ' ';
  
  if (nationalNumber.length > 0) {
    formatted += nationalNumber.substring(0, 3);
    if (nationalNumber.length > 3) {
      formatted += ' ' + nationalNumber.substring(3, 11); // Allow up to 11 digits
    }
  }
  
  console.log(`Final formatted: "${formatted}"`);
  console.log(`Length: ${formatted.replace(/\D/g, '').length} digits total\n`);
  
  return formatted;
}

// Test with your number variations
console.log('=== Test 1: Your complete number ===');
testFormatPhoneNumber('+49 151 6502596');

console.log('=== Test 2: Input simulation step by step ===');
const steps = [
  '151',
  '1516',
  '15165',
  '151650',
  '1516502',
  '15165025',
  '151650259',
  '1516502596'
];

steps.forEach((step, i) => {
  console.log(`Step ${i + 1}:`);
  testFormatPhoneNumber(step);
});

console.log('=== Test 3: With country code included ===');
testFormatPhoneNumber('491516502596');