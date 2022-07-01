import { FlowTask } from '@devhelpr/flowrunner';
export interface IMatrix {
    columns: number;
    rows: number;
    uuid: string;
    data: number[];
}
export declare class MatrixTask extends FlowTask {
    webassembly: any;
    performance: any;
    execute(node: any, services: any): any;
    kill(): void;
    getName(): string;
}
