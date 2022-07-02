# Mation - Readable Configuration Specification Format for Automation and Task Runners

(Grammar subject to change before v1.0)

## Highlight

Mation is a simple, readable Structured Configuration Format designed to specify how to configure and call functions for automations and code generations. The best way to describe it is the human readable spec to your DSL, API and mapping interface logic. 

The goal is to be simple yet powerful and flexible engough to become the standard for its intended use case and well suited for common configuration needs.

### Documentation for Configuration

Documentation is a core concept in Mation.

For certain applications, documentation may be of much greater importance than code documentation. Yet comments inside a common configuration file such as JSON is illegal. Yes, you can hack it by adding a "_note" field to it, but this hurdle sets the percedence for developers to either not think about documentation or do so in other places where it is not readily accessible when viewing the configuration. Other configuration formats allows comments, but it is still not good enough. Documentation is not just text. Good documentation requires sectioning and styling the text to give it meaning and importance. Thus the ability to include Markdown sections is crucial. With it, you can have literal programming within configuration files.  

### Features

* Human readable commands specification
* Markdown sections for documentation
* Non-ambiguous type for values
* Much more ... (to be updated)


## Usage

```cs
yarn add mation-spec@https://github.com/fuzzthink/mation-spec/tarball/<latest> // For now
  //  where <latest> is eg. v0.1.5, see Releases for latest
yarn add 'mation-spec' // When package is published
```

```js
import parser from 'mation-spec'

const result = parser.parse(`
  a: 1,
  b: 2,    
  /** md **
  notes
  */
  c: 3,    
  /** md **
  more notes
  */
`, { outputMD: true })
// result is:
{
  result: {
    a: 1,
    b: 2,
    c: 3,
  },
  markdowns: ['notes\n', 'more notes']
}
```

See [/examples](./examples/) for more in depth examples.

### Syntax Highlighting

Syntax Highlighting is on the roadmap for major editors and readers.

You can get a surprisingly good syntax highlighing if associate Mation with Rust even though the two languages are very different. To do so in VSCode, hold `Ctrl+Shift+P` (`Cmd+Shift+P` on Mac), select "Change Language Mode", select Rust.

### Development

This project uses [yarn berry PnP](https://yarnpkg.com/features/pnp) as the package manager. It features Zero-Install, which means instead of requiring developers to install and build `node_modules`, a much smaller version of it is checked into the repo (`.pnp.*` `.yarnrc.yml`, `yarn.lock`, and `.yarn`. TLDR - No install needed, you're good to go upon checking out the repo.

```cs
yarn run dev // To watch & build
yarn run build // To build dist
yarn add pkg-name // -D for dev only dep
```

Grammar is developed with [Ohm](https://ohmjs.org/). Ohm provides an [online editor](https://ohmjs.org/editor/) where you can play around with the syntax.

### Tests

```cs
yarn test
yarn test test/some-specific.test.js // test 1 file 
```

## Overview

Top level Entries in Mation files must be either Key-value pairs or Markdown text

### Key Values 

Key-values are unordered pairs, also known as a map. They are enclosed in `{ ... }`, except for top-level entries.
You can think of top-level entries as key-value pairs enclosed in an invisible `{}`.

#### Keys

Keys can be unquoted as long as they do not contain spaces and start with legal literal characters of a..z|A..Z|0..9|'$'|'_'|'@'|
Non-starting characters can contain other legal literal characters after the first character, which includes '-'|

Duplicate keys are allowed. But API can be (later) configured to catch and throw error on duplicate keys within the same level.

#### Values 

(Revisit)
Commas are required after each but last pair, which can be inserted or omitted.

Example:
```js
'a': 1,      // Line comment starts with "//" and extends to end of line
b: 1,        // Unquoted key
"b": 2,      // Duplicate key will overwrite previous definition of b:1
try-to: do,  // Can use dashed literal keys, as long as first character isn't '-'
or: do-this, // Same with dashed literal values. Both will be parsed as quoted 
```

### Markdown Notes

Mation enables styled documentation within the file.
This and the section above are Markdown notes.

Markdown notes can appear anywhere above or in top-level between key-value definitions.
Markdown notes are denoted by Start and End tags.
Syntax highlighting is provided in supported editors and viewers.

Start tag is
`/** <case insensitive 'md'|'note'> **`

End tag is the standard C-style block-comment end tag '*/'.


### Data Structure

#### Arrays

Key Values Map is described above (enclosed within `{` and `}`).
Arrays are enclosed within `[` and `]`.
Commas are optional within Arrays.

#### Commands
 
Commands is the main feature of Mation file.

Command and its agruments will be parsed as an array, `["name", arg1, arg2, ...]`.

Commas are optional between arguments.
Optonal commas are useful for readability of arguments to commands.
Eg. If the function signature is f(x0, y0, x1, y1), you call it via `f 1 2, 3 -4;`

If the only one parameter your function takes is an array, then enclose the arugments in one.

Key-value arugments not enclosed in `{}` is assumed to be a single key-value pair.
For example, `f x:1 y:2` or `f x:1, y:2` is parsed as `['f', {x: 1}, {y: 2}]`.
To have it parsed as a single map, enclose them in `{}`.

Example:
```js
author: 'Sam',
config: {a:1 b:2},
steps: [do turns],
do: [
  move 1 2;       // No "," needed between non-keyvalue arguments
  move [1 2];
  move 1 2, 3 -4; // For readability, commas can be inserted between arguments.
  move [1,2] [3,-4]; // To pass multiple arrays
  move [1 2] [3 -4]; // Same
]
turns: [
  turn { x:1, y:2 };  // One key-values map
  turn { x:1},{y:2 }; // Two key-values map
  turn x:1, y:2;      // Two key-values map
  turn x:1  y:2;      // Two key-values map
  turn left 1 right 2;
]
```

### Data Types

The following Values will be parsed:

- Numbers: same Number type as JavaScript
- String: Non-number and invalid character leading identifiers will be parsed as strings.


## Comparison

### JSON

JSON is the default standard when one thinks about configuration and data exchange needs due to its wide usage in the web and its frozen specification. However, much has change since its inception and its drawbacks has ignited quite a few specifications that fixes some of those drawbacks.


## Roadmap

### High Priority
- [x] Strings and Numbers
- [.] Parser with Extensive Unit Tests
- [.] Syntax highlighting for VSCode
- [.] Usage Examples
- [.] Good Documentation

### Mid Priority
- [ ] String templates
- [ ] Syntax highlighting for major editors 
- [ ] Parser for other languages besides JavaScript 

### Possible Features
- [ ] Meta variables
- [ ] Code blocks as values

## Anti-Roadmap

Features unlikely to be supported to keep Mation simple.
- String line continuations - use string templates for multi-line strings 

## LICENSE

Apache 2.0