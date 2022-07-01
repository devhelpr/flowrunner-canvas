import { ObservableTask } from '@devhelpr/flowrunner';
export declare class DebugTask extends ObservableTask {
    execute(node: any, services: any): any;
    getName(): string;
    isSampling(node: any): any;
}
