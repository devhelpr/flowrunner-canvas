import { FlowTask } from '@devhelpr/flowrunner';
import { FlowConnector } from '../flow-connector';
interface Worker {
}
export declare class BundleFlowTask extends FlowTask {
    flowrunner: any;
    worker?: Worker;
    flowrunnerConnector?: FlowConnector;
    execute(node: any, services: any): false | Promise<unknown>;
    kill(): void;
    getName(): string;
}
export {};
