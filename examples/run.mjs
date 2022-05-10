import { parse } from './src/api'
import path from 'path'
import fs from 'fs'

const mationFiles = [
  'introduction.mation',
  'nested-structures.mation',
]
for (let fname of mationFiles) {
  const text = fs.readFileSync(path.join('.', fname))
  const parsed = parse(text)
  console.log(JSON.stringify(parsed.result, null, 2))
}