import { test, expect } from 'vitest'
import { parse } from '../src/api'

test(`Nested - Mostly emtpy structures, with good mix of comma/no-comma`, () => {
  expect(parse(`
    /** md **
     */
    model: {
      dimensions: letter
      creases: {
        method: acrossPoints
        valueType: index,
        values: [
          [0 1] //1
        ]
      },
    },
    tweenDuration: {
    }
    steps: [
    ]
  `).result)
  .toStrictEqual({
    model: {
      dimensions: 'letter',
      creases: {
        method: 'acrossPoints',
        valueType: 'index',
        values: [[0, 1]],
      },
    },
    tweenDuration: {},
    steps: [],
  })
})