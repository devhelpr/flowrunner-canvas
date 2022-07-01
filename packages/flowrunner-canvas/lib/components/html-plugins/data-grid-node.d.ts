import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export declare class DataGridNodeHtmlPluginInfo {
    getWidth: (node: any) => any;
    getHeight(node: any): any;
}
export interface DataGridNodeHtmlPluginProps {
    flowrunnerConnector: IFlowrunnerConnector;
    node: any;
}
export interface DataGridNodeHtmlPluginState {
    value: string;
    values: string[];
    node: any;
    currentValue: string;
}
export declare const DataGridNodeHtmlPlugin: (props: DataGridNodeHtmlPluginProps) => JSX.Element;
