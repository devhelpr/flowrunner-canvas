import * as React from 'react';
import { useState, useEffect, useLayoutEffect } from 'react';
import { useImperativeHandle , useRef} from 'react';

import * as Konva from 'react-konva';
const KonvaRect = Konva.Rect;
const KonvaCircle = Konva.Circle;

import { Group, Text } from 'react-konva';
import { ThumbTypeProps, ModifyShapeEnum, ShapeStateEnum, ThumbFollowFlow } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';

export const ThumbsStart = React.forwardRef((props: ThumbTypeProps, ref : any) => {

	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);
	const groupRef = useRef(null as any);

	useImperativeHandle(ref, () => ({
		modifyShape: (action : ModifyShapeEnum, parameters : any) => {
			switch (+action) {
				case ModifyShapeEnum.GetShapeType : {
					return "thumbsstart";
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

	useLayoutEffect(() => {
		if (props.getNodeInstance) {
			const instance = props.getNodeInstance(props.node, undefined, undefined, settings);
			if (instance && instance.getWidth && instance.getHeight) {
				setWidth(instance.getWidth(props.node));
				setHeight(instance.getHeight(props.node));
			}
		}
	}, [props.isSelected, props.isConnectedToSelectedNode, props.node]);

	const settings = ShapeSettings.getShapeSettings(props.taskType, props.node);
	
	return <><Group
		ref={groupRef}
		x={props.position.x }
		y={props.position.y}
		onMouseOver={props.onMouseConnectionStartOver}
		onMouseOut={props.onMouseConnectionStartOut}
		onMouseDown={props.onMouseConnectionStartStart}
		onMouseMove={props.onMouseConnectionStartMove}
		onMouseUp={props.onMouseConnectionStartEnd}
		width={12}
		height={12}
		transformsEnabled={"position"}
	>			
		{(props.shapeType === "Rect" || props.shapeType === "Diamond") && <>
				
			<KonvaCircle
				x={ShapeMeasures.rectWidht}
				y={12}				
				radius={8}
				listening={false}
				transformsEnabled={"position"}
				fill={props.followFlow == ThumbFollowFlow.happyFlow ? "#00d300" : 
					(props.followFlow == ThumbFollowFlow.unhappyFlow ? "#e00000" : "#000000")}
				opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 1 : 1}
			></KonvaCircle>
			<KonvaCircle
				x={ShapeMeasures.rectWidht}
				y={12}				
				radius={6}
				listening={false}
				transformsEnabled={"position"}
				fill="#ffffff"				
				opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 1 : 1}
			></KonvaCircle>
			<KonvaCircle
				x={ShapeMeasures.rectWidht}
				y={12}
				listening={true}
				transformsEnabled={"position"}
				radius={12}
				opacity={0}
			></KonvaCircle>			
		</>}
		{props.shapeType === "Html" && <>
			<KonvaRect
				x={((width || props.node.width || ShapeMeasures.htmlWidth)/2) - 8}
				y={-((height || props.node.height || ShapeMeasures.htmlHeight)/2) + 36}
				strokeWidth={0}
				stroke="#808080"
				transformsEnabled={"position"}
				cornerRadius={settings.cornerRadius}
				width={24}
				height={24}
				fill="#ff0000"
				opacity={0}
				order={1}  
				perfectDrawEnabled={false}
				listening={true}
				name={"connectiontionstart"}			
				></KonvaRect>
			<KonvaCircle
				transformsEnabled={"position"}
				x={((width || props.node.width || ShapeMeasures.htmlWidth)/2) + 2}
				y={-((height || props.node.height || ShapeMeasures.htmlHeight)/2) + 52}
				radius={12}
				opacity={0}
				listening={false}
			></KonvaCircle>						
		</>}
	</Group>

	</>
})