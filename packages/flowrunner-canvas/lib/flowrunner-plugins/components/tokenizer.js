const Specifcation = [
    [/^\s+/, null],
    [/^\/\/.*/, null],
    [/^\/\*[\s\S]*?\*\//, null],
    [/^;/, ';'],
    [/^:/, ':'],
    [/^\{/, '{'],
    [/^\}/, '}'],
    [/^\(/, '('],
    [/^\)/, ')'],
    [/^,/, ','],
    [/^\./, '.'],
    [/^\[/, '['],
    [/^\]/, ']'],
    [/^\blet_i32\b/, 'let_i32'],
    [/^\blet\b/, 'let'],
    [/^\if\b/, 'if'],
    [/^\belse\b/, 'else'],
    [/^\btrue\b/, 'true'],
    [/^\bfalse\b/, 'false'],
    [/^\bnull\b/, 'null'],
    [/^\bwhile_i32\b/, 'while_i32'],
    [/^\bwhile\b/, 'while'],
    [/^\bdo\b/, 'do'],
    [/^\bfor\b/, 'for'],
    [/^\bfunction_i32\b/, 'function_i32'],
    [/^\bfunction\b/, 'function'],
    [/^\breturn_i32\b/, 'return_i32'],
    [/^\breturn\b/, 'return'],
    [/^\input\b/, 'input'],
    [/^0[x][0-9a-fA-F]+/, 'HEXNUMBER'],
    [/^\d+\.?\d*/, 'NUMBER'],
    [/^\w+/, 'IDENTIFIER'],
    [/^[=!]=/, 'EQUALITY_OPERATOR'],
    [/^=/, 'SIMPLE_ASSIGN'],
    [/^[\*\/\+\-]=/, 'COMPLEX_ASSIGN'],
    [/^[+\-]/, 'ADDITIVE_OPERATOR'],
    [/^[*\/\%]/, 'MULTIPLICATIVE_OPERATOR'],
    [/^[><]=?/, 'RELATIONAL_OPERATOR'],
    [/^&&/, 'LOGICAL_AND'],
    [/^\|\|/, 'LOGICAL_OR'],
    [/^!/, 'LOGICAL_NOT'],
    [/^"[^"]*"/, 'STRING'],
    [/^'[^']*'/, 'STRING'],
];
export class Tokenizer {
    constructor() {
        this._string = ';';
        this._cursor = 0;
        this.init = (inputString) => {
            this._string = inputString;
            this._cursor = 0;
        };
        this.hasMoreTokens = () => {
            return this._cursor < this._string.length;
        };
        this.getNextToken = () => {
            if (!this.hasMoreTokens()) {
                return null;
            }
            const string = this._string.slice(this._cursor);
            for (const [regexp, tokenType] of Specifcation) {
                const tokenValue = this._match(regexp, string);
                if (tokenValue == null) {
                    continue;
                }
                if (tokenType == null) {
                    return this.getNextToken();
                }
                return {
                    type: tokenType,
                    value: tokenValue,
                };
            }
            throw new SyntaxError(`Unexpected token: "${string[0]}"`);
        };
        this._match = (regexp, string) => {
            const matched = regexp.exec(string);
            if (matched == null) {
                return null;
            }
            this._cursor += matched[0].length;
            return matched[0];
        };
    }
}
//# sourceMappingURL=tokenizer.js.map