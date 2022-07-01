import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export interface DebugNodeHtmlPluginProps {
    flowrunnerConnector: IFlowrunnerConnector;
    node: any;
    flow: any;
    children?: any;
}
export interface DebugNodeHtmlPluginState {
    receivedPayload: any[];
    expressionTree: any;
}
export declare const DebugNodeHtmlPlugin: (props: DebugNodeHtmlPluginProps) => JSX.Element;
