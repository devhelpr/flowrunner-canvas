import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useCanvasModeStateStore } from '../../state/canvas-mode-state';
import { useSelectedNodeStore } from '../../state/selected-node-state';
export const DebugInfo = (props) => {
    const htmlElement = useRef(null);
    const timer = useRef(null);
    const [payload, setPayload] = useState(undefined);
    const [fullscreen, setFullscreen] = useState(false);
    const flowType = useCanvasModeStateStore(state => state.flowType);
    const selectedNode = useSelectedNodeStore();
    useEffect(() => {
        props.flowrunnerConnector.registerFlowExecutionObserver("ContainedDebugInfo", (executionEvent) => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
            timer.current = setTimeout(() => {
                if (executionEvent) {
                    setPayload(executionEvent.payload);
                }
            }, 50);
        });
        return () => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
            props.flowrunnerConnector.unregisterFlowExecuteObserver("ContainedDebugInfo");
        };
    }, []);
    const onToggleFullscreen = () => {
        setFullscreen(!fullscreen);
    };
    if (flowType !== "playground") {
        return _jsx(_Fragment, {});
    }
    let fullscreenCss = "";
    let iconCss = "debug-info__window-maximize far fa-window-maximize";
    if (fullscreen) {
        fullscreenCss = " debug-info--fullscreen";
        iconCss = "debug-info__window-maximize far fa-window-minimize";
    }
    if (selectedNode && selectedNode.node && selectedNode.node.name) {
        if (selectedNode.node.payload) {
            const debugInfo = JSON.stringify(selectedNode.node.payload, null, 2);
            return _jsx("div", { className: "debug-info" + fullscreenCss, children: _jsxs("div", { className: "debug-info__debug-info", children: [_jsx("a", { href: "#", onClick: onToggleFullscreen, className: iconCss }), _jsxs("div", { className: "debug-info__debug-info-content", children: [_jsx("strong", { children: selectedNode.node.name }), _jsx("br", {}), debugInfo] })] }) });
        }
        else {
            let list = props.flowrunnerConnector.getNodeExecutionsByNodeName(selectedNode.node.name);
            if (list && list.length > 0) {
                const debugInfo = JSON.stringify(list[list.length - 1], null, 2);
                return _jsx("div", { className: "debug-info" + fullscreenCss, children: _jsxs("div", { className: "debug-info__debug-info", children: [_jsx("a", { href: "#", onClick: onToggleFullscreen, className: iconCss }), _jsxs("div", { className: "debug-info__debug-info-content", children: [_jsx("strong", { children: selectedNode.node.name }), _jsx("br", {}), debugInfo] })] }) });
            }
        }
    }
    return null;
};
//# sourceMappingURL=index.js.map