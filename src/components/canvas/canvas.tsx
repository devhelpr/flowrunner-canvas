import * as React from 'react';
import { Stage, Layer , Rect } from 'react-konva';
import { connect } from "react-redux";
import { Shapes } from './shapes'; 
import { storeFlow, storeFlowNode } from '../../redux/actions/flow-actions';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { constants } from 'perf_hooks';

export interface CanvasProps {
	nodes : any[];
	storeFlow : any;
	storeFlowNode: any;
	flow: any[];
}
const mapStateToProps = (state : any) => {
	return {
		flow: state.flow
	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		storeFlow: (flow) => dispatch(storeFlow(flow)),
		storeFlowNode: (node) => dispatch(storeFlowNode(node))
	}
}

class ContainedCanvas extends React.Component<CanvasProps> {
	
	constructor(props) {
		super(props);

		this.onDragEnd = this.onDragEnd.bind(this);
		this.onDragMove = this.onDragMove.bind(this);
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

	render() {
		return <>
			<Stage
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
						let Shape = Shapes[node.shapeType];
						if (node.shapeType !== "Line" && Shape) {
							return <Shape key={"node-"+index} 
								x={node.x} 
								y={node.y} 
								name={node.name}
								onDragEnd={this.onDragEnd.bind(this, node)}
								onDragMove={this.onDragMove.bind(this, node)}
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