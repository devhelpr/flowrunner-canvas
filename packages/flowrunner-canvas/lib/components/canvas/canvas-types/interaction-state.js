export var InteractionState;
(function (InteractionState) {
    InteractionState[InteractionState["idle"] = 0] = "idle";
    InteractionState[InteractionState["draggingNode"] = 1] = "draggingNode";
    InteractionState[InteractionState["draggingConnectionStart"] = 2] = "draggingConnectionStart";
    InteractionState[InteractionState["draggingConnectionEnd"] = 3] = "draggingConnectionEnd";
    InteractionState[InteractionState["addingNewNode"] = 4] = "addingNewNode";
    InteractionState[InteractionState["addingNewConnection"] = 5] = "addingNewConnection";
    InteractionState[InteractionState["draggingNodesByConnection"] = 6] = "draggingNodesByConnection";
    InteractionState[InteractionState["draggingNodesDownstream"] = 7] = "draggingNodesDownstream";
    InteractionState[InteractionState["draggingNodesUpstream"] = 8] = "draggingNodesUpstream";
    InteractionState[InteractionState["selectingNodes"] = 9] = "selectingNodes";
    InteractionState[InteractionState["multiSelect"] = 10] = "multiSelect";
    InteractionState[InteractionState["draggingSection"] = 11] = "draggingSection";
})(InteractionState || (InteractionState = {}));
//# sourceMappingURL=interaction-state.js.map