import {
  STORE_RAW_FLOW,
} from '../actions/raw-flow-actions';

export const rawFlowReducer = (state: any = [], action: any) => {
  switch (action.type) {
    case STORE_RAW_FLOW: {
      return action.payload.flow;
    }    
    default:
      return state;
  }
};
