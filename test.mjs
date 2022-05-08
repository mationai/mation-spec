import ohm from 'ohm-js'
import path from 'path'
import fs from 'fs'

const grammarText = fs.readFileSync(path.join('.', 'mationGrammar.ohm'))
const g = ohm.grammar(grammarText)

const lv1Text = fs.readFileSync(path.join('.', 'depth1.test.mation'))
const lv2Text = fs.readFileSync(path.join('.', 'depth2.test.mation'))

const commandsInfo = (nodes=[]) => {
  const res = {
    nonCommands: new Set(),
  }
  let commandsLen = 0
  let hasCommands = false
  for (let node of nodes) {
    console.log(node.ctorName)
    if (node.ctorName === 'Command') { // _iter if not named
      commandsLen++
      hasCommands = true
    }
    else res.nonCommands.add(node.ctorName)
  }
  res.isAllCommands = commandsLen === nodes.length
  res.onlySomeCommands = hasCommands && !res.isAllCommands
  console.log(res.isAllCommands)
  return res
}

const parseLiteral = (literal={}) => {
  const { ctorName, sourceString } = literal.child(0)
  switch (ctorName) {
    case 'nullLiteral':
      return null
    case 'booleanLiteral':
      return sourceString === 'true'
    case 'numericLiteral':
      return Number(sourceString)
    case 'stringLiteral':
      return child.sourceString.slice(1, -1)
    default:
      throw new Error(`Literal value of type: ${ctorName} requires handling`)
  }
}

const parseValue = (Value={}) => {
  const n = Value.child(0)
  switch (n.ctorName) {
    case 'literal':
      return parseLiteral(n)
    default:
      throw new Error(`Literal value of type: ${n.ctorName} requires handling`)
  }
}
const parseSingleton = (node={}) => {
  if (node.ctorName === 'literal')
    return parseLiteral(node)
  else if (node.ctorName === 'Value')
    return parseValue(node)
  else if (node.ctorName === 'identifier')
    return String(node.sourceString)
  else throw new Error(`Type: ${node.ctorName} requires handling in parseSingleton`)
}

/**
 ** NOTE: Using mapping due to not able to get the semantics method to work. PRs welcome!
 */
const mapping = {
  KeyValue: function(_key, _colon, _val) {
    const key = _key.child(0)
    const val = _val.child(0)
    let Key = key.sourceString
    let Value

    if (key.ctorName === 'stringLiteral')
      Key = Key.slice(1, -1)

    switch (val.ctorName) {
      case 'identifier':
        return { [Key]: val.sourceString }
      case 'literal':
        return { [Key]: parseLiteral(val) }
      case 'KeyValuesBraced':
        return { [Key]: Value } //* OK?
      case 'Array':
      case 'List': { // Should probably be its own mapping entry..
        const pluralNode = val.child(1)
        const childs = pluralNode.child(0).children
        const cmdInfo = commandsInfo(childs)
        if (cmdInfo.onlySomeCommands)
          throw new Error(`Commands must not be mixed with non-command types (${cmdInfo.nonCommands})`)

        if (!cmdInfo.isAllCommands)
          return {
            [Key]: 
            childs.map(node => parseSingleton(node))
          }

        // isAllCommands
        const parsed = []
        for (let cmdNode of childs) {
          const [identifier, Values] = cmdNode.children
          const args = []

          for (let c of Values.child(0).children) {
            const gChild = c.child(0)
            const gcName = c.child(0).ctorName
            if (gcName === 'List' || gcName === 'Array') {
              const argChilds = gChild.child(1).child(0).children
              args.push(argChilds.map(c => parseSingleton(c)))
              //* parseSingleton will throw Unsupported error if nested list/array
            }
            
            else if (gcName === 'KeyValuesBraced') {
              const argChilds = gChild.child(1).child(0).children
              let arg = {}
              for (let c of argChilds) {
                const KeyValue = c.child(0)?.ctorName === 'KeyValue'
                  ? c.child(0) // single KeyValuesBraced
                  : c
                if (KeyValue.child(0)?.ctorName !== '_terminal')
                  arg = { ...arg, ...KeyValue.toAST(mapping) }
              }
              args.push(arg)
            }
            else if (gcName === 'KeyValue') {
              const argChilds = Values.child(0).children
              let arg = {}
              for (let c of argChilds) {
                arg = { ...arg, ...c.child(0).toAST(mapping)}
              }
              if (!args.length)
                args.push(arg)
            }
            else {
              args.push(parseSingleton(gChild))
            }
          }

          parsed.push({
            command: identifier.sourceString,
            args,
          })
        }
        return { [Key]: parsed}
      }
      default:
        throw new Error(`case ${val.ctorName} requires handling`)
    }
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
const matchLv1 = g.match(lv1Text)
const matchLv2 = g.match(lv2Text)

if (!matchLv1.succeeded()) console.error('Match failed: '+matchLv1.message)
if (!matchLv2.succeeded()) console.error('Match failed: '+matchLv2.message)

const rawLv1AST = toAST(matchLv1)
const rawLv2AST = toAST(matchLv2)
const mappedLv1AST = toAST(matchLv1, mapping).map(o => ({ value: o[0], type: o.type }))
const mappedLv2AST = toAST(matchLv2, mapping)

for (let { value, type } of mappedLv1AST) {
  if (type !== 'markdown') {
    console.log(JSON.stringify(value, null, 2))
  }
}
// for (const res of mappedLv2AST) console.log(res)

const rawLv1Filtered = rawLv1AST.filter(res => typeof(res) !== 'string')