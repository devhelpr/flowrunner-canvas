import * as React from 'react';
import { Stage, Layer , Rect } from 'react-konva';
import { connect } from "react-redux";
import { Shapes } from './shapes'; 
import { storeFlow, storeFlowNode, addConnection, addFlowNode, addNode,deleteConnection, deleteNode } from '../../redux/actions/flow-actions';
import { selectNode } from '../../redux/actions/node-actions';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { ICanvasMode } from '../../redux/reducers/canvas-mode-reducers';
import { setConnectiongNodeCanvasMode , setConnectiongNodeCanvasModeFunction, setSelectedTask, setSelectedTaskFunction } from '../../redux/actions/canvas-mode-actions';
import { getTaskConfigForTask } from '../../config';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { ShapeSettings } from '../../helpers/shape-settings';
import { Observable, Subject } from '@reactivex/rxjs';
import { getNewNode, getNewConnection} from '../../helpers/flow-methods';
import { addRawFlow, addRawConnection, storeRawNode, deleteRawConnection, deleteRawNode } from '../../redux/actions/raw-flow-actions';
import { ShapeMeasures } from '../../helpers/shape-measures';
import * as uuid from 'uuid';

import fetch from 'cross-fetch';

const uuidV4 = uuid.v4;

export interface CanvasProps {
	nodes : any[];
	flow: any[];

	storeFlow : any;
	storeFlowNode: any;
	addFlowNode : any;
	addNode : any;
	addRawFlow: any;
	addRawConnection: any;
	selectNode: any;
	addConnection: any;
	storeRawNode: any;

	deleteConnection: any;
	deleteNode: any;
	deleteRawConnection: any;
	deleteRawNode: any;

	selectedNode : any;
	canvasMode: ICanvasMode;
	setConnectiongNodeCanvasMode: setConnectiongNodeCanvasModeFunction;
	setSelectedTask: setSelectedTaskFunction;
	canvasToolbarsubject : Subject<string>;
	
	renderHtmlNode?: (node: any, flowrunnerConnector : IFlowrunnerConnector, nodes: any, flow: any, taskSettings? : any) => any;
	flowrunnerConnector : IFlowrunnerConnector;
	getNodeInstance?: (node: any, flowrunnerConnector: IFlowrunnerConnector, nodes : any, flow: any, taskSettings? : any) => any;
	
}

const mapStateToProps = (state : any) => {
	return {
		flow: state.flow,
		selectedNode : state.selectedNode,
		canvasMode: state.canvasMode,
		nodes: state.rawFlow,
		
	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		addConnection: (connection: any) => dispatch(addConnection(connection)),
		storeFlow: (flow) => dispatch(storeFlow(flow)),
		storeFlowNode: (node, orgNodeName) => dispatch(storeFlowNode(node, orgNodeName)),
		addFlowNode: (node) => dispatch(addFlowNode(node)),
		addNode: (node, flow) => dispatch(addNode(node, flow)),
		addRawFlow: (node) => dispatch(addRawFlow(node)),
		addRawConnection: (node) => dispatch(addRawConnection(node)),
		storeRawNode: (node, orgNodeName) => dispatch(storeRawNode(node, orgNodeName)),
		selectNode: (name, node) => dispatch(selectNode(name, node)),
		setConnectiongNodeCanvasMode : (enabled : boolean) => dispatch(setConnectiongNodeCanvasMode(enabled)),
		setSelectedTask : (selectedTask : string) => dispatch(setSelectedTask(selectedTask)),
		deleteConnection: (node) => dispatch(deleteConnection(node)),
		deleteNode: (node) => dispatch(deleteNode(node)),
		deleteRawConnection: (node) => dispatch(deleteRawConnection(node)),
		deleteRawNode: (node) => dispatch(deleteRawNode(node)),

	}
}

export interface CanvasState {
	stageWidth : number;
	stageHeight: number;
	canvasOpacity: number;
	canvasKey : number
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
	}

	state = {
		stageWidth : 0,
		stageHeight : 0,
		canvasOpacity: 0,
		canvasKey : 1
	}

	canvasWrapper : any;
	stage : any;
	htmlWrapper : any;
	htmlElement : any;
	stageScale = 1.0;
	stageX = 0.0;
	stageY = 0.0;

	flowIsLoading = false;

	componentDidMount() {
		//this.props.storeFlow(this.props.nodes);

		//(this.refs.canvasWrapper as any).addEventListener('wheel', this.wheelEvent);
		if (this.canvasWrapper && this.canvasWrapper.current) {
			(this.canvasWrapper.current as any).addEventListener('wheel', this.wheelEvent);
		}
		window.addEventListener("resize", this.updateDimensions);
		document.addEventListener('paste', this.onPaste);
		this.updateDimensions();
		setTimeout(() => {
			
			this.loadEditorState();
		}, 100);
		
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
						console.log("canvasKey", this.state.canvasKey);						
						this.setState({canvasKey : this.state.canvasKey + 1});
					}
				}
			});
		}
	}

	componentDidUpdate(prevProps : CanvasProps, prevState: CanvasState) {
		if (prevProps.nodes != this.props.nodes) {
			this.props.storeFlow(this.props.nodes);
			//console.log("componentDidUpdate nodes diff");
		}

		if (prevProps.flow != this.props.flow) {
			if (this.flowIsLoading) {
				this.flowIsLoading = false;
				this.fitStage()
			}			
		}

		if (prevState.canvasKey !== this.state.canvasKey) {
			//console.log("componentDidUpdate", prevState.canvasKey, this.state.canvasKey);
			this.updateDimensions();			

			if (this.canvasWrapper && this.canvasWrapper.current) {
				(this.canvasWrapper.current).removeEventListener('wheel', this.wheelEvent);
				(this.canvasWrapper.current as any).addEventListener('wheel', this.wheelEvent);
			}			
		}

		this.setHtmlElementsPositionAndScale(this.stageX, this.stageY, this.stageScale);

	}

	unmounted = false;
	componentWillUnmount() {
		this.unmounted = true;

		document.removeEventListener('paste', this.onPaste);

		window.removeEventListener("resize", this.updateDimensions);
		//(this.refs.canvasWrapper as any).removeEventListener('wheel', this.wheelEvent);
		if (this.canvasWrapper && this.canvasWrapper.current) {
			(this.canvasWrapper.current).removeEventListener('wheel', this.wheelEvent);
		}

	}

	setNewPositionForNode = (node, group, position? : any) => {


		const x = group.attrs["x"];
		const y = group.attrs["y"];
		let newPosition = position || {x:x, y:y};
		
		if (newPosition) {
			if (this.stage && this.stage.current) {
				let stage = (this.stage.current as any).getStage();
				if (stage) {
					var touchPos = stage.getPointerPosition();
					const scaleFactor = (stage as any).scaleX();

					newPosition.x = ((touchPos.x - (stage).x()) / scaleFactor) - this.mouseStartX;
					newPosition.y = ((touchPos.y - (stage).y()) / scaleFactor) - this.mouseStartY;
						
					let shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);							
					if (shapeType == "Html") {
						//newPosition.y += ((node.height || ShapeMeasures.htmlHeight)/2);
						//newPosition.x += 125;
					}
					//console.log("touchPos", touchPos, newPosition, this.mouseStartX, this.mouseStartY);
				}
			}

			group.x(newPosition.x);
			group.y(newPosition.y);
		}

		this.props.storeFlowNode(Object.assign({}, node, newPosition ), node.name);
		this.props.storeRawNode(Object.assign({}, node, newPosition ), node.name);
		this.setHtmlElementsPositionAndScale(this.stageX, this.stageY, this.stageScale, newPosition.x, newPosition.y, node);						

		const startLines = FlowToCanvas.getLinesForStartNodeFromCanvasFlow(this.props.flow, node);

		let lines = {};
		if (startLines) {			
			startLines.map((lineNode) => {				
				const newStartPosition =  FlowToCanvas.getStartPointForLine(node, newPosition, lineNode, this.props.getNodeInstance);
				this.props.storeFlowNode(Object.assign({}, lineNode, {xstart: newStartPosition.x, ystart: newStartPosition.y} ), lineNode.name);
				this.props.storeRawNode(Object.assign({}, lineNode, {xstart: newStartPosition.x, ystart: newStartPosition.y} ), lineNode.name);
				lines[lineNode.name] = {xstart: newStartPosition.x, ystart: newStartPosition.y};
			})
		}

		const endLines = FlowToCanvas.getLinesForEndNodeFromCanvasFlow(this.props.flow, node);
		if (endLines) {
			
			endLines.map((lineNode) => {
				const newEndPosition =  FlowToCanvas.getEndPointForLine(node, newPosition, lineNode, this.props.getNodeInstance);
				let startPos = {};
				if (lines[lineNode.name]) {
					startPos = lines[lineNode.name];
				}
				this.props.storeFlowNode(Object.assign({}, lineNode, startPos, {xend: newEndPosition.x, yend: newEndPosition.y} ), lineNode.name);
				this.props.storeRawNode(Object.assign({}, lineNode, startPos, {xend: newEndPosition.x, yend: newEndPosition.y} ), lineNode.name);
			})
		}


		this.props.selectNode(node.name, node);
		this.props.setConnectiongNodeCanvasMode(false);

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

				//console.log("this.mouseStart" , this.mouseStartX, this.mouseStartY);
			}
		}
	}

	onMouseStart(node, event) {
		
		if (!!this.props.canvasMode.isConnectingNodes) {
			this.cancelDragStage();
			return false;
		}

		event.evt.preventDefault();
		event.evt.cancelBubble = true;		

		this.touching = true;
		this.touchNode = node;
		this.touchNodeGroup = event.currentTarget;
//console.log("onMouseStart", event);
		if (event.currentTarget) {
			this.determineStartPosition(event.currentTarget);
		}

		return false;

	}

	onMouseMove(node, event) {
		
		if (!!this.props.canvasMode.isConnectingNodes) {
			this.cancelDragStage();
			return false;
		}

		event.evt.preventDefault();
		event.evt.cancelBubble = true;	

		if (!!this.props.canvasMode.isConnectingNodes) {
			return false;
		}

		if (this.touching) {
			//console.log("onMouseMove", node, event);
			if (event.currentTarget) {
				(this.canvasWrapper.current).classList.add("mouse--moving");
				this.setNewPositionForNode(node, event.currentTarget, event.evt.screenX ? {
					x: event.evt.screenX,
					y: event.evt.screenY
				} : undefined);
			}
		}
		
		return false;
	}

	onMouseEnd(node, event) {

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

		if (event.currentTarget) {
			this.setNewPositionForNode(node, event.currentTarget, undefined);
		}
		return false;
	}

	onStageMouseEnd(event) {
		event.evt.preventDefault();
		event.evt.cancelBubble = true;

		this.touching = false;
		this.dragTime = undefined;
		this.touchNode = undefined;
		this.touchNodeGroup = undefined;
		return false;
	}

	onStageMouseLeave(event) {
		event.evt.preventDefault();
		event.evt.cancelBubble = true;

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
		
		if (!!this.props.canvasMode.isConnectingNodes) {
			this.cancelDragStage();
			return false;
		}

		if (this.touchNode && this.touchNodeGroup) {			
			event.evt.preventDefault();
			event.evt.cancelBubble = true;
			this.setNewPositionForNode(this.touchNode, this.touchNodeGroup);
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
			} : undefined);
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
			} : undefined);
		}
		return false;
	}


	draggingWhileTouching : boolean = false;
	onDragStart(node, event) {
		if (this.touching) {
			this.draggingWhileTouching = true;
			//console.log("onDragStart", event);
			if (event.evt && event.evt.cancelBubble) {
				event.evt.cancelBubble = true;
			}
			if (event && event.cancelBubble) {
				event.cancelBubble = true;
			}
			//event.target.stopDrag();
			//event.evt.preventDefault();
			return false;
		}
		//console.log("onDragStart", event);
	}
	onDragMove(node, event) {
		if (this.touching) {
			this.draggingWhileTouching = true;
			//event.target.stopDrag();
			//event.evt.preventDefault();
			return false;
		}
		//console.log("onDragMove", node, event);
		this.setNewPositionForNode(node, event.currentTarget);		
	}

	onDragEnd(node, event) {
		if (this.touching || this.draggingWhileTouching) {
			//event.evt.preventDefault();
			//event.preventDefault();
			//event.target.stopDrag();
			this.draggingWhileTouching = false;
			return false;
		}

		//console.log("onDragEnd", node, event);
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

		if ((!!this.props.canvasMode.isConnectingNodes || !!this.shiftDown) && 
			this.props.selectedNode !== undefined &&
			this.props.selectedNode.node !== undefined &&
			this.props.selectedNode.shapeType !== "Line") {

			const connection = getNewConnection(this.props.selectedNode.node, node, this.props.getNodeInstance);
			this.props.addConnection(connection);
			this.props.addRawConnection(connection);
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

	setHtmlElementsPositionAndScale = (stageX, stageY, stageScale, newX? : number, newY?: number, node? : any) => {
		let nodeElements = document.querySelectorAll(".canvas__html-shape");

		const elements = Array.from(nodeElements);
		for (var element of elements) {
			let x = parseFloat(element.getAttribute("data-x") || "");
			let y = parseFloat(element.getAttribute("data-y") || "");

			if (node && element.getAttribute("data-node") == node.name) {
				if (newX && !isNaN(newX)) {
					x = newX;
				}
				if (newY && !isNaN(newY)) {
					y = newY;
				}
			}
			(element as any).style.transform = 						
				"translate(" + (stageX  + x * stageScale) + "px," + 
					(stageY + y * stageScale) + "px) "+
				"scale(" + (stageScale) + "," + (stageScale) + ") ";
		}
	}

	wheelEvent(e) {

		if (e.toElement && e.toElement.closest) {
			// TODO : make this work on IE11 (do we need to support IE11??)
			let element = e.toElement.closest(".no-wheel");
			if (element) {
				return true;
			}
		}
		
		//console.log("wheelEvent", e);
		if (e.preventDefault) {
			e.preventDefault();
		}
		
		if (this.stage && this.stage.current) {
			let stage = (this.stage.current as any).getStage();
			//if (this.refs.stage !== undefined) {

			let scaleBy = 1.03;
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

				setTimeout(() => {
					this.saveEditorState(stage.scale().x, stage.x(), stage.y())
				}, 1);
			}
		}
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

	fitStage = () => {
		let xMin;
		let yMin;
		let xMax;
		let yMax;
		//let stage = (this.refs.stage as any).getStage();
		if (this.stage && this.stage.current) {
			let stage = (this.stage.current as any).getStage();
			if (stage !== undefined) {

				this.props.nodes.map((shape, index) => {
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
							
							let width = undefined;
							let height = undefined;

							if (this.props.getNodeInstance) {
								const instance = this.props.getNodeInstance(shape, this.props.flowrunnerConnector, this.props.nodes, this.props.flow, taskSettings);
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
							//console.log(shape.name, addWidth, addHeight);
						} else {
							addWidth = 100;
							addHeight = 50;
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
						
						//console.log(shape.name, shape.x, shape.y, addWidth, addHeight, xMin, xMax, yMin ,yMax);
					}
				});
			
				if (this.props.nodes.length > 0 &&
					xMin !== undefined && yMin !== undefined && xMax !== undefined && yMax !== undefined) {
					console.log(xMin, xMax, yMin ,yMax);
					let scale = 1;
					
					let flowWidth = Math.abs(xMax-xMin) ;//+ 200;
					let flowHeight = Math.abs(yMax-yMin) ;//+ 200;

					const stageContainerElement = document.querySelector(".canvas-controller__scroll-container");
					if (stageContainerElement !== null) {

						let realStageWidth = stageContainerElement.clientWidth;
						let realStageHeight = stageContainerElement.clientHeight;

						if (this.props.nodes.length == 1) { 
							scale = 1;
						} else {
							if (flowWidth !== 0) { // && flowWidth > realStageWidth) {
								scale = realStageWidth / flowWidth;
							}

							scale = scale * 0.65;						

							if (flowHeight * scale > realStageHeight) {							
								scale = realStageHeight / flowHeight;
								scale = scale * 0.85;
							} 
						}
						stage.scale({ x: scale, y: scale });

						const newPos = {
							x: 0 ,
							y: 0 
						};											
						
						newPos.x = (-(xMin)*scale) + stage.getWidth()/2 - ((flowWidth*scale))/2 ;
						newPos.y = (-(yMin)*scale) + stage.getHeight()/2 - ((flowHeight*scale))/2 ;	
						 
						//console.log(stage.getWidth(), stage.getHeight(), realStageWidth,realStageHeight,flowWidth,flowHeight,flowWidth * scale, flowHeight * scale , scale, newPos.x, newPos.y);

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

		if (this.touchNode && this.touchNodeGroup) {
			event.evt.preventDefault()		
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
					 
					this.props.addNode(newNode, this.props.flow);
					this.props.addRawFlow(newNode);


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
		console.log(event.target.getAttribute("data-task"));
		
		let taskClassName = event.dataTransfer.getData("data-task");
		//const taskClassName = event.target.getAttribute("data-task");
console.log("taskClassName", event.target, taskClassName);
		let _stage = (this.stage.current as any).getStage();

		_stage.setPointersPositions(event);
	
		//let data = event.dataTransfer.getData("text");
		//console.log(data, event);

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
					
					this.props.addNode(newNode, this.props.flow);
					this.props.addRawFlow(newNode);
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
		console.log("onPaste", event);
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
					 
					this.props.addNode(newNode, this.props.flow);
					this.props.addRawFlow(newNode);
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

	onInput = (event) => {
		// prevent editing of div because of contentEditable which is needed for pasting data from excel
		if (event.target && (event.target.tagName || "").toLowerCase() == "input") {
			return;
		}

		//console.log( event.target.tagName, event);
		if (event.keyCode == this.shiftKey) {
			this.shiftDown = true;
			return true;
		}
		if (event.keyCode == this.backspaceKey) {
			if (this.props.selectedNode && this.props.selectedNode.node) {
				if (this.props.selectedNode.node.shapeType !== 'Line') {
					this.props.deleteNode(this.props.selectedNode.node);
					this.props.deleteRawNode(this.props.selectedNode.node);
				} else {
					this.props.deleteConnection(this.props.selectedNode.node);
					this.props.deleteRawConnection(this.props.selectedNode.node);
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

		event.preventDefault();
		return false;
	}

	onKeyUp = (event) => {
		this.ctrlDown = false;
		this.shiftDown = false;
	}

	render() {
		const canvasHasSelectedNode : boolean = !!this.props.selectedNode && !!this.props.selectedNode.node;	

		const connections = this.props.canvasMode.showDependencies ? this.getDependentConnections() : [];
		let nodesConnectedToSelectedNode : any = {};
		/*onPaste={this.onPaste}	
		suppressContentEditableWarning={true}
				contentEditable={false}	
				*/
		return <>
			<div key={"stage-layer-" + this.state.canvasKey} ref={this.canvasWrapper} 
				style={{opacity: this.state.canvasOpacity}} 
				className="canvas-controller__scroll-container"
				onDragOver={this.onAllowDrop}
				onDrop={this.onDropTask}
						
				
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
					onMouseEnd={this.onStageMouseEnd.bind(this)}
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
									></Shapes.Line>})
						}

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
									></Shape>;
							} 
							return null;
						})}
						{this.props.flow.map((node, index) => {
							let shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);							

							const Shape = Shapes[shapeType];
							if (node.shapeType !== "Line" && Shape) {
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
								return <Shape key={"node-"+index} 
									x={node.x} 
									y={node.y} 
									name={node.name}
									taskType={node.taskType}
									node={node}
									canvasHasSelectedNode={canvasHasSelectedNode}
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
									></Shape>;
							}
							return null;
						})}
						
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

								const isSelected = this.props.selectedNode && this.props.selectedNode.name === node.name;
								nodeClone.htmlPlugin = node.htmlPlugin || (settings as any).htmlPlugin || "";
								
								let width = undefined;
								let height = undefined;

								if (this.props.getNodeInstance) {
									const instance = this.props.getNodeInstance(node, this.props.flowrunnerConnector, this.props.nodes, this.props.flow, settings);
									if (instance) {
										if (instance.getWidth && instance.getHeight) {
											width = instance.getWidth(node);
											height = instance.getHeight(node);
										}
									}
								}

								return <div key={"html" + index}
									style={{transform: "translate(" + (this.stageX  + node.x * this.stageScale) + "px," + 
											(this.stageY + node.y * this.stageScale) + "px) " +
											"scale(" + (this.stageScale) + "," + (this.stageScale) + ") ",
											width: (width || node.width || 250)+"px",
											height: (height || node.height || 250)+"px",
											left: (-(width || node.width || 250)/2)+"px",
											top: (-(height || node.height || 250)/2)+"px",
											opacity: (!canvasHasSelectedNode || (this.props.selectedNode && this.props.selectedNode.name === node.name)) ? 1 : 0.5 										 
										}}
									data-node={node.name}	 
									data-x={node.x} 
									data-y={node.y} 
									ref={this.htmlElement} 
									className="canvas__html-shape">
										<div className={"canvas__html-shape-bar " + (isSelected ? "canvas__html-shape-bar--selected" :"")}>{node.label ? node.label : node.name}</div>
										<div className="canvas__html-shape-body">
										{this.props.renderHtmlNode && this.props.renderHtmlNode(nodeClone, this.props.flowrunnerConnector, this.props.nodes, this.props.flow, settings)}</div>
										{settings.events && settings.events.map((event ,eventIndex) => {
											return <div className={"canvas__html-shape-event canvas__html-shape-" + eventIndex} key={"_" + index + "-" + eventIndex}></div>
										})}
										</div>;
							}
							return null;
						})
					}
				</div>
			</div>
		</>;
	}
} 

export const Canvas = connect(mapStateToProps, mapDispatchToProps)(ContainedCanvas);