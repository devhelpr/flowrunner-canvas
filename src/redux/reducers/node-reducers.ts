import { SELECT_NODE, SET_PAYLOAD } from '../actions/node-actions';
import produce from 'immer';

export const nodeReducer = (state: any = {}, action: any) => {
  return produce(state, draft => {
    switch (action.type) {
      case SELECT_NODE: {
        return {
          name: action.payload.nodeName,
          node: action.payload.node,
          payload: undefined,
        };
      }
      case SET_PAYLOAD: {
        return {
          ...draft,
          payload: action.payload.payload,
        };
      }

      default:
        return draft;
    }
  });
};
