import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export interface MultiFormViewProps {
    flowrunnerConnector: IFlowrunnerConnector;
    flowId?: string;
    renderHtmlNode?: (node: any, flowrunnerConnector: IFlowrunnerConnector, flow: any, taskSettings?: any) => any;
    getNodeInstance?: (node: any, flowrunnerConnector: IFlowrunnerConnector, flow: any, taskSettings?: any) => any;
}
export declare const MultiFormView: (props: MultiFormViewProps) => JSX.Element;
