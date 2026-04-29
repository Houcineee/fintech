export const formatMoney = (value: number): string => {
  const formatted = new Intl.NumberFormat("ar-MA").format(Math.abs(value));
  if (value < 0) {
    return `-${formatted} د.م`;
  }
  return `${formatted} د.م`;
};

export const formatCurrency = (value: number) => {
  const formatted = new Intl.NumberFormat("ar-MA").format(Math.abs(value));
  if (value < 0) {
    return `-${formatted} MAD`;
  }
  return `${formatted} MAD`;
};