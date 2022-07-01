import { State } from 'zustand';
export declare enum PopupEnum {
    none = 0,
    editNamePopup = 1
}
export interface ICanvasModeState extends State {
    isConnectingNodes: boolean;
    selectedTask: string;
    showDependencies: boolean;
    snapToGrid: boolean;
    allowInputToHtmlNodes: boolean;
    isInMultiSelect: boolean;
    selectedNodes: string[];
    isFlowrunnerPaused: boolean;
    flowType: string;
    editorMode: string;
    flowsPlayground: any[];
    flowsWasm: any[];
    currentPopup: PopupEnum;
    flowsUpdateId: string;
    onPresetName?: (name: string) => void;
    setConnectiongNodeCanvasMode: (isConnectingNodes: boolean) => void;
    setSelectedTask: (selectedTask: string) => void;
    setShowDependencies: (showDependencies: boolean) => void;
    setAllowInputToHtmlNodes: (allowInputToHtmlNodes: boolean) => void;
    setFlowrunnerPaused: (isFlowrunnerPaused: boolean) => void;
    setFlowType: (flowType: string) => void;
    setEditorMode: (editorMode: string) => void;
    setFlowsPlayground: (flowsPlayground: any[]) => void;
    setFlowsWasm: (flowsWasm: any[]) => void;
    setCurrentPopup: (popup: PopupEnum, onPresetName: undefined | ((name: string) => void)) => void;
    setFlowsUpdateId: (id: string) => void;
    setSnapToGrid: (snapToGrid: boolean) => void;
    setIsInMultiSelect: (isInMultiSelect: boolean, nodes: string[]) => void;
}
export declare const useCanvasModeStateStore: import("zustand").UseBoundStore<ICanvasModeState, import("zustand").StoreApi<ICanvasModeState>>;
export declare const useCanvasModeStateForMultiFormStore: import("zustand").UseBoundStore<ICanvasModeState, import("zustand").StoreApi<ICanvasModeState>>;
export declare const useBundleCanvasModeStateStore: import("zustand").UseBoundStore<ICanvasModeState, import("zustand").StoreApi<ICanvasModeState>>;
