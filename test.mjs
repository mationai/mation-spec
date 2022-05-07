import ohm from 'ohm-js'
import path from 'path'
import fs from 'fs'

const grammarText = fs.readFileSync(path.join('.', 'mation.ohm'))
const g = ohm.grammar(grammarText)

const lv1Mation = fs.readFileSync(path.join('.', 'depth1.test.mation'))
const lv2Mation = fs.readFileSync(path.join('.', 'depth2.test.mation'))

const mapping = {
  KeyValue: (_key, _colon, _val) => { 
    let key = _key.child(0)
    let Key = key.sourceString
    if (key.ctorName === 'stringLiteral')
      Key = Key.slice(1, -1)

    let Value
    const val = _val.child(0)
    if (val.ctorName === 'identifier') {
       return { [Key]: val.sourceString }
    }
    else if (val.ctorName === 'literal') {
      const child = val.child(0)
      switch (child.ctorName) {
        case 'nullLiteral':
          return { [Key]: null }
        case 'booleanLiteral':
          return { [Key]: child.sourceString === 'true' }
        case 'numericLiteral':
          return { [Key]: Number(child.sourceString) }
        case 'stringLiteral':
          return { [Key]: child.sourceString.slice(1, -1) }
        default:
          throw new Error(`Value of type: ${child.ctorName} requires handling`)
      }
    }
    else if (val.ctorName === 'Array' || val.ctorName === 'List') {
      Value = val.children.map(function(child) {
        return child.toAST(mapping);
        // return child.toAST(this.args.mapping);
            }, this)
    }
    else console.log(val.ctorName)
  return { [Key]: Value}
  },
  markdown: (_0, s, _1) => {
    return {
      type: 'markdown',
      value: s.sourceString,
    }
  }
}

// const semantics = g.createSemantics();
const toAST = ohm.extras.toAST
const matchLv1 = g.match(lv1Mation)
const matchLv2 = g.match(lv2Mation)

if (!matchLv1.succeeded()) console.error('Match failed: '+matchLv1.message)
if (!matchLv2.succeeded()) console.error('Match failed: '+matchLv2.message)

const rawLv1AST = toAST(matchLv1)
const rawLv2AST = toAST(matchLv2)
const mappedLv1AST = toAST(matchLv1, mapping).map(o => ({ value: o[0], type: o.type }))
const mappedLv2AST = toAST(matchLv2, mapping)

for (let { value, type } of mappedLv1AST) {
  if (type !== 'markdown') {
    if (value[0]?.a !== 1)
      console.log(value)
    else
      console.log(JSON.stringify(value, null, 2))
  }
}

// for (const res of mappedLv2AST) console.log(res)

const rawLv1Filtered = rawLv1AST.filter(res => typeof(res) !== 'string')
// console.log('raw', JSON.stringify(rawLv1Filtered, null, 2))