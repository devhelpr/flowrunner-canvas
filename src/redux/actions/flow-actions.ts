import { action } from 'typesafe-actions';

export const STORE_FLOW_NODE = 'STORE_FLOW_NODE';
export const STORE_FLOW = 'STORE_FLOW';
export const ADD_FLOW = 'ADD_FLOW';

export const storeFlow = (flow : any) => action(STORE_FLOW, {flow: flow});

export const storeFlowNode = (node : any) => action(STORE_FLOW_NODE, {node: node});

export const addFlowNode = (node : any) => action(ADD_FLOW, {node : node});