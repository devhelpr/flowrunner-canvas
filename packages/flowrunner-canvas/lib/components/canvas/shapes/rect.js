import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { useEffect, useImperativeHandle, useRef, useMemo } from 'react';
import useImage from 'use-image';
import { Group, Text, Rect as KonvaRect, Image as KonvaImage, Line as KonvaLine } from 'react-konva';
import { ModifyShapeEnum, ShapeStateEnum } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';
const getStrokeColor = (backgroundColorString, settings) => {
    switch (backgroundColorString) {
        case "background-yellow": {
            return "#f0e938";
        }
        case "background-orange": {
            return "#f8a523";
        }
        case "background-blue": {
            return "#36a4f9";
        }
        case "background-green": {
            return "#3bee76";
        }
        case "background-purple": {
            return "#cc8aee";
        }
        default: {
            return settings.strokeColor;
        }
    }
};
const getFillColor = (backgroundColorString, settings) => {
    switch (backgroundColorString) {
        case "background-yellow": {
            return "#fbf791";
        }
        case "background-orange": {
            return "#f4c67d";
        }
        case "background-blue": {
            return "#86c6f8";
        }
        case "background-green": {
            return "#7df4a4";
        }
        case "background-purple": {
            return "#e2bcf5";
        }
        default: {
            return settings.fillColor;
        }
    }
};
export const Rect = React.forwardRef((props, ref) => {
    const settings = useMemo(() => ShapeSettings.getShapeSettings(props.taskType, props.node), [props.taskType, props.node]);
    const [image] = useImage("/svg/layout.svg");
    const [cogImage] = useImage("/svg/cog.svg");
    const groupRef = useRef(null);
    let rect = useRef(null);
    let textRef = undefined;
    let skewX = 0;
    let skewXOffset = 0;
    let includeSvgIcon = false;
    if (settings.isSkewed) {
        skewX = -0.5;
        skewXOffset = (ShapeMeasures.rectWidht / 8);
    }
    if (props.node && props.node.objectSchema) {
        if (props.node.objectSchema == "layout") {
            includeSvgIcon = true;
        }
    }
    useEffect(() => {
        if (rect && rect.current) {
            rect.current.skew({
                x: skewX,
                y: 0
            });
        }
        if (textRef) {
            textRef.cache();
        }
    });
    const setRef = (ref) => {
        rect.current = ref;
        if (rect.current) {
            rect.current.skew({
                x: skewX,
                y: 0
            });
        }
    };
    const setTextRef = (ref) => {
        textRef = ref;
    };
    useImperativeHandle(ref, () => ({
        getGroupRef: () => {
            return groupRef.current;
        },
        modifyShape: (action, parameters) => {
            switch (+action) {
                case ModifyShapeEnum.GetShapeType: {
                    return "rect";
                    break;
                }
                case ModifyShapeEnum.GetXY: {
                    if (groupRef && groupRef.current) {
                        return {
                            x: groupRef.current.x(),
                            y: groupRef.current.y(),
                        };
                    }
                    break;
                }
                case ModifyShapeEnum.SetXY: {
                    if (groupRef && groupRef.current && parameters) {
                        groupRef.current.x(parameters.x);
                        groupRef.current.y(parameters.y);
                    }
                    break;
                }
                case ModifyShapeEnum.SetOpacity: {
                    if (groupRef && groupRef.current && parameters) {
                        groupRef.current.opacity(parameters.opacity);
                    }
                    break;
                }
                case ModifyShapeEnum.SetPoints: {
                    break;
                }
                case ModifyShapeEnum.SetState: {
                    if (rect && rect.current && parameters) {
                        if (parameters.state == ShapeStateEnum.Selected) {
                            rect.current.to({
                                duration: 0.15,
                                stroke: settings.strokeColor,
                                fill: settings.fillSelectedColor
                            });
                        }
                        else if (parameters.state == ShapeStateEnum.Default) {
                            let strokeColor = settings.strokeColor;
                            let fillColor = settings.fillColor;
                            if (settings.background) {
                                strokeColor = getStrokeColor(settings.background, settings);
                                fillColor = getFillColor(settings.background, settings);
                            }
                            rect.current.to({
                                duration: 0.15,
                                stroke: strokeColor,
                                fill: fillColor
                            });
                        }
                    }
                    break;
                }
                default:
                    break;
            }
        }
    }));
    let strokeColor = settings.strokeColor;
    let fillColor = props.isSelected ? settings.fillSelectedColor : settings.fillColor;
    if (!props.isSelected && settings.background) {
        strokeColor = getStrokeColor(settings.background, settings);
        fillColor = getFillColor(settings.background, settings);
    }
    return _jsx(_Fragment, { children: _jsxs(Group, { ref: groupRef, x: props.x, y: props.y, transformsEnabled: settings.isSkewed ? "all" : "position", draggable: false, order: 0, onTouchStart: props.onTouchStart, onTouchMove: props.onTouchMove, onTouchEnd: props.onTouchEnd, onDragStart: props.onDragStart, onDragMove: props.onDragMove, onDragEnd: props.onDragEnd, onMouseOver: props.onMouseOver, onMouseOut: props.onMouseOut, onMouseDown: props.onMouseStart, onMouseMove: props.onMouseMove, onMouseUp: props.onMouseEnd, onMouseLeave: props.onMouseLeave, onClick: props.onClickShape, listening: true, opacity: props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 1 : 1, children: [_jsx(KonvaRect, { ref: ref => (setRef(ref)), x: skewXOffset, y: 0, stroke: strokeColor, hitStrokeWidth: 0, strokeWidth: 4, listening: true, cornerRadius: settings.cornerRadius, transformsEnabled: settings.isSkewed ? "all" : "position", width: ShapeMeasures.rectWidht, height: ShapeMeasures.rectHeight, fill: fillColor, perfectDrawEnabled: false }), settings.subShapeType && settings.subShapeType == "Model" && _jsx(KonvaLine, { points: [skewXOffset, 10, (skewXOffset + ShapeMeasures.rectWidht), 10], stroke: settings.strokeColor, transformsEnabled: "position", listening: false, perfectDrawEnabled: false, strokeWidth: 4 }), includeSvgIcon && _jsx(KonvaImage, { image: image, pathColor: settings.textColor, width: Math.round(ShapeMeasures.rectWidht / 4), height: Math.round(ShapeMeasures.rectWidht / 4), keepRatio: true, listening: false, perfectDrawEnabled: false, transformsEnabled: "position", x: Math.round((ShapeMeasures.rectWidht / 2) - (ShapeMeasures.rectWidht / 8)), y: 8 }), _jsx(Text, { ref: ref => (setTextRef(ref)), x: 0, y: includeSvgIcon ? Math.round(ShapeMeasures.rectWidht / 8) : 0, text: !!props.hasTaskNameAsNodeTitle ? props.node.taskType : props.node && props.node.label ? props.node.label : props.name, align: 'center', fontSize: 18, transformsEnabled: "position", width: ShapeMeasures.rectWidht, height: ShapeMeasures.rectHeight, verticalAlign: "middle", listening: false, wrap: "none", ellipsis: true, fill: settings.textColor, perfectDrawEnabled: false }), !!settings.hasConfigMenu && _jsx(KonvaImage, { image: cogImage, pathColor: settings.textColor, transformsEnabled: "position", listening: true, perfectDrawEnabled: false, width: Math.round(ShapeMeasures.rectWidht / 8), height: Math.round(ShapeMeasures.rectWidht / 8), keepRatio: true, x: Math.round(ShapeMeasures.rectWidht - (ShapeMeasures.rectWidht / 8) - 4), y: 4, onClick: props.onClickSetup })] }) });
});
//# sourceMappingURL=rect.js.map