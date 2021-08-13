import * as React from 'react';
import { useState, useEffect, RefObject, useImperativeHandle , useRef} from 'react';

import useImage from 'use-image';
import { Group, Text, Rect as KonvaRect, Image as KonvaImage, Line as KonvaLine } from 'react-konva';
import { ShapeTypeProps, ModifyShapeEnum, ShapeStateEnum } from './shape-types';
import { ShapeMeasures } from '../../../helpers/shape-measures';
import { ShapeSettings } from '../../../helpers/shape-settings';
import { Lines } from './line-helper';

export const Rect = React.forwardRef((props: ShapeTypeProps, ref : any) => {
	const settings = ShapeSettings.getShapeSettings(props.taskType, props.node);
	let rect : any = undefined;	
	let textRef : any = undefined;
	let skewX = 0;
	let skewXOffset = 0;
	let includeSvgIcon = false;
	const [image] = useImage("/svg/layout.svg");
	const [cogImage] = useImage("/svg/cog.svg");
	const groupRef = useRef(null as any);

	if (settings.isSkewed) {
		skewX = -0.5;
		skewXOffset = (ShapeMeasures.rectWidht/8);
	}

	if (props.node && props.node.objectSchema) {
		if (props.node.objectSchema == "layout") {
			includeSvgIcon = true;			
		}
	}
	
	useEffect(() => {
		if (rect) {			
			rect.skew({
				x: skewX,
				y: 0
			});
			rect.cache();
		}

		if (textRef) {
			textRef.cache();
		}
		
	});

	const setRef = (ref) => {
		rect = ref;
		if (rect) {
			rect.skew({
				x: skewX,
				y: 0
			});
		}
	}	

	const setTextRef =  (ref) => {
		textRef = ref;		
	}	

	
	useImperativeHandle(ref, () => ({
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

	
	//ref={ref} (group)
	return <>
		<Group
			ref={groupRef}
			x={props.x}
			y={props.y}
			transformsEnabled={settings.isSkewed ? "all" : "position"}
			draggable={false}
			order={0}
			onTouchStart={props.onTouchStart}
			onTouchMove={props.onTouchMove}
			onTouchEnd={props.onTouchEnd}
			onDragStart={props.onDragStart}
			onDragMove={props.onDragMove}
			onDragEnd={props.onDragEnd}
			onMouseOver={props.onMouseOver}
			onMouseOut={props.onMouseOut}
			onMouseDown={props.onMouseStart}
			onMouseMove={props.onMouseMove}
			onMouseUp={props.onMouseEnd}
			onMouseLeave={props.onMouseLeave}
			onClick={props.onClickShape}
			listening={true}		
			opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 1 : 1}
			>
			<KonvaRect
				ref={ref => (setRef(ref))}
				x={skewXOffset}
				y={0}
				stroke={settings.strokeColor}
				hitStrokeWidth={0}			
				strokeWidth={4}
				listening={true}
				cornerRadius={settings.cornerRadius}
				transformsEnabled={settings.isSkewed ? "all" : "position"}
				width={ShapeMeasures.rectWidht}
				height={ShapeMeasures.rectHeight}
				fill={props.isSelected ? settings.fillSelectedColor : settings.fillColor}  
				perfectDrawEnabled={false}>
			</KonvaRect>
			{settings.subShapeType && settings.subShapeType == "Model" && <KonvaLine
				points={[skewXOffset,10,(skewXOffset+ShapeMeasures.rectWidht),10]}
				stroke={settings.strokeColor} 
				transformsEnabled={"position"}
				listening={false}
				strokeWidth={4}
			></KonvaLine>}
			{includeSvgIcon && <KonvaImage image={image}
				pathColor={settings.textColor} 		
				width={Math.round(ShapeMeasures.rectWidht / 4)}
				height={Math.round(ShapeMeasures.rectWidht / 4)}			
				keepRatio={true}
				listening={false}
				transformsEnabled={"position"}
				x={Math.round((ShapeMeasures.rectWidht / 2) - (ShapeMeasures.rectWidht / 8))}
				y={8} 
			/>}
			<Text
				ref={ref => (setTextRef(ref))}
				x={0}
				y={includeSvgIcon ? Math.round(ShapeMeasures.rectWidht / 8) : 0}
				text={props.node && props.node.label ? props.node.label : props.name}
				align='center'
				fontSize={18}
				transformsEnabled={"position"}
				width={ShapeMeasures.rectWidht}
				height={ShapeMeasures.rectHeight}
				verticalAlign="middle"
				listening={false}
				wrap="none"
				ellipsis={true}
				fill={settings.textColor}
				perfectDrawEnabled={false}>
			</Text>
			{!!settings.hasConfigMenu && <KonvaImage image={cogImage}
				pathColor={settings.textColor} 
				transformsEnabled={"position"}
				listening={true}		
				width={Math.round(ShapeMeasures.rectWidht / 8)}
				height={Math.round(ShapeMeasures.rectWidht / 8)}
				keepRatio={true}
				x={Math.round(ShapeMeasures.rectWidht - (ShapeMeasures.rectWidht / 8) - 4)}
				y={4}
				onClick={props.onClickSetup} 
			/>}
		</Group>			
	</>
});

/*

{settings.events && settings.events.map((event ,index) => {
				return <React.Fragment key={index}>
					<KonvaRect
						x={ShapeMeasures.rectWidht + 10 - 14}
						y={(index + 1) * 12 + 8}
						strokeWidth={2}
						stroke="#a000a0"
						cornerRadius={settings.cornerRadius}
						width={8}
						height={8}
						fill="#a000a0"
						title={event.eventName}
						opacity={1}  
						perfectDrawEnabled={false}></KonvaRect>	
					<KonvaRect
						x={ShapeMeasures.rectWidht + 10 - 2 - 14}
						y={(index + 1) * 12 - 2 + 8}
						strokeWidth={2}
						stroke="#e2e2e2"
						cornerRadius={settings.cornerRadius}
						width={12}
						height={12}					
						title={event.eventName}
						opacity={1}  
						perfectDrawEnabled={false}></KonvaRect>					
				</React.Fragment>
			})}	
			
<Group
		x={props.x}
		y={props.y}
		onMouseOver={props.onMouseConnectionEndOver}
			onMouseOut={props.onMouseConnectionEndOut}
			onMouseDown={props.onMouseConnectionEndStart}
			onMouseMove={props.onMouseConnectionEndMove}
			onMouseUp={props.onMouseConnectionEndEnd}
	>
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

	</Group>
	<Group
		x={props.x}
		y={props.y}
		onMouseOver={props.onMouseConnectionStartOver}
		onMouseOut={props.onMouseConnectionStartOut}
		onMouseDown={props.onMouseConnectionStartStart}
		onMouseMove={props.onMouseConnectionStartMove}
		onMouseUp={props.onMouseConnectionStartEnd}
	>			
		<KonvaRect
			x={ShapeMeasures.rectWidht + 10 - 14}
			y={8}
			strokeWidth={2}
			stroke="#808080"
			cornerRadius={settings.cornerRadius}
			width={8}
			height={8}
			fill="#808080"
			opacity={1}
			order={1}  
			perfectDrawEnabled={false}
			listening={true}
			name={"connectiontionstart"}
			
			></KonvaRect>	
		<KonvaRect
			x={ShapeMeasures.rectWidht + 10 - 2 - 14}
			y={- 2 + 8}
			strokeWidth={2}
			stroke="#e2e2e2"
			cornerRadius={settings.cornerRadius}
			width={12}
			height={12}					
			opacity={1}  
			perfectDrawEnabled={false}></KonvaRect>	
	</Group>*/