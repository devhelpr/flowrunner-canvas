import { action } from 'typesafe-actions';

export const SELECT_NODE = 'SELECT_NODE';

export const selectNode = (nodeName: string, node: any) => action(SELECT_NODE, 
	{nodeName: nodeName, node: node});


