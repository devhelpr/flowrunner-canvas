import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export interface EditPopupProps {
    flowrunnerConnector: IFlowrunnerConnector;
    onClose: (pushFlow?: boolean) => void;
}
export declare const EditPopup: (props: EditPopupProps) => JSX.Element;
