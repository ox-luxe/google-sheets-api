export function getCurrentMonth() {
  // Jan -> 0, Feb - 1, Mar - 2, and so on..
  return new Date().getMonth() + 1;
}
