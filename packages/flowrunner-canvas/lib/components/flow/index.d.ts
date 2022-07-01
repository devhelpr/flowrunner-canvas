import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export interface IFlowProps {
    flow: any[];
    flowId: string;
    flowrunnerConnector: IFlowrunnerConnector;
}
export declare const Flow: (props: IFlowProps) => JSX.Element;
