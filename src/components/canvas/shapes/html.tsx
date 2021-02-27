import * as React from 'react';
import { useState, useEffect, useLayoutEffect } from 'react';
import { useImperativeHandle , useRef} from 'react';

import { Group, Rect as KonvaRect } from 'react-konva';
import { ShapeTypeProps, ModifyShapeEnum, ShapeStateEnum } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';
import { Lines } from './line-helper';

export const Html = React.forwardRef((props: ShapeTypeProps, ref: any) => {

	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);

	const settings = ShapeSettings.getShapeSettings(props.taskType, props.node);
	
	const groupRef = useRef(null as any);

	useImperativeHandle(ref, () => ({
		modifyShape: (action : ModifyShapeEnum, parameters : any) => {
			switch (+action) {
				case ModifyShapeEnum.GetShapeType : {
					return "html";
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
				//console.log("instance.getWidth()", instance.getWidth(), instance);
				setWidth(instance.getWidth(props.node));
				setHeight(instance.getHeight(props.node));
			}
		}
	}, [props.node]);	
	
	return <>
		<Group
			x={props.x}
			y={props.y}
			ref={groupRef}
			onDragMove={props.onDragMove}
			onDragEnd={props.onDragEnd}
			draggable={false}
			transformsEnabled={"position"}
			onClick={props.onClickShape}
			onTouchStart={props.onTouchStart}
			onTouchMove={props.onTouchMove}
			onTouchEnd={props.onTouchEnd}
			onMouseDown={props.onMouseStart}
			onMouseMove={props.onMouseMove}
			onMouseUp={props.onMouseEnd}
			onMouseLeave={props.onMouseLeave}
			onMouseOver={props.onMouseOver}
			onMouseOut={props.onMouseOut}				
			><KonvaRect			
				x={-((width || props.node.width || ShapeMeasures.htmlWidth)/2)}
				y={-((height || props.node.height || ShapeMeasures.htmlHeight)/2)}
				strokeWidth={0}
				cornerRadius={settings.cornerRadius}
				width={width || props.node.width || ShapeMeasures.htmlWidth}
				height={(height || props.node.height || ShapeMeasures.htmlHeight)+5}
				fill="#000000"
				opacity={0}  
				perfectDrawEnabled={false}></KonvaRect>		
		</Group>
		
	</>;
});

/*

<Text x={(((width || props.node.width || ShapeMeasures.htmlWidth)/2) + 10) + 12}
					y={-((height || props.node.height || ShapeMeasures.htmlHeight)/2) + (index * 10) + 28}
					text={event.eventName}
					align='left'
					fontSize={12}
					lineHeight={20}
					height={20}
					verticalAlign="middle"
					listening={false}
					wrap="none"
					ellipsis={true}
					fill="#000000"
					perfectDrawEnabled={true}></Text>

*/