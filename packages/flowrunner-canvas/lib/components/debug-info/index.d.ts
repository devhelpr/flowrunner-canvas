import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export interface DebugInfoProps {
    flowrunnerConnector: IFlowrunnerConnector;
}
export interface DebugInfoState {
    payload: any;
    fullscreen: boolean;
}
export declare const DebugInfo: (props: DebugInfoProps) => JSX.Element | null;
