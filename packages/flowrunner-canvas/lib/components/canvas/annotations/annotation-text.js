import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import { useImperativeHandle, useRef } from 'react';
import { Text } from 'react-konva';
import { ModifyShapeEnum, ShapeStateEnum } from '../shapes/shape-types';
export const AnnotationText = React.forwardRef((props, ref) => {
    var _a, _b, _c, _d;
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
                        }
                        else if (parameters.state == ShapeStateEnum.Default) {
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
    return _jsx(Text, { ref: ref => (setRef(ref)), draggable: false, transformsEnabled: "position", x: props.x, y: props.y, fontSize: (_b = (_a = props.node) === null || _a === void 0 ? void 0 : _a.fontSize) !== null && _b !== void 0 ? _b : 18, text: (_d = (_c = props.node) === null || _c === void 0 ? void 0 : _c.label) !== null && _d !== void 0 ? _d : props.name, hitStrokeWidth: 0, listening: true, width: props.width, height: props.height, perfectDrawEnabled: false, onClick: props.onClick, onMouseOver: props.onMouseOver, onMouseOut: props.onMouseOut, onTouchStart: props.onTouchStart, onTouchEnd: props.onMouseEnd, onTouchMove: props.onMouseMove, onMouseDown: props.onMouseStart, onMouseMove: props.onMouseMove, onMouseEnd: props.onMouseEnd, onMouseLeave: props.onMouseLeave, onDragStart: props.onDragStart, onDragMove: props.onDragMove, onDragEnd: props.onDragEnd });
});
//# sourceMappingURL=annotation-text.js.map