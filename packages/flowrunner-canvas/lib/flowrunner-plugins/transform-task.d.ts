import { FlowTask } from '@devhelpr/flowrunner';
export declare class TransformTask extends FlowTask {
    execute(node: any, services: any): any;
    getName(): string;
    private mapObject;
}
