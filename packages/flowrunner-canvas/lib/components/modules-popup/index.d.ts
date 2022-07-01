import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export interface ModulesPopupProps {
    onClose: () => void;
    flowrunnerConnector: IFlowrunnerConnector;
}
export declare const ModulesPopup: (props: ModulesPopupProps) => JSX.Element;
