import { SET_NODES_TOUCHED, CLEAR_NODES_TOUCHED } from '../actions/nodes-touched-actions';
import produce from 'immer';

export const nodesTouchedReducer = (state: any = {}, action: any) => {
  return produce(state, draft => {
    switch (action.type) {
      case SET_NODES_TOUCHED: {
        return {          
          ...action.payload.nodesTouched
        };
      }
      case CLEAR_NODES_TOUCHED: {
        return {};
      }

      default:
        return draft;
    }
  });
};
