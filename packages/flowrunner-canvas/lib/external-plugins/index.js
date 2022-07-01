import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
class PluginTask {
    execute(node, services) {
        console.log("PluginTask execute", node);
        return Object.assign({}, node.payload, {
            value: (Math.random() * 100).toFixed(0)
        });
    }
}
class PluginVisualizer extends React.Component {
    render() {
        console.log("PluginVisualizer render", this.props.payload);
        return _jsx("div", { className: "html-plugin-node", style: {
                backgroundColor: "white"
            }, children: _jsx("div", { className: "w-100 h-auto text-center", children: _jsx("div", { style: {
                        fontSize: "24px",
                        marginBottom: "20px"
                    }, children: _jsxs("h1", { children: ["HELLO! ", this.props.payload && this.props.payload.value] }) }) }) });
    }
}
export const registerPlugins = (registerFlowRunnerCanvasPlugin) => {
    registerFlowRunnerCanvasPlugin("PluginTask", PluginVisualizer, PluginTask, "PluginVisualizer");
};
//# sourceMappingURL=index.js.map