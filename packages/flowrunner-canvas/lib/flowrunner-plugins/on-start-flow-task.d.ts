import { FlowTask } from '@devhelpr/flowrunner';
export declare class OnStartFlowTask extends FlowTask {
    execute(node: any, services: any): boolean;
    getName(): string;
    isStartingOnInitFlow(): boolean;
}
