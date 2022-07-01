import { FlowTask } from '@devhelpr/flowrunner';
export interface IDeepReassignRuleMapping {
    sourceProperty: string;
    targetProperty: string;
    defaultValue: any;
}
export interface IDeepReassignRule {
    source: string;
    target: string;
    mappings?: IDeepReassignRuleMapping[];
}
export declare class DeepAssignTask extends FlowTask {
    execute(node: any, services: any): any;
    getName(): string;
    private getSource;
    private setData;
    private getArrayIndexFromPropertyPathPart;
}
