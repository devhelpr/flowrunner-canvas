import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export interface ExecuteNodeHtmlPluginProps {
    flowrunnerConnector: IFlowrunnerConnector;
    node: any;
}
export declare class ExecuteNodeHtmlPluginInfo {
    getWidth: (node: any) => void;
    getHeight(node: any): void;
}
export declare const ExecuteNodeHtmlPlugin: (props: ExecuteNodeHtmlPluginProps) => JSX.Element;
