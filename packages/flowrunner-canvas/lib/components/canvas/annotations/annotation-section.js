import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import { useImperativeHandle, useRef } from 'react';
import { Rect as KonvaRect } from 'react-konva';
import { ModifyShapeEnum, ShapeStateEnum } from '../shapes/shape-types';
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
export const AnnotationSection = React.forwardRef((props, ref) => {
    let rect = useRef(null);
    const setRef = (ref) => {
        rect.current = ref;
    };
    useImperativeHandle(ref, () => ({
        getGroupRef: () => {
            return rect.current;
        },
        modifyShape: (action, parameters) => {
            switch (+action) {
                case ModifyShapeEnum.GetShapeType: {
                    return "section";
                    break;
                }
                case ModifyShapeEnum.GetXY: {
                    if (rect && rect.current) {
                        return {
                            x: rect.current.x(),
                            y: rect.current.y(),
                        };
                    }
                    break;
                }
                case ModifyShapeEnum.SetXY: {
                    if (rect && rect.current && parameters) {
                        rect.current.x(parameters.x);
                        rect.current.y(parameters.y);
                    }
                    break;
                }
                case ModifyShapeEnum.SetOpacity: {
                    if (rect && rect.current && parameters) {
                        rect.current.opacity(parameters.opacity);
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
                                stroke: "#808080",
                                dash: [8, 4]
                            });
                        }
                        else if (parameters.state == ShapeStateEnum.Default) {
                            let strokeColor = "#000000";
                            rect.current.to({
                                duration: 0.15,
                                stroke: strokeColor,
                                dash: [0, 0]
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
    let strokeColor = "#000000";
    return _jsx(KonvaRect, { ref: ref => (setRef(ref)), draggable: false, transformsEnabled: "position", dash: [0, 0], x: props.x, y: props.y, stroke: strokeColor, hitStrokeWidth: 0, strokeWidth: 4, listening: true, cornerRadius: 8, width: props.width, height: props.height, onClick: props.onClick, perfectDrawEnabled: false, onMouseOver: props.onMouseOver, onMouseOut: props.onMouseOut, onTouchStart: props.onTouchStart, onTouchEnd: props.onMouseEnd, onTouchMove: props.onMouseMove, onMouseDown: props.onMouseStart, onMouseMove: props.onMouseMove, onMouseEnd: props.onMouseEnd, onMouseLeave: props.onMouseLeave, onDragStart: props.onDragStart, onDragMove: props.onDragMove, onDragEnd: props.onDragEnd });
});
//# sourceMappingURL=annotation-section.js.map