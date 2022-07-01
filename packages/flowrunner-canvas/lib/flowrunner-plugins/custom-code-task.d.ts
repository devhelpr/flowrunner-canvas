import { FlowTask } from '@devhelpr/flowrunner';
export declare class CustomCodeTask extends FlowTask {
    functionInstance?: any;
    code?: string;
    execute(node: any, services: any): any;
    getName(): string;
}
