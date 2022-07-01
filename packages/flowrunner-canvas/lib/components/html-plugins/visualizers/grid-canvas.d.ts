import * as React from 'react';
export interface GridCanvasProps {
    node: any;
    payloads: any[];
}
export interface GridCanvasState {
}
export declare class GridCanvas extends React.Component<GridCanvasProps, GridCanvasState> {
    state: {};
    componentDidMount(): void;
    getWidth(): number;
    getHeight(): number;
    render(): JSX.Element;
}
