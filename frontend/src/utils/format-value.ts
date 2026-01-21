export const formatValue = (value: number | string): string => {
  if (typeof value === 'number') {
    return value.toFixed(1);
  }
  const num = parseFloat(value);
  return isNaN(num) ? value : num.toFixed(1);
};
