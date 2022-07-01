import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { IModalSize } from '../../interfaces/IModalSize';
export interface EditNodeSettingsProps {
    node: any;
    settings: any;
    flowrunnerConnector: IFlowrunnerConnector;
    modalSize?: IModalSize;
    hasTaskNameAsNodeTitle?: boolean;
    onClose: (pushFlow?: boolean) => void;
}
export interface EditNodeSettingsState {
    value: any;
    orgNodeName: string;
    orgNodeValues: any;
    requiredNodeValues: any;
}
export declare const EditNodeSettings: (props: EditNodeSettingsProps) => JSX.Element;
