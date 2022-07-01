import { FlowEventRunner, FlowTask, ObservableTask } from '@devhelpr/flowrunner';
import { IFlowAgent, GetFlowAgentFunction } from './interfaces/IFlowAgent';
export declare class FlowAgent implements IFlowAgent {
    eventListeners: any;
    flow?: FlowEventRunner;
    observables: {};
    postMessage: (eventName: any, message: any) => void;
    addEventListener: (eventName: string, callback: (event: any, flowAgent: IFlowAgent) => void) => void;
    removeEventListener: (eventName: string, callback: (event: any, flowAgent: IFlowAgent) => void) => void;
    terminate: () => void;
}
export declare const getFlowAgent: GetFlowAgentFunction;
import { Subject } from 'rxjs';
export declare class PreviewTask extends FlowTask {
    execute(node: any, services: any): boolean;
    isStartingOnInitFlow(): boolean;
    getName(): string;
}
export declare class ListTask extends FlowTask {
    execute(node: any, services: any): any;
    getName(): string;
}
export declare class OutputValueTask extends FlowTask {
    execute(node: any, services: any): any;
    getName(): string;
}
export declare class InputTask extends FlowTask {
    execute(node: any, services: any): any;
    getName(): string;
}
export declare class TimerTask extends FlowTask {
    isExecuting: boolean;
    clearTimeout: any;
    node: any;
    flow: any;
    constructor();
    timer: () => void;
    execute(node: any, services: any): false | Subject<string> | undefined;
    isBeingKilled: boolean;
    kill(): void;
    getName(): string;
}
export declare class RandomTask extends ObservableTask {
    execute(node: any, services: any): any;
    getName(): string;
}
export declare class ApiProxyTask extends FlowTask {
    execute(node: any, services: any): Promise<unknown>;
    getName(): string;
}
export declare class MapPayloadTask extends FlowTask {
    execute(node: any, services: any): boolean;
    getName(): string;
}
declare const _default: any;
export default _default;
