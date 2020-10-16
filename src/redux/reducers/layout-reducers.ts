import {
  STORE_LAYOUT,
} from '../actions/layout-actions';
import produce from 'immer';

export const layoutReducer = (state: string = "{}", action: any) => {
  return produce(state, draft => {
    switch (action.type) {
      case STORE_LAYOUT: {
        return action.payload.layout;
      }      
      default:
        return draft;
    }
  });
};
