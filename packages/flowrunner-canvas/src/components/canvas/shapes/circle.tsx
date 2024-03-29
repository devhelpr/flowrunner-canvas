import * as React from 'react';
import { useImperativeHandle , useRef, useMemo} from 'react';

import { Group, Text, Circle as KonvaCircle } from 'react-konva';

import { ShapeTypeProps, ModifyShapeEnum, ShapeStateEnum } from '@devhelpr/flowrunner-canvas-core';
import { ShapeMeasures } from '@devhelpr/flowrunner-canvas-core';
import { ShapeSettings } from '@devhelpr/flowrunner-canvas-core';
import { Lines } from './line-helper';

export const Circle = React.forwardRef((props : ShapeTypeProps, ref : any) => {
	const settings = useMemo(() => ShapeSettings.getShapeSettings(props.taskType, props.node),
		[props.taskType, props.node]);
	const groupRef = useRef(null as any);

	useImperativeHandle(ref, () => ({
		getGroupRef: () => {
			return groupRef.current;
		},
		modifyShape: (action : ModifyShapeEnum, parameters : any) => {
			switch (+action) {
				case ModifyShapeEnum.GetShapeType : {
					return "rect";
					break;
				}
				case ModifyShapeEnum.GetXY : {
					if (groupRef && groupRef.current) {
						return {
							x: (groupRef.current as any).x(),
							y: (groupRef.current as any).y(),
						}
					}
					break;
				}
				case ModifyShapeEnum.SetXY : {
					if (groupRef && groupRef.current && parameters) {
						groupRef.current.x(parameters.x);
						groupRef.current.y(parameters.y);
					}
					break;
				}
				case ModifyShapeEnum.SetOpacity : {
					if (groupRef && groupRef.current && parameters) {
						groupRef.current.opacity(parameters.opacity);						
					}
					break;
				}
				case ModifyShapeEnum.SetPoints : {
					break;
				}
				case ModifyShapeEnum.SetState : {
					/*
					if (groupRef && groupRef.current && parameters) {
						if (parameters.state == ShapeStateEnum.Touched) {
							groupRef.current.opacity(1);
						} else
						if (parameters.state == ShapeStateEnum.Default) {
							groupRef.current.opacity(0.5);
						}						
					}
					*/
					break;
				}
				default:
					break;
			}
		}
	}));

	return <>
		<Group
			x={props.x}
			y={props.y}
			ref={groupRef}
			data-id={props.name}
			draggable={false}
			onDragStart={props.onDragStart}
			onDragMove={props.onDragMove}
			onDragEnd={props.onDragEnd}
			onClick={props.onClickShape}
			onTouchStart={props.onTouchStart}
			onTouchMove={props.onTouchMove}
			onTouchEnd={props.onTouchEnd}
			onMouseDown={props.onMouseStart}
			onMouseMove={props.onMouseMove}
			onMouseUp={props.onMouseEnd}
			onMouseOver={props.onMouseOver}
			onMouseOut={props.onMouseOut}
			onMouseLeave={props.onMouseLeave}
			opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 1 : 1}
			transformsEnabled={"position"}
			>
			<KonvaCircle 
				x={ShapeMeasures.circleSize/2}
				y={ShapeMeasures.circleSize/2}
				radius={ShapeMeasures.circleSize}
				stroke={settings.strokeColor}
				strokeWidth={4}
				width={ShapeMeasures.circleSize}
				height={ShapeMeasures.circleSize}
				fill={props.isSelected ? settings.fillSelectedColor : settings.fillColor} 
				transformsEnabled={"position"}
				perfectDrawEnabled={false}>
			</KonvaCircle>
			<Text
				x={0}
				y={0}
				text={props.node && props.node.label ? props.node.label : props.name}
				align='center'
				width={ShapeMeasures.circleSize}
				height={ShapeMeasures.circleSize}
				verticalAlign="middle"
				listening={false}
				wrap="none"
				fontSize={18}
				ellipsis={true}
				fill={settings.textColor}
				transformsEnabled={"position"}
				perfectDrawEnabled={false}>
			</Text>
		</Group>			
	</>
});