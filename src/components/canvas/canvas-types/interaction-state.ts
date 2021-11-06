export enum InteractionState {
  idle = 0,
  draggingNode,
  draggingConnectionStart,
  draggingConnectionEnd,
  addingNewNode,
  addingNewConnection,
  draggingNodesByConnection,
  draggingNodesDownstream,
  draggingNodesUpstream,
}
