import * as React from 'react';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export interface GridEditNodeHtmlPluginProps {
    flowrunnerConnector: IFlowrunnerConnector;
    node: any;
    flow: any;
}
export interface GridEditNodeHtmlPluginState {
    value: number | number[];
    receivedPayload: any[];
    data: IMatrixValue[];
}
export interface IMatrixValue {
    x: number;
    y: number;
    value: number;
}
export declare class GridEditNodeHtmlPlugin extends React.Component<GridEditNodeHtmlPluginProps, GridEditNodeHtmlPluginState> {
    state: {
        value: any;
        receivedPayload: never[];
        data: never[];
    };
    observableId: string;
    componentDidMount(): void;
    componentDidUpdate(prevProps: any): void;
    unmounted: boolean;
    componentWillUnmount(): void;
    getWidth(): number;
    getHeight(): number;
    getCanvasHeight(): number;
    clickCircle: (matrixValue: IMatrixValue, event: any) => boolean;
    onLoadPreset: () => void;
    onGetData: () => IMatrixValue[];
    onSetData: (data: any) => void;
    render(): JSX.Element | null;
}
