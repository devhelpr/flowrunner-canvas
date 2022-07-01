export declare class FlowLoader {
    getFlow: (id: any, doNotConvertFlowToWasm?: boolean) => Promise<unknown>;
    convertFlowToWasmFlow: (flow: any) => any[];
}
