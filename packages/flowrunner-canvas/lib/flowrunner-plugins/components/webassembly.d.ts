export interface IWebassembly {
    mainFunction: (instance: any, x: number, y: number, index: number, time: number, width: number, height: number, ...args: any[]) => number;
    wasm: any;
    instance: any;
}
export declare const getWebassembly: (code: string, width: any, height: any) => Promise<false | {
    wasm: Uint8Array;
    instance: WebAssembly.Instance;
    inputVariables: any;
    mainFunction: Function;
}>;
