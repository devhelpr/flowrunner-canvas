export interface IStateMachine {
    hasStateMachine: boolean;
    currentState: () => string;
    event: (eventName: string, payload?: any) => Promise<string>;
    states: IState[];
    setInitialState: (state: string) => void;
}
export interface IState {
    name: string;
    events: IEventState[];
    nodeName: string;
}
export interface IEventState {
    name: string;
    newState: string;
    guards?: IGuard[];
}
export interface IEvent {
    name: string;
    nodeName: string;
    newState: string;
    connectedStateNodeName: string;
    guards?: IGuard[];
}
export interface IGuard {
    name: string;
    nodeName: string;
    node: any;
}
export declare const emptyStateMachine: {
    hasStateMachine: boolean;
    currentState: () => string;
    states: never[];
    event: (eventName: string) => Promise<string>;
    setInitialState: (_state: string) => undefined;
};
export declare const clearStateMachine: () => void;
export declare const getCurrentState: (stateMachine: string) => any;
export declare const createStateMachine: (flow: any[]) => IStateMachine;
export declare const getCurrentStateMachine: () => IStateMachine;
export declare const setOnSetCanvasStateCallback: (onSetCanvasStateCallback: (stateMachineName: string, currentState: string) => void) => void;
export declare const resetOnSetCanvasStateCallback: () => void;
export declare const registerStateChangeHandler: (name: string, onStateChangeHandler: (stateMachineName: string, currentState: string, isStateMachineStarting?: boolean | undefined) => void) => void;
export declare const unRegisterStateChangeHandler: (name: string) => void;
export declare const sendCurrentState: () => void;
export declare const setOnGuardEventCallback: (onGuardEventCallback: (stateMachineName: string, currentState: string, eventName: string, node: any, payload: any) => boolean) => void;
export declare const resetOnGuardEventCallback: () => void;
