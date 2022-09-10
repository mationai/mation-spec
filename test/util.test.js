import { test, expect } from 'vitest'
import { round } from '../src/parser'

test(`round`, () => {
  const eg1 = 12.3 / 100
  expect(eg1).toBe(0.12300000000000001)
  expect(round(eg1)).toBe(0.123)
})
