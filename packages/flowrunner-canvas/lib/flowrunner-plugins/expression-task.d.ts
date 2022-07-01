import { FlowTask } from '@devhelpr/flowrunner';
export declare class ExpressionTask extends FlowTask {
    private compiledExpressionTree;
    private expression;
    execute(node: any, services: any): Promise<unknown>;
    getDescription(): string;
    getName(): string;
    getFullName(): string;
    getIcon(): string;
    getShape(): string;
    getDefaultColor(): string;
    getTaskType(): string;
    getPackageType(): number;
    getCategory(): string;
    getController(): string;
    getConfigMetaData(): ({
        name: string;
        defaultValue: string;
        valueType: string;
        required: boolean;
    } | {
        name: string;
        defaultValue: boolean;
        valueType: string;
        required: boolean;
    })[];
}
