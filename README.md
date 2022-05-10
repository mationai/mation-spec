# Mation - Readable Configuration Specification Format for Automation and Task Runners

## Highlight

Mation is a simple, readable Structured Configuration Format designed to specify how to run automations and code generations. The main design goal is to be easy to read, write, and flexible. Its initial focus was to be a generic DSL for describing the model and transitions for animation generation. However, the goal has always been to be simple yet powerful and flexible engough to become the standard for its intended use case and well suited for common configuration needs.

### What It Is and Is Not

Mation is easy to read and write DSL standard to generate JSON or other configuration formats, or for developers to write interfaces to consume it directly (having a formal grammar will definitely help in that). Thus, it is not an ideal choice for data exchange, or if you already have a system of generating the configuration files and making changes to that is not a good investment of your time.

### Documentation for Configuration

For certain applications, documentation may be of much greater importance than code documentation. Yet comments inside a common configuration file such as JSON is illegal. Yes, you can hack it by adding a "_note" field to it, but this hurdle sets the percedence for developers to either not think about documentation or do so in other places where it is not readily accessible when viewing the configuration. Other configuration formats allows comments, but it is still not good enough. Documentation is not just text. Good documentation requires sectioning and styling the text to give it meaning and importance. Thus the ability to include Markdown sections is crucial. With it, you can have literal programming within configuration files.  

### Features

* Human readable commands specification
* Markdown sections for documentation
* Non-ambiguous type for values
* Much more ... (to be updated)


## Usage

```js
import { parse } from './src/api'
// import { parse } from 'mation-spec' // When package is published

const result = parse(`
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


### Development

This project uses [yarn berry PnP](https://yarnpkg.com/features/pnp) as the package manager. It features Zero-Install, which means instead of requiring developers to install and build `node_modules`, a much smaller version of it is checked into the repo (`.pnp.*` `.yarnrc.yml`, `yarn.lock`, and `.yarn`. TLDR - No install needed, you're good to go upon checking out the repo.

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

## High Priority
- [x] Strings and Numbers
- [ ] Parser with Extensive Unit Tests
- [ ] Syntax highlighter for VSCode
- [ ] Usage Examples
- [ ] Better Documentation

## Mid Priority
- [ ] Meta variables
- [ ] String templates
- [ ] Code block values
- [ ] Syntax highlighter for browser editors 
- [ ] Syntax highlighter for major editors 
- [ ] Parser for other languages 

## Anti-Roadmap

To keep Mation simple, it will not support:
- String line continuations - use string templates for multi-line strings 

## LICENSE

Apache 2.0