import ohm from 'ohm-js'
import path from 'path'
import fs from 'fs'

const grammarText = fs.readFileSync(path.join('.', 'ecsGrammar.ohm'))
const g = ohm.grammar(grammarText)

const cfgInput = fs.readFileSync(path.join('.', 'testAll.action'))

const mapping = {
  // numericLiteral: function(s) {
  //   return Number(s)
  // },
  KeyValue: (key, _colon, value) => {
    const child = key.child(0)
    switch (child.ctorName) {
      case 'ident':
      case 'numericLiteral':
        return key.sourceString
      case 'stringLiteral':
        return key.sourceString.slice(1, -1)
      default:
        throw new Error(`KeyValue: key type: ${child.ctorName} needs handling`)
    } 
      // val: value.sourceString,
    // {
    //   key_nodes: key._node,
    //   val_nodes: value._node,
    //   key_nodes_children: key._node.children,
    //   val_nodes_children: value._node.children,
    //   key_nodes_child0: key._node.children[0],
    //   val_nodes_child0: value._node.children[0],
    // })
  },
  // Alt: function(x, _, xs) {
  //   return [x.toAST(this.args.mapping)].concat(xs.toAST(this.args.mapping));
  // },
  // Base_application: {type: 'Application', name: 0, params: function(children) {
  //   var params = children[1].toAST(this.args.mapping);
  //   return params && params.map(function(seq) {
  //     return seq.elems[0]; // can only have arity 1
  //   });
  // }},
}

// const semantics = g.createSemantics();
const toAST = ohm.extras.toAST
const match = g.match(cfgInput);
if (!match.succeeded()) {
  console.error('Match failed: '+match.message)
}

const rawAST = toAST(match)
const mappedAST = toAST(match, mapping)
// { KeyValue: (a, b, c, d) => {
//   return { key: a, value: c }
// }})
for (const res of mappedAST) {
  console.log(res)
}
console.log(rawAST)
//[
//   [
//     { '0': 'a', '2': '1', '3': null, type: 'KeyValue' },
//     { '0': '"a .."', '2': '2', '3': null, type: 'KeyValue' },
//     { '0': '"key"', '2': '3', '3': null, type: 'KeyValue' },
//     { '0': 'a', '2': '2', '3': null, type: 'KeyValue' },
//     { '0': 'z', '2': [Object], '3': null, type: 'KeyValue' },
//     { '0': 'z', '2': [Object], '3': null, type: 'KeyValue' },
//     { '0': 'c', '2': [Object], '3': null, type: 'KeyValue' },
//     { '0': 'd', '2': [Array], '3': null, type: 'KeyValue' },
//     { '0': 'a5', '2': '5', '3': null, type: 'KeyValue' },
//     { '0': 'd', '2': [Object], '3': null, type: 'KeyValue' },
//     { '0': 'e', '2': [Array], '3': null, type: 'KeyValue' },
//     { '0': 'a', '2': '1', '3': ',', type: 'KeyValue' },
//     { '0': '"b"', '2': '2', '3': null, type: 'KeyValue' },
//     { '0': 'do', '2': [Object], '3': null, type: 'KeyValue' }
//   ]
// ]
