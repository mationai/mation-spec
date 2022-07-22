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
      move a;
      do [
        fold points:[3] 90 over-edges:[16];
        unfold points:[0] 90 over-edges:[18];
      ];
      move c;
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
    steps: [
      ['move', 'a'],
      ['do', [
        ['fold', {points:[3]}, 90, {'over-edges':[16]}],
        ['unfold', {points:[0]}, 90, {'over-edges':[18]}],
      ]],
      ['move', 'c', ],
    ]
  })
})