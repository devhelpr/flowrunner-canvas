import { IUndoConnectionMode, IUndoNode } from '../../interfaces/IUndoNode';

export const deleteFlowNode = (orgNodeName: string, node: any, deleteLines: boolean, flow: any[]) => {
  let undoNode: IUndoNode | undefined = undefined;

  let resultFlow = flow.filter((flowNode) => {
    if (flowNode.name === node.name) {
      undoNode = {
        node: { ...flowNode },
        undoType: 'add',
        connectionMode:
          undoNode?.connectionMode ||
          (!!deleteLines ? IUndoConnectionMode.addConnection : IUndoConnectionMode.reconnect),
        connections: [...(undoNode?.connections || [])],
      };
      return false;
    }
    if (flowNode.startshapeid === node.name || flowNode.endshapeid === node.name) {
      if (!undoNode) {
        undoNode = {
          undoType: 'add',
          node: {},
          connections: [{ ...flowNode }],
        };
      } else {
        undoNode.connections = [...(undoNode?.connections || []), { ...flowNode }];
      }
      undoNode.connectionMode = IUndoConnectionMode.reconnect;
      if (!!deleteLines) {
        undoNode.connectionMode = IUndoConnectionMode.addConnection;
        return false;
      }
      return true;
    }
    return true;
  });
  resultFlow = resultFlow.map((flowNode) => {
    if (flowNode.startshapeid === node.name) {
      let updatedNode = { ...flowNode };
      updatedNode.startshapeid = undefined;

      if (flowNode.endshapeid === node.name) {
        updatedNode.endshapeid = undefined;
      }
      return updatedNode;
    } else if (flowNode.endshapeid === node.name) {
      let updatedNode = { ...flowNode };
      updatedNode.endshapeid = undefined;
      return updatedNode;
    }
    return flowNode;
  });

  return {
    undoNode: undoNode,
    flow: resultFlow,
  };
};
