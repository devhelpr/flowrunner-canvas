import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export interface CustomNodeHtmlPluginProps {
    flowrunnerConnector: IFlowrunnerConnector;
    node: any;
    taskSettings?: any;
}
export declare class CustomNodeHtmlPluginInfo {
    _taskSettings?: any;
    constructor(taskSettings?: any);
    getWidth: (node: any) => void;
    getHeight(node: any): void;
}
export declare const CustomNodeHtmlPlugin: (props: CustomNodeHtmlPluginProps) => JSX.Element;
