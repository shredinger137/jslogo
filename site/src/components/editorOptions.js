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
    "read0",
    "repeat",
    "read1",
    "read2",
    "read3",
    "read4",
    "read5",
    "read6",
    "read7",
    "dp3on",
    "dp4on",
    "dp5on",
    "dp6on",
    "dp7on",
    "dp8on",
    "dp9on",
    "dp10on",
    "dp11on",
    "dp12on",
    "make",
    "let",

  ],
  identifiers: [
    "to",
    "end",
  ],
  operators: [
    '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
    '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
    '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
    '%=', '<<=', '>>=', '>>>='
  ],
  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  tokenizer: {
    root: [
      [/to\s[a-zA-Z]*|end/, "custom-words"],
      { include: "@whitespace" },
      { include: "@numbers" },
      { include: "@strings" },
      { include: "@tags" },
      [/\w+/, { cases: { "@keywords": "keyword" } }],
      [/@symbols/, {
        cases: {
          '@operators': 'operator',
        }
      }],
    ],
    comment: [
      [/;/, 'comment'],

    ],
    whitespace: [
      [/\s+/, "white"],
      [/;.*$/, 'comment'],
    ],
    numbers: [
      [/number/, "number"],
    ],
    strings: [
      [/[=|][ @number]*$/, "string.escape"],
    [/\"[a-zA-Z]*/, "string.escape"],
    ],
    tags: [
      [/^%[a-zA-Z]\w*/, "tag"],
      [/#[a-zA-Z]\w*/, "tag"],
    ],
    identifiers: [
      [/to/, "identifier"],
    ]
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