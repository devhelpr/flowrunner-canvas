import { FlowTask } from '@devhelpr/flowrunner';
export declare class DataGridTask extends FlowTask {
    private convertGridToNamedVariables;
    execute(node: any, services: any): false | Promise<unknown>;
    getName(): string;
}
