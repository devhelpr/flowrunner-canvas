import * as React from 'react';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { XYCanvas } from './visualizers/xy-canvas';
import { Number } from './visualizers/number';
import { Color } from './visualizers/color';
import { Text } from './visualizers/text';

import * as uuid from 'uuid';
const uuidV4 = uuid.v4;


export interface DebugNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
	nodes : any;
	flow: any;
}

export interface DebugNodeHtmlPluginState {
	receivedPayload : any[];
}

export class DebugNodeHtmlPlugin extends React.Component<DebugNodeHtmlPluginProps, DebugNodeHtmlPluginState> {
	state = {
		receivedPayload : []
	}

	observableId = uuidV4();

	componentDidMount() {
		console.log("registerFlowNodeObserver", this.props.node.name, this.observableId);
		this.props.flowrunnerConnector.registerFlowNodeObserver(this.props.node.name, this.observableId, this.receivePayloadFromNode);
	}

	componentDidUpdate(prevProps : any) {
		if (prevProps.nodes != this.props.nodes || prevProps.flow != this.props.flow) {
			this.props.flowrunnerConnector.unregisterFlowNodeObserver(prevProps.node.name, this.observableId);
			this.props.flowrunnerConnector.registerFlowNodeObserver(this.props.node.name, this.observableId, this.receivePayloadFromNode);
		}

		if (!prevProps || !prevProps.node || 
			(prevProps.node.name != this.props.node.name)) {
			this.props.flowrunnerConnector.unregisterFlowNodeObserver(prevProps.node.name, this.observableId);
			this.props.flowrunnerConnector.registerFlowNodeObserver(this.props.node.name, this.observableId, this.receivePayloadFromNode);
		}

	}

	unmounted = false;
	componentWillUnmount() {
		this.unmounted = true;
		this.props.flowrunnerConnector.unregisterFlowNodeObserver(this.props.node.name, this.observableId);
	}

	receivePayloadFromNode = (payload : any) => {
		if (this.unmounted) {
			return;
		}
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
		if (this.props.node.visualizer == "text") {
			visualizer = <Text node={this.props.node} payloads={this.state.receivedPayload}></Text>
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