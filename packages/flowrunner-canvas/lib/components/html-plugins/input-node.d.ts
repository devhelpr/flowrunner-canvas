import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export declare class InputNodeHtmlPluginInfo {
    getWidth: (node: any) => number;
    getHeight(node: any): number;
}
export interface InputNodeHtmlPluginProps {
    flowrunnerConnector: IFlowrunnerConnector;
    node: any;
}
export interface InputNodeHtmlPluginState {
    value: string;
    values: string[];
    node: any;
}
export declare const InputNodeHtmlPlugin: (props: InputNodeHtmlPluginProps) => JSX.Element;
