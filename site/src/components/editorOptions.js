export const options = {
    lineNumbers: false,
    scrollBeyondLastLine: false,
    readOnly: false,
    fontSize: 12,
  }
  
  // This config defines how the language is displayed in the editor.
  export const languageDef = {
    defaultToken: "",
    number: /\d+(\.\d+)?/,
    keywords: [
      "print",
      "readADC0",
    ],
    operators: [
      '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
      '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
      '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
      '%=', '<<=', '>>=', '>>>='
    ],
    symbols:  /[=><!~?:&|+\-*\/\^%]+/,
    tokenizer: {
      root: [
        { include: "@whitespace" },
        { include: "@numbers" },
        { include: "@strings" },
        { include: "@tags" },
        [/\w+/, { cases: { "@keywords": "keyword" } }],
        [/@symbols/, { cases: { '@operators': 'operator',
        '@default'  : '' } } ],
      ],
      whitespace: [
        [/\s+/, "white"],
      ],
      numbers: [
        [/number/, "number"],
      ],
      strings: [
        [/[=|][ @number]*$/, "string.escape"],
      ],
      tags: [
        [/^%[a-zA-Z]\w*/, "tag"],
        [/#[a-zA-Z]\w*/, "tag"],
      ],
    },
  }
  
  // This config defines the editor's behavior.
  export const configuration = {
    comments: {
      lineComment: ";",
    },
    brackets: [
      ["{", "}"], ["[", "]"], ["(", ")"],
    ],
  }