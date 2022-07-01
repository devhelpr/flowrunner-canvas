import * as React from 'react';
import { FlowToCanvas } from '../../../helpers/flow-to-canvas';
import { calculateLineControlPoints } from '../../../helpers/line-points';
import { ShapeSettings } from '../../../helpers/shape-settings';
import { IFlowrunnerConnector } from '../../../interfaces/IFlowrunnerConnector';
import { IFlowState } from '../../../state/flow-state';
import { usePositionContext } from '../../contexts/position-context';
import { ModifyShapeEnum, ThumbPositionRelativeToNode } from '../shapes/shape-types';

export const useSetPositionHook = (
	useFlowStore : () => IFlowState,

	draggingMultipleNodes: any,
	elementRefs: any,
	shapeRefs: any,
	gridSize: any,
	stage: any,
	mouseStartX: any,
	mouseStartY: any,
	mouseEndX: any,
	mouseEndY: any,
	stageX: any,
	stageY: any,
	stageScale: any,

	flowrunnerConnector : IFlowrunnerConnector,
	getCurrentPosition: (event: any) => any,
	setHtmlElementsPositionAndScale: (p1: any, p2: any,p3: any, p4: any, p5: any, p6: any) => any,
	getNodeInstance: (node: any, flowrunnerConnector?: IFlowrunnerConnector, flow?: any, taskSettings? : any) => any,
	updateTouchedNodes: () => void,
	saveFlow: () => void

) => {
	const flowStore = useFlowStore();
	const positionContext = usePositionContext();
	
	const setNewPositionForNode = (event, node, group, position? : any, isCommitingToStore? : boolean, linesOnly? : boolean, doDraw?: boolean, skipSetHtml?: boolean, isEndNode? : boolean, offsetPosition?: any) => {
		const unselectedNodeOpacity = 0.15;

		if (!linesOnly) {
			if (draggingMultipleNodes.current && draggingMultipleNodes.current.length == 0) {
				flowStore.flow.map((flowNode) => {
					if (flowNode.name !== node.name) {
						// node is not selected or handled by this setNewPositionForNode call
						/*if (shapeRefs[flowNode.name]) {
							const shape = (shapeRefs[flowNode.name] as any);
							if (shape) {
								//shape.modifyShape(ModifyShapeEnum.SetOpacity,{opacity:unselectedNodeOpacity});					
							}				
						}
						*/
						//const element = document.getElementById(flowNode.name);
						const element = elementRefs.current[flowNode.name];
						if (element) {
							element.style.opacity = "1"//;"0.5";
						} 
					}
				});
			}
		}
		let resultXY = group && group.modifyShape(ModifyShapeEnum.GetXY,{});
		const x = resultXY ? resultXY.x : 0;
		const y = resultXY ? resultXY.y : 0;
		let newPosition = position || {x:x, y:y};
				
		if (offsetPosition !== undefined) {

			let mappedNode = flowStore.flowHashmap.get(node.name);
			if (mappedNode) {
				let flowNode = flowStore.flow[mappedNode.index];
				if (flowNode) {

					let committedPosition = positionContext.getCommittedPosition(flowNode.name);
					if (committedPosition) {
						newPosition = {
							x: committedPosition.x + offsetPosition.x,
							y: committedPosition.y + offsetPosition.y
						}
					} else {
						newPosition = {
							x: flowNode.x + offsetPosition.x,
							y: flowNode.y + offsetPosition.y
						}
					}
				}
			}
		}

		newPosition.x = newPosition.x - (newPosition.x % gridSize.current);
		newPosition.y = newPosition.y - (newPosition.y % gridSize.current);
		if (newPosition && !linesOnly) {
			if (stage.current && stage.current && offsetPosition === undefined) {
				let stageInstance = (stage.current as any).getStage();
				if (stageInstance) {
					// TODO : .. provide event or currentPosition as parameter
					let touchPos = getCurrentPosition(event);
					if (touchPos) {
						const scaleFactor = (stageInstance as any).scaleX();

						if (!!isEndNode) {
							newPosition.x = ((touchPos.x - (stageInstance).x()) / scaleFactor) - mouseEndX.current;
							newPosition.y = ((touchPos.y - (stageInstance).y()) / scaleFactor) - mouseEndY.current;
						} else {
							newPosition.x = ((touchPos.x - (stageInstance).x()) / scaleFactor) - mouseStartX.current;
							newPosition.y = ((touchPos.y - (stageInstance).y()) / scaleFactor) - mouseStartY.current;
						}
						newPosition.x = newPosition.x - (newPosition.x % gridSize.current);
						newPosition.y = newPosition.y - (newPosition.y % gridSize.current);
				
					}
				}
			}			

			if (shapeRefs.current[node.name]) {
				
				const settings = ShapeSettings.getShapeSettings(node.taskType, node);
				const shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);	

				let currentGroup = (shapeRefs.current[node.name] as any);
				if (currentGroup && shapeType !== "Line") {
					currentGroup.modifyShape(ModifyShapeEnum.SetXY, newPosition);					
					currentGroup.modifyShape(ModifyShapeEnum.SetOpacity, {opacity:1});					
				}

				let diamondThumb = 0;
				if (shapeType === "Diamond") {
					if (!settings.altThumbPositions) {
						diamondThumb = 1;
					} else
					if (settings.altThumbPositions === 1) {
						diamondThumb = 2;
					}
				}

				let currentGroupThumbs = shapeRefs.current["thumb_" + node.name] as any;
				if (currentGroupThumbs) {
					let thumbPosition;
					if (diamondThumb === 2) {
						thumbPosition = FlowToCanvas.getThumbEndPosition(shapeType, newPosition,0 , ThumbPositionRelativeToNode.top);
					} else {
						thumbPosition = FlowToCanvas.getThumbEndPosition(shapeType, newPosition);
					}
					currentGroupThumbs.modifyShape(ModifyShapeEnum.SetXY, thumbPosition);					
					currentGroupThumbs.modifyShape(ModifyShapeEnum.SetOpacity, {opacity:1});					
				}

				currentGroupThumbs = shapeRefs.current["thumbtop_" + node.name] as any;
				if (currentGroupThumbs) {
					const thumbPosition = FlowToCanvas.getThumbEndPosition(shapeType, newPosition, 0 , ThumbPositionRelativeToNode.top);
					currentGroupThumbs.modifyShape(ModifyShapeEnum.SetXY, thumbPosition);					
					currentGroupThumbs.modifyShape(ModifyShapeEnum.SetOpacity, {opacity:1});						
				}

				currentGroupThumbs = (shapeRefs.current["thumbstart_" + node.name] as any);
				if (currentGroupThumbs) {
					
					const thumbPosition = FlowToCanvas.getThumbStartPosition(shapeType, newPosition, 0);
					currentGroupThumbs.modifyShape(ModifyShapeEnum.SetXY, thumbPosition);					
					currentGroupThumbs.modifyShape(ModifyShapeEnum.SetOpacity, {opacity:1});					

				}
				currentGroupThumbs = (shapeRefs.current["thumbstarttop_" + node.name] as any);
				if (currentGroupThumbs) {
					let thumbPosition;
					if (diamondThumb === 2) {
						thumbPosition = FlowToCanvas.getThumbStartPosition(shapeType, newPosition, 0, ThumbPositionRelativeToNode.left);
					} else {
						thumbPosition = FlowToCanvas.getThumbStartPosition(shapeType, newPosition, 0, ThumbPositionRelativeToNode.top);
					}

					currentGroupThumbs.modifyShape(ModifyShapeEnum.SetXY, thumbPosition);					
					currentGroupThumbs.modifyShape(ModifyShapeEnum.SetOpacity, {opacity:1});					

				}
				currentGroupThumbs = (shapeRefs.current["thumbstartbottom_" + node.name] as any);
				if (currentGroupThumbs) {

					let thumbPosition;
					if (diamondThumb === 2) {
						thumbPosition = FlowToCanvas.getThumbStartPosition(shapeType, newPosition, 0, ThumbPositionRelativeToNode.right);
					} else {
						thumbPosition = FlowToCanvas.getThumbStartPosition(shapeType, newPosition, 0, ThumbPositionRelativeToNode.bottom);
					}
					currentGroupThumbs.modifyShape(ModifyShapeEnum.SetXY, thumbPosition);					
					currentGroupThumbs.modifyShape(ModifyShapeEnum.SetOpacity, {opacity:1});					

				}

				
				// TODO : set some state here?? which state ?
				/*currentGroup.children.map((childNode) => {
					const childType = childNode.getClassName();
					if (childType == "Rect" || childType == "Circle" || childType == "Ellipse" || childType=="RegularPolygon") {
						childNode.fill(settings.fillSelectedColor);
					}
				});
				*/
				//const element = document.getElementById(node.name);
				const element = elementRefs.current[node.name];
				if (element) {
					element.style.opacity = "1";
				} 							
			} 
		}
		
		if (node.shapeType !== "Line") {
			positionContext.setPosition(node.name, {...newPosition});
		}

		if (skipSetHtml === undefined || skipSetHtml === false) {
			setHtmlElementsPositionAndScale(stageX.current, stageY.current, stageScale.current, 
				newPosition.x, newPosition.y, node);		
		}				

		/*
			TODO : getLinesForStartNodeFromCanvasFlow does
				a flow.filter to get the connections that have start = node

				in useLayoutEffect just after initialising new flow

				- loop through whole flow and create hashmap
				- hashMap :
					nodeName => nodeHelper
						nodeHelper has:
							index
							start : array of indexes to connections
							end : array of indexes connections
				- if node == connection				
					.. for start : add index to startNode in hashmap
					   (if startNode doesn't exist, then create)
					.. same for end

			
		*/
		const startLines = FlowToCanvas.getLinesForStartNodeFromCanvasFlow(flowStore.flow, node, flowStore.flowHashmap);
		let lines = {};
		if (startLines) {			
			startLines.map((lineNode) => {				
				let endNode = flowStore.flow[flowStore.flowHashmap.get(lineNode.endshapeid).index];
				const positionLine = positionContext.getPosition(lineNode.name) || lineNode;
				let endPos = {
					x : positionLine.xend,
					y : positionLine.yend
				};

				const newStartPosition =  FlowToCanvas.getStartPointForLine(node, newPosition, 
					endNode, endPos,
					lineNode, getNodeInstance,
					lineNode.thumbPosition as ThumbPositionRelativeToNode);
				/*
					TODO : get node by lineNode.endshapeid
					endNode = flowHashMap[lineNode.endshapeid]
				*/
				/*let endNodes = flow.flow.filter((node) => {
					return node.name == lineNode.endshapeid;
				})
				let endNode = endNodes[0];
				*/

				
				if (endNode) {					
					const positionNode = positionContext.getPosition(endNode.name) || endNode;
					const newEndPosition =  FlowToCanvas.getEndPointForLine(endNode, {
							x: positionNode.x,
							y: positionNode.y
						}, 
						node, newPosition,
						getNodeInstance,
						lineNode.thumbEndPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default
					);

					const lineRef = shapeRefs.current[lineNode.name];
					if (lineRef) {

						let controlPoints = calculateLineControlPoints(
							newStartPosition.x, newStartPosition.y, 
							newEndPosition.x, newEndPosition.y,
							lineNode.thumbPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default,
							lineNode.thumbEndPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default,
							lineNode
						);				

						lineRef.modifyShape(ModifyShapeEnum.SetPoints, {points:[newStartPosition.x, newStartPosition.y,
							controlPoints.controlPointx1, controlPoints.controlPointy1,
							controlPoints.controlPointx2, controlPoints.controlPointy2,
							newEndPosition.x, newEndPosition.y]});					
						//lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity:1});	
					}
					const endNodeRef = shapeRefs.current[lineNode.endshapeid] as any;
					if (endNodeRef) {					
						endNodeRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity:1});	
					}

					positionContext.setPosition(lineNode.name, {
						xstart: newStartPosition.x, ystart: newStartPosition.y,
						xend: newEndPosition.x, yend: newEndPosition.y
					});

				} else {
					const lineRef = shapeRefs.current[lineNode.name];
					if (lineRef) {

						let controlPoints = calculateLineControlPoints(
							newStartPosition.x, newStartPosition.y, 
							endPos.x, endPos.y,
							lineNode.thumbPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default,
							lineNode.thumbEndPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default,
							lineNode
						);				

						lineRef.modifyShape(ModifyShapeEnum.SetPoints, {points:[newStartPosition.x, newStartPosition.y,
							controlPoints.controlPointx1, controlPoints.controlPointy1,
							controlPoints.controlPointx2, controlPoints.controlPointy2,
							endPos.x, endPos.y]});					
						//lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity:1});	

						positionContext.setPosition(lineNode.name, {
							xstart: newStartPosition.x, ystart: newStartPosition.y,
							xend: endPos.x, yend: endPos.y
						});
					}
				}
				lines[lineNode.name] = {x: newStartPosition.x, y: newStartPosition.y};
			})
		}

		const endLines = FlowToCanvas.getLinesForEndNodeFromCanvasFlow(flowStore.flow, node, flowStore.flowHashmap);
		if (endLines) {
			
			endLines.map((lineNode) => {

				let startNode = flowStore.flow[flowStore.flowHashmap.get(lineNode.startshapeid).index];	
				let positionNode : any = undefined;
				if (startNode) {
					positionNode = positionContext.getPosition(startNode.name) || startNode;
				}

				const newEndPosition =  FlowToCanvas.getEndPointForLine(node, newPosition, 
					startNode, positionNode,
					getNodeInstance,
					lineNode.thumbEndPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default
				);

				const positionLine = positionContext.getPosition(lineNode.name) || lineNode;
				let startPos = {
					x : positionLine.xstart,
					y : positionLine.ystart
				};
				
				if (startNode) {
					//const positionNode = positionContext.getPosition(startNode.name) || startNode;
					let newStartPosition =  FlowToCanvas.getStartPointForLine(startNode, {
							x: positionNode.x,
							y: positionNode.y
						}, 
						node, newPosition,
						lineNode, getNodeInstance,
						lineNode.thumbPosition as ThumbPositionRelativeToNode);

					if (lines[lineNode.name]) {
						newStartPosition = lines[lineNode.name];					
					}

					const lineRef = shapeRefs.current[lineNode.name] as any;
					if (lineRef) {

						let controlPoints = calculateLineControlPoints(
							newStartPosition.x, newStartPosition.y, 
							newEndPosition.x, newEndPosition.y,
							lineNode.thumbPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default,
							lineNode.thumbEndPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default,
							lineNode);

						lineRef.modifyShape(ModifyShapeEnum.SetPoints, {points:[newStartPosition.x, newStartPosition.y,
							controlPoints.controlPointx1, controlPoints.controlPointy1,
							controlPoints.controlPointx2, controlPoints.controlPointy2,
							newEndPosition.x, newEndPosition.y]});					
						//lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity:1});
					}
					
					positionContext.setPosition(lineNode.name, {
						xstart: newStartPosition.x, ystart: newStartPosition.y,
						xend: newEndPosition.x, yend: newEndPosition.y
					});

					const startNodeRef = shapeRefs.current[lineNode.startshapeid] as any;
					if (startNodeRef) {
						startNodeRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity:1});
					}					
				} else {
					const lineRef = shapeRefs.current[lineNode.name] as any;
					if (lineRef) {

						let controlPoints = calculateLineControlPoints(
							startPos.x, startPos.y, 
							newEndPosition.x, newEndPosition.y,
							lineNode.thumbPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default,
							lineNode.thumbEndPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default,
							lineNode);

						lineRef.modifyShape(ModifyShapeEnum.SetPoints, {points:[startPos.x, startPos.y,
							controlPoints.controlPointx1, controlPoints.controlPointy1,
							controlPoints.controlPointx2, controlPoints.controlPointy2,
							newEndPosition.x, newEndPosition.y]});					
						//lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity:1});
					}
				}
			})
		}

		if (node.shapeType === "Line") {
			newPosition = positionContext.getPosition(node.name);
			let endNode = flowStore.flow[flowStore.flowHashmap.get(node.endshapeid).index];
			let newEndPosition : any = {
				x: 0,
				y: 0
			};
			if (node.endshapeid) {
				if (endNode) {
					let startNode = flowStore.flow[flowStore.flowHashmap.get(node.startshapeid).index];
					const positionStartNode = positionContext.getPosition(startNode.name) || startNode;

					const positionNode = positionContext.getPosition(endNode.name) || endNode;
					newEndPosition =  FlowToCanvas.getEndPointForLine(endNode, {
							x: positionNode.x,
							y: positionNode.y
						},
						startNode, positionStartNode,
						getNodeInstance,
						node.thumbEndPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default
					);
					newPosition.xend = newEndPosition.x;
					newPosition.yend = newEndPosition.y;	
				}
			}
			
			if (node.startshapeid) {
				let startNode = flowStore.flow[flowStore.flowHashmap.get(node.startshapeid).index];	
				if (startNode) {
					
					const positionNode = positionContext.getPosition(startNode.name) || startNode;
					let newStartPosition =  FlowToCanvas.getStartPointForLine(startNode, {
							x: positionNode.x,
							y: positionNode.y
						}, 
						endNode, newEndPosition,
						node,
						getNodeInstance,
						node.thumbPosition as ThumbPositionRelativeToNode);
					newPosition.xstart = newStartPosition.x;
					newPosition.ystart = newStartPosition.y;			
				}
			}

			positionContext.setPosition(node.name, newPosition);
		}
		
		if (!!doDraw) {
			if (draggingMultipleNodes.current && draggingMultipleNodes.current.length == 0) {
				if (stage.current) {
					let stageInstance = (stage.current as any).getStage();
					stageInstance.batchDraw();
				}
				updateTouchedNodes();
			}
		}

		if (!!isCommitingToStore) {
			// possible "performance"-dropper
			positionContext.setCommittedPosition(node.name, {...newPosition});			

			if (draggingMultipleNodes.current && draggingMultipleNodes.current.length == 0) {
				//selectNode(node.name, node);

				// TODO : do this only after last node directly from stagemouseend
				//  when draggingMultipleNodes.current.length >0
				//canvasMode.setConnectiongNodeCanvasMode(false);

				if (flowrunnerConnector.hasStorageProvider) {
					saveFlow();
				}
			}
		}
	};

	return {
		setNewPositionForNode
	}
}