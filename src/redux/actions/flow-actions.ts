import { action } from 'typesafe-actions';
import { selectNode } from './node-actions';

export const STORE_FLOW_NODE = 'STORE_FLOW_NODE';
export const STORE_FLOW = 'STORE_FLOW';
export const ADD_FLOW = 'ADD_FLOW';
export const ADD_CONNECTION = 'ADD_CONNECTION';
export const DELETE_CONNECTION = 'DELETE_CONNECTION';
export const DELETE_NODE = 'DELETE_NODE';
export const ADD_NODE = 'ADD_NODE';

export const storeFlow = (flow: any) => action(STORE_FLOW, { flow: flow });

export const storeFlowNode = (node: any, orgNodeName: string) =>
  action(STORE_FLOW_NODE, { node: node, orgNodeName: orgNodeName });

export const addFlowNode = (node: any) => action(ADD_FLOW, { node: node });
export const addNode = (node: any, flow: any[]) => {
  return (dispatch: any) => {
    let loop = 0;
    let max: any;
    while (loop < flow.length) {
      if (flow[loop].name.indexOf(node.name) === 0) {
        if (flow[loop].name === node.name) {
          if (max === undefined) {
            max = 0;
          } else {
            max = max + 1;
          }
        } else {
          const last = flow[loop].name.substring(node.name.length);
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

    const newNode = Object.assign({}, node);
    if (max !== undefined) {
      newNode.name = newNode.name + (max + 1);
      newNode.id = newNode.name;
    }
    dispatch(addFlowNode(newNode));
    dispatch(selectNode(newNode.name, newNode));
  };
};

export const addConnection = (nodeFrom: any, nodeTo: any) =>
  action(ADD_CONNECTION, { nodeFrom: nodeFrom, nodeTo: nodeTo });

export const deleteConnection = (node: any) => action(DELETE_CONNECTION, { node: node });

export const deleteNode = (node: any) => action(DELETE_NODE, { node: node });
