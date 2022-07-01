import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { IFlowState } from '../../state/flow-state';
import { INodeState } from '../../state/selected-node-state';
import { Subject } from 'rxjs';
import { IModalSize } from '../../interfaces/IModalSize';
export interface EditNodeProps {
    node: any;
    settings: any;
    flowrunnerConnector: IFlowrunnerConnector;
    formNodesubject?: Subject<any>;
    modalSize?: IModalSize;
    hasTaskNameAsNodeTitle?: boolean;
    useFlowStore: () => IFlowState;
    useSelectedNodeStore: (param?: any) => INodeState;
    onClose: (pushFlow?: boolean) => void;
}
export interface EditNodesState {
    value: any;
    orgNodeName: string;
    orgNodeValues: any;
    requiredNodeValues: any;
}
export declare const EditNodePopup: (props: EditNodeProps) => JSX.Element;
