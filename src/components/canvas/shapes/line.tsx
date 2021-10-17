import * as React from 'react';
import { useState, useEffect , useRef, useImperativeHandle} from 'react';

import * as Konva from 'react-konva';
import { calculateLineControlPoints } from '../../../helpers/line-points'
import { Thumbs }  from './thumbs';
import { ThumbsStart }  from './thumbsstart';
import { FlowToCanvas } from '../../../helpers/flow-to-canvas';

const KonvaLine = Konva.Arrow;

import { Group, Text } from 'react-konva';

import { LineTypeProps, ModifyShapeEnum, ShapeStateEnum , ThumbFollowFlow, ThumbPositionRelativeToNode } from './shape-types';
export const Line = React.forwardRef((props : LineTypeProps, ref : any) => {

	
	const [fillColor, setFillColor] = useState(props.isConnectionWithVariable ?  "#0080e0" : "#000000");
	const [strokeWidth, setStrokeWidth] = useState(2);
	const [opacity, setOpacity] = useState(0);
	const [dash, setDash] = useState(props.touchedNodes && props.name && props.touchedNodes[props.name] ? [5,10] : [1,1]);
	const lineRef = useRef(null as any);
	const bgLineRef = useRef(null as any);

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
			_fillColor = "#0080e0";  
			//_strokeWidth = 2;
		}

		if (props.isEventNode) {
			_fillColor = "#a000a0";  
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
						/*
						const x = group ? group.attrs["x"] : 0;
						const y = group ? group.attrs["y"] : 0;
						*/
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
					
					break;
				}
				case ModifyShapeEnum.SetPoints : {
					if (lineRef && lineRef.current && parameters) {
						lineRef.current.points(parameters.points);						
					}
					if (bgLineRef && bgLineRef.current && parameters) {
						bgLineRef.current.points(parameters.points);
					}					
					break;
				}
				case ModifyShapeEnum.SetState : {
					if (lineRef && lineRef.current && parameters) {
						if (parameters.state == ShapeStateEnum.Touched) {
							lineRef.current.dash([5,10]);
							/*
							lineRef.current.strokeWidth(8);
							lineRef.current.opacity(1);
							*/
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
							/*
							lineRef.current.strokeWidth(4);
							lineRef.current.opacity(0.5);
							*/
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
		props.thumbEndPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default);
/*
	let fillColor = props.isSelected ? "#606060" : "#000000";	
	let strokeWidth = 4;

	if (props.isErrorColor) {
		fillColor = props.isSelected ? "#800000" : "#e00000";  
	}

	if (props.isSuccessColor) {
		fillColor = props.isSelected ? "#008000" : "#00d300";  
	}

	if (props.isAltColor) {
		fillColor = "#a0a0a0";  
		strokeWidth = 2;
	}

	if (props.isConnectionWithVariable) {
		fillColor = "#0080e0";  
		strokeWidth = 2;
	}

	if (props.isEventNode) {
		fillColor = "#a000a0";  
		strokeWidth = 4;
	}

	let opacity = 1;
	if (!props.isSelected && props.canvasHasSelectedNode) {
		if (props.selectedNodeName != props.startNodeName && 
			props.selectedNodeName != props.endNodeName) {
			opacity = 0.15;
		}
	}
*/

// props.opacity !== undefined ? props.opacity : opacity

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