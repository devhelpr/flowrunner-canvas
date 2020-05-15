import * as React from 'react';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import Slider from '@material-ui/core/Slider';

export interface SliderNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
	nodes : any;
	flow: any;
}

export interface SliderNodeHtmlPluginState {
	value : number | number[];
}

export class SliderNodeHtmlPlugin extends React.Component<SliderNodeHtmlPluginProps,SliderNodeHtmlPluginState> {

	state = {
		value : 0
	};

	componentDidMount() {
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
					this.props.node.onChange || ""
				);
	
			}
		}
	}
	
	onChange = (event: object, value: number | number[]) => {
		console.log("slider", value);
		if (this.props.node) {
			this.props.flowrunnerConnector.modifyFlowNode(
				this.props.node.name, 
				this.props.node.propertyName, 
				value,
				this.props.node.onChange || ""
			);

			this.setState({value : value});
		}
	}

	render() {
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
					<span>{this.state.value}</span>
					{this.props.node.afterLabel && <span>{this.props.node.afterLabel}</span>}
				</div>				
				<Slider 
					max={this.props.node.maxValue || 100} 
					defaultValue={this.props.node.defaultValue || 0} 
					onChange={this.onChange} 
				/>
			</div>
		</div>;
	}
}