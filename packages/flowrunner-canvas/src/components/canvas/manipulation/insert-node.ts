import {
  getNewConnection,
  getNewNode,
  IConnectionNode,
  INode,
  TFlowMap,
  ThumbPositionRelativeToNode,
} from '@devhelpr/flowrunner-canvas-core';

export const insertNode = (
  selectedNode: IConnectionNode,
  flowStoreHashMap: TFlowMap,
  flowStoreFlow,
  flowStore,
  getNodeInstance,
  positionContext,
  taskName: string,
) => {
  if (selectedNode !== undefined) {
    if (selectedNode.shapeType === 'Line') {
      const startNodeId = selectedNode.startshapeid;
      const endNodeId = selectedNode.endshapeid;

      const mappedNodeStart: any = flowStoreHashMap && (flowStoreHashMap as any).get(startNodeId);
      const mappedNodeEnd: any = flowStoreHashMap && (flowStoreHashMap as any).get(endNodeId);

      if (mappedNodeStart && mappedNodeEnd && flowStoreFlow) {
        const nodeStart = flowStoreFlow[mappedNodeStart.index];
        const nodeEnd = flowStoreFlow[mappedNodeEnd.index];

        let newNode = getNewNode(
          {
            name: taskName,
            id: taskName,
            taskType: taskName,
            shapeType: 'Html',
            x: (nodeStart.x + nodeEnd.x) / 2,
            y: (nodeStart.y + nodeEnd.y) / 2,
          },
          flowStore.flow,
        );

        flowStore.addFlowNode(newNode);

        const connection = getNewConnection(
          newNode,
          nodeEnd,
          getNodeInstance,
          false,
          ThumbPositionRelativeToNode.default,
        );

        flowStore.addConnection(connection);

        selectedNode.endshapeid = newNode.name;
        flowStore.storeFlowNode(selectedNode, selectedNode.name, positionContext);
      }
    }
  }
};

export const addNodeToEnd = (
  selectedNode: INode,
  flowStoreHashMap: TFlowMap,
  flowStoreFlow,
  flowStore,
  getNodeInstance,
  positionContext,
  taskName: string,
) => {
  if (selectedNode !== undefined) {
    if (selectedNode.shapeType !== 'Line') {
      const mappedSelectedNode: any = flowStoreHashMap && (flowStoreHashMap as any).get(selectedNode.name);
      if (flowStoreFlow && mappedSelectedNode.start.length === 0) {
        let newNode = getNewNode(
          {
            name: taskName,
            id: taskName,
            taskType: taskName,
            shapeType: 'Html',
            x: selectedNode.x + 500,
            y: selectedNode.y,
          },
          flowStore.flow,
        );

        flowStore.addFlowNode(newNode);

        const connection = getNewConnection(
          selectedNode,
          newNode,
          getNodeInstance,
          false,
          ThumbPositionRelativeToNode.default,
        );

        flowStore.addConnection(connection);
      }
    }
  }
};
