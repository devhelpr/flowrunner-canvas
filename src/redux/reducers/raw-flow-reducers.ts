import { STORE_RAW_FLOW, MODIFY_RAW_FLOW, ADD_RAW_FLOW, 
  ADD_RAW_CONNECTION, DELETE_CONNECTION, DELETE_NODE, STORE_RAW_NODE } from '../actions/raw-flow-actions';
import produce from 'immer';

export const rawFlowReducer = (state: any = [], action: any) => {

  return produce(state, draft => {
    switch (action.type) {
      case STORE_RAW_FLOW: {
        return action.payload.flow;
      }
      case MODIFY_RAW_FLOW: {
        let newDraft = [...draft];
        newDraft = newDraft.map(node => {
          if (node.name === action.payload.orgNodeName) {
            node = Object.assign({}, action.payload.node, {
              name: action.payload.node.name,
              id: action.payload.node.name,
            });
          } else if (node.startshapeid === action.payload.orgNodeName && action.payload.node.shapeType !== 'Line') {
            node = Object.assign({}, node, {
              startshapeid: action.payload.node.name,
            });
          } else if (node.endshapeid === action.payload.orgNodeName && action.payload.node.shapeType !== 'Line') {
            node = Object.assign({}, node, {
              endshapeid: action.payload.node.name,
            });
          }
          return node;
        });
        return newDraft;
      }
      case ADD_RAW_FLOW : {
        draft.push(action.payload.node);
        return draft;
      }
      case ADD_RAW_CONNECTION : {
        draft.push(action.payload.node);
        return draft;
      }
      case STORE_RAW_NODE: {
        let newState = [...draft];
        newState = newState.map(node => {
          if (node.name === action.payload.orgNodeName) {
            node = Object.assign({}, action.payload.node, {
              name: action.payload.node.name,
              id: action.payload.node.name,
            });
          } else if (node.startshapeid === action.payload.orgNodeName && action.payload.node.shapeType !== 'Line') {
            node = Object.assign({}, node, {
              startshapeid: action.payload.node.name,
            });
          } else if (node.endshapeid === action.payload.orgNodeName && action.payload.node.shapeType !== 'Line') {
            node = Object.assign({}, node, {
              endshapeid: action.payload.node.name,
            });
          }
          return node;
        });
        return newState;
      }
      case DELETE_CONNECTION: {
        return [
          ...draft.filter(node => {
            return node.name !== action.payload.node.name;
          }),
        ];
      }
      case DELETE_NODE: {
        return [
          ...draft.filter(node => {
            if (node.shapeType !== 'Line') {
              return node.name !== action.payload.node.name;
            }

            return node.startshapeid !== action.payload.node.name && node.endshapeid !== action.payload.node.name;
          }),
        ];
      }
      default:
        return draft;
    }
  })
};
