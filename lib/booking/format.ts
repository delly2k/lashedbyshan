export function formatPriceJmd(price: number): string {
  return `J$${price.toLocaleString('en-JM')}`;
}
