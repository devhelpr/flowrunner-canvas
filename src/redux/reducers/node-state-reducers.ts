import { SET_NODE_STATE, CLEAR_NODE_STATES } from '../actions/node-state-actions';
import produce from 'immer';

export const nodeStateReducer = (state: any = {}, action: any) => {
  return produce(state, draft => {
    switch (action.type) {
      case SET_NODE_STATE: {
        return {
          ...draft,
          [action.payload.nodeName]: action.payload.nodeState,
        };
      }
      case CLEAR_NODE_STATES: {
        return {};
      }

      default:
        return draft;
    }
  });
};
