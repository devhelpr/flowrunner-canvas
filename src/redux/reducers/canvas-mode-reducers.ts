import {
  SET_CONNECTING_CANVAS_MODE_NODE,
  SET_SELECTED_TASK,
  SET_SHOWDEPENDENCIES,
  SET_ALLOWINPUTTOHTMLNODES,
  SET_FLOWRUNNERPAUSED,
  SET_FLOWTYPE,
  SET_EDITORMODE,
} from '../actions/canvas-mode-actions';

export interface ICanvasMode {
  isConnectingNodes: boolean;
  selectedTask: string;
  showDependencies: boolean;
  allowInputToHtmlNodes: boolean;
  isFlowrunnerPaused: boolean;
  flowType: string;
  editorMode: string;
}

export const canvasModeReducer = (
  state: ICanvasMode = {
    isConnectingNodes: false,
    selectedTask: '',
    showDependencies: false,
    allowInputToHtmlNodes: false,
    isFlowrunnerPaused: false,
    flowType: '',
    editorMode: 'canvas',
  },
  action: any,
) => {
  switch (action.type) {
    case SET_CONNECTING_CANVAS_MODE_NODE: {
      return {
        ...state,
        isConnectingNodes: action.payload.enabled,
      };
    }
    case SET_SELECTED_TASK: {
      return {
        ...state,
        selectedTask: action.payload.selectedTask,
      };
    }
    case SET_SHOWDEPENDENCIES: {
      return {
        ...state,
        showDependencies: action.payload.showDependencies,
      };
    }
    case SET_ALLOWINPUTTOHTMLNODES: {
      return {
        ...state,
        allowInputToHtmlNodes: action.payload.allowInputToHtmlNodes,
      };
    }
    case SET_FLOWRUNNERPAUSED: {
      return {
        ...state,
        isFlowrunnerPaused: action.payload.paused,
      };
    }
    case SET_FLOWTYPE: {
      return {
        ...state,
        flowType: action.payload.flowType,
      };
    }
    case SET_EDITORMODE: {
      return {
        ...state,
        editorMode: action.payload.editorMode,
      };
    }
    default:
      return state;
  }
};
