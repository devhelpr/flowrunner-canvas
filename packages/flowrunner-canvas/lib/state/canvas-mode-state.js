import create from 'zustand';
export var PopupEnum;
(function (PopupEnum) {
    PopupEnum[PopupEnum["none"] = 0] = "none";
    PopupEnum[PopupEnum["editNamePopup"] = 1] = "editNamePopup";
})(PopupEnum || (PopupEnum = {}));
let storeHandler = (set) => {
    return {
        isConnectingNodes: false,
        selectedTask: '',
        showDependencies: false,
        allowInputToHtmlNodes: false,
        isFlowrunnerPaused: false,
        isInMultiSelect: false,
        selectedNodes: [],
        flowType: '',
        editorMode: 'canvas',
        flowsPlayground: [],
        flowsWasm: [],
        currentPopup: PopupEnum.none,
        onPresetName: undefined,
        flowsUpdateId: '',
        snapToGrid: false,
        setConnectiongNodeCanvasMode: (isConnectingNodes) => set(state => ({
            isConnectingNodes: isConnectingNodes,
        })),
        setSelectedTask: (selectedTask) => set(state => ({
            selectedTask: selectedTask,
        })),
        setShowDependencies: (showDependencies) => set(state => ({
            showDependencies: showDependencies,
        })),
        setSnapToGrid: (snapToGrid) => set(state => ({
            snapToGrid: snapToGrid,
        })),
        setAllowInputToHtmlNodes: (allowInputToHtmlNodes) => set(state => ({
            allowInputToHtmlNodes: allowInputToHtmlNodes,
        })),
        setFlowrunnerPaused: (isFlowrunnerPaused) => set(state => ({
            isFlowrunnerPaused: isFlowrunnerPaused,
        })),
        setFlowType: (flowType) => set(state => ({
            flowType: flowType,
        })),
        setEditorMode: (editorMode) => set(state => ({
            editorMode: editorMode,
        })),
        setFlowsPlayground: (flowsPlayground) => set(state => ({
            flowsPlayground: flowsPlayground,
        })),
        setFlowsWasm: (flowsWasm) => set(state => ({
            flowsWasm: flowsWasm,
        })),
        setCurrentPopup: (popup, onPresetName) => set(state => ({
            currentPopup: popup,
            onPresetName: onPresetName,
        })),
        setFlowsUpdateId: (id) => set(state => ({
            flowsUpdateId: id,
        })),
        setIsInMultiSelect: (isInMultiSelect, nodes) => set(state => ({
            isInMultiSelect: isInMultiSelect,
            selectedNodes: [...nodes],
        })),
    };
};
export const useCanvasModeStateStore = create(set => storeHandler(set));
export const useCanvasModeStateForMultiFormStore = create(set => storeHandler(set));
export const useBundleCanvasModeStateStore = create(set => storeHandler(set));
//# sourceMappingURL=canvas-mode-state.js.map