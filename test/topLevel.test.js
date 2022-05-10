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

test.skip(`Top level - quoted keys`, () => {
  expect(parse(`
    "akey": 2,   // double quotes
    'key2': 2,   // single quotes
    '"k"' : 2,   // double within single quotes
    "'k'" : 2,   // single within double quotes
    // "\"k" : 2,   // use escape character will appear vebatem as is
  `).result)
  .toStrictEqual({
    "akey": 2,
    'key2': 2,
    '"k"' : 2,
    "'k'" : 2,
    // "\"k" : 2,
  })
})
