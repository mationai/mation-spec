import ohm from 'ohm-js'
import parser from './parser'
import grammar from './mationGrammar.ohm?raw'

/**
 * @returns {
 *   result: Parsed AST output of @userText
 *   markdowns: Markdown sections text of @userText, if @outputMD=true
 *   AST: AST output of @userText, if @outputAST=true
 * }
 * @param {String} userText - .mation file text 
 * @param {
 *   grammarText: (String) - will try to load true, add .AST to output
 *   outputAST: (false) - if true, add .AST to output
 *   outputMD: (false) - if true, add .markdowns to output
 * } options 
 */ 
export const parse = (userText='', options={}) => {
  const g = ohm.grammar(typeof(options.grammarText)==='string'
    ? options.grammarText
    : grammar
  )
  const res = parser.parse(userText, g, options)
  return res
}