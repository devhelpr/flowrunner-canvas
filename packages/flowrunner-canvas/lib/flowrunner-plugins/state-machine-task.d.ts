import { FlowTask } from '@devhelpr/flowrunner';
export declare class StateMachineTask extends FlowTask {
    execute(node: any, services: any): Promise<unknown>;
    getName(): string;
}
