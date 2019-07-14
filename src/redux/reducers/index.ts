import { flowReducer } from './flow-reducers';
import { nodeReducer } from './node-reducers';

export const reducers = {
	flow: flowReducer,
	selectedNode: nodeReducer
}