import * as React from 'react';
import { useState, useEffect, useLayoutEffect } from 'react';
import { useImperativeHandle , useRef} from 'react';

import * as Konva from 'react-konva';
const KonvaRect = Konva.Rect;
const KonvaCircle = Konva.Circle;

import { Group, Text } from 'react-konva';
import { ThumbTypeProps, ModifyShapeEnum, ShapeStateEnum } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';

export const Thumbs = React.forwardRef((props: ThumbTypeProps, ref : any) => {

	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);
	const groupRef = useRef(null as any);

	useImperativeHandle(ref, () => ({
		modifyShape: (action : ModifyShapeEnum, parameters : any) => {
			switch (+action) {
				case ModifyShapeEnum.GetShapeType : {
					return "thumbs";
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
		x={props.position.x}
		y={props.position.y}
		onMouseOver={props.onMouseConnectionEndOver}
		onMouseOut={props.onMouseConnectionEndOut}
		onMouseDown={props.onMouseConnectionEndStart}
		onMouseMove={props.onMouseConnectionEndMove}
		onMouseUp={props.onMouseConnectionEndEnd}
		onMouseLeave={props.onMouseConnectionEndLeave}
		width={12}
		height={12}
		transformsEnabled={"position"}
	>
		{(props.shapeType === "Rect" || props.shapeType === "Diamond") && <>			
			<KonvaCircle
				x={0}
				y={12}				
				radius={8}
				transformsEnabled={"position"}
				fill="#000000"				
				opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 1 : 1}
			></KonvaCircle>
			<KonvaCircle
				x={0}
				y={12}				
				radius={6}
				transformsEnabled={"position"}
				fill="#ffffff"				
				opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 1 : 1}
			></KonvaCircle>
			<KonvaCircle
				x={0}
				y={12}
				radius={12}
				transformsEnabled={"position"}
				opacity={0}
			></KonvaCircle>
		</>}
		{props.shapeType === "Html" && <>
			<KonvaRect
				x={-((width || props.node.width || ShapeMeasures.htmlWidth)/2) - 16}
				y={-((height || props.node.height || ShapeMeasures.htmlHeight)/2) + 36}
				strokeWidth={0}
				stroke="#808080"
				cornerRadius={settings.cornerRadius}
				width={24}
				transformsEnabled={"position"}
				height={24}
				fill="#ff0000"
				opacity={0}  
				perfectDrawEnabled={false}
				name={"connectiontionend"}
				listening={true}
				
				></KonvaRect>
			<KonvaCircle
				x={-((width || props.node.width || ShapeMeasures.htmlWidth)/2)}
				y={-((height || props.node.height || ShapeMeasures.htmlHeight)/2) + 52}
				radius={12}
				transformsEnabled={"position"}
				opacity={0}
			></KonvaCircle>					
		</>}			
	</Group>
	</>
})

/*
<KonvaRect
				x={-4}
				y={8}
				strokeWidth={2}
				stroke="#808080"
				cornerRadius={settings.cornerRadius}
				width={8}
				height={8}
				fill="#808080"
				opacity={1}  
				perfectDrawEnabled={false}
				name={"connectiontionend"}
				listening={true}
				
				></KonvaRect>	
			<KonvaRect
				x={-2 -4}
				y={- 2 + 8}
				strokeWidth={2}
				stroke="#e2e2e2"
				cornerRadius={settings.cornerRadius}
				width={12}
				height={12}					
				opacity={1}  
			perfectDrawEnabled={false}></KonvaRect>
*/