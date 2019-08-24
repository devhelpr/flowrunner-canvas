import { SET_CONNECTING_CANVAS_MODE_NODE} from '../actions/canvas-mode-actions';

export interface ICanvasMode {
	isConnectingNodes : boolean;
}

export const canvasModeReducer = (state : ICanvasMode = { 
	isConnectingNodes : false
}, action : any) => {
	switch (action.type) {
		case SET_CONNECTING_CANVAS_MODE_NODE: {
			return {
				...state,
				isConnectingNodes: action.payload.enabled
			};
		}		
		default:
			return state;
	}
}