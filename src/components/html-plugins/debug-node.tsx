import * as React from 'react';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { XYCanvas } from './visualizers/xy-canvas';
import { Number } from './visualizers/number';
import { Color } from './visualizers/color';

export interface DebugNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
}

export interface DebugNodeHtmlPluginState {
	receivedPayload : any[];
}

export class DebugNodeHtmlPlugin extends React.Component<DebugNodeHtmlPluginProps, DebugNodeHtmlPluginState> {
	state = {
		receivedPayload : []
	}
	componentDidMount() {
		//console.log("registerFlowNodeObserver", this.props.node.name);
		this.props.flowrunnerConnector.registerFlowNodeObserver(this.props.node.name, this.receivePayloadFromNode);
	}

	componentWillUnmount() {
		this.props.flowrunnerConnector.unregisterFlowNodeObserver(this.props.node.name);
	}
	receivePayloadFromNode = (payload : any) => {
		//console.log("receivePayloadFromNode", this.props.node.name, payload);
		let receivedPayloads : any[] = this.state.receivedPayload;
		receivedPayloads.push(payload);
		receivedPayloads = receivedPayloads.slice(Math.max(receivedPayloads.length - (this.props.node.maxPayloads || 1), 0));
		this.setState({receivedPayload : receivedPayloads});
		return;
	}

	render() {

		let visualizer = <></>;

		if (this.state.receivedPayload.length == 0) {
			visualizer = <div style={{		
				backgroundColor: "#f2f2f2"
			}}></div>;
		}
		
		if (this.props.node.visualizer == "number") {
			visualizer = <Number node={this.props.node} payloads={this.state.receivedPayload}></Number>
		} else
		if (this.props.node.visualizer == "color") {
			visualizer = <Color node={this.props.node} payloads={this.state.receivedPayload}></Color>
		} else 
		if (this.props.node.visualizer == "xycanvas") {
			visualizer = <XYCanvas node={this.props.node} payloads={this.state.receivedPayload}></XYCanvas>
		} else {
			const payload = this.state.receivedPayload[this.state.receivedPayload.length-1];
			visualizer = <>{payload ? JSON.stringify(payload, null, 2) : ""}</>;
		}
		return <div className="html-plugin-node html-plugin-node--wrap" style={{		
			backgroundColor: "white"
		}}>{visualizer}			
		</div>;
		
	
	}
}