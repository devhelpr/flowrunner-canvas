import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { IModalSize } from '../../interfaces/IModalSize';
export interface EditBundleProps {
    hasTaskNameAsNodeTitle: boolean;
    flowrunnerConnector: IFlowrunnerConnector;
    modalSize?: IModalSize;
    renderHtmlNode?: (node: any, flowrunnerConnector: IFlowrunnerConnector, flow: any, taskSettings?: any) => any;
    getNodeInstance: (node: any, flowrunnerConnector?: IFlowrunnerConnector, flow?: any, taskSettings?: any) => any;
    onClose: (pushFlow?: boolean) => void;
}
export declare const EditBundle: (props: EditBundleProps) => JSX.Element;
