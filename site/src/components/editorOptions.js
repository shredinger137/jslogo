/* eslint eqeqeq: "off", no-useless-escape: "off", no-throw-literal: "off", no-use-before-define: "off" */


export const options = {
  lineNumbers: false,
  scrollBeyondLastLine: false,
  readOnly: false,
  fontSize: 12,
}

// This config defines how the language is displayed in the editor.
//Note: hyphens aren't valid as keywords, they need to be added below that


//For the sake of auto-complete we're leaving the hyphenated ones under keywords
export const languageDef = {
  defaultToken: "",
  number: /\d+(\.\d+)?/,
  keywords: [
    "ir",
    "visible",
    "loadpic",
    "setcolor",
    "print",
    "readADC",
    "repeat",
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
    "forward",
    "bk",
    "ht",
    "st",
    "hide",
    "show",
    "turtle",
    'limits',
    'ticks',
    'title',
    'se',
    'seth',
    'clear',
    'y-label'
  ],
  operators: [
    '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
    '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
    '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
    '%=', '<<=', '>>=', '>>>=', 'se'
  ],
  symbols: /[=><!~?:&|+\-*\/^%]+/,
  tokenizer: {
    root: [
      [/y-label|x-label|bottom-plot|top-plot|one-plot|y-data|x-data|plot-title|x-ticks|y-ticks/, "compound-keywords"],
      [/readADC[0-9]|receive-packet|init-ir|read-visible|hide-turtle|show-plot|set-packet-save|set-packet-type|set-packet-count|calibrate-list/, "compound-keywords"],
      [/to\s[a-zA-Z0-9\-_re]*|\bend\b/, "custom-words"],      
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

    whitespace: [
      [/\s+/, "white"],
      [/;.*$/, 'comment'],
      [/;.*$/, 'comment'],
    ],
    numbers: [
      [/[0-9]/, "number"],
      [/true/, "number"],
      [/false/, "number"],
    ],
    strings: [
      [/[=|][ @number]*$/, "string.escape"],
      [/\'[a-zA-Z0-9_/.\-\s\:]*\'/, "string.escape"],
      [/'(.*?)'/, "string.escape"],
      [/\"[a-zA-Z0-9_/.-]*/, "string.escape"],
      [/\'[a-zA-Z0-9_/.-]*/, "string.escape"],

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
    ["{", "}"], ["[", "]"], ["(", ")",]
  ],
}