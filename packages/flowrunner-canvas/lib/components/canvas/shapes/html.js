import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { useState, useLayoutEffect, useMemo } from 'react';
import { useImperativeHandle, useRef } from 'react';
import { Group, Rect as KonvaRect } from 'react-konva';
import { ModifyShapeEnum } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';
export const Html = React.forwardRef((props, ref) => {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const settings = useMemo(() => ShapeSettings.getShapeSettings(props.taskType, props.node), [props.taskType, props.node]);
    const groupRef = useRef(null);
    useImperativeHandle(ref, () => ({
        getGroupRef: () => {
            return groupRef.current;
        },
        modifyShape: (action, parameters) => {
            switch (+action) {
                case ModifyShapeEnum.GetShapeType: {
                    return "html";
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
                    break;
                }
                default:
                    break;
            }
        }
    }));
    useLayoutEffect(() => {
        if (props.getNodeInstance) {
            const instance = props.getNodeInstance(props.node, undefined, undefined, settings);
            if (instance && instance.getWidth && instance.getHeight) {
                setWidth(instance.getWidth(props.node));
                setHeight(instance.getHeight(props.node));
            }
        }
    }, [props.node]);
    return _jsx(_Fragment, { children: _jsx(Group, { x: props.x, y: props.y, ref: groupRef, onDragMove: props.onDragMove, onDragEnd: props.onDragEnd, draggable: false, transformsEnabled: "position", onClick: props.onClickShape, onTouchStart: props.onTouchStart, onTouchMove: props.onTouchMove, onTouchEnd: props.onTouchEnd, onMouseDown: props.onMouseStart, onMouseMove: props.onMouseMove, onMouseUp: props.onMouseEnd, onMouseLeave: props.onMouseLeave, onMouseOver: props.onMouseOver, onMouseOut: props.onMouseOut, children: _jsx(KonvaRect, { x: 0, y: 0, strokeWidth: 0, cornerRadius: settings.cornerRadius, width: width || props.node.width || ShapeMeasures.htmlWidth, height: (height || props.node.height || ShapeMeasures.htmlHeight) + 5, fill: "#000000", opacity: 0, transformsEnabled: "position", perfectDrawEnabled: false }) }) });
});
//# sourceMappingURL=html.js.map