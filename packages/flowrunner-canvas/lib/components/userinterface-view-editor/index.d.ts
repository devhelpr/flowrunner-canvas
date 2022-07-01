import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export interface UserInterfaceViewEditorProps {
    flowrunnerConnector: IFlowrunnerConnector;
    renderHtmlNode?: (node: any, flowrunnerConnector: IFlowrunnerConnector, flow: any, taskSettings?: any) => any;
    getNodeInstance?: (node: any, flowrunnerConnector: IFlowrunnerConnector, flow: any, taskSettings?: any) => any;
}
export interface UserInterfaceViewEditorState {
    tree: any;
    renderIndex: number;
    flowHash: any;
    nodesOnLayout: any;
}
export declare const UserInterfaceViewEditor: (props: UserInterfaceViewEditorProps) => JSX.Element;
