export const connectFlowNode = (orgNodeName: string, connectionNode: any, flow: any[]) => {
  const resultFlow = flow.map((currentNode) => {
    if (currentNode.name === connectionNode.name) {
      const reconnectedNode = { ...currentNode };
      if (connectionNode.startshapeid === orgNodeName) {
        reconnectedNode.startshapeid = orgNodeName;
      }
      if (connectionNode.endshapeid === orgNodeName) {
        reconnectedNode.endshapeid = orgNodeName;
      }
      return reconnectedNode;
    }
    return currentNode;
  });
  return resultFlow;
};
