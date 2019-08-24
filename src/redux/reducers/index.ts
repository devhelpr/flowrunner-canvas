import { flowReducer } from './flow-reducers';
import { nodeReducer } from './node-reducers';
import { canvasModeReducer} from './canvas-mode-reducers';

export const reducers = {
	flow: flowReducer,
	selectedNode: nodeReducer,
	canvasMode: canvasModeReducer
}