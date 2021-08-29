import * as React from 'react';
import { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { useImperativeHandle , useRef} from 'react';

import * as Konva from 'react-konva';
const KonvaRect = Konva.Rect;
const KonvaCircle = Konva.Circle;

import { Group, Text } from 'react-konva';
import { ThumbTypeProps, ModifyShapeEnum, ShapeStateEnum , ThumbPositionRelativeToNode} from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';

export const Thumbs = React.forwardRef((props: ThumbTypeProps, ref : any) => {

	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);
	const groupRef = useRef(null as any);
	const settings = useMemo(() => ShapeSettings.getShapeSettings(props.taskType, props.node),
		[props.taskType, props.node]);

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
				let bodyElement = document.querySelector("#" + props.name + " .html-plugin-node");
				let element = document.querySelector("#" + props.name + " .canvas__html-shape-thumb-startbottom") as HTMLElement;
				if (!bodyElement) {
					bodyElement = document.querySelector("#" + props.name + " .canvas__html-shape-body");
				}
				if (element && bodyElement) {
					setHeight(instance.getHeight(bodyElement.clientHeight + 20));					
				} else {
					setHeight(instance.getHeight(props.node));
				}
			
			}
		}
	}, [props.isSelected, props.isConnectedToSelectedNode, props.node]);
		
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
		onTouchStart={props.onMouseConnectionEndStart}
		onTouchMove={props.onMouseConnectionEndMove}
		onTouchEnd={props.onMouseConnectionEndEnd}
		width={12}
		height={12}
		transformsEnabled={"position"}
	>
		{(props.shapeType === "Rect" || props.shapeType === "Diamond") && <>			
			<KonvaCircle
				x={0}
				y={12}				
				radius={8}
				listening={false}
				transformsEnabled={"position"}
				fill="#000000"				
				opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 1 : 1}
			></KonvaCircle>
			<KonvaCircle
				x={0}
				y={12}				
				radius={6}
				listening={false}
				transformsEnabled={"position"}
				fill="#ffffff"				
				opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 1 : 1}
			></KonvaCircle>
			<KonvaCircle
				x={0}
				y={12}
				radius={12}
				listening={true}
				transformsEnabled={"position"}
				opacity={0}
			></KonvaCircle>
		</>}
		{props.shapeType === "Html" && <>
			<KonvaRect
				x={props.shapeType === "Html" &&
					props.thumbPositionRelativeToNode === ThumbPositionRelativeToNode.top ? 
					((width || props.node.width || ShapeMeasures.htmlWidth)/2) - 12 : 
					-16}
				y={props.shapeType === "Html" &&
					props.thumbPositionRelativeToNode === ThumbPositionRelativeToNode.top ? -16 : 40}
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
							
		</>}			
	</Group>
	</>
})

/*
<KonvaCircle
				x={props.shapeType === "Html" &&
					props.thumbPositionRelativeToNode === ThumbPositionRelativeToNode.top ? 
					((width || props.node.width || ShapeMeasures.htmlWidth)/2) + 6 : 
					0}
				y={props.shapeType === "Html" &&
					props.thumbPositionRelativeToNode === ThumbPositionRelativeToNode.top ? 0 : 52}
				radius={12}
				listening={false}
				transformsEnabled={"position"}
				fill="#00ff00"
				opacity={1}
			></KonvaCircle>	
*/