export type Shrinker<T> = (value: T) => T[];

function seriesInt(from: number, to: number): number[] {
  if (from >= to) {
    return [];
  }

  if (from == to - 1) {
    return [from];
  }

  const nextFrom = from + Math.floor((to - from) / 2);

  return [from]
    .concat(seriesInt(nextFrom, to));
}


export const int: Shrinker<number> = (n) => {
  if (n < 0) {
    return [-n].concat(seriesInt(0, -n).map(x => -1 * x))
  }

  return seriesInt(0, n);
}

export const bool: Shrinker<boolean> = (b) => {
  return b ? [false] : [];
}

export const char: Shrinker<string> = (c) => {
  return int(c.charCodeAt(0))
    .map(x => String.fromCharCode(x));
}
