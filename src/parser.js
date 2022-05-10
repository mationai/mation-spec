import ohm from 'ohm-js'

const toAST = ohm.extras.toAST
const parse = {}
const parser = {}
export default parser

const innerChilds = (node={}) => {
  return node.child(1).child(0).children // child(1) left-terminal, eg. [, {, <, (
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
      return sourceString.slice(1, -1)
  }
  throw new Error(`Handler missing for literal of type: ${ctorName}`)
}

parse.List = (iterNode={}) => {
  if (iterNode.ctorName === 'Commands')
    return iterNode.child(0).children.map(c => parse.Command(c))
  if (iterNode.ctorName === 'Values')
    return iterNode.child(0).children.map(c => parse.Value(c))
  return iterNode.children.map(c => parse.Value(c))
}

parse.KeyValue = (Key, Value) => {
  const key = Key.child(0)
  const value = Value.child(0)
  const keyStr = key.ctorName === 'stringLiteral'
    ? key.sourceString.slice(1, -1)
    : key.sourceString
  return { [keyStr]: parse.Value(value) }
},

parse.KeyValuesMap = (node) => {
  let arg = {}
  for (let child of innerChilds(node))
    arg = { ...arg, ...child.toAST(mapping) }
  return arg
}

parse.Value = (node={}) => {
  switch (node.ctorName) {
    case 'literal':
      return parse.literal(node)
    case 'Value':
      return parse.Value(node.child(0))
    case 'identifier':
      return String(node.sourceString)
    case 'List':
      return parse.List(node.child(1))
    case 'KeyValue':
      return parse.KeyValue(node.child(0), node.child(2))
    case 'KeyValuesMap':
      return parse.KeyValuesMap(node)
  }
  throw new Error(`Handler missing for Value of type: ${node.ctorName}`)
}

parse.Command = (Command={}) => {
  const [identifier, Values] = Command.children
  const res = [identifier.sourceString]

  for (let valuesIter of Values.child(0).children) {
    const Value = valuesIter.child(0)
    switch (Value.ctorName) {
      case 'List':
        res.push(innerChilds(Value).map(c => parse.Value(c)))
        break
      case 'KeyValuesMap': {
        res.push(parse.KeyValuesMap(Value))
        break
      }
      default: {
        res.push(parse.Value(Value))
        break
      }
    }
  }
  return res
}

/**
 * Mapping for initial match only
 */
const mapping = {
  KeyValue: (Key, _colon, Value) => {
    return parse.KeyValue(Key, Value)
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