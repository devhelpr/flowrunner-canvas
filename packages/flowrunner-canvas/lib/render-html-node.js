import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { Suspense } from 'react';
import { CustomNodeHtmlPlugin, CustomNodeHtmlPluginInfo } from './components/html-plugins/custom-node';
import { ShapeNodeHtmlPlugin, ShapeNodeHtmlPluginInfo } from './components/html-plugins/shape-node';
import { ExecuteNodeHtmlPlugin, ExecuteNodeHtmlPluginInfo } from './components/html-plugins/execute-node';
import { DebugNodeHtmlPluginInfo, GridEditNodeHtmlPluginInfo } from './components/html-plugins/visualizers/info';
import { SliderNodeHtmlPlugin, SliderNodeHtmlPluginInfo } from './components/html-plugins/slider-node';
import { InputNodeHtmlPlugin, InputNodeHtmlPluginInfo } from './components/html-plugins/input-node';
import { FormNodeHtmlPlugin, FormNodeHtmlPluginInfo } from './components/html-plugins/form-node';
import { DataGridNodeHtmlPluginInfo, DataGridNodeHtmlPlugin } from './components/html-plugins/data-grid-node';
import { useFlowStore } from './state/flow-state';
const DebugNodeHtmlPlugin = React.lazy(() => import('./components/html-plugins/debug-node').then(({ DebugNodeHtmlPlugin }) => ({ default: DebugNodeHtmlPlugin })));
const GridEditNodeHtmlPlugin = React.lazy(() => import('./components/html-plugins/grid-edit').then(({ GridEditNodeHtmlPlugin }) => ({ default: GridEditNodeHtmlPlugin })));
let _pluginRegistry;
export const setPluginRegistry = (pluginRegistry) => {
    _pluginRegistry = pluginRegistry;
};
export const renderHtmlNode = (node, flowrunnerConnector, flow, taskSettings, formNodesubject, flowId, overideUseFlowStore) => {
    let htmlPlugin = node.htmlPlugin;
    if (!htmlPlugin || htmlPlugin == "") {
        htmlPlugin = taskSettings.htmlPlugin;
    }
    if (htmlPlugin == "svgTestNode") {
        return _jsx(_Fragment, { children: _jsxs("svg", { children: [_jsx("circle", { cx: "50%", cy: "50%", r: "30%", stroke: "black", strokeWidth: "3", fill: "red" }), _jsx("text", { x: "50%", y: "50%", fill: "black", textAnchor: "middle", dominantBaseline: "middle", children: "SVG!" })] }) });
    }
    else if (htmlPlugin == "customNode") {
        return _jsx(CustomNodeHtmlPlugin, { flowrunnerConnector: flowrunnerConnector, node: node, taskSettings: taskSettings }, (flowId ? "" : flowId) + node.name);
    }
    else if (htmlPlugin == "shapeNode") {
        return _jsx(ShapeNodeHtmlPlugin, { flowrunnerConnector: flowrunnerConnector, node: node, taskSettings: taskSettings }, (flowId ? "" : flowId) + node.name);
    }
    else if (htmlPlugin == "iframe") {
        return _jsx("iframe", { width: node.width || 250, height: node.height || 250, src: node.url });
    }
    else if (htmlPlugin == "executeNode") {
        return _jsx(ExecuteNodeHtmlPlugin, { flowrunnerConnector: flowrunnerConnector, node: node }, (flowId ? "" : flowId) + node.name);
    }
    else if (htmlPlugin == "sliderNode") {
        return _jsx(SliderNodeHtmlPlugin, { flowrunnerConnector: flowrunnerConnector, node: node, flow: flow }, (flowId ? "" : flowId) + node.name);
    }
    else if (htmlPlugin == "gridEditNode") {
        return _jsx(Suspense, { fallback: _jsx("div", { children: "Loading..." }), children: _jsx(GridEditNodeHtmlPlugin, { flowrunnerConnector: flowrunnerConnector, node: node, flow: flow }, (flowId ? "" : flowId) + node.name) });
    }
    else if (htmlPlugin == "inputNode") {
        return _jsx(InputNodeHtmlPlugin, { flowrunnerConnector: flowrunnerConnector, node: node }, (flowId ? "" : flowId) + node.name);
    }
    else if (htmlPlugin == "formNode") {
        return _jsx(FormNodeHtmlPlugin, { flowrunnerConnector: flowrunnerConnector, node: node, taskSettings: taskSettings, isInFlowEditor: true, formNodesubject: formNodesubject, useFlowStore: overideUseFlowStore || useFlowStore }, (flowId ? "" : flowId) + node.name);
    }
    else if (htmlPlugin == "dataGridNode") {
        return _jsx(DataGridNodeHtmlPlugin, { flowrunnerConnector: flowrunnerConnector, node: node }, (flowId ? "" : flowId) + node.name);
    }
    else if (htmlPlugin == "debugNode") {
        return _jsx(Suspense, { fallback: _jsx("div", { children: "Loading..." }), children: _jsx(DebugNodeHtmlPlugin, { flowrunnerConnector: flowrunnerConnector, node: node, flow: flow }, (flowId ? "" : flowId) + node.name) });
    }
    else if (_pluginRegistry[htmlPlugin]) {
        const Plugin = _pluginRegistry[node.htmlPlugin].VisualizationComponent;
        node.visualizer = "children";
        return _jsx(Suspense, { fallback: _jsx("div", { children: "Loading..." }), children: _jsx(DebugNodeHtmlPlugin, { flowrunnerConnector: flowrunnerConnector, node: node, flow: flow, children: _jsx(Plugin, {}) }, (flowId ? "" : flowId) + node.name) });
    }
    return _jsx("div", { style: {
            width: node.width || 250,
            height: node.height || 250,
            backgroundColor: "white"
        } });
};
export const getNodeInstance = (node, flowrunnerConnector, flow, taskSettings) => {
    if (!node) {
        return;
    }
    let htmlPlugin = node.htmlPlugin;
    if (!htmlPlugin || htmlPlugin == "") {
        if (taskSettings) {
            htmlPlugin = taskSettings.htmlPlugin;
        }
    }
    if (htmlPlugin == "customNode") {
        return new CustomNodeHtmlPluginInfo(taskSettings);
    }
    else if (htmlPlugin == "shapeNode") {
        return new ShapeNodeHtmlPluginInfo(taskSettings);
    }
    else if (htmlPlugin == "executeNode") {
        return new ExecuteNodeHtmlPluginInfo();
    }
    else if (htmlPlugin == "sliderNode") {
        return new SliderNodeHtmlPluginInfo();
    }
    else if (htmlPlugin == "gridEditNode") {
        return new GridEditNodeHtmlPluginInfo();
    }
    else if (htmlPlugin == "inputNode") {
        return new InputNodeHtmlPluginInfo();
    }
    else if (htmlPlugin == "formNode") {
        return new FormNodeHtmlPluginInfo(taskSettings);
    }
    else if (htmlPlugin == "debugNode") {
        return new DebugNodeHtmlPluginInfo();
    }
    else if (htmlPlugin == "dataGridNode") {
        return new DataGridNodeHtmlPluginInfo();
    }
    return;
};
//# sourceMappingURL=render-html-node.js.map