import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { LayoutWithDropArea } from './components/layout-with-droparea';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { ShapeSettings } from '../../helpers/shape-settings';
import { renderFlowNode } from '../userinterface-view/components/layout-renderer';
import { Flow } from '../flow';
import { useFlowStore } from '../../state/flow-state';
import { useLayoutStore } from '../../state/layout-state';
import { useCanvasModeStateStore } from '../../state/canvas-mode-state';
export const UserInterfaceViewEditor = (props) => {
    const [tree, setTree] = useState({});
    const [renderIndex, setRenderIndex] = useState(1);
    const [flowHash, setFlowHash] = useState({});
    const [nodesOnLayout, setNodesOnLayout] = useState({});
    const flow = useFlowStore();
    const canvasMode = useCanvasModeStateStore();
    const layout = useLayoutStore();
    useEffect(() => {
        let newFlowHash = {};
        flow.flow.map((node) => {
            newFlowHash[node.name] = node;
            return true;
        });
        let initTree = JSON.parse(layout.layout) || {};
        setTree(initTree);
        setFlowHash(newFlowHash);
        setNodesOnLayout(getFlowNodeFromTree(initTree, 1, 0, 0));
    }, []);
    const getFlowNodeFromTree = (layoutTree, level, index, subIndex) => {
        let treeHashKey = level + "." + index + "." + subIndex;
        if (layoutTree[treeHashKey]) {
            let tree = layoutTree[treeHashKey];
            let flowNodes = {};
            tree.map((layoutBlock, treeIndex) => {
                if (layoutBlock.title == "flowNode") {
                    flowNodes[layoutBlock.subtitle] = true;
                }
                else if (layoutBlock.title == "layout2columns") {
                    flowNodes = { ...flowNodes, ...getFlowNodeFromTree(layoutTree, level + 1, treeIndex, 0) };
                    flowNodes = { ...flowNodes, ...getFlowNodeFromTree(layoutTree, level + 1, treeIndex, 1) };
                }
                else {
                    flowNodes = { ...flowNodes, ...getFlowNodeFromTree(layoutTree, level + 1, treeIndex, 0) };
                }
            });
            return flowNodes;
        }
        return {};
    };
    const onStoreLayout = (level, index, subIndex, layout) => {
        let updatedTree = { ...tree };
        let treeHashKey = level + "." + index + "." + subIndex;
        updatedTree[treeHashKey] = layout;
        setRenderIndex(renderIndex + 1);
        setTree(updatedTree);
        setNodesOnLayout(getFlowNodeFromTree(updatedTree, 1, 0, 0));
    };
    useEffect(() => {
        layout.storeLayout(JSON.stringify(tree));
    }, [tree]);
    const onGetLayout = (level, index, subIndex) => {
        let treeHashKey = level + "." + index + "." + subIndex;
        if (tree[treeHashKey]) {
            return tree[treeHashKey];
        }
        return false;
    };
    const onDragStart = (event) => {
        event.dataTransfer.setData("data-draggable", JSON.stringify({
            title: event.target.getAttribute("data-draggable"),
            subtitle: event.target.getAttribute("data-id") || ""
        }));
    };
    const clearLayout = (event) => {
        event.preventDefault();
        setTree({});
        setRenderIndex(renderIndex + 1);
        setNodesOnLayout({});
        return false;
    };
    return _jsxs(_Fragment, { children: [_jsxs("div", { className: "container-fluid", children: [_jsx("h1", { children: "UIVIEW EDITOR" }), _jsxs("div", { className: "row ui-editor__row", children: [_jsx("div", { className: "col-10 layout__dropzone", children: _jsx("div", { className: "layout__dropzone-inner", "data-renderindex": renderIndex, children: _jsx(LayoutWithDropArea, { onGetLayout: onGetLayout, onStoreLayout: onStoreLayout, layoutIndex: 0, name: "l", level: 1, tree: tree, getNodeInstance: props.getNodeInstance, flowrunnerConnector: props.flowrunnerConnector, flow: flow.flow, renderHtmlNode: props.renderHtmlNode, flowHash: flowHash }) }) }), _jsxs("div", { className: "col-2 layout__draggables", children: [_jsx("div", { children: _jsx("button", { type: "button", onClick: clearLayout, className: "btn btn-danger", children: "Clear layout" }) }), _jsx("div", { onDragStart: onDragStart, "data-draggable": "layout", draggable: true, className: "layout__draggable", children: "Layout" }), _jsx("div", { onDragStart: onDragStart, "data-draggable": "layout2columns", draggable: true, className: "layout__draggable", children: "Layout 2columns" }), _jsx("div", { onDragStart: onDragStart, "data-draggable": "element", draggable: true, className: "layout__draggable", children: "Element" }), flow.flow.filter((node, index) => {
                                        if (!!node.hideFromUI || nodesOnLayout[node.name]) {
                                            return false;
                                        }
                                        let shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);
                                        const settings = ShapeSettings.getShapeSettings(node.taskType, node);
                                        if (shapeType === "Html" && !!settings.hasUI) {
                                            return true;
                                        }
                                        return false;
                                    }).map((flowNode, index) => {
                                        return _jsxs("div", { onDragStart: onDragStart, "data-draggable": "flowNode", "data-id": flowNode.name, draggable: true, className: "layout__draggable", children: [_jsx("label", { children: flowNode.name }), renderFlowNode(flowNode, {
                                                    context: {
                                                        getNodeInstance: props.getNodeInstance,
                                                        flowrunnerConnector: props.flowrunnerConnector,
                                                        flow: flow.flow,
                                                        renderHtmlNode: props.renderHtmlNode
                                                    }
                                                }, false)] }, "flowNode-" + index);
                                    })] })] })] }), _jsx(Flow, { flow: flow.flow, flowrunnerConnector: props.flowrunnerConnector, flowId: flow.flowId })] });
};
//# sourceMappingURL=index.js.map