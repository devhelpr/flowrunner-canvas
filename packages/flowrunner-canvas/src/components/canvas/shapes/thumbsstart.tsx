import * as React from 'react';
import { useState, useEffect, useLayoutEffect , useMemo } from 'react';
import { useImperativeHandle , useRef} from 'react';

import * as Konva from 'react-konva';
const KonvaRect = Konva.Rect;
const KonvaCircle = Konva.Circle;

import { Group, Text } from 'react-konva';
import { ThumbTypeProps, ModifyShapeEnum, ShapeStateEnum, ThumbFollowFlow, ThumbPositionRelativeToNode } from '@devhelpr/flowrunner-canvas-core';
import { ShapeMeasures } from '@devhelpr/flowrunner-canvas-core';
import { ShapeSettings } from '@devhelpr/flowrunner-canvas-core';

export const ThumbsStart = React.forwardRef((props: ThumbTypeProps, ref : any) => {

	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);
	const groupRef = useRef(null as any);

	const settings = useMemo(() => ShapeSettings.getShapeSettings(props.taskType, props.node),
		[props.taskType, props.node]);

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

						if (props.shapeType === "Html" && props.thumbPositionRelativeToNode === ThumbPositionRelativeToNode.bottom) {
							let width = undefined;
							let height = undefined;
							if (props.getNodeInstance && props.node) {
							  const nodeInstance = props.getNodeInstance(props.node, undefined, undefined, settings);
							  if (nodeInstance && nodeInstance.getWidth) {
								width = nodeInstance.getWidth(props.node);
								height = nodeInstance.getHeight(props.node);
							  }
							}
							let bodyElement = document.querySelector("#" + props.name + " .html-plugin-node");
							let element = document.querySelector("#" + props.name + " .canvas__html-shape-thumb-startbottom") as HTMLElement;
							if (element && bodyElement) {
								element.style.top = ((bodyElement.clientHeight + 20) || height || "400") + "px";
								//props.getNodeInstance()
							}
						}
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
		if (props.getNodeInstance && props.name) {
			const instance = props.getNodeInstance(props.node, undefined, undefined, settings);
			if (instance && instance.getWidth && instance.getHeight) {
				setWidth(instance.getWidth(props.node));
				
				let bodyElement = document.querySelector("#" + props.name + " .html-plugin-node");
				let element = document.querySelector("#" + props.name + " .canvas__html-shape-thumb-startbottom") as HTMLElement;
				if (!bodyElement) {
					bodyElement = document.querySelector("#" + props.name + " .canvas__html-shape-body");
				}
				if (element && bodyElement) {
					setHeight(bodyElement.clientHeight + 20);

					if (props.shapeType === "Html" && props.thumbPositionRelativeToNode === ThumbPositionRelativeToNode.bottom) {
						element.style.top = ((bodyElement.clientHeight + 20) || height || "400") + "px";
					}
				} else {
					setHeight(instance.getHeight(props.node));
				}
				
				
			}
		}
	}, [props.isSelected, props.isConnectedToSelectedNode, props.node]);

	return <><Group
		ref={groupRef}
		x={props.position.x }
		y={props.shapeType === "Html" &&
			props.thumbPositionRelativeToNode === ThumbPositionRelativeToNode.bottom ?
			(props.position.y + height ) : 
			props.position.y}
		onMouseOver={props.onMouseConnectionStartOver}
		onMouseOut={props.onMouseConnectionStartOut}
		onMouseDown={props.onMouseConnectionStartStart}
		onMouseMove={props.onMouseConnectionStartMove}
		onMouseUp={props.onMouseConnectionStartEnd}
		onTouchStart={props.onMouseConnectionStartStart}
		onTouchMove={props.onMouseConnectionStartMove}
		onTouchEnd={props.onMouseConnectionStartEnd}
		width={12}
		height={12}
		transformsEnabled={"position"}
	>			
		{(props.shapeType === "" || props.shapeType === "Rect" || props.shapeType === "Diamond") && <>
				
			<KonvaCircle
				x={props.shapeType === "" ? 0 : ShapeMeasures.rectWidht}
				y={props.shapeType === "" ? 0 : 12}				
				radius={8}
				listening={false}
				transformsEnabled={"position"}
				perfectDrawEnabled={false}
				fill={props.followFlow == ThumbFollowFlow.happyFlow ? "#00d300" : 
					(props.followFlow == ThumbFollowFlow.unhappyFlow ? "#e00000" : "#000000")}
				opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 1 : 1}
			></KonvaCircle>
			<KonvaCircle
				x={props.shapeType === "" ? 0 : ShapeMeasures.rectWidht}
				y={props.shapeType === "" ? 0 : 12}				
				radius={6}
				listening={false}
				transformsEnabled={"position"}
				perfectDrawEnabled={false}
				fill="#ffffff"				
				opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 1 : 1}
			></KonvaCircle>
			<KonvaCircle
				x={props.shapeType === "" ? 0 : ShapeMeasures.rectWidht}
				y={props.shapeType === "" ? 0 : 12}
				listening={true}
				transformsEnabled={"position"}
				perfectDrawEnabled={false}
				radius={12}
				opacity={0}
			></KonvaCircle>			
		</>}
		{props.shapeType === "Html" && <>
			<KonvaRect
				x={props.shapeType === "Html" &&
					props.thumbPositionRelativeToNode === ThumbPositionRelativeToNode.bottom ?
					((width || props.node.width || ShapeMeasures.htmlWidth)/2) - 12 :
					(width || props.node.width || ShapeMeasures.htmlWidth) - 8}
				y={props.shapeType === "Html" &&
					props.thumbPositionRelativeToNode === ThumbPositionRelativeToNode.bottom ? 0 : 
					40}
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
		</>}
	</Group>

	</>
})

/*
	<KonvaCircle
				transformsEnabled={"position"}
				x={props.shapeType === "Html" &&
					props.thumbPositionRelativeToNode === ThumbPositionRelativeToNode.bottom ?
					((width || props.node.width || ShapeMeasures.htmlWidth) / 2) + 6 : 
					(width || props.node.width || ShapeMeasures.htmlWidth) + 2}
				y={props.shapeType === "Html" &&
					props.thumbPositionRelativeToNode === ThumbPositionRelativeToNode.bottom ? 8 : 52}
				radius={12}
				opacity={1}
				fill="#00ff00"
				listening={false}
			></KonvaCircle>	

*/