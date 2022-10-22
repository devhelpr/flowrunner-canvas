import {
  getNewConnection,
  getNewNode,
  getTaskConfigForTask,
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

        let presetValues = {};
        const shapeSetting = getTaskConfigForTask(taskName);
        if (shapeSetting && shapeSetting.presetValues) {
          presetValues = shapeSetting.presetValues;
        }

        let newNode = getNewNode(
          {
            name: taskName,
            id: taskName,
            taskType: taskName,
            shapeType:
              taskName == 'IfConditionTask' ? 'Diamond' : shapeSetting.shapeType ? shapeSetting.shapeType : 'Rect',
            x: (nodeStart.x + nodeEnd.x) / 2,
            y: (nodeStart.y + nodeEnd.y) / 2,
            ...presetValues,
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
        if (taskName === 'IfConditionTask') {
          (connection as any).thumbPosition = 1;
          (connection as any).followflow = 'onsuccess';
        }

        flowStore.addConnection(connection);

        let modifiedNode = { ...selectedNode };
        modifiedNode.endshapeid = newNode.name;

        flowStore.storeFlowNode(modifiedNode, modifiedNode.name, positionContext);
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
        let presetValues = {};
        const shapeSetting = getTaskConfigForTask(taskName);
        if (shapeSetting && shapeSetting.presetValues) {
          presetValues = shapeSetting.presetValues;
        }

        let newNode = getNewNode(
          {
            name: taskName,
            id: taskName,
            taskType: taskName,
            shapeType:
              taskName == 'IfConditionTask' ? 'Diamond' : shapeSetting.shapeType ? shapeSetting.shapeType : 'Rect',
            x: selectedNode.x + 500,
            y: selectedNode.y,
            ...presetValues,
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
