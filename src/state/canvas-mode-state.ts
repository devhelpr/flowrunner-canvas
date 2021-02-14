import create from 'zustand';
import { State, SetState } from 'zustand';
import produce from 'immer';

interface ICanvasModeState extends State {
  isConnectingNodes: boolean;
  selectedTask: string;
  showDependencies: boolean;
  allowInputToHtmlNodes: boolean;
  isFlowrunnerPaused: boolean;
  flowType: string;
  editorMode: string;
  flowsPlayground: any[];
  flowsWasm: any[];
  setConnectiongNodeCanvasMode: (isConnectingNodes: boolean) => void;
  setSelectedTask: (selectedTask: string) => void;
  setShowDependencies: (showDependencies: boolean) => void;
  setAllowInputToHtmlNodes: (allowInputToHtmlNodes: boolean) => void;
  setFlowrunnerPaused: (isFlowrunnerPaused: boolean) => void;
  setFlowType: (flowType: string) => void;
  setEditorMode: (editorMode: string) => void;
  setFlowsPlayground: (flowsPlayground: any[]) => void;
  setFlowsWasm: (flowsWasm: any[]) => void;
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
  };
};

export const useCanvasModeStateStore = create<ICanvasModeState>(set => storeHandler(set));
export const useCanvasModeStateForMultiFormStore = create<ICanvasModeState>(set => storeHandler(set));
