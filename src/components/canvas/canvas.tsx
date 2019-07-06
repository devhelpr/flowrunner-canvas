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
	
	componentDidMount() {
		this.props.storeFlow(this.props.nodes);
	}

	onDragMove = (shape, event) => {

	}

	onDragEnd = (shape, event) => {

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
								onDragEnd={this.onDragEnd}
								onDragMove={this.onDragMove}
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