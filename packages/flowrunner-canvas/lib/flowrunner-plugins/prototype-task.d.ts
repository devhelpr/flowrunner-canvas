import { FlowTask } from '@devhelpr/flowrunner';
export declare class PrototypeTask extends FlowTask {
    wasm: any;
    input: string;
    execute(node: any, services: any): any;
    getName(): string;
}
