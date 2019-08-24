import * as React from 'react';
import { Stage, Layer , Rect } from 'react-konva';
import { connect } from "react-redux";
import { Shapes } from './shapes'; 
import { storeFlow, storeFlowNode, addConnection } from '../../redux/actions/flow-actions';
import { selectNode } from '../../redux/actions/node-actions';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { ICanvasMode } from '../../redux/reducers/canvas-mode-reducers';
import { setConnectiongNodeCanvasMode , setConnectiongNodeCanvasModeFunction } from '../../redux/actions/canvas-mode-actions';
import { ShapeTypeProps } from './shapes/shape-types';

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
		storeFlowNode: (node) => dispatch(storeFlowNode(node)),
		selectNode: (name, node) => dispatch(selectNode(name, node)),
		setConnectiongNodeCanvasMode : (enabled : boolean) => dispatch(setConnectiongNodeCanvasMode(enabled))
	}
}

class ContainedCanvas extends React.Component<CanvasProps> {
	
	constructor(props) {
		super(props);

		this.onDragEnd = this.onDragEnd.bind(this);
		this.onDragMove = this.onDragMove.bind(this);
		this.onClickShape = this.onClickShape.bind(this);
	}

	componentDidMount() {
		this.props.storeFlow(this.props.nodes);
	}

	setNewPositionForNode = (node, group) => {

		const startLines = FlowToCanvas.getLinesForStartNodeFromCanvasFlow(this.props.flow, node);
		const endLines = FlowToCanvas.getLinesForEndNodeFromCanvasFlow(this.props.flow, node);

		const x = group.attrs["x"];
		const y = group.attrs["y"];
		const newPosition = {x:x, y:y};
		this.props.storeFlowNode(Object.assign({}, node, newPosition ));

		if (startLines) {
			const newStartPosition =  FlowToCanvas.getStartPointForLine(node, newPosition);
			startLines.map((node) => {
				this.props.storeFlowNode(Object.assign({}, node, {xstart: newStartPosition.x, ystart: newStartPosition.y} ));
			})
		}

		if (endLines) {
			const newEndPosition =  FlowToCanvas.getEndPointForLine(node, newPosition);
			endLines.map((node) => {
				this.props.storeFlowNode(Object.assign({}, node, {xend: newEndPosition.x, yend: newEndPosition.y} ));
			})
		}

		this.props.selectNode(node.name, node);
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

		if (this.props.canvasMode.isConnectingNodes && this.props.selectedNode !== undefined) {
			this.props.addConnection(this.props.selectedNode.node, node);
			this.props.setConnectiongNodeCanvasMode(false);
		}

		this.props.selectNode(node.name, node);

		return false;		
	}

	clickStage = (event) => {
		event.evt.preventDefault()		
		
		this.props.selectNode(undefined, undefined);
		this.props.setConnectiongNodeCanvasMode(false);

		return false;
	}

	render() {
		return <>
			<Stage
				onClick={this.clickStage}
				draggable={true}
				pixelRatio={1} 
				width={ 1024 } 
				height={ 750 } className="stage-container">
				<Layer>
					<Rect x={0} y={0} width={1024} height={750}></Rect>
					
					{this.props.flow.map((node, index) => {
						let Shape = Shapes[node.shapeType];
						if (node.shapeType === "Line"  && Shape) {
							return <Shape key={"node-"+index}
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
		</>;
	}
} 

export const Canvas = connect(mapStateToProps, mapDispatchToProps)(ContainedCanvas);