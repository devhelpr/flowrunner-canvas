import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { Suspense } from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Children, isValidElement, cloneElement } from 'react';
import { Number } from './visualizers/number';
import { Color } from './visualizers/color';
import { Text } from './visualizers/text';
import { List } from './visualizers/list';
import { useSelectedNodeStore } from '../../state/selected-node-state';
import { createExpressionTree, executeExpressionTree } from '@devhelpr/expressionrunner';
const XYCanvas = React.lazy(() => import('./visualizers/xy-canvas').then(({ XYCanvas }) => ({ default: XYCanvas })));
const AnimatedGridCanvas = React.lazy(() => import('./visualizers/animated-grid-canvas').then(({ AnimatedGridCanvas }) => ({ default: AnimatedGridCanvas })));
const GridCanvas = React.lazy(() => import('./visualizers/grid-canvas').then(({ GridCanvas }) => ({ default: GridCanvas })));
const RichText = React.lazy(() => import('./visualizers/richtext').then(({ RichText }) => ({ default: RichText })));
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;
export const DebugNodeHtmlPlugin = (props) => {
    const [receivedPayload, setReceivedPayload] = useState([]);
    const [expressionTree, setExpressionTree] = useState(undefined);
    const selectedNode = useSelectedNodeStore();
    const observableId = useRef(uuidV4());
    const unmounted = useRef(false);
    const timer = useRef(undefined);
    const lastTime = useRef(undefined);
    const receivedPayloads = useRef([]);
    useEffect(() => {
        unmounted.current = false;
        props.flowrunnerConnector.registerFlowNodeObserver(props.node.name, observableId.current, receivePayloadFromNode);
        if (props.node.visibilityCondition &&
            props.node.visibilityCondition !== "") {
            setExpressionTree(createExpressionTree(props.node.visibilityCondition));
        }
        return () => {
            props.flowrunnerConnector.unregisterFlowNodeObserver(props.node.name, observableId.current);
            unmounted.current = true;
            if (timer.current) {
                clearTimeout(timer.current);
                timer.current = undefined;
            }
        };
    }, []);
    useEffect(() => {
        if (props.node.visibilityCondition &&
            props.node.visibilityCondition &&
            props.node.visibilityCondition !== "") {
            setExpressionTree(createExpressionTree(props.node.visibilityCondition));
        }
        props.flowrunnerConnector.registerFlowNodeObserver(props.node.name, observableId.current, receivePayloadFromNode);
        return () => {
            props.flowrunnerConnector.unregisterFlowNodeObserver(props.node.name, observableId.current);
        };
    }, [props.node]);
    useEffect(() => {
        props.flowrunnerConnector.registerFlowNodeObserver(props.node.name, observableId.current, receivePayloadFromNode);
        return () => {
            props.flowrunnerConnector.unregisterFlowNodeObserver(props.node.name, observableId.current);
        };
    }, [props.flow]);
    const getWidth = () => {
        return;
    };
    const getHeight = () => {
        return;
    };
    const receivePayloadFromNode = useCallback((payload) => {
        if (unmounted.current) {
            return;
        }
        if (!!payload.isDebugCommand) {
            if (payload.debugCommand === "resetPayloads") {
                if (receivedPayloads.current.length > 0) {
                    receivedPayloads.current = [];
                    setReceivedPayload([]);
                }
            }
            return;
        }
        let newReceivedPayloads = [...receivedPayloads.current];
        newReceivedPayloads.push({ ...payload });
        if (newReceivedPayloads.length > 1) {
            newReceivedPayloads = newReceivedPayloads.slice(Math.max(newReceivedPayloads.length - (props.node.maxPayloads || 1), 0));
        }
        receivedPayloads.current = newReceivedPayloads;
        if (!lastTime.current || performance.now() > lastTime.current + 30) {
            lastTime.current = performance.now();
            if (timer.current) {
                clearTimeout(timer.current);
                timer.current = undefined;
            }
            setReceivedPayload(newReceivedPayloads);
        }
        else {
            if (timer.current) {
                clearTimeout(timer.current);
                timer.current = undefined;
            }
            timer.current = setTimeout(() => {
                timer.current = undefined;
                setReceivedPayload(receivedPayloads.current);
            }, 30);
        }
        return;
    }, [props.flow, props.node]);
    let visualizer = _jsx(_Fragment, {});
    let additionalCssClass = "";
    let visible = true;
    if (props.node.visibilityCondition && expressionTree) {
        let payload = receivedPayload.length > 0 ? receivedPayload[receivedPayload.length - 1] : {};
        const result = executeExpressionTree(expressionTree, payload);
        console.log("executeExpressionTree", result, result == 1, !(result == 1) && expressionTree &&
            props.flowrunnerConnector.flowView != "uiview", payload);
        visible = result == 1;
    }
    if (props.flowrunnerConnector.flowView == "uiview" && expressionTree) {
        if (!visible) {
            return _jsx(_Fragment, {});
        }
    }
    if (receivedPayload.length == 0) {
        additionalCssClass = "html-plugin-node__h-100";
        visualizer = _jsx("div", { style: {
                backgroundColor: "#ffffff"
            } });
    }
    if (props.node.visualizer == "children") {
        const childrenWithProps = Children.map(props.children, child => {
            if (isValidElement(child)) {
                return cloneElement(child, {
                    nodeName: props.node.name,
                    node: props.node,
                    payload: receivedPayload.length > 0 ? receivedPayload[receivedPayload.length - 1] : {}
                });
            }
            return child;
        });
        return _jsx(_Fragment, { children: childrenWithProps });
    }
    else if (props.node.visualizer == "number") {
        visualizer = _jsx(Number, { node: props.node, payloads: receivedPayload });
    }
    else if (props.node.visualizer == "text") {
        visualizer = _jsx(Text, { node: props.node, payloads: receivedPayload });
    }
    else if (props.node.visualizer == "list") {
        visualizer = _jsx(List, { node: props.node, payloads: receivedPayload });
    }
    else if (props.node.visualizer == "color") {
        additionalCssClass = "html-plugin-node__h-100";
        visualizer = _jsx(Color, { node: props.node, payloads: receivedPayload });
    }
    else if (props.node.visualizer == "richtext") {
        additionalCssClass = "html-plugin-node__h-100";
        visualizer = _jsx(Suspense, { fallback: _jsx("div", { children: "Loading..." }), children: _jsx(RichText, { node: props.node, payloads: receivedPayload }) });
    }
    else if (props.node.visualizer == "gridcanvas") {
        additionalCssClass = "html-plugin-node__h-100";
        visualizer = _jsx(Suspense, { fallback: _jsx("div", { children: "Loading..." }), children: _jsx(GridCanvas, { node: props.node, payloads: receivedPayload }) });
    }
    else if (props.node.visualizer == "animatedgridcanvas") {
        additionalCssClass = "html-plugin-node__h-100";
        visualizer = _jsx(Suspense, { fallback: _jsx("div", { children: "Loading..." }), children: _jsx(AnimatedGridCanvas, { node: props.node, payloads: receivedPayload }) });
    }
    else if (props.node.visualizer == "xycanvas") {
        additionalCssClass = "html-plugin-node__h-100";
        visualizer = _jsx(Suspense, { fallback: _jsx("div", { children: "Loading..." }), children: _jsx(XYCanvas, { flowrunnerConnector: props.flowrunnerConnector, selectedNode: selectedNode, node: props.node, payloads: receivedPayload }) });
    }
    else {
        const payload = receivedPayload[receivedPayload.length - 1];
        if (payload && payload.debugId) {
            delete payload.debugId;
        }
        visualizer = _jsx("div", { className: "w-100 h-auto", children: payload ? JSON.stringify(payload, null, 2) : "" });
    }
    return _jsxs(_Fragment, { children: [!visible && expressionTree &&
                props.flowrunnerConnector.flowView != "uiview" && _jsx("div", { className: "html-plugin-node__visibility fas fa-eye-slash" }), _jsx("div", { className: "html-plugin-node html-plugin-node--wrap html-plugin-node--" + props.node.visualizer + additionalCssClass, style: {
                    backgroundColor: "white"
                }, children: visualizer })] });
};
//# sourceMappingURL=debug-node.js.map