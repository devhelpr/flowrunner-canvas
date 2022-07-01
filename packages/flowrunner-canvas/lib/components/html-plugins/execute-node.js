import { jsx as _jsx } from "react/jsx-runtime";
import { useCanvasModeStateStore } from '../../state/canvas-mode-state';
export class ExecuteNodeHtmlPluginInfo {
    constructor() {
        this.getWidth = (node) => {
            return;
        };
    }
    getHeight(node) {
        return;
    }
}
export const ExecuteNodeHtmlPlugin = (props) => {
    const canvasMode = useCanvasModeStateStore();
    const click = (event) => {
        event.preventDefault();
        if (!!canvasMode.isFlowrunnerPaused) {
            return;
        }
        if (props.node) {
            props.flowrunnerConnector.executeFlowNode(props.node.name, {});
        }
        return false;
    };
    return _jsx("div", { className: "html-plugin-node", style: {
            backgroundColor: "white"
        }, children: _jsx("a", { href: "#", className: (!!canvasMode.isFlowrunnerPaused ? "disabled " : "") + "btn btn-primary", onClick: click, children: "Click to Execute" }) });
};
//# sourceMappingURL=execute-node.js.map