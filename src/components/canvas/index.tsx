import * as React from 'react';
import { Stage, Layer , Rect } from 'react-konva';
import { connect } from "react-redux";
import { Shapes } from './shapes'; 
import { storeFlow, storeFlowNode, addConnection } from '../../redux/actions/flow-actions';
import { selectNode } from '../../redux/actions/node-actions';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { ICanvasMode } from '../../redux/reducers/canvas-mode-reducers';
import { setConnectiongNodeCanvasMode , setConnectiongNodeCanvasModeFunction } from '../../redux/actions/canvas-mode-actions';
import Victor from "victor";

export interface CanvasProps {
	nodes : any[];
	flow: any[];

	storeFlow : any;
	storeFlowNode: any;
	selectNode: any;
	addConnection: any;

	selectedNode : any;
	canvasMode: ICanvasMode;
	setConnectiongNodeCanvasMode: setConnectiongNodeCanvasModeFunction;

}

const mapStateToProps = (state : any) => {
	return {
		flow: state.flow,
		selectedNode : state.selectedNode,
		canvasMode: state.canvasMode
	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		addConnection: (nodeFrom : any, nodeTo : any) => dispatch(addConnection(nodeFrom, nodeTo)),
		storeFlow: (flow) => dispatch(storeFlow(flow)),
		storeFlowNode: (node, orgNodeName) => dispatch(storeFlowNode(node, orgNodeName)),
		selectNode: (name, node) => dispatch(selectNode(name, node)),
		setConnectiongNodeCanvasMode : (enabled : boolean) => dispatch(setConnectiongNodeCanvasMode(enabled))
	}
}

export interface CanvasState {
	stageWidth : number;
}

class ContainedCanvas extends React.Component<CanvasProps, CanvasState> {
	
	constructor(props) {
		super(props);

		this.onDragEnd = this.onDragEnd.bind(this);
		this.onDragMove = this.onDragMove.bind(this);
		this.onClickShape = this.onClickShape.bind(this);

		this.wheelEvent = this.wheelEvent.bind(this);
		this.updateDimensions = this.updateDimensions.bind(this);
	}

	state = {
		stageWidth : 0
	}

	componentDidMount() {
		this.props.storeFlow(this.props.nodes);

		(this.refs.canvasWrapper as any).addEventListener('wheel', this.wheelEvent);
		window.addEventListener("resize", this.updateDimensions);

		this.updateDimensions();
		setTimeout(() => {
			this.fitStage();
		}, 0);
		
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.updateDimensions);
		(this.refs.canvasWrapper as any).removeEventListener('wheel', this.wheelEvent);

	}

	setNewPositionForNode = (node, group) => {

		const startLines = FlowToCanvas.getLinesForStartNodeFromCanvasFlow(this.props.flow, node);
		const endLines = FlowToCanvas.getLinesForEndNodeFromCanvasFlow(this.props.flow, node);

		const x = group.attrs["x"];
		const y = group.attrs["y"];
		const newPosition = {x:x, y:y};
		this.props.storeFlowNode(Object.assign({}, node, newPosition ), node.name);

		if (startLines) {
			const newStartPosition =  FlowToCanvas.getStartPointForLine(node, newPosition);
			startLines.map((node) => {
				this.props.storeFlowNode(Object.assign({}, node, {xstart: newStartPosition.x, ystart: newStartPosition.y} ), node.name);
			})
		}

		if (endLines) {
			const newEndPosition =  FlowToCanvas.getEndPointForLine(node, newPosition);
			endLines.map((node) => {
				this.props.storeFlowNode(Object.assign({}, node, {xend: newEndPosition.x, yend: newEndPosition.y} ), node.name);
			})
		}

		this.props.selectNode(node.name, node);
	}

	onMouseOver() {
        document.body.style.cursor = 'pointer';
	}
	
	onMouseOut() {
        document.body.style.cursor = 'default';
	}


	onDragMove(node, event) {

		this.setNewPositionForNode(node, event.currentTarget);

	}

	onDragEnd(node, event) {

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

		if (this.props.canvasMode.isConnectingNodes && 
			this.props.selectedNode !== undefined &&
			this.props.selectedNode.shapeType !== "Line") {
			this.props.addConnection(this.props.selectedNode.node, node);
			this.props.setConnectiongNodeCanvasMode(false);
		}

		this.props.selectNode(node.name, node);

		return false;		
	}

	onClickLine(node, event) {
		event.cancelBubble = true;
		event.evt.preventDefault();
		this.props.setConnectiongNodeCanvasMode(false);
		this.props.selectNode(node.name, node);

		return false;
	}

	wheelEvent(e) {
		e.preventDefault();
		if (this.refs.stage !== undefined) {

			let scaleBy = 1.03;
			let stage = (this.refs.stage as any).getStage();
			if (stage !== undefined && stage.getPointerPosition() !== undefined) {
				var oldScale = stage.scaleX();

				var mousePointTo = {
					x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
					y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
				};

				var newScale = e.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
				stage.scale({ x: newScale, y: newScale });
				var newPos = {
					x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
					y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
				};
				stage.position(newPos);
				stage.batchDraw();
			}
		}
	}

	updateDimensions() {
				
		const stageContainerElement = document.querySelector(".stage-container");
		if (stageContainerElement !== null) {
			let widthCanvas = stageContainerElement.clientWidth;

			this.setState({stageWidth: widthCanvas});
		}
	}

	fitStage() {
		let xMin;
		let yMin;
		let xMax;
		let yMax;
		let stage = (this.refs.stage as any).getStage();
		if (stage !== undefined) {
			this.props.nodes.map(function(shape, index) {
				if (shape.shapeType != "Line") {
					if (xMin === undefined) {
						xMin = shape.x;
					}
					if (yMin === undefined) {
						yMin = shape.y;
					}
					if (xMax === undefined) {
						xMax = shape.x;
					}
					if (yMax === undefined) {
						yMax = shape.y;
					}

					if (shape.x < xMin) {
						xMin = shape.x;
					}
					if (shape.x > xMax) {
						xMax = shape.x;
					}
					if (shape.y < yMin) {
						yMin = shape.y;
					}
					if (shape.y > yMax) {
						yMax = shape.y;
					}
				}
			});
		
			if (xMin !== undefined && yMin !== undefined && xMax !== undefined && yMax !== undefined) {
				
				let scale = 1;
				
				let flowWidth = Math.abs(xMax-xMin) + 200;
				let flowHeight = Math.abs(yMax-yMin) + 200;

				const stageContainerElement = document.querySelector(".canvas-controller__scroll-container");
				if (stageContainerElement !== null) {
					let realStageWidth = stageContainerElement.clientWidth;
				
					if (flowWidth !== 0) { // && flowWidth > realStageWidth) {
						scale = realStageWidth / flowWidth;
					}
					scale = scale * 0.75;
					stage.scale({ x: scale, y: scale });

					var newPos = {
						x: 0 ,
						y: 0 
					};
					
					newPos.x = (-xMin*scale) + stage.getWidth()/2 - ((flowWidth*scale))/2 ;
					newPos.y = (-yMin*scale) + stage.getHeight()/2 - ((flowHeight*scale))/2 ;

					stage.position(newPos);
					stage.batchDraw();

					console.log(scale,flowWidth,realStageWidth,newPos,xMin,xMax,yMin,yMax, stage.getWidth(), stage.getHeight());
				}
			}
		}
	}

	clickStage = (event) => {
		event.evt.preventDefault()		
		
		this.props.selectNode(undefined, undefined);
		this.props.setConnectiongNodeCanvasMode(false);

		return false;
	}

	render() {
		return <>
			<div ref="canvasWrapper" className="canvas-controller__scroll-container ">
				<Stage
					onClick={this.clickStage}
					draggable={true}
					pixelRatio={1} 
					width={this.state.stageWidth}
					height={ 750 }
					ref="stage" 
					className="stage-container">
					<Layer>
						<Rect x={0} y={0} width={1024} height={750}></Rect>
						
						{this.props.flow.map((node, index) => {
							let Shape = Shapes[node.shapeType];
							if (node.shapeType === "Line"  && Shape) {
								return <Shape key={"node-"+index}
									onMouseOver={this.onMouseOver.bind(this)}
									onMouseOut={this.onMouseOut.bind(this)}
									onClickLine={this.onClickLine.bind(this, node)}
									isSelected={this.props.selectedNode !== undefined && this.props.selectedNode.name === node.name}
									xstart={node.xstart} 
									ystart={node.ystart}
									xend={node.xend} 
									yend={node.yend}></Shape>;
							} 
							return null;
						})}

						{this.props.flow.map((node, index) => {
							const Shape = Shapes[node.shapeType];
							if (node.shapeType !== "Line" && Shape) {
								return <Shape key={"node-"+index} 
									x={node.x} 
									y={node.y} 
									name={node.name}
									onMouseOver={this.onMouseOver.bind(this)}
									onMouseOut={this.onMouseOut.bind(this)}
									onDragEnd={this.onDragEnd.bind(this, node)}
									onDragMove={this.onDragMove.bind(this, node)}
									onClickShape={this.onClickShape.bind(this, node)}
									isSelected={this.props.selectedNode !== undefined && this.props.selectedNode.name === node.name}
									></Shape>;
							}
							return null;
						})}
						
					</Layer>
				</Stage>
			</div>
		</>;
	}
} 

export const Canvas = connect(mapStateToProps, mapDispatchToProps)(ContainedCanvas);