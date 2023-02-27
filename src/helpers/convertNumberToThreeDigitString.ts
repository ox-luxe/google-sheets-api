export function convertNumberToThreeDigitString(number: number) {
  const digits = number.toString().length;
  if (digits === 1) return "00" + number;
  if (digits === 2) return "0" + number;
  return number.toString();
}
