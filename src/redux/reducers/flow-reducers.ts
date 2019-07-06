import { STORE_FLOW_NODE, STORE_FLOW } from '../actions/flow-actions';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
export const flowReducer = (state : any = [], action : any) => {
	switch (action.type) {
		case STORE_FLOW: {
			return FlowToCanvas.convertFlowPackageToCanvasFlow(action.payload.flow);
		}
		case STORE_FLOW_NODE: {
			let newState = {...state};
			newState.map((node) => {
				if (node.name === action.payload.node.name) {
					node = Object.assign({}, action.payload.node);
				}
			})
			return newState;
		}
		default:
			return state;
	}
}