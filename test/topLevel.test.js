import { test, expect } from 'vitest'
import { parse } from '../src/api'

test(`Top level - KeyValues wtih identifier keys mixed with Markdowns`, () => {
  expect(parse(`
    'a': 1,      // Line comment starts with "//" and extends to end of line
    b: 1,        // Unquoted key
    "b": 2,      // Duplicate key will overwrite previous definition of b:1
    /** md **
     ...
     */
    /** md **
     ...
     */
    try-to: do,  // Can use dashed literal keys, as long as first character isn't '-'
    or: do-this, // Same with dashed literal values. Both will be parsed as quoted 
  `).result)
  .toStrictEqual({
    a: 1,
    b: 2,
    'try-to': 'do',
    or: 'do-this',
  })
})

test(`Top level - Non-JS allowed starting character identifiers`, () => {
  expect(parse(`
    #key: #val,     // #
    @key: @val,   // single quotes
  `).result)
  .toStrictEqual({
    "#key": '#val',
    '@key': '@val',
  })
})

test(`Top level - Wried quotation keys`, () => {
  expect(parse(`
    '"k"' : 2,   // double within single quotes
    "'k'" : 2,   // single within double quotes
    '\"k' : 2,   // escape characters
  `).result)
  .toStrictEqual({
    '"k"' : 2,
    "'k'" : 2,
    '\"k' : 2,
  })
})
