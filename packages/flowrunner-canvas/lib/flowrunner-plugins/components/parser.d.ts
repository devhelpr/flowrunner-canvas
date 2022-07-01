import { Tokenizer } from './tokenizer';
export declare class Parser {
    _string: string;
    _tokenizer: Tokenizer | null;
    _lookahead: any;
    constructor();
    parse: (code: string) => {
        type: string;
        body: any[];
    } | undefined;
    Program: () => {
        type: string;
        body: any[];
    };
    StatementList: (stopLookahead?: any) => any[];
    Statement: () => any;
    FunctionDeclaration: (isI32: boolean) => {
        type: string;
        name: {
            type: string;
            name: any;
        };
        params: any[];
        body: any;
        functionType: string;
    };
    FormalDeclarationList: () => any[];
    ReturnStatement: (isI32: boolean) => {
        type: string;
        argument: any;
        returnType: string;
    };
    InputStatement: () => {
        type: string;
        id: {
            type: string;
            name: any;
        };
        inputType: string;
    };
    IterationStatement: (isI32: boolean) => any;
    WhileStatement: (isI32: boolean) => any;
    DoWhileStatement: () => any;
    IfStatement: () => any;
    VariableStatement: (isI32: boolean) => any;
    VariableDeclarationsList: () => any;
    VariableDeclaration: () => any;
    VariableInitializer: () => any;
    EmptyStatement: () => {
        type: string;
    };
    BlockStatement: () => any;
    ExpressionStatement: () => any;
    Expression: () => any;
    AssignmentExpression: () => any;
    EqualityExpression: () => any;
    RelationExpression: () => any;
    Identifier: () => {
        type: string;
        name: any;
    };
    _isAssignmentOperator: (tokenType: string) => any;
    _checkValidAssignmentTarget: (node: any) => any;
    AssignmentOperator: () => any;
    LogicalORExpression: () => any;
    LogicalANDExpression: () => any;
    _logicalExpression: (builderName: string, operatorToken: string) => any;
    AdditiveExpression: () => any;
    MultiplicativeExpression: () => any;
    _binaryExpression: (builderName: string, operatorToken: string) => any;
    UnaryExpression: () => any;
    LeftHandSideExpression: () => any;
    CallMemberExpression: () => any;
    _CallExpression: (callee: any) => {
        type: string;
        callee: any;
        arguments: any[];
    };
    Arguments: () => any[];
    ArgumentList: () => any[];
    MemberExpression: () => any;
    PrimaryExpression: () => any;
    _isLiteral: (tokenType: string) => boolean;
    ParenthesizedExpression: () => any;
    Literal: () => {
        type: string;
        value: any;
    };
    BooleanLiteral: (value: any) => {
        type: string;
        value: any;
    };
    NullLiteral: () => {
        type: string;
        value: null;
    };
    HexNumberLiteral: () => {
        type: string;
        isBig: boolean;
        value: number;
    };
    NumberLiteral: () => {
        type: string;
        value: number;
    };
    StringLiteral: () => {
        type: string;
        value: any;
    };
    _isEndOfCode: boolean;
    _eat: (tokenType: string, ignoreIfEndOfCode?: boolean) => any;
}
