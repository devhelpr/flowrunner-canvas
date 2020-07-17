import * as React from 'react';
import { IFlowrunnerConnector,IExecutionEvent } from '../../interfaces/IFlowrunnerConnector';
import Slider from '@material-ui/core/Slider';
import { connect } from "react-redux";
import { selectNode } from '../../redux/actions/node-actions';

import * as uuid from 'uuid';
const uuidV4 = uuid.v4;


export interface SliderNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
	nodes : any;
	flow: any;

	selectedNode : any;
	selectNode : (name, node) => void;

}

export interface SliderNodeHtmlPluginState {
	value : number | number[];
	receivedPayload : any[];
}

const mapStateToProps = (state : any) => {
	return {
		selectedNode : state.selectedNode,		
	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		selectNode: (name, node) => dispatch(selectNode(name, node))
	}
}

export class ContainedSliderNodeHtmlPlugin extends React.Component<SliderNodeHtmlPluginProps,SliderNodeHtmlPluginState> {

	state = {
		value : this.props.node.defaultValue || 0,
		receivedPayload : []
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
			this.setState({value : this.props.node.defaultValue || 0});
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
	
	onChange = (event: object, value: number | number[]) => {
		console.log("slider", value);
		if (this.props.node) {
			this.props.flowrunnerConnector.modifyFlowNode(
				this.props.node.name, 
				this.props.node.propertyName, 
				value,
				this.props.node.onChange || this.props.node.name,
				"onChangeSlider"
			);
			let preventLoop = false;
			if (!this.props.selectedNode || !this.props.selectedNode.payload) {
				this.props.selectNode(this.props.node.name, this.props.node);
			}
			this.setState({value : value}, () => {
				// TODO : calling selectNode here causes an infinite loop !???
			});
		}
	}

	render() {
		console.log("componentDidMount render");
		return <div className="html-plugin-node" style={{			
			backgroundColor: "white"
		}}>
			<div className="w-100 h-auto text-center">
				{this.props.node.title && <div><strong>{this.props.node.title}</strong></div>}
				<div style={{
					fontSize: "24px",
					marginBottom: "20px"
				}}>
					{this.props.node.preLabel && <span>{this.props.node.preLabel}</span>}
					<span>{(this.props.selectedNode && 
							this.props.selectedNode.payload &&
							this.props.node.propertyName &&
							this.props.selectedNode.payload[this.props.node.propertyName]
							) || this.state.value}</span>
					{this.props.node.afterLabel && <span>{this.props.node.afterLabel}</span>}
				</div>				
				<Slider 
					min={this.props.node.minValue || 0}
					max={this.props.node.maxValue || 100} 
					value={(this.props.selectedNode && 
						this.props.selectedNode.payload &&
						this.props.node.propertyName &&
						this.props.selectedNode.payload[this.props.node.propertyName]) ||
						this.state.value || 0} 
					onChange={this.onChange} 
				/>
			</div>
		</div>;
	}
}

export const SliderNodeHtmlPlugin = connect(mapStateToProps, mapDispatchToProps)(ContainedSliderNodeHtmlPlugin);