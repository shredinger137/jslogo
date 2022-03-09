/* eslint eqeqeq: "off", no-useless-escape: "off", no-throw-literal: "off", no-use-before-define: "off" */

//KNOWN ISSUE: The syntax highlighter will not process keywords with dashes in them.

export const options = {
  lineNumbers: false,
  scrollBeyondLastLine: false,
  readOnly: false,
  fontSize: 12,
}

// This config defines how the language is displayed in the editor.
//Note: hyphens aren't valid here. That means if you want hyphenated words to work as keywords you have to add both halves.
//Obviously that means invalid commands will still turn blue. Not much to be done about it.

export const languageDef = {
  defaultToken: "",
  number: /\d+(\.\d+)?/,
  keywords: [
    'receive-packet',
    'packet',
    "read",
    "ir",
    "visible",
    "loadpic",
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
    "forward",
    "bk",
    "ht",
    "st",
    "hide",
    "show",
    "turtle",
    "x-data",
    "y-data",
    "one-plot",
    "top-plot",
    "bottom-plot",
    "x-label",
    "y-label",
    'plot',
    'one',
    'top',
    'bottom',
    'x',
    'y',
    'data',
    'limits',
    'ticks',
    'label',
    'title',
    'se',
    'seth'

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
      [/\/\/.*$/, 'comment']
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