import { SELECT_NODE } from '../actions/node-actions';

export const nodeReducer = (state: any = {}, action: any) => {
  switch (action.type) {
    case SELECT_NODE: {
      return {
        name: action.payload.nodeName,
        node: action.payload.node,
      };
    }
    default:
      return state;
  }
};
