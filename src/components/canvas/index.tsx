import * as React from 'react';
import { Stage, Layer , Rect } from 'react-konva';
import { connect } from "react-redux";
import { Shapes } from './shapes';
import { Thumbs }  from './shapes/thumbs';
import { ThumbsStart }  from './shapes/thumbsstart';
import { storeFlow, storeFlowNode, addConnection, addFlowNode,deleteConnection, deleteNode } from '../../redux/actions/flow-actions';
import { selectNode } from '../../redux/actions/node-actions';
import { setNodeState, clearNodeState } from '../../redux/actions/node-state-actions';
import { setNodesTouched, clearNodesTouched } from '../../redux/actions/nodes-touched-actions';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { ICanvasMode } from '../../redux/reducers/canvas-mode-reducers';
import { setConnectiongNodeCanvasMode , setConnectiongNodeCanvasModeFunction, setSelectedTask, setSelectedTaskFunction } from '../../redux/actions/canvas-mode-actions';
import { getTaskConfigForTask } from '../../config';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { ShapeSettings } from '../../helpers/shape-settings';
import { Observable, Subject } from 'rxjs';
import { getNewNode, getNewConnection} from '../../helpers/flow-methods';
import { ShapeMeasures } from '../../helpers/shape-measures';
import { Flow } from '../flow';
import { calculateLineControlPoints } from '../../helpers/line-points'
import { EditNodeSettings } from '../edit-node-settings';

import * as uuid from 'uuid';

import fetch from 'cross-fetch';

const uuidV4 = uuid.v4;

export interface CanvasProps {
	flow: any[];

	storeFlow : any;
	storeFlowNode: any;
	addFlowNode : any;
	selectNode: any;
	addConnection: any;

	setNodeState : (nodeName, nodeState) => void;

	deleteConnection: any;
	deleteNode: any;

	selectedNode : any;
	canvasMode: ICanvasMode;
	nodeState : any;

	nodesTouched: any;
	setNodesTouched : (nodesTouched: any) => void;
	clearNodesTouched: () => void;
	setConnectiongNodeCanvasMode: setConnectiongNodeCanvasModeFunction;
	setSelectedTask: setSelectedTaskFunction;
	canvasToolbarsubject : Subject<string>;
	
	renderHtmlNode?: (node: any, flowrunnerConnector : IFlowrunnerConnector, flow: any, taskSettings? : any) => any;
	flowrunnerConnector : IFlowrunnerConnector;
	getNodeInstance?: (node: any, flowrunnerConnector?: IFlowrunnerConnector, flow?: any, taskSettings? : any) => any;
	
}

const mapStateToProps = (state : any) => {
	return {
		flow: state.flow,
		selectedNode : state.selectedNode,
		canvasMode: state.canvasMode,
		nodeState : state.nodeState,
		nodesTouched: state.nodesTouched
	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		addConnection: (connection: any) => dispatch(addConnection(connection)),
		storeFlow: (flow) => dispatch(storeFlow(flow)),
		storeFlowNode: (node, orgNodeName) => dispatch(storeFlowNode(node, orgNodeName)),
		addFlowNode: (node) => dispatch(addFlowNode(node)),
		selectNode: (name, node) => dispatch(selectNode(name, node)),
		setConnectiongNodeCanvasMode : (enabled : boolean) => dispatch(setConnectiongNodeCanvasMode(enabled)),
		setSelectedTask : (selectedTask : string) => dispatch(setSelectedTask(selectedTask)),
		deleteConnection: (node) => dispatch(deleteConnection(node)),
		deleteNode: (node) => dispatch(deleteNode(node)),
		setNodeState : (nodeName, nodeState) => dispatch(setNodeState(nodeName, nodeState)),
		setNodesTouched: (nodesTouched) => dispatch(setNodesTouched(nodesTouched)),
		clearNodesTouched: (nodesTouched) => dispatch(clearNodesTouched())
	}
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

class ContainedCanvas extends React.Component<CanvasProps, CanvasState> {
	
	constructor(props) {
		super(props);

		this.canvasWrapper = React.createRef();
		this.stage = React.createRef();
		this.htmlWrapper = React.createRef();
		this.htmlElement = React.createRef();

		this.onDragEnd = this.onDragEnd.bind(this);
		this.onDragMove = this.onDragMove.bind(this);
		this.onClickShape = this.onClickShape.bind(this);

		this.wheelEvent = this.wheelEvent.bind(this);
		this.updateDimensions = this.updateDimensions.bind(this);

		this.shapeRefs = [];
		this.shapeRefs[this.connectionForDraggingName] = React.createRef();
	}


	state = {
		stageWidth : 0,
		stageHeight : 0,
		canvasOpacity: 0,
		canvasKey : 1,
		showNodeSettings: false,
		editNode: undefined,
		editNodeSettings : undefined,
		isConnectingNodesByDragging : false,
		connectionX: 0,
		connectionY: 0,
		updateNodeTouchedState: true
	}

	shapeRefs : any[];

	canvasWrapper : any;
	stage : any;
	htmlWrapper : any;
	htmlElement : any;
	stageScale = 1.0;
	stageX = 0.0;
	stageY = 0.0;

	flowIsLoading = false;

	componentDidMount() {
		if (this.canvasWrapper && this.canvasWrapper.current) {
			(this.canvasWrapper.current as any).addEventListener('wheel', this.wheelEvent);
		}
		window.addEventListener("resize", this.updateDimensions);
		document.addEventListener('paste', this.onPaste);
		this.updateDimensions();
		
		/*setTimeout(() => {			
			this.loadEditorState();
		}, 100);
		*/

		if (this.props.canvasToolbarsubject) {
			this.props.canvasToolbarsubject.subscribe({
				next: (message: string) => {
					if (this.unmounted) {
						return;
					}
					if (message == "loadFlow") {
						this.flowIsLoading = true;
						this.setState({canvasOpacity : 0});	
					} else
					if (message == "fitStage") {
						this.fitStage();
						this.setState({canvasOpacity : 1});	
					} else 
					if (message == "reload") {
						this.setState({canvasKey : this.state.canvasKey + 1});
					} else 
					if (message == "export") {
						this.export();
					}
				}
			});
		}

		this.props.clearNodesTouched();
		this.props.flowrunnerConnector.unregisterNodeStateObserver("canvas");
		this.props.flowrunnerConnector.registerNodeStateObserver("canvas", this.nodeStateObserver);
	}

	nodeStateStore : any = {};
	touchedNodes : any = {};

	updateTouchedNodes = () => {
		// DONT UPDATE STATE HERE!!!
		if  (this.touchedNodes) {
			if (this.stage && this.stage.current) {
				let stage = (this.stage.current as any).getStage();
				if (stage) {
					Object.keys(this.shapeRefs).map((touchNodeId) => {
						const lineRef = this.shapeRefs[touchNodeId];
						if (lineRef && lineRef.current && lineRef.current.getClassName() == "Arrow") {
							if (this.touchedNodes[touchNodeId] ) {
								const dash = [5,10];
								const _strokeWidth = 8;
								const _opacity = 1;
								lineRef.current.opacity(_opacity);
								lineRef.current.strokeWidth (_strokeWidth);
								lineRef.current.dash(dash);
							} else {
								const dash = [];
								const _strokeWidth = 4;
								const _opacity = 0.5;
								lineRef.current.opacity(_opacity);
								lineRef.current.strokeWidth (_strokeWidth);
								lineRef.current.dash(dash);
							}
						}
					});
					stage.batchDraw();
				}
			}
		}
	}

	nodeStateObserver = (nodeName: string, nodeState : string, touchedNodes : any) => {
		if (!this.state.updateNodeTouchedState) {
			return;
		}

		// TODO : check if nodeSate is the same as currentstate.. only set when it is different
		//let currentNodeState = this.props.nodeState["nodeName"];
		if (this.nodeStateStore[nodeName] != nodeState) {
			this.props.setNodeState(nodeName, nodeState);
		}
		this.nodeStateStore[nodeName] = nodeState;
		if (touchedNodes) {
			//console.log("touchedNodes", touchedNodes);
			Object.keys(touchedNodes).map((touchNodeId: string) => {
				const lineRef = this.shapeRefs[touchNodeId];
				if (lineRef && lineRef.current && lineRef.current.getClassName() == "Arrow") {
					return;
				}
				const element = document.getElementById(touchNodeId);
				if (element) {
					if (touchedNodes[touchNodeId] === true) {
						element.classList.remove("untouched");
					} else {
						element.classList.add("untouched");
					}
				}
			})
		}
		//
		// TODO : dont handle this by state/reducer but directly
		//this.props.setNodesTouched(touchedNodes);
		this.touchedNodes = touchedNodes;
		this.updateTouchedNodes();
	}

	connectionForDraggingName = "_connection-dragging";
	recalculateStartEndpoints = () => {

		// TODO : fix dit... want het werkt nog niet
		//  ... probleem is dat het kan gebeuren dat het eindpunt later wordt berekend 
		//    zonder dat het opnieuw berekend wordt
		//      .. bij 'Demo'-flow wordt de AssignTask gerenderd nadat Datagrid is berekend
		//      .. dus dat geeft verkeerde waardes
		//
		//      .. moet ook aangepast worden voor endlines

		//setTimeout(() => {
			//console.log("recalculateStartEndpoints");
			this.props.flow.map((node, index) => {
				if (node.shapeType !== "Line") {
					let shapeRef = this.shapeRefs[node.name];
					if (shapeRef && shapeRef.current) {
						//console.log("recalculateStartEndpoints", node.name, node, shapeRef.current);
/*
{
							x:node.x,
							y:node.y
						}


						data-x="888.2905825739357" data-y="814.6706657310602" data-top="-297" 
						parseInt(style.top) ..
*/
						let element = document.getElementById(node.name);
						if (element) {
							this.setHtmlElementsPositionAndScale(this.stageX, this.stageY, this.stageScale,node.x,node.y,node);
							this.setNewPositionForNode(node, shapeRef.current, {x:node.x,y:node.y}, false, true);
						}
					}
				}
			});

			if (this.stage && this.stage.current) {
				let stage = (this.stage.current as any).getStage();
				if (stage) {
					stage.batchDraw();
				}
			}
		//}, 1);
		
	}

	shouldComponentUpdate(nextProps : CanvasProps, nextState : CanvasState) {

		if (nextProps.flow != this.props.flow && nextProps.flow) {
			nextProps.flow.map((node, index) => {
				if (!this.shapeRefs[node.name]) {
					const settings = ShapeSettings.getShapeSettings(node.taskType, node);
					this.shapeRefs[node.name] = React.createRef();
					this.shapeRefs["thumb_" + node.name] = React.createRef();
					this.shapeRefs["thumbstart_" + node.name] = React.createRef();

					if (settings.events) {
						settings.events.map((event ,eventIndex) => {
							this.shapeRefs["thumbstartevent_" + node.name + eventIndex] = React.createRef();
						});
					} 
				}
			});
		}

		if (nextProps.flow != this.props.flow ||
			nextProps.storeFlow != this.props.storeFlow ||
			nextProps.storeFlowNode != this.props.storeFlowNode ||
			nextProps.addFlowNode != this.props.addFlowNode ||
			nextProps.selectNode != this.props.selectNode ||
			nextProps.addConnection != this.props.addFlowNode ||
			nextProps.deleteConnection != this.props.deleteConnection ||
			nextProps.deleteNode != this.props.deleteNode ||
			nextProps.selectedNode != this.props.selectedNode ||			
			nextProps.canvasMode != this.props.canvasMode ||
			nextProps.canvasToolbarsubject != this.props.canvasToolbarsubject ||
			nextState.stageWidth != this.state.stageWidth ||
			nextState.stageHeight != this.state.stageHeight ||
			nextState.canvasOpacity != this.state.canvasOpacity ||
			nextState.canvasKey != this.state.canvasKey ||
			nextState.showNodeSettings != this.state.showNodeSettings ||
			nextState.editNode != this.state.editNode ||
			nextState.editNodeSettings != this.state.editNodeSettings ||
			nextState.isConnectingNodesByDragging != this.state.isConnectingNodesByDragging ||
			nextProps.nodesTouched != this.props.nodesTouched ||
			nextProps.nodeState != this.props.nodeState ||
			nextState.connectionX != this.state.connectionX ||
			nextState.connectionY != this.state.connectionY||
			nextState.updateNodeTouchedState != this.state.updateNodeTouchedState) {
				return true;
			}
		return false;
	}

	componentDidUpdate(prevProps : CanvasProps, prevState: CanvasState) {

		if (prevProps.flow != this.props.flow) {
			this.nodeStateStore = {};
			if (this.flowIsLoading) {
				this.flowIsLoading = false;
//				this.shapeRefs = [];
				/*if (this.shapeRefs[this.connectionForDraggingName]) {
					this.shapeRefs[this.connectionForDraggingName] = React.createRef();
				}

				this.props.flow.map((node, index) => {
					if (!this.shapeRefs[node.name]) {
						const settings = ShapeSettings.getShapeSettings(node.taskType, node);

						this.shapeRefs[node.name] = React.createRef();
						this.shapeRefs["thumb_" + node.name] = React.createRef();
						this.shapeRefs["thumbstart_" + node.name] = React.createRef();

						if (settings.events) {
							settings.events.map((event ,eventIndex) => {
								this.shapeRefs["thumbstartevent_" + node.name + eventIndex] = React.createRef();
							});
						} 
					}
				});
				*/
				this.fitStage();

				if (this.stage && this.stage.current) {
					let stageDiv = (this.stage.current as any);
					if (stageDiv && stageDiv.attrs["container"]) {
						// trick to allow keyboard events on parent without
						// needing to click the div first
						stageDiv.attrs["container"].parentNode.focus();				
					}
				}

				this.setHtmlElementsPositionAndScale(this.stageX, this.stageY, this.stageScale);
				this.recalculateStartEndpoints();
				
			} else {
				//this.shapeRefs = [];

				//this.shapeRefs[this.connectionForDraggingName] = React.createRef();

				/*this.props.flow.map((node, index) => {
					if (!this.shapeRefs[node.name]) {
						const settings = ShapeSettings.getShapeSettings(node.taskType, node);

						this.shapeRefs[node.name] = React.createRef();
						this.shapeRefs["thumb_" + node.name] = React.createRef();
						this.shapeRefs["thumbstart_" + node.name] = React.createRef();

						if (settings.events) {
							settings.events.map((event ,eventIndex) => {
								this.shapeRefs["thumbstartevent_" + node.name + eventIndex] = React.createRef();
							});
						} 
					}
				});
				*/

				this.setHtmlElementsPositionAndScale(this.stageX, this.stageY, this.stageScale);
				this.recalculateStartEndpoints();

			}
			this.props.setNodesTouched(this.touchedNodes);
			
			let disabledUpdateTouchedState = false;
			this.props.flow.map((node, index) => {
				if (node.taskType === "TimerTask" || 
					(node.taskType == "DebugTask" && 
						node.visualizer == "animatedgridcanvas")) {
					disabledUpdateTouchedState = true;
				}
			});

			if (!!disabledUpdateTouchedState) {
				this.setState({updateNodeTouchedState : false});
			} else {
				this.setState({updateNodeTouchedState : true});
			}			
		}	

		if (prevState.canvasKey !== this.state.canvasKey) {
			this.updateDimensions();			

			if (this.canvasWrapper && this.canvasWrapper.current) {
				(this.canvasWrapper.current).removeEventListener('wheel', this.wheelEvent);
				(this.canvasWrapper.current as any).addEventListener('wheel', this.wheelEvent);
			}			
		}
		this.updateTouchedNodes();	

	}

	unmounted = false;
	componentWillUnmount() {
		this.unmounted = true;

		this.props.flowrunnerConnector.unregisterNodeStateObserver("canvas");

		document.removeEventListener('paste', this.onPaste);

		window.removeEventListener("resize", this.updateDimensions);
		//(this.refs.canvasWrapper as any).removeEventListener('wheel', this.wheelEvent);
		if (this.canvasWrapper && this.canvasWrapper.current) {
			(this.canvasWrapper.current).removeEventListener('wheel', this.wheelEvent);
		}

	}

	setNewPositionForNode = (node, group, position? : any, isCommitingToStore? : boolean, linesOnly? : boolean) => {
		const selectedNodeOpacity = 0.15;

		if (!linesOnly) {
			this.props.flow.map((flowNode) => {
				if (flowNode.name !== node.name) {
					if (this.shapeRefs[flowNode.name] && 
						this.shapeRefs[flowNode.name].current) {
						const shape = this.shapeRefs[flowNode.name].current;
						if (shape) {
							shape.opacity(selectedNodeOpacity);					
						}				
					}
					const element = document.getElementById(flowNode.name);
					if (element) {
						element.style.opacity = "0.5";
					} 
				}
			});
		}

		const x = group.attrs["x"];
		const y = group.attrs["y"];
		let newPosition = position || {x:x, y:y};

		if (newPosition && !linesOnly) {
			if (this.stage && this.stage.current) {
				let stage = (this.stage.current as any).getStage();
				if (stage) {
					var touchPos = stage.getPointerPosition();
					const scaleFactor = (stage as any).scaleX();

					newPosition.x = ((touchPos.x - (stage).x()) / scaleFactor) - this.mouseStartX;
					newPosition.y = ((touchPos.y - (stage).y()) / scaleFactor) - this.mouseStartY;
						
					//let shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);							
				}
			}
			if (this.shapeRefs[node.name]) {
				if (this.shapeRefs[node.name].current) {
					let currentGroup = this.shapeRefs[node.name].current;
					currentGroup.x(newPosition.x);
					currentGroup.y(newPosition.y);
					currentGroup.opacity(1);
					

					const shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);	

					let currentGroupThumbs = this.shapeRefs["thumb_" + node.name].current;
					if (currentGroupThumbs) {

						const thumbPosition = FlowToCanvas.getThumbEndPosition(shapeType, newPosition);

						currentGroupThumbs.x(thumbPosition.x);
						currentGroupThumbs.y(thumbPosition.y);
						currentGroupThumbs.opacity(1);
					}

					currentGroupThumbs = this.shapeRefs["thumbstart_" + node.name].current;
					if (currentGroupThumbs) {

						const thumbPosition = FlowToCanvas.getThumbStartPosition(shapeType, newPosition, 0);

						currentGroupThumbs.x(thumbPosition.x);
						currentGroupThumbs.y(thumbPosition.y);
						currentGroupThumbs.opacity(1);
					}

					const settings = ShapeSettings.getShapeSettings(node.taskType, node);	
					currentGroup.children.map((childNode) => {
						const childType = childNode.getClassName();
						if (childType == "Rect" || childType == "Circle" || childType == "Ellipse" || childType=="RegularPolygon") {
							childNode.fill(settings.fillSelectedColor);
						}
					});
					const element = document.getElementById(node.name);
					if (element) {
						element.style.opacity = "1";
					} 
				}				
			} 
		}

		if (!!isCommitingToStore) {
			this.props.storeFlowNode(Object.assign({}, node, newPosition ), node.name);
		}
		this.setHtmlElementsPositionAndScale(this.stageX, this.stageY, this.stageScale, newPosition.x, newPosition.y, node);						

		const startLines = FlowToCanvas.getLinesForStartNodeFromCanvasFlow(this.props.flow, node);
		let lines = {};
		if (startLines) {			
			startLines.map((lineNode) => {				
				const newStartPosition =  FlowToCanvas.getStartPointForLine(node, newPosition, lineNode, this.props.getNodeInstance);
				let endNodes = this.props.flow.filter((node) => {
					return node.name == lineNode.endshapeid;
				})
				let endNode = endNodes[0];
				const newEndPosition =  FlowToCanvas.getEndPointForLine(endNode, {
					x: endNode.x,
					y: endNode.y
				}, node, this.props.getNodeInstance);

				const lineRef = this.shapeRefs[lineNode.name];
				if (lineRef && lineRef.current) {

					let controlPoints = calculateLineControlPoints(
						newStartPosition.x, newStartPosition.y, 
						newEndPosition.x, newEndPosition.y);

					lineRef.current.points([newStartPosition.x, newStartPosition.y,
						controlPoints.controlPointx1, controlPoints.controlPointy1,
						controlPoints.controlPointx2, controlPoints.controlPointy2,
						newEndPosition.x, newEndPosition.y]);
		
					lineRef.current.opacity(1);					
				}
				const endNodeRef = this.shapeRefs[lineNode.endshapeid];
				if (endNodeRef && endNodeRef.current) {
					endNodeRef.current.opacity(1);
				}
				if (!!isCommitingToStore) {
					this.props.storeFlowNode(Object.assign({}, lineNode, {
						xstart: newStartPosition.x, ystart: newStartPosition.y,
						xend: newEndPosition.x, yend: newEndPosition.y
					} ), lineNode.name);
				}
				//console.log("linenode start",endNodes.length, lineNode.name, newStartPosition, newEndPosition);
				lines[lineNode.name] = {x: newStartPosition.x, y: newStartPosition.y};
			})
		}

		const endLines = FlowToCanvas.getLinesForEndNodeFromCanvasFlow(this.props.flow, node);
		if (endLines) {
			
			endLines.map((lineNode) => {
				const newEndPosition =  FlowToCanvas.getEndPointForLine(node, newPosition, lineNode, this.props.getNodeInstance);
				let startPos = {
					x : lineNode.xstart,
					y : lineNode.ystart
				};

				let startNodes = this.props.flow.filter((node) => {
					return node.name == lineNode.startshapeid;
				})
				let startNode = startNodes[0];
				let newStartPosition =  FlowToCanvas.getStartPointForLine(startNode, {
					x: startNode.x,
					y: startNode.y
				}, lineNode, this.props.getNodeInstance);

				if (lines[lineNode.name]) {
					newStartPosition = lines[lineNode.name];					
				}
				//console.log("linenode end",startNodes.length, lineNode.name, newStartPosition, newEndPosition);

				const lineRef = this.shapeRefs[lineNode.name];
				if (lineRef && lineRef.current) {

					let controlPoints = calculateLineControlPoints(
						newStartPosition.x, newStartPosition.y, 
						newEndPosition.x, newEndPosition.y);

					lineRef.current.points([newStartPosition.x, newStartPosition.y,
						controlPoints.controlPointx1, controlPoints.controlPointy1,
						controlPoints.controlPointx2, controlPoints.controlPointy2,
						newEndPosition.x, newEndPosition.y]);
//lineRef.current.stroke("#ff0000");
//lineRef.current.draw();
					lineRef.current.opacity(1);
				}

				const startNodeRef = this.shapeRefs[lineNode.startshapeid];
				if (startNodeRef && startNodeRef.current) {
					startNodeRef.current.opacity(1);
				}

				if (!!isCommitingToStore) {
					this.props.storeFlowNode(Object.assign({}, lineNode, startPos, {
						xstart: newStartPosition.x, ystart: newStartPosition.y,
						xend: newEndPosition.x, yend: newEndPosition.y
					} ), lineNode.name);
				}
			})
		}

		
		let stage = (this.stage.current as any).getStage();
		stage.batchDraw();
		this.updateTouchedNodes();

		if (!!isCommitingToStore) {
			this.props.selectNode(node.name, node);
			this.props.setConnectiongNodeCanvasMode(false);
		}
	}

	onShowNodeSettings(node, settings, event) {
		event.preventDefault();
		this.setState({showNodeSettings : true,
			editNode: node,
			editNodeSettings: settings
		});
		return false;
	}

	onCloseEditNodeSettings= () => {
		this.setState({showNodeSettings : false,
			editNode: undefined,
			editNodeSettings: undefined
		});
	}

	downloadURI(uri, name) {
		let link = document.createElement('a');
		link.download = name;
		link.href = uri;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);			
	}

	export = () => {	
		if (this.stage && this.stage.current) {
			let stage = (this.stage.current as any).getStage();
			var dataURL = stage.toDataURL({ pixelRatio: 3 });
			this.downloadURI(dataURL, 'flow.png');
		}
	}

	onClickSetup(node,settings,event) {
		if (node.notSelectable) {
			return false;
		}
		event.evt.preventDefault();
		this.setState({
			showNodeSettings : true,
			editNode: node,
			editNodeSettings: settings
		});
		return false;
	}

	onMouseOver(node, event) {
		if (node.notSelectable) {
			return false;
		}
        document.body.style.cursor = 'pointer';
	}
	
	onMouseOut() {
        document.body.style.cursor = 'default';
	}

	dragTime : any = undefined;

	touching : boolean = false;
	touchNode : any = undefined;
	touchNodeGroup : any = undefined;
	isConnectingNodesByDragging : boolean = false;

	mouseStartX : number = 0;
	mouseStartY : number = 0;

	determineStartPosition(group) {
		const x = group.attrs["x"];
		const y = group.attrs["y"];
		let newPosition = {x:x, y:y};
		
		if (this.stage && this.stage.current) {
			let stage = (this.stage.current as any).getStage();
			if (stage) {
				var touchPos = stage.getPointerPosition();
				const scaleFactor = (stage as any).scaleX();

				newPosition.x = ((touchPos.x - (stage).x()) / scaleFactor);
				newPosition.y = ((touchPos.y - (stage).y()) / scaleFactor);
					
				this.mouseStartX = newPosition.x - x;
				this.mouseStartY = newPosition.y - y;
			}
		}
	}	

	onMouseStart(node, event) {
		if (!!this.props.canvasMode.isConnectingNodes) {
			this.cancelDragStage();
			return false;
		}

		if (this.isConnectingNodesByDragging) {
			this.cancelDragStage();
			return false;
		}

		event.evt.preventDefault();
		event.evt.cancelBubble = true;		

		this.touching = true;
		this.touchNode = node;
		this.touchNodeGroup = event.currentTarget;
		if (event.currentTarget) {
			this.determineStartPosition(event.currentTarget);
		}

		return false;

	}

	mouseDragging : boolean = false;

	onMouseMove(node, event) {
		if (node && this.touching && this.touchNode && node.name !== this.touchNode.name) {
			return;
		}

		if (this.isConnectingNodesByDragging) {
			return;
		}

		event.evt.preventDefault();
		event.evt.cancelBubble = true;	

		if (!!this.props.canvasMode.isConnectingNodes) {
			this.cancelDragStage();
			return false;
		}

		if (this.touching) {
			if (event.currentTarget) {
				this.mouseDragging = true;
				// this.shapeRefs[nodeName]
				document.body.classList.add("mouse--moving");
				this.setNewPositionForNode(node, event.currentTarget, event.evt.screenX ? {
					x: event.evt.screenX,
					y: event.evt.screenY
				} : undefined, false, false);
			}
		}
		
		return false;
	}

	connectConnectionToNode = (node) => {
		let eventHelper : any = undefined;
		if (this.connectionNodeEventName !== undefined &&
			this.connectionNodeEventName !== "" && 
			!isNaN(this.connectionNodeEvent as number)) {
			eventHelper = {};
			eventHelper.event = this.connectionNodeEventName;
		}

//console.log("connectConnectionToNode", eventHelper, this.connectionNodeEventName, this.connectionNodeEvent, isNaN(this.connectionNodeEvent as number));

		const connection = getNewConnection(this.touchNode, node, this.props.getNodeInstance, eventHelper);
		if (!this.shapeRefs[connection.name]) {
			this.shapeRefs[connection.name] = React.createRef();
		}
		if (this.connectionNodeEventName !== "" && 
			!isNaN(this.connectionNodeEvent as number)) {
			(connection as any).event = this.connectionNodeEventName; // this is an object not a string!!
			console.log("this.connectionNodeEventName is object or string?", this.connectionNodeEventName);
		}
		this.touching = false
		this.isConnectingNodesByDragging = false;
		this.connectionNodeEvent = false;
		this.connectionNodeEventName = "";
		this.touchNode = undefined;
		this.touchNodeGroup = undefined;

		const lineRef = this.shapeRefs[this.connectionForDraggingName];
		if (lineRef && lineRef.current) {
			lineRef.current.opacity(0);				
		}

		if (this.stage && this.stage.current) {
			let stage = (this.stage.current as any).getStage();
			if (stage) {
				stage.batchDraw();
			}
		}

		document.body.classList.remove("connecting-nodes");
		this.mouseDragging = false;

		this.props.addConnection(connection);
		this.props.setConnectiongNodeCanvasMode(false);
	}

	onMouseEnd(node, event) {
		if (this.isConnectingNodesByDragging && this.touchNode && node) {			
			this.connectConnectionToNode(node);
			return false;
		}
		document.body.classList.remove("mouse--moving");

		event.evt.preventDefault();
		event.evt.cancelBubble = true;
	
		if (this.touchNodeGroup != event.currentTarget) {
			return false;
		}
		if (!!this.props.canvasMode.isConnectingNodes) {
			return false;
		}

		this.touching = false;
		this.dragTime = undefined;
		this.touchNode = undefined;
		this.touchNodeGroup = undefined;
		if (event.currentTarget && this.mouseDragging) {
			this.setNewPositionForNode(node, event.currentTarget, undefined, true, false);
		}
		this.mouseDragging = false;
		return false;
	}

	onStageMouseEnd(event) {

		if (this.touching || this.isConnectingNodesByDragging) {
			this.cancelDragStage();
			if (this.stage && this.stage.current) {
				let stage = (this.stage.current as any).getStage();

				this.dragTime = undefined;
				this.touching = false;
				event.evt.preventDefault();
				event.evt.cancelBubble = true;
				this.touchNode = undefined;
				this.touchNodeGroup = undefined;
				this.isConnectingNodesByDragging = false;
				this.connectionNodeEvent = false;
				this.connectionNodeEventName = "";

				document.body.classList.remove("connecting-nodes");
				document.body.classList.remove("mouse--moving");

				const lineRef = this.shapeRefs[this.connectionForDraggingName];
				if (lineRef && lineRef.current) {
					lineRef.current.opacity(0);				
				}
		
				if (stage) {
					stage.batchDraw();
				}
			}
			return false;
		}

	}

	onStageMouseLeave(event) {
		console.log("onStageMouseLeave");
		event.evt.preventDefault();
		event.evt.cancelBubble = true;
		
		const lineRef = this.shapeRefs[this.connectionForDraggingName];
		if (lineRef && lineRef.current) {
			lineRef.current.opacity(0);
			if (this.stage && this.stage.current) {
				let stage = (this.stage.current as any).getStage();
				if (stage !== undefined) {
					stage.batchDraw();
				}
			}
		}
		this.isConnectingNodesByDragging = false;
		this.connectionNodeEvent = false;
		this.connectionNodeEventName = "";
		document.body.classList.remove("connecting-nodes");
		document.body.classList.remove("mouse--moving");
		this.touching = false;
		this.dragTime = undefined;
		this.touchNode = undefined;
		this.touchNodeGroup = undefined;
	
		return false;
	}

	onMouseLeave(node, event) {
		return;
		(this.canvasWrapper.current).classList.remove("mouse--moving");

		event.evt.preventDefault();
		event.evt.cancelBubble = true;
		
		if (this.touchNodeGroup != event.currentTarget) {
			return false;
		}
		if (!!this.props.canvasMode.isConnectingNodes) {
			return false;
		}

		this.touching = false;
		this.dragTime = undefined;
		this.touchNode = undefined;
		this.touchNodeGroup = undefined;
		return false;
	}

	isPinching : boolean = false;
	startDistance : number = 0;
	onStageTouchStart(event) {
		if (!!this.props.canvasMode.isConnectingNodes) {
			this.cancelDragStage();
			return false;
		}
		if (this.touchNode && this.touchNodeGroup) {
			this.cancelDragStage();
		} else {
			if (event.evt.touches.length > 1) {
				this.isPinching = true;

				if (event.evt.touches.length == 2) {

					const x = event.evt.touches[0].screenX - event.evt.touches[1].screenX;
					const y = event.evt.touches[0].screenY - event.evt.touches[1].screenY;

					this.startDistance = Math.sqrt( x*x + y*y );
				}
			}
		}
	}
	onStageTouchMove(event) {
		if (this.isConnectingNodesByDragging) {
			//event.evt.preventDefault();
			event.evt.cancelBubble = true;
			//this.cancelDragStage();

			if (this.stage && this.stage.current) {
				let stage = (this.stage.current as any).getStage();
				if (stage) {
					var touchPos = stage.getPointerPosition();
					const scaleFactor = (stage as any).scaleX();
	
					let newPosition = {
						x: 0,
						y: 0
					};
					newPosition.x = ((touchPos.x - (stage).x()) / scaleFactor);
					newPosition.y = ((touchPos.y - (stage).y()) / scaleFactor);
					
					const lineRef = this.shapeRefs[this.connectionForDraggingName];
					if (lineRef && lineRef.current) {
	
						let controlPoints = calculateLineControlPoints(
							this.connectionXStart, this.connectionYStart, 
							newPosition.x, newPosition.y);
	
						lineRef.current.points([this.connectionXStart, this.connectionYStart,
							controlPoints.controlPointx1, controlPoints.controlPointy1,
							controlPoints.controlPointx2, controlPoints.controlPointy2,
							newPosition.x, newPosition.y]);
	
						lineRef.current.opacity(1);
						stage.batchDraw();
					}
				}
			}
			return;
		}

		if (!!this.props.canvasMode.isConnectingNodes) {
			this.cancelDragStage();
			return false;
		}

		if (this.touchNode && this.touchNodeGroup) {			
			event.evt.preventDefault();
			event.evt.cancelBubble = true;
			this.setNewPositionForNode(this.touchNode, this.touchNodeGroup, false, false);
			this.cancelDragStage();
			return false;
		} else {
			if (event.evt.touches && event.evt.touches.length > 1) {
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
					this.wheelEvent(
						{
							deltaY: newDistance - this.startDistance,
							toElement: undefined
						}
					)
				}

				
				return false;
			}
		}
	}

	onStageTouchEnd(event) {
		this.isPinching = false;
	}

	cancelDragStage() {
		if (this.stage && this.stage.current) {
			let stage = (this.stage.current as any).getStage();
			if (stage) {
				stage.stopDrag();
			}
		}
	}

	onTouchStart(node, event) {

		if (this.isPinching) {
			return;			
		}
		if (!!this.props.canvasMode.isConnectingNodes) {			
			return false;
		}
		if (this.isConnectingNodesByDragging) {
			return false;
		}

		this.touching = true;
		event.evt.preventDefault();
		event.evt.cancelBubble = true;
		
		this.touchNode = node;
		this.touchNodeGroup = event.currentTarget;

		this.cancelDragStage();	
		
		if (event.currentTarget) {
			this.determineStartPosition(event.currentTarget);
		}

		return false;
	}

	onTouchMove(node, event) {
		if (!!this.props.canvasMode.isConnectingNodes) {			
			return false;
		}

		if (this.isConnectingNodesByDragging) {
			return false;
		}
		
		if (this.isPinching) {
			return;			
		}

		if (this.touchNodeGroup != event.currentTarget) {
			return false;
		}

		this.touching = true;
		event.evt.preventDefault();
		event.evt.cancelBubble = true;
		if (event.currentTarget) {
			this.setNewPositionForNode(node, event.currentTarget, event.evt.touches.length > 0 ? {
				x: event.evt.touches[0].screenX,
				y: event.evt.touches[0].screenY
			} : undefined, false, false);
		}
		return false;
	}

	onTouchEnd(node, event) {

		if (this.isPinching) {
			return;			
		}
		
		if (!!this.props.canvasMode.isConnectingNodes) {			
			return false;
		}

		if (this.isConnectingNodesByDragging) {
			return false;
		}
		
		if (this.touchNodeGroup != event.currentTarget) {
			return false;
		}

		this.touching = false;
		this.dragTime = undefined;
		this.touchNode = undefined;
		this.touchNodeGroup = undefined;

		event.evt.preventDefault();
		event.evt.cancelBubble = true;
		
		if (event.currentTarget) {
			this.setNewPositionForNode(node, event.currentTarget, event.evt.changedTouches.length > 0 ? {
				x: event.evt.changedTouches[0].screenX,
				y: event.evt.changedTouches[0].screenY
			} : undefined, false, false);
		}
		return false;
	}

	onMouseConnectionStartOver(node, nodeEvent, event) {
		if (node.notSelectable) {
			return false;
		}
		document.body.style.cursor = 'pointer';		
	}
	onMouseConnectionStartOut(node, nodeEvent, event) {
		document.body.style.cursor = 'default';
	}

	connectionXStart : number = 0;
	connectionYStart : number = 0;
	connectionNodeEvent : number|boolean = false;
	connectionNodeEventName : string = "";

	onMouseConnectionStartStart(node, nodeEvent, nodeEventName, event) {
		if (this.isConnectingNodesByDragging) {
			return false;
		}
		if (!!this.props.canvasMode.isConnectingNodes) {
			return false;
		}
		if (node && this.touching && this.touchNode) {
			return;
		}
		this.isConnectingNodesByDragging = true;
		this.connectionNodeEvent = nodeEvent;
		this.connectionNodeEventName = nodeEventName;

		document.body.classList.add("connecting-nodes");

		this.touchNode = node;
		this.touchNodeGroup = event.currentTarget;

		const x = this.touchNodeGroup.attrs["x"];
		const y = this.touchNodeGroup.attrs["y"];

		let newPosition = {
			x: 0,
			y: 0
		};

		if (this.stage && this.stage.current) {
			let stage = (this.stage.current as any).getStage();
			if (stage) {
				var touchPos = stage.getPointerPosition();
				const scaleFactor = (stage as any).scaleX();

				newPosition.x = ((touchPos.x - (stage).x()) / scaleFactor);
				newPosition.y = ((touchPos.y - (stage).y()) / scaleFactor);
				this.connectionXStart = newPosition.x;
				this.connectionYStart = newPosition.y;				
			}
		}		
	}

	onMouseConnectionStartMove(node, nodeEvent, event) {
		if (!!this.props.canvasMode.isConnectingNodes) {
			return false;
		}
		if (node && this.touching && this.touchNode) {
			return;
		}
		
		event.evt.cancelBubble = true;		
	}

	onMouseConnectionStartEnd(node, nodeEvent, event) {
		if (!!this.props.canvasMode.isConnectingNodes) {
			return false;
		}
		if (node && this.touching && this.touchNode) {
			return;
		}
	}

	onMouseConnectionEndOver(node, nodeEvent, event) {
		if (node.notSelectable) {
			return false;
		}
		document.body.style.cursor = 'pointer';	
	}
	onMouseConnectionEndOut(node, nodeEvent, event) {
		document.body.style.cursor = 'default';
	}
	onMouseConnectionEndStart(node, nodeEvent, event) {
		if (!!this.props.canvasMode.isConnectingNodes) {
			return false;
		}
		if (node && this.touching && this.touchNode && !this.isConnectingNodesByDragging) {
			return;
		}
	}
	onMouseConnectionEndMove(node, nodeEvent, event) {
		if (!!this.props.canvasMode.isConnectingNodes) {
			return false;
		}
		if (node && this.touching && this.touchNode && !this.isConnectingNodesByDragging) {
			return;
		}
	}
	onMouseConnectionEndEnd(node, nodeEvent,event) {
		if (!!this.props.canvasMode.isConnectingNodes) {
			return false;
		}
		if (node && this.touching && this.touchNode && !this.isConnectingNodesByDragging) {
			return;
		}
		if (this.isConnectingNodesByDragging && this.touchNode && node) {
			this.connectConnectionToNode(node);
		}
	}

	onMouseConnectionEndLeave(node,nodeEvent, event) {
		//
	}

	draggingWhileTouching : boolean = false;
	onDragStart(node, event) {
		if (this.touching) {
			this.draggingWhileTouching = true;
			if (event.evt && event.evt.cancelBubble) {
				event.evt.cancelBubble = true;
			}
			if (event && event.cancelBubble) {
				event.cancelBubble = true;
			}
			return false;
		}
	}

	onDragMove(node, event) {
		if (this.touching) {
			this.draggingWhileTouching = true;
			return false;
		}
		this.setNewPositionForNode(node, event.currentTarget, false, false);		
	}

	onDragEnd(node, event) {
		if (this.touching || this.draggingWhileTouching) {
			this.draggingWhileTouching = false;
			return false;
		}

		this.dragTime = undefined;
		this.setNewPositionForNode(node, event.currentTarget);

		// event.currentTarget points to the "Group" in the actual shape component
		// the Group is the draggable part of the shape component
		// it has a property "attrs" which contains properties x,y,data-id etc
		// so... no need for refs here probably

		// node is the reference to the node from the flow

	}

	onClickShape(node, event) {
		event.cancelBubble = true;
		event.evt.preventDefault();
		this.cancelDragStage();

		if (this.isConnectingNodesByDragging && this.touchNode && node) {
			this.connectConnectionToNode(node);
			return false;
		}

		if ((!!this.props.canvasMode.isConnectingNodes || !!this.shiftDown) && 
			this.props.selectedNode !== undefined &&
			this.props.selectedNode.node !== undefined &&
			this.props.selectedNode.shapeType !== "Line") {

			const connection = getNewConnection(this.props.selectedNode.node, node, this.props.getNodeInstance);
			if (!this.shapeRefs[connection.name]) {
				this.shapeRefs[connection.name] = React.createRef();
			}
			this.props.addConnection(connection);
			this.props.setConnectiongNodeCanvasMode(false);
		}

		this.props.selectNode(node.name, node);
		this.props.setConnectiongNodeCanvasMode(false);

		return false;		
	}

	onClickLine(node, event) {
		event.cancelBubble = true;
		event.evt.preventDefault();
		this.cancelDragStage();
		if (node.notSelectable) {
			return false;
		}
		this.props.setConnectiongNodeCanvasMode(false);
		this.props.selectNode(node.name, node);

		return false;
	}

	onDragStageMove = (event) => {

		if (this.isPinching) {
			return;			
		}

		if (!!this.props.canvasMode.isConnectingNodes) {			
			return false;
		}


		if (this.touching || this.draggingWhileTouching) {
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
		
		if (this.stage && this.stage.current) {
			let stage = (this.stage.current as any).getStage();
			if (stage) {
				this.stageX = stage.x();
				this.stageY = stage.y();
				this.stageScale = stage.scale().x;

				this.setHtmlElementsPositionAndScale(this.stageX, this.stageY, this.stageScale);						
			}
		}
	}

	onDragStageEnd = (event) => {

		if (this.isPinching) {
			return;			
		}

		if (!!this.props.canvasMode.isConnectingNodes) {			
			return false;
		}

		if (event.evt && event.evt.cancelBubble) {
			event.evt.cancelBubble = true;
		}
		if (event && event.cancelBubble) {
			event.cancelBubble = true;
		}

		if (this.touching || this.draggingWhileTouching) {
			return false;
		}

		if (this.stage && this.stage.current) {
			let stage = (this.stage.current as any).getStage();
			if (stage) {
				this.saveEditorState(stage.scale().x, stage.x(), stage.y())
				this.stageX = stage.x();
				this.stageY = stage.y();
				this.stageScale = stage.scale().x;

				this.setHtmlElementsPositionAndScale(this.stageX, this.stageY, this.stageScale);
			}
		}
	}

	loadEditorState = () => {
		fetch('/get-editor-state', {
			method: "GET",
			headers: {
			  "Content-Type": "application/json"
			}
		  })
		.then(res => {
			if (res.status >= 400) {
				throw new Error("Bad response from server get-editor-state");
			}
			return res.json();
		})
		.then(editorState => {
			if (!editorState.reset && editorState && editorState.x && editorState.y && editorState.scale) {
				if (this.stage && this.stage.current) {
					let stage = (this.stage.current as any).getStage();
					if (stage) {

						const newPos = {
							x: editorState.x,
							y: editorState.y
						};
						stage.scale({ x: editorState.scale, y: editorState.scale });
						stage.position(newPos);
						stage.batchDraw();

						this.stageX = newPos.x;
						this.stageY = newPos.y;
						this.stageScale = editorState.scale;

						this.setHtmlElementsPositionAndScale(editorState.x, editorState.y, editorState.scale);
						//this.setState({canvasOpacity : 1});						
					}
				}
			} else {
				this.fitStage();
			}
		})
		.catch(err => {
			console.error(err);
		});
	}

	saveEditorState = (scale, x ,y) => {
		if (this.props.flowrunnerConnector.hasStorageProvider) {
			return;
		}
		return;
		fetch('/save-editor-state', {
			method: "POST",
			body: JSON.stringify({state:{
					scale: scale,
					x: x,
					y: y
				}
			}),
			headers: {
			  "Content-Type": "application/json"
			}
		  })
		.then(res => {
			if (res.status >= 400) {
				throw new Error("Bad response from server");
			}
			return res.json();
		})
		.then(status => {
			//console.log(status);
		})
		.catch(err => {
			console.error(err);
		});
	}

	setHtmlElementsPositionAndScale = (stageX, stageY, stageScale, newX? : number, newY?: number, node? : any, repositionSingleNode? : boolean) => {
		let nodeElements = document.querySelectorAll(".canvas__html-shape");
		const elements = Array.from(nodeElements);
		for (var element of elements) {
			let x = parseFloat(element.getAttribute("data-x") || "");
			let y = parseFloat(element.getAttribute("data-y") || "");
			let top = 0;
			let minHeight = parseFloat(element.getAttribute("data-height") || "");

			const clientElementHeight = element.clientHeight;
			let diffHeight = clientElementHeight - minHeight;

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
			(element as any).style.transform = 						
				"translate(" + (stageX  + x * stageScale) + "px," + 
					(stageY + top + y * stageScale) + "px) "+
				"scale(" + (stageScale) + "," + (stageScale) + ") ";						
		}
	}

	oldwheeltime = 0;
	wheelEvent(e) {

		if (e.toElement && e.toElement.closest) {
			// TODO : make this work on IE11 (do we need to support IE11??)
			let element = e.toElement.closest(".no-wheel");
			if (element) {
				return true;
			}
		}
		
		if (e.preventDefault) {
			e.preventDefault();
		}
		
		if (this.stage && this.stage.current) {
			let stage = (this.stage.current as any).getStage();
			//if (this.refs.stage !== undefined) {

			// workaround to get at least faster zooming with big flows
			// its not buttery smooth but it will have to do for now
			let scaleBy = 1.23;
			if (this.oldwheeltime == 0) {
				scaleBy = 1.03;
			} else {
				const timeDiff = performance.now() - this.oldwheeltime;
				if (timeDiff > 50) {
					scaleBy = 1.23;
				} else {
					scaleBy = 1.03 + (0.2 * timeDiff/50);
				} 
			}

			//let stage = (this.refs.stage as any).getStage();
			if (stage !== undefined && stage.getPointerPosition() !== undefined) {
				const oldScale = stage.scaleX();

				const mousePointTo = {
					x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
					y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
				};

				const newScale = e.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
				stage.scale({ x: newScale, y: newScale });
				const newPos = {
					x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
					y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
				};

				const newPosHtml = {
					x: -(mousePointTo.x - stage.getPointerPosition().x / newScale),
					y: -(mousePointTo.y - stage.getPointerPosition().y / newScale)
				};
				
				stage.position(newPos);
				stage.batchDraw();

				this.stageX = newPos.x;
				this.stageY = newPos.y;
				this.stageScale = newScale;

				this.setHtmlElementsPositionAndScale(newPos.x, newPos.y, newScale);

				
			}
			this.oldwheeltime = performance.now();
		}
		return false;
	}

	updateDimensions() {
				
		const stageContainerElement = document.querySelector(".stage-container");
		const bodyElement = document.querySelector("body");
		if (stageContainerElement !== null && bodyElement !== null) {
			let widthCanvas = stageContainerElement.clientWidth;
			let heightCanvas = bodyElement.clientHeight - 112;
			if (heightCanvas < 500) {
				heightCanvas = 500;
			}
			this.setState({stageWidth: widthCanvas, stageHeight: heightCanvas});
		}
	}

	fitStage = (node? : any) => {
		let xMin;
		let yMin;
		let xMax;
		let yMax;
		let containsHtmlShape = false;
		//let stage = (this.refs.stage as any).getStage();
		if (this.stage && this.stage.current) {
			let stage = (this.stage.current as any).getStage();
			if (stage !== undefined) {

				this.props.flow.map((shape, index) => {
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

							let width = undefined;
							let height = undefined;

							if (this.props.getNodeInstance) {
								const instance = this.props.getNodeInstance(shape, this.props.flowrunnerConnector, this.props.flow, taskSettings);
								if (instance) {
									if (instance.getWidth && instance.getHeight) {
										width = instance.getWidth(shape);
										height = instance.getHeight(shape);
									}
								}
							}
							// subWidth needed here ... html nodes start at x-width/2
							subtractWidth = (width || shape.width || 250) / 2;
							subtractHeight = (height || shape.height || 250) / 2
							addWidth = (width || shape.width || 250) / 2;
							addHeight = (height || shape.height || 250) /2;
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
			
				if (this.props.flow.length > 0 &&
					xMin !== undefined && yMin !== undefined && xMax !== undefined && yMax !== undefined) {
					let scale = 1;
					
					let flowWidth = Math.abs(xMax-xMin) ;//+ 200;
					let flowHeight = Math.abs(yMax-yMin) ;//+ 200;

					const stageContainerElement = document.querySelector(".canvas-controller__scroll-container");
					if (stageContainerElement !== null) {

						let realStageWidth = stageContainerElement.clientWidth;
						let realStageHeight = stageContainerElement.clientHeight;
						if (realStageHeight < 500) {
							realStageHeight = 500;
						}

						if (this.props.flow.length === 1) { 
							scale = 1;
						} else {
							if (flowWidth !== 0) { // && flowWidth > realStageWidth) {
								scale = realStageWidth / flowWidth;
							}											

							if (flowHeight * scale > realStageHeight) {							
								scale = realStageHeight / flowHeight;								
							} 	

							scale = scale * 0.85;						
						}

						if (node !== undefined) {
							if (containsHtmlShape) {
								scale = scale * 0.5;
							} else {
								scale = scale * 0.15;
							}
						} 

						stage.scale({ x: scale, y: scale });

						const newPos = {
							x: 0 ,
							y: 0 
						};											
						
						newPos.x = (-(xMin)*scale) + stage.getWidth()/2 - ((flowWidth*scale))/2 ;
						newPos.y = (-(yMin)*scale) + stage.getHeight()/2 - ((flowHeight*scale))/2 ;	
						 
						stage.position(newPos);
						stage.batchDraw();

						this.stageX = newPos.x;
						this.stageY = newPos.y;
						this.stageScale = scale;
						
						this.setHtmlElementsPositionAndScale(newPos.x, newPos.y, scale);
						this.setState({canvasOpacity : 1});	
					}
				} else {
					const newPos = {
						x: 0 ,
						y: 0 
					};
					let scale = 1;
					stage.position(newPos);
					stage.batchDraw();

					this.stageX = newPos.x;
					this.stageY = newPos.y;
					this.stageScale = scale;
					
					this.setHtmlElementsPositionAndScale(newPos.x, newPos.y, scale);
					this.setState({canvasOpacity : 1});	
				}
			}
		}
	}

	clickStage = (event) => {
		if (this.isConnectingNodesByDragging) {
			event.evt.preventDefault();
			this.isConnectingNodesByDragging = false;
			this.connectionNodeEvent = false;
			this.connectionNodeEventName = "";
			this.touchNode = undefined;
			this.touchNodeGroup = undefined;
			document.body.classList.remove("connecting-nodes");
			document.body.classList.remove("mouse--moving");

			const lineRef = this.shapeRefs[this.connectionForDraggingName];
			if (lineRef && lineRef.current) {
				lineRef.current.opacity(0);
				if (this.stage && this.stage.current) {
					let stage = (this.stage.current as any).getStage();
					if (stage !== undefined) {
						stage.batchDraw();
					}
				}
			}

			return false;
		}

		if (this.touchNode && this.touchNodeGroup) {
			event.evt.preventDefault();		
			return false;
		}

		const nodeIsSelected : boolean = !!this.props.selectedNode && !!this.props.selectedNode.node;	
					
		if (!nodeIsSelected && this.props.canvasMode.selectedTask !== undefined &&
			this.props.canvasMode.selectedTask !== "") {
			if (!this.props.canvasMode.isConnectingNodes) {
				if (this.stage && this.stage.current) {
					let stage = (this.stage.current as any).getStage();
					const position = (stage as any).getPointerPosition();
					const scaleFactor = (stage as any).scaleX();
					const taskType = this.props.canvasMode.selectedTask || "TraceConsoleTask";
					let presetValues = {};
					const shapeSetting = getTaskConfigForTask(taskType);
					if (shapeSetting && shapeSetting.presetValues) {
						presetValues = shapeSetting.presetValues;
					}

					let newNode = getNewNode({
						name: this.props.canvasMode.selectedTask,
						id: this.props.canvasMode.selectedTask,
						taskType: taskType,
						shapeType: this.props.canvasMode.selectedTask == "IfConditionTask" ? "Diamond" : "Rect", 
						x: ((position.x - (stage).x()) / scaleFactor), 
						y: ((position.y - (stage).y()) / scaleFactor),
						...presetValues
					},this.props.flow);

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
					 
					this.shapeRefs[newNode.name] = React.createRef();
					this.shapeRefs["thumb_" + newNode.name] = React.createRef();
					this.shapeRefs["thumbstart_" + newNode.name] = React.createRef();

					if (settings.events) {
						settings.events.map((event ,eventIndex) => {
							this.shapeRefs["thumbstartevent_" + newNode.name + eventIndex] = React.createRef();
						});
					} 
					this.props.addFlowNode(newNode, this.props.flow);
				}				
			}
		}
		// TODO : do we need to select the added node or dont? (see also the flow-actions)
		this.props.selectNode(undefined, undefined);

		this.props.setConnectiongNodeCanvasMode(false);
		this.props.setSelectedTask("");		
		
		return false;
	}

	getNodeByName = (nodeName) => {
		const nodes = this.props.flow.filter((node, index) => {
			return node.name === nodeName;
		});
		if (nodes.length > 0) {
			return nodes[0];
		}
		return null;
	}

	getNodeByVariableName = (nodeName) => {
		const nodes = this.props.flow.filter((node, index) => {
			return node.variableName === nodeName && node.taskType;// && node.taskType.indexOf("Type") >= 0;
		});
		if (nodes.length > 0) {
			return nodes[0];
		}
		return null;
	}

	getDependentConnections = () => {
		const nodeIsSelected : boolean = !!this.props.selectedNode && !!this.props.selectedNode.node;	

		try {
			let connections : any[] = [];
			this.props.flow.map((node, index) => {
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
							let isUseListFromNode = match.indexOf('"useListFromNode":') >= 0;
							isNodeByName = isNodeByName || isUseListFromNode;

							let nodeName = match.replace('"node":', "");
							nodeName = nodeName.replace('"variableName":', "");
							nodeName = nodeName.replace('"getVariable":', "");
							nodeName = nodeName.replace('"setVariable":', "");
							nodeName = nodeName.replace('"datasourceNode":', "");
							nodeName = nodeName.replace('"detailNode":', "");
							nodeName = nodeName.replace('"deleteNode":', "");
							nodeName = nodeName.replace('"useListFromNode":', "");
							
							nodeName = nodeName.replace(/\ /g,"");
							nodeName = nodeName.replace(/\"/g,"");
							let nodeEnd;
							let startToEnd : boolean = true;
							let isConnectionWithVariable = false;

							if (isNodeByName && !isGetVariable && !isSetVariable) {
								nodeEnd = this.getNodeByName(nodeName);
								if (nodeEnd && !!nodeEnd.hasVariableAttached) {
									isConnectionWithVariable = true;
								}

								if (nodeEnd && nodeEnd.variableName && node.getVariable) {
									nodeEnd = undefined;
								}								
							}							

							if (isGetVariable || isSetVariable) {
								nodeEnd = this.getNodeByVariableName(nodeName);

								if (nodeEnd) {
									isConnectionWithVariable = true;
								}

								if (isGetVariable) {
									startToEnd = false;
								}
							}
																					
							if (nodeEnd) {

								let startPosition = FlowToCanvas.getStartPointForLine(node, {x: node.x, y: node.y});
								let endPosition = FlowToCanvas.getEndPointForLine(nodeEnd, {x: nodeEnd.x, y: nodeEnd.y});

								if (!startToEnd) {
									startPosition = FlowToCanvas.getStartPointForLine(nodeEnd, {x: nodeEnd.x, y: nodeEnd.y});
									endPosition = FlowToCanvas.getEndPointForLine(node, {x: node.x, y: node.y});
	
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
									isConnectionWithVariable: isConnectionWithVariable
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


	onDropTask = (event) => {
		event.preventDefault();
		
		let taskClassName = event.dataTransfer.getData("data-task");
		//const taskClassName = event.target.getAttribute("data-task");
		let _stage = (this.stage.current as any).getStage();

		_stage.setPointersPositions(event);
	
		//let data = event.dataTransfer.getData("text");
		//event.target.appendChild(document.getElementById(data));

		const nodeIsSelected : boolean = !!this.props.selectedNode && !!this.props.selectedNode.node;	
		
		this.props.selectNode(undefined, undefined);
		this.props.setConnectiongNodeCanvasMode(false);
		
		if (taskClassName && taskClassName !== "") {
			if (!this.props.canvasMode.isConnectingNodes) {
				if (this.stage && this.stage.current) {
					let stage = (this.stage.current as any).getStage();
					const position = (stage as any).getPointerPosition();
					const scaleFactor = (stage as any).scaleX();
					const taskType = taskClassName;
					let presetValues = {};
					const shapeSetting = getTaskConfigForTask(taskType);
					if (shapeSetting && shapeSetting.presetValues) {
						presetValues = shapeSetting.presetValues;
					}

					
					let newNode = getNewNode({
						name: taskClassName,
						id: taskClassName,
						taskType: taskType,
						shapeType: taskClassName == "IfConditionTask" ? "Diamond" : "Rect", 
						x: (position.x - (stage).x()) / scaleFactor, 
						y: (position.y - (stage).y()) / scaleFactor,
						...presetValues
					},this.props.flow);

					const settings = ShapeSettings.getShapeSettings(newNode.taskType, newNode);

					this.shapeRefs[newNode.name] = React.createRef();
					this.shapeRefs["thumb_" + newNode.name] = React.createRef();
					this.shapeRefs["thumbstart_" + newNode.name] = React.createRef();

					if (settings.events) {
						settings.events.map((event ,eventIndex) => {
							this.shapeRefs["thumbstartevent_" + newNode.name + eventIndex] = React.createRef();
						});
					} 

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
					
					this.props.addFlowNode(newNode, this.props.flow);
				}				
			}
		} else {
			alert("select task!!");
		}

		return false;
	}
	onAllowDrop = (event) => {
		event.preventDefault();
		// onDragOver={this.onAllowDrop}
		// onDrop={this.onDropTask}
	}

	onPaste = async (event) => {
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

		if (this.touchNode && this.touchNodeGroup) {
			event.preventDefault()		
			return false;
		}

		const nodeIsSelected : boolean = !!this.props.selectedNode && !!this.props.selectedNode.node;				
		
		if (!nodeIsSelected) {
			if (!this.props.canvasMode.isConnectingNodes) {
				if (this.stage && this.stage.current) {
					let stage = (this.stage.current as any).getStage();
					const position = (stage as any).getPointerPosition();
					const scaleFactor = (stage as any).scaleX();
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
						x: ((position.x - (stage).x()) / scaleFactor), 
						y: ((position.y - (stage).y()) / scaleFactor),
						...presetValues,
						values,
						columns: columnCount,
						rows: rowCount
					}, this.props.flow);

					let shapeType = FlowToCanvas.getShapeType(newNode.shapeType, newNode.taskType, newNode.isStartEnd);							

					let centerXCorrection = 0;
					let centerYCorrection = 0;
					/*
					if (this.props.getNodeInstance) {
						const instance = this.props.getNodeInstance(node, this.props.flowrunnerConnector, this.props.nodes, this.props.flow);
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
					 
					this.props.addFlowNode(newNode, this.props.flow);
				}				
			}
		}

		// TODO : do we need to select the added node or dont? (see also the flow-actions)
		this.props.selectNode(undefined, undefined);

		this.props.setConnectiongNodeCanvasMode(false);
		this.props.setSelectedTask("");		


		return false;
	}

	shiftDown = false;
	ctrlDown = false;
	ctrlKey = 17;
	shiftKey = 16;
	cmdKey = 91;
	pasteKey = 86;
	backspaceKey = 8;
	fKeyCapt = 70;
	fKey = 102;

	onInput = (event) => {
		// prevent editing of div because of contentEditable which is needed for pasting data from excel
		if (event.target && (event.target.tagName || "").toLowerCase() == "input") {
			return;
		}
		if (event.target && event.target.attributes && event.target.attributes["role"]
				&& event.target.attributes["role"].value == "textbox") {
			return;
		}
		
		console.log("oninput", event);

		if (event.keyCode == this.fKey || event.keyCode == this.fKeyCapt) {
			if (this.props.selectedNode && this.props.selectedNode.node) {
				event.preventDefault();
				this.fitStage(this.props.selectedNode.node);
				return false;
			}
			return true;
		}

		if (event.keyCode == this.shiftKey) {
			this.shiftDown = true;
			return true;
		}
		if (event.keyCode == this.backspaceKey) {
			if (this.props.selectedNode && this.props.selectedNode.node) {
				if (this.props.selectedNode.node.shapeType !== 'Line') {
					this.props.deleteNode(this.props.selectedNode.node);
				} else {
					this.props.deleteConnection(this.props.selectedNode.node);
				}
				this.props.selectNode(undefined, undefined);
			}
			return true;
		}
		if (event.keyCode == this.ctrlKey || event.keyCode == this.cmdKey) {
			this.ctrlDown = true;
			return true;
		}

		if (!!this.ctrlDown && event.keyCode == this.pasteKey) {
			return true;			
		}

		
		//event.preventDefault();
		//return false;
	}

	onKeyUp = (event) => {
		this.ctrlDown = false;
		this.shiftDown = false;

	}

	/*
						{this.props.flow.map((node, index) => {
							let Shape = Shapes[node.shapeType];
							if (node.shapeType === "Line"  && Shape) {

								if (canvasHasSelectedNode &&  this.props.selectedNode &&  this.props.selectedNode.node) {
									if (node.startshapeid === this.props.selectedNode.node.name) {
										nodesConnectedToSelectedNode[node.endshapeid] = true;
									}
	
									if (node.endshapeid === this.props.selectedNode.node.name) {
										nodesConnectedToSelectedNode[node.startshapeid] = true;
									}								
								}

								return <Shape key={"node-"+index}
									ref={this.shapeRefs[node.name]}
									onMouseOver={this.onMouseOver.bind(this, node)}
									onMouseOut={this.onMouseOut.bind(this)}
									onClickLine={this.onClickLine.bind(this, node)}
									canvasHasSelectedNode={canvasHasSelectedNode}
									isSelected={this.props.selectedNode && this.props.selectedNode.name === node.name}
									isErrorColor={node.followflow === 'onfailure'}
									isSuccessColor={node.followflow === 'onsuccess'}
									xstart={node.xstart} 
									ystart={node.ystart}
									xend={node.xend} 
									yend={node.yend}
									isEventNode={node.event !== undefined && node.event !== ""}
									selectedNodeName={canvasHasSelectedNode ? this.props.selectedNode.node.name : ""}
									startNodeName={node.startshapeid}
									endNodeName={node.endshapeid}
									noMouseEvents={false}									
								></Shape>;
							} 
							return null;
						})}
	*/

	render() {
		const canvasHasSelectedNode : boolean = !!this.props.selectedNode && !!this.props.selectedNode.node;	

		const connections = this.props.canvasMode.showDependencies ? this.getDependentConnections() : [];
		let nodesConnectedToSelectedNode : any = {};

		/*onPaste={this.onPaste}	
		suppressContentEditableWarning={true}
				contentEditable={false}	
				*/
		return <>
			<div 
				key={"stage-layer-wrapper-" + this.state.canvasKey} ref={this.canvasWrapper} 
				style={{opacity: this.state.canvasOpacity}} 
				className="canvas-controller__scroll-container"
				onDragOver={this.onAllowDrop}
				onDrop={this.onDropTask}
				tabIndex={0} 
				onInput={this.onInput}
				onKeyDown={this.onInput}
				onKeyUp={this.onKeyUp}																	
				>
				<Stage					
					onClick={this.clickStage}					
					draggable={true}
					pixelRatio={1} 
					width={this.state.stageWidth}
					height={ this.state.stageHeight }
					ref={this.stage}
					onDragMove={this.onDragStageMove.bind(this)}
					onDragEnd={this.onDragStageEnd.bind(this)}
					onTouchStart={this.onStageTouchStart.bind(this)}
					onTouchMove={this.onStageTouchMove.bind(this)}
					onMouseMove={this.onStageTouchMove.bind(this)}
					onTouchEnd={this.onStageTouchEnd.bind(this)}
					onMouseLeave={this.onStageMouseLeave.bind(this)}
					onMouseUp={this.onStageMouseEnd.bind(this)}
					className="stage-container">
					<Layer key={"stage-layer-" + this.state.canvasKey} >
						<Rect x={0} y={0} width={1024} height={750}></Rect>
						{connections.length > 0 && connections.map((node, index) => {

							if (canvasHasSelectedNode &&  this.props.selectedNode &&  this.props.selectedNode.node) {
								if (node.startshapeid === this.props.selectedNode.node.name) {
									nodesConnectedToSelectedNode[node.endshapeid] = true;
								}

								if (node.endshapeid === this.props.selectedNode.node.name) {
									nodesConnectedToSelectedNode[node.startshapeid] = true;
								}								
							}
							return <Shapes.Line key={"cn-node-" + index}
									onMouseOver={this.onMouseOver.bind(this, node)}
									onMouseOut={this.onMouseOut.bind(this)}
									onClickLine={this.onClickLine.bind(this, node)}
									isSelected={false}
									isAltColor={true}									
									canvasHasSelectedNode={canvasHasSelectedNode}
									isConnectionWithVariable={node.isConnectionWithVariable}
									xstart={node.xstart} 
									ystart={node.ystart}									
									xend={node.xend} 
									yend={node.yend}
									selectedNodeName={canvasHasSelectedNode ? this.props.selectedNode.node.name : ""}
									startNodeName={node.startshapeid}
									endNodeName={node.endshapeid}
									noMouseEvents={true}	
									></Shapes.Line>})
						}


						{this.props.flow.map((node, index) => {
							let shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);							
							const settings = ShapeSettings.getShapeSettings(node.taskType, node);

							const Shape = Shapes[shapeType];
							if (node.shapeType !== "Line" && Shape) {

								let nodeState = "";

								if (this.props.nodeState[node.name]) {
									nodeState = this.props.nodeState[node.name];
								}

								let isConnectedToSelectedNode = this.props.selectedNode && nodesConnectedToSelectedNode[node.name] === true;
								if (this.props.selectedNode && 
									this.props.selectedNode.node && 
									this.props.selectedNode.node.shapeType === "Line") {

									if (this.props.selectedNode.node.startshapeid === node.name) {
										isConnectedToSelectedNode = true;
									}
	
									if (this.props.selectedNode.node.endshapeid === node.name) {
										isConnectedToSelectedNode = true;
									}								
								}
								/*
								onRef={(nodeName , ref) => {
										this.shapeRefs[nodeName] = ref;
										return true; 
									}}
								*/
								return <React.Fragment key={"node-fragment-" + index} ><Shape key={"node-"+index} 
									x={node.x} 
									y={node.y} 
									name={node.name}
									flow={this.props.flow}
									taskType={node.taskType}
									node={node}																	
									ref={this.shapeRefs[node.name]}
									shapeRefs={this.shapeRefs}
									canvasHasSelectedNode={canvasHasSelectedNode}
									
									nodeState={nodeState}
									selectedNode={this.props.selectedNode}
									onLineMouseOver={this.onMouseOver}
									onLineMouseOut={this.onMouseOut}
									onClickLine={this.onClickLine}

									canvasComponentInstance={this}

									onClickSetup={this.onClickSetup.bind(this, node, settings)}
									onMouseOver={this.onMouseOver.bind(this, node)}
									onMouseOut={this.onMouseOut.bind(this)}
									onDragStart={this.onDragStart.bind(this, node)}
									onDragEnd={this.onDragEnd.bind(this, node)}
									onDragMove={this.onDragMove.bind(this, node)}
									onTouchStart={this.onTouchStart.bind(this,node)}
									onTouchEnd={this.onTouchEnd.bind(this, node)}
									onTouchMove={this.onTouchMove.bind(this, node)}
									onClickShape={this.onClickShape.bind(this, node)}
									onMouseStart={this.onMouseStart.bind(this,node)}
									onMouseMove={this.onMouseMove.bind(this,node)}
									onMouseEnd={this.onMouseEnd.bind(this,node)}
									onMouseLeave={this.onMouseLeave.bind(this,node)}
									isSelected={this.props.selectedNode && this.props.selectedNode.name === node.name}
									isConnectedToSelectedNode={isConnectedToSelectedNode}
									getNodeInstance={this.props.getNodeInstance}
									touchedNodes={this.props.nodesTouched}
								></Shape>
								{(shapeType === "Rect" || shapeType === "Diamond" || shapeType === "Html") && <Thumbs
									key={"node-thumb-" + index} 
									position={FlowToCanvas.getThumbEndPosition(shapeType, node)}
									name={node.name}
									taskType={node.taskType}
									shapeType={shapeType}
									node={node}																	
									ref={this.shapeRefs["thumb_" + node.name]} 									
									isSelected={this.props.selectedNode && this.props.selectedNode.name === node.name}
									isConnectedToSelectedNode={isConnectedToSelectedNode}									
									canvasHasSelectedNode={canvasHasSelectedNode}

									onMouseConnectionEndOver={this.onMouseConnectionEndOver.bind(this,node,false)}
									onMouseConnectionEndOut={this.onMouseConnectionEndOut.bind(this,node,false)}
									onMouseConnectionEndStart={this.onMouseConnectionEndStart.bind(this,node,false)}
									onMouseConnectionEndMove={this.onMouseConnectionEndMove.bind(this,node,false)}
									onMouseConnectionEndEnd={this.onMouseConnectionEndEnd.bind(this,node,false)}
									onMouseConnectionEndLeave={this.onMouseConnectionEndLeave.bind(this,node,false)}
									getNodeInstance={this.props.getNodeInstance}
								></Thumbs>}
								{(shapeType === "Rect" || shapeType === "Diamond" || shapeType === "Html") && <ThumbsStart
									key={"node-thumbstart-" + index} 
									position={FlowToCanvas.getThumbStartPosition(shapeType, node, 0)}
									name={node.name}
									taskType={node.taskType}
									shapeType={shapeType}
									node={node}																	
									ref={this.shapeRefs["thumbstart_" + node.name]} 									
									isSelected={this.props.selectedNode && this.props.selectedNode.name === node.name}
									isConnectedToSelectedNode={isConnectedToSelectedNode}									
									canvasHasSelectedNode={canvasHasSelectedNode}
									
									onMouseConnectionStartOver={this.onMouseConnectionStartOver.bind(this,node,false)}
									onMouseConnectionStartOut={this.onMouseConnectionStartOut.bind(this,node,false)}
									onMouseConnectionStartStart={this.onMouseConnectionStartStart.bind(this,node,false,"")}
									onMouseConnectionStartMove={this.onMouseConnectionStartMove.bind(this,node,false)}
									onMouseConnectionStartEnd={this.onMouseConnectionStartEnd.bind(this,node,false)}

									getNodeInstance={this.props.getNodeInstance}										
								></ThumbsStart>}
								{(shapeType === "Rect" || shapeType === "Diamond" || shapeType === "Html") && settings.events && settings.events.map((event ,eventIndex) => {
									return <ThumbsStart
										key={"node-thumbstart-" + index + "-" + eventIndex} 
										position={FlowToCanvas.getThumbStartPosition(shapeType, node, eventIndex + 1)}
										name={node.name}
										taskType={node.taskType}
										shapeType={shapeType}
										node={node}																	
										ref={this.shapeRefs["thumbstartevent_" + node.name + eventIndex]} 									
										isSelected={this.props.selectedNode && this.props.selectedNode.name === node.name}
										isConnectedToSelectedNode={isConnectedToSelectedNode}									
										canvasHasSelectedNode={canvasHasSelectedNode}

										onMouseConnectionStartOver={this.onMouseConnectionStartOver.bind(this,node,eventIndex)}
										onMouseConnectionStartOut={this.onMouseConnectionStartOut.bind(this,node,eventIndex)}
										onMouseConnectionStartStart={this.onMouseConnectionStartStart.bind(this,node,eventIndex, event.eventName)}
										onMouseConnectionStartMove={this.onMouseConnectionStartMove.bind(this,node,eventIndex)}
										onMouseConnectionStartEnd={this.onMouseConnectionStartEnd.bind(this,node,eventIndex)}

										getNodeInstance={this.props.getNodeInstance}										
								></ThumbsStart>
								})}
								</React.Fragment>;
							}
							return null;
						})}
						<Shapes.Line 
							ref={this.shapeRefs[this.connectionForDraggingName]}
							onMouseOver={undefined}
							onMouseOut={undefined}
							onClickLine={undefined}
							isSelected={false}
							isAltColor={true}									
							canvasHasSelectedNode={canvasHasSelectedNode}
							isConnectionWithVariable={false}
							xstart={this.state.connectionX} 
							ystart={this.state.connectionY}									
							xend={this.state.connectionX} 
							yend={this.state.connectionY}
							selectedNodeName={""}
							startNodeName={""}
							endNodeName={""}
							opacity={0}	
							noMouseEvents={true}
						></Shapes.Line>
					</Layer>
				</Stage>
				<div ref={this.htmlWrapper} 
					className="canvas__html-elements">
					
					{this.props.flow.map((node, index) => {
							let shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);
							const settings = ShapeSettings.getShapeSettings(node.taskType, node);
							const Shape = Shapes[shapeType];
							if (shapeType === "Html" && Shape) {
								const nodeClone = {...node};
								let nodeState = "";

								if (this.props.nodeState[node.name]) {
									nodeState = " " + (this.props.nodeState[node.name] == "error" ? " has-error" : "")
								}
								const isSelected = this.props.selectedNode && this.props.selectedNode.name === node.name;
								nodeClone.htmlPlugin = node.htmlPlugin || (settings as any).htmlPlugin || "";
								
								let width = undefined;
								let height = undefined;

								if (this.props.getNodeInstance) {
									const instance = this.props.getNodeInstance(node, this.props.flowrunnerConnector, this.props.flow, settings);
									if (instance) {
										if (instance.getWidth && instance.getHeight) {
											width = instance.getWidth(node);
											height = instance.getHeight(node);
										}
									}
								}
								let top = (-(height || node.height || 250)/2);
								return <div key={"html" + index}
									style={{transform: "translate(" + (this.stageX  + node.x * this.stageScale) + "px," + 
											(this.stageY +  (node.y) * this.stageScale) + "px) " +
											"scale(" + (this.stageScale) + "," + (this.stageScale) + ") ",
											width: (width || node.width || 250)+"px",
											minHeight: (height || node.height || 250)+"px",
											height:(height || node.height || 250)+"px",
											left: (-(width || node.width || 250)/2)+"px",
											top: (top)+"px",
											opacity: (!canvasHasSelectedNode || (this.props.selectedNode && this.props.selectedNode.name === node.name)) ? 1 : 0.5 										 
										}}
									id={node.name}
									data-node={node.name}
									data-task={node.taskType}
									data-html-plugin={nodeClone.htmlPlugin}
									data-visualizer={node.visualizer || "default"}
									data-x={node.x} 
									data-y={node.y}
									data-top={top}
									data-height={(height || node.height || 250)}
									ref={this.htmlElement} 
									className={"canvas__html-shape canvas__html-shape-" + node.name + nodeState}>
										<div className={"canvas__html-shape-bar " + (isSelected ? "canvas__html-shape-bar--selected" :"")}>
											<span className="canvas__html-shape-bar-title">{settings.icon && <span className={"canvas__html-shape-title-icon fas " +  settings.icon}></span>}{node.label ? node.label : node.name}</span>									
											{!!settings.hasConfigMenu && <a href="#" onClick={this.onShowNodeSettings.bind(this, node, settings)} className="canvas__html-shape-bar-icon fas fa-cog"></a>}</div>
										<div className="canvas__html-shape-body">
										{this.props.renderHtmlNode && this.props.renderHtmlNode(nodeClone, this.props.flowrunnerConnector, this.props.flow, settings)}</div>
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
			{this.state.showNodeSettings && <EditNodeSettings node={this.state.editNode} settings={this.state.editNodeSettings} flowrunnerConnector={this.props.flowrunnerConnector} onClose={this.onCloseEditNodeSettings}></EditNodeSettings>}
			<Flow flow={this.props.flow} 
				flowrunnerConnector={this.props.flowrunnerConnector} />							
		</>;
	}
} 

export const Canvas = connect(mapStateToProps, mapDispatchToProps)(ContainedCanvas);