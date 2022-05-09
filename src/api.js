import path from 'path'
import fs from 'fs'
import ohm from 'ohm-js'
import parser from './parser'

/**
 * @returns {
 *   result: Parsed AST output of @userText
 *   markdowns: Markdown sections text of @userText, if @outputMD=true
 *   AST: AST output of @userText, if @outputAST=true
 * }
 * @param {String} userText - .mation file text 
 * @param {
 *   outputAST: (false) - if true, add .AST to output
 *   outputMD: (false) - if true, add .markdowns to output
 * } options 
 */ 
export const parse = (userText='', options={}) => {
  const grammarText = options.ohmGrammar ||
    fs.readFileSync(path.join(__dirname, 'mationGrammar.ohm'))
  const g = ohm.grammar(grammarText)

  const res = parser.parse(userText, g, options)
  return res
}