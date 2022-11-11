import { IPosition } from '../../contexts/position-context';

export const storeFlowNode = (orgNodeName: string, node: any, position: IPosition | undefined, flow: any[]) => {
  let undoNode: any = undefined;
  let resultFlow = flow.map((currentNode, index) => {
    if (currentNode.name === orgNodeName) {
      undoNode = {
        undoType: 'modify',
        node: { ...currentNode },
      };

      const newNode = Object.assign(
        {},
        node,
        {
          name: node.name,
          id: node.name,
        },
        position,
      );

      return newNode;
    } else if (currentNode.startshapeid === orgNodeName && node.shapeType !== 'Line') {
      const newNode = Object.assign(
        {},
        currentNode,
        {
          startshapeid: node.name,
        },
        position,
      );
      return newNode;
    } else if (currentNode.endshapeid === orgNodeName && node.shapeType !== 'Line') {
      const newNode = Object.assign(
        {},
        currentNode,
        {
          endshapeid: node.name,
        },
        position,
      );
      return newNode;
    }
    return currentNode;
  });
  return {
    flow: resultFlow,
    undoNode: undoNode,
  };
};
