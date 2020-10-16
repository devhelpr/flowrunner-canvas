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

export const addConnection = (connection: any) => action(ADD_CONNECTION, { connection: connection });

export const deleteConnection = (node: any) => action(DELETE_CONNECTION, { node: node });

export const deleteNode = (node: any) => action(DELETE_NODE, { node: node });
