import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export interface TaskbarProps {
    flowrunnerConnector: IFlowrunnerConnector;
    isDragging: boolean;
    hasCustomNodesAndRepository: boolean;
}
export interface TaskbarState {
    metaDataInfo: any[];
}
export declare enum TaskMenuMode {
    tasks = 0,
    modules = 1
}
export interface IModule {
    id: string;
    name: string;
    fileName: string;
    moduleType: string;
    urlProperty: string;
    structure: string;
    primaryKey: string;
}
export declare const Taskbar: (props: TaskbarProps) => JSX.Element;
