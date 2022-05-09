import ohm from 'ohm-js'

const toAST = ohm.extras.toAST
const parse = {}
const parser = {
  match: null // set in .parse()
}
export default parser

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
  }
  throw new Error(`literal of type: ${ctorName} requires handling`)
}
parse.Array = (iterNode={}) => {
  return iterNode.ctorName === 'Commands'
    ? parse.Commands(iterNode)
    : iterNode.children.map(c => parse.singleValue(c))
}
// TODO - merge w/ singleValue
parse.Value = (Value={}) => {
  const node = Value.child(0)
  switch (node.ctorName) {
    case 'literal':
      return parse.literal(node)
  }
  throw new Error(`Value of type: ${node.ctorName} requires handling`)
}
parse.singleValue = (node={}) => {
  switch (node.ctorName) {
    case '_terminal':
      return node.sourceString
    case 'literal':
      return parse.literal(node)
    case 'Value':
      return parse.Value(node)
    case 'identifier':
      return String(node.sourceString)
    case 'List':
    case 'Array':
      return parse.Array(node.child(1))
  }
  throw new Error(`Single value of ${node.ctorName} requires handling in parse.singleValue`)
}

parse.Commands = (CommandsNode={}) => {
  const resultValue = []
  for (let Command of CommandsNode.child(0).children) {
    const [identifier, Values] = Command.children
    const args = []

    for (let valuesIter of Values.child(0).children) {
      const Value = valuesIter.child(0)
      switch (Value.ctorName) {
        case 'List':
        case 'Array': {
          const argChilds = Value.child(1).child(0).children
          args.push(argChilds.map(c => parse.singleValue(c)))
          //* parse.singleValue will throw Unsupported error if nested list/array
          break
        }
        case 'KeyValuesBraced': {
          const argChilds = Value.child(1).child(0).children
          let arg = {}
          for (let c of argChilds) {
            const KeyValue = c.child(0)?.ctorName === 'KeyValue'
              ? c.child(0) // single KeyValuesBraced
              : c
            if (KeyValue.child(0)?.ctorName !== '_terminal')
              arg = { ...arg, ...KeyValue.toAST(mapping) }
          }
          args.push(arg)
          break
        }
        case 'KeyValue': {
          const argChilds = Values.child(0).children
          let arg = {}
          for (let c of argChilds)
            arg = { ...arg, ...c.child(0).toAST(mapping)}
          if (!args.length)
            args.push(arg)
          break
        }
        default: {
          args.push(parse.singleValue(Value))
          break
        }
      }
    }
    resultValue.push([identifier.sourceString, ...args])
  }
  return resultValue
}

/**
 * Mapping for global Program entries (only)
 */
const mapping = {
  KeyValue: function(Key, _colon, Value) {
    const keyNode = Key.child(0)
    const valNode = Value.child(0)

    let keyStr = keyNode.sourceString
    if (keyNode.ctorName === 'stringLiteral')
      keyStr = keyStr.slice(1, -1)

    switch (valNode.ctorName) {
      case 'identifier':
        return { [keyStr]: valNode.sourceString }
      case 'literal':
        return { [keyStr]: parse.literal(valNode) }
      case 'KeyValue':
        return { [keyStr]: parse.Value(valNode) }//.child(0)) }
      case 'KeyValuesBraced':
        return { [keyStr]: parse.Value(valNode.child(1)) }
      case 'List':
      case 'Array':
        return { [keyStr]: parse.Array(valNode.child(1)) }
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
  parser.match = g.match
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