import * as React from 'react';
import { useRef , useState, useEffect , useMemo, useLayoutEffect} from 'react';
import { Stage, Layer , Rect, Group } from 'react-konva';
import { Shapes } from './shapes';
import { LinesForShape } from './shapes/lines-for-shape';
import {
	FlowToCanvas,
	getTaskConfigForTask,
	IFlowrunnerConnector,
	ShapeSettings,
	getNewNode,
	getNewConnection,
	ShapeMeasures,
	Flow,
	calculateLineControlPoints,
	IFlowState,
	ICanvasModeState,
	useSelectedNodeStore,
	INodeState,
	useNodesTouchedStateStore,
	ModifyShapeEnum,
	ShapeStateEnum,
	ThumbFollowFlow,
	ThumbPositionRelativeToNode,
	onFocus,
	FlowState,
	ErrorBoundary,
	IModalSize,
	INodeDependency,
	PositionContext,
	PositionProvider,
	usePositionContext,
	setMultiSelectInfo,
	resetOnSetCanvasStateCallback,
	setOnSetCanvasStateCallback

} from '@devhelpr/flowrunner-canvas-core';
import { Subject } from 'rxjs';
import { DndContext, DragOverlay, useDroppable } from '@dnd-kit/core';
import { DragginTask} from '../../dragging-task';
import { EditNodeSettings } from '../edit-node-settings';
import { EditNodePopup } from '../edit-node';
import { HtmlNode} from './canvas-components/html-node';
import { KonvaNode} from './canvas-components/konva-node';

import * as uuid from 'uuid';

import { Taskbar } from '../taskbar';

import {
	restrictToWindowEdges
} from '@dnd-kit/modifiers';


import * as Konva from "konva"
import { animateTo } from "./konva/Tween";
import { InteractionState } from "./canvas-types/interaction-state"; 

import { AnnotationSection } from './annotations/annotation-section';
import { AnnotationText } from './annotations/annotation-text';
import { FloatingToolbar } from '../toolbar';
import { useSetPositionHook } from './hooks/use-set-position-hook';

const uuidV4 = uuid.v4;

export interface CanvasProps {

	externalId: string;
	hasTaskNameAsNodeTitle?: boolean;
	showsStateMachineUpdates: boolean;
	hasCustomNodesAndRepository: boolean;
	hasDefaultUITasks: boolean;

	canvasToolbarsubject : Subject<string>;
	formNodesubject: Subject<any>;
	
	flowHasNodes : boolean;
	flowId? : number | string;
	flowState : FlowState;
	flowType : string;
	saveFlow : (flowId?, flow? : any[]) => void;

	isEditingInModal : boolean;
	modalSize? : IModalSize;
	initialOpacity : number;
	flowrunnerConnector : IFlowrunnerConnector;
	renderHtmlNode?: (node: any, flowrunnerConnector : IFlowrunnerConnector, flow: any, taskSettings? : any) => any;
	getNodeInstance: (node: any, flowrunnerConnector?: IFlowrunnerConnector, flow?: any, taskSettings? : any) => any;	
	getNodeDependencies?: (nodeName: string) => INodeDependency[];

	useFlowStore : () => IFlowState;
	useCanvasModeStateStore: () => ICanvasModeState;
	useSelectedNodeStore : (param? : any) => INodeState;
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
	const positionContext = usePositionContext();
	const [stageWidth, setStageWidth] = useState(0);
	const [stageHeight, setStageHeight] = useState(0);
	const [canvasOpacity, setCanvasOpacity ] = useState(0);
	const [canvasKey, setCanvasKey] = useState(1);
	const [showNodeSettings, setShowNodeSettings] = useState(false);
	const [showNodeEdit, setShowNodeEdit]= useState(false);
	const [editNode, setEditNode] = useState(undefined);
	const [editNodeSettings, setEditNodeSettings] = useState(undefined);
	const [isConnectingNodesByDragging, setIsConnectingNodesByDragging] = useState(false);
	const [connectionX, setConnectionX] = useState(0);
	const [connectionY, setConnectionY] = useState(0);
	const [updateNodeTouchedState, setUpdateNodeTouchedState] = useState(true);
	const [activeId, setActiveId] = useState(undefined as string | undefined);

	const {isOver, setNodeRef} = useDroppable({id: 'droppable' });

	const flowStore = props.useFlowStore();
	const canvasMode = props.useCanvasModeStateStore();
	//const selectedNode = useSelectedNodeStore();
	const selectNode = props.useSelectedNodeStore(state => state.selectNode) as any;
	const touchedNodesStore = useNodesTouchedStateStore();
	
	//let flowHashMap = useRef({} as any);

	//let positions = useRef({} as any);

	const gridSize = useRef(50);
	let stage = useRef(null);
	let canvasWrapper = useRef(null);
	let htmlWrapper = useRef(null);
	let layer = useRef(null);
	let stageGroup = useRef(null);
	let selectingRectRef = useRef(null);
	let lastMousePositionRef = useRef<any>(null);
	let canvasTopLeftPositionRef = useRef({x:0, y:0});

	let flowIsLoading = useRef(true);
	let flowIsFittedStageForSingleNode = useRef(false);
	let closestNodeWhenAddingNewNode = useRef(undefined);
	let orientationClosestNodeWhenAddingNewNode = useRef(false);
	let nodeOrientationClosestNodeWhenAddingNewNode = useRef(ThumbPositionRelativeToNode.default);
	

	let closestStartNodeWhenAddingNewNode = useRef(undefined);
	let closestEndNodeWhenAddingNewNode = useRef(undefined);
	let closestNodeAreLineNodes = useRef(false);
	let draggingMultipleNodes = useRef([] as any[]);
	let selectedNodes = useRef([] as any[]);
	let selectingRectInfo = useRef(undefined as any);
	let selectingViaAnnotationRef = useRef(undefined as any);

	let shapeRefs = useRef([] as any);
	let elementRefs = useRef([] as any);
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
	let mouseEndX = useRef(0);
	let mouseEndY = useRef(0);

	let mouseStartPointerX = useRef(0);
	let mouseStartPointerY = useRef(0);

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
	
	let connectionNodeThumbs = useRef("");
	let connectionNodeThumbsLineNode = useRef(undefined as any);

	let connectionNodeThumbPositionRelativeToNode = useRef(ThumbPositionRelativeToNode.default);
	let connectionNodeThumbPositionRelativeToEndNode = useRef(ThumbPositionRelativeToNode.default);
	let connectionNodeFollowFlow = useRef(ThumbFollowFlow.default);

	let shiftDown = useRef(false);
	let ctrlDown = useRef(false);

	let animationScript = useRef(undefined as any);
	let interactionState = useRef<InteractionState>(InteractionState.idle);	
	
	const selectedNodeRef = useRef(useSelectedNodeStore.getState().node);
	

	const getCurrentPosition = (event: any) => {
		let x = 0;
		let y = 0;
		if (!event || event.evt) {
			const stageInstance = (stage.current as any).getStage();
			if (stageInstance) {
				x = stageInstance.getPointerPosition().x;
				y = stageInstance.getPointerPosition().y;
			}
		} else {
			if (event.touches && event.touches.length > 0) {
				x = event.touches[0].screenX - canvasTopLeftPositionRef.current.x;
				y = event.touches[0].screenY - canvasTopLeftPositionRef.current.y;
			} else {
				x = event.clientX - canvasTopLeftPositionRef.current.x;
				y = event.clientY - canvasTopLeftPositionRef.current.y;
			}
		}
		return {
			x: x,
			y: y
		}
	}

	const updateTouchedNodes = () => {
		// DONT UPDATE STATE HERE!!!
		if  (touchedNodesLocal.current) {
			if (stage && stage.current) {
				let stageInstance = (stage.current as any).getStage();
				if (stageInstance) {
					Object.keys(shapeRefs.current).forEach((touchNodeId) => {
						if (touchNodeId === connectionForDraggingName) {
							return;
						}
						const lineRef = shapeRefs.current[touchNodeId];
						if (lineRef && lineRef.modifyShape(ModifyShapeEnum.GetShapeType, {}) == "line") {
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

	const setHtmlElementsPositionAndScale = (stageX, stageY, stageScale, newX? : number, newY?: number, node? : any, repositionSingleNode? : boolean) => {				

		flowStore.flow.map((flowNode) => {	
			if (flowNode.shapeType !== "Line") {
				const element = elementRefs.current[flowNode.name];
				if (element) {
					let x = parseFloat(element.getAttribute("data-x") || "");
					let y = parseFloat(element.getAttribute("data-y") || "");

					const clientElementHeight = element.clientHeight;

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
					setHtmlElementStyle(element, 0, 0, 1, x, y);	
					//setHtmlElementStyle(element, stageX, stageY, stageScale, x, y);	
				}	
			}		
		});

		// see also recalculateStartEndpoints
		setHtmlGlobalScale(stageX, stageY, stageScale);
	};

	//htmlWrapper
	const setHtmlGlobalScale = (stageX, stageY, stageScale) => {
		if (htmlWrapper && htmlWrapper.current) {
			(htmlWrapper.current as any).style.transform = 						
			"translate(" + (stageX ) + "px," + (stageY) + "px) "+
			"scale(" + (stageScale) + "," + (stageScale) + ") "
			;
		}
	};

	const setHtmlElementStyle = (element, stageX, stageY, stageScale, x, y) => {
		(element as any).style.transform = 						
			"translate(" + (stageX  + x*stageScale) + "px," + 
				(stageY  + y*stageScale) + "px) "+
			"scale(" + (stageScale) + "," + (stageScale) + ") "
			
			;
	}

	const { setNewPositionForNode } = useSetPositionHook(
		props.useFlowStore,

		draggingMultipleNodes,
		elementRefs,
		shapeRefs,
		gridSize,
		stage,
		mouseStartX,
		mouseStartY,
		mouseEndX,
		mouseEndY,
		stageX,
		stageY,
		stageScale,

		props.flowrunnerConnector,
		getCurrentPosition,
		setHtmlElementsPositionAndScale,
		props.getNodeInstance,
		updateTouchedNodes,
		props.saveFlow
	);

	useEffect(() => useSelectedNodeStore.subscribe(
		(node : any, previousNode : any) => {			
			console.log("useSelectedNodeStore.subscribe", node.name);
			selectedNodeRef.current = node;

			if (previousNode && previousNode.node) {
				const nodeElement = document.querySelector(`#${previousNode.node.id}`);
				if (nodeElement) {
					nodeElement.classList.remove("canvas__html-shape--selected");
				}
				const barElement = document.querySelector(`#${previousNode.node.id} .canvas__html-shape-bar`);
				if (barElement) {
					barElement.classList.remove("canvas__html-shape-bar--selected");
				}
				const htmlElement = document.querySelector(`#${previousNode.node.id}.canvas__html-shape`);
				if (htmlElement) {
					htmlElement.classList.add("canvas__html-shape");
				} else {					
					const shapeRef = shapeRefs.current[previousNode.node.id];
					if (shapeRef) {
						shapeRef.modifyShape(ModifyShapeEnum.SetState , {
							state: ShapeStateEnum.Default
						});
					}					
				}
			}

			if (node && node.node) {
				const nodeElement = document.querySelector(`#${node.node.id}`);
				if (nodeElement) {
					nodeElement.classList.add("canvas__html-shape--selected");
				}
				const barElement = document.querySelector(`#${node.node.id} .canvas__html-shape-bar`);
				if (barElement) {
					barElement.classList.add("canvas__html-shape-bar--selected");
				}
				const htmlElement = document.querySelector(`#${node.node.id}.canvas__html-shape`);
				if (htmlElement) {
					htmlElement.classList.add("canvas__html-shape");
				} else {
					
					const shapeRef = shapeRefs.current[node.node.id];
					if (shapeRef) {
						shapeRef.modifyShape(ModifyShapeEnum.SetState , {
							state: ShapeStateEnum.Selected
						});
					}
				
				}
			}
		},
		state => state.node
	), []);

	const droppableStyle = { color: isOver ? 'green' : undefined};

	const ctrlKey = 17;
	const shiftKey = 16;
	const cmdKey = 91;
	const pasteKey = 86;
	const backspaceKey = 8;
	const fKeyCapt = 70;
	const fKey = 102;

	let wheelTimeout = useRef(null);

	const onDocumentMouseMove = (event) => {
		if (event.touches && event.touches.length > 0) {
			lastMousePositionRef.current = {
				clientX: event.touches[0].screenX - canvasTopLeftPositionRef.current.x,
				clientY: event.touches[0].screenY - canvasTopLeftPositionRef.current.y
			};
		} else {
			lastMousePositionRef.current = {
				clientX: event.clientX - canvasTopLeftPositionRef.current.x,
				clientY: event.clientY - canvasTopLeftPositionRef.current.y
			};
		}
	};

	useEffect(() => {
		document.addEventListener("mousemove", onDocumentMouseMove);
		document.addEventListener("touchmove", onDocumentMouseMove);
		gridSize.current = canvasMode.snapToGrid ? 50 : 1;
		return () => {
			document.removeEventListener("mousemove", onDocumentMouseMove);
			document.removeEventListener("touchmove", onDocumentMouseMove);
		}
	}, []);

	const wheelEnableLayoutOnTimeout = () => {
		if (layer && layer.current) {
			(layer.current as any).listening(true);
			(layer.current as any).batchDraw();
		}
	};

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

		if (layer && layer.current && (layer.current as any).isListening()) {
			(layer.current as any).listening(false);
		}

		(wheelTimeout.current as any) = setTimeout(wheelEnableLayoutOnTimeout, 500);
		
		
		if (e.preventDefault) {
			e.preventDefault();
		}
		
		
		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();

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

			if (stageInstance !== undefined && stageInstance.getPointerPosition()) {
				
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

				setHtmlGlobalScale(newPos.x, newPos.y, newScale);
				
			}
			oldwheeltime.current = performance.now();
		}
		return false;
	};

	const updateDimensions = () => {
		//const stageContainerElement = (stage as any).current.attrs["container"];//document.querySelector(".stage-container");
		const stageContainerElement = (canvasWrapper as any).current;//document.querySelector("body .canvas-controller__scroll-container");

		const bodyElement = document.querySelector("body");
		if (stageContainerElement !== null && bodyElement !== null) {
			let widthCanvas = stageContainerElement.clientWidth;
			let heightCanvas = stageContainerElement.clientHeight;// - 112;
			
			if (heightCanvas === 0) {
				console.log("heightCanvas was 0");
				heightCanvas = bodyElement.clientHeight;// - 112;
				if (heightCanvas < 500) {
					heightCanvas = 500;
				}
			}
			if (widthCanvas === 0) {
				widthCanvas = bodyElement.clientWidth;
			}
			console.log("updateDimensions", stageContainerElement, widthCanvas, heightCanvas);
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
		lines.forEach((line, index) => {

			let insertValues : (string | number)[] = [];
			
			line.split(/\t/).forEach((value : string, index) => {
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

		const nodeIsSelected : boolean = !!selectedNodeRef.current;				
		
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
					
					positionContext.setPosition(newNode.name, {
						x: newNode.x,
						y: newNode.y
					});

					positionContext.setCommittedPosition(newNode.name, {
						x: newNode.x,
						y: newNode.y
					});

					flowStore.addFlowNode(newNode);
				}				
			}
		}

		// TODO : do we need to select the added node or dont? (see also the flow-actions)
		selectNode("", undefined);

		canvasMode.setConnectiongNodeCanvasMode(false);
		canvasMode.setSelectedTask("");		


		return false;
	}


	const nodeStateList = useRef([] as any[]);
	const nodeStateCount = useRef(0);
	const nodeStateTimeout = useRef(undefined);

	const nodeStateTimeoutCallback = () => {
		nodeStateList.current.map((nodeState) => {
			let nodeStateClass = nodeState.nodeState == "error" ? "has-error" : "";
			//const element = document.getElementById(nodeState.nodeName);
			const element = elementRefs.current[nodeState.nodeName];
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
			//const element = document.getElementById(touchNodeId);
			const element = elementRefs.current[touchNodeId];
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
					if (shapeRef) {
						shapeRef.modifyShape(ModifyShapeEnum.SetState , {
							state: ShapeStateEnum.Default
						});
					}
				}
			}
		});

		updateTouchedNodes();

		nodeStateList.current = [];
		nodeStateCount.current = 0;
	};

	const nodeStateObserver = (nodeName: string, nodeState : string, _touchedNodes : any) => {
		if (!updateNodeTouchedState) {
			return;
		}

		if (nodeStateTimeout.current) {
			clearTimeout(nodeStateTimeout.current);
			nodeStateTimeout.current = undefined;
		}

		if (nodeState === "RESET_ALL") {
			nodeStateList.current = [];
			nodeStateCount.current = 0;
			Object.keys(elementRefs.current).map((nodeName: string) => {
				const element = elementRefs.current[nodeName];
				if (element) {
					element.classList.remove("has-error");
				} 
			});

			Object.keys(shapeRefs.current).map((nodeName: string) => {
				if (nodeName === connectionForDraggingName) {
					return;
				}
				const shapeRef = shapeRefs.current[nodeName];
				if (shapeRef) {
					shapeRef.modifyShape(ModifyShapeEnum.SetState , {
						state: ShapeStateEnum.Default
					});
				} 
			});



			return;
		}		

		nodeStateCount.current += 1;
		nodeStateList.current.push({
			nodeState: nodeState,
			nodeName: nodeName
		});
		
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
		
		nodesStateLocal.current[nodeName] = nodeState;				
	}


	const cancelScroll = () => {
		(window as any).scrollTop = 0;
		(window as any).scrollLeft = 0;
		document.body.scrollTop = 0;
	}

	useLayoutEffect(() => {
		window.addEventListener("resize", onResize);
		window.addEventListener("scroll", cancelScroll);
		document.addEventListener('paste', onPaste);
		if (canvasWrapper.current) {
			console.log("ONWHEEL");
			(canvasWrapper.current as unknown as any).addEventListener("wheel", wheelEvent, {
				passive: false
			});
		}
		updateDimensions();	        
		document.body.scrollTop = 0;
		
		canvasTopLeftPositionRef.current = {x:0 , y: 0};
		const rect = (canvasWrapper as any).current.getBoundingClientRect();
		
		canvasTopLeftPositionRef.current = {x:rect.left , y: rect.top};

		touchedNodesStore.clearNodesTouched();
		props.flowrunnerConnector.unregisterNodeStateObserver("canvas");
		props.flowrunnerConnector.registerNodeStateObserver("canvas", nodeStateObserver);

		return () => {
			props.flowrunnerConnector.unregisterNodeStateObserver("canvas");
			window.removeEventListener("resize", onResize);
			window.removeEventListener("scroll", cancelScroll);
			if (canvasWrapper.current) {
				(canvasWrapper.current as unknown as any).removeEventListener("wheel", wheelEvent);
			}
		}
	}, []);

	useEffect(() => {
		const rect = (canvasWrapper as any).current.getBoundingClientRect();
		canvasTopLeftPositionRef.current = {x:rect.left , y: rect.top};
		updateDimensions();
		console.log("CANVAS BOUNDING RECT USEEFFECT" , rect, (canvasWrapper as any).current);
	}, []);

	const onResize = (event) => {
		updateDimensions();
		fitStage(undefined,true,true);
	};

	useEffect(() => {
		//(flowIsLoading as any).current = true;		

		let subscription;
		if (props.canvasToolbarsubject) {
			
			subscription = props.canvasToolbarsubject.subscribe({
				next: (message: string) => {
					if (unmounted.current) {
						return;
					}
					if (message === "loadFlow") {
						(flowIsLoading as any).current = true;
						setCanvasOpacity(props.initialOpacity);
					} else
					if (message === "fitStage") {
						console.log("FITSTAGE");
						fitStage(undefined, true, true);
						setCanvasOpacity(1);	
					} else 
					if (message === "reload") {
						setCanvasKey(canvasKey + 1);
					} else 
					if (message === "export") {
						exportCanvas();
					} else 
					if (message === "resetMultiSelect") {
						console.log("resetMultiSelect");
						deselectAllNodes();
						interactionState.current = InteractionState.idle;
						(selectingRectRef.current as any).opacity(0);
						
						if (stage && stage.current) {
							const stageInstance = (stage.current as any).getStage();		
							stageInstance.batchDraw();
						}

						canvasMode.setIsInMultiSelect(false, []);
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

	useEffect(() => {
		if (props.showsStateMachineUpdates && flowStore.flow.length > 0) {

			const clearStateNodes = () => {
				const htmlNodes = document.querySelectorAll("[data-task='State']");
				if (htmlNodes) {
					htmlNodes.forEach(htmlNode => {
						htmlNode.classList.remove("state-active");
					})
				}
			}

			const setCurrentStateNode = (stateName) => {
				clearStateNodes();
				console.log("setCurrentStateNode", stateName);
				const htmlNode = document.querySelector(`[data-state="${stateName}"]`);
				if (htmlNode) {
					htmlNode.classList.add("state-active");
				}
			}

			//clearStateNodes();
			setOnSetCanvasStateCallback((stateMachine: string, currentState) => {
				console.log("onStateChange", stateMachine, currentState);
				setCurrentStateNode(currentState);
			});
		}
		return () => {
			if (props.showsStateMachineUpdates) {
				resetOnSetCanvasStateCallback();
			}
		}
	}, [flowStore.flow]);

	
	
	const recalculateStartEndpoints = (doBatchdraw : boolean) => {

		const startPerf = performance.now();
		flowStore.flow.forEach((node, index) => {
			if (node.shapeType !== "Line") {
				let shapeRef = shapeRefs.current[node.name];
				if (shapeRef) {						
					//let element = document.getElementById(node.name);
					let element = elementRefs.current[node.name];
					if (element) {		
						const getPos = positionContext.getPosition(node.name);
						const position = getPos || {x:node.x,y:node.y};

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
						setHtmlElementStyle(element, 0, 0, 1, x, y);
						//setHtmlElementStyle(element, stageX, stageY, stageScale, x, y);

						setNewPositionForNode(undefined, node, (shapeRef as any), {x:position.x,y:position.y}, false, true, doBatchdraw , true);
					}
				}
			}
		});

		setHtmlGlobalScale(stageX.current, stageY.current, stageScale.current);

		if (!!doBatchdraw && stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance) {
				stageInstance.batchDraw();
			}
		}		
	};	

	useLayoutEffect(() => {

		window.addEventListener("resize", onResize);

		const lineRef = shapeRefs.current[connectionForDraggingName];
		if (lineRef) {
			lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 0});
		}

		const startPerf = performance.now();

		if (props.flowHasNodes) {
						
			if (props.flowState == FlowState.loading || props.flowState == FlowState.idle) {
				
				console.log("USELAYOUTEFFECT loading or idle");

				setCanvasOpacity(props.initialOpacity);
				(flowIsLoading as any).current = true;

				if (selectedNodeRef.current && selectedNodeRef.current.node !== undefined) {
					selectNode("", undefined);
				}
				
				
			} else
			if (props.flowState == FlowState.loaded && (flowIsLoading as any).current) {
				if (canvasOpacity == 0) {
					setCanvasOpacity(1);
				}
				(flowIsLoading as any).current = false;
				flowIsFittedStageForSingleNode.current = true;

				let perfstart = performance.now();

				positionContext.clearPositions();

				perfstart = performance.now();
				
				console.log("USELAYOUTEFFECT loaded flowIsLoading");

				flowStore.flow.map((node, index) => {					

					if (node.x !== undefined && node.y !== undefined) {						
						positionContext.setPosition(node.name , {
							x:node.x,
							y:node.y
						});

						positionContext.setCommittedPosition(node.name, {
							x:node.x,
							y:node.y
						});
					}
					if (node.xstart !== undefined && node.ystart !== undefined) {						
						positionContext.setPosition(node.name , {
							xstart: node.xstart,
							ystart: node.ystart,
							xend: node.xend,
							yend: node.yend
						});

						positionContext.setCommittedPosition(node.name , {
							xstart: node.xstart,
							ystart: node.ystart,
							xend: node.xend,
							yend: node.yend
						});
					}
				});

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


				setHtmlElementsPositionAndScale(stageX.current, stageY.current, stageScale.current);
				recalculateStartEndpoints(false);
				
			} else if (props.flowState == FlowState.loaded && !(flowIsLoading as any).current) {

				console.log("USELAYOUTEFFECT loaded not flowIsLoading");

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

				fitStage(undefined, false, false);
				flowIsFittedStageForSingleNode.current = true;
			}
		}
		
		selectedNodes.current = [];
		deselectAllNodes();
		interactionState.current = InteractionState.idle;
		(selectingRectRef.current as any).opacity(0);
		
		if (stage && stage.current) {
			const stageInstance = (stage.current as any).getStage();		
			stageInstance.batchDraw();
		}
		updateTouchedNodes();

		return () => {
			//props.flowrunnerConnector.unregisterNodeStateObserver("canvas");

			document.removeEventListener('paste', onPaste);

			window.removeEventListener("resize", onResize);
		}
	}, [props.flowState, flowStore.flow]);
	
	useLayoutEffect(() => {	
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
		connectionY,
		positionContext
	]);	

	const onCloneNode = (node, event) => {
		event.preventDefault();
		let newNode = getNewNode({...node}, flowStore.flow);
		newNode.x = newNode.x + 100;
		newNode.y = newNode.y + 100;
		
		positionContext.setPosition(newNode.name, {
			x: newNode.x,
			y: newNode.y
		});

		positionContext.setCommittedPosition(newNode.name, {
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

	const onShowNodeEditor = (node, settings, event) => {
		event.preventDefault();
		setEditNode(node);
		setEditNodeSettings(settings);
		setShowNodeEdit(true);
		return false;
	}	

	const onCloseEditNode = () => {
		setShowNodeEdit(false);
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
		console.log("onClickSetup", node, settings);
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
				
		const settings = ShapeSettings.getShapeSettings(node.taskType, node);		

		if (isConnectingNodesByDraggingLocal.current && touchNode.current && node) {
			if (node && node.shapeType === 'Line') {
				return;
			}

			const allowedInputs = FlowToCanvas.getAllowedInputs(node.shapeType, settings);
			if (allowedInputs == 0 || 
				!FlowToCanvas.canHaveInputs(node.shapeType, settings, flowStore.flow, node, flowStore.flowHashmap)) {
				document.body.style.cursor = 'not-allowed';
				return false;
			}

			if (!FlowToCanvas.canNodesConnect(touchNode.current, node)) {
				console.log("onMouseOver not allowed")
				document.body.style.cursor = 'not-allowed';
				return false;
			}
		}

		if (node.shapeType === "Diamond" && settings.altThumbPositions === 1) {
			connectionNodeThumbPositionRelativeToEndNode.current = ThumbPositionRelativeToNode.top;
		} else 
		if (node.shapeType === "Diamond" && !settings.altThumbPositions) {
			connectionNodeThumbPositionRelativeToEndNode.current = ThumbPositionRelativeToNode.default;
		}
        document.body.style.cursor = 'pointer';
		
	}
	
	const onMouseOut = () => {
        (document.body.style.cursor as any) = null;
	}

	
	const determineStartPosition = (group, pointerPosition, committed?: any) => {
		let newPosition = {x:0, y:0};
		let x = 0;
		let y = 0;
		
		if (group && group.attrs && group.attrs["x"]) {
			x = group.attrs["x"];
			y = group.attrs["y"];
			newPosition = {x:x, y:y};
		} else {
			x = group.x;
			y = group.y;
			newPosition = {x:x, y:y};
		}

		
		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance) {
				const scaleFactor = (stageInstance as any).scaleX();

				newPosition.x = ((pointerPosition.x - (stageInstance).x()) / scaleFactor);
				newPosition.y = ((pointerPosition.y - (stageInstance).y()) / scaleFactor);
					
				mouseStartX.current = newPosition.x - x;
				mouseStartY.current = newPosition.y - y;
				return true;
			}
		}
		console.log("mouseStart ", mouseStartX.current, mouseStartY.current);
		return false;
	}

	const determineEndPosition = (group, pointerPosition) => {

		let newPosition = {x:0, y:0};
		let x = 0;
		let y = 0;
		
		if (group && group.attrs && group.attrs["x"]) {
			x = group.attrs["x"];
			y = group.attrs["y"];
			newPosition = {x:x, y:y};
		} else {
			x = group.x;
			y = group.y;
			newPosition = {x:x, y:y};
		}
		
		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance) {
				const scaleFactor = (stageInstance as any).scaleX();

				newPosition.x = ((pointerPosition.x - (stageInstance).x()) / scaleFactor);
				newPosition.y = ((pointerPosition.y - (stageInstance).y()) / scaleFactor);
					
				mouseEndX.current = newPosition.x - x;
				mouseEndY.current = newPosition.y - y;
			}
		}
	}

	const onMouseStart = (node, event) => {

		console.log("ONMOUSESTART", node.name);

		if (interactionState.current === InteractionState.multiSelect) {			
			cancelDragStage();
			return false;
		}

		if (!!canvasMode.isConnectingNodes) {
			interactionState.current = InteractionState.addingNewConnection;

			(isConnectingNodesByDraggingLocal.current as any) = true;
			connectionNodeEvent.current = false;
			connectionNodeEventName.current = "";
			connectionNodeThumbs.current = "";
			connectionNodeThumbsLineNode.current = undefined;

			connectionNodeFollowFlow.current = ThumbFollowFlow.default;
			connectionNodeThumbPositionRelativeToNode.current = ThumbPositionRelativeToNode.default;
			connectionNodeThumbPositionRelativeToEndNode.current = ThumbPositionRelativeToNode.default;
			
			document.body.classList.add("connecting-nodes");

			touchNode.current = node;
			touchNodeGroup.current = event.currentTarget;		

			let newPosition = {
				x: 0,
				y: 0
			};

			if (stage && stage.current) {
				let stageInstance = (stage.current as any).getStage();
				if (stage) {
					var touchPos = getCurrentPosition(event);
					const scaleFactor = (stageInstance as any).scaleX();

					newPosition.x = ((touchPos.x - (stageInstance).x()) / scaleFactor);
					newPosition.y = ((touchPos.y - (stageInstance).y()) / scaleFactor);
					connectionXStart.current = newPosition.x;
					connectionYStart.current = newPosition.y;				
				}
			}
			cancelDragStage();
			return;
		}

		if (isConnectingNodesByDraggingLocal.current) {
			cancelDragStage();
			return false;
		}

		if (isPinching.current) {
			cancelDragStage();
			return;			
		}		

		if (!event.evt) {
			event.persist();
		}

		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance) {
				const touchPos = getCurrentPosition(event);
				mouseStartPointerX.current = touchPos.x;
				mouseStartPointerY.current = touchPos.y;
			}
		}	
		touching.current = true;
		touchNode.current = node;
		touchNodeGroup.current = event.currentTarget;
		mouseDragging.current = false;
		draggingMultipleNodes.current = [];

		if (node.taskType === "Annotation") {
			console.log("SELECT ANNOTATION");
			shapeRefs.current[node.name].modifyShape(ModifyShapeEnum.SetState,{
				state: ShapeStateEnum.Selected
			})
			selectedNodeRef.current = node;
			selectNode(node.name, node);
		}

		if (event.currentTarget) {
			
			document.body.classList.add("mouse--moving");
			if (node && node.shapeType === "Line") {					
				return;
			} else {
				let stageInstance = (stage.current as any).getStage();
				const scaleFactor = (stageInstance as any).scaleX();
				let _x = ((event.clientX - canvasTopLeftPositionRef.current.x) / scaleFactor);
				let _y = ((event.clientY - canvasTopLeftPositionRef.current.y) / scaleFactor);

/*
	What is the issue?
		we need x,y coordinates of the mousepointer for
		 html-nodes in the "space of the canvas"
		currently, the position of the stageinstance is used
		and this causes weird jumps
		probably because we're dealing with html-node events instead of konva events			
	
		implement a strategy factory pattern to get the correct coordinates of the mousepointer for the current canvas implementation


		clientX/clientY is the same as stageInstance.getPointerPosition()
			..BUT getPointerPosition is not updated when hovering over a DOM node

			There's now a getCurrentPosition(event) method which returns
				the coordinates depending on the event type
					
		The above issue is fixed, but:
		- it still occurs when dragging using shift-key (upstream/downstream)
		- when dragging a line, it disappears after mouse up
	
*/

				if (determineStartPosition(event.evt ? event.currentTarget : positionContext.getPosition(node.id), 
						getCurrentPosition(event),
						{x:stageX.current+_x,y:stageY.current+_y,
						screenX:event.clientX - canvasTopLeftPositionRef.current.x,
						screenY:event.clientY - canvasTopLeftPositionRef.current.y,
						canvasPointer: getCurrentPosition(event)}
					)) {
					if (node && 						
						((event.evt && !!event.evt.shiftKey) ||
						 (event && !!event.shiftKey)
						)
					 ) {			
						console.log("START DRAGGING MULTIPLE NODES");
						const width = getWidthForHtmlNode(node);
						if (node.name,mouseStartX.current > (width/2)) {
							interactionState.current = InteractionState.draggingNodesUpstream;
							getAllConnectedNodes(node, "output");
						} else
						if (node.name,mouseStartX.current < (width/2)) {
							interactionState.current = InteractionState.draggingNodesDownstream;
							getAllConnectedNodes(node, "input");
						}
					}
				}			
			}
		}
		console.log("ONMOUSESTAR2T", node.name, interactionState.current);
		if (interactionState.current === InteractionState.idle) { 
			return false;
		}
		return;

	}

	const getAllConnectedNodes = (node : any, mode: string) => {
		draggingMultipleNodes.current = [node.name];
		if (mode === "output") {
			getAllConnectedOutputNodes(node.name);
		} else
		if (mode === "input") {
			getAllConnectedInputNodes(node.name);
		}
	}
	
	const getAllConnectedOutputNodes = (nodeName : any) => {
		const mappedNode = flowStore.flowHashmap.get(nodeName);
		if (mappedNode) {
			const outputs = mappedNode.start;
			if (outputs && outputs.length > 0) {
				outputs.forEach(outputIndex => {
					const outputLineNode = flowStore.flow[outputIndex];
					if (outputLineNode.endshapeid && 
						draggingMultipleNodes.current.indexOf(outputLineNode.endshapeid) < 0) {							
						draggingMultipleNodes.current.push(outputLineNode.endshapeid);
						getAllConnectedOutputNodes(outputLineNode.endshapeid);
					}
				});
			}
		}
	}

	const getAllConnectedInputNodes = (nodeName : any) => {
		const mappedNode = flowStore.flowHashmap.get(nodeName);
		if (mappedNode) {
			const inputs = mappedNode.end;
			if (inputs && inputs.length > 0) {
				inputs.forEach(outputIndex => {
					const outputLineNode = flowStore.flow[outputIndex];
					if (outputLineNode.startshapeid && 
						draggingMultipleNodes.current.indexOf(outputLineNode.startshapeid) < 0) {
						draggingMultipleNodes.current.push(outputLineNode.startshapeid);
						getAllConnectedInputNodes(outputLineNode.startshapeid);
					}
				});
			}
		}
	}

	const getWidthForHtmlNode = (node : any) => {
		if (node) {					
			if (props.getNodeInstance) {
				const shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);
				if (shapeType === "Html") {
					const settings = ShapeSettings.getShapeSettings(node.taskType, node);
					const instance = props.getNodeInstance(node, undefined, undefined, settings);
					if (instance && instance.getWidth && instance.getHeight) {

						let width = instance.getWidth(node);
						let element = document.querySelector("#" + node.name + " .html-plugin-node");
						if (element) {
							
							const elementWidth = element.clientWidth;
							if (elementWidth > width) {
								width = elementWidth;
							}
						}
						return width;					
					}
				} else {
					if (shapeType == "Rect") {
						return ShapeMeasures.rectWidht
					} else
					if (shapeType == "Diamond") {
						return ShapeMeasures.diamondSize
					}
				}
			}
		}
		return 0;
	}

	const onMouseMove = (node, event) => {	
		if (interactionState.current === InteractionState.multiSelect) {
			return;
		}

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

		if (node.shapeType === "Line" || (touchNode.current && (touchNode.current as any).shapeType === "Line")) {
			if (touching.current && interactionState.current !== InteractionState.draggingNodesByConnection) {
				if (node.startshapeid) {				
					interactionState.current = InteractionState.draggingNodesByConnection;
					const shapeRef = shapeRefs.current[node.startshapeid];
					if (shapeRef) {
						determineStartPosition(shapeRef.getGroupRef(),
							getCurrentPosition(event));
					} else {
						determineStartPosition(positionContext.getPosition(node.startshapeid),
							getCurrentPosition(event));
					}	
					
				}
				if (node.endshapeid) {		
					interactionState.current = InteractionState.draggingNodesByConnection;
					const shapeRef = shapeRefs.current[node.endshapeid];
					if (shapeRef) {		
						determineEndPosition(shapeRef.getGroupRef(),
							getCurrentPosition(event));
					} else {
						determineEndPosition(positionContext.getPosition(node.endshapeid),
							getCurrentPosition(event));
					}
				}				
			}
			return;
		}
/*
		if (event.evt && event.evt.preventDefault) {
			event.evt.preventDefault();
			event.evt.cancelBubble = true;	
		} else {
			event.preventDefault();
			event.cancelBubble = true;
		}
*/
		if (!!canvasMode.isConnectingNodes) {
			cancelDragStage();
			return false;
		}

		if (touching.current && interactionState.current === InteractionState.idle) {
			mouseDragging.current = true;
			document.body.classList.add("mouse--moving");
			interactionState.current = InteractionState.draggingNode;

			if (node.shapeType === "Section" &&
				node.taskType === "Annotation") {

				//selectingRectRef.current = shapeRefs.current[node.name];
				const position = positionContext.getPosition(node.name);

				console.log("Set draggingSection nodes",
					position, node, node.nodes
				);

				selectingViaAnnotationRef.current = {
					ref: shapeRefs.current[node.name],
					nodeName : node.name,
					x: position?.x ?? node.x,
					y: position?.y ?? node.y
				};

				interactionState.current = InteractionState.draggingSection;
				selectedNodes.current = [...node.nodes];
				touching.current = true;
				mouseDragging.current = false;
				draggingMultipleNodes.current = [...node.nodes];
				//canvasMode.setIsInMultiSelect(true, [...node.nodes]);
			}
			return;
		}
		return;
		//return false;
	}

	const clearConnectionState = () => {
console.log("clearstate");
		touching.current = false
		isConnectingNodesByDraggingLocal.current = false;
		connectionNodeEvent.current = false;

		connectionNodeThumbPositionRelativeToNode.current = ThumbPositionRelativeToNode.default;
		connectionNodeFollowFlow.current = ThumbFollowFlow.default;

		connectionNodeEventName.current = "";
		(touchNode.current as any) = undefined;
		touchNodeGroup.current = undefined;
		connectionNodeThumbsLineNode.current = undefined;
		interactionState.current = InteractionState.idle;

		const lineRef = shapeRefs.current[connectionForDraggingName];
		if (lineRef) {
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

		selectingViaAnnotationRef.current = undefined;
	}

	const connectConnectionToNode = (node, thumbPositionRelativeToNode?) => {

console.log("connectConnectionToNode" , node);

		let eventHelper : any = undefined;
		if (connectionNodeEventName !== undefined &&
			connectionNodeEventName.current !== "" && 
			!isNaN(connectionNodeEvent.current as number)) {
			eventHelper = {};
			eventHelper.event = connectionNodeEventName.current;
		}


		if (node && node.shapeType === "Line") {
			return;
		}

		const settings = ShapeSettings.getShapeSettings(node.taskType, node);	
		const allowedInputs = FlowToCanvas.getAllowedInputs(node.shapeType, settings);
		if (allowedInputs == 0 || 
			!FlowToCanvas.canHaveInputs(node.shapeType, settings, flowStore.flow, node, flowStore.flowHashmap)) {
			clearConnectionState();
			return false;
		}

		// nodeFrom touchNode.current
		// nodeTo node
		const connection = getNewConnection(touchNode.current, node, props.getNodeInstance, eventHelper,
			connectionNodeThumbPositionRelativeToNode.current);
		
		if (touchNode.current && (touchNode.current as any).curveMode === "arc") {
			(connection as any).curveMode = "arc";
		}

		if (touchNode.current && (touchNode.current as any).curveMode === "straight") {
			(connection as any).curveMode = "straight";
		}

		if (connection.startshapeid === connection.endshapeid) {
			console.log("WARNING : DONT CONNECT FROM NODE to ITSELF!!!");
			return false;
		}

		(connection as any).thumbPosition = connectionNodeThumbPositionRelativeToNode.current;

		if (connectionNodeFollowFlow.current == ThumbFollowFlow.happyFlow) {
			(connection as any).followflow = "onsuccess";
		} else
		if (connectionNodeFollowFlow.current == ThumbFollowFlow.unhappyFlow) {
			(connection as any).followflow = "onfailure";
		}

		if (thumbPositionRelativeToNode !== undefined) {
			(connection as any).thumbEndPosition = thumbPositionRelativeToNode;
		}
		
		if (node.shapeType === "Diamond" && settings.altThumbPositions === 1) {
			(connection as any).thumbEndPosition = ThumbPositionRelativeToNode.top;
		} 

		if (connectionNodeEventName.current !== "" && 
			!isNaN(connectionNodeEvent.current as number)) {
			(connection as any).event = connectionNodeEventName.current; // this is an object not a string!!
		}
		
		clearConnectionState();

		positionContext.setPosition(connection.name, {
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
	
		if (node.shapeType === "Line") {
			if (interactionState.current !== InteractionState.draggingNodesByConnection) {
				touching.current = false;
				(touchNode.current as any) = undefined;
				touchNodeGroup.current = undefined;
				mouseDragging.current = false;
				draggingMultipleNodes.current = [];
				interactionState.current = InteractionState.idle;

				selectNode(node.name, node);
			}
			return;
		} else 
		if (node.shapeType === "Rect" ||node.shapeType === "Diamond" ) {
			if (interactionState.current === InteractionState.idle) {

				console.log("onmouseend rect/diamond idle", node.name, event);

				touching.current = false;
				(touchNode.current as any) = undefined;
				touchNodeGroup.current = undefined;
				mouseDragging.current = false;
				draggingMultipleNodes.current = [];
				interactionState.current = InteractionState.idle;

				selectNode(node.name, node);
				selectedNodeRef.current = node;
				(document.body.style.cursor as any) = null;
				document.body.classList.remove("mouse--moving");
				return;
			}
		}

		selectedNodeRef.current = node;

		if (interactionState.current === InteractionState.draggingConnectionEnd) {
			// Bij het verlepen van een eindpunt naar een andere node
			// en je hovert over een DOM-node... dan kom je hier uberhaupt niet...
			//return;
		}
		(document.body.style.cursor as any) = null;
		document.body.classList.remove("mouse--moving");

		if (isConnectingNodesByDraggingLocal.current && touchNode.current && node) {			

			if (isConnectingNodesByDraggingLocal.current && touchNode.current && node) {
				if (connectionNodeThumbsLineNode.current) {

					//connectionNodeThumbsLineNode.current.endshapeid = node.name;
					let clonedNode = {...connectionNodeThumbsLineNode.current};
					clonedNode.endshapeid = node.name;
					connectionNodeThumbsLineNode.current = clonedNode;
					return;
				}
				
				if (!FlowToCanvas.canNodesConnect(touchNode.current, node)) {
					console.log("onMouseEnd not allowed")
					return false;
				}

				connectConnectionToNode(node);
			}
			return false;
		}			
	
		if (touchNodeGroup.current != event.currentTarget) {
			return false;
		}
		if (!!canvasMode.isConnectingNodes) {
			return false;
		}
		
		if (event.currentTarget && mouseDragging.current) {
			return;
		}
console.log("onmouseend", node.name);
		if (event.evt) {
			event.evt.preventDefault();
			event.evt.cancelBubble = true;
		} else {
			event.preventDefault();
			event.cancelBubble = true;
		}

		touching.current = false;
		dragTime.current = undefined;
		
		touchNodeGroup.current = undefined;
		if (event.currentTarget && mouseDragging.current) {
			setNewPositionForNode(event, node, shapeRefs.current[node.name], undefined, true, false, true);

			if (closestNodeAreLineNodes.current) {
				connectNodeToExistingLines(node);
			}
		} else {
			canvasMode.setConnectiongNodeCanvasMode(false);
		}
		(touchNode.current as any) = undefined;
		mouseDragging.current = false;
		return false;
	};

	const connectNodeToExistingLines = (node : any) => {
		if (closestEndNodeWhenAddingNewNode.current) {
			const closestEndConnectionNode = closestEndNodeWhenAddingNewNode.current as any;
			closestEndConnectionNode.startshapeid = node.name;
			flowStore.storeFlowNode(closestEndConnectionNode,closestEndConnectionNode.name, 
				positionContext.context);
		}
		if (closestStartNodeWhenAddingNewNode.current) {
			const closestStartConnectionNode = closestStartNodeWhenAddingNewNode.current as any;
			closestStartConnectionNode.endshapeid = node.name;
			flowStore.storeFlowNode(closestStartConnectionNode,closestStartConnectionNode.name,
				positionContext.context);
		}
	}

	const storeNodeAndUpdate = (node, nodeName) => {
		console.log("storeNodeAndUpdate call", nodeName, node);
		const unsubscribe = (props.useFlowStore as any).subscribe(state => {
			console.log("storeNodeAndUpdate listener", nodeName, state)
			if (props.flowrunnerConnector.hasStorageProvider) {
				props.saveFlow(false, state.flow);
			}
		});
		flowStore.storeFlowNode(node, nodeName, positionContext.context);
		unsubscribe();
		
	};

	const removeOrAddNodeToSections = (node : any) => {
		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance) {
				let nodeWidth : number = 0;
				let nodeHeight : number = 0;
				const taskSettings = FlowToCanvas.getTaskSettings(node.taskType);

				let shapeType = FlowToCanvas.getShapeTypeUsingSettings(node.shapeType, node.taskType, node.isStartEnd, taskSettings);

				let positionNode = positionContext.getPosition(node.name) || {x:node.x,y:node.y};
				if (!positionNode) {
					positionNode = {
						x: node.x,
						y: node.y
					}
				}

				positionNode.x = positionNode?.x ?? node.x;
				positionNode.y = positionNode?.y ?? node.y; 

				if (shapeType === "Html") {
												
					if (props.getNodeInstance) {
						const instance = props.getNodeInstance(node, props.flowrunnerConnector, flowStore.flow, taskSettings);
						if (instance) {
							if (instance.getWidth && instance.getHeight) {
								nodeWidth = instance.getWidth(node);
								nodeHeight = instance.getHeight(node);
							}
						}
					}

					let element = document.querySelector("#" + node.name + " .html-plugin-node");
					if (element) {

						const elementHeight = element.clientHeight;
						nodeHeight = elementHeight;

						const elementWidth = element.clientWidth;
						nodeWidth = elementWidth;
					}

					nodeWidth = (nodeWidth || node.width || 250);
					nodeHeight = (nodeHeight || node.height || 250);
				} else {
					nodeWidth = 100;
					nodeHeight = 50;

					if (shapeType === 'Circle') {
						nodeWidth = ShapeMeasures.circleSize;
						nodeHeight = ShapeMeasures.circleSize;
					} else 
					if (shapeType === 'Diamond') {
						nodeWidth = ShapeMeasures.diamondSize;
						nodeHeight = ShapeMeasures.diamondSize;
					} else {
						nodeWidth = ShapeMeasures.rectWidht 
						nodeHeight = ShapeMeasures.rectHeight;
					}
				}
			
				flowStore.flow.map(flowNode => {
					if (flowNode.taskType === "Annotation" && flowNode.shapeType === "Section") {
						let position = {
							x: 0,
							y: 0
						}
						let positionHelper = positionContext.getPosition(flowNode.name);												

						position.x = positionHelper?.x ?? (flowNode?.x ?? 0);
						position.y = positionHelper?.y ?? (flowNode?.y ?? 0);

						const isNodeInNodeList = (flowNode.nodes.indexOf(node.name) >= 0);
					
						const isNodeInSectionRect = (
							position.x <= positionNode.x && 
							position.y <= positionNode.y && 
							(positionNode.x + nodeWidth < position.x + flowNode.width) && 
							(positionNode.y + nodeHeight < position.y + flowNode.height)
						);

						console.log("removeOrAddNodeToSections" , node.name, isNodeInNodeList , isNodeInSectionRect);

						if (isNodeInNodeList && !isNodeInSectionRect) {
							const nodes = flowNode.nodes.filter(nodeName => nodeName !== node.name);
							/*flowStore.storeFlowNode({...flowNode, nodes}, flowNode.name);
							if (props.flowrunnerConnector.hasStorageProvider) {
								props.saveFlow();
							}*/
							storeNodeAndUpdate({...flowNode, nodes}, flowNode.name);
						} else 
						if (!isNodeInNodeList && isNodeInSectionRect) {
							const nodes = flowNode.nodes.concat(node.name);
							/*flowStore.storeFlowNode({...flowNode, nodes}, flowNode.name);
							if (props.flowrunnerConnector.hasStorageProvider) {
								props.saveFlow();
							}*/

							storeNodeAndUpdate({...flowNode, nodes}, flowNode.name);
						}
					}
				});
			
									
				const touchPos = getCurrentPosition(event);
				let width = touchPos.x - mouseStartPointerX.current;
				let height = touchPos.y - mouseStartPointerY.current;
				const scaleFactor = (stageInstance as any).scaleX();

				
				let x = (mouseStartPointerX.current  - (stageInstance).x()) / scaleFactor;
				let y = (mouseStartPointerY.current  - (stageInstance).y()) / scaleFactor;
				let scaledWidth = width / scaleFactor;
				let scaledHeight = height / scaleFactor;
				let nodesInBoundary : any = [];
				flowStore.flow.map((node, index) => {
					if (node.shapeType !== "Line") {
						

						/*if  {
							nodesInBoundary.push(node.name);

							if (shapeType === "Html") {
															
								let element = document.querySelector("#" + node.name);
								if (element) {
									element.classList.add("selected");
								}
							}
						} else {
							if (shapeType === "Html") {
															
								let element = document.querySelector("#" + node.name);
								if (element) {
									element.classList.remove("selected");
								}
							}
						}
						*/
					}
				});
	
			}
		}
	};

	const onStageMouseEnd = (event) => {
		console.log("onStageMouseEnd", interactionState.current);
		if (interactionState.current === InteractionState.selectingNodes) {
			interactionState.current = InteractionState.multiSelect;
			const nodes = selectNodesForSelectRectangle(event);
			canvasMode.setIsInMultiSelect(true, nodes);
			return;
		}
		if (interactionState.current === InteractionState.idle) {
			touching.current = false;
			return;
		}

		if (isPinching.current) {
			isPinching.current = false;
			return;			
		}
		let haveMouseEventFallThrough = false;
		if ((interactionState.current == InteractionState.multiSelect && touching.current) ||
			touching.current || isConnectingNodesByDraggingLocal.current) {
			
			if (stage && stage.current) {
				let stageInstance = (stage.current as any).getStage();
				if (interactionState.current == InteractionState.multiSelect ||
					(connectionNodeThumbs.current === "" && 
					!isConnectingNodesByDraggingLocal.current && 
					mouseDragging.current && touchNode.current)) {
					
						if (draggingMultipleNodes.current && draggingMultipleNodes.current.length > 0) {
							
							// MULTIPLE NODES

							if (stage && stage.current) {
								let stageInstance = (stage.current as any).getStage();
								if (stageInstance) {
									const touchPos = getCurrentPosition(event);
									let offsetX = touchPos.x - mouseStartPointerX.current;
									let offsetY = touchPos.y - mouseStartPointerY.current;
									const scaleFactor = (stageInstance as any).scaleX();
					
									let offsetPosition = {
										x: 0,
										y: 0
									};
									offsetPosition.x = ((offsetX ) / scaleFactor);
									offsetPosition.y = ((offsetY ) / scaleFactor);
								
									draggingMultipleNodes.current.forEach((nodeName) => {
										let mappedNode = flowStore.flowHashmap.get(nodeName);
										if (mappedNode) {				
											let draggingNode = flowStore.flow[mappedNode.index];
											if (draggingNode) {
												setNewPositionForNode(event, draggingNode, shapeRefs.current[nodeName], event.evt && event.evt.screenX ? {
													x: event.evt.screenX,
													y: event.evt.screenY
												} : (event.screenX ? {
													x: event.screenX,
													y: event.screenY
												} : undefined), true, false, true, false, false, offsetPosition);
											}
										}
									})
								}
							}

							if (stage && stage.current) {
								let stageInstance = (stage.current as any).getStage();
								stageInstance.batchDraw();
							}
							updateTouchedNodes();

							canvasMode.setConnectiongNodeCanvasMode(false);
							if (props.flowrunnerConnector.hasStorageProvider) {
								props.saveFlow();
							}							
						} else {
							
							// SINGLE NODE

							if ((touchNode.current as any).shapeType === "Line") {
								let lineNode = (touchNode.current as any);
								if (lineNode.startshapeid) {
									const startNode = flowStore.flow[flowStore.flowHashmap.get(lineNode.startshapeid).index];
									if (startNode) {	
										setNewPositionForNode(event, startNode, shapeRefs.current[startNode.name], 
											event.evt && event.evt.screenX ? {
												x: event.evt.screenX ,
												y: event.evt.screenY 
											} : (event.screenX ? {
												x: event.screenX ,
												y: event.screenY 
											} : undefined), true, false, true);
									}
								}
								if (lineNode.endshapeid) {
									const endNode = flowStore.flow[flowStore.flowHashmap.get(lineNode.endshapeid).index];
									if (endNode) {
										setNewPositionForNode(event, endNode, 
											shapeRefs.current[endNode.name], 
											event.evt && event.evt.screenX ? {
												x: event.evt.screenX,
												y: event.evt.screenY
											} : (event.screenX ? {
												x: event.screenX,
												y: event.screenY
											} : undefined), true, false, true, false, true);
									}
								}
							}
							
							setNewPositionForNode(event, touchNode.current as any, shapeRefs.current[(touchNode.current as any).name], undefined, true, false, true);
							
							if (touchNode.current && (touchNode.current as any).name) {
								flowStore.storeFlowNode(touchNode.current, (touchNode.current as any).name, positionContext.context);
							}

							if ((touchNode.current as any).shapeType !== "Line" && 
								(touchNode.current as any).taskType !== "Annotation" &&
								(touchNode.current as any).shapeType !== "Secion" &&
								interactionState.current === InteractionState.draggingNode) {

								removeOrAddNodeToSections(touchNode.current);
								console.log("onstagemouseend singlenode" , interactionState.current);
							}

							if (closestNodeAreLineNodes.current) {
								connectNodeToExistingLines(touchNode.current);
							}							
					}
				} else {
					const touchPos = getCurrentPosition(event);
					if (connectionNodeThumbs.current === "thumbstart") { 												
						const scaleFactor = (stageInstance as any).scaleX();
		
						let newPosition = {
							x: 0,
							y: 0
						};
						newPosition.x = ((touchPos.x - (stageInstance).x()) / scaleFactor);
						newPosition.y = ((touchPos.y - (stageInstance).y()) / scaleFactor);
						
						let endPosition = positionContext.getPosition(connectionNodeThumbsLineNode.current.name) || {
								xend : connectionNodeThumbsLineNode.current.xend,
								yend: connectionNodeThumbsLineNode.current.yend
							};

							positionContext.setPosition(connectionNodeThumbsLineNode.current.name, {
							xstart: newPosition.x,
							ystart: newPosition.y,
							xend:endPosition.xend,
							yend:endPosition.yend
						});

						let endpoints = {
							...connectionNodeThumbsLineNode.current,
							xstart : newPosition.x,
							ystart : newPosition.y,
							xend : endPosition.xend,
							yend : endPosition.yend
						}
						connectionNodeThumbsLineNode.current = endpoints;

						props.flowrunnerConnector.forcePushToFlowRunner = true;
						flowStore.storeFlowNode(connectionNodeThumbsLineNode.current, connectionNodeThumbsLineNode.current.name, positionContext.context);

					} else 
					if (connectionNodeThumbs.current === "thumbend") {
						const scaleFactor = (stageInstance as any).scaleX();
		
						let newPosition = {
							x: 0,
							y: 0
						};
						newPosition.x = ((touchPos.x - (stageInstance).x()) / scaleFactor);
						newPosition.y = ((touchPos.y - (stageInstance).y()) / scaleFactor);
						
						let startPosition = positionContext.getPosition(connectionNodeThumbsLineNode.current.name) || {
							xstart : connectionNodeThumbsLineNode.current.xstart,
							ystart: connectionNodeThumbsLineNode.current.ystart
						};

						positionContext.setPosition(connectionNodeThumbsLineNode.current.name, {							
							xstart: startPosition.xstart,
							ystart: startPosition.ystart,
							xend: newPosition.x,
							yend: newPosition.y,
						});
						
						let endpoints = {
							...connectionNodeThumbsLineNode.current,
							xstart : startPosition.xstart,
							ystart : startPosition.ystart,
							xend : newPosition.x,
							yend : newPosition.y
						}
						
						connectionNodeThumbsLineNode.current = endpoints;

						props.flowrunnerConnector.forcePushToFlowRunner = true;
						flowStore.storeFlowNode(connectionNodeThumbsLineNode.current, connectionNodeThumbsLineNode.current.name, positionContext.context);
						const nodeName = connectionNodeThumbsLineNode.current.startshapeid;						
					} else {
						haveMouseEventFallThrough = true;
					}
				}

				if (interactionState.current === InteractionState.draggingSection) {
					updateSelectRectangle(event);
				}
				
				if (!haveMouseEventFallThrough) {
					cancelDragStage();
					if (event.evt) {
						event.evt.preventDefault();
						event.evt.cancelBubble = true;
					} else {
						event.preventDefault();
						event.cancelBubble = true;
					}

					if (interactionState.current !== InteractionState.multiSelect) {
						clearConnectionState();
					}
				}		
				
				
				if (props.flowrunnerConnector.hasStorageProvider) {
					// TODO : is this neccesary?
					// TODO : replace calls to storeFlowNode etc .. with calls that
					//   wrap a subscribe and call saveFlow from there...
					//props.saveFlow();
				}

				dragTime.current = undefined;
				touching.current = false;

				(touchNode.current as any) = undefined;
				touchNodeGroup.current = undefined;
				isConnectingNodesByDraggingLocal.current = false;
				connectionNodeEvent.current = false;
				connectionNodeEventName.current = "";
				connectionNodeThumbs.current = "";
				connectionNodeThumbsLineNode.current = undefined;				

				connectionNodeThumbPositionRelativeToNode.current = ThumbPositionRelativeToNode.default;
				connectionNodeFollowFlow.current = ThumbFollowFlow.default;

				document.body.classList.remove("connecting-nodes");
				document.body.classList.remove("mouse--moving");
				(document.body.style.cursor as any) = null;
console.log("onstagemouseend in reset", interactionState.current, selectingViaAnnotationRef.current);
				if (interactionState.current !== InteractionState.multiSelect) {
					
					interactionState.current = InteractionState.idle;

					
				} else {
					handleMultiSelectCursor(event);
					updateSelectRectangle(event);					
				}				

				selectingViaAnnotationRef.current = undefined;

				const lineRef = shapeRefs.current[connectionForDraggingName];
				if (lineRef) {
					lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 0});				
				}
		
				if (stageInstance) {
					stageInstance.batchDraw();
				}	
			}
			return false;
		}
	}

	const triggerNode = (nodeName) => {
		if (nodeName) {
			let mappedNode = flowStore.flowHashmap.get(nodeName);
			if (mappedNode && mappedNode.index >= 0) {
				let startNode = flowStore.flow[mappedNode.index];
				if (startNode) {
					//flowStore.storeFlowNode(startNode, nodeName);
					props.flowrunnerConnector?.executeFlowNode(nodeName);
				}
			}
		}
	}

	const onStageMouseLeave = (event) => {
	
		onStageMouseEnd(event);
console.log("onStageMouseLeave", event);
		if (interactionState.current === InteractionState.selectingNodes) {
			interactionState.current = InteractionState.idle;
			(selectingRectRef.current as any).opacity(0);
			selectedNodes.current = [];
			deselectAllNodes();
			touching.current = false;
		}

		if (event.evt) {
			event.evt.preventDefault();
			event.evt.cancelBubble = true;
		} else {
			event.preventDefault();
			event.cancelBubble = true;
		}

		const lineRef = shapeRefs.current[connectionForDraggingName];
		if (lineRef) {
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
		(document.body.style.cursor as any) = null;
		touching.current = false;
		dragTime.current = undefined;
		(touchNode.current as any) = undefined;
		touchNodeGroup.current = undefined;
		isPinching.current = false;
		
		connectionNodeThumbsLineNode.current = undefined;

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
		if (event && event.evt && !!event.evt.shiftKey) {
			console.log("onStageTouchStart with SHIFT");
			cancelDragStage();
			selectedNodes.current = [];
			interactionState.current = InteractionState.selectingNodes;
			if (stage && stage.current) {
				let stageInstance = (stage.current as any).getStage();
				if (stageInstance) {					
					const touchPos = getCurrentPosition(event);
					mouseStartPointerX.current = touchPos.x;
					mouseStartPointerY.current = touchPos.y;
				}
			}
			return false;
		}

		if (interactionState.current === InteractionState.multiSelect) {
			if (selectedNodes.current.length > 0) {
				if (stage && stage.current) {
					let stageInstance = (stage.current as any).getStage();
					if (stageInstance) {
						const touchPos = getCurrentPosition(event);
						mouseStartPointerX.current = touchPos.x;
						mouseStartPointerY.current = touchPos.y;
					}
				}	
		
				touching.current = true;
				mouseDragging.current = false;
				draggingMultipleNodes.current = [...selectedNodes.current];
				document.body.classList.add("mouse--moving");
			} else {
				interactionState.current = InteractionState.idle;
			}
			return;
		}

		if (!!canvasMode.isConnectingNodes) {
			cancelDragStage();
			return false;
		}
		if (touchNode.current && touchNodeGroup.current) {
			cancelDragStage();
		} else {
			if (event.evt && event.evt.touches && event.evt.touches.length > 1) {
				isPinching.current = true;
				cancelDragStage();

				if (event.evt.touches.length == 2) {
					pinchStartPosition.current = {
						x: (event.evt.touches[0].screenX + event.evt.touches[1].screenX)/2,
						y: (event.evt.touches[0].screenY + event.evt.touches[1].screenY)/2
					};
					
					const x = event.evt.touches[0].screenX - event.evt.touches[1].screenX;
					const y = event.evt.touches[0].screenY - event.evt.touches[1].screenY;
					 
					startDistance.current = Math.sqrt( x*x + y*y );
				}
			}
		}
	}

	const showSelectRectangle = (event) => {
		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance) {
								
				const touchPos = getCurrentPosition(event);
				let width = touchPos.x - mouseStartPointerX.current;
				let height = touchPos.y - mouseStartPointerY.current;
				const scaleFactor = (stageInstance as any).scaleX();

				if (selectingViaAnnotationRef.current) {
					
				} else {
					(selectingRectRef.current as any).opacity(1);
					(selectingRectRef.current as any).x((mouseStartPointerX.current  - (stageInstance).x()) / scaleFactor);
					(selectingRectRef.current as any).y((mouseStartPointerY.current  - (stageInstance).y()) / scaleFactor);
					(selectingRectRef.current as any).width((width) / scaleFactor);
					(selectingRectRef.current as any).height((height) / scaleFactor);
					(selectingRectRef.current as any).draw();

					selectingRectInfo.current = {
						x: mouseStartPointerX.current,
						y: mouseStartPointerY.current,
						width: width,
						height: height
					}
					setMultiSelectInfo(
						(mouseStartPointerX.current  - (stageInstance).x()) / scaleFactor , 
						(mouseStartPointerY.current  - (stageInstance).y()) / scaleFactor , 
						(width) / scaleFactor, 
						(height) / scaleFactor
					);
					stageInstance.batchDraw();

				}
			}
		}
	}

	const deselectAllNodes = () => {
		selectedNodes.current = [];
		flowStore.flow.map((node, index) => {
			if (node.shapeType !== "Line") {
				const taskSettings = FlowToCanvas.getTaskSettings(node.taskType);
				let shapeType = FlowToCanvas.getShapeTypeUsingSettings(node.shapeType, node.taskType, node.isStartEnd, taskSettings);
			
				if (shapeType === "Html") {
					const element = document.querySelector("#" + node.name);
					if (element) {
						element.classList.remove("selected");
					}
				}
			}
		});
	};

	const selectNodesForSelectRectangle = (event) => {
		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance) {
								
				const touchPos = getCurrentPosition(event);
				let width = touchPos.x - mouseStartPointerX.current;
				let height = touchPos.y - mouseStartPointerY.current;
				const scaleFactor = (stageInstance as any).scaleX();

				
				let x = (mouseStartPointerX.current  - (stageInstance).x()) / scaleFactor;
				let y = (mouseStartPointerY.current  - (stageInstance).y()) / scaleFactor;
				let scaledWidth = width / scaleFactor;
				let scaledHeight = height / scaleFactor;
				let nodesInBoundary : any = [];
				flowStore.flow.map((node, index) => {
					if (node.shapeType !== "Line") {
						let nodeWidth : number = 0;
						let nodeHeight : number = 0;
						const taskSettings = FlowToCanvas.getTaskSettings(node.taskType);
						let shapeType = FlowToCanvas.getShapeTypeUsingSettings(node.shapeType, node.taskType, node.isStartEnd, taskSettings);
					
						const position = positionContext.getPosition(node.name) || {x:node.x,y:node.y};

						if (shapeType === "Html") {
														
							if (props.getNodeInstance) {
								const instance = props.getNodeInstance(node, props.flowrunnerConnector, flowStore.flow, taskSettings);
								if (instance) {
									if (instance.getWidth && instance.getHeight) {
										nodeWidth = instance.getWidth(node);
										nodeHeight = instance.getHeight(node);
									}
								}
							}

							let element = document.querySelector("#" + node.name + " .html-plugin-node");
							if (element) {

								const elementHeight = element.clientHeight;
								if (elementHeight > height) {
									nodeHeight = elementHeight;
								}

								const elementWidth = element.clientWidth;
								if (elementWidth > width) {
									nodeWidth = elementWidth;
								}
							}

							nodeWidth = (nodeWidth || node.width || 250);
							nodeHeight = (nodeHeight || node.height || 250);
						} else {
							nodeWidth = 100;
							nodeHeight = 50;

							if (shapeType === 'Circle') {
								nodeWidth = ShapeMeasures.circleSize;
								nodeHeight = ShapeMeasures.circleSize;
							} else 
							if (shapeType === 'Diamond') {
								nodeWidth = ShapeMeasures.diamondSize;
								nodeHeight = ShapeMeasures.diamondSize;
							} else {
								nodeWidth = ShapeMeasures.rectWidht 
								nodeHeight = ShapeMeasures.rectHeight;
							}
						}

						if (x <= position.x && y <= position.y && 
							(position.x+nodeWidth < x + scaledWidth) && 
							(position.y+nodeHeight < y + scaledHeight)) {
							nodesInBoundary.push(node.name);

							if (shapeType === "Html") {
															
								let element = document.querySelector("#" + node.name);
								if (element) {
									element.classList.add("selected");
								}
							}
						} else {
							if (shapeType === "Html") {
															
								let element = document.querySelector("#" + node.name);
								if (element) {
									element.classList.remove("selected");
								}
							}
						}
					}
				});

				selectedNodes.current = nodesInBoundary;
				return nodesInBoundary;

			}
		}
		return [];
	};
	
	const moveSelectRectangle = (event) => {
		// selectingRectInfo
		if (stage && stage.current && (
			selectingRectInfo.current || selectingViaAnnotationRef.current)) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance) {
				const touchPos = getCurrentPosition(event);
				let offsetX = touchPos.x - mouseStartPointerX.current;
				let offsetY = touchPos.y - mouseStartPointerY.current;
				const scaleFactor = (stageInstance as any).scaleX();

				if (selectingViaAnnotationRef.current) {
					console.log("moveSelectRectangle : selectingViaAnnotationRef.current", selectingViaAnnotationRef.current , 
						((offsetX - (stageInstance).x()) / scaleFactor)	,
						((offsetY - (stageInstance).y()) / scaleFactor));
					
					const offsetPosition = {
						x: 0,
						y: 0
					};
					offsetPosition.x = ((offsetX ) / scaleFactor);
					offsetPosition.y = ((offsetY ) / scaleFactor);

					selectingViaAnnotationRef.current.ref.modifyShape(
						ModifyShapeEnum.SetXY,
						{
							x: selectingViaAnnotationRef.current.x + offsetPosition.x ,
							y: selectingViaAnnotationRef.current.y + offsetPosition.y
						}
					);
					positionContext.setPosition(selectingViaAnnotationRef.current.nodeName, {
						x: selectingViaAnnotationRef.current.x + offsetPosition.x,
						y: selectingViaAnnotationRef.current.y + offsetPosition.y
					});

					stageInstance.batchDraw();
				} else {
					(selectingRectRef.current as any).x((selectingRectInfo.current.x + offsetX - (stageInstance).x()) / scaleFactor);
					(selectingRectRef.current as any).y((selectingRectInfo.current.y + offsetY - (stageInstance).y()) / scaleFactor);
				}
			}
		}
	}

	const updateSelectRectangle = (event) => {
		if (stage && stage.current && 
			(selectingRectInfo.current || selectingViaAnnotationRef.current)) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance) {

				const touchPos = getCurrentPosition(event);
				let offsetX = touchPos.x - mouseStartPointerX.current;
				let offsetY = touchPos.y - mouseStartPointerY.current;
				const scaleFactor = (stageInstance as any).scaleX();

				let offsetPosition = {
					x: 0,
					y: 0
				};
				offsetPosition.x = ((offsetX ) / scaleFactor);
				offsetPosition.y = ((offsetY ) / scaleFactor);


				if (selectingViaAnnotationRef.current) {
					console.log("updateSelectRectangle : selectingViaAnnotationRef.current", 
						selectingViaAnnotationRef.current, offsetPosition, "->",
						selectingViaAnnotationRef.current.x + offsetPosition.x,
						selectingViaAnnotationRef.current.y + offsetPosition.y);

					selectingViaAnnotationRef.current.ref.modifyShape(
						ModifyShapeEnum.SetXY,
						{
							x: selectingViaAnnotationRef.current.x + offsetPosition.x,
							y: selectingViaAnnotationRef.current.y + offsetPosition.y 
						}
					);

					positionContext.setPosition(selectingViaAnnotationRef.current.nodeName, {
						x: selectingViaAnnotationRef.current.x + offsetPosition.x,
						y: selectingViaAnnotationRef.current.y + offsetPosition.y
					});
					return;
				}

				(selectingRectRef.current as any).x((selectingRectInfo.current.x + offsetX  - (stageInstance).x()) / scaleFactor);
				(selectingRectRef.current as any).y((selectingRectInfo.current.y + offsetY - (stageInstance).y()) / scaleFactor);
				selectingRectInfo.current.x = selectingRectInfo.current.x + offsetX;
				selectingRectInfo.current.y = selectingRectInfo.current.y + offsetY;

			}
		}
	}

	const handleMultiSelectCursor = (event) => {
		if (touching.current) {
			return;
		}

		if (stage && stage.current && selectingRectInfo.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance) {
				const touchPos = getCurrentPosition(event);
				if (selectingRectInfo.current.x <= touchPos.x &&
					selectingRectInfo.current.y <= touchPos.y &&
					touchPos.x <= selectingRectInfo.current.x + selectingRectInfo.current.width &&
					touchPos.y <= selectingRectInfo.current.y + selectingRectInfo.current.height) {
					document.body.style.cursor = 'pointer';
				} else {
					document.body.style.cursor = 'default';
				}
			}
		}
	}

	const onStageTouchMove = (event) => {

		/*
			structure :

			if (dragging connection from start thumb to ..) { ... }
			else if (moving node)
			else if (moving line)
			else if (is pinching using touch)
			
		*/

		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance) {
		
				if (interactionState.current === InteractionState.idle) {
					return;
				}

				if (interactionState.current === InteractionState.selectingNodes) {
					showSelectRectangle(event);
					return;
				}

				if (interactionState.current === InteractionState.multiSelect) {
					handleMultiSelectCursor(event);
				}

				if (isConnectingNodesByDraggingLocal.current) {
					if (event.evt) {
						event.evt.cancelBubble = true;
					} else {
						event.cancelBubble = true;
					}					
							
					const touchPos = getCurrentPosition(event);
					const scaleFactor = (stageInstance as any).scaleX();
	
					let newPosition = {
						x: 0,
						y: 0
					};
					newPosition.x = ((touchPos.x - (stageInstance).x()) / scaleFactor);
					newPosition.y = ((touchPos.y - (stageInstance).y()) / scaleFactor);
					
					if (connectionNodeThumbs.current === "") {
						const lineRef = shapeRefs.current[connectionForDraggingName];
						if (lineRef) {
		
							let controlPoints = calculateLineControlPoints(
								connectionXStart.current, connectionYStart.current, 
								newPosition.x, newPosition.y,
								connectionNodeThumbPositionRelativeToNode.current as ThumbPositionRelativeToNode,
								connectionNodeThumbPositionRelativeToEndNode.current as ThumbPositionRelativeToNode, {
									curveMode: (touchNode.current as any)?.curveMode ?? ""
								});
								
							lineRef.modifyShape(ModifyShapeEnum.SetPoints, {points: [connectionXStart.current, connectionYStart.current,
								controlPoints.controlPointx1, controlPoints.controlPointy1,
								controlPoints.controlPointx2, controlPoints.controlPointy2,
								newPosition.x, newPosition.y]});
							lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 1});
							stageInstance.batchDraw();
						}					
					} else {

						if (connectionNodeThumbs.current === "thumbstart" && connectionNodeThumbsLineNode.current) { 
							const lineRef = shapeRefs.current[connectionNodeThumbsLineNode.current.name];
							if (lineRef) {
								let lineEndPosition = positionContext.getPosition(connectionNodeThumbsLineNode.current.name);
								let controlPoints = calculateLineControlPoints(									
									newPosition.x, newPosition.y,
									(lineEndPosition && lineEndPosition.xend) || connectionNodeThumbsLineNode.current.xend,
									(lineEndPosition && lineEndPosition.yend) || connectionNodeThumbsLineNode.current.yend,
									ThumbPositionRelativeToNode.default,
									ThumbPositionRelativeToNode.default);
									
								lineRef.modifyShape(ModifyShapeEnum.SetPoints, {points: [
									newPosition.x, newPosition.y,
									controlPoints.controlPointx1, controlPoints.controlPointy1,
									controlPoints.controlPointx2, controlPoints.controlPointy2,
									(lineEndPosition && lineEndPosition.xend) || connectionNodeThumbsLineNode.current.xend,
									(lineEndPosition && lineEndPosition.yend) || connectionNodeThumbsLineNode.current.yend
								]});
								lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 1});
																
							}

							const thumbRef = shapeRefs.current["thumbstart_line_" + connectionNodeThumbsLineNode.current.name];
							if (thumbRef) {
								thumbRef.modifyShape(ModifyShapeEnum.SetXY, newPosition);
							}

							stageInstance.batchDraw();
						} else
						if (connectionNodeThumbs.current === "thumbend" && connectionNodeThumbsLineNode.current) { 
							const lineRef = shapeRefs.current[connectionNodeThumbsLineNode.current.name];
							if (lineRef) {
								let lineStartPosition = positionContext.getPosition(connectionNodeThumbsLineNode.current.name);
								let controlPoints = calculateLineControlPoints(									
									(lineStartPosition && lineStartPosition.xstart) || connectionNodeThumbsLineNode.current.xstart,
									(lineStartPosition && lineStartPosition.ystart) || connectionNodeThumbsLineNode.current.ystart,
									newPosition.x, newPosition.y,
									ThumbPositionRelativeToNode.default,
									ThumbPositionRelativeToNode.default);

								lineRef.modifyShape(ModifyShapeEnum.SetPoints, {points: [
									(lineStartPosition && lineStartPosition.xstart) || connectionNodeThumbsLineNode.current.xstart,
									(lineStartPosition && lineStartPosition.ystart) || connectionNodeThumbsLineNode.current.ystart,
									controlPoints.controlPointx1, controlPoints.controlPointy1,
									controlPoints.controlPointx2, controlPoints.controlPointy2,
									newPosition.x, newPosition.y
								]});
								lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 1});
																
							}

							const thumbRef = shapeRefs.current["thumb_line_" + connectionNodeThumbsLineNode.current.name];
							if (thumbRef) {
								thumbRef.modifyShape(ModifyShapeEnum.SetXY, newPosition);
							}

							stageInstance.batchDraw();
						}
					}
												
					cancelDragStage();
					return;
				}

				if (!!canvasMode.isConnectingNodes) {
					cancelDragStage();
					return false;
				}
				
				if ((interactionState.current === InteractionState.multiSelect && touching.current) ||
					(interactionState.current === InteractionState.draggingSection && touching.current)  ||
				    (
						touchNode.current && touchNodeGroup.current && !isPinching.current
					))  {			
					
						

					if (interactionState.current === InteractionState.multiSelect ||
						interactionState.current === InteractionState.draggingSection) {

						console.log("stagemousemove", interactionState.current);
						moveSelectRectangle(event);
						stageInstance.batchDraw();
					}	

					document.body.classList.add("mouse--moving");
					document.body.style.cursor = 'pointer';
					mouseDragging.current = true;

					if (touchNode.current && (touchNode.current as any).shapeType === "Line") {

						let lineNode = (touchNode.current as any);
						if (lineNode.startshapeid) {
							const startNode = flowStore.flow[flowStore.flowHashmap.get(lineNode.startshapeid).index];
							if (startNode) {	
								setNewPositionForNode(event, startNode, shapeRefs.current[startNode.name], 
									event.evt && event.evt.screenX ? {
										x: event.evt.screenX ,
										y: event.evt.screenY 
									} : (event.screenX ? {
										x: event.screenX ,
										y: event.screenY 
									} : undefined), false, false, true);
							}
						}
						if (lineNode.endshapeid) {
							const endNode = flowStore.flow[flowStore.flowHashmap.get(lineNode.endshapeid).index];
							if (endNode) {
								
								setNewPositionForNode(event, endNode, 
									shapeRefs.current[endNode.name], 
									event.evt && event.evt.screenX ? {
										x: event.evt.screenX,
										y: event.evt.screenY
									} : (event.screenX ? {
										x: event.screenX,
										y: event.screenY
									} : undefined), false, false, true, false, true);
							}
						}
						cancelDragStage();
						return;
					}

					if (event.evt) {
						event.evt.preventDefault();
						event.evt.cancelBubble = true;
					} else {
						event.preventDefault();
						event.cancelBubble = true;
					}
					
					if (draggingMultipleNodes.current && draggingMultipleNodes.current.length > 0) {
console.log("onStageTouchMove draggingMultipleNodes");
						//const touchPos = stageInstance.getPointerPosition();
						const touchPos = getCurrentPosition(event);
						let offsetX = touchPos.x - mouseStartPointerX.current;
						let offsetY = touchPos.y - mouseStartPointerY.current;
						const scaleFactor = (stageInstance as any).scaleX();
		
						let offsetPosition = {
							x: 0,
							y: 0
						};
						offsetPosition.x = ((offsetX ) / scaleFactor);
						offsetPosition.y = ((offsetY ) / scaleFactor);
					
						draggingMultipleNodes.current.forEach((nodeName) => {
							let mappedNode = flowStore.flowHashmap.get(nodeName);
							if (mappedNode) {				
								let draggingNode = flowStore.flow[mappedNode.index];
								if (draggingNode) {
									setNewPositionForNode(event, draggingNode, shapeRefs.current[nodeName], 
										event.evt && event.evt.screenX ? {
											x: event.evt.screenX - canvasTopLeftPositionRef.current.x,
											y: event.evt.screenY - canvasTopLeftPositionRef.current.y
										} : (event.screenX ? {
											x: event.screenX - canvasTopLeftPositionRef.current.x,
											y: event.screenY - canvasTopLeftPositionRef.current.y
										} : undefined), false, false, true, false, false, offsetPosition);
								}
							}
						})
												
					} else {
						if (touchNode.current) { 
							setNewPositionForNode(event, touchNode.current, shapeRefs.current[(touchNode.current as any).name], 
								event.evt && event.evt.screenX ? {
									x: event.evt.screenX - canvasTopLeftPositionRef.current.x ,
									y: event.evt.screenY - canvasTopLeftPositionRef.current.y 
								} : (event.screenX ? {
									x: event.screenX - canvasTopLeftPositionRef.current.x,
									y: event.screenY - canvasTopLeftPositionRef.current.y
								} : undefined), false, false, true);

							if (stage && stage.current) {
								let stageInstance = (stage.current as any).getStage();
								if (stageInstance) {
									const touchPos = getCurrentPosition(event);
									
									if (touchPos) {
										const scaleFactor = (stageInstance as any).scaleX();

										let x = ((touchPos.x - (stageInstance).x()) / scaleFactor) - mouseStartX.current;
										let y = ((touchPos.y - (stageInstance).y()) / scaleFactor) - mouseStartY.current;

										x = x - (x % gridSize.current);
										y = y - (y % gridSize.current);

										movingExistingOrNewNodeOnCanvas(x, y, undefined, true, touchNode.current, true);
									}
								}
							}
						}
					}	
					

					cancelDragStage();
					return false;
				} else {
					
					if (isPinching.current && event.evt && event.evt.touches && event.evt.touches.length > 1) {
						cancelDragStage();
						if (event.evt) {
							event.evt.preventDefault();
							event.evt.cancelBubble = true;
						} else {
							event.preventDefault();
							event.cancelBubble = true;
						}

						/*
							deltaY
							toElement
						*/

						if (event.evt && event.evt.touches.length == 2) {
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
				}
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

		if (event.evt) {
			event.evt.preventDefault();
			event.evt.cancelBubble = true;
		} else {
			//event.preventDefault();
			event.cancelBubble = true;
		}

		touchNode.current = node;
		touchNodeGroup.current = event.currentTarget;
		mouseDragging.current = false;

		cancelDragStage();	
		
		if (event.currentTarget) {
			determineStartPosition(event.currentTarget, getCurrentPosition(event));
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
		
		if (event.evt) {
			event.evt.preventDefault();
			event.evt.cancelBubble = true;
		} else {
			//event.preventDefault();
			event.cancelBubble = true;
		}

		if (node.shapeType !== "Line") {
			mouseDragging.current = true;
			setNewPositionForNode(event, node, shapeRefs.current[node.name], event.evt.touches.length > 0 ? {
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

		if (event.evt) {
			event.evt.preventDefault();
			event.evt.cancelBubble = true;
		} else {
			//event.preventDefault();
			event.cancelBubble = true;
		}
		
		if (event.currentTarget) {
			if (mouseDragging.current) {
				setNewPositionForNode(event, node, shapeRefs.current[node.name], event.evt.changedTouches.length > 0 ? {
					x: event.evt.changedTouches[0].screenX,
					y: event.evt.changedTouches[0].screenY
				} : undefined, false, false, true);
			} else {
				selectNode(node.name, node);
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
		if (node && node.shapeType === "Line") {
			document.body.style.cursor = 'pointer';
			return;
		}
		const settings = ShapeSettings.getShapeSettings(node.taskType, node);	
		const allowedOutputs = FlowToCanvas.getAllowedOutputs(node.shapeType, settings);
		if (allowedOutputs == 0 || 
			!FlowToCanvas.canHaveOutputs(node.shapeType, settings, flowStore.flow, node, flowStore.flowHashmap)) {
			return false;
		}

		if (!FlowToCanvas.canNodesConnect(touchNode.current, node)) {
			console.log("not allowed");
			document.body.style.cursor = 'not-allowed';
			return false;
		} else {
			console.log("allowed");
		}

		document.body.style.cursor = 'pointer';		
	}

	const onMouseConnectionStartOut= (node, nodeEvent, event) => {
		(document.body.style.cursor as any) = null;
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
		

		const settings = ShapeSettings.getShapeSettings(node.taskType, node);
		if (node && node.shapeType !== "Line") {
			const allowedOutputs = FlowToCanvas.getAllowedOutputs(node.shapeType, settings);
			if (allowedOutputs == 0 || 
				!FlowToCanvas.canHaveOutputs(node.shapeType, settings, flowStore.flow, node, flowStore.flowHashmap)) {
				return false;
			}
		}
		
		interactionState.current = InteractionState.addingNewConnection;

		(isConnectingNodesByDraggingLocal.current as any) = true;
		connectionNodeEvent.current = nodeEvent;
		connectionNodeEventName.current = nodeEventName;
		connectionNodeThumbs.current = "";
		connectionNodeThumbsLineNode.current = undefined;

		connectionNodeFollowFlow.current = followFlow;
		connectionNodeThumbPositionRelativeToNode.current = thumbPositionRelativeToNode;
		connectionNodeThumbPositionRelativeToEndNode.current = ThumbPositionRelativeToNode.default;
		if (thumbPositionRelativeToNode == ThumbPositionRelativeToNode.bottom) {
			connectionNodeThumbPositionRelativeToEndNode.current = ThumbPositionRelativeToNode.top;
		}
		document.body.classList.add("connecting-nodes");

		touchNode.current = node;
		touchNodeGroup.current = event.currentTarget;		

		let newPosition = {
			x: 0,
			y: 0
		};

		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stage) {
				var touchPos = getCurrentPosition(event);
				const scaleFactor = (stageInstance as any).scaleX();

				newPosition.x = ((touchPos.x - (stageInstance).x()) / scaleFactor);
				newPosition.y = ((touchPos.y - (stageInstance).y()) / scaleFactor);
				connectionXStart.current = newPosition.x;
				connectionYStart.current = newPosition.y;				
			}
		}
		
		if (node && node.shapeType === 'Line') {
			// dragging thumb-start
			connectionNodeThumbs.current = "thumbstart";
			connectionNodeThumbsLineNode.current = node;
		}
		if (!event.evt) {
			event.preventDefault();
		}
		return false;
	}

	const onMouseConnectionStartMove = (node, nodeEvent, event) => {
		if (!!canvasMode.isConnectingNodes) {
			return false;
		}
		if (node && touching.current && touchNode.current) {
			return;
		}
		if (event.evt) {
			event.evt.cancelBubble = true;		
		} else {
			event.cancelBubble = true;
		}
	}

	const onMouseConnectionStartEnd = (node, nodeEvent, thumbPositionRelativeToNode : ThumbPositionRelativeToNode , event) => {
		
		if (!!canvasMode.isConnectingNodes) {
			return false;
		}
		if (node && touching.current && touchNode.current) {
			return;
		}
	}

	const onMouseConnectionEndOver = (node, nodeEvent, event, thumbPositionRelativeToNode? : ThumbPositionRelativeToNode) => {
		console.log("onMouseConnectionEndOver");
		if (interactionState.current == InteractionState.draggingConnectionEnd) {
			return;			
		}

		if (node.notSelectable) {
			return false;
		}

		const settings = ShapeSettings.getShapeSettings(node.taskType, node);
		if (node && node.shapeType !== "Line" && 
			touching.current && touchNode.current) {	
			const allowedInputs = FlowToCanvas.getAllowedInputs(node.shapeType, settings);
			if (allowedInputs == 0 || 
				!FlowToCanvas.canHaveInputs(node.shapeType, settings, flowStore.flow, node, flowStore.flowHashmap)) {
				document.body.style.cursor = 'not-allowed';
				return false;
			}
			
			
		}

		if (!FlowToCanvas.canNodesConnect(touchNode.current, node)) {
			console.log("onMouseConnectionEndOver not allowed")
			document.body.style.cursor = 'not-allowed';
			return false;
		}

		document.body.style.cursor = 'pointer';

		if (thumbPositionRelativeToNode)	{
			connectionNodeThumbPositionRelativeToEndNode.current = thumbPositionRelativeToNode;
		} else {
			connectionNodeThumbPositionRelativeToEndNode.current = ThumbPositionRelativeToNode.default;
		}

		
	}

	const onMouseConnectionEndOut = (node, nodeEvent, event) => {
		(document.body.style.cursor as any) = null;
	}

	const onMouseConnectionEndStart = (node, nodeEvent, event) => {

		if (interactionState.current != InteractionState.idle) {
			if (!event.evt) {
				event.preventDefault();
			}
			return false;
		}

		if (!!canvasMode.isConnectingNodes) {
			if (!event.evt) {
				event.preventDefault();
			}
			return false;
		}
		if (node && touching.current && touchNode.current && !isConnectingNodesByDraggingLocal.current) {
			return;
		}

		// dragging thumb-end
		if (node && node.shapeType === 'Line') {
			connectionNodeThumbsLineNode.current = node;
			touchNode.current = node;
			touchNodeGroup.current = event.currentTarget;

			interactionState.current = InteractionState.addingNewConnection;
		} else {
			const mappedNode = flowStore.flowHashmap.get(node.name);
			if (mappedNode) {
				if (mappedNode.end.length > 0) {
					const lineNode = flowStore.flow[mappedNode.end[0]];
					
					if (!lineNode) {
						return;
					}

					connectionNodeThumbsLineNode.current = lineNode;
					touchNode.current = lineNode;
					touchNodeGroup.current = shapeRefs.current[lineNode.name];
					interactionState.current = InteractionState.draggingConnectionEnd;

				} else {
					return;
				}
			} else {
				return;
			}
		}
		
		(isConnectingNodesByDraggingLocal.current as any) = true;
		connectionNodeEvent.current = nodeEvent;
		connectionNodeEventName.current = "";

		connectionNodeFollowFlow.current = ThumbFollowFlow.default;
		connectionNodeThumbPositionRelativeToNode.current = ThumbPositionRelativeToNode.default;
		connectionNodeThumbPositionRelativeToEndNode.current = ThumbPositionRelativeToNode.default;
		
		document.body.classList.add("connecting-nodes");				

		let newPosition = {
			x: 0,
			y: 0
		};

		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stage) {
				var touchPos = getCurrentPosition(event);
				const scaleFactor = (stageInstance as any).scaleX();

				newPosition.x = ((touchPos.x - (stageInstance).x()) / scaleFactor);
				newPosition.y = ((touchPos.y - (stageInstance).y()) / scaleFactor);
				connectionXStart.current = newPosition.x;
				connectionYStart.current = newPosition.y;				
			}
		}

		connectionNodeThumbs.current = "thumbend";

		if (!event.evt) {
			event.preventDefault();
		}
		return false;
	}

	const onMouseConnectionEndMove = (node, nodeEvent, event) => {
		if (!!canvasMode.isConnectingNodes) {			
			if (!event.evt) {
				event.preventDefault();
			}
			return false;
		}
		if (node && touching.current && touchNode.current && !isConnectingNodesByDraggingLocal.current) {
			return;
		}
	}

	const onMouseConnectionEndEnd = (node, nodeEvent,event, thumbPositionRelativeToNode?) => {
		console.log("onMouseConnectionEndEnd");
		if (!!canvasMode.isConnectingNodes) {
			if (!event.evt) {
				event.preventDefault();
			}
			return false;
		}
		if (node && touching.current && touchNode.current && !isConnectingNodesByDraggingLocal.current) {
			return;
		}
		if (isConnectingNodesByDraggingLocal.current && touchNode.current && node) {
			if (connectionNodeThumbsLineNode.current) {
				let clonedNode = {...connectionNodeThumbsLineNode.current};
				clonedNode.endshapeid = node.name;
				connectionNodeThumbsLineNode.current = clonedNode;
				return;
			}			

			if (!FlowToCanvas.canNodesConnect(touchNode.current, node)) {
				console.log("onMouseConnectionEndEnd not allowed")
				return false;
			}

			connectConnectionToNode(node, thumbPositionRelativeToNode);
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
		setNewPositionForNode(event, node, shapeRefs.current[node.name], false, false, true);		
	}

	const onDragEnd = (node, event) => {
		if (touching.current || draggingWhileTouching.current) {
			draggingWhileTouching.current = false;
			return false;
		}

		dragTime.current = undefined;
		setNewPositionForNode(event, node, shapeRefs.current[node.name]);
		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			stageInstance.batchDraw();
		}
		updateTouchedNodes();

		// event.currentTarget points to the "Group" in the actual shape component
		// the Group is the draggable part of the shape component
		// it has a property "attrs" which contains properties x,y,data-id etc
		// so... no need for refs here probably

		// node is the reference to the node from the flow

	}

	const onClickShape = (node, event) => {
		console.log("onclickshape", node);
		
		if (interactionState.current == InteractionState.draggingNodesUpstream ||
			interactionState.current == InteractionState.draggingNodesDownstream) {
			console.log("onclickshape dragging nodes");
			return;
		}
		
		event.cancelBubble = true;
		if (event.evt) {
			event.evt.preventDefault();
		} else {
			event.preventDefault();
		}
		cancelDragStage();

		if (isConnectingNodesByDraggingLocal.current && touchNode.current && node) {
			connectConnectionToNode(node);
			return false;
		}

		if ((!!canvasMode.isConnectingNodes || !!shiftDown.current) && 			
			selectedNodeRef.current !== undefined &&
			(selectedNodeRef.current as any).shapeType !== "Line") {
console.log("getNewConnection in clickShape")
			const connection = getNewConnection(selectedNodeRef.current, node, props.getNodeInstance,
				connectionNodeThumbPositionRelativeToNode.current);			

			if (connectionNodeFollowFlow.current == ThumbFollowFlow.happyFlow) {
				(connection as any).followflow = "onsuccess";
			} else
			if (connectionNodeFollowFlow.current == ThumbFollowFlow.unhappyFlow) {
				(connection as any).followflow = "onfailure";
			}
			if (connection.startshapeid !== connection.endshapeid) {					
				flowStore.addConnection(connection);
				canvasMode.setConnectiongNodeCanvasMode(false);
			} else {
				console.log("DONT CONNECT TO NODE ITSELF");
			}
		}

		selectedNodeRef.current = node;
		selectNode(node.name, node);
	
		if (canvasMode.isConnectingNodes) {
			canvasMode.setConnectiongNodeCanvasMode(false);
		}
		
		/*
			trigger animating to node:
			- click and hold ctrl
			- call fitStage(undefined, false, false, true , node.name); 
		*/

		if (event.altKey) {
			console.log("TRIGGER ANIMATE TO", node.name);
			fitStage(undefined, false, false, true , node.name)
		}

		return false;		
	}

	const onClickLine = (node, event) => {		

		console.log("onClickLine", node);
		
		event.cancelBubble = true;
		event.evt.preventDefault();
		cancelDragStage();
		
		if (node.notSelectable) {
			return false;
		}
		
		canvasMode.setConnectiongNodeCanvasMode(false);
		selectNode(node.name, node);
		return false;
	}

	const onDragStageMove = (event) => {

		if (isPinching.current) {
			return;			
		}

		if (!!canvasMode.isConnectingNodes) {			
			return false;
		}

		if (interactionState.current !== InteractionState.idle) {
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
	};

	const onDragStageEnd = (event) => {

		if (isPinching.current) {
			return;			
		}

		if (!!canvasMode.isConnectingNodes) {			
			return false;
		}

		if (interactionState.current !== InteractionState.idle) {
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
	};


	const fitStage = (node? : any, doBatchdraw? : boolean, doSetHtmlElementsPositionAndScale? : boolean, doAnimate? : boolean, animateToNode? : string) => {
		console.log("FITSTAGE",doAnimate, animateToNode);
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

						if (shapeType === "Html") {
							
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
			
				let doFitStage = true;
				if (!!doAnimate && animateToNode) {
					doFitStage = false;
				}

				if (flowStore.flow.length > 0 &&
					xMin !== undefined && yMin !== undefined && xMax !== undefined && yMax !== undefined) {
					let scale = 1;
					
					let flowWidth = Math.abs(xMax-xMin) ;//+ 200;
					let flowHeight = Math.abs(yMax-yMin) ;//+ 200;

					// .canvas-controller__scroll-container
					const stageContainerElement = (canvasWrapper as any).current;//document.querySelector("body .canvas-controller__scroll-container");
					const bodyElement = document.querySelector("body");
					if (stageContainerElement !== null && bodyElement !== null) {
						let subtractWidth = 128;
						if (stageContainerElement.clientWidth < 1024) {
							subtractWidth = 0;
						}
						let realStageWidth = stageContainerElement.clientWidth - subtractWidth;
						let realStageHeight = bodyElement.clientHeight - 64;
						if (realStageHeight < 500) {
							//realStageHeight = 600;
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

						if (doFitStage) {
							stageInstance.scale({ x: scale, y: scale });
						}
						const newPos = {
							x: 0 ,
							y: 0 
						};					
						let offsetX = 64;												
						//let stageWidth = stageInstance.getWidth() || stageContainerElement.clientWidth;
						//let stageHeight = stageInstance.getHeight() || stageContainerElement.clientHeight;
						let stageWidth = stageContainerElement.clientWidth;
						let stageHeight = stageContainerElement.clientHeight;

						if (stageWidth < 1024) {
							offsetX = 0;
						}

						newPos.x = offsetX + (-(xMin)*scale) + (stageWidth)/2 - ((flowWidth*scale))/2 ;
						newPos.y = (-(yMin)*scale) + 
							(stageHeight + (props.isEditingInModal ? 0 : 64))/2 - 
							((flowHeight*scale))/2 ;	
						
						if (doFitStage) {
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
							console.log("FITSTAGE AFTER");
						}

						let stopAnimation = false;

						/*
							- no auto draw
							- scale ook animeren
							- timeout voor delay?
							- in aparte method zetten
								xMin en flowwidth etc als useRef opslaan

							- pointerlock api gebruiken om geen cursor te tonen
							- waarom springt ie naar herstart terug naar begin? .. vanwege de hele fitStage functionaliteit
						*/

						if (window.localStorage && !!doAnimate) {
							let as = "";
							animationScript.current = undefined;

							if (animateToNode) {
								animationScript.current = {
									nodes : [
										animateToNode
									],
									zoom: 1,
									duration: 2,
									loop: 0
								}	
							} else {
								as = localStorage.getItem('animation') || "";
							}
							
							if (as) {
								animationScript.current = JSON.parse(as);				
							}
							let canvas : any = document.querySelector("canvas");
							if (canvas) {
								canvas.requestPointerLock();
							}
							let stageInstance = (stage.current as any).getStage();
							if (animationScript.current) {
								let nodesToAnimate = animationScript.current.nodes;
								if (animationScript.current.zoom && stageInstance) {
									
									//stageScale.current = animationScript.current.zoom;
									scale = animationScript.current.zoom;
									// 


									//stageInstance.autoDrawEnabled = false;
									//Konva.default.autoDrawEnabled = false;

									/*newPos.x = offsetX + (-(xMin)*scale) + (stageWidth)/2 - ((flowWidth*scale))/2 ;
									newPos.y = (-(yMin)*scale) + (stageHeight + 64)/2 - ((flowHeight*scale))/2 ;


									stageInstance.position(newPos);
									stageX.current = newPos.x;
									stageY.current = newPos.y;									

									stageInstance.scale({ x: animationScript.current.zoom, y: animationScript.current.zoom });
									stageInstance.draw();
									*/
									if (layer && layer.current) {
										(layer.current as any).listening(false);
										(layer.current as any).batchDraw();
									}
									//setHtmlElementsPositionAndScale(stageX.current, stageY.current, stageScale.current);

								}
								animationScript.current.loop = 0;
								if (animationScript.current.loop < nodesToAnimate.length) {
									let position = positionContext.getPosition(nodesToAnimate[animationScript.current.loop]);

									
									if (stageInstance && position) {

										if (stageGroup && stageGroup.current) {
											//(stageGroup.current as any).cache();
										}

										let zoom = animationScript.current.zoom;
										//let offsetX = newPos.x;//stageX.current;
										//let offsetY = newPos.y;//stageY.current;
										const triggerAnimation = () => {
											let isDrawing = false;
											newPos.x = offsetX + (-(position?.x ?? 0)*scale) + (stageWidth)/2 - (150*scale);
											newPos.y = (-(position?.y ?? 0)*scale) + (stageHeight + 64)/2 - (150*scale);;
											let tween = animateTo(stageInstance, {												
												x:  newPos.x,
												y:  newPos.y,
												scaleX : zoom,
												scaleY: zoom,
												duration : animationScript.current.duration || 3,
												easing: Konva.default.Easings.EaseInOut,
												onUpdate: () => {
													if (isDrawing) {
														return false;
													}
													isDrawing = true;
													stageX.current = stageInstance.x();
													stageY.current = stageInstance.y();
													stageScale.current = stageInstance.scale().x;
													
													stageInstance.draw();														
													//setHtmlElementsPositionAndScale(stageX.current, stageY.current, stageScale.current);
													setHtmlGlobalScale(stageX.current, stageY.current, stageScale.current);
													isDrawing = false;
													return false;
												},
												onFinish: () => {
													tween.destroy();
													if (!stopAnimation) {
														animationScript.current.loop++;
														if (animationScript.current.loop < nodesToAnimate.length) {
															position = positionContext.getPosition(nodesToAnimate[animationScript.current.loop]);
															if (position) {

																triggerAnimation();
															}
														} else {
															//stageInstance.autoDrawEnabled = true;
															//Konva.default.autoDrawEnabled = true;
															if (layer && layer.current) {
																//(stageGroup.current as any).clearCache();

																(layer.current as any).listening(true);
																(layer.current as any).batchDraw();																
															}

															document.exitPointerLock();
														}
													}
												},
											});
										}
										triggerAnimation();
									}
								}				
							}
						}
					}
				} else {
					const newPos = {
						x: 0 ,
						y: 0 
					};
					let scale = 1;
					console.log("FITSTAGE without any nodes in the flow");
					const stageContainerElement = (canvasWrapper as any).current;//document.querySelector(".canvas-controller__scroll-container");
					if (stageContainerElement !== null) {
						if (stageContainerElement.clientWidth < 1024) {
							scale = 0.5;
						}
					}
					
					stageInstance.scale({ x: scale, y: scale });
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
	};

	useEffect(() => {
		console.log("useEffect AFTER fitstage", flowStore.flowId, performance.now());
	}, [flowStore.flow]);

	useEffect(() => {
		gridSize.current = canvasMode.snapToGrid ? 50 : 1;
	}, [canvasMode.snapToGrid]);

	const clickStage = (event) => {
		if (isConnectingNodesByDraggingLocal.current) {
			event.evt.preventDefault();

			if (touchNode.current) {

				if (stage && stage.current) {
					let stageInstance = (stage.current as any).getStage();
					const touchPos = stageInstance.getPointerPosition();
					const scaleFactor = (stageInstance as any).scaleX();
	
					let newPosition = {
						x: 0,
						y: 0
					};
					newPosition.x = ((touchPos.x - (stageInstance).x()) / scaleFactor);
					newPosition.y = ((touchPos.y - (stageInstance).y()) / scaleFactor);

					const connection = getNewConnection(touchNode.current, undefined, props.getNodeInstance, undefined,
						ThumbPositionRelativeToNode.default, newPosition.x, newPosition.y);									
					
					clearConnectionState();
			
					if (connection.startshapeid === connection.endshapeid) {
						console.log("connection to node itself 2");										
						return;
					}

					positionContext.setPosition(connection.name, {
						xstart: connection.xstart,
						ystart: connection.ystart,
						xend: connection.xend,
						yend: connection.yend
					});
			
					flowStore.addConnection(connection);
					canvasMode.setConnectiongNodeCanvasMode(false);
				}
			}

			isConnectingNodesByDraggingLocal.current = false;
			connectionNodeEvent.current = false;
			connectionNodeEventName.current = "";
			
			connectionNodeThumbPositionRelativeToNode.current = ThumbPositionRelativeToNode.default;
			connectionNodeFollowFlow.current = ThumbFollowFlow.default;

			(touchNode.current as any) = undefined;
			touchNodeGroup.current = undefined;			

			document.body.classList.remove("connecting-nodes");
			document.body.classList.remove("mouse--moving");
			(document.body.style.cursor as any) = null;

			const lineRef = shapeRefs.current[connectionForDraggingName];
			if (lineRef) {
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
		
		const nodeIsSelected : boolean = !!selectedNodeRef.current;	
					
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
						shapeType: canvasMode.selectedTask == "IfConditionTask" ? "Diamond" : (shapeSetting.shapeType ? shapeSetting.shapeType : "Rect"), 
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
					if (lineRef) {						
						lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 0});
						if (stage && stage.current) {
							let stageInstance = (stage.current as any).getStage();
							if (stageInstance !== undefined) {
								stageInstance.batchDraw();
							}
						}
					}
					
					positionContext.setPosition(newNode.name, {
						x: newNode.x,
						y: newNode.y
					});
					positionContext.setCommittedPosition(newNode.name, {
						x: newNode.x,
						y: newNode.y
					});
					flowStore.addFlowNode(newNode);
				}				
			}
		}
		// TODO : do we need to select the added node or dont? (see also the flow-actions)
		selectNode("", undefined);

		canvasMode.setConnectiongNodeCanvasMode(false);
		canvasMode.setSelectedTask("");
		
		if (interactionState.current === InteractionState.multiSelect) {
			canvasMode.setIsInMultiSelect(false, []);
		}
		touching.current = false;
		deselectAllNodes();
		interactionState.current = InteractionState.idle;
		(selectingRectRef.current as any).opacity(0);

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

		const nodeIsSelected : boolean = !!selectedNodeRef.current && selectedNodeRef.current.name;
		
		try {
			let connections : any[] = [];
			if (props.getNodeDependencies) {
				const nodeConnections = props.getNodeDependencies(selectedNodeRef.current.name);
				/*
					nodeConnections contains a list of objects
						consisting of start and 
					foreach nodeConnection in nodeConnections ... 
						getNode nodeConnection.start
						getNode nodeConnection.nd
						create temp connection
						connections.push(add temp connection)
				*/
				nodeConnections.forEach((nodeDependency , index) => {
					let breakOut = false;
					if (nodeIsSelected && 
						nodeDependency.startNodeName !== selectedNodeRef.current.name && 
						nodeDependency.endNodeName !== selectedNodeRef.current.name) {
						breakOut = true;
					}

					if (!breakOut) {
						const startNode = getNodeByName(nodeDependency.startNodeName);
						const endNode = getNodeByName(nodeDependency.endNodeName);
						const startPositionNode = positionContext.getPosition(startNode.name) || startNode;
						const endPositionNode = positionContext.getPosition(endNode.name) || endNode;

						const startPosition = FlowToCanvas.getStartPointForLine(startNode, 
							{
								x: startPositionNode.x,
								y: startPositionNode.y
							}, 
							endNode, endPositionNode,
							undefined, props.getNodeInstance);

						const endPosition = FlowToCanvas.getEndPointForLine(endNode, 
							{
								x: endPositionNode.x,
								y: endPositionNode.y
							}, 
							startNode, startPositionNode,
							props.getNodeInstance);

						let connection = {
							shapeType : "Line",
							name: "_dc" + index,
							id: "_dc" + index,
							xstart : startPosition.x,
							ystart : startPosition.y,
							xend: endPosition.x,
							yend: endPosition.y,
							notSelectable: true,
							startshapeid: startNode.name,
							endshapeid: endNode.name,
							isConnectionWithVariable: !!nodeDependency.isVariable,
							isConnectionWithFunction: !!nodeDependency.isFunction
						};
						connections.push(connection);
					}
				});

			} else {
				flowStore.flow.forEach((node, index) => {
					
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

									if (nodeIsSelected && 
										node.name !== selectedNodeRef.current.name && 
										nodeEnd.name !== selectedNodeRef.current.name) {
										console.log("getdeps", selectedNodeRef.current, node.name,nodeEnd.name);
										return;
									}

									const startPositionNode = positionContext.getPosition(node.name) || node;
									const endPositionNode = positionContext.getPosition(nodeEnd.name) || nodeEnd;
			
									let startPosition = FlowToCanvas.getStartPointForLine(node, {x: startPositionNode.x, y: startPositionNode.y}, 
										nodeEnd, endPositionNode,
										undefined, props.getNodeInstance);
									let endPosition = FlowToCanvas.getEndPointForLine(nodeEnd, 
										{x: endPositionNode.x, y: endPositionNode.y},										
										node, startPositionNode,
										props.getNodeInstance);

									if (!startToEnd) {
										startPosition = FlowToCanvas.getStartPointForLine(nodeEnd, {x: endPositionNode.x, y: endPositionNode.y}, 
											node, {x: startPositionNode.x, y: startPositionNode.y},
											undefined, props.getNodeInstance);
										endPosition = FlowToCanvas.getEndPointForLine(node, {x: startPositionNode.x, y: startPositionNode.y}, 
											nodeEnd, endPositionNode, 
											props.getNodeInstance);
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
										isConnectionWithVariable: isConnectionWithVariable,
										isConnectionWithFunction: isFunctionCall
									};
									connections.push(connection);
								}
								
							})
						}
					}

				});
			}
			return connections;
		} catch(err) {
			console.log(err);
			return [];
		}
	}


	const onDropTask = (event) => {
		event.preventDefault();
		
		let taskClassName = event.dataTransfer.getData("data-task");
		addTaskToCanvas(event, taskClassName);
	}

	const addFlowFromRepoToCanvas = (repositoryItem : any, draggableElementRect) => {
		if (repositoryItem) {
			let repoFlow = JSON.parse(repositoryItem.flow);

			if (stage && stage.current) {		
				let stageInstance = (stage.current as any).getStage();
				const position = (stageInstance as any).getPointerPosition();
				const scaleFactor = (stageInstance as any).scaleX();

				const x = (position.x - (stageInstance).x()) / scaleFactor; 
				const y = (position.y - (stageInstance).y()) / scaleFactor;

				let renameIdMap : any = {}; 
				repoFlow = repoFlow.map((node : any) => {
					if (node.shapeType !== "Line") {
						renameIdMap[node.name] = "node_" + uuidV4();
						return {...node,
							name: renameIdMap[node.name],
							id: renameIdMap[node.name]
						}
					}
					return node;
				});
				repoFlow = repoFlow.map((node : any) => {
					if (node.shapeType === "Line") {
						renameIdMap[node.name] = "node_" + uuidV4();
						return {...node,
							name: renameIdMap[node.name],
							id: renameIdMap[node.name],
							startshapeid: renameIdMap[node.startshapeid],
							endshapeid: renameIdMap[node.endshapeid]
						}
					}
					return node;
				});

				repoFlow.forEach((node) => {
					if (node.shapeType === "Line") {
						node.xstart += x;
						node.ystart += y;
						node.xend += x;
						node.yend += y;
						positionContext.setPosition(node.name, {
							xstart: node.xstart,
							ystart: node.ystart,
							xend: node.xend,
							yend: node.yend
						});
					} else {
						node.x += x;
						node.y += y;
						positionContext.setPosition(node.name, {
							x: node.x,
							y: node.y
						});
					}
				});
				flowStore.addFlowNodes(repoFlow);
			}
		}
	}

	const loadRepoItemFromModuleAndAdd = (taskClassName, draggableElementRect : any) => {
		const element = document.getElementById("task_"+taskClassName);
		if (element) {
			const taskId = element.getAttribute('data-id');
			fetch(`/api/modulecontent?moduleId=repository&id=${taskId}`)
			.then(res => {
				if (res.status >= 400) {
					throw new Error("Bad response from server");
				}
				return res.json();
			})
			.then(repositoryItem => {
				console.log("repositoryItem", repositoryItem);
				addFlowFromRepoToCanvas(repositoryItem, draggableElementRect);

			})
			.catch(err => {
				console.error(err);
			});
		}
	}

	const loadCustomNodeFromModuleAndAdd = (event, taskClassName, draggableElementRect) => {
		const element = document.getElementById("task_"+taskClassName);
		if (element) {
			const taskId = element.getAttribute('data-id');
			fetch(`/api/modulecontent?moduleId=customNodes&id=${taskId}`)
			.then(res => {
				if (res.status >= 400) {
					throw new Error("Bad response from server");
				}
				return res.json();
			})
			.then(customNode => {
				console.log("customNode", customNode);
				if (customNode.taskName) {
					
					addTaskClassNameToCanvas(event, "CustomNodeTask" , {
						nodeTask: customNode.taskName,
						htmlPlugin: 'customNode',
						config: customNode
					}, draggableElementRect);
				}
			})
			.catch(err => {
				console.error(err);
			});
		}
	}

	const addTaskClassNameToCanvas = (event: any, taskClassName: string, extraNodeProperties? : any, draggableElementRect?: any) => {

		if (stage && stage.current) {			
			const stageInstance = (stage.current as any).getStage();

			// hack to have a usuable stage position when dropping nodes on stage
			if (lastMousePositionRef.current) {
				const correctedPointerPosition = {...lastMousePositionRef.current};
				correctedPointerPosition.clientX += canvasTopLeftPositionRef.current.x;
				correctedPointerPosition.clientY += canvasTopLeftPositionRef.current.y;
				
				stageInstance.setPointersPositions(correctedPointerPosition);
			}
			
			const position = stageInstance.getPointerPosition();

			//const nodeIsSelected : boolean = !!selectedNodeRef.current;	
			selectNode("", undefined);
			canvasMode.setConnectiongNodeCanvasMode(false);
			
			if (taskClassName && taskClassName !== "") {
				if (!canvasMode.isConnectingNodes) {
					if (stage && stage.current) {
						interactionState.current = InteractionState.addingNewNode;

						let customProperties : any = {};
						const scaleFactor = stageInstance.scaleX();
						let taskType = taskClassName;
						
						if (taskClassName === "AnnotationText") {
							taskType = "Annotation";
							customProperties.shapeType = "Text";
							customProperties.label = "Select and click EDIT to change label";
							customProperties.fontSize = 18;
						}

						let presetValues = {};
						const shapeSetting = getTaskConfigForTask(taskType);
						if (shapeSetting && shapeSetting.presetValues) {
							presetValues = shapeSetting.presetValues;
						}

						let newNode = getNewNode({
							name: taskClassName,
							id: taskClassName,
							taskType: taskType,
							shapeType: taskClassName === "IfConditionTask" ? "Diamond" : (shapeSetting.shapeType ? shapeSetting.shapeType : "Rect"), 
							x: ((position.x || 0) - (stageInstance).x() || 0) / scaleFactor, 
							y: ((position.y || 0) - (stageInstance).y() || 0) / scaleFactor,
							...presetValues,
							...extraNodeProperties,
							...customProperties
						},flowStore.flow);
						
						const settings = ShapeSettings.getShapeSettings(newNode.taskType, newNode);

						let shapeType = FlowToCanvas.getShapeType(newNode.shapeType, newNode.taskType, newNode.isStartEnd);							
						if (shapeType === "Html" && draggableElementRect) {
							if (props.getNodeInstance) {
								const left = Math.round((draggableElementRect.left + draggableElementRect.right)/2) - canvasTopLeftPositionRef.current.x;
								const top  = Math.round((draggableElementRect.top + draggableElementRect.bottom)/2) - canvasTopLeftPositionRef.current.y;
								let result = props.getNodeInstance(newNode, props.flowrunnerConnector,undefined,settings);
								if (result && result.getWidth) {
									newNode.x = (left - (stageInstance).x()) / scaleFactor;
									newNode.y = (top - (stageInstance).y()) / scaleFactor;
									newNode.x -= (result.getWidth(newNode) || newNode.width || 250)/2;
								}
							}
						}

						let centerXCorrection = 0;
						let centerYCorrection = 0;
						
						if (shapeType === "Rect" || shapeType === "Ellipse") {
							centerXCorrection = ShapeMeasures.rectWidht / 2;
							centerYCorrection = ShapeMeasures.rectHeight / 2;
						} else
						if (shapeType === "Circle") {
							centerXCorrection = ShapeMeasures.circleSize / 2;
							centerYCorrection = ShapeMeasures.circleSize / 2;
						} else
						if (shapeType === "Diamond") {
							centerXCorrection = ShapeMeasures.diamondSize / 2;
							centerYCorrection = ShapeMeasures.diamondSize / 2;
						}

						newNode.x = newNode.x - centerXCorrection;
						newNode.y = newNode.y - centerYCorrection;
						
						const lineRef = shapeRefs.current[connectionForDraggingName];
						if (lineRef) {
							lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 0});
							stageInstance.batchDraw();
						}
						
						positionContext.setPosition(newNode.name, {
							x: newNode.x,
							y: newNode.y
						});
						positionContext.setCommittedPosition(newNode.name, {
							x: newNode.x,
							y: newNode.y
						});
						
						flowStore.addFlowNode(newNode);
						if (closestNodeAreLineNodes.current) {
							if (closestEndNodeWhenAddingNewNode.current) {
								const closestEndConnectionNode = closestEndNodeWhenAddingNewNode.current as any;
								closestEndConnectionNode.startshapeid = newNode.name;
								flowStore.storeFlowNode(closestEndConnectionNode,closestEndConnectionNode.name, positionContext.context);
							}
							if (closestStartNodeWhenAddingNewNode.current) {
								const closestStartConnectionNode = closestStartNodeWhenAddingNewNode.current as any;
								closestStartConnectionNode.endshapeid = newNode.name;
								flowStore.storeFlowNode(closestStartConnectionNode,closestStartConnectionNode.name, positionContext.context);
							}
						} else {
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

								if (connection.startshapeid === connection.endshapeid) {
									console.log("connection to node itself 3");										
									return;
								}

								positionContext.setPosition(connection.name, {
									xstart: connection.xstart,
									ystart: connection.ystart,
									xend: connection.xend,
									yend: connection.yend
								});
								positionContext.setCommittedPosition(connection.name, {
									xstart: connection.xstart,
									ystart: connection.ystart,
									xend: connection.xend,
									yend: connection.yend
								});
								flowStore.addConnection(connection);
							}
						}

						/*
						if (props.flowrunnerConnector.hasStorageProvider) {
							props.saveFlow();
						}
						*/
						
						interactionState.current = InteractionState.idle;
						clearConnectionState();
					}				
				}
			} else {
				alert("select task!!");
			}
		}
	}

	const addTaskToCanvas = (event: any, taskClassName : string) => {

		// hack to have a usuable stage position when dropping nodes on stage
		if (lastMousePositionRef.current) {
			const stageInstance = (stage.current as any).getStage();

			const correctedPointerPosition = {...lastMousePositionRef.current};
			correctedPointerPosition.clientX += canvasTopLeftPositionRef.current.x;
			correctedPointerPosition.clientY += canvasTopLeftPositionRef.current.y;

			stageInstance.setPointersPositions(correctedPointerPosition);
		}
		let element	 = document.querySelector(".taskbar__task-dragging");
		if (element) {
			const rect = element.getBoundingClientRect();

			if (taskClassName.indexOf("repo-item") === 0) {
				loadRepoItemFromModuleAndAdd(taskClassName, rect);
				return;
			}

			if (taskClassName.indexOf("custom-node") === 0) {
				console.log("lastMousePositionRef.current", lastMousePositionRef.current);
				loadCustomNodeFromModuleAndAdd(event, taskClassName, rect);
				return;
			}	
			addTaskClassNameToCanvas(event, taskClassName, undefined, rect);		
		}
		return false;
	}
	
	const getDistance = (node,position) => {
		const x = node.x-position.x;
		const y = node.y-position.y;
		return Math.sqrt( x*x + y*y );
	}

	const movingExistingOrNewNodeOnCanvas = (dropX: number, dropY: number, taskTypeBeingDraggedOnStage? : string, isConnectingToExistingNode? : boolean, existingNode?: any, noScale? : boolean) => {

		if (!!isConnectingToExistingNode && existingNode) {
			const mappedNode = flowStore.flowHashmap.get(existingNode.name);
			// an existing node that is already connected on both ends, shall not
			// be auto connected to other nodes
			if (mappedNode.start.length > 0 && mappedNode.end.length > 0) {
				console.log("movingExistingOrNewNodeOnCanvas mappedNode.start.length > 0 && mappedNode.end.length > 0");
				return;
			}
		}

		let allowedInputTaskTypes : string[] = [];
		let allowedOutputTaskTypes : string[] = [];
		let notAllowedInputTaskTypes : string[] = [];
		let notAllowedOutputTaskTypes : string[] = [];
		let incomingTaskType = "";

		if (taskTypeBeingDraggedOnStage) {
			const settings = ShapeSettings.getShapeSettings(taskTypeBeingDraggedOnStage, undefined);
			allowedInputTaskTypes = (settings as any)?.constraints?.input?.allowed ?? [];
			notAllowedInputTaskTypes = (settings as any)?.constraints?.input?.notAllowed ?? [];

			allowedOutputTaskTypes = (settings as any)?.constraints?.output?.allowed ?? [];
			notAllowedOutputTaskTypes = (settings as any)?.constraints?.output?.notAllowed ?? [];
			
			incomingTaskType = taskTypeBeingDraggedOnStage;
		} else 
		if (!!isConnectingToExistingNode && existingNode) {
			const settings = ShapeSettings.getShapeSettings(existingNode.taskType, undefined);
			allowedInputTaskTypes = (settings as any)?.constraints?.input?.allowed ?? [];
			notAllowedInputTaskTypes = (settings as any)?.constraints?.input?.notAllowed ?? [];

			allowedOutputTaskTypes = (settings as any)?.constraints?.output?.allowed ?? [];
			notAllowedOutputTaskTypes = (settings as any)?.constraints?.output?.notAllowed ?? [];

			incomingTaskType = existingNode.taskType;
		}

		console.log(allowedInputTaskTypes,notAllowedInputTaskTypes,allowedOutputTaskTypes,notAllowedOutputTaskTypes);

		if (stage && stage.current) {
			let stageInstance = (stage.current as any).getStage();
			if (stageInstance) {
				const scaleFactor = stageInstance.scaleX();

				let position = {
					x: 0,
					y: 0
				};
				position.x = ((dropX - (stageInstance).x()) / scaleFactor);
				position.y = ((dropY - (stageInstance).y()) / scaleFactor);
				if (noScale !== undefined && !!noScale) {
					position.x = dropX;
					position.y = dropY;
				}

				/*
					TODO : calcluate position leff/right/top/bottom for current node being dragged
					- node can be dragged to stage (position is center, so easier to calculate)
					- node can be already on stage

					calculate the closest positions depending on where the nodes are
					 relative to each other, for example
						- if the node is being dragged is on the left side of a node on stage,
							the only calculate the position of the output of the node being dragged to the input of the node on stage
								.. and so on

					
				*/
				const minDistanceForAutoConnect = 750; // 750
				let minDistance = -1;
				let closestNode : any;
				let closestStartNode : any;
				let closestEndNode : any;
				let orientationIsLeft = false;
				let nodeOrientation = ThumbPositionRelativeToNode.default;
				closestNodeWhenAddingNewNode.current = undefined;
				nodeOrientationClosestNodeWhenAddingNewNode.current = nodeOrientation;

				closestNodeAreLineNodes.current = false;
				closestStartNodeWhenAddingNewNode.current = undefined;
				closestEndNodeWhenAddingNewNode.current = undefined;

				let isInputToNode = false;
				let isOutputToNode = false;
				let isNodeConnection = false;

				flowStore.flow.forEach((node) => {

					if (node.shapeType === 'Line') {
						if (node.startshapeid === undefined) {

							if (isConnectingToExistingNode && existingNode && node.endshapeid === existingNode.name) {
								return;
							}							
							let nodePosition = positionContext.getPosition(node.name);
							if (!nodePosition) {
								nodePosition = {
									xstart: node.xstart,
									ystart: node.ystart,
									xend: node.xend,
									yend: node.yend
								}
							}

							// get allowed input and output taskTypes for node.taskType
							// isConnectingToExistingNode: get allowed input and output taskTypes for existingNode.taskType

							let leftPosition = {
								x: nodePosition.xstart,
								y: nodePosition.ystart
							}
							const distance = getDistance(position,leftPosition);
							if (distance >= 0) {
								if (distance < (400)) {
									closestEndNode = node;
									closestNode = undefined;
									orientationIsLeft = false;
									nodeOrientation = ThumbPositionRelativeToNode.default;	
									isOutputToNode = true;
									isNodeConnection = true;
								}							
							}
						}

						if (node.endshapeid === undefined) {

							if (isConnectingToExistingNode && existingNode && node.startshapeid === existingNode.name) {
								return;
							}
							
							let nodePosition = positionContext.getPosition(node.name);
							if (!nodePosition) {
								nodePosition = {
									xstart: node.xstart,
									ystart: node.ystart,
									xend: node.xend,
									yend: node.yend
								}
							}

							let rightPosition = {
								x: nodePosition.xend,
								y: nodePosition.yend
							}
							const distance = getDistance(position,rightPosition);
							if (distance >= 0) {
								if (distance < (400)) {
									closestStartNode = node;
									closestNode = undefined;
									orientationIsLeft = false;
									nodeOrientation = ThumbPositionRelativeToNode.default;
	
									isInputToNode = true;
									isNodeConnection = true;
								}							
							}
						}
					} else
					if (node.shapeType !== 'Line') {
						if (!!isConnectingToExistingNode && existingNode) {

							/*
								This doesn't work yet because when dragging
								an existing node, the connections are not
								connected to the thumbs while dragging

								AND

								in stagetouchend the nodes are not connected
								via a connections
							*/
							return;
							if (node.name === existingNode.name) {
								return;
							}
						}

						const nodeSetings = ShapeSettings.getShapeSettings(node.taskType, node);
						const allowedInputTaskTypesForNode = (nodeSetings as any)?.constraints?.input?.allowed ?? [];
						const notAllowedInputTaskTypesForNode = (nodeSetings as any)?.constraints?.input?.notAllowed ?? [];
			
						const allowedOutputTaskTypesForNode = (nodeSetings as any)?.constraints?.output?.allowed ?? [];
						const notAllowedOutputTaskTypesForNode = (nodeSetings as any)?.constraints?.output?.notAllowed ?? [];
			
						console.log(node.taskType);

						if (node.taskType === "Annotation") {
							return;
						}

						if (node.shapeType === "Section") {
							return;
						}
						

						const nodePosition = positionContext.getPosition(node.name);
						if (!nodePosition) {
							return;
						}

						const rightPosition = FlowToCanvas.getStartPointForLine(node,{
							x: nodePosition.x,
							y: nodePosition.y

						}, 
						undefined, undefined,
						undefined, props.getNodeInstance, ThumbPositionRelativeToNode.default);

						const bottomPosition = FlowToCanvas.getStartPointForLine(node,{
							x: nodePosition.x,
							y: nodePosition.y

						}, 
						undefined, undefined,
						undefined, props.getNodeInstance, ThumbPositionRelativeToNode.bottom);

						const leftPosition = FlowToCanvas.getEndPointForLine(node,{
							x: nodePosition.x,
							y: nodePosition.y

						}, 
						undefined, undefined,
						props.getNodeInstance);

						const topPosition = FlowToCanvas.getEndPointForLine(node,{
							x: nodePosition.x,
							y: nodePosition.y

						}, 
						undefined, undefined, 
						props.getNodeInstance, ThumbPositionRelativeToNode.top);

						let distanceTop = -1;
						let distanceBottom = -1;
						if (node.shapeType === "Diamond") {
							const topPositionDiamond = FlowToCanvas.getStartPointForLine(node,{
								x: nodePosition.x,
								y: nodePosition.y
	
							}, 
							undefined, undefined,
							undefined, props.getNodeInstance, ThumbPositionRelativeToNode.top);

							const bottomPositionDiamond = FlowToCanvas.getStartPointForLine(node,{
								x: nodePosition.x,
								y: nodePosition.y
	
							}, 
							undefined, undefined,
							undefined, props.getNodeInstance, ThumbPositionRelativeToNode.bottom);

							distanceTop = getDistance(position,topPositionDiamond);
							distanceBottom = getDistance(position,bottomPositionDiamond);
						} else {
							//distanceTop = getDistance(position, topPosition);
							//distanceBottom = getDistance(position, bottomPosition);
						}
						const distanceLeft = getDistance(position,leftPosition);
						const distanceRight = getDistance(position,rightPosition);


						const isAllowedOutput = (taskType) => {
							if (notAllowedOutputTaskTypes.indexOf(taskType) >= 0) {
								return false;
							}
							if (allowedOutputTaskTypes.length > 0 && allowedOutputTaskTypes.indexOf(taskType) < 0) {
								return false;
							}

							if (notAllowedInputTaskTypesForNode.indexOf(incomingTaskType) >= 0) {
								return false;
							}
							if (allowedInputTaskTypesForNode.length > 0 && allowedOutputTaskTypes.indexOf(incomingTaskType) < 0) {
								return false;
							}
							return true;
						}


						const isAllowedInput = (taskType) => {
							if (notAllowedInputTaskTypes.indexOf(taskType) >= 0) {
								return false;
							}
							if (allowedInputTaskTypes.length > 0 && allowedInputTaskTypes.indexOf(taskType) < 0) {
								return false;
							}
							if (notAllowedOutputTaskTypesForNode.indexOf(incomingTaskType) >= 0) {
								return false;
							}
							if (allowedOutputTaskTypesForNode.length > 0 && allowedOutputTaskTypes.indexOf(incomingTaskType) < 0) {
								return false;
							}
							return true;
						}

						if (minDistance == -1 || distanceLeft < minDistance) {
							if (distanceLeft < minDistanceForAutoConnect) {
								
								if (!isAllowedOutput(node.taskType)) {
									return;
								}
								
								minDistance = distanceLeft;
								closestNode = node;
								orientationIsLeft = false;
								nodeOrientation = ThumbPositionRelativeToNode.default;
								isNodeConnection = false;
								closestStartNode = undefined;
								closestEndNode = undefined;
								
								if (node.shapeType === "Diamond") {
									isInputToNode = true;
									isOutputToNode = false;

									// TODO .. depends on diamond type .. can be output
								} else {
									isInputToNode = true;
									isOutputToNode = false;
								}
							}							
						}
						
						

						if (distanceTop >= 0 && (minDistance == -1 || distanceTop < minDistance)) {
							if (distanceTop < minDistanceForAutoConnect) {

								if (!isAllowedInput(node.taskType)) {
									return;
								}								

								// currently this is always diamond
								minDistance = distanceTop;
								closestNode = node;
								orientationIsLeft = false;
								nodeOrientation = ThumbPositionRelativeToNode.top;
								closestStartNode = undefined;
								closestEndNode = undefined;

								isNodeConnection = false;
								isInputToNode = false;
								isOutputToNode = true;
							}							
						}

						if (distanceBottom >= 0 && (minDistance == -1 || distanceBottom < minDistance)) {
							if (distanceBottom < minDistanceForAutoConnect) {

								if (!isAllowedInput(node.taskType)) {
									return;
								}

								// currently this is always diamond
								minDistance = distanceBottom;
								closestNode = node;
								orientationIsLeft = false;
								nodeOrientation = ThumbPositionRelativeToNode.bottom;
								closestStartNode = undefined;
								closestEndNode = undefined;

								isNodeConnection = false;
								isInputToNode = false;
								isOutputToNode = true;
							}							
						}


						if (node.shapeType !== "Diamond") {
							if (minDistance == -1 || distanceRight < minDistance) {
								if (distanceRight < minDistanceForAutoConnect) {

									if (!isAllowedInput(node.taskType)) {
										return;
									}

									minDistance = distanceRight;
									closestNode = node;
									orientationIsLeft = true;
									nodeOrientation = ThumbPositionRelativeToNode.default;
									closestStartNode = undefined;
									closestEndNode = undefined;

									isNodeConnection = false;
									isInputToNode = false;
									isOutputToNode = true;
								}
							}
						} 
					}
				});


				if (isNodeConnection) {
					closestNodeAreLineNodes.current = true;
				
				
					if (isOutputToNode && closestEndNode) {
						closestEndNodeWhenAddingNewNode.current = closestEndNode;
						const lineRef = shapeRefs.current[closestEndNode.name];
						if (lineRef) {
							const nodePosition = positionContext.getPosition(closestEndNode.name);
							if (!nodePosition) {
								return;
							}

							if (isConnectingToExistingNode && existingNode) {
								const positionNode = positionContext.getPosition(existingNode.name) || existingNode;
								let newStartPosition =  FlowToCanvas.getStartPointForLine(existingNode, {
										x: positionNode.x,
										y: positionNode.y
									}, 
									undefined, undefined,
									closestEndNode, props.getNodeInstance,
									ThumbPositionRelativeToNode.default);
								position.x = newStartPosition.x;
								position.y = newStartPosition.y;
							} else {
								position.x += 100;
							}

							let controlPoints = calculateLineControlPoints(
								position.x, position.y,
								nodePosition.xend, nodePosition.yend, 								
								ThumbPositionRelativeToNode.default);
								
							lineRef.modifyShape(ModifyShapeEnum.SetPoints, {points: [
								position.x, position.y,
								controlPoints.controlPointx1, controlPoints.controlPointy1,
								controlPoints.controlPointx2, controlPoints.controlPointy2,
								nodePosition.xend, nodePosition.yend,
							]});

							const thumbRef = shapeRefs.current["thumbstart_line_" + closestEndNode.name];
							if (thumbRef) {
								thumbRef.modifyShape(ModifyShapeEnum.SetXY, position);
							}

							const thumbEndRef = shapeRefs.current["thumb_line_" + closestEndNode.name];
							if (thumbEndRef) {
								thumbEndRef.modifyShape(ModifyShapeEnum.SetXY, {
									x: nodePosition.xend,
									y: nodePosition.yend
								});
							}

							const connectionForDraggingRef = shapeRefs.current[connectionForDraggingName];
							if (connectionForDraggingRef) {
								connectionForDraggingRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 0});
							}

							stageInstance.batchDraw();
						}						
					}

					if (isInputToNode && closestStartNode) {
						closestStartNodeWhenAddingNewNode.current = closestStartNode;
						const lineRef = shapeRefs.current[closestStartNode.name];
						if (lineRef) {
							const nodePosition = positionContext.getPosition(closestStartNode.name);
							if (!nodePosition) {
								return;
							}

							if (isConnectingToExistingNode && existingNode) {
								const positionNode = positionContext.getPosition(existingNode.name) || existingNode;
								let newEndPosition =  FlowToCanvas.getEndPointForLine(existingNode, {
										x: positionNode.x,
										y: positionNode.y
									}, 
									closestStartNode, nodePosition,
									props.getNodeInstance,
									ThumbPositionRelativeToNode.default);
								position.x = newEndPosition.x;
								position.y = newEndPosition.y;
							} else {
								position.x -= 200;
							}

							let controlPoints = calculateLineControlPoints(
								nodePosition.xstart, nodePosition.ystart, 
								position.x, position.y,																
								ThumbPositionRelativeToNode.default);
								
							lineRef.modifyShape(ModifyShapeEnum.SetPoints, {points: [
								nodePosition.xstart, nodePosition.ystart,
								controlPoints.controlPointx1, controlPoints.controlPointy1,
								controlPoints.controlPointx2, controlPoints.controlPointy2,
								position.x, position.y,
							]});

							const thumbRef = shapeRefs.current["thumbstart_line_" + closestStartNode.name];
							if (thumbRef) {
								thumbRef.modifyShape(ModifyShapeEnum.SetXY, {
									x: nodePosition.xend,
									y: nodePosition.yend
								});
							}

							const thumbEndRef = shapeRefs.current["thumb_line_" + closestStartNode.name];
							if (thumbEndRef) {
								thumbEndRef.modifyShape(ModifyShapeEnum.SetXY, position);
							}


							const connectionForDraggingRef = shapeRefs.current[connectionForDraggingName];
							if (connectionForDraggingRef) {
								connectionForDraggingRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 0});
							}

							stageInstance.batchDraw();
						}							
					}
					return false;	
				} else 
				if (!isNodeConnection && closestNode) {

					closestNodeAreLineNodes.current = false;

					const settings = ShapeSettings.getShapeSettings(closestNode.taskType, closestNode);		


					if (!isNodeConnection && isInputToNode) {
						const allowedInputs = FlowToCanvas.getAllowedInputs(closestNode.shapeType, settings);
						const canHaveInputs = FlowToCanvas.canHaveInputs(closestNode.shapeType, settings, flowStore.flow, closestNode, flowStore.flowHashmap);
						if (allowedInputs === 0 || !canHaveInputs) {
							const lineRef = shapeRefs.current[connectionForDraggingName];
							if (lineRef) {
								lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 0});
								stageInstance.batchDraw();
							}
							return false;						
						}
					}

					if (!isNodeConnection && isOutputToNode) {
						const allowedOutputs = FlowToCanvas.getAllowedOutputs(closestNode.shapeType, settings);
						const canHaveOutputs = FlowToCanvas.canHaveOutputs(closestNode.shapeType, settings, flowStore.flow, closestNode, flowStore.flowHashmap);
						if (allowedOutputs === 0 || !canHaveOutputs) {
							const lineRef = shapeRefs.current[connectionForDraggingName];
							if (lineRef) {
								lineRef.modifyShape(ModifyShapeEnum.SetOpacity, {opacity: 0});
								stageInstance.batchDraw();
							}
							return false;
						}
					}

					closestNodeWhenAddingNewNode.current = closestNode;
					orientationClosestNodeWhenAddingNewNode.current = orientationIsLeft;
					nodeOrientationClosestNodeWhenAddingNewNode.current = nodeOrientation;
					const lineRef = shapeRefs.current[connectionForDraggingName];
					if (!isNodeConnection && lineRef) {
						let thumbPosition = ThumbPositionRelativeToNode.default;
						let lineStartPosition;

						const nodePosition = positionContext.getPosition(closestNode.name);
						if (!nodePosition) {
							return;
						}

						if (closestNode.shapeType === "Diamond" && nodeOrientation !== ThumbPositionRelativeToNode.default) {
							lineStartPosition = FlowToCanvas.getStartPointForLine(closestNode,{
								x: nodePosition.x,
								y: nodePosition.y

							}, 
							undefined, undefined,
							undefined, props.getNodeInstance, nodeOrientation);

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

							}, 
							undefined, undefined,
							undefined, props.getNodeInstance, ThumbPositionRelativeToNode.default);

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

							}, 
							undefined, undefined,
							props.getNodeInstance);

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
		
		if (event.keyCode == fKey || event.keyCode == fKeyCapt) {
			if (selectedNodeRef.current) {
				event.preventDefault();
				fitStage(undefined, false, false, true);
				return false;
			}
			return true;
		}

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
				selectNode("", undefined);
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
		flowStore.storeFlowNode(node, orgNodeName, positionContext.context);
	}

	const handleDragStart = (event) => {
		setActiveId(event.active.id);		
	}
	  
	const handleDragEnd= (event) => {
		console.log("event" , event);
		if (activeId) {
			addTaskToCanvas(event, activeId);
		}
		setActiveId(undefined);
	}

	const handleDragMove = (event) => {
		if (activeId?.indexOf("repo-item") == 0) {
			return "";
		}

		if (activeId?.indexOf("custom-node") == 0) {
			return "";
		}

		if (activeId && activeId?.indexOf("Annotation") >= 0) {
			return "";
		}

		let element	 = document.querySelector(".taskbar__task-dragging");
		if (element) {
			let rect = element.getBoundingClientRect();
			movingExistingOrNewNodeOnCanvas(
				Math.round(((rect.left + rect.right)/2) - canvasTopLeftPositionRef.current.x), 
				Math.round(((rect.top+rect.bottom)/2) - canvasTopLeftPositionRef.current.y),
				activeId, false
			);
		}		
	}

	const canvasHasSelectedNode : boolean = !!selectedNodeRef.current;	

	const connections = canvasMode.showDependencies ? getDependentConnections() : [];
	let nodesConnectedToSelectedNode : any = {};
	//const flowMemo = flowStore.flow;/*useMemo(() => {
	//	return flowStore.flow
	//}, [flowStore, positionContext]);*/
/*
<DndContext 
			    id={"canvas-dndcontext"}
				modifiers={[restrictToWindowEdges]}
				onDragStart={handleDragStart} 
				onDragMove={handleDragMove}
				onDragEnd={handleDragEnd}>
				<ErrorBoundary>

	tussen taskbar en div:

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
*/

	return <>
		<DndContext 
			id={"canvas-dndcontext"}
			modifiers={[restrictToWindowEdges]}
			onDragStart={handleDragStart} 
			onDragMove={handleDragMove}
			onDragEnd={handleDragEnd}
		>			
			
				<Taskbar flowrunnerConnector={props.flowrunnerConnector} 
					isDragging={activeId !== undefined}
					hasCustomNodesAndRepository={props.hasCustomNodesAndRepository}
					hasDefaultUITasks={props.hasDefaultUITasks}
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
					style={{opacity: canvasOpacity || props.initialOpacity}} 
					className="canvas-controller__scroll-container"
					data-id={props.externalId}
					tabIndex={0} 
					onInput={onInput}
					onKeyDown={onInput}
					onKeyUp={onKeyUp}	
					//onWheel={wheelEvent}			
					onMouseLeave={onStageMouseLeave}
					>
					
					<div ref={setNodeRef} style={droppableStyle}>
					<PositionContext.Consumer>
      					{value => (
						<Stage					
							onClick={clickStage}					
							draggable={true}
							pixelRatio={1} 
							width={stageWidth}
							height={stageHeight }
							ref={ref => ((stage as any).current = ref)}
							onDragMove={onDragStageMove}
							onDragEnd={onDragStageEnd}
							
							onMouseDown={onStageTouchStart}
							onTouchStart={onStageTouchStart}
							onTouchMove={onStageTouchMove}
							onMouseMove={onStageTouchMove}
							onTouchEnd={onStageMouseEnd}							
							onMouseUp={onStageMouseEnd}

							onTap={clickStage}
							className="stage-container">
							<PositionProvider 
								positionContext={value}
								isBridged={true}
							>
								<Layer key={"stage-layer-" + canvasKey} ref={ref => ((layer as any).current = ref)}>
									<Group ref={ref => ((stageGroup as any).current = ref)}>
									<Rect x={0} y={0} width={1024} height={750}></Rect>
									<Rect 
										x={0} 
										y={0} 
										width={0} 
										height={0}
										listening={false}
										stroke={"#202020"}
										hitStrokeWidth={0}			
										strokeWidth={4}
										dash={[5,10]}
										opacity={0}
										ref={ref => ((selectingRectRef as any).current = ref)}
									></Rect>

									{flowStore.flow.map((node, index) => {
										if (node.shapeType === "Text") {
											return <AnnotationText
												key={`text-${index}`}
												ref={ref => (shapeRefs.current[node.name] = ref)}
												x={node.x} 
												y={node.y}
												width={node.width} 
												height={node.height}
												name={node.name}
												node={node}
												onClick={(event) => onClickShape(node, event)}
												onMouseStart={(event) => onMouseStart(node, event)}
												onMouseOver={(event) => onMouseOver(node, event)}
												onMouseOut={(event) => onMouseOut()}
												onTouchStart={(event) => onTouchStart(node, event)}
												onMouseEnd={(event) => onMouseEnd(node, event)}
												onMouseMove={(event) => onMouseMove(node, event)}
												onMouseLeave={(event) => onMouseLeave(node, event)}	
												
												onDragStart={(event) => onDragStart(node, event)}
												onDragEnd={(event) => onDragEnd(node, event)}
												onDragMove={(event) => onDragMove(node, event)}
											></AnnotationText>
										} else
										if (node.shapeType === "Section") {
											return <AnnotationSection 
												key={`section-${index}`}
												ref={ref => (shapeRefs.current[node.name] = ref)}
												x={node.x} 
												y={node.y} 											
												width={node.width} 
												height={node.height}
												name={node.name}
												onClick={(event) => onClickShape(node, event)}
												onMouseStart={(event) => onMouseStart(node, event)}
												onMouseOver={(event) => onMouseOver(node, event)}
												onMouseOut={(event) => onMouseOut()}
												onTouchStart={(event) => onTouchStart(node, event)}
												onMouseEnd={(event) => onMouseEnd(node, event)}
												onMouseMove={(event) => onMouseMove(node, event)}
												onMouseLeave={(event) => onMouseLeave(node, event)}	
												
												onDragStart={(event) => onDragStart(node, event)}
												onDragEnd={(event) => onDragEnd(node, event)}
												onDragMove={(event) => onDragMove(node, event)}
											></AnnotationSection>
										}
										return null;
									})}
									{connections.length > 0 && connections.map((node, index) => {

										if (canvasHasSelectedNode &&  selectedNodeRef.current) {
											if (node.startshapeid === selectedNodeRef.current.name) {
												nodesConnectedToSelectedNode[node.endshapeid] = true;
											}

											if (node.endshapeid === selectedNodeRef.current.name) {
												nodesConnectedToSelectedNode[node.startshapeid] = true;
											}								
										}
										return <Shapes.Line key={"cn-node-" + index}
												onMouseOver={(event) => onMouseOver(node, event)}
												onMouseOut={(event) => onMouseOut()}
												onMouseStart={undefined}
												onMouseMove={undefined}
												onMouseEnd={undefined}
												onClickLine={(event) => onClickLine(node, event)}
												isSelected={false}
												isAltColor={true}									
												canvasHasSelectedNode={canvasHasSelectedNode}
												isConnectionWithVariable={node.isConnectionWithVariable}
												isConnectionWithFunction={node.isConnectionWithFunction}
												xstart={node.xstart} 
												ystart={node.ystart}									
												xend={node.xend} 
												yend={node.yend}
												selectedNodeName={canvasHasSelectedNode ? selectedNodeRef.current.name : ""}
												startNodeName={node.startshapeid}
												endNodeName={node.endshapeid}
												noMouseEvents={true}	
												></Shapes.Line>})
									}
									{flowStore.flow.map((node, index) => {
										if (node.shapeType !== "Line") {

											let position = positionContext.getPosition(node.name);
											if (!position) {
												if (node.shapeType !== "Line") {
													positionContext.setPosition(node.name, {
														x: node.x,
														y: node.y
													});
												} else {
													
													positionContext.setPosition(node.name, {
														xstart: node.xstart,
														ystart: node.ystart,
														xend: node.xend,
														yend: node.yend
													});
												}  
												position = positionContext.getPosition(node.name);
											}
											if (!position) {
												return null;
											}

											return <LinesForShape key={"node-lineshape-"+index} 
												x={position?.x ?? 0} 
												y={position?.y ?? 0} 
												name={node.name}
												taskType={node.taskType}
												node={node}			
												shapeRefs={shapeRefs as any}
												useFlowStore={props.useFlowStore}
												canvasHasSelectedNode={canvasHasSelectedNode}
												
												nodeState={""}
												selectedNode={selectedNodeRef.current}
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
												onMouseStart={onMouseStart}
												onMouseMove={onMouseMove}
												onMouseEnd={onMouseEnd}
												onMouseLeave={(event) => onMouseLeave(node, event)}
												isSelected={selectedNodeRef.current.name === node.name}
												isConnectedToSelectedNode={false}
												getNodeInstance={props.getNodeInstance}
												touchedNodes={touchedNodesStore.nodesTouched}

												onMouseConnectionStartOver={onMouseConnectionStartOver}
												onMouseConnectionStartOut={onMouseConnectionStartOut}
												onMouseConnectionStartStart={onMouseConnectionStartStart}
												onMouseConnectionStartMove={onMouseConnectionStartMove}
												onMouseConnectionStartEnd={onMouseConnectionStartEnd}

												onMouseConnectionEndOver={onMouseConnectionEndOver}
												onMouseConnectionEndOut={onMouseConnectionEndOut}
												onMouseConnectionEndStart={onMouseConnectionEndStart}
												onMouseConnectionEndMove={onMouseConnectionEndMove}
												onMouseConnectionEndEnd={onMouseConnectionEndEnd}
												onMouseConnectionEndLeave={onMouseConnectionEndLeave}
												
											></LinesForShape>
										} else {
											// TODO : check here if line and startshapeid or endshapeid == undefined
											if (node.shapeType === "Line") {
												if (node.startshapeid === undefined) {
													let position = positionContext.getPosition(node.name);
													if (!position) {														
														positionContext.setPosition(node.name, {
																xstart: node.xstart,
																ystart: node.ystart,
																xend: node.xend,
																yend: node.yend
															});
															position = positionContext.getPosition(node.name);
													}

													if (!position) {
														return null;
													}

													if (node.endshapeid !== undefined) {
														const endIndex = flowStore.flowHashmap.get(node.endshapeid).index;
														if (endIndex >= 0) {													
															const endNode =  flowStore.flow[endIndex];
															if (endNode) {
																let positionNode = positionContext.getPosition(node.endshapeid) || endNode;
																let newEndPosition =  FlowToCanvas.getEndPointForLine(endNode, {
																	x: positionNode.x,
																	y: positionNode.y
																},
																undefined, undefined,
																props.getNodeInstance,
																node.thumbEndPosition as ThumbPositionRelativeToNode || ThumbPositionRelativeToNode.default);
																position.xend = newEndPosition.x;
																position.yend = newEndPosition.y;
															}
														}
													}

													if (!position) {
														return null;
													}

													return <Shapes.Line key={"ln-node-" + index}
														ref={ref => (shapeRefs.current[node.name] = ref)}
														onMouseOver={(event) => onMouseOver(node, event)}
														onMouseOut={onMouseOut}
														onClickLine={(event) => onClickLine(node, event)}
														isSelected={false}
														isAltColor={true}									
														canvasHasSelectedNode={canvasHasSelectedNode}													
														xstart={position?.xstart ?? 0} 
														ystart={position?.ystart ?? 0}									
														xend={position?.xend ?? 0} 
														yend={position?.yend ?? 0}
														selectedNodeName={canvasHasSelectedNode ? selectedNodeRef.current.name : ""}
														startNodeName={node.startshapeid}
														endNodeName={node.endshapeid}
														noMouseEvents={false}
														lineNode={node}
														shapeRefs={shapeRefs.current}
														getNodeInstance={props.getNodeInstance}
														hasStartThumb={true}

														onMouseStart={onMouseStart}
														onMouseMove={onMouseMove}
														onMouseEnd={onMouseEnd}

														hasEndThumb={node.endshapeid === undefined}
														onMouseConnectionStartOver={onMouseConnectionStartOver}
														onMouseConnectionStartOut={onMouseConnectionStartOut}
														onMouseConnectionStartStart={onMouseConnectionStartStart}
														onMouseConnectionStartMove={onMouseConnectionStartMove}
														onMouseConnectionStartEnd={onMouseConnectionStartEnd}

														onMouseConnectionEndOver={onMouseConnectionEndOver}
														onMouseConnectionEndOut={onMouseConnectionEndOut}
														onMouseConnectionEndStart={onMouseConnectionEndStart}
														onMouseConnectionEndMove={onMouseConnectionEndMove}
														onMouseConnectionEndEnd={onMouseConnectionEndEnd}
														onMouseConnectionEndLeave={onMouseConnectionEndLeave}
													></Shapes.Line>;
												}
											}
										}
										return null;
									})}

									{flowStore.flow.map((node, index) => {
										return <KonvaNode 
											key={"konva_" + node.name + flowStore.flowId}
											node={node}
											hasTaskNameAsNodeTitle={props.hasTaskNameAsNodeTitle}
											flowrunnerConnector={props.flowrunnerConnector}
											nodesStateLocal={nodesStateLocal.current[node.name] || ""}
											getNodeInstance={props.getNodeInstance}
											onCloneNode={onCloneNode}
											canvasHasSelectedNode={canvasHasSelectedNode}
											onFocus={onFocus}
											onShowNodeSettings={onShowNodeSettings}
											renderHtmlNode={props.renderHtmlNode}
											flowId={flowStore.flowId}
											flowMemo={flowStore.flow}
											nodesConnectedToSelectedNode={nodesConnectedToSelectedNode}
											useFlowStore={props.useFlowStore}
											shapeRefs={shapeRefs}

											onMouseStart={onMouseStart}
											onMouseOver={onMouseOver}
											onMouseOut={onMouseOut}
											onClickLine={onClickLine}
											onClickSetup={onClickSetup}
											onClickShape={onClickShape}
											onDragStart={onDragStart}
											onDragEnd={onDragEnd}
											onDragMove={onDragMove}
											onTouchStart={onTouchStart}
											onMouseEnd={onMouseEnd}
											onMouseMove={onMouseMove}
											onMouseLeave={onMouseLeave}

											onMouseConnectionStartOver={onMouseConnectionStartOver}
											onMouseConnectionStartOut={onMouseConnectionStartOut}
											onMouseConnectionStartStart={onMouseConnectionStartStart}
											onMouseConnectionStartMove={onMouseConnectionStartMove}
											onMouseConnectionStartEnd={onMouseConnectionStartEnd}

											onMouseConnectionEndOver={onMouseConnectionEndOver}
											onMouseConnectionEndOut={onMouseConnectionEndOut}
											onMouseConnectionEndStart={onMouseConnectionEndStart}
											onMouseConnectionEndMove={onMouseConnectionEndMove}
											onMouseConnectionEndEnd={onMouseConnectionEndEnd}
											onMouseConnectionEndLeave={onMouseConnectionEndLeave}
											
										></KonvaNode>;								
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
										onMouseStart={undefined}
										onMouseMove={undefined}
										onMouseEnd={undefined}
										isNodeConnectorHelper={true}
									></Shapes.Line>
								</Group></Layer>
							</PositionProvider>
						</Stage>

						)}
						</PositionContext.Consumer>
					</div>				
					<div ref={ref => ((htmlWrapper as any).current = ref)} 
						key={"html_wrapper_" +  flowStore.flowId}
						style={{transform: 
							"translate(" + (stageX ) + "px," + (stageY) + "px) "+
							"scale(" + (stageScale) + "," + (stageScale) + ") "}}
						className="canvas__html-elements"
						onMouseMove={onStageTouchMove}
						onMouseUp={onStageMouseEnd}
						
						>
						
						{flowStore.flow.map((node, index) => {
							return <HtmlNode
								key={"html_" + node.name + flowStore.flowId}
								ref={ref => (elementRefs.current[node.name] = ref)}	
								hasTaskNameAsNodeTitle={props.hasTaskNameAsNodeTitle}
								node={node}
								flowrunnerConnector={props.flowrunnerConnector}
								nodesStateLocal={nodesStateLocal.current[node.name] || ""}
								getNodeInstance={props.getNodeInstance}
								onCloneNode={onCloneNode}
								canvasHasSelectedNode={canvasHasSelectedNode}
								onFocus={onFocus}
								onShowNodeSettings={onShowNodeSettings}
								onShowNodeEditor={onShowNodeEditor}
								renderHtmlNode={props.renderHtmlNode}
								flowId={flowStore.flowId}
								flowMemo={flowStore.flow}
								formNodesubject={props.formNodesubject}

								useFlowStore={props.useFlowStore}

								onMouseStart={onMouseStart}
								onMouseOver={onMouseOver}
								onMouseOut={onMouseOut}
								onClickShape={onClickShape}
								onTouchStart={onTouchStart}
								onMouseEnd={onMouseEnd}
								onMouseMove={onMouseMove}
								onMouseLeave={onMouseLeave}

								onMouseConnectionStartOver={onMouseConnectionStartOver}
								onMouseConnectionStartOut={onMouseConnectionStartOut}
								onMouseConnectionStartStart={onMouseConnectionStartStart}
								onMouseConnectionStartMove={onMouseConnectionStartMove}
								onMouseConnectionStartEnd={onMouseConnectionStartEnd}

								onMouseConnectionEndOver={onMouseConnectionEndOver}
								onMouseConnectionEndOut={onMouseConnectionEndOut}
								onMouseConnectionEndStart={onMouseConnectionEndStart}
								onMouseConnectionEndMove={onMouseConnectionEndMove}
								onMouseConnectionEndEnd={onMouseConnectionEndEnd}
								onMouseConnectionEndLeave={onMouseConnectionEndLeave}
							></HtmlNode>;												
							})
						}
					</div>
				</div>
		</DndContext>		
		<FloatingToolbar useCanvasModeStateStore={props.useCanvasModeStateStore} />
		{showNodeSettings && <EditNodeSettings 
			modalSize={props.modalSize}
			hasTaskNameAsNodeTitle={props.hasTaskNameAsNodeTitle}
			node={editNode} settings={editNodeSettings} flowrunnerConnector={props.flowrunnerConnector} onClose={onCloseEditNodeSettings}></EditNodeSettings>}
		{showNodeEdit && <EditNodePopup node={editNode} 
			modalSize={props.modalSize}
			hasTaskNameAsNodeTitle={props.hasTaskNameAsNodeTitle}
			formNodesubject={props.formNodesubject}
			useFlowStore={props.useFlowStore}
			useSelectedNodeStore={props.useSelectedNodeStore}
			settings={editNodeSettings} flowrunnerConnector={props.flowrunnerConnector} onClose={onCloseEditNode}></EditNodePopup>}
		<Flow 
			flow={flowStore.flow}
			flowId={flowStore.flowId}
			flowrunnerConnector={props.flowrunnerConnector} />
		
	</>;
}
