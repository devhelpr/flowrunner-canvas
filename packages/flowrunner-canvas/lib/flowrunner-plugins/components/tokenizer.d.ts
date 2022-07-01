export declare class Tokenizer {
    _string: string;
    _cursor: number;
    init: (inputString: string) => void;
    hasMoreTokens: () => boolean;
    getNextToken: () => any;
    _match: (regexp: RegExp, string: string) => string | null;
}
