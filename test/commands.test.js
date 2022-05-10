import { test, expect } from 'vitest'
import { parse } from '../src/api'

test(`Commands - Single argument`, () => {
  expect(parse(`do: [ // comment after '['
    move 1 2;
    move [1 2];
    move [[1 2]];
  ]`).result)
  .toStrictEqual({ do: [
    ['move', 1, 2],
    ['move', [1, 2]],
    ['move', [[1, 2]]],
  ]})
})

test(`Commands - 1-liner w/ random comma between args`, () => {
  expect(parse(`do: [ move 1 2,  3 -4; ]`).result)
  .toStrictEqual({ do: [
    ['move', 1, 2, 3, -4],
  ]})
})

test(`Commands - Variations of array/list args`, () => {
  expect(parse(`do: [
    move [1,2] [3 -4];
    move [1 2],[3 -4];
    move [1 2] [3 -4]; // comment last line
  ]`).result)
  .toStrictEqual({ do: [
    ['move', [1, 2], [3, -4]],
    ['move', [1, 2], [3, -4]],
    ['move', [1, 2], [3, -4]],
  ]})
})

test(`Commands - Variations of Single keyvalues map arg`, () => {
  expect(parse(`do: [
    turn { x:1, y:2 };
    turn { x:1  y:2 };
    // comment before ']'
  ]`).result)
  .toStrictEqual({ do: [
    ['turn', {x: 1, y: 2}],
    ['turn', {x: 1, y: 2}],
  ]})
})

test(`Commands - Variations of Multiple single keyvalues map args`, () => {
  expect(parse(`do: [
    turn x:1, y:2;
    turn x:1  y:2;
    turn {x:1} {y:2};
  ] // comment after ']'`).result)
  .toStrictEqual({ do: [
    ['turn', {x: 1}, {y: 2}],
    ['turn', {x: 1}, {y: 2}],
    ['turn', {x: 1}, {y: 2}],
  ]})
})

test(`Commands - Variations of Multiple keyvalues map args`, () => {
  expect(parse(`do: [
    turn { x:1  y:2 } { how: {speed:1 angle:2}} onError: 'Stuck!';
    turn onError: 'Stuck!' { x:1  y:2 } { how: {speed:1 angle:2}};
  ]`).result)
  .toStrictEqual({ do: [
    ['turn', {x:1, y:2}, {how: {speed:1, angle:2}}, {onError: 'Stuck!'}],
    ['turn', {onError: 'Stuck!'}, {x:1, y:2}, {how: {speed:1, angle:2}}],
  ]})
})

test(`Commands - Mixed strings and values args`, () => {
  expect(parse(`do: [
    turn left 1 right 2;
  ]`).result)
  .toStrictEqual({ do: [
    ['turn', 'left', 1, 'right', 2],
  ]})
})