import * as React from 'react';
import { useState, useEffect , useRef, useImperativeHandle} from 'react';

import * as Konva from 'react-konva';
import { calculateLineControlPoints } from '@devhelpr/flowrunner-canvas-core'
import { Thumbs }  from './thumbs';
import { ThumbsStart }  from './thumbsstart';
import { FlowToCanvas } from '@devhelpr/flowrunner-canvas-core';

const KonvaLine = Konva.Arrow;

import { Group, Text, Rect, Shape } from 'react-konva';

import { LineTypeProps, ModifyShapeEnum, ShapeStateEnum , ThumbFollowFlow, ThumbPositionRelativeToNode } from '@devhelpr/flowrunner-canvas-core';

function getBezierXY(t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {
	// http://www.independent-software.com/determining-coordinates-on-a-html-canvas-bezier-curve.html
	return {
	  x: Math.pow(1-t,3) * sx + 3 * t * Math.pow(1 - t, 2) * cp1x 
		+ 3 * t * t * (1 - t) * cp2x + t * t * t * ex,
	  y: Math.pow(1-t,3) * sy + 3 * t * Math.pow(1 - t, 2) * cp1y 
		+ 3 * t * t * (1 - t) * cp2y + t * t * t * ey
	};
  }

export const Line = React.forwardRef((props : LineTypeProps, ref : any) => {

	
	const [fillColor, setFillColor] = useState(
		props.isConnectionWithVariable ?  "#e08000" : 
			props.isConnectionWithFunction? "#0080e0" : "#000000");
	const [strokeWidth, setStrokeWidth] = useState(2);
	const [opacity, setOpacity] = useState(0);
	const [dash, setDash] = useState(props.touchedNodes && props.name && props.touchedNodes[props.name] ? [5,10] : [1,1]);
	const lineRef = useRef(null as any);
	const bgLineRef = useRef(null as any);
	const textRef = useRef(null as any);
	const textRef2 = useRef(null as any);
	const rectRef = useRef(null as any);

	useEffect(() => {
		let _fillColor = props.isSelected ? "#606060" : "#000000";	
		let _strokeWidth = 4;

		if (props.isErrorColor) {
			_fillColor = props.isSelected ? "#800000" : "#e00000";  
		}

		if (props.isSuccessColor) {
			_fillColor = props.isSelected ? "#004000" : "#008300";  
		}

		if (props.isAltColor) {
			_fillColor = "#a0a0a0";  
			//_strokeWidth = 2;
		}

		if (props.isConnectionWithVariable) {
			_fillColor = "#e08000";  
			//_strokeWidth = 2;
		}

		if (props.isConnectionWithFunction) {
			_fillColor = "#0080e0";  
			//_strokeWidth = 2;
		}

		if (props.isEventNode) {
			//_fillColor = "#a000a0";  
			_strokeWidth = 4;
		}

		let _opacity = 1;
		if (props.isNodeConnectorHelper !== undefined && !!props.isNodeConnectorHelper) {
			_opacity = 0;
			if (lineRef.current) {
				lineRef.current.pointerWidth(0);
				lineRef.current.pointerLength(0);
			}
		}
		
		if (!props.isSelected && props.canvasHasSelectedNode) {
			if (props.selectedNodeName != props.startNodeName && 
				props.selectedNodeName != props.endNodeName) {
				//_opacity = 0.15;
			}
		}

		let dash : any[] = [];
		if (props.touchedNodes && props.name && props.touchedNodes[props.name]) {
			dash = [5,10];
			_strokeWidth = 8;
			//_opacity = 1;
		} else {
			//_opacity = 0.5;
		}
	
		if (lineRef.current) {
			lineRef.current.to({								
				duration: 0.15,
				fill:_fillColor,
				stroke:_fillColor,
				strokeWidth:_strokeWidth,
				opacity: _opacity		
			});	
		} else {
			setFillColor(_fillColor);
			setStrokeWidth(_strokeWidth);
		}

		//setOpacity(_opacity);

		if (props.touchedNodes && props.name && props.touchedNodes[props.name]) {
			setDash([5,10]);
		} else {
			setDash([]);
		}
	},[props.isSelected, 
		props.isErrorColor,
		props.isSuccessColor,
		props.isAltColor,
		props.isConnectionWithVariable, 
		props.isConnectionWithFunction,
		props.isEventNode,
		props.canvasHasSelectedNode,
		props.selectedNodeName,
		props.startNodeName,
		props.endNodeName,
		props.touchedNodes
	]);

	
	useImperativeHandle(ref, () => ({
		modifyShape: (action : ModifyShapeEnum, parameters : any) => {
			switch (+action) {
				case ModifyShapeEnum.GetShapeType : {
					return "line";
					break;
				}
				case ModifyShapeEnum.GetXY : {
					if (lineRef && lineRef.current) {
						return {
							x: (lineRef.current as any).x(),
							y: (lineRef.current as any).y(),
						}
					}
					break;
				}
				case ModifyShapeEnum.SetXY : {
					if (lineRef && lineRef.current && parameters) {
						lineRef.current.x(parameters.x);
						lineRef.current.y(parameters.y);
						
					}
					break;
				}
				case ModifyShapeEnum.SetOpacity : {
					if (lineRef && lineRef.current && parameters) {
						lineRef.current.opacity(parameters.opacity);
						if (props.isNodeConnectorHelper !== undefined && !!props.isNodeConnectorHelper) {

							if (bgLineRef && bgLineRef.current) {
								bgLineRef.current.opacity(parameters.opacity);
							}
							if (props.shapeRefs) {
								const thumb1 = props.shapeRefs["thumbstart_line_" + props.lineNode.name];
								const thumb2 = props.shapeRefs["thumb_line_" + props.lineNode.name];
								if (thumb1) {
									thumb1.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: parameters.opacity});
								}	
								if (thumb2) {
									thumb2.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: parameters.opacity});
								}
							}
							if (lineRef.current) {
								if (parameters.opacity > 0) {
									lineRef.current.pointerWidth(10);
									lineRef.current.pointerLength(10);
								} else {
									lineRef.current.pointerWidth(0);
									lineRef.current.pointerLength(0);
								}							
							}
						}
					}

					if (textRef2.current && parameters) {
						textRef2.current.opacity(parameters.opacity);
					}
					
					break;
				}
				case ModifyShapeEnum.SetPoints : {
					if (lineRef && lineRef.current && parameters) {
						lineRef.current.points(parameters.points);						
					}
					if (bgLineRef && bgLineRef.current && parameters) {
						bgLineRef.current.points(parameters.points);									
					}
					if (textRef2.current) {
						const center = getBezierXY(0.5,
							parameters.points[0], parameters.points[1],
							parameters.points[2], parameters.points[3],
							parameters.points[4], parameters.points[5],
							parameters.points[6], parameters.points[7],														
						);
						//textRef.current.width("auto");
						//textRef.current.height("auto");
						//textRef.current.x(center.x);
						//textRef.current.y(center.y);
						//rectRef.current.x(center.x-6);
						//rectRef.current.y(center.y-6);
						textRef2.current.x(center.x);
						textRef2.current.y(center.y);
					}
					break;
				}
				case ModifyShapeEnum.SetState : {
					if (lineRef && lineRef.current && parameters) {
						if (parameters.state == ShapeStateEnum.Touched) {
							lineRef.current.dash([5,10]);
							lineRef.current.to({								
								duration: 0.15,
								strokeWidth:8,
								opacity:1
							});
							if (bgLineRef.current) {
								bgLineRef.current.to({								
									duration: 0.15,
									strokeWidth:(8+12),
									opacity:1
								});
							}	
						} else
						if (parameters.state == ShapeStateEnum.Default) {
							lineRef.current.dash([]);
							lineRef.current.to({								
								duration: 0.15,
								strokeWidth:4,
								opacity:1
							});
							if (bgLineRef.current) {
								bgLineRef.current.to({								
									duration: 0.15,
									strokeWidth:(4+12),
									opacity:1
								});
							}		
						}						
					}
					break;
				}
				default:
					break;
			}
		}
	}));
	
	let controlPoints = calculateLineControlPoints(props.xstart, props.ystart, props.xend, props.yend,
		props.thumbPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default,
		props.thumbEndPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default,
		props.lineNode);

	const center = getBezierXY(0.5,
		props.xstart, props.ystart,
				controlPoints.controlPointx1, controlPoints.controlPointy1,
				controlPoints.controlPointx2, controlPoints.controlPointy2,
				props.xend, props.yend
		);
	return <><Group listening={!props.noMouseEvents}
		transformsEnabled={"position"}		
	>
		<KonvaLine
		 	ref={bgLineRef} 
			points={[props.xstart, props.ystart,
				controlPoints.controlPointx1, controlPoints.controlPointy1,
				controlPoints.controlPointx2, controlPoints.controlPointy2,
				props.xend, props.yend]}
			stroke={"#e2e2e2"} 
			strokeWidth={strokeWidth + 12}
			pointerLength={10}
			pointerWidth={10}
			lineCap="round"
			lineJoin="round"
			dash={dash}
			transformsEnabled={"position"}
			fill={"#e2e2e2"} 
			opacity={props.opacity !== undefined ? props.opacity : opacity}
			tension={0}
			bezier={true}
			perfectDrawEnabled={false}
			hitStrokeWidth={0}
			noMouseEvents={true}
			shadowForStrokeEnabled={false}
		>
		</KonvaLine>
		<KonvaLine
		 	ref={lineRef} 
			points={[props.xstart, props.ystart,
				controlPoints.controlPointx1, controlPoints.controlPointy1,
				controlPoints.controlPointx2, controlPoints.controlPointy2,
				props.xend, props.yend]}
			stroke={fillColor} 
			strokeWidth={strokeWidth + 2}
			pointerLength={10}
			pointerWidth={10}
			transformsEnabled={"position"}
			lineCap="round"
			lineJoin="round"
			hitStrokeWidth={16}
			dash={dash}
			fill={fillColor} 
			opacity={props.opacity !== undefined ? props.opacity : 1}
			tension={0}
			bezier={true}
			perfectDrawEnabled={false}
			onMouseOver={props.onMouseOver}
			onMouseOut={props.onMouseOut}	
			onMouseDown={(event) => props.onMouseStart(props.lineNode, event)}
			onMouseMove={(event) => props.onMouseMove(props.lineNode, event)}
			onMouseUp={(event) => props.onMouseEnd(props.lineNode, event)}	
			onClick={props.onClickLine}
			onTap={props.onClickLine}
			shadowForStrokeEnabled={false}
		>
		</KonvaLine>
		{/*props.lineNode && props.lineNode.flowPath && <Text
			ref={textRef2} 
			x={center.x}
			y={center.y}
			align="center"			
			verticalAlign="middle"
			text={props.lineNode.flowPath}
			></Text>*/}
		{/*<Rect
			ref={rectRef} 
			x={center.x-6}
			y={center.y-6}
			width={12}
			height={12}
			fill={"#000000"}
		></Rect>*/} 
		{props.lineNode && props.lineNode.flowPath && <Shape
			ref={textRef2}
			x={center.x}
			y={center.y}
            sceneFunc={(context, shape) => {
				context._context.textAlign = "center";
				context._context.textBaseline = "middle";
				
				const size = context.measureText(props.lineNode.flowPath);
				context._context.fillStyle = "rgba(255, 255, 255, 1)";
				context.fillRect(
					-(size.width + 10)/2,
					-(10 + size.actualBoundingBoxAscent + size.actualBoundingBoxDescent)/2, 
					size.width + 10,  
					10 + size.actualBoundingBoxAscent + size.actualBoundingBoxDescent);
			  
			  	context._context.fillStyle = "#000000";
				context.fillText(props.lineNode.flowPath, 0,0);
				context._context.textAlign = "left";
				context._context.textBaseline = "alphabetic";
            }}
            fill="#FF0000"
          />}
		
	</Group>
	{props.hasStartThumb !== undefined && !!props.hasStartThumb && props.shapeRefs && <ThumbsStart				
		position={FlowToCanvas.getThumbStartPosition("", {x:props.xstart,y:props.ystart}, 0)}
		name={""}
		taskType={""}
		shapeType={""}
		node={props.lineNode}																	
		ref={ref => {
				if (props.shapeRefs) {					
					props.shapeRefs["thumbstart_line_" + props.lineNode.name] = ref;			
				}
			} 
		}									
		isSelected={false}
		isConnectedToSelectedNode={false}									
		canvasHasSelectedNode={false}
		thumbPositionRelativeToNode={ThumbPositionRelativeToNode.default}

		onMouseConnectionStartOver={(event) => props.onMouseConnectionStartOver(props.lineNode,false,event)}
		onMouseConnectionStartOut={(event) => props.onMouseConnectionStartOut(props.lineNode,false,event)}
		onMouseConnectionStartStart={(event) => props.onMouseConnectionStartStart(props.lineNode,false,"",ThumbFollowFlow.default, ThumbPositionRelativeToNode.default,event)}
		onMouseConnectionStartMove={(event) => props.onMouseConnectionStartMove(props.lineNode,false,event)}
		onMouseConnectionStartEnd={(event) => props.onMouseConnectionStartEnd(props.lineNode,false,ThumbPositionRelativeToNode.default,event)}

		getNodeInstance={props.getNodeInstance}										
	></ThumbsStart>
	}
	{props.hasEndThumb !== undefined && !!props.hasEndThumb && props.shapeRefs && <Thumbs
		position={FlowToCanvas.getThumbEndPosition("", {x:props.xend,y:props.yend})}
		name={""}
		taskType={""}
		shapeType={""}
		node={undefined}																	
		ref={ref => {
				if (props.shapeRefs) {
					props.shapeRefs["thumb_line_" + props.lineNode.name] = ref;			
				}
			} 
		}					
		isSelected={false}
		isConnectedToSelectedNode={false}									
		canvasHasSelectedNode={false}

		onMouseConnectionEndOver={(event) => props.onMouseConnectionEndOver(props.lineNode,false,event)}
		onMouseConnectionEndOut={(event) => props.onMouseConnectionEndOut(props.lineNode,false,event)}
		onMouseConnectionEndStart={(event) => props.onMouseConnectionEndStart(props.lineNode,false,event)}
		onMouseConnectionEndMove={(event) => props.onMouseConnectionEndMove(props.lineNode,false,event)}
		onMouseConnectionEndEnd={(event) => props.onMouseConnectionEndEnd(props.lineNode,false,event)}
		onMouseConnectionEndLeave={(event) => props.onMouseConnectionEndLeave(props.lineNode,false,event)}
		getNodeInstance={props.getNodeInstance}
	></Thumbs>}	
</>});