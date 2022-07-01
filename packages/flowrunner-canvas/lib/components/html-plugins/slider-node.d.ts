import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export declare class SliderNodeHtmlPluginInfo {
    getWidth: (node: any) => number;
    getHeight(node: any): void;
}
export interface SliderNodeHtmlPluginProps {
    flowrunnerConnector: IFlowrunnerConnector;
    node: any;
    flow: any;
}
export interface SliderNodeHtmlPluginState {
    value: number | number[];
    receivedPayload: any[];
}
export declare const SliderNodeHtmlPlugin: (props: SliderNodeHtmlPluginProps) => JSX.Element;
