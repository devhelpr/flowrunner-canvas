import { action } from 'typesafe-actions';

export const STORE_FLOW_NODE = 'STORE_FLOW_NODE';
export const STORE_FLOW = 'STORE_FLOW';
export const ADD_FLOW = 'ADD_FLOW';
export const ADD_CONNECTION = 'ADD_CONNECTION';
export const DELETE_CONNECTION = 'DELETE_CONNECTION';
export const DELETE_NODE = 'DELETE_NODE';

export const storeFlow = (flow: any) => action(STORE_FLOW, { flow: flow });

export const storeFlowNode = (node: any) => action(STORE_FLOW_NODE, { node: node });

export const addFlowNode = (node: any) => action(ADD_FLOW, { node: node });

export const addConnection = (nodeFrom: any, nodeTo: any) =>
  action(ADD_CONNECTION, { nodeFrom: nodeFrom, nodeTo: nodeTo });

export const deleteConnection = (node: any) => action(DELETE_CONNECTION, { node: node });

export const deleteNode = (node: any) => action(DELETE_NODE, { node: node });
