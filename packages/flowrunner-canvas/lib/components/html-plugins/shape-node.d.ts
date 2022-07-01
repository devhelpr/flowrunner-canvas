import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export interface ShapeNodeHtmlPluginProps {
    flowrunnerConnector: IFlowrunnerConnector;
    node: any;
    taskSettings?: any;
}
export declare class ShapeNodeHtmlPluginInfo {
    _taskSettings?: any;
    constructor(taskSettings?: any);
    getWidth: (node: any) => any;
    getHeight(node: any): any;
}
export declare const ShapeNodeHtmlPlugin: (props: ShapeNodeHtmlPluginProps) => JSX.Element;
