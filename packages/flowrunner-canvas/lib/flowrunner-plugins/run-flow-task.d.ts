import { FlowTask } from '@devhelpr/flowrunner';
import { FlowConnector } from '../flow-connector';
interface Worker {
}
export declare class RunFlowTask extends FlowTask {
    flowrunner: any;
    worker?: Worker;
    flowrunnerConnector?: FlowConnector;
    execute(node: any, services: any): false | Promise<unknown> | undefined;
    kill(): void;
    getName(): string;
}
export {};
