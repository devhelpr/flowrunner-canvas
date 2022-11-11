import { IPosition } from '../../contexts/position-context';
import { IUndoNode } from '../../interfaces/IUndoNode';

export const addFlowNode = (orgNodeName: string, node: any, flow: any[]) => {
  const undoNode: IUndoNode = {
    undoType: 'delete',
    node: {
      name: node.name,
    },
    connections: [],
  };
  return {
    flow: [...flow, node],
    undoNode: undoNode,
  };
};
