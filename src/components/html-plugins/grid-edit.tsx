import * as React from 'react';
import { Stage, Layer , Circle, Line } from 'react-konva';

import { IFlowrunnerConnector,IExecutionEvent } from '../../interfaces/IFlowrunnerConnector';
import Slider from '@material-ui/core/Slider';
import { connect } from "react-redux";
import { selectNode } from '../../redux/actions/node-actions';
import { ICanvasMode } from '../../redux/reducers/canvas-mode-reducers';

import * as uuid from 'uuid';
const uuidV4 = uuid.v4;

export class GridEditNodeHtmlPluginInfo {
	getWidth(node) {
		return (((node && node.columns) || 8) * 16) + 20;
	}

	getHeight(node) {
		return (((node && node.rows) || 8) * 19) + 4;
	}
}


export interface GridEditNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
	nodes : any;
	flow: any;
	canvasMode: ICanvasMode;

	selectedNode : any;
	selectNode : (name, node) => void;

}

export interface GridEditNodeHtmlPluginState {
	value : number | number[];
	receivedPayload : any[];
	data : IMatrixValue[];
}

const mapStateToProps = (state : any) => {
	return {
		selectedNode : state.selectedNode,
		canvasMode: state.canvasMode,		
	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		selectNode: (name, node) => dispatch(selectNode(name, node))
	}
}

export interface IMatrixValue {
	x : number;
	y : number;
	value : number;
}

export class ContainedGridEditNodeHtmlPlugin extends React.Component<GridEditNodeHtmlPluginProps,GridEditNodeHtmlPluginState> {

	state = {
		value : this.props.node.defaultValue || 0,
		receivedPayload : [],
		data : []
	};

	observableId = uuidV4();


	componentDidMount() {
		
		console.log("componentDidMount slider");
		if (this.props.node) {
			this.props.flowrunnerConnector.modifyFlowNode(
				this.props.node.name, 
				this.props.node.propertyName, 
				this.props.node.defaultValue || 0,
				""
			);
			this.setState({data : new Array(16 * 16).fill(0).map((item, index) => {
					return {
						value : 0,
						x: index % 16,
						y: Math.floor(index / 16)
					}
				})
			});
		}
	}

	componentDidUpdate(prevProps : any) {
		if (prevProps.nodes != this.props.nodes || prevProps.flow != this.props.flow) {
			if (this.props.node) {
				this.props.flowrunnerConnector.modifyFlowNode(
					this.props.node.name, 
					this.props.node.propertyName, 
					this.state.value,
					this.props.node.onChange || this.props.node.name
				);
			}
		}
		
	}

	unmounted = false;
	componentWillUnmount() {
		this.unmounted = true;
	}

	getWidth() {
		return (((this.props.node && this.props.node.columns) || 8) * 16) + 20;
	}

	getHeight() {
		return (((this.props.node && this.props.node.rows) || 8) * 19) + 4;
	}
	

	clickCircle = (matrixValue : IMatrixValue, event) => {
		event.evt.preventDefault();

		if (matrixValue) {
			let list = [...this.state.data as IMatrixValue[]];
			let item = list[matrixValue.x + matrixValue.y * ((this.props.node && this.props.node.columns) || 16)];
			item.value = (item.value == 1 ? 0 : 1);

			this.setState({data: list});

			let values : IMatrixValue[] = [];

			list.map((value, index) => {
				if (value.value == 1) {
					values.push({...value});
				}
			})
			this.props.flowrunnerConnector.modifyFlowNode(
				this.props.node.name, 
				this.props.node.propertyName, 
				values,
				this.props.node.name
			);
		}

		return false;
	}

	render() {

		let circles : any = null;
		let {node} = this.props;

		if (!this.state.data) {
			return null;
		}

		let list = this.state.data;
		
		circles = list.map((matrixValue : IMatrixValue, index) => {
			let circle : any = null;
				
			let x = matrixValue.x;// index % (node.columns);
			let y = matrixValue.y;//Math.floor(index / node.rows);

			if (matrixValue.value == 1) {
				circle = <Circle 
						key={"xycanvas-" + index}
						x={(x * node.columns) + 18}
						y={(y * node.rows) + 10}
						radius={16}
						stroke={"#000000"}
						strokeWidth={2}
						width={16}
						height={16}
						opacity={1}
						fill={"#000000"} 
						onClick={this.clickCircle.bind(this, matrixValue)}
						perfectDrawEnabled={false}>
					</Circle>
			} else {
				circle = <Circle 
						key={"xycanvas-" + index}
						x={(x * node.columns) + 18}
						y={(y * node.rows) + 10}
						radius={16}
						stroke={"#000000"}
						strokeWidth={2}
						width={16}
						height={16}
						opacity={1}
						fill={"#ffffff"} 
						onClick={this.clickCircle.bind(this, matrixValue)}

						perfectDrawEnabled={false}>
					</Circle>
			}
	
			return circle;
		});
		(list as any) = null;
		node = null;


		return <div className="html-plugin-node" style={{			
				backgroundColor: "white",
				width:(this.getWidth() || this.props.node.width || 250) + "px",
				height:(this.getHeight() || this.props.node.height || 250)+ "px"
			}}><Stage
					pixelRatio={1} 
					width={this.getWidth() || this.props.node.width || 250}
					height={this.getHeight() || this.props.node.height || 250}>		
				<Layer>
				{circles}
				</Layer>
			</Stage>
		</div>;
		
	}
}

export const GridEditNodeHtmlPlugin = connect(mapStateToProps, mapDispatchToProps)(ContainedGridEditNodeHtmlPlugin);