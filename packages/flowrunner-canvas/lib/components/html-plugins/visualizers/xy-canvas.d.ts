import * as React from 'react';
import { IFlowrunnerConnector } from '../../../interfaces/IFlowrunnerConnector';
export interface XYCanvasProps {
    node: any;
    payloads: any[];
    selectedNode: any;
    flowrunnerConnector: IFlowrunnerConnector;
}
export interface XYCanvasState {
}
interface IMinMax {
    min?: number;
    max?: number;
    ratio: number;
    correction: number;
}
export declare class XYCanvas extends React.Component<XYCanvasProps, XYCanvasState> {
    state: {};
    componentDidMount(): void;
    getCurrentDebugNotifier: () => JSX.Element | null;
    getMinMax: (payloads: any[], series: any[], height: number, node: any) => IMinMax;
    getLineChart: (node: any, xProperty: any, yProperty: any, payload: any, index: number, payloads: any[], color: string, serieIndex: number, title: string, fill: string, minmax: IMinMax) => any;
    getCurved: (node: any, xProperty: any, yProperty: any, payloads: any[], minmax: IMinMax) => JSX.Element;
    render(): JSX.Element;
}
export {};
