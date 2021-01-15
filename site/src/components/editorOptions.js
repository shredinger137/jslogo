/* eslint eqeqeq: "off", no-useless-escape: "off", no-throw-literal: "off", no-use-before-define: "off" */

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
    "setAxisX",
    "setAxisY",
    "initPlot",
    "setcolor",
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
    "dp2on",
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
    "dp2off",
    "dp3off",
    "dp4off",
    "dp5off",
    "dp6off",
    "dp7off",
    "dp8off",
    "dp9off",
    "dp10off",
    "dp11off",
    "dp12off",
    "make",
    "let",
    "fd",
    "rt",
    "arc",
    "penup",
    "pendown",
    "chartpush",
    "wait",
    "ob1on",
    "ob1off",
    "loop",
    "push",
    "mwait",
    "startfill",
    "endfill",
    "clean",
    "setpensize",
    "lt",
    "random2",
    "setshade",
    "setheading",
    "setxy",
    "forward"
  ],
  operators: [
    '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
    '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
    '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
    '%=', '<<=', '>>=', '>>>='
  ],
  symbols: /[=><!~?:&|+\-*\/^%]+/,
  tokenizer: {
    root: [
      [/to\s[a-zA-Z\-re]+|\bend\b/, "custom-words"],
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
      [/\"[a-zA-Z_-]*/, "string.escape"],
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
    ["{", "}"], ["[", "]"], ["(", ")",],["to","end"]
  ],
}