function getMonthName(monthNumber: string) {
  const date = new Date();
  date.setMonth(Number(monthNumber) - 1);

  return date.toLocaleString("en-US", {
    month: "short",
  });
}

export { getMonthName };
