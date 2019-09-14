import {
  STORE_FLOW_NODE,
  STORE_FLOW,
  ADD_FLOW,
  ADD_CONNECTION,
  DELETE_CONNECTION,
  DELETE_NODE,
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
      let loop = 0;
      let max: any;
      while (loop < state.length) {
        if (state[loop].name.indexOf(action.payload.node.name) === 0) {
          if (state[loop].name === action.payload.node.name) {
            if (max === undefined) {
              max = 0;
            } else {
              max = max + 1;
            }
          } else {
            const last = state[loop].name.substring(action.payload.node.name.length);
            const number = parseInt(last);
            if (!isNaN(number)) {
              if (max === undefined) {
                max = number;
              } else if (number > max) {
                max = number;
              }
            }
          }
        }
        loop++;
      }

      const newNode = Object.assign({}, action.payload.node);
      if (max !== undefined) {
        newNode.name = newNode.name + (max + 1);
        newNode.id = newNode.name;
      }

      let newState = [...state, newNode];
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
