/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off" */

export default class Tokenizer {
    constructor(stringToEvaluate) {
        this.stringToEvaluate = stringToEvaluate;
        this.offset = 0;
    }

    static parse(s) {
        return new Tokenizer(s).tokenize();
    }

    tokenize() {
        var t = this;
        return readList();

        function readList() {
            var arrayOfTokens = [];
            skipSpace();
            while (true) {
                if (eof()) break;
                var token = readToken();
                if (token == null) break;
                arrayOfTokens.push(token);
            }
            return arrayOfTokens;
        }

        function readToken() {
            var s = next();
            var n = Number(s);
            if (!isNaN(n)) return n;
            var first = s.charAt(0);
            if (first === "]") return null;
            if (first === "[") return readList();
            return s;
        }

        function next() {
            if (peekChar() === "'" || peekChar() === "|") return readString();
            var res = '';
            if (delim()) res = nextChar();
            else {
                while (true) {
                    if (eof()) break;
                    if (delim()) break;
                    else res += nextChar();
                }
            }
            skipSpace();
            return res;
        }

        function readString() {
            nextChar();
            var res = "'";
            while (true) {
                if (eof()) return res + "'";
                var c = nextChar();
                res += c;
                if (c == "'") { skipSpace(); return res; }
            }
        }

        function skipSpace() {
            //TODO: It would be cool if we could read multiple characters, and skip comments with // to make Logo++. Or LogoScript. Or something.
            while (true) {
                if (eof()) return;
                var c = peekChar();
                if (c == ';') { skipComment(); continue; }
                if (" \t\r\n,".indexOf(c) == -1) return;
                nextChar();
            }
        }

        function skipComment() {
            while (true) {
                var c = nextChar();
                if (eof()) return;
                if (c == '\n') return;
            }
        }

        function delim() { return "()[] \t\r\n".indexOf(peekChar()) != -1; }
        function peekChar() { return t.stringToEvaluate.charAt(t.offset); }
        function nextChar() { return t.stringToEvaluate.charAt(t.offset++); }
        function eof() { return t.stringToEvaluate.length == t.offset; }

    }
}