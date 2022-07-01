import { FlowEventRunner } from '@devhelpr/flowrunner';
export interface ITestDefinition {
    name: string;
    startNode: string;
    nodes: any;
    expected: any;
    payload?: any;
}
export declare const testRunner: (flowId: any, flowRunner: FlowEventRunner, workerContext: any) => void;
