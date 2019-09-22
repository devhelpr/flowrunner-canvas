import { SET_CONNECTING_CANVAS_MODE_NODE, SET_SELECTED_TASK } from '../actions/canvas-mode-actions';

export interface ICanvasMode {
  isConnectingNodes: boolean;
  selectedTask: string;
}

export const canvasModeReducer = (
  state: ICanvasMode = {
    isConnectingNodes: false,
    selectedTask : ""
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
    default:
      return state;
  }
};
