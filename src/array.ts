export function range(size: number): Array<number> {
  return [...Array(size).keys()]
}

export function swap<T>(a: Array<T>, x: number, y: number): Array<T> {
  let xValue = a[x]
  let yValue = a[y]
  let aCopy = [...a]
  aCopy[x] = yValue
  aCopy[y] = xValue
  return aCopy
}

export function shuffle<T>(a: Array<T>): Array<T> {
  return a
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}
