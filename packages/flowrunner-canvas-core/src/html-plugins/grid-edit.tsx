import * as React from 'react';
import { Stage, Layer , Circle, Line } from 'react-konva';

import { IFlowrunnerConnector } from '../interfaces/IFlowrunnerConnector';
import { PresetManager } from './components/preset-manager';

import * as uuid from 'uuid';
const uuidV4 = uuid.v4;


export interface GridEditNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
	flow: any;
}

export interface GridEditNodeHtmlPluginState {
	value : number | number[];
	receivedPayload : any[];
	data : IMatrixValue[];
}


export interface IMatrixValue {
	x : number;
	y : number;
	value : number;
}

export class GridEditNodeHtmlPlugin extends React.Component<GridEditNodeHtmlPluginProps,GridEditNodeHtmlPluginState> {

	override state = {
		value : this.props.node.defaultValue || 0,
		receivedPayload : [],
		data : []
	};

	observableId = uuidV4();


	override componentDidMount() {
		
		console.log("componentDidMount slider");
		if (this.props.node) {
			this.props.flowrunnerConnector.modifyFlowNode(
				this.props.node.name, 
				this.props.node.propertyName, 
				this.props.node.defaultValue || 0,
				""
			);
			this.setState({data : new Array(
					(this.props.node.columns || 8) * 
					(this.props.node.rows || 8)).fill(0).map((item, index) => {
					return {
						value : 0,
						x: index % (this.props.node.columns || 8),
						y: Math.floor(index / (this.props.node.columns || 8))
					}
				})
			});
		}
	}

	override componentDidUpdate(prevProps : any) {
		if (prevProps.flow != this.props.flow) {
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
	override componentWillUnmount() {
		this.unmounted = true;
	}

	getWidth() {
		return (((this.props.node && this.props.node.columns) || 8) * 16) + 20;
	}

	getHeight() {
		return (((this.props.node && this.props.node.rows) || 8) * 16) +  (3 * 16) + 4 + 150;
	}

	getCanvasHeight() {
		return (((this.props.node && this.props.node.rows) || 8) * 16) +  (1 * 16) + 4;
	}
	

	clickCircle = (matrixValue : IMatrixValue, event) => {
		event.evt.preventDefault();

		if (matrixValue) {
			let list = [...this.state.data as IMatrixValue[]];
			let item = list[matrixValue.x + matrixValue.y * ((this.props.node && this.props.node.columns) || 8)];
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

	onLoadPreset = () => {

	}

	onGetData = () => {
	
		let values : IMatrixValue[] = [];
		
		(this.state.data as any).map((value, index) => {
			if (value.value == 1) {
				values.push({...value});
			}
		});

		return values;
	}

	onSetData = (data) => {

		let values : IMatrixValue[] = [];
		let list = new Array((this.props.node.columns || 8) * (this.props.node.rows || 8)).fill(0).map((item, index) => {
			return {
				value : 0,
				x: index % (this.props.node.columns || 8),
				y: Math.floor(index / (this.props.node.columns || 8))
			}
		});
		data.map((value, index) => {
			if (value.value == 1) {
				list[value.y * (this.props.node.columns || 8) + value.x].value = 1;
				values.push({...value});
			}
		});
		this.setState({data : list});
		
		this.props.flowrunnerConnector.modifyFlowNode(
			this.props.node.name, 
			this.props.node.propertyName, 
			values,
			this.props.node.name
		);
	}

	override render() {

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
				circle = <React.Fragment key={"xycanvas-gridedit-alive-" + index}>
					<Circle 
						key={"xycanvas-gridedit-alive-circle-" + index}
						x={(x * 16) + 18}
						y={(y * 16) + 10}
						radius={14}
						stroke={"#000000"}
						strokeWidth={2}
						width={14}
						height={14}
						opacity={1}
						fill={"#ffffff"} 
						onClick={this.clickCircle.bind(this, matrixValue)}
						perfectDrawEnabled={false}>
					</Circle>

					<Circle 
						key={"xycanvas-gridedit-alive-inner-" + index}
						x={(x * 16) + 18}
						y={(y * 16) + 10}
						radius={16}
						stroke={"#ffffff"}
						strokeWidth={2}
						width={12}
						height={12}
						opacity={1}
						fill={"#000000"} 
						onClick={this.clickCircle.bind(this, matrixValue)}
						perfectDrawEnabled={false}>
					</Circle>

					</React.Fragment>
			} else {
				circle = <Circle 
						key={"xycanvas-gridedit-dead-" + index}
						x={(x * 16) + 18}
						y={(y * 16) + 10}
						radius={14}
						stroke={"#000000"}
						strokeWidth={1}
						width={14}
						height={14}
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


		return <div className="html-plugin-node html-plugin-node__grid-edit" style={{			
				backgroundColor: "white",
				width:(this.getWidth() || this.props.node.width || 250) + "px",
				height:(this.getHeight() || this.props.node.height || 250)+ "px"
			}}><Stage
					className="stage-div"
					pixelRatio={1} 
					width={this.getWidth() || this.props.node.width || 250}
					height={(this.getCanvasHeight()) || this.props.node.height || 250}>		
				<Layer>
				{circles}
				</Layer>
			</Stage>
			<PresetManager 
				node={this.props.node}
				onLoadPreset={this.onLoadPreset}
				onGetData={this.onGetData}
				onSetData={this.onSetData}
				></PresetManager>
		</div>;
		
	}
}
