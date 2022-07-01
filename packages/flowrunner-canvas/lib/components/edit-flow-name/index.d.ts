import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export interface EditFlowProps {
    onClose: () => void;
    onSaveFlowName: (flowId: string, flowName: string) => void;
    flowrunnerConnector: IFlowrunnerConnector;
}
export declare const EditFlowName: (props: EditFlowProps) => JSX.Element;
