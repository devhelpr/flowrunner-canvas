import create from 'zustand';
import { State, SetState } from 'zustand';

export enum PopupEnum {
  none = 0,
  editNamePopup,
}

interface ICanvasModeState extends State {
  isConnectingNodes: boolean;
  selectedTask: string;
  showDependencies: boolean;
  snapToGrid: boolean;
  allowInputToHtmlNodes: boolean;
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
}

//set(state => ({ bears: state.bears + 1 }))

let storeHandler = (set: SetState<ICanvasModeState>): ICanvasModeState => {
  return {
    isConnectingNodes: false,
    selectedTask: '',
    showDependencies: false,
    allowInputToHtmlNodes: false,
    isFlowrunnerPaused: false,
    flowType: '',
    editorMode: 'canvas',
    flowsPlayground: [],
    flowsWasm: [],
    currentPopup: PopupEnum.none,
    onPresetName: undefined,
    flowsUpdateId: '',
    snapToGrid: false,
    setConnectiongNodeCanvasMode: (isConnectingNodes: boolean) =>
      set(state => ({
        isConnectingNodes: isConnectingNodes,
      })),
    setSelectedTask: (selectedTask: string) =>
      set(state => ({
        selectedTask: selectedTask,
      })),
    setShowDependencies: (showDependencies: boolean) =>
      set(state => ({
        showDependencies: showDependencies,
      })),
    setSnapToGrid: (snapToGrid: boolean) =>
      set(state => ({
        snapToGrid: snapToGrid,
      })),
    setAllowInputToHtmlNodes: (allowInputToHtmlNodes: boolean) =>
      set(state => ({
        allowInputToHtmlNodes: allowInputToHtmlNodes,
      })),
    setFlowrunnerPaused: (isFlowrunnerPaused: boolean) =>
      set(state => ({
        isFlowrunnerPaused: isFlowrunnerPaused,
      })),
    setFlowType: (flowType: string) =>
      set(state => ({
        flowType: flowType,
      })),
    setEditorMode: (editorMode: string) =>
      set(state => ({
        editorMode: editorMode,
      })),
    setFlowsPlayground: (flowsPlayground: any[]) =>
      set(state => ({
        flowsPlayground: flowsPlayground,
      })),
    setFlowsWasm: (flowsWasm: any[]) =>
      set(state => ({
        flowsWasm: flowsWasm,
      })),
    setCurrentPopup: (popup: PopupEnum, onPresetName?: undefined | ((name: string) => void)) =>
      set(state => ({
        currentPopup: popup,
        onPresetName: onPresetName,
      })),
    setFlowsUpdateId: (id: string) =>
      set(state => ({
        flowsUpdateId: id,
      })),
  };
};

export const useCanvasModeStateStore = create<ICanvasModeState>(set => storeHandler(set));
export const useCanvasModeStateForMultiFormStore = create<ICanvasModeState>(set => storeHandler(set));
