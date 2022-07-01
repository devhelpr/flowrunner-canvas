import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export interface NewFlowProps {
    onClose: () => void;
    onSave: (id: number | string, flowType: string) => void;
    flowrunnerConnector: IFlowrunnerConnector;
}
export declare const NewFlow: (props: NewFlowProps) => JSX.Element;
