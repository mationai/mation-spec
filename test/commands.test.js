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

test(`Commands - Variations of Array args`, () => {
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
    turn left -1.23 right 2;
    move [1] 12.3% [2] -.5% beyond:[1 2];
    move [1] 1/3 forward 11/111 back;
    move [0] deg:45 1/3 to [4];
  ]`).result)
  .toStrictEqual({ do: [
    ['turn', 'left', -1.23, 'right', 2],
    ['move', [1], .123, [2], -.005, { beyond: [1, 2] }],
    ['move', [1], 0.3333333333333333, 'forward', 0.0990990990990991, 'back'],
    ['move', [0], {deg: 45}, 0.3333333333333333, 'to', [4]],
  ]})
})