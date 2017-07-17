const values = ['a', 'b', 'c']

const result = values.reduce((acc, value) => ({
  ...acc,
  [value]: () => value.toUpperCase()
}), {})

console.log(result.a())
