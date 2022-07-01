import * as React from 'react';
export interface LayoutWithDropAreaProps {
    onStoreLayout: (level: any, index: any, subIndex: any, layout: any) => void;
    onGetLayout: (level: any, index: any, subIndex: any) => any;
    level: number;
    name: string;
    layoutIndex: number;
    layoutIndexLevel?: number;
    tree?: any;
    getNodeInstance: any;
    flowrunnerConnector: any;
    flow: any;
    renderHtmlNode: any;
    flowHash: any;
}
export interface LayoutWithDropAreaState {
    layout: any[];
}
export declare class LayoutWithDropArea extends React.Component<LayoutWithDropAreaProps, LayoutWithDropAreaState> {
    dropZone: any;
    constructor(props: any);
    componentDidUpdate(prevProps: any): void;
    onAllowDrop: (event: any) => void;
    onDragLeave: (event: any) => void;
    onDropTask: (event: any) => boolean | undefined;
    onDragStartOther: (event: any) => void;
    onAllowDropOther: (event: any) => void;
    onDropTaskOther: (event: any) => false | undefined;
    onDragLeaveOther: (event: any) => void;
    render(): JSX.Element;
}
