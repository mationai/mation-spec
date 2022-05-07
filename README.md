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

```cs
```

### Development

Install pnpm (or yarn/npm), then
```cs
pnpm install
```


## Details

### Features at a Glance

Let's jump right into some of the features...


### Detail Syntax Example


### Data Types

Property value can be one of the following types:


## Comparison

### JSON

JSON is the default standard when one thinks about configuration and data exchange needs due to its wide usage in the web and its frozen specification. However, much has change since its inception and its drawbacks has ignited quite a few specifications that fixes some of those drawbacks.


## Roadmap

## High Priority
[ ] Extensive Unit Tests
[ ] Common Data Types
[ ] Syntax highlighter for VSCode
[ ] Usage Examples
[ ] Better Documentation

## Mid Priority
[ ] Meta variables
[ ] Code block values
[ ] Syntax highlighter for online editors 
[ ] Syntax highlighter for major editors 
[ ] Parser for other languages 
