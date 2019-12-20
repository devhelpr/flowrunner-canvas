import { SET_CONNECTING_CANVAS_MODE_NODE, SET_SELECTED_TASK, SET_SHOWDEPENDENCIES } from '../actions/canvas-mode-actions';

export interface ICanvasMode {
  isConnectingNodes: boolean;
  selectedTask: string;
  showDependencies: boolean;
}

export const canvasModeReducer = (
  state: ICanvasMode = {
    isConnectingNodes: false,
    selectedTask: '',
    showDependencies: false
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
        showDependencies: action.payload.showDependencies
      }
    }
    default:
      return state;
  }
};
