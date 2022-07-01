import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useCanvasModeStateStore } from '../../state/canvas-mode-state';
export class ShapeNodeHtmlPluginInfo {
    constructor(taskSettings) {
        this.getWidth = (node) => {
            return (this._taskSettings && this._taskSettings.width) || node.width || 200;
        };
        this._taskSettings = taskSettings;
    }
    getHeight(node) {
        return (this._taskSettings && this._taskSettings.height) || node.height || 100;
    }
}
export const ShapeNodeHtmlPlugin = (props) => {
    const canvasMode = useCanvasModeStateStore();
    useEffect(() => {
        console.log("ShapeNodeHtmlPlugin", props);
    }, []);
    const { node } = props;
    let style = {};
    if (props.taskSettings && props.taskSettings.style) {
        style = props.taskSettings.style;
    }
    else if (props.node && props.node.style) {
        style = props.node.style;
    }
    let iconBgCssClasses = "";
    if (props.taskSettings && props.taskSettings.iconBgCssClasses) {
        iconBgCssClasses = props.taskSettings.iconBgCssClasses;
    }
    if (props.node && props.node.iconBg) {
        iconBgCssClasses += " " + props.node.iconBg;
    }
    else if (props.taskSettings && props.taskSettings.iconBg) {
        iconBgCssClasses += " " + props.taskSettings.iconBg;
    }
    return _jsxs("div", { className: "html-plugin-node", style: {
            backgroundColor: "transparent",
            ...style
        }, children: [iconBgCssClasses && _jsx("span", { className: `html-plugin-node__icon ${iconBgCssClasses}` }), node && node.hint && _jsx("span", { className: "html-plugin-node__hint", children: node.hint }), node && node.label && _jsx("span", { className: "html-plugin-node__label", children: node.label })] });
};
//# sourceMappingURL=shape-node.js.map