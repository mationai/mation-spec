import ohm from 'ohm-js'

const parse = {}
const parser = {}
export default parser

const commandsInfo = (nodes=[]) => {
  const res = {
    nonCommands: new Set(),
  }
  let commandsLen = 0
  let hasCommands = false
  for (let node of nodes) {
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

parse.literal = (literal={}) => {
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
parse.Value = (Value={}) => {
  const n = Value.child(0)
  switch (n.ctorName) {
    case 'literal':
      return parse.literal(n)
    default:
      throw new Error(`Literal value of type: ${n.ctorName} requires handling`)
  }
}
parse.singleton = (node={}) => {
  if (node.ctorName === 'literal')
    return parse.literal(node)
  else if (node.ctorName === 'Value')
    return parse.Value(node)
  else if (node.ctorName === 'identifier')
    return String(node.sourceString)
  else throw new Error(`Type: ${node.ctorName} requires handling in parse.singleton`)
}

/**
 ** NOTE: Using mapping due to not able to get the semantics method to work. PRs welcome!
 */
const mapping = {
  KeyValue: function(_key, _colon, _val) {
    const key = _key.child(0)
    const val = _val.child(0)
    let keyStr = key.sourceString
    let Value

    if (key.ctorName === 'stringLiteral')
      keyStr = keyStr.slice(1, -1)

    switch (val.ctorName) {
      case 'identifier':
        return { [keyStr]: val.sourceString }
      case 'literal':
        return { [keyStr]: parse.literal(val) }
      case 'KeyValuesBraced':
        return { [keyStr]: Value } //* OK?
      case 'Array':
      case 'List': { // Should probably be its own mapping entry..
        const pluralNode = val.child(1)
        const childs = pluralNode.child(0).children
        const cmdInfo = commandsInfo(childs)
        if (cmdInfo.onlySomeCommands)
          throw new Error(`Commands must not be mixed with non-command types (${cmdInfo.nonCommands})`)

        if (!cmdInfo.isAllCommands)
          return {
            [keyStr]: 
            childs.map(node => parse.singleton(node))
          }

        // isAllCommands
        const resultValue = []
        for (let cmdNode of childs) {
          const [identifier, Values] = cmdNode.children
          const args = []

          for (let c of Values.child(0).children) {
            const gChild = c.child(0)
            const gcName = c.child(0).ctorName
            if (gcName === 'List' || gcName === 'Array') {
              const argChilds = gChild.child(1).child(0).children
              args.push(argChilds.map(c => parse.singleton(c)))
              //* parse.singleton will throw Unsupported error if nested list/array
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
              args.push(parse.singleton(gChild))
            }
          }

          resultValue.push([identifier.sourceString, ...args])
        }
        return { [keyStr]: resultValue}
      }
      default:
        throw new Error(`case ${val.ctorName} requires handling`)
    }
  },
  markdown: (_0, s, _1) => {
    return {
      type: 'markdown',
      text: s.sourceString,
    }
  }
}

/**
 * @returns {
 *   result: Parsed AST output of @userText
 *   markdowns: Markdown sections text of @userText, if @outputMD=true
 *   AST: AST output of @userText, if @outputAST=true
 * }
 * @param {String} userText - .mation file text 
 * @param {Ohm Grammar} g - ohm.grammar(mationGrammar) result 
 * @param {
 *   outputAST: (false) - if true, add .AST to output
 *   outputMD: (false) - if true, add .markdowns to output
 * } options 
 */
parser.parse = (userText, g, options={}) => {
  // const semantics = g.createSemantics();
  const toAST = ohm.extras.toAST
  const match = g.match(userText)
  const { outputAST, outputMD } = options

  if (!match.succeeded())
    console.error('Match failed: '+match.message)

  const mappedAST = toAST(match, mapping)
  const markdowns = []
  let result = {}

  for (let o of mappedAST) {
    if (o.type  === 'markdown')
      markdowns.push(o.text)
    else
      result = { ...result, ...o[0][0] }
  }
  const out = { result }

  if (outputAST)
    out.AST = toAST(match)
  if (outputMD)
    out.markdowns = markdowns
// console.log(JSON.stringify(out.result))
  return out
}