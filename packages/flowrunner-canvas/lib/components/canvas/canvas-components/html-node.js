import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { useMemo } from 'react';
import { Shapes } from '../shapes';
import { FlowToCanvas } from '../../../helpers/flow-to-canvas';
import { ShapeSettings } from '../../../helpers/shape-settings';
import { ThumbFollowFlow, ThumbPositionRelativeToNode } from '../shapes/shape-types';
import { usePositionContext } from '../../contexts/position-context';
import { replaceValuesExpressions, hasReplacebleValuesExistingInPayload } from '../../../helpers/replace-values';
export const HtmlNode = React.forwardRef((props, ref) => {
    const positionContext = usePositionContext();
    let shapeType = useMemo(() => FlowToCanvas.getShapeType(props.node.shapeType, props.node.taskType, props.node.isStartEnd), [props.node]);
    const settings = useMemo(() => ShapeSettings.getShapeSettings(props.node.taskType, props.node), [props.node]);
    const flowStore = props.useFlowStore();
    const Shape = Shapes[shapeType];
    if (shapeType === "Html" && Shape) {
        const nodeClone = { ...props.node };
        const position = positionContext.getPosition(props.node.name) || props.node;
        let nodeState = (props.nodesStateLocal || "") === "error" ? " has-error" : "";
        const isSelected = false;
        nodeClone.htmlPlugin = props.node.htmlPlugin || settings.htmlPlugin || "";
        let hasClone = true;
        if (settings.hasClone !== undefined) {
            hasClone = settings.hasClone;
        }
        let hasThumbs = true;
        if (settings.hasThumbs !== undefined) {
            hasThumbs = settings.hasThumbs;
        }
        let width = undefined;
        let height = undefined;
        if (props.getNodeInstance) {
            const instance = props.getNodeInstance(props.node, props.flowrunnerConnector, flowStore.flow, settings);
            if (instance) {
                if (instance.getWidth && instance.getHeight) {
                    width = instance.getWidth(props.node);
                    height = instance.getHeight(props.node);
                }
            }
        }
        let htmlPlugin = props.node.htmlPlugin;
        if (!htmlPlugin || htmlPlugin == "") {
            htmlPlugin = settings.htmlPlugin;
        }
        let additionalStyles = {};
        if (htmlPlugin === "shapeNode") {
            additionalStyles.height = (height || props.node.height || 250) + "px";
        }
        if (settings.styleNode) {
            additionalStyles = { ...additionalStyles, ...settings.styleNode };
        }
        let selected = "";
        if (isSelected) {
            selected = "canvas__html-shape--selected ";
        }
        let labelText = props.node && props.node.label ? props.node.label : props.node.name;
        if (settings.label && hasReplacebleValuesExistingInPayload(settings.label, props.node)) {
            labelText = replaceValuesExpressions(settings.label, props.node, "-");
        }
        else if (!!props.hasTaskNameAsNodeTitle) {
            labelText = props.node.label || props.node.taskType;
        }
        const divDataAttributes = {};
        if (settings.htmlDataAttributes) {
            settings.htmlDataAttributes.forEach((htmlDataAttribute) => {
                const value = htmlDataAttribute.value;
                if (value && htmlDataAttribute.attributeName) {
                    const attributeValue = replaceValuesExpressions(value, props.node, "-");
                    divDataAttributes[`data-${htmlDataAttribute.attributeName.toLowerCase()}`] = attributeValue;
                }
            });
        }
        return _jsxs("div", { style: { transform: "translate(" + (position.x) + "px," +
                    ((position.y)) + "px) " +
                    "scale(" + (1) + "," + (1) + ") ",
                width: (width || props.node.width || 250) + "px",
                minHeight: (height || props.node.height || 250) + "px",
                top: "0px",
                left: "0px",
                opacity: (!props.canvasHasSelectedNode) ? 1 : 1,
                ...additionalStyles,
            }, id: props.node.name, "data-node": props.node.name, "data-task": props.node.taskType, "data-html-plugin": nodeClone.htmlPlugin, "data-visualizer": props.node.visualizer || "default", "data-x": position.x, "data-y": position.y, "data-height": (height || props.node.height || 250), ...divDataAttributes, ref: ref, className: selected + "canvas__html-shape canvas__html-shape-" + props.node.name +
                nodeState +
                (settings.background ? ` ${settings.background} ` : "") +
                (FlowToCanvas.getHasOutputs(shapeType, settings) ? "" : " canvas__html-shape--no-outputs") + " " +
                (FlowToCanvas.getHasInputs(shapeType, settings) ? "" : " canvas__html-shape--no-inputs"), onMouseUp: (event) => props.onMouseEnd(props.node, event), children: [_jsxs("div", { className: "canvas__html-shape-bar " + (isSelected ? "canvas__html-shape-bar--selected" : ""), onMouseOver: (event) => props.onMouseOver(props.node, event), onMouseOut: props.onMouseOut, onTouchStart: (event) => props.onTouchStart(props.node, event), onTouchEnd: (event) => props.onMouseEnd(props.node, event), onTouchMove: (event) => props.onMouseMove(props.node, event), onMouseDown: (event) => props.onMouseStart(props.node, event), onMouseMove: (event) => props.onMouseMove(props.node, event), onMouseUp: (event) => props.onMouseEnd(props.node, event), onMouseLeave: (event) => props.onMouseLeave(props.node, event), onClick: (event) => props.onClickShape(props.node, event), children: [_jsxs("span", { className: "canvas__html-shape-bar-title", children: [settings.icon && _jsx("span", { className: "canvas__html-shape-title-icon fas " + settings.icon }), _jsx("span", { children: labelText })] }), hasClone && _jsx("a", { href: "#", onClick: (event) => props.onCloneNode(props.node, event), onFocus: props.onFocus, className: "canvas__html-shape-bar-icon far fa-clone" }), !!settings.hasConfigMenu && _jsx("a", { href: "#", onFocus: props.onFocus, onClick: (event) => props.onShowNodeSettings(props.node, settings, event), className: "canvas__html-shape-bar-icon fas fa-cog" }), (htmlPlugin === "formNode" ||
                            (htmlPlugin === "shapeNode" && settings.metaInfo && settings.metaInfo.length > 0)) &&
                            _jsx("a", { href: "#", onFocus: props.onFocus, onClick: (event) => props.onShowNodeEditor(props.node, settings, event), className: "canvas__html-shape-bar-icon fas fa-window-maximize" })] }), _jsx("div", { className: "canvas__html-shape-body", onMouseOver: (event) => props.onMouseOver(props.node, event), onMouseOut: props.onMouseOut, style: { ...(settings && settings.styleShapeBody) }, children: props.renderHtmlNode && props.renderHtmlNode(nodeClone, props.flowrunnerConnector, props.flowMemo, settings, props.formNodesubject, props.flowId, props.useFlowStore) }), hasThumbs && _jsx("div", { className: "canvas__html-shape-thumb-start canvas__html-shape-0", onMouseOver: (event) => props.onMouseConnectionStartOver(props.node, false, event), onMouseOut: (event) => props.onMouseConnectionStartOut(props.node, false, event), onMouseDown: (event) => props.onMouseConnectionStartStart(props.node, false, "", ThumbFollowFlow.default, ThumbPositionRelativeToNode.default, event), onMouseMove: (event) => props.onMouseConnectionStartMove(props.node, false, event), onMouseUp: (event) => props.onMouseConnectionStartEnd(props.node, false, ThumbPositionRelativeToNode.default, event) }), hasThumbs && _jsx("div", { className: "canvas__html-shape-thumb-startbottom", onMouseOver: (event) => props.onMouseConnectionStartOver(props.node, false, event), onMouseOut: (event) => props.onMouseConnectionStartOut(props.node, false, event), onMouseDown: (event) => props.onMouseConnectionStartStart(props.node, false, "", ThumbFollowFlow.default, ThumbPositionRelativeToNode.bottom, event), onMouseMove: (event) => props.onMouseConnectionStartMove(props.node, false, event), onMouseUp: (event) => props.onMouseConnectionStartEnd(props.node, false, ThumbPositionRelativeToNode.default, event) }), hasThumbs && _jsx("div", { className: "canvas__html-shape-thumb-endtop", onMouseOver: (event) => props.onMouseConnectionEndOver(props.node, false, event, ThumbPositionRelativeToNode.top), onMouseOut: (event) => props.onMouseConnectionEndOut(props.node, false, event), onMouseDown: (event) => props.onMouseConnectionEndStart(props.node, false, event), onMouseMove: (event) => props.onMouseConnectionEndMove(props.node, false, event), onMouseUp: (event) => props.onMouseConnectionEndEnd(props.node, false, event, ThumbPositionRelativeToNode.top), onMouseLeave: (event) => props.onMouseConnectionEndLeave(props.node, false, event), children: _jsx("span", { className: "canvas__html-shape-thumb-female-indicaator" }) }), hasThumbs && _jsx("div", { className: "canvas__html-shape-thumb-end canvas__html-shape-0", onMouseOver: (event) => props.onMouseConnectionEndOver(props.node, false, event), onMouseOut: (event) => props.onMouseConnectionEndOut(props.node, false, event), onMouseDown: (event) => props.onMouseConnectionEndStart(props.node, false, event), onMouseMove: (event) => props.onMouseConnectionEndMove(props.node, false, event), onMouseUp: (event) => props.onMouseConnectionEndEnd(props.node, false, event), onMouseLeave: (event) => props.onMouseConnectionEndLeave(props.node, false, event), children: _jsx("span", { className: "canvas__html-shape-thumb-female-indicaator" }) }), hasThumbs && settings.events && settings.events.map((event, eventIndex) => {
                    return _jsx("div", { className: "canvas__html-shape-event canvas__html-shape-" + (eventIndex + 1) }, "_" + props.node.name + (props.flowId || "") + "-" + eventIndex);
                })] });
    }
    return null;
});
//# sourceMappingURL=html-node.js.map