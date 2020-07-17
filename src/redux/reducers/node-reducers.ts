import { SELECT_NODE, SET_PAYLOAD } from '../actions/node-actions';

export const nodeReducer = (state: any = {}, action: any) => {
  switch (action.type) {
    case SELECT_NODE: {
      return {
        name: action.payload.nodeName,
        node: action.payload.node,
        payload: undefined
      };
    }
    case SET_PAYLOAD: {
      return {
        ...state,
        payload: action.payload.payload
      }
    }

    default:
      return state;
  }
};
