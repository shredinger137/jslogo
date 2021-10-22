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

        //when faced with {}, interpret it as an object (JavaScript native style)
        //this will work with make/let, but it needs to be in JSON format - double quotes and the like - and needs spaces between brackets and text

        //It doesn't work with strings properly because JSLogo is trying to interpret it as we go I think
        //even if you use a replace function for single quotes it behaves odd, so you need double quotes
        //If you use double quotes with spaces, the spaces get deleted

        function readObject() {
            var data = "";
           // skipSpace();
            while (true) {
                if (eof()) break;
                var token = readToken();
                if (token == null) break;
                data = data + token;
            }

            data = '{' + data + '}';

            try {
                console.log(data)
                data = JSON.parse(data);
            } catch (e) {
                console.log(e);
            }

            finally {
                return(data);
            }


        }

        function readToken() {
            var s = next();
            var n = Number(s);
            if (!isNaN(n)) return n;
            var first = s.charAt(0);
            if (first === "]") return null;
            if (first === "[") return readList();
            if (first === "{") return readObject();
            if (first === "}") return null;
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