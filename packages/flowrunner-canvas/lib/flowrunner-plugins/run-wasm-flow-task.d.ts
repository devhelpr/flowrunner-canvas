import { FlowTask } from '@devhelpr/flowrunner';
export declare class RunWasmFlowTask extends FlowTask {
    webassemblyFlowrunner: any;
    execute(node: any, services: any): any;
    getName(): string;
}
