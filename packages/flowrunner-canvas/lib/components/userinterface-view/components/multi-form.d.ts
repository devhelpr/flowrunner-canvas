import { IFlowrunnerConnector } from '../../../interfaces/IFlowrunnerConnector';
export interface IMultiForm {
    node: any;
    settings: any;
    flowrunnerConnector: IFlowrunnerConnector;
    renderHtmlNode: any;
    getNodeInstance: any;
}
export declare const MultiForm: (props: IMultiForm) => JSX.Element;
