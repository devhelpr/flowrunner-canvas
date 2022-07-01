import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { useMemo } from 'react';
import { Line } from './line';
import { FlowToCanvas } from '../../../helpers/flow-to-canvas';
import { ThumbPositionRelativeToNode } from './shape-types';
import { usePositionContext } from '../../contexts/position-context';
export const LineHelper = (props) => {
    const flow = props.useFlowStore();
    const positionContext = usePositionContext();
    const endNode = useMemo(() => {
        const endIndex = flow.flowHashmap.get(props.endshapeid).index;
        if (endIndex < 0) {
            return false;
        }
        return flow.flow[endIndex];
    }, [props.node.name, flow, flow.flowHashmap, props.endshapeid]);
    const startNode = useMemo(() => {
        const startIndex = flow.flowHashmap.get(props.startshapeid).index;
        if (startIndex < 0) {
            return false;
        }
        return flow.flow[startIndex];
    }, [props.node.name, flow, flow.flowHashmap, props.startshapeid]);
    let newEndPosition = {
        x: 0,
        y: 0
    };
    if (endNode) {
        let positionNode = positionContext.getPosition(endNode.name) || endNode;
        let startPositionNode = positionContext.getPosition(startNode.name) || endNode;
        newEndPosition = FlowToCanvas.getEndPointForLine(endNode, {
            x: positionNode.x,
            y: positionNode.y
        }, startNode, startPositionNode, props.getNodeInstance, props.lineNode.thumbEndPosition || ThumbPositionRelativeToNode.default);
    }
    else {
        let position = positionContext.getPosition(props.lineNode.name);
        if (!position) {
            positionContext.setPosition(props.lineNode.name, {
                xstart: props.lineNode.xstart,
                ystart: props.lineNode.ystart,
                xend: props.lineNode.xend,
                yend: props.lineNode.yend
            });
            position = positionContext.getPosition(props.lineNode.name);
        }
        if (position) {
            newEndPosition = {
                x: position.xend || 0,
                y: position.yend || 0
            };
        }
    }
    return _jsx(Line, { ref: ref => (props.shapeRefs.current[props.lineNode.name] = ref), onMouseOver: (event) => props.onLineMouseOver(props.lineNode, event), onMouseOut: (event) => props.onLineMouseOut(props.lineNode, event), onClickLine: (event) => props.onClickLine(props.lineNode, event), canvasHasSelectedNode: props.canvasHasSelectedNode, isSelected: false, onMouseStart: props.onMouseStart, onMouseMove: props.onMouseMove, onMouseEnd: props.onMouseEnd, lineNode: props.lineNode, shapeRefs: props.shapeRefs.current, isErrorColor: props.lineNode.followflow === 'onfailure', isSuccessColor: props.lineNode.followflow === 'onsuccess', xstart: props.newStartPosition.x, ystart: props.newStartPosition.y, xend: newEndPosition.x, yend: newEndPosition.y, isEventNode: props.lineNode.event !== undefined && props.lineNode.event !== "", selectedNodeName: "", startNodeName: props.lineNode.startshapeid, endNodeName: props.lineNode.endshapeid, hasEndThumb: props.endshapeid === undefined, noMouseEvents: false, touchedNodes: props.touchedNodes, name: props.lineNode.name, thumbPosition: props.lineNode.thumbPosition || ThumbPositionRelativeToNode.default, thumbEndPosition: props.lineNode.thumbEndPosition || ThumbPositionRelativeToNode.default, onMouseConnectionStartOver: props.onMouseConnectionStartOver, onMouseConnectionStartOut: props.onMouseConnectionStartOut, onMouseConnectionStartStart: props.onMouseConnectionStartStart, onMouseConnectionStartMove: props.onMouseConnectionStartMove, onMouseConnectionStartEnd: props.onMouseConnectionStartEnd, onMouseConnectionEndOver: props.onMouseConnectionEndOver, onMouseConnectionEndOut: props.onMouseConnectionEndOut, onMouseConnectionEndStart: props.onMouseConnectionEndStart, onMouseConnectionEndMove: props.onMouseConnectionEndMove, onMouseConnectionEndEnd: props.onMouseConnectionEndEnd, onMouseConnectionEndLeave: props.onMouseConnectionEndLeave });
};
export const Lines = (props) => {
    const flow = props.useFlowStore();
    const positionContext = usePositionContext();
    const lines = useMemo(() => {
        return flow.flowHashmap.get(props.node.name).start.map((lineIndex, index) => {
            return flow.flow[lineIndex];
        });
    }, [props.node.name, flow, flow.flowHashmap]);
    return _jsx(_Fragment, { children: lines.map((lineNode, index) => {
            const endIndex = flow.flowHashmap.get(lineNode.endshapeid).index;
            if (endIndex < 0) {
                return false;
            }
            const endNode = flow.flow[endIndex];
            let newPosition = { x: props.node.x, y: props.node.y };
            newPosition = positionContext.getPosition(props.node.name) || newPosition;
            let endPosition = { x: endNode.x, y: endNode.y };
            endPosition = positionContext.getPosition(lineNode.endshapeid) || endPosition;
            const newStartPosition = FlowToCanvas.getStartPointForLine(props.node, newPosition, endNode, endPosition, lineNode, props.getNodeInstance, lineNode.thumbPosition || ThumbPositionRelativeToNode.default);
            return _jsx(React.Fragment, { children: _jsx(LineHelper, { useFlowStore: props.useFlowStore, endshapeid: lineNode.endshapeid, startshapeid: lineNode.startshapeid, node: props.node, lineNode: lineNode, getNodeInstance: props.getNodeInstance, canvasHasSelectedNode: props.canvasHasSelectedNode, isSelected: props.isSelected, selectedNode: props.selectedNode, shapeRefs: props.shapeRefs, onLineMouseOver: props.onLineMouseOver, onLineMouseOut: props.onLineMouseOut, onClickLine: props.onClickLine, onMouseStart: props.onMouseStart, onMouseMove: props.onMouseMove, onMouseEnd: props.onMouseEnd, onMouseConnectionStartOver: props.onMouseConnectionStartOver, onMouseConnectionStartOut: props.onMouseConnectionStartOut, onMouseConnectionStartStart: props.onMouseConnectionStartStart, onMouseConnectionStartMove: props.onMouseConnectionStartMove, onMouseConnectionStartEnd: props.onMouseConnectionStartEnd, onMouseConnectionEndOver: props.onMouseConnectionEndOver, onMouseConnectionEndOut: props.onMouseConnectionEndOut, onMouseConnectionEndStart: props.onMouseConnectionEndStart, onMouseConnectionEndMove: props.onMouseConnectionEndMove, onMouseConnectionEndEnd: props.onMouseConnectionEndEnd, onMouseConnectionEndLeave: props.onMouseConnectionEndLeave, touchedNodes: props.touchedNodes, newStartPosition: newStartPosition }) }, index);
        }) });
};
//# sourceMappingURL=line-helper.js.map