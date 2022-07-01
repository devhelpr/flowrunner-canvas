import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export interface UserInterfaceViewProps {
    flowrunnerConnector: IFlowrunnerConnector;
    flowId?: string;
    flowPackage?: any;
    showTitleBar?: boolean;
    renderHtmlNode?: (node: any, flowrunnerConnector: IFlowrunnerConnector, flow: any, taskSettings?: any) => any;
    getNodeInstance?: (node: any, flowrunnerConnector: IFlowrunnerConnector, flow: any, taskSettings?: any) => any;
}
export declare const UserInterfaceView: (props: UserInterfaceViewProps) => JSX.Element;
