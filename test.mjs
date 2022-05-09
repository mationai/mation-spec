import { parse } from './src/api'
import path from 'path'
import fs from 'fs'

const lv1Text = fs.readFileSync(path.join('.', 'depth1.test.mation'))
const lv2Text = fs.readFileSync(path.join('.', 'depth2.test.mation'))
const parsed = parse(lv1Text)
console.log(parsed.result)