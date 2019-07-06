import * as React from 'react';
import { Stage, Layer , Rect } from 'react-konva';
import { connect } from "react-redux";
import { Shapes } from './shapes'; 
import { storeFlow } from '../../redux/actions/flow-actions';

export interface CanvasProps {
	nodes : any[];
	storeFlow : any;
	flow: any[];
}
const mapStateToProps = (state : any) => {
	return {
		flow: state.flow
	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		storeFlow: (flow) => dispatch(storeFlow(flow))
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

	onDragMove(node, event) {

	}

	onDragEnd(node, event) {
		console.log(node, event);
		
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
						if (node.shapeType === "Line") {
							return <Shape key={"node-"+index}
								xstart={node.xstart} 
								ystart={node.ystart}
								xend={node.xend} 
								yend={node.yend}></Shape>;
						} else
						if (Shape) {
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