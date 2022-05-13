// import ohm from 'ohm-js'
import extras from 'ohm-js/extras'

const toAST = extras.toAST
// const toAST = ohm.extras.toAST
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

parse.List = (iter={}) => {
  if (iter.ctorName === 'Commands')
    return iter.child(0).children.map(c => parse.Command(c))
  if (iter.ctorName === 'Values')
    return iter.child(0).children.map(c => parse.Value(c))
  return iter.children.map(c => parse.Value(c))
}

parse.KeyValue = (Key={}, Value={}) => {
  const key = Key.child(0)
  const value = Value.child(0)
  const keyStr = key.ctorName === 'stringLiteral'
    ? key.sourceString.slice(1, -1)
    : key.sourceString
  return { [keyStr]: parse.Value(value) }
},

parse.Map = (node={}, nodeIsKeyValues=false) => {
  let res = {}
  const childs = nodeIsKeyValues
    ? node.children
    : innerChilds(node)
  for (let c of childs)
    res = { ...res, ...parse.KeyValue(c.child(0), c.child(2)) }
  return res
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
    case 'Map':
      return parse.Map(node)
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
      case 'Map': {
        res.push(parse.Map(Value))
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
 * Mapping for top-level match only
 */
const mapping = {
  KeyValues: (KeyValues, _comma) => {
    return {
      type: 'Map',
      value: parse.Map(KeyValues, true)
    }
  },
  markdown: (_0, node, _1) => {
    return {
      type: 'Markdown',
      value: node.sourceString,
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
  if (!match.succeeded())
    console.error('Match failed: '+match.message)

  const { outputAST, outputMD } = options
  const markdowns = []
  const mappedAST = toAST(match, mapping)
  let result = {}

  for (let o of mappedAST) {
    if (o.type  === 'Markdown')
      markdowns.push(o.value)
    else
      result = { ...result, ...o.value }
  }

  const out = { result }
  if (outputAST)
    out.AST = toAST(match)
  if (outputMD)
    out.markdowns = markdowns
  return out
}