const date = new Date();
console.log('Current date:', date.toString());
console.log('UTC date:', date.toUTCString());
console.log('getUTCFullYear():', date.getUTCFullYear());
console.log('getUTCMonth():', date.getUTCMonth());
console.log('getUTCDate():', date.getUTCDate());
console.log('getUTCHours():', date.getUTCHours());

console.log('\nDate calculations for seed (i=0,1,2):');
for (let i = 0; i < 3; i++) {
  const utcDate = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() - i,
    0, 0, 0, 0
  ));
  console.log('i=' + i + ':', utcDate.toISOString().split('T')[0]);
}

console.log('\nWhat we need for April 7:');
const aprilSeven = new Date(Date.UTC(2026, 3, 7, 0, 0, 0, 0));
console.log('Explicit April 7:', aprilSeven.toISOString().split('T')[0]);
