import { FlowTask } from '@devhelpr/flowrunner';
export declare class FilterTask extends FlowTask {
    expression: string;
    expressionTree: any;
    execute(node: any, services: any): any;
    getName(): string;
}
