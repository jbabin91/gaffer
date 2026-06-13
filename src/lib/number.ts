/** A NumberField reports NaN when cleared; treat that as "no value". */
export function numberOrUndefined(value: number): number | undefined {
  return Number.isNaN(value) ? undefined : value;
}
