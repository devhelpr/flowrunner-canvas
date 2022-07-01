import { FlowTask } from '@devhelpr/flowrunner';
export declare class GetCookie extends FlowTask {
    execute(node: any, services: any): any;
    getName(): string;
}
export declare class SetCookie extends FlowTask {
    execute(node: any, services: any): boolean;
    getName(): string;
}
