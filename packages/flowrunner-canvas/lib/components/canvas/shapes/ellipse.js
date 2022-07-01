import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { useImperativeHandle, useRef, useMemo } from 'react';
import { Group, Text, Ellipse as KonvaEllipse } from 'react-konva';
import { ModifyShapeEnum } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';
export const Ellipse = React.forwardRef((props, ref) => {
    const settings = useMemo(() => ShapeSettings.getShapeSettings(props.taskType, props.node), [props.taskType, props.node]);
    const groupRef = useRef(null);
    useImperativeHandle(ref, () => ({
        getGroupRef: () => {
            return groupRef.current;
        },
        modifyShape: (action, parameters) => {
            switch (+action) {
                case ModifyShapeEnum.GetShapeType: {
                    return "ellipse";
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
    return _jsx(_Fragment, { children: _jsxs(Group, { x: props.x, y: props.y, ref: groupRef, onDragMove: props.onDragMove, onDragEnd: props.onDragEnd, draggable: false, onClick: props.onClickShape, onMouseOver: props.onMouseOver, onMouseOut: props.onMouseOut, onTouchStart: props.onTouchStart, onTouchMove: props.onTouchMove, onTouchEnd: props.onTouchEnd, onMouseDown: props.onMouseStart, onMouseMove: props.onMouseMove, onMouseUp: props.onMouseEnd, onMouseLeave: props.onMouseLeave, transformsEnabled: "position", opacity: props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 1 : 1, children: [_jsx(KonvaEllipse, { x: ShapeMeasures.rectWidht / 2, y: ShapeMeasures.rectHeight / 2, radiusX: 100, radiusY: 50, stroke: settings.strokeColor, strokeWidth: 4, transformsEnabled: "position", cornerRadius: settings.cornerRadius, width: ShapeMeasures.rectWidht, height: ShapeMeasures.rectHeight, fill: props.isSelected ? settings.fillSelectedColor : settings.fillColor, perfectDrawEnabled: false }), _jsx(Text, { x: 0, y: 0, text: props.node && props.node.label ? props.node.label : props.name, align: 'center', width: ShapeMeasures.rectWidht, height: ShapeMeasures.rectHeight, verticalAlign: "middle", transformsEnabled: "position", listening: false, wrap: "none", fontSize: 18, ellipsis: true, fill: settings.textColor, perfectDrawEnabled: false })] }) });
});
//# sourceMappingURL=ellipse.js.map