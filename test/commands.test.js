import { test, expect } from 'vitest'
import { parse } from '../src/api'

// TODO: (( )) & [[ ]]
test(`Commands - Single argument`, () => {
  expect(parse(`do: ( // comment after '('
    move 1 2;
    move [1 2];
  )`).result)
  .toStrictEqual({ do: [
    ['move', 1, 2],
    ['move', [1, 2]],
  ]})
})

test(`Commands - Random commas in a 1-liner`, () => {
  expect(parse(`do: ( move 1 2,  3 -4; )`).result)
  .toStrictEqual({ do: [
    ['move', 1, 2, 3, -4],
  ]})
})

test(`Commands - Pairs of array/lists`, () => {
  expect(parse(`do: (
    move [1,2] [3 -4];
    move [1 2] [3 -4];
    move (1 2) (3,-4);
    move (1 2) (3 -4); // comment last line
  )`).result)
  .toStrictEqual({ do: [
    ['move', [1, 2], [3, -4]],
    ['move', [1, 2], [3, -4]],
    ['move', [1, 2], [3, -4]],
    ['move', [1, 2], [3, -4]],
  ]})
})

test(`Commands - Single keyvalues map`, () => {
  expect(parse(`do: (
    turn { x:1, y:2 };
    turn x:1, y:2;
    // comment before ')'
  )`).result)
  .toStrictEqual({ do: [
    ['turn', {x: 1, y: 2}],
    ['turn', {x: 1, y: 2}],
  ]})
})

test(`Commands - Multiple keyvalue maps`, () => {
  expect(parse(`do: (
    turn { x:1},{y:2 };
  ) // comment after')'`).result)
  .toStrictEqual({ do: [
    ['turn', {x: 1}, {y: 2}],
  ]})
})

test(`Commands - Mixed strings and value args`, () => {
  expect(parse(`do: (
    turn left 1 right 2;
  )`).result)
  .toStrictEqual({ do: [
    ['turn', 'left', 1, 'right', 2],
  ]})
})