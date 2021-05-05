import { Tokenizer } from './tokenizer';

export class Parser {
  _string: string = '';
  _tokenizer: Tokenizer | null = null;
  _lookahead: any = null;

  constructor() {
    this._string = '';
    this._tokenizer = new Tokenizer();
  }

  parse = (code: string) => {
    this._string = code;
    this._isEndOfCode = false;
    if (this._tokenizer) {
      this._tokenizer.init(this._string);
      this._lookahead = this._tokenizer.getNextToken();
      return this.Program();
    }
  };

  Program = () => {
    return {
      type: 'Program',
      body: this.StatementList(),
    };
  };

  StatementList = (stopLookahead: any = null) => {
    const statementList = [this.Statement()];
    while (this._lookahead != null && this._lookahead.type !== stopLookahead) {
      statementList.push(this.Statement());
    }
    return statementList;
  };

  Statement = () => {
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

  FunctionDeclaration = (isI32: boolean) => {
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

  FormalDeclarationList = () => {
    const params: any[] = [];
    do {
      params.push(this.Identifier());
    } while (this._lookahead.type === ',' && this._eat(','));
    return params;
  };

  ReturnStatement = (isI32: boolean) => {
    this._eat(isI32 ? 'return_i32' : 'return');
    const argument = this._lookahead.type !== ';' ? this.Expression() : null;
    this._eat(';');
    return {
      type: 'ReturnStatement',
      argument,
      returnType: isI32 ? 'i32' : 'f32',
    };
  };

  InputStatement = () => {
    this._eat('input');
    const id = this.Identifier();
    this._eat(';');
    return {
      type: 'InputStatement',
      id,
      inputType: 'f32',
    };
  };

  IterationStatement = (isI32: boolean): any => {
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

  WhileStatement = (isI32: boolean): any => {
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

  DoWhileStatement = (): any => {
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

  IfStatement = (): any => {
    this._eat('if');
    this._eat('(');
    const test = this.Expression();
    this._eat(')');
    const consequent = this.Statement();
    const alternate =
      this._lookahead != null && this._lookahead.type === 'else' ? this._eat('else') && this.Statement() : null;
    return {
      type: 'IfStatement',
      test,
      consequent,
      alternate,
    };
  };

  VariableStatement = (isI32: boolean): any => {
    this._eat(isI32 ? 'let_i32' : 'let');
    const declarations = this.VariableDeclarationsList();
    this._eat(';');

    return {
      type: 'VariableStatement',
      variableType: isI32 ? 'i32' : 'f32',
      declarations,
    };
  };

  VariableDeclarationsList = (): any => {
    const declarations: any[] = [];
    do {
      declarations.push(this.VariableDeclaration());
    } while (this._lookahead.type === ',' && this._eat(','));
    return declarations;
  };

  VariableDeclaration = (): any => {
    const id = this.Identifier();
    const init = this._lookahead.type !== ';' && this._lookahead.type !== ',' ? this.VariableInitializer() : null;
    return {
      type: 'VariableDeclaration',
      id,
      init,
    };
  };

  VariableInitializer = () => {
    this._eat('SIMPLE_ASSIGN');
    return this.AssignmentExpression();
  };

  EmptyStatement = () => {
    this._eat(';');
    return {
      type: 'EmptyStatement',
    };
  };

  BlockStatement = (): any => {
    this._eat('{');
    const body = this._lookahead.type !== '}' ? this.StatementList('}') : [];
    this._eat('}');
    return {
      type: 'BlockStatement',
      body,
    };
  };

  ExpressionStatement = (): any => {
    const expression = this.Expression();
    if (!this._isEndOfCode) {
      this._eat(';', true);
    } else {
      this._lookahead = null;
    }
    return {
      type: 'ExpressionStatement',
      expression,
    };
  };

  Expression = () => {
    return this.AssignmentExpression();
  };

  AssignmentExpression = (): any => {
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

  EqualityExpression = () => {
    return this._binaryExpression('RelationExpression', 'EQUALITY_OPERATOR');
  };

  RelationExpression = () => {
    return this._binaryExpression('AdditiveExpression', 'RELATIONAL_OPERATOR');
  };

  Identifier = () => {
    const name = this._eat('IDENTIFIER').value;
    return {
      type: 'Identifier',
      name,
    };
  };

  _isAssignmentOperator = (tokenType: string): any => {
    return tokenType === 'SIMPLE_ASSIGN' || tokenType === 'COMPLEX_ASSIGN';
  };

  _checkValidAssignmentTarget = (node: any): any => {
    if (node.type === 'Identifier' || node.type === 'MemberExpression') {
      return node;
    }
    throw new SyntaxError(`Invalid left-hand side in assignment expression`);
  };

  AssignmentOperator = () => {
    if (this._lookahead.type === 'SIMPLE_ASSIGN') {
      return this._eat('SIMPLE_ASSIGN');
    }
    return this._eat('COMPLEX_ASSIGN');
  };

  LogicalORExpression = () => {
    return this._logicalExpression('LogicalANDExpression', 'LOGICAL_OR');
  };

  LogicalANDExpression = () => {
    return this._logicalExpression('EqualityExpression', 'LOGICAL_AND');
  };

  _logicalExpression = (builderName: string, operatorToken: string) => {
    let left = (this as any)[builderName]();
    while (this._lookahead != null && this._lookahead.type === operatorToken) {
      const operator = this._eat(operatorToken).value;
      const right = (this as any)[builderName]();
      left = {
        type: 'LogicalExpression',
        operator,
        left,
        right,
      };
    }
    return left;
  };

  AdditiveExpression = () => {
    return this._binaryExpression('MultiplicativeExpression', 'ADDITIVE_OPERATOR');
  };

  MultiplicativeExpression = () => {
    return this._binaryExpression('UnaryExpression', 'MULTIPLICATIVE_OPERATOR');
  };

  _binaryExpression = (builderName: string, operatorToken: string) => {
    let left: any = (this as any)[builderName]();
    while (this._lookahead != null && this._lookahead.type === operatorToken) {
      const operator = this._eat(operatorToken).value;
      const right = (this as any)[builderName]();

      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
      };
    }
    return left;
  };

  UnaryExpression = (): any => {
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

  LeftHandSideExpression = (): any => {
    return this.CallMemberExpression();
  };

  CallMemberExpression = (): any => {
    const member = this.MemberExpression();

    if (this._lookahead != null && this._lookahead.type === '(') {
      return this._CallExpression(member);
    }

    return member;
  };

  _CallExpression = (callee: any) => {
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

  Arguments = () => {
    this._eat('(');

    const argumentList = this._lookahead.type !== ')' ? this.ArgumentList() : [];

    this._eat(')');
    return argumentList;
  };

  ArgumentList = () => {
    const argumentList: any[] = [];
    do {
      argumentList.push(this.AssignmentExpression());
    } while (this._lookahead.type === ',' && this._eat(','));
    return argumentList;
  };

  MemberExpression = () => {
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

  PrimaryExpression = () => {
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

  _isLiteral = (tokenType: string) => {
    return (
      tokenType === 'HEXNUMBER' ||
      tokenType === 'NUMBER' ||
      tokenType === 'STRING' ||
      tokenType === 'true' ||
      tokenType === 'false' ||
      tokenType === 'null'
    );
  };

  ParenthesizedExpression = () => {
    this._eat('(');
    const expression = this.Expression();
    this._eat(')');
    return expression;
  };

  Literal = () => {
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

  BooleanLiteral = (value: any) => {
    this._eat(value ? 'true' : 'false');
    return {
      type: 'BooleanLiteral',
      value,
    };
  };

  NullLiteral = () => {
    this._eat('null');
    return {
      type: 'NullLiteral',
      value: null,
    };
  };

  HexNumberLiteral = () => {
    const token = this._eat('HEXNUMBER');
    const numberString = token.value.substring(2);
    return {
      type: 'NumberLiteral',
      isBig: numberString.length >= 8,
      value: Number(parseInt(numberString, 16)),
    };
  };

  NumberLiteral = () => {
    const token = this._eat('NUMBER');
    return {
      type: 'NumberLiteral',
      value: Number(token.value),
    };
  };

  StringLiteral = () => {
    const token = this._eat('STRING');
    return {
      type: 'StringLiteral',
      value: token.value.slice(1, -1),
    };
  };

  _isEndOfCode: boolean = false;
  _eat = (tokenType: string, ignoreIfEndOfCode = false) => {
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
}
