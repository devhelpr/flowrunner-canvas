import { Tokenizer } from './tokenizer';
export class Parser {
    constructor() {
        this._string = '';
        this._tokenizer = null;
        this._lookahead = null;
        this.parse = (code) => {
            this._string = code;
            this._isEndOfCode = false;
            if (this._tokenizer) {
                this._tokenizer.init(this._string);
                this._lookahead = this._tokenizer.getNextToken();
                return this.Program();
            }
        };
        this.Program = () => {
            return {
                type: 'Program',
                body: this.StatementList(),
            };
        };
        this.StatementList = (stopLookahead = null) => {
            const statementList = [this.Statement()];
            while (this._lookahead != null && this._lookahead.type !== stopLookahead) {
                statementList.push(this.Statement());
            }
            return statementList;
        };
        this.Statement = () => {
            switch (this._lookahead.type) {
                case ';':
                    return this.EmptyStatement();
                case 'if':
                    return this.IfStatement();
                case '{':
                    return this.BlockStatement();
                case 'let_i32':
                    return this.VariableStatement(true);
                case 'let':
                    return this.VariableStatement(false);
                case 'function_i32':
                    return this.FunctionDeclaration(true);
                case 'function':
                    return this.FunctionDeclaration(false);
                case 'return_i32':
                    return this.ReturnStatement(true);
                case 'return':
                    return this.ReturnStatement(false);
                case 'input':
                    return this.InputStatement();
                case 'while_i32':
                    return this.IterationStatement(true);
                case 'while':
                case 'do':
                case 'for':
                    return this.IterationStatement(false);
                default:
                    return this.ExpressionStatement();
            }
        };
        this.FunctionDeclaration = (isI32) => {
            this._eat(isI32 ? 'function_i32' : 'function');
            const name = this.Identifier();
            this._eat('(');
            const params = this._lookahead.type !== ')' ? this.FormalDeclarationList() : [];
            this._eat(')');
            const body = this.BlockStatement();
            return {
                type: 'FunctionDeclaration',
                name,
                params,
                body,
                functionType: isI32 ? 'i32' : 'f32',
            };
        };
        this.FormalDeclarationList = () => {
            const params = [];
            do {
                params.push(this.Identifier());
            } while (this._lookahead.type === ',' && this._eat(','));
            return params;
        };
        this.ReturnStatement = (isI32) => {
            this._eat(isI32 ? 'return_i32' : 'return');
            const argument = this._lookahead.type !== ';' ? this.Expression() : null;
            this._eat(';');
            return {
                type: 'ReturnStatement',
                argument,
                returnType: isI32 ? 'i32' : 'f32',
            };
        };
        this.InputStatement = () => {
            this._eat('input');
            const id = this.Identifier();
            this._eat(';');
            return {
                type: 'InputStatement',
                id,
                inputType: 'f32',
            };
        };
        this.IterationStatement = (isI32) => {
            switch (this._lookahead.type) {
                case 'while_i32':
                    return this.WhileStatement(true);
                case 'while':
                    return this.WhileStatement(false);
                case 'do':
                    return this.DoWhileStatement();
                default:
                    return null;
            }
        };
        this.WhileStatement = (isI32) => {
            this._eat(isI32 ? 'while_i32' : 'while');
            this._eat('(');
            const test = this.Expression();
            this._eat(')');
            const body = this.Statement();
            return {
                type: 'WhileStatement',
                test,
                body,
                whileType: isI32 ? 'i32' : 'f32',
            };
        };
        this.DoWhileStatement = () => {
            this._eat('do');
            const body = this.Statement();
            this._eat('while');
            this._eat('(');
            const test = this.Expression();
            this._eat(')');
            this._eat(';');
            return {
                type: 'DoWhileStatement',
                body,
                test,
            };
        };
        this.IfStatement = () => {
            this._eat('if');
            this._eat('(');
            const test = this.Expression();
            this._eat(')');
            const consequent = this.Statement();
            const alternate = this._lookahead != null && this._lookahead.type === 'else' ? this._eat('else') && this.Statement() : null;
            return {
                type: 'IfStatement',
                test,
                consequent,
                alternate,
            };
        };
        this.VariableStatement = (isI32) => {
            this._eat(isI32 ? 'let_i32' : 'let');
            const declarations = this.VariableDeclarationsList();
            this._eat(';');
            return {
                type: 'VariableStatement',
                variableType: isI32 ? 'i32' : 'f32',
                declarations,
            };
        };
        this.VariableDeclarationsList = () => {
            const declarations = [];
            do {
                declarations.push(this.VariableDeclaration());
            } while (this._lookahead.type === ',' && this._eat(','));
            return declarations;
        };
        this.VariableDeclaration = () => {
            const id = this.Identifier();
            const init = this._lookahead.type !== ';' && this._lookahead.type !== ',' ? this.VariableInitializer() : null;
            return {
                type: 'VariableDeclaration',
                id,
                init,
            };
        };
        this.VariableInitializer = () => {
            this._eat('SIMPLE_ASSIGN');
            return this.AssignmentExpression();
        };
        this.EmptyStatement = () => {
            this._eat(';');
            return {
                type: 'EmptyStatement',
            };
        };
        this.BlockStatement = () => {
            this._eat('{');
            const body = this._lookahead.type !== '}' ? this.StatementList('}') : [];
            this._eat('}');
            return {
                type: 'BlockStatement',
                body,
            };
        };
        this.ExpressionStatement = () => {
            const expression = this.Expression();
            if (!this._isEndOfCode) {
                this._eat(';', true);
            }
            else {
                this._lookahead = null;
            }
            return {
                type: 'ExpressionStatement',
                expression,
            };
        };
        this.Expression = () => {
            return this.AssignmentExpression();
        };
        this.AssignmentExpression = () => {
            const left = this.LogicalORExpression();
            if (this._lookahead == null || !this._isAssignmentOperator(this._lookahead.type)) {
                return left;
            }
            return {
                type: 'AssignmentExpression',
                operator: this.AssignmentOperator().value,
                left: this._checkValidAssignmentTarget(left),
                right: this.AssignmentExpression(),
            };
        };
        this.EqualityExpression = () => {
            return this._binaryExpression('RelationExpression', 'EQUALITY_OPERATOR');
        };
        this.RelationExpression = () => {
            return this._binaryExpression('AdditiveExpression', 'RELATIONAL_OPERATOR');
        };
        this.Identifier = () => {
            const name = this._eat('IDENTIFIER').value;
            return {
                type: 'Identifier',
                name,
            };
        };
        this._isAssignmentOperator = (tokenType) => {
            return tokenType === 'SIMPLE_ASSIGN' || tokenType === 'COMPLEX_ASSIGN';
        };
        this._checkValidAssignmentTarget = (node) => {
            if (node.type === 'Identifier' || node.type === 'MemberExpression') {
                return node;
            }
            throw new SyntaxError(`Invalid left-hand side in assignment expression`);
        };
        this.AssignmentOperator = () => {
            if (this._lookahead.type === 'SIMPLE_ASSIGN') {
                return this._eat('SIMPLE_ASSIGN');
            }
            return this._eat('COMPLEX_ASSIGN');
        };
        this.LogicalORExpression = () => {
            return this._logicalExpression('LogicalANDExpression', 'LOGICAL_OR');
        };
        this.LogicalANDExpression = () => {
            return this._logicalExpression('EqualityExpression', 'LOGICAL_AND');
        };
        this._logicalExpression = (builderName, operatorToken) => {
            let left = this[builderName]();
            while (this._lookahead != null && this._lookahead.type === operatorToken) {
                const operator = this._eat(operatorToken).value;
                const right = this[builderName]();
                left = {
                    type: 'LogicalExpression',
                    operator,
                    left,
                    right,
                };
            }
            return left;
        };
        this.AdditiveExpression = () => {
            return this._binaryExpression('MultiplicativeExpression', 'ADDITIVE_OPERATOR');
        };
        this.MultiplicativeExpression = () => {
            return this._binaryExpression('UnaryExpression', 'MULTIPLICATIVE_OPERATOR');
        };
        this._binaryExpression = (builderName, operatorToken) => {
            let left = this[builderName]();
            while (this._lookahead != null && this._lookahead.type === operatorToken) {
                const operator = this._eat(operatorToken).value;
                const right = this[builderName]();
                left = {
                    type: 'BinaryExpression',
                    operator,
                    left,
                    right,
                };
            }
            return left;
        };
        this.UnaryExpression = () => {
            let operator;
            switch (this._lookahead.type) {
                case 'ADDITIVE_OPERATOR':
                    operator = this._eat('ADDITIVE_OPERATOR').value;
                    break;
                case 'LOGICAL_NOT':
                    operator = this._eat('LOGICAL_NOT').value;
                    break;
            }
            if (operator != null) {
                return {
                    type: 'UnaryExpression',
                    operator,
                    argument: this.UnaryExpression(),
                };
            }
            return this.LeftHandSideExpression();
        };
        this.LeftHandSideExpression = () => {
            return this.CallMemberExpression();
        };
        this.CallMemberExpression = () => {
            const member = this.MemberExpression();
            if (this._lookahead != null && this._lookahead.type === '(') {
                return this._CallExpression(member);
            }
            return member;
        };
        this._CallExpression = (callee) => {
            let callExpression = {
                type: 'CallExpression',
                callee,
                arguments: this.Arguments(),
            };
            if (this._lookahead.type === '(') {
                callExpression = this._CallExpression(callExpression);
            }
            return callExpression;
        };
        this.Arguments = () => {
            this._eat('(');
            const argumentList = this._lookahead.type !== ')' ? this.ArgumentList() : [];
            this._eat(')');
            return argumentList;
        };
        this.ArgumentList = () => {
            const argumentList = [];
            do {
                argumentList.push(this.AssignmentExpression());
            } while (this._lookahead.type === ',' && this._eat(','));
            return argumentList;
        };
        this.MemberExpression = () => {
            let object = this.PrimaryExpression();
            while (this._lookahead != null && (this._lookahead.type === '.' || this._lookahead.type === '[')) {
                if (this._lookahead.type === '.') {
                    this._eat('.');
                    const property = this.Identifier();
                    object = {
                        type: 'MemberExpression',
                        computed: false,
                        object,
                        property,
                    };
                }
                if (this._lookahead.type === '[') {
                    this._eat('[');
                    const property = this.Expression();
                    this._eat(']');
                    object = {
                        type: 'MemberExpression',
                        computed: true,
                        object,
                        property,
                    };
                }
            }
            return object;
        };
        this.PrimaryExpression = () => {
            if (this._isLiteral(this._lookahead.type)) {
                return this.Literal();
            }
            switch (this._lookahead.type) {
                case '(':
                    return this.ParenthesizedExpression();
                case 'IDENTIFIER':
                    return this.Identifier();
                default:
                    return this.LeftHandSideExpression();
            }
        };
        this._isLiteral = (tokenType) => {
            return (tokenType === 'HEXNUMBER' ||
                tokenType === 'NUMBER' ||
                tokenType === 'STRING' ||
                tokenType === 'true' ||
                tokenType === 'false' ||
                tokenType === 'null');
        };
        this.ParenthesizedExpression = () => {
            this._eat('(');
            const expression = this.Expression();
            this._eat(')');
            return expression;
        };
        this.Literal = () => {
            switch (this._lookahead.type) {
                case 'HEXNUMBER':
                    return this.HexNumberLiteral();
                case 'NUMBER':
                    return this.NumberLiteral();
                case 'STRING':
                    return this.StringLiteral();
                case 'true':
                    return this.BooleanLiteral(true);
                case 'false':
                    return this.BooleanLiteral(false);
                case 'null':
                    return this.NullLiteral();
            }
            throw new SyntaxError(`Literal: unexpected literal production`);
        };
        this.BooleanLiteral = (value) => {
            this._eat(value ? 'true' : 'false');
            return {
                type: 'BooleanLiteral',
                value,
            };
        };
        this.NullLiteral = () => {
            this._eat('null');
            return {
                type: 'NullLiteral',
                value: null,
            };
        };
        this.HexNumberLiteral = () => {
            const token = this._eat('HEXNUMBER');
            const numberString = token.value.substring(2);
            return {
                type: 'NumberLiteral',
                isBig: numberString.length >= 8,
                value: Number(parseInt(numberString, 16)),
            };
        };
        this.NumberLiteral = () => {
            const token = this._eat('NUMBER');
            return {
                type: 'NumberLiteral',
                value: Number(token.value),
            };
        };
        this.StringLiteral = () => {
            const token = this._eat('STRING');
            return {
                type: 'StringLiteral',
                value: token.value.slice(1, -1),
            };
        };
        this._isEndOfCode = false;
        this._eat = (tokenType, ignoreIfEndOfCode = false) => {
            const token = this._lookahead;
            if (token == null) {
                throw new SyntaxError(`Unexpected end of input, expected: "${tokenType}".`);
            }
            if (token.type !== tokenType) {
                throw new SyntaxError(`Unexpected token: "${token.type}", expected: "${tokenType}".`);
            }
            if (this._tokenizer && !this._tokenizer.hasMoreTokens()) {
                this._isEndOfCode = true;
            }
            this._lookahead = this._tokenizer && this._tokenizer.getNextToken();
            if (this._tokenizer && !this._tokenizer.hasMoreTokens()) {
                this._isEndOfCode = true;
            }
            return token;
        };
        this._string = '';
        this._tokenizer = new Tokenizer();
    }
}
//# sourceMappingURL=parser.js.map