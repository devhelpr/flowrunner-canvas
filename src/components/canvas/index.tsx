import * as React from 'react';
import { useRef , useState, useEffect , useMemo, useCallback, useLayoutEffect} from 'react';
import { Stage, Layer , Rect } from 'react-konva';
import { Shapes } from './shapes';
import { LinesForShape } from './shapes/lines-for-shape';
import { Thumbs }  from './shapes/thumbs';
import { ThumbsStart }  from './shapes/thumbsstart';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { getTaskConfigForTask } from '../../config';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { ShapeSettings } from '../../helpers/shape-settings';
import { Subject } from 'rxjs';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { DragginTask} from '../../dragging-task';

import { getNewNode, getNewConnection} from '../../helpers/flow-methods';
import { ShapeMeasures } from '../../helpers/shape-measures';
import { ModifyShapeEnum, ShapeStateEnum } from './shapes/shape-types';
import { Flow } from '../flow';
import { calculateLineControlPoints } from '../../helpers/line-points'
import { EditNodeSettings } from '../edit-node-settings';

import { clearPositions, getPosition, setPosition, getPositions } from '../../services/position-service';

import { useFlowStore} from '../../state/flow-state';
import { useCanvasModeStateStore} from '../../state/canvas-mode-state';
import { useSelectedNodeStore} from '../../state/selected-node-state';
import { useNodesTouchedStateStore} from '../../state/nodes-touched';

import { ThumbFollowFlow, ThumbPositionRelativeToNode } from './shapes/shape-types';
import { onFocus } from '../html-plugins/form-controls/helpers/focus';

import * as uuid from 'uuid';

import fetch from 'cross-fetch';

import { FlowState } from '../../use-flows';
import { Taskbar } from '../Taskbar';

import { useDroppable } from '@dnd-kit/core';
import {
	restrictToWindowEdges
} from '@dnd-kit/modifiers';
  
const uuidV4 = uuid.v4;

export interface CanvasProps {

	canvasToolbarsubject : Subject<string>;
	
	flow : any[];
	flowId? : number | string;
	flowState : FlowState;
	flowType : string;
	saveFlow : (flowId?) => void;

	renderHtmlNode?: (node: any, flowrunnerConnector : IFlowrunnerConnector, flow: any, taskSettings? : any) => any;
	flowrunnerConnector : IFlowrunnerConnector;
	getNodeInstance?: (node: any, flowrunnerConnector?: IFlowrunnerConnector, flow?: any, taskSettings? : any) => any;	
}

export interface CanvasState {
	stageWidth : number;
	stageHeight: number;
	canvasOpacity: number;
	canvasKey : number
	showNodeSettings: boolean;
	editNode : any;
	editNodeSettings: any;
	isConnectingNodesByDragging : boolean;
	connectionX: number;
	connectionY: number;
	updateNodeTouchedState : boolean;
}

export const Canvas = (props: CanvasProps) => {	

	const [stageWidth, setStageWidth] = useState(0);
	const [stageHeight, setStageHeight] = useState(0);
	const [canvasOpacity, setCanvasOpacity ] = useState(0);
	const [canvasKey, setCanvasKey] = useState(1);
	const [showNodeSettings, setShowNodeSettings] = useState(false);
	const [editNode, setEditNode] = useState(undefined);
	const [editNodeSettings, setEditNodeSettings] = useState(undefined);
	const [isConnectingNodesByDragging, setIsConnectingNodesByDragging] = useState(false);
	const [connectionX, setConnectionX] = useState(0);
	const [connectionY, setConnectionY] = useState(0);
	const [updateNodeTouchedState, setUpdateNodeTouchedState] = useState(true);
	const [activeId, setActiveId] = useState(undefined as string | undefined);

	const {isOver, setNodeRef} = useDroppable({id: 'droppable' });

	const flowStore = useFlowStore();
	const canvasMode = useCanvasModeStateStore();
	const selectedNode = useSelectedNodeStore();
	const touchedNodesStore = useNodesTouchedStateStore();
	
	//let flowHashMap = useRef({} as any);

	//let positions = useRef({} as any);

	let stage = useRef(null);
	let canvasWrapper = useRef(null);
	let htmlWrapper = useRef(null);
	let layer = useRef(null);
	let flowIsLoading = useRef(true);
	let flowIsFittedStageForSingleNode = useRef(false);
	let closestNodeWhenAddingNewNode = useRef(undefined);
	let orientationClosestNodeWhenAddingNewNode = useRef(false);
	let nodeOrientationClosestNodeWhenAddingNewNode = useRef(ThumbPositionRelativeToNode.default);

	let shapeRefs = useRef([] as any);
	const connectionForDraggingName = "_connection-dragging";

	let oldwheeltime = useRef(0);
	let nodesStateLocal : any = useRef({} as any);
	let touchedNodesLocal : any = useRef({} as any);

	let dragTime : any = useRef(null);

	let touching = useRef(false);
	let touchNode = useRef(null);
	let touchNodeGroup = useRef(undefined);
	let isConnectingNodesByDraggingLocal = useRef(false);

	let mouseStartX = useRef(0);
	let mouseStartY = useRef(0);

	let stageScale = useRef(1.0);
	let stageX = useRef(0.0);
	let stageY = useRef(0.0);
	let mouseDragging = useRef(false);

	let isPinching = useRef(false);
	let pinchStartPosition = useRef({x:0,y:0});
	let startDistance = useRef(0);

	let unmounted = useRef(false);

	let connectionXStart = useRef(0);
	let connectionYStart = useRef(0);
	let connectionNodeEvent = useRef((false) as (boolean | number));
	let connectionNodeEventName = useRef("");
	let connectionNodeThumbPositionRelativeToNode = useRef(ThumbPositionRelativeToNode.default);
	let connectionNodeFollowFlow = useRef(ThumbFollowFlow.default);

	let shiftDown = useRef(false);
	let ctrlDown = useRef(false);

	const droppableStyle = { color: isOver ? 'green' : undefined};

	const ctrlKey = 17;
	const shiftKey = 16;
	const cmdKey = 91;
	const pasteKey = 86;
	const backspaceKey = 8;
	const fKeyCapt = 70;
	const fKey = 102;

	let wheelTimeout = useRef(null);

	const wheelEnableLayoutOnTimeout = useCallback(() => {
		if (layer && layer.current) {
			(layer.current as any).listening(true);
			(layer.current as any).batchDraw();
		}
	}, [flowStore.flow]);

	const wheelEvent = (e , touchPosition? : any) => {
		if (wheelTimeout.current) {
			clearTimeout(wheelTimeout.current as any);
			(wheelTimeout.current as any) = undefined;
		}
		if (e.toElement && e.toElement.closest) {
			// TODO : make this work on IE11 (do we need to support IE11??)
			let element = e.toElement.closest(".no-wheel");
			if (element) {
				return true;
			}
		}

		if (layer && layer.current) {
			(layer.current as any).listening(false);
		}

		(wheelTimeout.current as any) = setTimeout(wheelEnableLayoutOnTimeout, 25);
		
		if (e.preventDefault) {
			e.preventDefault();
		}
		
		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			//if (refs.stage !== undefined) {

			// workaround to get at least faster zooming with big flows
			// its not buttery smooth but it will have to do for now
			let scaleBy = 1.23;
			scaleBy = 1.13;
			
			/*if (oldwheeltime.current == 0) {
				scaleBy = 1.13;
			} else {
				const timeDiff = performance.now() - oldwheeltime.current;
				if (timeDiff > 50) {
					scaleBy = 1.13;
				} else {
					scaleBy = 1.03 + (0.1 * timeDiff/50);
				} 
			}
			*/

			if (stageInstance !== undefined && stageInstance.getPointerPosition() !== undefined) {
				
				const oldScale = stageInstance.scaleX();				

				let xPos = stageInstance.getPointerPosition().x;
				let yPos = stageInstance.getPointerPosition().y;
				
				if (isPinching.current && touchPosition) {
					xPos = touchPosition.x;
					yPos = touchPosition.y;
				}

				const mousePointTo = {
					x: xPos / oldScale - stageInstance.x() / oldScale,
					y: yPos / oldScale - stageInstance.y() / oldScale,
				};

				const newScale = e.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
				const startPerf = performance.now();
				stageInstance.scale({ x: newScale, y: newScale });
				console.log("WheelEvent performance", performance.now() - startPerf);
				const newPos = {
					x: -(mousePointTo.x - xPos / newScale) * newScale,
					y: -(mousePointTo.y - yPos / newScale) * newScale
				};

				const newPosHtml = {
					x: -(mousePointTo.x - xPos / newScale),
					y: -(mousePointTo.y - yPos / newScale)
				};
				
				stageInstance.position(newPos);
				stageInstance.batchDraw();

				stageX.current = newPos.x;
				stageY.current = newPos.y;
				stageScale.current = newScale;

				setHtmlElementsPositionAndScale(newPos.x, newPos.y, newScale);

				console.log("WheelEvent performance setHtmlElementsPositionAndScale", performance.now() - startPerf);
				
			}
			oldwheeltime.current = performance.now();
		}
		return false;
	}

	const updateDimensions = () => {
		console.log("updateDimensions");		
		const stageContainerElement = document.querySelector(".stage-container");
		const bodyElement = document.querySelector("body");
		if (stageContainerElement !== null && bodyElement !== null) {
			let widthCanvas = stageContainerElement.clientWidth;
			let heightCanvas = bodyElement.clientHeight;// - 112;
			if (heightCanvas < 500) {
				heightCanvas = 500;
			}
			setStageWidth(widthCanvas);
			setStageHeight(heightCanvas);
		}
	}

	const onPaste = async event => {
		let text;
		if (navigator.clipboard) {
			text = await navigator.clipboard.readText();
		}
		else {
			text = event.clipboardData.getData('text/plain');
		}
		
		if (event && event.target && event.target.tagName !== "BODY") {
			return;
		}

		let pastedData;
	
		event.stopPropagation();
		event.preventDefault();
	
		//clipboardData = event.clipboardData || (window as any).clipboardData;		
		//pastedData = clipboardData.getData('Text');
		
		pastedData = text;
		let columnCount = 0;
		let rowCount = 0;

		let values : (string | any)[] = [];
		// split on enters first for rows, then tab/white-space for columns
		let lines = (pastedData as string).split(/\r?\n/);
		lines.map((line, index) => {

			let insertValues : (string | number)[] = [];
			
			(line as string).split(/\t/).map((value : string, index) => {
				if (lines.length == 1) {
					const numericValue = parseInt(value); 
					if (!isNaN(numericValue)) {
						values.push(numericValue);
					} else {
						values.push((value || "").toString());
					}
				} else {
					const numericValue = parseInt(value); 
					if (!isNaN(numericValue)) {
						insertValues.push(numericValue);
					} else {
						insertValues.push((value || "").toString());
					}
				}
			});

			if (lines.length > 1) {
				values.push(insertValues);
				if (insertValues.length > columnCount) {
					columnCount = insertValues.length;
				}
			} else {
				columnCount = values.length;
			}			
		});
		rowCount = lines.length;

		if (touchNode.current && touchNodeGroup.current) {
			event.preventDefault()		
			return false;
		}

		const nodeIsSelected : boolean = !!selectedNode && !!selectedNode.node;				
		
		if (!nodeIsSelected) {
			if (!canvasMode.isConnectingNodes) {
				if (stage && stage.current) {
					let stageInstance = (stage.current as any).getStage();
					const position = (stageInstance as any).getPointerPosition();
					const scaleFactor = (stageInstance as any).scaleX();
					const taskType = "DataGridTask";
					let presetValues = {};
					const shapeSetting = getTaskConfigForTask(taskType);
					if (shapeSetting && shapeSetting.presetValues) {
						presetValues = shapeSetting.presetValues;
					}
					let id = uuidV4();
					let newNode = getNewNode({
						name: id,
						id: id,
						label: "DataGrid",
						taskType: taskType,
						shapeType: "Html", 
						x: ((position.x - (stageInstance).x()) / scaleFactor), 
						y: ((position.y - (stageInstance).y()) / scaleFactor),
						...presetValues,
						values,
						columns: columnCount,
						rows: rowCount
					}, flowStore.flow);

					let shapeType = FlowToCanvas.getShapeType(newNode.shapeType, newNode.taskType, newNode.isStartEnd);							

					let centerXCorrection = 0;
					let centerYCorrection = 0;
					/*
					if (props.getNodeInstance) {
						const instance = props.getNodeInstance(node, props.flowrunnerConnector, props.nodes, props.flow);
						if (instance) {
							if (instance.getWidth && instance.getHeight) {
								width = instance.getWidth(node);
								height = instance.getHeight(node);
							}
						}
					}
					*/
					if (shapeType == "Rect" || shapeType == "Ellipse") {
						centerXCorrection = ShapeMeasures.rectWidht / 2;
						centerYCorrection = ShapeMeasures.rectHeight / 2;
					} else
					if (shapeType == "Circle") {
						centerXCorrection = ShapeMeasures.circleSize / 2;
						centerYCorrection = ShapeMeasures.circleSize / 2;
					}
					else
					if (shapeType == "Diamond") {
						centerXCorrection = ShapeMeasures.diamondSize / 2;
						centerYCorrection = ShapeMeasures.diamondSize / 2;
					}

					newNode.x = newNode.x - centerXCorrection;
					newNode.y = newNode.y - centerYCorrection;
					
					setPosition(newNode.name, {
						x: newNode.x,
						y: newNode.y
					});

					flowStore.addFlowNode(newNode);
				}				
			}
		}

		// TODO : do we need to select the added node or dont? (see also the flow-actions)
		selectedNode.selectNode("", undefined);

		canvasMode.setConnectiongNodeCanvasMode(false);
		canvasMode.setSelectedTask("");		


		return false;
	}


	const nodeStateList = useRef([] as any[]);
	const nodeStateCount = useRef(0);
	const nodeStateTimeout = useRef(undefined);

	const nodeStateTimeoutCallback = useCallback(() => {
		nodeStateList.current.map((nodeState) => {
			let nodeStateClass = nodeState.nodeState == "error" ? "has-error" : "";
			const element = document.getElementById(nodeState.nodeName);
			if (element) {
				element.classList.remove("has-error");
				if (nodeStateClass != "") {
					element.classList.add(nodeStateClass);
				}
			} 

			const shapeRef = shapeRefs.current[nodeState.nodeName];
			let newShapeState = ShapeStateEnum.Default;
			if (nodeState.nodeState == "ok") {
				newShapeState = ShapeStateEnum.Ok;
			} else if (nodeState.nodeState == "error") {
				newShapeState = ShapeStateEnum.Error;
			}
			if (shapeRef) {
				shapeRef.modifyShape(ModifyShapeEnum.SetState , {
					state: newShapeState
				});
			}
		});

		Object.keys(touchedNodesLocal.current).map((touchNodeId: string) => {
			const lineRef = shapeRefs.current[touchNodeId];
			if (lineRef && lineRef && lineRef.modifyShape(ModifyShapeEnum.GetShapeType, {}) == "line") {
				return;
			}
			const element = document.getElementById(touchNodeId);
			if (element) {
				if (touchedNodesLocal.current[touchNodeId] === true) {
					element.classList.remove("untouched");
				} else {
					element.classList.add("untouched");
				}
			} else {
				if (!touchedNodesLocal.current[touchNodeId] &&
					nodesStateLocal.current[touchNodeId] != "") {
					nodesStateLocal.current[touchNodeId] = "";
					const shapeRef = shapeRefs.current[touchNodeId];
					shapeRef.modifyShape(ModifyShapeEnum.SetState , {
						state: ShapeStateEnum.Default
					});
				}
			}
		});

		updateTouchedNodes();

		nodeStateList.current = [];
		nodeStateCount.current = 0;
	}, [flowStore.flow]);

	const nodeStateObserver = (nodeName: string, nodeState : string, _touchedNodes : any) => {
		if (!updateNodeTouchedState) {
			return;
		}

		
		if (nodeStateTimeout.current) {
			clearTimeout(nodeStateTimeout.current);
			nodeStateTimeout.current = undefined;
		}

		nodeStateCount.current += 1;
		nodeStateList.current.push({
			nodeState: nodeState,
			nodeName: nodeName
		});

		/*
		if (nodeStateCount.current >= 10) {
			nodeStateTimeoutCallback();
		} else {
			(nodeStateTimeout.current as any) = setTimeout(nodeStateTimeoutCallback, 70);
		}
		*/
		(nodeStateTimeout.current as any) = setTimeout(nodeStateTimeoutCallback, 30);
		

		/*
			TODO
				- igv parallel doet het raar (zie bmi test-flow)
				- geen array maar object gebruiken tbv state list?



			TODO 
				- push changes to current state list
				- if existing timer .. clear timer
				- increase statecounter 

				- if statecounter > 5 
					.. commit state to shapes and nodes , statecounter = 0 : clear current state list
				- else create new timer
				
				- on timeout :
					- commit state to shapes and nodes , statecounter = 0 : clear current state list

		*/
		touchedNodesLocal.current = _touchedNodes;
		/*if (nodesStateLocal.current[nodeName] != nodeState) 
		{
			console.log("nodeStateObserver", nodeName, nodeState, _touchedNodes);

			let nodeStateClass = nodeState == "error" ? "has-error" : "";
			const element = document.getElementById(nodeName);
			if (element) {
				element.classList.remove("has-error");
				if (nodeStateClass != "") {
					element.classList.add(nodeStateClass);
				}
			} 

			const shapeRef = shapeRefs.current[nodeName];
			let newShapeState = ShapeStateEnum.Default;
			if (nodeState == "ok") {
				newShapeState = ShapeStateEnum.Ok;
			} else if (nodeState == "error") {
				newShapeState = ShapeStateEnum.Error;
			}
			shapeRef.modifyShape(ModifyShapeEnum.SetState , {
				state: newShapeState
			});
		}
		*/
		
		nodesStateLocal.current[nodeName] = nodeState;		
		/*
		if (_touchedNodes) {

			Object.keys(_touchedNodes).map((touchNodeId: string) => {
				const lineRef = shapeRefs.current[touchNodeId];
				if (lineRef && lineRef && lineRef.modifyShape(ModifyShapeEnum.GetShapeType, {}) == "line") {
					return;
				}
				const element = document.getElementById(touchNodeId);
				if (element) {
					if (_touchedNodes[touchNodeId] === true) {
						element.classList.remove("untouched");
					} else {
						element.classList.add("untouched");
					}
				} else {
					if (!_touchedNodes[touchNodeId] &&
						nodesStateLocal.current[touchNodeId] != "") {
						nodesStateLocal.current[touchNodeId] = "";
						const shapeRef = shapeRefs.current[touchNodeId];
						shapeRef.modifyShape(ModifyShapeEnum.SetState , {
							state: ShapeStateEnum.Default
						});
					}
				}
			})
		}
		
		updateTouchedNodes();
		*/
	}


	const cancelScroll = () => {
		(window as any).scrollTop = 0;
		(window as any).scrollLeft = 0;
		document.body.scrollTop = 0;
	}

	useLayoutEffect(() => {
		if (canvasWrapper && canvasWrapper.current) {
			(canvasWrapper.current as any).addEventListener('wheel', wheelEvent);
		}
		window.addEventListener("resize", onResize);
		window.addEventListener("scroll", cancelScroll);
		document.addEventListener('paste', onPaste);
		updateDimensions();	        
		document.body.scrollTop = 0;

		touchedNodesStore.clearNodesTouched();
		props.flowrunnerConnector.unregisterNodeStateObserver("canvas");
		props.flowrunnerConnector.registerNodeStateObserver("canvas", nodeStateObserver);

		return () => {
			props.flowrunnerConnector.unregisterNodeStateObserver("canvas");
			window.removeEventListener("resize", onResize);
			window.removeEventListener("scroll", cancelScroll);
		}
	}, []);

	const onResize = (event) => {
		updateDimensions();
		fitStage(undefined,true,true);
	}


	useEffect(() => {
		console.log("RENDER ORDER 4");
		//(flowIsLoading as any).current = true;
		let subscription;
		if (props.canvasToolbarsubject) {
			
			subscription = props.canvasToolbarsubject.subscribe({
				next: (message: string) => {
					if (unmounted.current) {
						return;
					}
					if (message == "loadFlow") {
						console.log("RENDER ORDER 3");
						(flowIsLoading as any).current = true;
						console.log("loadflow setCanvasOpacity 0");
						setCanvasOpacity(0);
					} else
					if (message == "fitStage") {
						console.log("before fitstage", flowStore.flow);
						fitStage(undefined, true, true);
						setCanvasOpacity(1);	
					} else 
					if (message == "reload") {
						setCanvasKey(canvasKey + 1);
					} else 
					if (message == "export") {
						exportCanvas();
					}
				}
			});
			
		}
		return () => {
			if (subscription) {
				subscription.unsubscribe();
			}
		}
	}, [flowStore.flow])

	const updateTouchedNodes = () => {
		// DONT UPDATE STATE HERE!!!
		if  (touchedNodesLocal.current) {
			if (stage && stage.current) {
				let stageInstance = (stage.current as any).getStage();
				if (stageInstance) {
					Object.keys(shapeRefs.current).map((touchNodeId) => {
						const lineRef = shapeRefs.current[touchNodeId];
						if (lineRef && lineRef && lineRef.modifyShape(ModifyShapeEnum.GetShapeType, {}) == "line") {
							if (touchedNodesLocal.current[touchNodeId] ) {								
								lineRef.modifyShape(ModifyShapeEnum.SetState, {
									state: ShapeStateEnum.Touched
								});
							} else {								
								lineRef.modifyShape(ModifyShapeEnum.SetState, {
									state: ShapeStateEnum.Default
								});
							}
						}
					});
					stageInstance.batchDraw();
				}
			}
		}
	}
	
	const recalculateStartEndpoints = (doBatchdraw : boolean) => {

		const startPerf = performance.now();
		console.log("START recalculateStartEndpoints");
		flowStore.flow.map((node, index) => {
			if (node.shapeType !== "Line") {
				let shapeRef = shapeRefs.current[node.name];
				if (shapeRef && (shapeRef as any)) {						
					let element = document.getElementById(node.name);
					if (element) {
						const position = getPosition(node.name) || {x:node.x,y:node.y};
						//setHtmlElementsPositionAndScale(stageX.current, stageY.current, stageScale.current,
						//	position.x,position.y,node);


						let x = parseFloat(element.getAttribute("data-x") || "");
						let y = parseFloat(element.getAttribute("data-y") || "");
						//let top = 0;
						//let minHeight = parseFloat(element.getAttribute("data-height") || "");

						//const clientElementHeight = element.clientHeight;
						//let diffHeight = clientElementHeight - minHeight;

						if (node && element.getAttribute("data-node") == node.name) {
							//if (position.x && !isNaN(stageX.current)) {
								x = position.x;
							//}
							//if (stageY.current && !isNaN(stageY.current)) {
								y = position.y;
							//}				

							element.setAttribute("data-x", x.toString()); 
							element.setAttribute("data-y", y.toString());
						}

						const nodeName = element.getAttribute("data-node") || "";
						/*(element as any).style.transform = 						
							"translate(" + (stageX.current  - x * stageScale.current) + "px," + 
								(stageY.current - y * stageScale.current) + "px) "+
							"scale(" + (stageScale.current) + "," + (stageScale.current) + ") ";	
						*/
						setHtmlElementStyle(element, stageX, stageY, stageScale, x, y);

						setNewPositionForNode(node, (shapeRef as any), {x:position.x,y:position.y}, false, true, doBatchdraw , true);
					}
				}
			}
		});
		console.log("recalculateStartEndpoints", performance.now() - startPerf);

		if (!!doBatchdraw && stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance) {
				stageInstance.batchDraw();
			}
		}		
	}	

	useLayoutEffect(() => {

		window.addEventListener("resize", onResize);
		
		const lineRef = shapeRefs.current[connectionForDraggingName];
		if (lineRef && lineRef) {
			lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 0});
		}

		const startPerf = performance.now();
		if (props.flow && props.flow.length > 0) {
						

			if (props.flowState == FlowState.loading || props.flowState == FlowState.idle) {
				setCanvasOpacity(0);
				(flowIsLoading as any).current = true;
			} else
			if (props.flowState == FlowState.loaded && (flowIsLoading as any).current) {
				if (canvasOpacity == 0) {
					setCanvasOpacity(1);
				}
				(flowIsLoading as any).current = false;
				flowIsFittedStageForSingleNode.current = true;

				console.log("FLOW CANVAS INITIALIZE TIME - START" , performance.now());
				let perfstart = performance.now();

				clearPositions();

				console.log("flow canvas initialize time - clearPositions", (performance.now() - perfstart) + "ms");
				perfstart = performance.now();
				
				flowStore.flow.map((node, index) => {					

					if (node.x && node.y) {						
						setPosition(node.name , {
							x:node.x,
							y:node.y
						});
					}
					if (node.xstart && node.ystart) {						
						setPosition(node.name , {
							xstart: node.xstart,
							ystart: node.ystart,
							xend: node.xend,
							yend: node.yend
						});
					}
				});

				console.log("flow canvas initialize time - setPositions", (performance.now() - perfstart) + "ms");
				perfstart = performance.now();
				
				nodesStateLocal.current = {};
				touchedNodesLocal.current = {};

				fitStage(undefined, false, false);

				if (stage && stage.current) {
					let stageDiv = (stage.current as any);
					if (stageDiv && stageDiv.attrs["container"]) {
						// trick to allow keyboard events on parent without
						// needing to click the div first
						stageDiv.attrs["container"].parentNode.focus();				
					}
				}				

				console.log("flow canvas initialize time - setHtmlElementsPositionAndScale PRE", (performance.now() - perfstart), "ms");

				setHtmlElementsPositionAndScale(stageX.current, stageY.current, stageScale.current);
				console.log("flow canvas initialize time - setHtmlElementsPositionAndScale", (performance.now() - perfstart) , "ms");
				recalculateStartEndpoints(false);

				console.log("flow canvas initialize time - recalculateStartEndpoints", (performance.now() - perfstart) , "ms");
				
			} else if (props.flowState == FlowState.loaded && !(flowIsLoading as any).current) {

				if (flowStore.flow.length == 1) {
					if (!flowIsFittedStageForSingleNode.current) {
						fitStage(undefined, false, false);
						flowIsFittedStageForSingleNode.current = true;
					}
				}				
				
				setHtmlElementsPositionAndScale(stageX.current, stageY.current, stageScale.current);
				recalculateStartEndpoints(false);

			}
			touchedNodesStore.setNodesTouched(touchedNodesLocal.current);
			
			let disabledUpdateTouchedState = false;
			flowStore.flow.map((node, index) => {
				if (node.taskType === "TimerTask" || 
					(node.taskType == "DebugTask" && 
						node.visualizer == "animatedgridcanvas")) {
					disabledUpdateTouchedState = true;
				}
			});

			if (!!disabledUpdateTouchedState) {
				setUpdateNodeTouchedState(false);
			} else {
				setUpdateNodeTouchedState(true);
			}			
		} else if (flowStore && flowStore.flow.length == 0) {
			flowIsFittedStageForSingleNode.current = false;

			if (props.flowState == FlowState.loaded) {
				if (canvasOpacity == 0) {
					setCanvasOpacity(1);
				}
			}
		}	
				
		let stageInstance = (stage.current as any).getStage();
		stageInstance.batchDraw();
		updateTouchedNodes();	

		console.log("uselayouteffect flow", performance.now() - startPerf);

		return () => {
			//props.flowrunnerConnector.unregisterNodeStateObserver("canvas");

			document.removeEventListener('paste', onPaste);

			window.removeEventListener("resize", onResize);
			//(refs.canvasWrapper as any).removeEventListener('wheel', wheelEvent);
			
		}
	}, [props.flowState, flowStore.flow]);

	useLayoutEffect(() => {

		console.log("CANVAS useLayoutEffect3" , performance.now());

		updateDimensions();			

		if (canvasWrapper && canvasWrapper.current) {
			(canvasWrapper.current as any).removeEventListener('wheel', wheelEvent);
			(canvasWrapper.current as any).addEventListener('wheel', wheelEvent);
		}

		updateTouchedNodes();
		return () => {
			if (canvasWrapper && canvasWrapper.current) {
				(canvasWrapper.current as any).removeEventListener('wheel', wheelEvent);
			}
		}
	}, [canvasKey]);

	useLayoutEffect(() => {	
		console.log("CANVAS useLayoutEffect2" , performance.now());
		updateTouchedNodes();
	}, [
		canvasMode,
		props.canvasToolbarsubject,
		stageWidth,
		stageHeight,
		canvasOpacity,
		showNodeSettings,
		editNode,
		editNodeSettings,
		isConnectingNodesByDragging,
		connectionX,
		connectionY
	]);
	
	const setNewPositionForNode = (node, group, position? : any, isCommitingToStore? : boolean, linesOnly? : boolean, doDraw?: boolean, skipSetHtml?: boolean) => {
		const unselectedNodeOpacity = 0.15;
//console.log("setNewPositionForNode" , performance.now());
		if (!linesOnly) {
			flowStore.flow.map((flowNode) => {
				if (flowNode.name !== node.name) {
					// node is not selected or handled by this setNewPositionForNode call
					if (shapeRefs.current[flowNode.name]) {
						const shape = (shapeRefs.current[flowNode.name] as any);
						if (shape) {
							//shape.modifyShape(ModifyShapeEnum.SetOpacity,{opacity:unselectedNodeOpacity});					
						}				
					}
					const element = document.getElementById(flowNode.name);
					if (element) {
						element.style.opacity = "1"//;"0.5";
					} 
				}
			});
		}
		let resultXY = group && group.modifyShape(ModifyShapeEnum.GetXY,{});
		const x = resultXY ? resultXY.x : 0;
		const y = resultXY ? resultXY.y : 0;
		let newPosition = position || {x:x, y:y};
				

		if (newPosition && !linesOnly) {
			if (stage && stage.current) {
				let stageInstance = (stage.current as any).getStage();
				if (stageInstance) {
					var touchPos = stageInstance.getPointerPosition();
					const scaleFactor = (stageInstance as any).scaleX();

					newPosition.x = ((touchPos.x - (stageInstance).x()) / scaleFactor) - mouseStartX.current;
					newPosition.y = ((touchPos.y - (stageInstance).y()) / scaleFactor) - mouseStartY.current;
				}
			}

			if (shapeRefs.current[node.name]) {
				if ((shapeRefs.current[node.name] as any)) {
					let currentGroup = (shapeRefs.current[node.name] as any);
					currentGroup.modifyShape(ModifyShapeEnum.SetXY, newPosition);					
					currentGroup.modifyShape(ModifyShapeEnum.SetOpacity, {opacity:1});					
				
					const shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);	

					let currentGroupThumbs = shapeRefs.current["thumb_" + node.name] as any;
					if (currentGroupThumbs) {

						const thumbPosition = FlowToCanvas.getThumbEndPosition(shapeType, newPosition);
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

						const thumbPosition = FlowToCanvas.getThumbStartPosition(shapeType, newPosition, 0, ThumbPositionRelativeToNode.top);

						currentGroupThumbs.modifyShape(ModifyShapeEnum.SetXY, thumbPosition);					
						currentGroupThumbs.modifyShape(ModifyShapeEnum.SetOpacity, {opacity:1});					

					}
					currentGroupThumbs = (shapeRefs.current["thumbstartbottom_" + node.name] as any);
					if (currentGroupThumbs) {

						const thumbPosition = FlowToCanvas.getThumbStartPosition(shapeType, newPosition, 0, ThumbPositionRelativeToNode.bottom);

						currentGroupThumbs.modifyShape(ModifyShapeEnum.SetXY, thumbPosition);					
						currentGroupThumbs.modifyShape(ModifyShapeEnum.SetOpacity, {opacity:1});					

					}

					const settings = ShapeSettings.getShapeSettings(node.taskType, node);
					// TODO : set some state here?? which state ?
					/*currentGroup.children.map((childNode) => {
						const childType = childNode.getClassName();
						if (childType == "Rect" || childType == "Circle" || childType == "Ellipse" || childType=="RegularPolygon") {
							childNode.fill(settings.fillSelectedColor);
						}
					});
					*/
					const element = document.getElementById(node.name);
					if (element) {
						element.style.opacity = "1";
					} 
				}				
			} 
		}
		
		setPosition(node.name, {...newPosition});
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
				const newStartPosition =  FlowToCanvas.getStartPointForLine(node, newPosition, lineNode, props.getNodeInstance,
					lineNode.thumbPosition as ThumbPositionRelativeToNode);
				/*
					TODO : get node by lineNode.endshapeid
					endNode = flowHashMap.current[lineNode.endshapeid]
				*/
				/*let endNodes = flow.flow.filter((node) => {
					return node.name == lineNode.endshapeid;
				})
				let endNode = endNodes[0];
				*/
				let endNode = flowStore.flow[flowStore.flowHashmap.get(lineNode.endshapeid).index];
				if (endNode) {
					const positionNode = getPosition(endNode.name) || endNode;
					const newEndPosition =  FlowToCanvas.getEndPointForLine(endNode, {
						x: positionNode.x,
						y: positionNode.y
					}, node, props.getNodeInstance);

					const lineRef = shapeRefs.current[lineNode.name];
					if (lineRef && (lineRef as any)) {

						let controlPoints = calculateLineControlPoints(
							newStartPosition.x, newStartPosition.y, 
							newEndPosition.x, newEndPosition.y,
							lineNode.thumbPosition as ThumbPositionRelativeToNode
							);				

						lineRef.modifyShape(ModifyShapeEnum.SetPoints, {points:[newStartPosition.x, newStartPosition.y,
							controlPoints.controlPointx1, controlPoints.controlPointy1,
							controlPoints.controlPointx2, controlPoints.controlPointy2,
							newEndPosition.x, newEndPosition.y]});					
						//lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity:1});	
					}
					const endNodeRef = shapeRefs.current[lineNode.endshapeid] as any;
					if (endNodeRef && endNodeRef) {					
						endNodeRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity:1});	
					}

					setPosition(lineNode.name, {
						xstart: newStartPosition.x, ystart: newStartPosition.y,
						xend: newEndPosition.x, yend: newEndPosition.y
					});

				}
				lines[lineNode.name] = {x: newStartPosition.x, y: newStartPosition.y};
			})
		}

		const endLines = FlowToCanvas.getLinesForEndNodeFromCanvasFlow(flowStore.flow, node, flowStore.flowHashmap);
		if (endLines) {
			
			endLines.map((lineNode) => {
				const newEndPosition =  FlowToCanvas.getEndPointForLine(node, newPosition, lineNode, props.getNodeInstance);

				const positionLine = getPosition(lineNode.name) || lineNode;
				let startPos = {
					x : positionLine.xstart,
					y : positionLine.ystart
				};

				/*
				let startNodes = flow.flow.filter((node) => {
					return node.name == lineNode.startshapeid;
				})
				let startNode = startNodes[0];
				*/
				let startNode = flowStore.flow[flowStore.flowHashmap.get(lineNode.startshapeid).index];	
				//console.log("startNode" , startNode, lineNode.startshapeid, lineNode, endLines);	
				if (startNode) {
					const positionNode = getPosition(startNode.name) || startNode;
					let newStartPosition =  FlowToCanvas.getStartPointForLine(startNode, {
							x: positionNode.x,
							y: positionNode.y
						}, lineNode, props.getNodeInstance,
						lineNode.thumbPosition as ThumbPositionRelativeToNode);

					if (lines[lineNode.name]) {
						newStartPosition = lines[lineNode.name];					
					}

					const lineRef = shapeRefs.current[lineNode.name] as any;
					if (lineRef && lineRef) {

						let controlPoints = calculateLineControlPoints(
							newStartPosition.x, newStartPosition.y, 
							newEndPosition.x, newEndPosition.y,
							lineNode.thumbPosition as ThumbPositionRelativeToNode);

						lineRef.modifyShape(ModifyShapeEnum.SetPoints, {points:[newStartPosition.x, newStartPosition.y,
							controlPoints.controlPointx1, controlPoints.controlPointy1,
							controlPoints.controlPointx2, controlPoints.controlPointy2,
							newEndPosition.x, newEndPosition.y]});					
						//lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity:1});
					}
					
					setPosition(lineNode.name, {
						xstart: newStartPosition.x, ystart: newStartPosition.y,
						xend: newEndPosition.x, yend: newEndPosition.y
					});

					const startNodeRef = shapeRefs.current[lineNode.startshapeid] as any;
					if (startNodeRef && startNodeRef) {
						startNodeRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity:1});
					}					
				}
			})
		}
		
		if (!!doDraw) {
			let stageInstance = (stage.current as any).getStage();
			stageInstance.batchDraw();
			updateTouchedNodes();
		}

		if (!!isCommitingToStore) {
			// possible "performance"-dropper
			selectedNode.selectNode(node.name, node);
			canvasMode.setConnectiongNodeCanvasMode(false);
			if (props.flowrunnerConnector.hasStorageProvider) {
				props.saveFlow();
				//flowStore.storeFlowNode({...node,x:newPosition.x,y:newPosition.y}, node.name);
				
			}
		}
	}

	const onCloneNode = (node, event) => {
		event.preventDefault();
		let newNode = getNewNode({...node}, flowStore.flow);
		console.log("newnode", newNode.name, flowStore.flow);
		newNode.x = newNode.x + 100;
		newNode.y = newNode.y + 100;
		
		setPosition(newNode.name, {
			x: newNode.x,
			y: newNode.y
		});

		flowStore.addFlowNode(newNode);
		return false;
	}

	const onShowNodeSettings = (node, settings, event) => {
		event.preventDefault();
		setEditNode(node);
		setEditNodeSettings(settings);
		setShowNodeSettings(true);
		return false;
	}

	const onCloseEditNodeSettings = () => {
		setShowNodeSettings(false);
		setEditNode(undefined);
		setEditNodeSettings(undefined);
	}

	const downloadURI = (uri, name) => {
		let link = document.createElement('a');
		link.download = name;
		link.href = uri;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);			
	}

	const exportCanvas = () => {	
		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			var dataURL = stageInstance.toDataURL({ pixelRatio: 6 });
			downloadURI(dataURL, 'flow.png');
		}
	}

	const onClickSetup = (node,settings,event)=>  {
		if (node.notSelectable) {
			return false;
		}
		event.evt.preventDefault();
		setEditNode(node);
		setEditNodeSettings(settings);
		setShowNodeSettings(true);
		return false;
	}

	const onMouseOver = (node, event) => {
		if (node.notSelectable) {
			return false;
		}
        document.body.style.cursor = 'pointer';
	}
	
	const onMouseOut = () => {
        document.body.style.cursor = 'default';
	}

	
	const determineStartPosition = (group) => {
		const x = group.attrs["x"];
		const y = group.attrs["y"];
		let newPosition = {x:x, y:y};
		
		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance) {
				var touchPos = stageInstance.getPointerPosition();
				const scaleFactor = (stageInstance as any).scaleX();

				newPosition.x = ((touchPos.x - (stageInstance).x()) / scaleFactor);
				newPosition.y = ((touchPos.y - (stageInstance).y()) / scaleFactor);
					
				mouseStartX.current = newPosition.x - x;
				mouseStartY.current = newPosition.y - y;
			}
		}
	}

	const onMouseStart = (node, event) => {
		if (!!canvasMode.isConnectingNodes) {
			cancelDragStage();
			return false;
		}

		if (isConnectingNodesByDraggingLocal.current) {
			cancelDragStage();
			return false;
		}

		if (isPinching.current) {
			cancelDragStage();
			return;			
		}

		event.evt.preventDefault();
		event.evt.cancelBubble = true;		

		touching.current = true;
		touchNode.current = node;
		touchNodeGroup.current = event.currentTarget;
		if (event.currentTarget) {
			determineStartPosition(event.currentTarget);
		}

		return false;

	}

	const onMouseMove = (node, event) => {
		if (node && touching.current && touchNode.current && 
				node.name !== (touchNode.current as any).name) {
			return;
		}

		if (isConnectingNodesByDraggingLocal.current) {
			return;
		}

		if (isPinching.current) {
			return;			
		}

		event.evt.preventDefault();
		event.evt.cancelBubble = true;	

		if (!!canvasMode.isConnectingNodes) {
			cancelDragStage();
			return false;
		}

		if (touching.current) {
			if (event.currentTarget) {
				mouseDragging.current = true;
				document.body.classList.add("mouse--moving");
				setNewPositionForNode(node, shapeRefs.current[node.name], event.evt.screenX ? {
					x: event.evt.screenX,
					y: event.evt.screenY
				} : undefined, false, false, true);
			}
		}
		
		return false;
	}

	const connectConnectionToNode = (node) => {
		let eventHelper : any = undefined;
		if (connectionNodeEventName !== undefined &&
			connectionNodeEventName.current !== "" && 
			!isNaN(connectionNodeEvent.current as number)) {
			eventHelper = {};
			eventHelper.event = connectionNodeEventName.current;
		}

		const connection = getNewConnection(touchNode.current, node, props.getNodeInstance, eventHelper,
			connectionNodeThumbPositionRelativeToNode.current);
		
		(connection as any).thumbPosition = connectionNodeThumbPositionRelativeToNode.current;

		if (connectionNodeFollowFlow.current == ThumbFollowFlow.happyFlow) {
			(connection as any).followflow = "onsuccess";
		} else
		if (connectionNodeFollowFlow.current == ThumbFollowFlow.unhappyFlow) {
			(connection as any).followflow = "onfailure";
		}
		 
		if (connectionNodeEventName.current !== "" && 
			!isNaN(connectionNodeEvent.current as number)) {
			(connection as any).event = connectionNodeEventName.current; // this is an object not a string!!
			console.log("connectionNodeEventName is object or string?", connectionNodeEventName);
		}
		touching.current = false
		isConnectingNodesByDraggingLocal.current = false;
		connectionNodeEvent.current = false;

		connectionNodeThumbPositionRelativeToNode.current = ThumbPositionRelativeToNode.default;
		connectionNodeFollowFlow.current = ThumbFollowFlow.default;

		connectionNodeEventName.current = "";
		(touchNode.current as any) = undefined;
		touchNodeGroup.current = undefined;

		const lineRef = shapeRefs.current[connectionForDraggingName];
		if (lineRef && lineRef) {
			lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 0});
		}

		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance) {
				stageInstance.batchDraw();
			}
		}

		document.body.classList.remove("connecting-nodes");
		mouseDragging.current = false;
		
		setPosition(connection.name, {
			xstart: connection.xstart,
			ystart: connection.ystart,
			xend: connection.xend,
			yend: connection.yend
		});

		flowStore.addConnection(connection);
		canvasMode.setConnectiongNodeCanvasMode(false);
	}

	const onMouseEnd = (node, event) => {

		if (isPinching.current) {
			return;			
		}

		if (isConnectingNodesByDraggingLocal.current && touchNode.current && node) {			
			connectConnectionToNode(node);
			return false;
		}
		document.body.classList.remove("mouse--moving");

		event.evt.preventDefault();
		event.evt.cancelBubble = true;
	
		if (touchNodeGroup.current != event.currentTarget) {
			return false;
		}
		if (!!canvasMode.isConnectingNodes) {
			return false;
		}

		touching.current = false;
		dragTime.current = undefined;
		
		touchNodeGroup.current = undefined;
		if (event.currentTarget && mouseDragging.current) {
			setNewPositionForNode(node, shapeRefs.current[node.name], undefined, true, false, true);
		} else {
			selectedNode.selectNode(node.name, node);
			canvasMode.setConnectiongNodeCanvasMode(false);
		}
		(touchNode.current as any) = undefined;
		mouseDragging.current = false;
		return false;
	};

	const onStageMouseEnd = (event) => {

		if (isPinching.current) {
			isPinching.current = false;
			return;			
		}

		if (touching.current || isConnectingNodesByDraggingLocal.current) {
			cancelDragStage();
			if (stage && stage.current) {
				let stageInstance = (stage.current as any).getStage();

				dragTime.current = undefined;
				touching.current = false;
				event.evt.preventDefault();
				event.evt.cancelBubble = true;

				(touchNode.current as any) = undefined;
				touchNodeGroup.current = undefined;
				isConnectingNodesByDraggingLocal.current = false;
				connectionNodeEvent.current = false;
				connectionNodeEventName.current = "";
				
				connectionNodeThumbPositionRelativeToNode.current = ThumbPositionRelativeToNode.default;
				connectionNodeFollowFlow.current = ThumbFollowFlow.default;

				document.body.classList.remove("connecting-nodes");
				document.body.classList.remove("mouse--moving");

				const lineRef = shapeRefs.current[connectionForDraggingName];
				if (lineRef && lineRef) {
					lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 0});				
				}
		
				if (stageInstance) {
					stageInstance.batchDraw();
				}
			}
			return false;
		}

	}

	const onStageMouseLeave = (event) => {
		console.log("onStageMouseLeave");
		event.evt.preventDefault();
		event.evt.cancelBubble = true;
		
		const lineRef = shapeRefs.current[connectionForDraggingName];
		if (lineRef && lineRef) {
			lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 0});
			if (stage && stage.current) {
				let stageInstance = (stage.current as any).getStage();
				if (stageInstance !== undefined) {
					stageInstance.batchDraw();
				}
			}
		}
		isConnectingNodesByDraggingLocal.current = false;
		connectionNodeEvent.current = false;
		connectionNodeEventName.current = "";
		
		connectionNodeThumbPositionRelativeToNode.current = ThumbPositionRelativeToNode.default;
		connectionNodeFollowFlow.current = ThumbFollowFlow.default;

		document.body.classList.remove("connecting-nodes");
		document.body.classList.remove("mouse--moving");
		touching.current = false;
		dragTime.current = undefined;
		(touchNode.current as any) = undefined;
		touchNodeGroup.current = undefined;
		isPinching.current = false;
		
		return false;
	}

	const onMouseLeave = (node, event) => {
		return;
		/*
		(canvasWrapper.current).classList.remove("mouse--moving");

		event.evt.preventDefault();
		event.evt.cancelBubble = true;
		
		if (touchNodeGroup != event.currentTarget) {
			return false;
		}
		if (!!canvasMode.isConnectingNodes) {
			return false;
		}

		touching.current = false;
		dragTime.current = undefined;
		touchNode.current = undefined;
		touchNodeGroup.current = undefined;
		return false;
		*/
	}

	
	const onStageTouchStart = (event) => {
		isPinching.current = false;
		if (!!canvasMode.isConnectingNodes) {
			cancelDragStage();
			return false;
		}
		if (touchNode.current && touchNodeGroup.current) {
			cancelDragStage();
		} else {
			if (event.evt.touches.length > 1) {
				isPinching.current = true;
				cancelDragStage();

				if (event.evt.touches.length == 2) {
					pinchStartPosition.current = {
						x: (event.evt.touches[0].screenX + event.evt.touches[1].screenX)/2,
						y: (event.evt.touches[0].screenY + event.evt.touches[1].screenY)/2
					};
					
					console.log("touch pinching", pinchStartPosition.current);

					const x = event.evt.touches[0].screenX - event.evt.touches[1].screenX;
					const y = event.evt.touches[0].screenY - event.evt.touches[1].screenY;
					 
					startDistance.current = Math.sqrt( x*x + y*y );
				}
			}
		}
	}

	const onStageTouchMove = (event) => {
		if (isConnectingNodesByDraggingLocal.current) {
			//event.evt.preventDefault();
			event.evt.cancelBubble = true;
			//cancelDragStage();

			if (stage && stage.current) {
				let stageInstance = (stage.current as any).getStage();
				if (stageInstance) {
					var touchPos = stageInstance.getPointerPosition();
					const scaleFactor = (stageInstance as any).scaleX();
	
					let newPosition = {
						x: 0,
						y: 0
					};
					newPosition.x = ((touchPos.x - (stageInstance).x()) / scaleFactor);
					newPosition.y = ((touchPos.y - (stageInstance).y()) / scaleFactor);
					
					const lineRef = shapeRefs.current[connectionForDraggingName];
					if (lineRef && lineRef) {
	
						let controlPoints = calculateLineControlPoints(
							connectionXStart.current, connectionYStart.current, 
							newPosition.x, newPosition.y,
							connectionNodeThumbPositionRelativeToNode.current as ThumbPositionRelativeToNode);
							
						lineRef.modifyShape(ModifyShapeEnum.SetPoints, {points: [connectionXStart.current, connectionYStart.current,
							controlPoints.controlPointx1, controlPoints.controlPointy1,
							controlPoints.controlPointx2, controlPoints.controlPointy2,
							newPosition.x, newPosition.y]});
						lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 1});
						stageInstance.batchDraw();
					}
				}
			}
			return;
		}

		if (!!canvasMode.isConnectingNodes) {
			cancelDragStage();
			return false;
		}
		
		if (touchNode.current && touchNodeGroup.current && !isPinching.current)  {			
			event.evt.preventDefault();
			event.evt.cancelBubble = true;
			
			setNewPositionForNode(touchNode.current, shapeRefs.current[(touchNode.current as any).name], event.evt.screenX ? {
				x: event.evt.screenX,
				y: event.evt.screenY
			} : undefined, false, false, true);
			
			cancelDragStage();
			return false;
		} else {
			
			if (isPinching.current && event.evt.touches && event.evt.touches.length > 1) {
				cancelDragStage();
				event.evt.preventDefault();
				event.evt.cancelBubble = true;

				/*
					deltaY
					toElement
				*/

				if (event.evt.touches.length == 2) {
					const x = event.evt.touches[0].screenX - event.evt.touches[1].screenX;
					const y = event.evt.touches[0].screenY - event.evt.touches[1].screenY;

					let newDistance = Math.sqrt( x*x + y*y );
					
					
					wheelEvent(
						{
							deltaY: newDistance - startDistance.current,
							toElement: undefined
						},
						pinchStartPosition.current
					)
				}

				
				return false;
			}

			//console.log("moving", event.evt.touches && event.evt.touches.length > 0 ? event.evt.touches[0] : undefined);
		}
	}

	const onStageTouchEnd = (event) => {
		isPinching.current = false;
		if (!mouseDragging.current) {
			if (touchNode.current && touchNodeGroup.current) {
				selectedNode.selectNode((touchNode.current as any).name, touchNode.current as any);
				canvasMode.setConnectiongNodeCanvasMode(false);
			}
		}

	}

	const cancelDragStage = () => {
		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance) {
				stageInstance.stopDrag();
			}
		}
	}

	const onTouchStart = (node, event) => {

		if (isPinching.current) {
			return;			
		}
		if (!!canvasMode.isConnectingNodes) {			
			return false;
		}
		if (isConnectingNodesByDraggingLocal.current) {
			return false;
		}

		touching.current = true;
		event.evt.preventDefault();
		event.evt.cancelBubble = true;
		
		touchNode.current = node;
		touchNodeGroup.current = event.currentTarget;

		cancelDragStage();	
		
		if (event.currentTarget) {
			determineStartPosition(event.currentTarget);
		}

		return false;
	}

	const onTouchMove = (node, event) => {
		if (!!canvasMode.isConnectingNodes) {			
			return false;
		}

		if (isConnectingNodesByDraggingLocal.current) {
			return false;
		}
		
		if (isPinching.current) {
			return;			
		}

		if (touchNodeGroup.current != event.currentTarget) {
			return false;
		}

		touching.current = true;
		event.evt.preventDefault();
		event.evt.cancelBubble = true;
		if (event.currentTarget) {
			mouseDragging.current = true;
			setNewPositionForNode(node, shapeRefs.current[node.name], event.evt.touches.length > 0 ? {
				x: event.evt.touches[0].screenX,
				y: event.evt.touches[0].screenY
			} : undefined, false, false, true);
		}
		return false;
	}

	const onTouchEnd = (node, event) => {

		if (isPinching.current) {
			return;			
		}
		
		if (!!canvasMode.isConnectingNodes) {			
			return false;
		}

		if (isConnectingNodesByDraggingLocal.current) {
			return false;
		}
		
		if (touchNodeGroup.current != event.currentTarget) {
			return false;
		}

		touching.current = false;
		dragTime.current = undefined;
		(touchNode.current as any) = undefined;
		touchNodeGroup.current = undefined;

		event.evt.preventDefault();
		event.evt.cancelBubble = true;
		
		if (event.currentTarget) {
			if (mouseDragging.current) {
				setNewPositionForNode(node, shapeRefs.current[node.name], event.evt.changedTouches.length > 0 ? {
					x: event.evt.changedTouches[0].screenX,
					y: event.evt.changedTouches[0].screenY
				} : undefined, false, false, true);
			} else {
				selectedNode.selectNode(node.name, node);
				canvasMode.setConnectiongNodeCanvasMode(false);
			} 
		}

		mouseDragging.current = false;
		return false;
	}

	const onMouseConnectionStartOver = (node, nodeEvent, event) => {
		if (node.notSelectable) {
			return false;
		}
		document.body.style.cursor = 'pointer';		
	}

	const onMouseConnectionStartOut= (node, nodeEvent, event) => {
		document.body.style.cursor = 'default';
	}


	const onMouseConnectionStartStart = (node, nodeEvent, nodeEventName, 
		followFlow: ThumbFollowFlow,
		thumbPositionRelativeToNode : ThumbPositionRelativeToNode, event) => {
		if (isConnectingNodesByDraggingLocal.current) {
			return false;
		}
		if (!!canvasMode.isConnectingNodes) {
			return false;
		}
		if (node && touching.current && touchNode.current) {
			return;
		}
		(isConnectingNodesByDraggingLocal.current as any) = true;
		connectionNodeEvent.current = nodeEvent;
		connectionNodeEventName.current = nodeEventName;

		connectionNodeFollowFlow.current = followFlow;
		connectionNodeThumbPositionRelativeToNode.current = thumbPositionRelativeToNode;

		document.body.classList.add("connecting-nodes");

		touchNode.current = node;
		touchNodeGroup.current = event.currentTarget;

		const x = (touchNodeGroup.current as any).attrs["x"];
		const y = (touchNodeGroup.current as any).attrs["y"];

		let newPosition = {
			x: 0,
			y: 0
		};

		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stage) {
				var touchPos = stageInstance.getPointerPosition();
				const scaleFactor = (stageInstance as any).scaleX();

				newPosition.x = ((touchPos.x - (stageInstance).x()) / scaleFactor);
				newPosition.y = ((touchPos.y - (stageInstance).y()) / scaleFactor);
				connectionXStart.current = newPosition.x;
				connectionYStart.current = newPosition.y;				
			}
		}		
	}

	const onMouseConnectionStartMove = (node, nodeEvent, event) => {
		if (!!canvasMode.isConnectingNodes) {
			return false;
		}
		if (node && touching.current && touchNode.current) {
			return;
		}
		
		event.evt.cancelBubble = true;		
	}

	const onMouseConnectionStartEnd = (node, nodeEvent, thumbPositionRelativeToNode : ThumbPositionRelativeToNode , event) => {
		if (!!canvasMode.isConnectingNodes) {
			return false;
		}
		if (node && touching.current && touchNode.current) {
			return;
		}
	}

	const onMouseConnectionEndOver = (node, nodeEvent, event) => {
		if (node.notSelectable) {
			return false;
		}
		document.body.style.cursor = 'pointer';	
	}

	const onMouseConnectionEndOut = (node, nodeEvent, event) => {
		document.body.style.cursor = 'default';
	}

	const onMouseConnectionEndStart = (node, nodeEvent, event) => {
		if (!!canvasMode.isConnectingNodes) {
			return false;
		}
		if (node && touching.current && touchNode.current && !isConnectingNodesByDraggingLocal.current) {
			return;
		}
	}

	const onMouseConnectionEndMove = (node, nodeEvent, event) => {
		if (!!canvasMode.isConnectingNodes) {
			return false;
		}
		if (node && touching.current && touchNode.current && !isConnectingNodesByDraggingLocal.current) {
			return;
		}
	}

	const onMouseConnectionEndEnd = (node, nodeEvent,event) => {
		if (!!canvasMode.isConnectingNodes) {
			return false;
		}
		if (node && touching.current && touchNode.current && !isConnectingNodesByDraggingLocal.current) {
			return;
		}
		if (isConnectingNodesByDraggingLocal.current && touchNode.current && node) {
			connectConnectionToNode(node);
		}
	}

	const onMouseConnectionEndLeave = (node,nodeEvent, event) => {
		//
	}

	let draggingWhileTouching = useRef(false);
	const onDragStart= (node, event) => {
		if (touching.current) {
			draggingWhileTouching.current = true;
			if (event.evt && event.evt.cancelBubble) {
				event.evt.cancelBubble = true;
			}
			if (event && event.cancelBubble) {
				event.cancelBubble = true;
			}
			return false;
		}
	}

	const onDragMove = (node, event) => {
		if (touching.current) {
			draggingWhileTouching.current = true;
			return false;
		}
		setNewPositionForNode(node, shapeRefs.current[node.name], false, false, true);		
	}

	const onDragEnd = (node, event) => {
		if (touching.current || draggingWhileTouching.current) {
			draggingWhileTouching.current = false;
			return false;
		}

		dragTime.current = undefined;
		setNewPositionForNode(node, shapeRefs.current[node.name]);

		let stageInstance = (stage.current as any).getStage();
		stageInstance.batchDraw();
		updateTouchedNodes();

		// event.currentTarget points to the "Group" in the actual shape component
		// the Group is the draggable part of the shape component
		// it has a property "attrs" which contains properties x,y,data-id etc
		// so... no need for refs here probably

		// node is the reference to the node from the flow

	}

	const onClickShape = (node, event) => {
		event.cancelBubble = true;
		event.evt.preventDefault();
		cancelDragStage();

		if (isConnectingNodesByDraggingLocal.current && touchNode.current && node) {
			connectConnectionToNode(node);
			return false;
		}

		if ((!!canvasMode.isConnectingNodes || !!shiftDown.current) && 
			selectedNode !== undefined &&
			selectedNode.node !== undefined &&
			(selectedNode.node as any).shapeType !== "Line") {

			const connection = getNewConnection(selectedNode.node, node, props.getNodeInstance,
				connectionNodeThumbPositionRelativeToNode.current);			

			if (connectionNodeFollowFlow.current == ThumbFollowFlow.happyFlow) {
				(connection as any).followflow = "onsuccess";
			} else
			if (connectionNodeFollowFlow.current == ThumbFollowFlow.unhappyFlow) {
				(connection as any).followflow = "onfailure";
			}
			flowStore.addConnection(connection);
			canvasMode.setConnectiongNodeCanvasMode(false);
		}

		selectedNode.selectNode(node.name, node);
		canvasMode.setConnectiongNodeCanvasMode(false);

		return false;		
	}

	const onClickLine = (node, event) => {
		event.cancelBubble = true;
		event.evt.preventDefault();
		cancelDragStage();
		if (node.notSelectable) {
			return false;
		}
		canvasMode.setConnectiongNodeCanvasMode(false);
		selectedNode.selectNode(node.name, node);
console.log("onclickline", selectedNode.node, !!selectedNode.node.name);
		return false;
	}

	const onDragStageMove = (event) => {

		if (isPinching.current) {
			return;			
		}

		if (!!canvasMode.isConnectingNodes) {			
			return false;
		}


		if (touching.current || draggingWhileTouching.current) {
			if (event.target && event.target.stopDrag) {
				//event.target.stopDrag();
			}

			if (event.evt && event.evt.cancelBubble) {
				event.evt.cancelBubble = true;
			}
			if (event && event.cancelBubble) {
				event.cancelBubble = true;
			}

			return false;
		}
		
		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance) {
				stageX.current = stageInstance.x();
				stageY.current = stageInstance.y();
				stageScale.current = stageInstance.scale().x;

				setHtmlElementsPositionAndScale(stageX.current, stageY.current, stageScale.current);						
			}
		}
	}

	const onDragStageEnd = (event) => {

		if (isPinching.current) {
			return;			
		}

		if (!!canvasMode.isConnectingNodes) {			
			return false;
		}

		if (event.evt && event.evt.cancelBubble) {
			event.evt.cancelBubble = true;
		}
		if (event && event.cancelBubble) {
			event.cancelBubble = true;
		}

		if (touching.current || draggingWhileTouching.current) {
			return false;
		}

		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance) {
				stageX.current = stageInstance.x();
				stageY.current = stageInstance.y();
				stageScale.current = stageInstance.scale().x;

				setHtmlElementsPositionAndScale(stageX.current, stageY.current, stageScale.current);
			}
		}
	}

	const setHtmlElementsPositionAndScale = (stageX, stageY, stageScale, newX? : number, newY?: number, node? : any, repositionSingleNode? : boolean) => {
		
		let nodeElements = document.querySelectorAll(".canvas__html-shape");
		const elements = Array.from(nodeElements);
		const startPerf = performance.now();

		for (var element of elements) {
			let x = parseFloat(element.getAttribute("data-x") || "");
			let y = parseFloat(element.getAttribute("data-y") || "");
			//let top = 0;
			//let minHeight = parseFloat(element.getAttribute("data-height") || "");

			const clientElementHeight = element.clientHeight;
			//let diffHeight = clientElementHeight - minHeight;

			if (node && element.getAttribute("data-node") == node.name) {
				if (newX && !isNaN(newX)) {
					x = newX;
				}
				if (newY && !isNaN(newY)) {
					y = newY;
				}				

				element.setAttribute("data-x", x.toString()); 
				element.setAttribute("data-y", y.toString());
			}

			const nodeName = element.getAttribute("data-node") || "";
			setHtmlElementStyle(element, stageX, stageY, stageScale, x, y);				
		}

		// see also recalculateStartEndpoints

		//console.log("setHtmlElementsPositionAndScale performance", performance.now() - startPerf);
		
	}

	const setHtmlElementStyle = (element, stageX, stageY, stageScale, x, y) => {
		(element as any).style.transform = 						
			"translate(" + (stageX  + x*stageScale) + "px," + 
				(stageY  + y*stageScale) + "px) "+
			"scale(" + (stageScale) + "," + (stageScale) + ") "
			
			;
	}

	const fitStage = useCallback((node? : any, doBatchdraw? : boolean, doSetHtmlElementsPositionAndScale? : boolean) => {
		let xMin;
		let yMin;
		let xMax;
		let yMax;
		let containsHtmlShape = false;
		//let stage = (refs.stage as any).getStage();
		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance !== undefined) {

				flowStore.flow.map((shape, index) => {
					if (node !== undefined) {
						if (node.id !== shape.id) {
							return;
						}
					}
					if (shape.shapeType != "Line") {

						const taskSettings = FlowToCanvas.getTaskSettings(shape.taskType);
						let shapeType = FlowToCanvas.getShapeTypeUsingSettings(shape.shapeType, shape.taskType, shape.isStartEnd, taskSettings);
					
						//const settings = ShapeSettings.getShapeSettings(shape.taskType, shape);
						const RealShape = Shapes[shapeType];

						let addWidth = 0;
						let addHeight = 0;

						let subtractWidth = 0;
						let subtractHeight = 0;

						if (shapeType === "Html" && RealShape) {
							
							containsHtmlShape = true;

							let width : any = undefined;
							let height : any = undefined;
							

							if (props.getNodeInstance) {
								const instance = props.getNodeInstance(shape, props.flowrunnerConnector, flowStore.flow, taskSettings);
								if (instance) {
									if (instance.getWidth && instance.getHeight) {
										width = instance.getWidth(shape);
										height = instance.getHeight(shape);
									}
								}
							}

							let element = document.querySelector("#" + shape.name + " .html-plugin-node");
							if (element) {
								const elementHeight = element.clientHeight;
								if (elementHeight > height) {
									height = elementHeight;
								}

								const elementWidth = element.clientWidth;
								if (elementWidth > width) {
									width = elementWidth;
								}

								//console.log("shape size", shape.name, elementWidth, elementHeight);
							}

							// subWidth needed here ... html nodes start at x-width/2
							subtractWidth = 0;//(width || shape.width || 250);
							subtractHeight = 0;//(height || shape.height || 250);
							addWidth = (width || shape.width || 250);
							addHeight = (height || shape.height || 250);
						} else {
							addWidth = 100;
							addHeight = 50;

							if (shapeType === 'Circle') {
								addWidth = ShapeMeasures.circleSize;
								addHeight = ShapeMeasures.circleSize;
							} else 
							if (shapeType === 'Diamond') {
								addWidth = ShapeMeasures.diamondSize;
								addHeight = ShapeMeasures.diamondSize;
							} else {
								addWidth = ShapeMeasures.rectWidht 
								addHeight = ShapeMeasures.rectHeight;
							}
						}

						if (xMin === undefined) {
							xMin = shape.x - subtractWidth;
						}
						if (yMin === undefined) {
							yMin = shape.y - subtractHeight;
						}
						if (xMax === undefined) {
							xMax = shape.x + addWidth;
						}
						if (yMax === undefined) {
							yMax = shape.y + addHeight;
						}

						if (shape.x - subtractWidth < xMin) {
							xMin = shape.x - subtractWidth;
						}
						if (shape.x + addWidth > xMax) {
							xMax = shape.x + addWidth;
						}
						if (shape.y - subtractHeight < yMin) {
							yMin = shape.y - subtractHeight;
						}
						if (shape.y + addHeight > yMax) {
							yMax = shape.y + addHeight;
						}						
					}
				});
			
				if (flowStore.flow.length > 0 &&
					xMin !== undefined && yMin !== undefined && xMax !== undefined && yMax !== undefined) {
					let scale = 1;
					
					let flowWidth = Math.abs(xMax-xMin) ;//+ 200;
					let flowHeight = Math.abs(yMax-yMin) ;//+ 200;
					
					// .canvas-controller__scroll-container
					const stageContainerElement = document.querySelector("body");
					if (stageContainerElement !== null) {
						let subtractWidth = 128;
						if (stageContainerElement.clientWidth < 1024) {
							subtractWidth = 0;
						}
						let realStageWidth = stageContainerElement.clientWidth - subtractWidth;
						let realStageHeight = stageContainerElement.clientHeight - 64;
						if (realStageHeight < 500) {
							realStageHeight = 600;
						}

						if (flowStore.flow.length === 1) { 
							scale = 1;
							if (stageContainerElement.clientWidth < 1024) {
								scale = 0.5;
							}
						} else {
							if (flowWidth !== 0) { // && flowWidth > realStageWidth) {
								scale = realStageWidth / flowWidth;
							}											

							if (flowHeight * scale > realStageHeight) {							
								scale = realStageHeight / flowHeight;								
							} 	

							scale = scale * 0.7;						
						}

						if (node !== undefined) {
							if (containsHtmlShape) {
								scale = scale * 0.5;
							} else {
								scale = scale * 0.15;
							}
						} 

						stageInstance.scale({ x: scale, y: scale });

						const newPos = {
							x: 0 ,
							y: 0 
						};					
						let offsetX = 64;												
						let stageWidth = stageInstance.getWidth() || stageContainerElement.clientWidth;
						let stageHeight = stageInstance.getHeight() || stageContainerElement.clientHeight;

						if (stageWidth < 1024) {
							offsetX = 0;
						}

						newPos.x = offsetX + (-(xMin)*scale) + (stageWidth)/2 - ((flowWidth*scale))/2 ;
						newPos.y = (-(yMin)*scale) + (stageHeight + 64)/2 - ((flowHeight*scale))/2 ;	
						 
						stageInstance.position(newPos);
						if (!!doBatchdraw) {
							stageInstance.batchDraw();
						}
						stageX.current = newPos.x;
						stageY.current = newPos.y;
						stageScale.current = scale;
						
						if (doSetHtmlElementsPositionAndScale === undefined || !!doSetHtmlElementsPositionAndScale) {
							setHtmlElementsPositionAndScale(newPos.x, newPos.y, scale);
						}
						setCanvasOpacity(1);

						console.log("fitStage realStageHeight flowHeight yMin yMax", realStageHeight, flowHeight, yMin, yMax);
					}
				} else {
					const newPos = {
						x: 0 ,
						y: 0 
					};
					let scale = 1;

					const stageContainerElement = document.querySelector(".canvas-controller__scroll-container");
					if (stageContainerElement !== null) {
						if (stageContainerElement.clientWidth < 1024) {
							scale = 0.5;
						}
					}

					stageInstance.position(newPos);
					if (!!doBatchdraw) {
						stageInstance.batchDraw();
					}

					stageX.current = newPos.x;
					stageY.current = newPos.y;
					stageScale.current = scale;
					
					setHtmlElementsPositionAndScale(newPos.x, newPos.y, scale);
					setCanvasOpacity(1);	
				}
			}
		}
	}, [flowStore.flow]);

	useEffect(() => {
		console.log("useEffect", flowStore.flowId, performance.now());
	}, [flowStore.flow]);

	const clickStage = (event) => {
		if (isConnectingNodesByDraggingLocal.current) {
			event.evt.preventDefault();

			isConnectingNodesByDraggingLocal.current = false;
			connectionNodeEvent.current = false;
			connectionNodeEventName.current = "";
			
			connectionNodeThumbPositionRelativeToNode.current = ThumbPositionRelativeToNode.default;
			connectionNodeFollowFlow.current = ThumbFollowFlow.default;

			(touchNode.current as any) = undefined;
			touchNodeGroup.current = undefined;			

			document.body.classList.remove("connecting-nodes");
			document.body.classList.remove("mouse--moving");

			const lineRef = shapeRefs.current[connectionForDraggingName];
			if (lineRef && (lineRef as any)) {
				lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 0});
				if (stage && stage.current) {
					let stageInstance = (stage.current as any).getStage();
					if (stageInstance !== undefined) {
						stageInstance.batchDraw();
					}
				}
			}

			return false;
		}

		if (touchNode.current && touchNodeGroup.current) {
			event.evt.preventDefault();		
			return false;
		}
		
		const nodeIsSelected : boolean = !!selectedNode && !!selectedNode.node;	
					
		if (!nodeIsSelected && canvasMode.selectedTask !== undefined &&
			canvasMode.selectedTask !== "") {
			if (!canvasMode.isConnectingNodes) {
				if (stage && stage.current) {
					let stageInstance = (stage.current as any).getStage();
					const position = (stageInstance as any).getPointerPosition();
					const scaleFactor = (stageInstance as any).scaleX();
					const taskType = canvasMode.selectedTask || "TraceConsoleTask";
					let presetValues = {};
					const shapeSetting = getTaskConfigForTask(taskType);
					if (shapeSetting && shapeSetting.presetValues) {
						presetValues = shapeSetting.presetValues;
					}

					let newNode = getNewNode({
						name: canvasMode.selectedTask,
						id: canvasMode.selectedTask,
						taskType: taskType,
						shapeType: canvasMode.selectedTask == "IfConditionTask" ? "Diamond" : "Rect", 
						x: ((position.x - (stageInstance).x()) / scaleFactor), 
						y: ((position.y - (stageInstance).y()) / scaleFactor),
						...presetValues
					}, flowStore.flow);

					const settings = ShapeSettings.getShapeSettings(newNode.taskType, newNode);


					let shapeType = FlowToCanvas.getShapeType(newNode.shapeType, newNode.taskType, newNode.isStartEnd);							

					let centerXCorrection = 0;
					let centerYCorrection = 0;
					
					if (shapeType == "Rect" || shapeType == "Ellipse") {
						centerXCorrection = ShapeMeasures.rectWidht / 2;
						centerYCorrection = ShapeMeasures.rectHeight / 2;
					} else
					if (shapeType == "Circle") {
						centerXCorrection = ShapeMeasures.circleSize / 2;
						centerYCorrection = ShapeMeasures.circleSize / 2;
					} else
					if (shapeType == "Diamond") {
						centerXCorrection = ShapeMeasures.diamondSize / 2;
						centerYCorrection = ShapeMeasures.diamondSize / 2;
					}

					newNode.x = newNode.x - centerXCorrection;
					newNode.y = newNode.y - centerYCorrection;
					 															
					const lineRef = shapeRefs.current[connectionForDraggingName];
					if (lineRef && lineRef) {						
						lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 0});
						if (stage && stage.current) {
							let stageInstance = (stage.current as any).getStage();
							if (stageInstance !== undefined) {
								stageInstance.batchDraw();
							}
						}
					}
					
					setPosition(newNode.name, {
						x: newNode.x,
						y: newNode.y
					});
					flowStore.addFlowNode(newNode);
				}				
			}
		}
		// TODO : do we need to select the added node or dont? (see also the flow-actions)
		selectedNode.selectNode("", undefined);

		canvasMode.setConnectiongNodeCanvasMode(false);
		canvasMode.setSelectedTask("");		
		
		return false;
	}

	const getNodeByName = (nodeName) => {
		const nodes = flowStore.flow.filter((node, index) => {
			return node.name === nodeName;
		});
		if (nodes.length > 0) {
			return nodes[0];
		}
		return null;
	}

	const getNodeByVariableName = (nodeName) => {
		const nodes = flowStore.flow.filter((node, index) => {
			return node.variableName === nodeName && node.taskType;// && node.taskType.indexOf("Type") >= 0;
		});
		if (nodes.length > 0) {
			return nodes[0];
		}
		return null;
	}

	const getDependentConnections = () => {

		// TODO zustand check
		const nodeIsSelected : boolean = !!selectedNode && !!selectedNode.node;	

		try {
			let connections : any[] = [];
			flowStore.flow.map((node, index) => {
				if (node.shapeType !== "Line" ) {
					const nodeJson = JSON.stringify(node);
					let nodeMatches  = nodeJson.match(/("node":\ ?"[a-zA-Z0-9\- :]*")/g);
					
					const getVariableNodeMatches = nodeJson.match(/("getVariable":\ ?"[a-zA-Z0-9\- :]*")/g);
					if (getVariableNodeMatches) {
						if (nodeMatches) {
							nodeMatches = nodeMatches.concat(getVariableNodeMatches);
						} else {
							nodeMatches = getVariableNodeMatches;
						}
					}

					const setVariableNodeMatches = nodeJson.match(/("setVariable":\ ?"[a-zA-Z0-9\- :]*")/g);
					if (setVariableNodeMatches) {
						if (nodeMatches) {
							nodeMatches = nodeMatches.concat(setVariableNodeMatches);
						} else {
							nodeMatches = setVariableNodeMatches;
						}
					}

					const datasourceNodeMatches = nodeJson.match(/("datasourceNode":\ ?"[a-zA-Z0-9\- :]*")/g);
					if (datasourceNodeMatches) {
						if (nodeMatches) {
							nodeMatches = nodeMatches.concat(datasourceNodeMatches);
						} else {
							nodeMatches = datasourceNodeMatches;
						}
					}

					const functionCallNodeMatches = nodeJson.match(/("functionnodeid":\ ?"[a-zA-Z0-9\- :]*")/g);
					if (functionCallNodeMatches) {
						if (nodeMatches) {
							nodeMatches = nodeMatches.concat(functionCallNodeMatches);
						} else {
							nodeMatches = functionCallNodeMatches;
						}
					}

					const detailNodeMatches = nodeJson.match(/("detailNode":\ ?"[a-zA-Z0-9\- :]*")/g);
					if (detailNodeMatches) {
						if (nodeMatches) {
							nodeMatches = nodeMatches.concat(detailNodeMatches);
						} else {
							nodeMatches = detailNodeMatches;
						}
					}
					const deleteNodeMatches = nodeJson.match(/("deleteNode":\ ?"[a-zA-Z0-9\- :]*")/g);
					if (deleteNodeMatches) {
						if (nodeMatches) {
							nodeMatches = nodeMatches.concat(deleteNodeMatches);
						} else {
							nodeMatches = deleteNodeMatches;
						}
					}

					const listFromNodeMatches = nodeJson.match(/("useListFromNode":\ ?"[a-zA-Z0-9\- :]*")/g);
					if (listFromNodeMatches) {
						if (nodeMatches) {
							nodeMatches = nodeMatches.concat(listFromNodeMatches);
						} else {
							nodeMatches = listFromNodeMatches;
						}
					}
									
					if (node.taskType && node.taskType.indexOf("Type") < 0) {
						const variableNodeMatches = nodeJson.match(/("variableName":\ ?"[a-zA-Z0-9\- :]*")/g);
						if (variableNodeMatches) {
							if (nodeMatches) {
								nodeMatches = nodeMatches.concat(variableNodeMatches);
							} else {
								nodeMatches = variableNodeMatches;
							}
						}
					}

					if (nodeMatches) {						
						nodeMatches.map((match, index) => {

							let isNodeByName = match.indexOf('"node":') >= 0;
							let isGetVariable = match.indexOf('"getVariable":') >= 0;
							let isSetVariable = match.indexOf('"setVariable":') >= 0;
							let isFunctionCall = match.indexOf('"functionnodeid":') >= 0;
							let isUseListFromNode = match.indexOf('"useListFromNode":') >= 0;
							isNodeByName = isNodeByName || isUseListFromNode || isFunctionCall;

							let nodeName = match.replace('"node":', "");
							nodeName = nodeName.replace('"variableName":', "");
							nodeName = nodeName.replace('"getVariable":', "");
							nodeName = nodeName.replace('"setVariable":', "");
							nodeName = nodeName.replace('"datasourceNode":', "");
							nodeName = nodeName.replace('"functionnodeid":', "");
							nodeName = nodeName.replace('"detailNode":', "");
							nodeName = nodeName.replace('"deleteNode":', "");
							nodeName = nodeName.replace('"useListFromNode":', "");
							
							nodeName = nodeName.replace(/\ /g,"");
							nodeName = nodeName.replace(/\"/g,"");
							let nodeEnd;
							let startToEnd : boolean = true;
							let isConnectionWithVariable = false;

							if (isNodeByName && !isGetVariable && !isSetVariable) {
								nodeEnd = getNodeByName(nodeName);
								if (nodeEnd && !!nodeEnd.hasVariableAttached) {
									isConnectionWithVariable = true;
								}

								if (nodeEnd && nodeEnd.variableName && node.getVariable) {
									nodeEnd = undefined;
								}								
							}							

							if (isGetVariable || isSetVariable) {
								nodeEnd = getNodeByVariableName(nodeName);

								if (nodeEnd) {
									isConnectionWithVariable = true;
								}

								if (isGetVariable) {
									startToEnd = false;
								}
							}
																					
							if (nodeEnd) {

								let startPosition = FlowToCanvas.getStartPointForLine(node, {x: node.x, y: node.y}, undefined, props.getNodeInstance);
								let endPosition = FlowToCanvas.getEndPointForLine(nodeEnd, {x: nodeEnd.x, y: nodeEnd.y}, undefined, props.getNodeInstance);

								if (!startToEnd) {
									startPosition = FlowToCanvas.getStartPointForLine(nodeEnd, {x: nodeEnd.x, y: nodeEnd.y}, undefined, props.getNodeInstance);
									endPosition = FlowToCanvas.getEndPointForLine(node, {x: node.x, y: node.y}, undefined, props.getNodeInstance);
								}

								let connection = {
									shapeType : "Line",
									name: "_dc" + index,
									id: "_dc" + index,
									xstart : startPosition.x,
									ystart : startPosition.y,
									xend: endPosition.x,
									yend: endPosition.y,
									notSelectable: true,
									startshapeid: (startToEnd ? node.name : nodeEnd.name),
									endshapeid: (startToEnd ? nodeEnd.name : node.name),
									isConnectionWithVariable: isConnectionWithVariable || isFunctionCall
								};
								connections.push(connection);
							}
							
						})
					}
				}
			});
			return connections;
		} catch(err) {
			console.log(err);
			return [];
		}
	}


	const onDropTask = (event) => {
		event.preventDefault();
		
		let taskClassName = event.dataTransfer.getData("data-task");
		addTaskToCanvas(taskClassName);
	}

	const addTaskToCanvas = (taskClassName : string) => {
		//const taskClassName = event.target.getAttribute("data-task");
		let _stage = (stage.current as any).getStage();

		_stage.setPointersPositions(event);
	
		//let data = event.dataTransfer.getData("text");
		//event.target.appendChild(document.getElementById(data));

		const nodeIsSelected : boolean = !!selectedNode && !!selectedNode.node;	
		
		selectedNode.selectNode("", undefined);
		canvasMode.setConnectiongNodeCanvasMode(false);

		
		if (taskClassName && taskClassName !== "") {
			if (!canvasMode.isConnectingNodes) {
				if (stage && stage.current) {
					let stageInstance = (stage.current as any).getStage();
					const position = (stageInstance as any).getPointerPosition();
					const scaleFactor = (stageInstance as any).scaleX();
					const taskType = taskClassName;
					let presetValues = {};
					const shapeSetting = getTaskConfigForTask(taskType);
					if (shapeSetting && shapeSetting.presetValues) {
						presetValues = shapeSetting.presetValues;
					}

					let element	 = document.querySelector(".taskbar__task-dragging");					

					let newNode = getNewNode({
						name: taskClassName,
						id: taskClassName,
						taskType: taskType,
						shapeType: taskClassName == "IfConditionTask" ? "Diamond" : "Rect", 
						x: (position.x - (_stage).x()) / scaleFactor, 
						y: (position.y - (_stage).y()) / scaleFactor,
						...presetValues
					},flowStore.flow);
						
					const settings = ShapeSettings.getShapeSettings(newNode.taskType, newNode);

					let shapeType = FlowToCanvas.getShapeType(newNode.shapeType, newNode.taskType, newNode.isStartEnd);							
					if (shapeType == "Html" && element) {
						let rect = element.getBoundingClientRect();
						if (props.getNodeInstance) {
							const left = Math.round((rect.left + rect.right)/2);
							let result = props.getNodeInstance(newNode, props.flowrunnerConnector,undefined,settings);
							if (result && result.getWidth) {
								console.log("addTaskToCanvas", result.getWidth(newNode)/2);
								newNode.x = (left - (_stage).x()) / scaleFactor;
								newNode.y = (rect.top - (_stage).y()) / scaleFactor;
								newNode.x -= (result.getWidth(newNode) || newNode.width || 250)/2;
							}
						}
					}

					let centerXCorrection = 0;
					let centerYCorrection = 0;
					
					if (shapeType == "Rect" || shapeType == "Ellipse") {
						centerXCorrection = ShapeMeasures.rectWidht / 2;
						centerYCorrection = ShapeMeasures.rectHeight / 2;
					} else
					if (shapeType == "Circle") {
						centerXCorrection = ShapeMeasures.circleSize / 2;
						centerYCorrection = ShapeMeasures.circleSize / 2;
					} else
					if (shapeType == "Diamond") {
						centerXCorrection = ShapeMeasures.diamondSize / 2;
						centerYCorrection = ShapeMeasures.diamondSize / 2;
					}

					newNode.x = newNode.x - centerXCorrection;
					newNode.y = newNode.y - centerYCorrection;
					
					const lineRef = shapeRefs.current[connectionForDraggingName];
					if (lineRef && lineRef) {
						lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 0});
						if (stage && stage.current) {
							let stageInstance = (stage.current as any).getStage();
							if (stageInstance !== undefined) {
								stageInstance.batchDraw();
							}
						}
					}
					
					setPosition(newNode.name, {
						x: newNode.x,
						y: newNode.y
					});
					flowStore.addFlowNode(newNode);

					let closestNode = closestNodeWhenAddingNewNode.current as any;
					if (closestNode) {		
					    let connection;			
						const orientationIsLeft = orientationClosestNodeWhenAddingNewNode.current;
						if (orientationIsLeft && closestNode.shapeType !== "Diamond")  {							
							connection = getNewConnection(closestNode, newNode, props.getNodeInstance, false,
								ThumbPositionRelativeToNode.default);								
							
						} else {
							if (nodeOrientationClosestNodeWhenAddingNewNode.current === ThumbPositionRelativeToNode.default) {
								connection = getNewConnection(newNode, closestNode, props.getNodeInstance, false,
									ThumbPositionRelativeToNode.default);
							} else {
								connection = getNewConnection(closestNode, newNode, props.getNodeInstance, false,
									nodeOrientationClosestNodeWhenAddingNewNode.current);

								if (nodeOrientationClosestNodeWhenAddingNewNode.current == ThumbPositionRelativeToNode.top) {
									(connection as any).followflow = "onsuccess";
								} else {
									(connection as any).followflow = "onfailure";
								}
								(connection as any).thumbPosition = nodeOrientationClosestNodeWhenAddingNewNode.current;	
							}
						}

						setPosition(connection.name, {
							xstart: connection.xstart,
							ystart: connection.ystart,
							xend: connection.xend,
							yend: connection.yend
						});
						flowStore.addConnection(connection);
					}
				}				
			}
		} else {
			alert("select task!!");
		}

		return false;
	}
	
	const getDistance = (node,position) => {
		const x = node.x-position.x;
		const y = node.y-position.y;
		return Math.sqrt( x*x + y*y );
	}
	const onAllowDrop = (event) => {
		event.preventDefault();
		movingTaskToCanvas(event.clientX, event.clientY);
	}

	const movingTaskToCanvas = (dropX,dropY) => {
		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance) {
				const scaleFactor = (stageInstance as any).scaleX();

				let position = {
					x: 0,
					y: 0
				};
				position.x = ((dropX - (stageInstance).x()) / scaleFactor);
				position.y = ((dropY - (stageInstance).y()) / scaleFactor);

				const minDistanceForAutoConnect = 750;
				let minDistance = -1;
				let closestNode : any;
				let orientationIsLeft = false;
				let nodeOrientation = ThumbPositionRelativeToNode.default;
				closestNodeWhenAddingNewNode.current = undefined;
				nodeOrientationClosestNodeWhenAddingNewNode.current = nodeOrientation;

				flowStore.flow.forEach((node) => {
					if (node.shapeType !== 'Line') {

						const nodePosition = getPosition(node.name);

						const rightPosition = FlowToCanvas.getStartPointForLine(node,{
							x: nodePosition.x,
							y: nodePosition.y

						}, undefined, props.getNodeInstance, ThumbPositionRelativeToNode.default);

						const leftPosition = FlowToCanvas.getEndPointForLine(node,{
							x: nodePosition.x,
							y: nodePosition.y

						}, undefined, props.getNodeInstance);

						let distanceTop = -1;
						let distanceBottom = -1;
						if (node.shapeType === "Diamond") {
							const topPosition = FlowToCanvas.getStartPointForLine(node,{
								x: nodePosition.x,
								y: nodePosition.y
	
							}, undefined, props.getNodeInstance, ThumbPositionRelativeToNode.top);

							const bottomosition = FlowToCanvas.getStartPointForLine(node,{
								x: nodePosition.x,
								y: nodePosition.y
	
							}, undefined, props.getNodeInstance, ThumbPositionRelativeToNode.bottom);

							distanceTop = getDistance(position,topPosition);
							distanceBottom = getDistance(position,bottomosition);
						}
						const distanceLeft = getDistance(position,leftPosition);
						const distanceRight = getDistance(position,rightPosition);

						if (minDistance == -1 || distanceLeft < minDistance) {
							if (distanceLeft < minDistanceForAutoConnect) {
								minDistance = distanceLeft;
								closestNode = node;
								orientationIsLeft = false;
								nodeOrientation = ThumbPositionRelativeToNode.default;
							}							
						}

						if (distanceTop >= 0 && (minDistance == -1 || distanceTop < minDistance)) {
							if (distanceTop < minDistanceForAutoConnect) {
								minDistance = distanceTop;
								closestNode = node;
								orientationIsLeft = false;
								nodeOrientation = ThumbPositionRelativeToNode.top;
							}							
						}

						if (distanceBottom >= 0 && (minDistance == -1 || distanceBottom < minDistance)) {
							if (distanceBottom < minDistanceForAutoConnect) {
								minDistance = distanceBottom;
								closestNode = node;
								orientationIsLeft = false;
								nodeOrientation = ThumbPositionRelativeToNode.bottom;
							}							
						}


						if (node.shapeType !== "Diamond") {
							if (minDistance == -1 || distanceRight < minDistance) {
								if (distanceRight < minDistanceForAutoConnect) {
									minDistance = distanceRight;
									closestNode = node;
									orientationIsLeft = true;
									nodeOrientation = ThumbPositionRelativeToNode.default;
								}
							}
						} 
					}
				});

				if (closestNode) {
					closestNodeWhenAddingNewNode.current = closestNode;
					orientationClosestNodeWhenAddingNewNode.current = orientationIsLeft;
					nodeOrientationClosestNodeWhenAddingNewNode.current = nodeOrientation;
					const lineRef = shapeRefs.current[connectionForDraggingName];
					if (lineRef) {
						let thumbPosition = ThumbPositionRelativeToNode.default;
						let lineStartPosition;

						const nodePosition = getPosition(closestNode.name);

						if (closestNode.shapeType === "Diamond" && nodeOrientation !== ThumbPositionRelativeToNode.default) {
							lineStartPosition = FlowToCanvas.getStartPointForLine(closestNode,{
								x: nodePosition.x,
								y: nodePosition.y

							}, undefined, props.getNodeInstance, nodeOrientation);

							let controlPoints = calculateLineControlPoints(
								lineStartPosition.x, lineStartPosition.y, 
								position.x, position.y,
								nodeOrientation);
								
							lineRef.modifyShape(ModifyShapeEnum.SetPoints, {points: [lineStartPosition.x, lineStartPosition.y,
								controlPoints.controlPointx1, controlPoints.controlPointy1,
								controlPoints.controlPointx2, controlPoints.controlPointy2,
								position.x, position.y]});
						} else
						if (orientationIsLeft) {

							lineStartPosition = FlowToCanvas.getStartPointForLine(closestNode,{
								x: nodePosition.x,
								y: nodePosition.y

							}, undefined, props.getNodeInstance, ThumbPositionRelativeToNode.default);

							let controlPoints = calculateLineControlPoints(
								lineStartPosition.x, lineStartPosition.y, 
								position.x, position.y,
								ThumbPositionRelativeToNode.default);
								
							lineRef.modifyShape(ModifyShapeEnum.SetPoints, {points: [lineStartPosition.x, lineStartPosition.y,
								controlPoints.controlPointx1, controlPoints.controlPointy1,
								controlPoints.controlPointx2, controlPoints.controlPointy2,
								position.x, position.y]});
						} else {
							lineStartPosition = FlowToCanvas.getEndPointForLine(closestNode,{
								x: nodePosition.x,
								y: nodePosition.y

							}, undefined, props.getNodeInstance);

							let controlPoints = calculateLineControlPoints(
								position.x, position.y,
								lineStartPosition.x, lineStartPosition.y, 								
								ThumbPositionRelativeToNode.default);
								
							lineRef.modifyShape(ModifyShapeEnum.SetPoints, {points: [ position.x, position.y,
								controlPoints.controlPointx1, controlPoints.controlPointy1,
								controlPoints.controlPointx2, controlPoints.controlPointy2,
								lineStartPosition.x, lineStartPosition.y]});
						}
						lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 1});
						stageInstance.batchDraw();
					}
				} else {
					const lineRef = shapeRefs.current[connectionForDraggingName];
					if (lineRef) {
						lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 0});
						stageInstance.batchDraw();
					}
				}
			}
		}
		
		// onDragOver={onAllowDrop}
		// onDrop={onDropTask}
	}

	const onInput = (event) => {
		// prevent editing of div because of contentEditable which is needed for pasting data from excel
		if (event.target && (event.target.tagName || "").toLowerCase() == "input") {
			return;
		}
		if (event.target && (event.target.tagName || "").toLowerCase() == "textarea") {
			return;
		}
		if (event.target && event.target.attributes && event.target.attributes["role"]
				&& event.target.attributes["role"].value == "textbox") {
			return;
		}
		
		console.log("oninput", event);

		/*if (event.keyCode == fKey || event.keyCode == fKeyCapt) {
			if (selectedNode && selectedNode.node) {
				event.preventDefault();
				fitStage(selectedNode.node, true);
				return false;
			}
			return true;
		}*/

		if (event.keyCode == shiftKey) {
			shiftDown.current = true;
			return true;
		}
		/*
		// this doesn't work when focus is on textarea
		
		if (event.keyCode == backspaceKey) {
			if (selectedNode && selectedNode.node) {
				if ((selectedNode.node as any).shapeType !== 'Line') {
					flow.deleteNode(selectedNode.node);
				} else {
					flow.deleteConnection(selectedNode.node);
				}
				selectedNode.selectNode("", undefined);
			}
			return true;
		}
		*/
		if (event.keyCode == ctrlKey || event.keyCode == cmdKey) {
			ctrlDown.current = true;
			return true;
		}

		if (!!ctrlDown.current && event.keyCode == pasteKey) {
			return true;			
		}

		
		//event.preventDefault();
		//return false;
	}

	const onKeyUp = (event) => {
		ctrlDown.current = false;
		shiftDown.current = false;

	}

	const onStoreFlowNode = (node : any , orgNodeName : string) => {
		flowStore.storeFlowNode(node, orgNodeName);
	}

	const handleDragStart = (event) => {
		setActiveId(event.active.id);		
	}
	  
	const handleDragEnd= (event) => {
		console.log("handleDragEnd", event);
		if (activeId) {
			addTaskToCanvas(activeId);
		}
		setActiveId(undefined);
	}

	const handleDragMove = (event) => {
		console.log("handleDragMove", event);
		let element	 = document.querySelector(".taskbar__task-dragging");
		if (element) {
			let rect = element.getBoundingClientRect();
			movingTaskToCanvas(
				Math.round((rect.left + rect.right)/2), 
				Math.round((rect.top+rect.bottom)/2)
			);
		}		
	}

	const canvasHasSelectedNode : boolean = !!selectedNode && !!selectedNode.node;	

	const connections = canvasMode.showDependencies ? getDependentConnections() : [];
	let nodesConnectedToSelectedNode : any = {};
	const flowMemo = useMemo(() => {
		return flowStore.flow
	}, [flowStore.flow]);

	console.log("CANVAS RENDER" , performance.now());

	return <>		
		<DndContext 
		   	modifiers={[restrictToWindowEdges]}
			onDragStart={handleDragStart} 
			onDragMove={handleDragMove}
			onDragEnd={handleDragEnd}>
			<Taskbar flowrunnerConnector={props.flowrunnerConnector} 
				isDragging={activeId !== undefined}
			></Taskbar>	
			<DragOverlay className="taskbar__task-dragging"
				zIndex={20000}
				dropAnimation={null}
			>				
					{activeId ? <DragginTask id={activeId} 
						style={{}}											
						children={{}}		
						listeners={{}}
					/> : null}
			</DragOverlay>
			<div 
				key={"stage-layer-wrapper-" + canvasKey} 
				ref={ref => ((canvasWrapper as any).current = ref)} 
				style={{opacity: canvasOpacity}} 
				className="canvas-controller__scroll-container"
				
				tabIndex={0} 
				onInput={onInput}
				onKeyDown={onInput}
				onKeyUp={onKeyUp}																	
				>
				
				<div ref={setNodeRef} style={droppableStyle}>
					<Stage					
						onClick={clickStage}					
						draggable={true}
						pixelRatio={1} 
						width={stageWidth}
						height={stageHeight }
						ref={ref => ((stage as any).current = ref)}
						onDragMove={onDragStageMove}
						onDragEnd={onDragStageEnd}
						onTouchStart={onStageTouchStart}
						onTouchMove={onStageTouchMove}
						onMouseMove={onStageTouchMove}
						onTouchEnd={onStageMouseEnd}
						onMouseLeave={onStageMouseLeave}
						onMouseUp={onStageMouseEnd}
						onTap={clickStage}
						className="stage-container">
						<Layer key={"stage-layer-" + canvasKey} ref={ref => ((layer as any).current = ref)}>
							<Rect x={0} y={0} width={1024} height={750}></Rect>
							{connections.length > 0 && connections.map((node, index) => {

								if (canvasHasSelectedNode &&  selectedNode &&  selectedNode.node) {
									if (node.startshapeid === selectedNode.node.name) {
										nodesConnectedToSelectedNode[node.endshapeid] = true;
									}

									if (node.endshapeid === selectedNode.node.name) {
										nodesConnectedToSelectedNode[node.startshapeid] = true;
									}								
								}
								return <Shapes.Line key={"cn-node-" + index}
										onMouseOver={(event) => onMouseOver(node, event)}
										onMouseOut={(event) => onMouseOut()}
										onClickLine={(event) => onClickLine(node, event)}
										isSelected={false}
										isAltColor={true}									
										canvasHasSelectedNode={canvasHasSelectedNode}
										isConnectionWithVariable={node.isConnectionWithVariable}
										xstart={node.xstart} 
										ystart={node.ystart}									
										xend={node.xend} 
										yend={node.yend}
										selectedNodeName={canvasHasSelectedNode ? selectedNode.node.name : ""}
										startNodeName={node.startshapeid}
										endNodeName={node.endshapeid}
										noMouseEvents={true}	
										></Shapes.Line>})
							}
							{flowMemo.map((node, index) => {
								if (node.shapeType !== "Line") {

									let position = getPosition(node.name);
									if (!position) {
										if (node.shapeType !== "Line") {
											
											setPosition(node.name, {
												x: node.x,
												y: node.y
											});
										} else {
											
											setPosition(node.name, {
												xstart: node.xstart,
												ystart: node.ystart,
												xend: node.xend,
												yend: node.yend
											});
										}  
										position = getPosition(node.name);
									}
									return <LinesForShape key={"node-linshahe-"+index} 
										x={position.x} 
										y={position.y} 
										name={node.name}
										flow={flowMemo}
										taskType={node.taskType}
										node={node}			
										flowHash={flowStore.flowHashmap}
										shapeRefs={shapeRefs as any}
										
										positions={getPosition}
										canvasHasSelectedNode={canvasHasSelectedNode}
										
										nodeState={""}
										selectedNode={selectedNode}
										onLineMouseOver={onMouseOver}
										onLineMouseOut={onMouseOut}
										onClickLine={onClickLine}
									
										onClickSetup={undefined}
										onMouseOver={(event) => onMouseOver(node, event)}
										onMouseOut={onMouseOut}
										onDragStart={(event) => onDragStart(node, event)}
										onDragEnd={(event) => onDragEnd(node, event)}
										onDragMove={(event) => onDragMove( node, event)}
										onTouchStart={(event) => onTouchStart(node, event)}
										onTouchEnd={(event) => onTouchEnd( node, event)}
										onTouchMove={(event) => onTouchMove(node, event)}
										onClickShape={(event) => onClickShape(node, event)}
										onMouseStart={(event) => onMouseStart(node, event)}
										onMouseMove={(event) => onMouseMove(node, event)}
										onMouseEnd={(event) => onMouseEnd(node, event)}
										onMouseLeave={(event) => onMouseLeave(node, event)}
										isSelected={selectedNode && selectedNode.node.name === node.name}
										isConnectedToSelectedNode={false}
										getNodeInstance={props.getNodeInstance}
										touchedNodes={touchedNodesStore.nodesTouched}
									></LinesForShape>
								}
								return null;
							})}

							{flowMemo.map((node, index) => {
								let shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);							
								const settings = ShapeSettings.getShapeSettings(node.taskType, node);

								const Shape = Shapes[shapeType];
								let position = getPosition(node.name);
								if (!position) {
									if (node.shapeType !== "Line") {
										
										setPosition(node.name, {
											x: node.x,
											y: node.y
										});
									} else {
										
										setPosition(node.name, {
											xstart: node.xstart,
											ystart: node.ystart,
											xend: node.xend,
											yend: node.yend
										});
									}  
									position = getPosition(node.name);
								}

								if (node.shapeType !== "Line" && Shape) {

									let nodeState = "";
									
									nodeState = nodesStateLocal.current[node.name] || "";
										
									let isConnectedToSelectedNode = selectedNode && nodesConnectedToSelectedNode[node.name] === true;
									if (selectedNode && 
										selectedNode.node && 
										(selectedNode.node as any).shapeType === "Line") {

										if ((selectedNode.node as any).startshapeid === node.name) {
											isConnectedToSelectedNode = true;
										}

										if ((selectedNode.node as any).endshapeid === node.name) {
											isConnectedToSelectedNode = true;
										}								
									}
									
									return <React.Fragment key={"node-fragment-" + index} ><Shape key={"node-"+index} 
										x={position.x} 
										y={position.y} 
										name={node.name}
										flow={flowMemo}
										taskType={node.taskType}
										node={node}																	
										ref={ref => (shapeRefs.current[node.name] = ref)}
										shapeRefs={shapeRefs}
										positions={getPosition}
										canvasHasSelectedNode={canvasHasSelectedNode}
										
										nodeState={nodeState}
										selectedNode={selectedNode}
										onLineMouseOver={onMouseOver}
										onLineMouseOut={onMouseOut}
										onClickLine={onClickLine}
									

										onClickSetup={(event) => onClickSetup( node, settings,event)}
										onMouseOver={(event) => onMouseOver(node, event)}
										onMouseOut={onMouseOut}
										onDragStart={(event) => onDragStart(node, event)}
										onDragEnd={(event) => onDragEnd(node, event)}
										onDragMove={(event) => onDragMove( node, event)}
										onTouchStart={(event) => onTouchStart(node, event)}
										onTouchEnd={(event) => onMouseEnd( node, event)}
										onTouchMove={(event) => onMouseMove(node, event)}
										onClickShape={(event) => onClickShape(node, event)}
										onMouseStart={(event) => onMouseStart(node, event)}
										onMouseMove={(event) => onMouseMove(node, event)}
										onMouseEnd={(event) => onMouseEnd(node, event)}
										onMouseLeave={(event) => onMouseLeave(node, event)}
										isSelected={selectedNode && selectedNode.node.name === node.name}
										isConnectedToSelectedNode={isConnectedToSelectedNode}
										getNodeInstance={props.getNodeInstance}
										touchedNodes={touchedNodesStore.nodesTouched}
									></Shape>
									{(shapeType === "Rect" || shapeType === "Diamond" || shapeType === "Html") && <Thumbs
										key={"node-thumb-" + index} 
										position={FlowToCanvas.getThumbEndPosition(shapeType, position)}
										name={node.name}
										taskType={node.taskType}
										shapeType={shapeType}
										node={node}																	
										ref={ref => (shapeRefs.current["thumb_" + node.name] = ref)} 									
										isSelected={selectedNode && selectedNode.node.name === node.name}
										isConnectedToSelectedNode={isConnectedToSelectedNode}									
										canvasHasSelectedNode={canvasHasSelectedNode}

										onMouseConnectionEndOver={(event) => onMouseConnectionEndOver(node,false,event)}
										onMouseConnectionEndOut={(event) => onMouseConnectionEndOut(node,false,event)}
										onMouseConnectionEndStart={(event) => onMouseConnectionEndStart(node,false,event)}
										onMouseConnectionEndMove={(event) => onMouseConnectionEndMove(node,false,event)}
										onMouseConnectionEndEnd={(event) => onMouseConnectionEndEnd(node,false,event)}
										onMouseConnectionEndLeave={(event) => onMouseConnectionEndLeave(node,false,event)}
										getNodeInstance={props.getNodeInstance}
									></Thumbs>}
									{(shapeType === "Rect" || shapeType === "Html") && <ThumbsStart
										key={"node-thumbstart-" + index} 
										position={FlowToCanvas.getThumbStartPosition(shapeType, position, 0)}
										name={node.name}
										taskType={node.taskType}
										shapeType={shapeType}
										node={node}																	
										ref={ref => (shapeRefs.current["thumbstart_" + node.name] = ref)} 									
										isSelected={selectedNode && selectedNode.node.name === node.name}
										isConnectedToSelectedNode={isConnectedToSelectedNode}									
										canvasHasSelectedNode={canvasHasSelectedNode}
										
										onMouseConnectionStartOver={(event) => onMouseConnectionStartOver(node,false,event)}
										onMouseConnectionStartOut={(event) => onMouseConnectionStartOut(node,false,event)}
										onMouseConnectionStartStart={(event) => onMouseConnectionStartStart(node,false,"",ThumbFollowFlow.default, ThumbPositionRelativeToNode.default,event)}
										onMouseConnectionStartMove={(event) => onMouseConnectionStartMove(node,false,event)}
										onMouseConnectionStartEnd={(event) => onMouseConnectionStartEnd(node,false,ThumbPositionRelativeToNode.default,event)}

										getNodeInstance={props.getNodeInstance}										
									></ThumbsStart>}
									{(shapeType === "Diamond") && <ThumbsStart
										key={"node-thumbstart-diamond-top-" + index} 
										position={FlowToCanvas.getThumbStartPosition(shapeType, position, 0, ThumbPositionRelativeToNode.top)}
										name={node.name}
										taskType={node.taskType}
										shapeType={shapeType}
										node={node}																	
										ref={ref => (shapeRefs.current["thumbstarttop_" + node.name] = ref)} 									
										isSelected={selectedNode && selectedNode.node.name === node.name}
										isConnectedToSelectedNode={isConnectedToSelectedNode}									
										canvasHasSelectedNode={canvasHasSelectedNode}
										followFlow={ThumbFollowFlow.happyFlow}
										thumbPositionRelativeToNode={ThumbPositionRelativeToNode.top}
										onMouseConnectionStartOver={(event) => onMouseConnectionStartOver(node,false,event)}
										onMouseConnectionStartOut={(event) => onMouseConnectionStartOut(node,false,event)}
										onMouseConnectionStartStart={(event) => onMouseConnectionStartStart(node,false,"",
											ThumbFollowFlow.happyFlow, ThumbPositionRelativeToNode.top,event)}
										onMouseConnectionStartMove={(event) => onMouseConnectionStartMove(node,false,event)}
										onMouseConnectionStartEnd={(event) => onMouseConnectionStartEnd(node,false,ThumbPositionRelativeToNode.top,event)}

										getNodeInstance={props.getNodeInstance}										
									></ThumbsStart>}
									{(shapeType === "Diamond") && <ThumbsStart
										key={"node-thumbstart-diamond-bottom-" + index} 
										position={FlowToCanvas.getThumbStartPosition(shapeType, position, 0, ThumbPositionRelativeToNode.bottom)}
										name={node.name}
										taskType={node.taskType}
										shapeType={shapeType}
										node={node}																	
										ref={ref => (shapeRefs.current["thumbstartbottom_" + node.name] = ref)} 									
										isSelected={selectedNode && selectedNode.node.name === node.name}
										isConnectedToSelectedNode={isConnectedToSelectedNode}									
										canvasHasSelectedNode={canvasHasSelectedNode}
										followFlow={ThumbFollowFlow.unhappyFlow}
										thumbPositionRelativeToNode={ThumbPositionRelativeToNode.bottom}
										onMouseConnectionStartOver={(event) => onMouseConnectionStartOver(node,false,event)}
										onMouseConnectionStartOut={(event) => onMouseConnectionStartOut(node,false,event)}
										onMouseConnectionStartStart={(event) => onMouseConnectionStartStart(node,false,"",
											ThumbFollowFlow.unhappyFlow, ThumbPositionRelativeToNode.bottom,event)}
										onMouseConnectionStartMove={(event) => onMouseConnectionStartMove(node,false,event)}
										onMouseConnectionStartEnd={(event) => onMouseConnectionStartEnd(node,false,ThumbPositionRelativeToNode.bottom,event)}

										getNodeInstance={props.getNodeInstance}										
									></ThumbsStart>}
									{(shapeType === "Rect" || shapeType === "Diamond" || shapeType === "Html") && settings.events && settings.events.map((event ,eventIndex) => {
										return <ThumbsStart
											key={"node-thumbstart-" + index + "-" + eventIndex} 
											position={FlowToCanvas.getThumbStartPosition(shapeType, position, eventIndex + 1)}
											name={node.name}
											taskType={node.taskType}
											shapeType={shapeType}
											node={node}																	
											ref={ref => (shapeRefs.current["thumbstartevent_" + node.name + eventIndex] = ref)} 									
											isSelected={selectedNode && selectedNode.node.name === node.name}
											isConnectedToSelectedNode={isConnectedToSelectedNode}									
											canvasHasSelectedNode={canvasHasSelectedNode}

											onMouseConnectionStartOver={(event) => onMouseConnectionStartOver(node,eventIndex,event)}
											onMouseConnectionStartOut={(event) => onMouseConnectionStartOut(node,eventIndex,event)}
											onMouseConnectionStartStart={(event) => onMouseConnectionStartStart(node,eventIndex, event.eventName,
												ThumbFollowFlow.event, ThumbPositionRelativeToNode.default,event)}
											onMouseConnectionStartMove={(event) => onMouseConnectionStartMove(node,eventIndex,event)}
											onMouseConnectionStartEnd={(event) => onMouseConnectionStartEnd(node,eventIndex,ThumbPositionRelativeToNode.default,event)}

											getNodeInstance={props.getNodeInstance}										
									></ThumbsStart>
									})}
									
									</React.Fragment>;
								}
								return null;
							})}
							<Shapes.Line 
								ref={ref => (shapeRefs.current[connectionForDraggingName] = ref)}
								onMouseOver={undefined}
								onMouseOut={undefined}
								onClickLine={undefined}
								isSelected={false}
								isAltColor={true}									
								canvasHasSelectedNode={canvasHasSelectedNode}
								isConnectionWithVariable={false}
								xstart={connectionX} 
								ystart={connectionY}									
								xend={connectionX} 
								yend={connectionY}
								selectedNodeName={""}
								startNodeName={""}
								endNodeName={""}
								opacity={0}	
								noMouseEvents={true}
								isNodeConnectorHelper={true}
							></Shapes.Line>
						</Layer>
					</Stage>
				</div>				
				
				<div ref={ref => ((htmlWrapper as any).current = ref)} 
					className="canvas__html-elements">
					
					{flowMemo.map((node, index) => {
							let shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);
							const settings = ShapeSettings.getShapeSettings(node.taskType, node);
							const Shape = Shapes[shapeType];
							
							if (shapeType === "Html" && Shape) {
								
								const nodeClone = {...node};
								const position = getPosition(node.name) || node;
								let nodeState = (nodesStateLocal.current[node.name] || "") == "error" ? " has-error" : "";

								const isSelected = selectedNode && selectedNode.node.name === node.name;
								nodeClone.htmlPlugin = node.htmlPlugin || (settings as any).htmlPlugin || "";
								
								let width = undefined;
								let height = undefined;

								if (props.getNodeInstance) {
									const instance = props.getNodeInstance(node, props.flowrunnerConnector, flowStore.flow, settings);
									if (instance) {
										if (instance.getWidth && instance.getHeight) {
											width = instance.getWidth(node);
											height = instance.getHeight(node);
										}
									}
								}

								//let top = (-(height || node.height || 250)/2);
								/*
									left: (-(width || node.width || 250)/2)+"px",
									top: (top)+"px",

								*/
								return <div key={"html" + index}
									style={{transform: "translate(" + (stageX.current  + position.x * stageScale.current) + "px," + 
											(stageY.current +  (position.y) * stageScale.current) + "px) " +
											"scale(" + (stageScale.current) + "," + (stageScale.current) + ") ",
											width: (width || node.width || 250)+"px",
											minHeight: (height || node.height || 250)+"px",
											height:(height || node.height || 250)+"px",
											top: 0+ "px",
											left: 0 +"px",
											opacity: (!canvasHasSelectedNode || (selectedNode && selectedNode.node.name === node.name)) ? 1 : 1 //0.5 										 
										}}
									id={node.name}
									data-node={node.name}
									data-task={node.taskType}
									data-html-plugin={nodeClone.htmlPlugin}
									data-visualizer={node.visualizer || "default"}
									data-x={position.x} 
									data-y={position.y}
									data-top={top}
									data-height={(height || node.height || 250)}									 
									className={"canvas__html-shape canvas__html-shape-" + node.name + nodeState}>
										<div className={"canvas__html-shape-bar " + (isSelected ? "canvas__html-shape-bar--selected" :"")}>
											<span className="canvas__html-shape-bar-title">{settings.icon && <span className={"canvas__html-shape-title-icon fas " +  settings.icon}></span>}{node.label ? node.label : node.name}</span>
											<a href="#" onClick={(event) => onCloneNode(node, event)}
												onFocus={onFocus}
												className="canvas__html-shape-bar-icon far fa-clone"></a>									
											{!!settings.hasConfigMenu && <a href="#"
												onFocus={onFocus} 
												onClick={(event) => onShowNodeSettings(node, settings, event)} 
												className="canvas__html-shape-bar-icon fas fa-cog"></a>}</div>
										<div className="canvas__html-shape-body">
										{props.renderHtmlNode && props.renderHtmlNode(nodeClone, props.flowrunnerConnector, flowMemo, settings)}</div>
										<div className={"canvas__html-shape-thumb-start canvas__html-shape-0"}></div>
										<div className={"canvas__html-shape-thumb-end canvas__html-shape-0"}></div>
										{settings.events && settings.events.map((event ,eventIndex) => {
											return <div className={"canvas__html-shape-event canvas__html-shape-" + (eventIndex + 1)} key={"_" + index + "-" + eventIndex}></div>
										})}
										</div>;						
							}
							return <React.Fragment key={"html" + index}></React.Fragment>;
							
						})
					}
				</div>
			</div>
		</DndContext>
		{showNodeSettings && <EditNodeSettings node={editNode} settings={editNodeSettings} flowrunnerConnector={props.flowrunnerConnector} onClose={onCloseEditNodeSettings}></EditNodeSettings>}
		<Flow 
			flow={flowStore.flow}
			flowId={flowStore.flowId}
			flowrunnerConnector={props.flowrunnerConnector} />							
	</>;
}