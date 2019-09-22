import {
  STORE_FLOW_NODE,
  STORE_FLOW,
  ADD_FLOW,
  ADD_CONNECTION,
  DELETE_CONNECTION,
  DELETE_NODE
} from '../actions/flow-actions';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;

export const flowReducer = (state: any = [], action: any) => {
  switch (action.type) {
    case STORE_FLOW: {
      return FlowToCanvas.convertFlowPackageToCanvasFlow(action.payload.flow);
    }
    case STORE_FLOW_NODE: {
      let newState = [...state];
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
    case ADD_CONNECTION: {
      const nodeFromPosition = FlowToCanvas.getStartPointForLine(action.payload.nodeFrom, {
        x: action.payload.nodeFrom.x,
        y: action.payload.nodeFrom.y,
      });
      const nodeToPosition = FlowToCanvas.getEndPointForLine(action.payload.nodeTo, {
        x: action.payload.nodeTo.x,
        y: action.payload.nodeTo.y,
      });

      const connection = {
        name: 'connection-' + uuidV4(),
        taskType: 'connection',
        shapeType: 'Line',
        startshapeid: action.payload.nodeFrom.name,
        endshapeid: action.payload.nodeTo.name,
        xstart: nodeFromPosition.x,
        ystart: nodeFromPosition.y,
        xend: nodeToPosition.x,
        yend: nodeToPosition.y,
      };
      return [...state, connection];
    }
    
    case ADD_FLOW: {      
       let newState = [...state, action.payload.node];
       return newState;
    }
    case DELETE_CONNECTION: {
      return [
        ...state.filter(node => {
          return node.name !== action.payload.node.name;
        }),
      ];
    }
    case DELETE_NODE: {
      return [
        ...state.filter(node => {
          if (node.shapeType !== 'Line') {
            return node.name !== action.payload.node.name;
          }

          return node.startshapeid !== action.payload.node.name && node.endshapeid !== action.payload.node.name;
        }),
      ];
    }
    default:
      return state;
  }
};
