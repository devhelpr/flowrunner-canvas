import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { FlowToCanvas } from '../../../helpers/flow-to-canvas';
import { ShapeSettings } from '../../../helpers/shape-settings';
import { MultiForm } from './multi-form';
export const renderFlowNode = (node, rootLayout, isInEditMode = false) => {
    if (!!node.hideFromUI) {
        return _jsx(React.Fragment, {});
    }
    const onShowNodeSettings = () => {
    };
    let shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);
    const settings = ShapeSettings.getShapeSettings(node.taskType, node);
    if (shapeType === "Html" && !!settings.hasUI) {
        const nodeClone = { ...node };
        const isSelected = false;
        nodeClone.htmlPlugin = node.htmlPlugin || settings.htmlPlugin || "";
        let width = undefined;
        let height = undefined;
        if (rootLayout.context.getNodeInstance) {
            const instance = rootLayout.context.getNodeInstance(node, rootLayout.context.flowrunnerConnector, rootLayout.context.flow, settings);
            if (instance) {
                if (instance.getWidth && instance.getHeight) {
                    width = instance.getWidth(node);
                    height = instance.getHeight(node);
                }
            }
        }
        if (settings.uiComponent && settings.uiComponent == "MultiForm") {
            return _jsx(MultiForm, { node: nodeClone, settings: settings, renderHtmlNode: rootLayout.context.renderHtmlNode, getNodeInstance: rootLayout.context.getNodeInstance, flowrunnerConnector: rootLayout.context.flowrunnerConnector });
        }
        return _jsxs("div", { style: {
                width: (width || node.width || 250) + "px",
                minHeight: (height || node.height || 250) + "px",
                height: "auto",
                opacity: 1,
                position: "relative"
            }, id: node.name, "data-task": node.taskType, "data-node": node.name, "data-html-plugin": nodeClone.htmlPlugin, "data-node-type": node.taskType, "data-visualizer": nodeClone.visualizer || "", "data-x": node.x, "data-y": node.y, className: "canvas__html-shape untouched", children: [!!isInEditMode && settings && !!settings.hasConfigMenu &&
                    _jsx("div", { className: "", children: false && _jsx("a", { href: "#", onClick: onShowNodeSettings.bind(node, settings), className: "canvas__html-shape-bar-icon fas fa-cog" }) }), _jsx("div", { className: "canvas__html-shape-body", children: rootLayout.context.renderHtmlNode && rootLayout.context.renderHtmlNode(nodeClone, rootLayout.context.flowrunnerConnector, rootLayout.context.flow, settings) })] });
    }
};
export const renderLayoutType = (layoutBlock, isInForm, form, setLayoutVisibleState, rootLayout) => {
    if (layoutBlock.type === "layout2columns") {
        if (!layoutBlock.layout && layoutBlock.layout.length !== 2) {
            return _jsx(_Fragment, {});
        }
        return _jsx("div", { className: "layout-container__layout2columns", children: _jsxs("div", { className: "row", children: [_jsx("div", { className: "col-12 col-md-6", children: _jsx("div", { className: "ui-view-layout__container-row layout-container__layout2columns-col-1", children: layoutBlock.layout[0].map((layout, index) => {
                                return _jsx(React.Fragment, { children: _jsx("div", { className: "ui-view-layout__container d-flex flex-row justify-content-center", children: renderLayoutType(layout, isInForm, form, setLayoutVisibleState, rootLayout) }) }, "layout-" + index);
                            }) }) }), _jsx("div", { className: "col-12 col-md-6 ", children: _jsx("div", { className: "ui-view-layout__container-row layout-container__layout2columns-col-2", children: layoutBlock.layout[1].map((layout, index) => {
                                return _jsx(React.Fragment, { children: _jsx("div", { className: "ui-view-layout__container d-flex flex-row justify-content-center", children: renderLayoutType(layout, isInForm, form, setLayoutVisibleState, rootLayout) }) }, "layout-" + index);
                            }) }) })] }) });
    }
    else if (layoutBlock.type === "layout") {
        if (!layoutBlock.layout) {
            return _jsx(_Fragment, {});
        }
        return _jsx(_Fragment, { children: _jsx("div", { className: "row", children: _jsx("div", { className: "col-12 ui-view-layout__container-row", children: layoutBlock.layout.map((layout, index) => {
                        return _jsx(React.Fragment, { children: _jsx("div", { className: "ui-view-layout__container d-flex flex-row justify-content-center", children: renderLayoutType(layout, isInForm, form, setLayoutVisibleState, rootLayout) }) }, "layout-" + index);
                    }) }) }) });
    }
    else if (layoutBlock.type === "element") {
        return _jsx("div", { children: layoutBlock.title || "" });
    }
    else if (layoutBlock.type === "flowNode") {
        const node = rootLayout.context.flowHash[layoutBlock.subtitle];
        if (node) {
            return renderFlowNode(node, rootLayout, false);
        }
        return null;
    }
    return _jsx(_Fragment, {});
};
//# sourceMappingURL=layout-renderer.js.map