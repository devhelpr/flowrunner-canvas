import * as React from 'react';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';

export interface DebugNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
}

export interface DebugNodeHtmlPluginState {
	receivedPayload : any;
}

export class DebugNodeHtmlPlugin extends React.Component<DebugNodeHtmlPluginProps, DebugNodeHtmlPluginState> {
	state = {
		receivedPayload : {}
	}
	componentDidMount() {
		console.log("registerFlowNodeObserver", this.props.node.name);
		this.props.flowrunnerConnector.registerFlowNodeObserver(this.props.node.name, this.receivePayloadFromNode);
	}

	componentWillUnmount() {
		this.props.flowrunnerConnector.unregisterFlowNodeObserver(this.props.node.name);
	}
	receivePayloadFromNode = (payload : any) => {
		console.log("receivePayloadFromNode", this.props.node.name, payload);
		this.setState({receivedPayload : payload});
		return;
	}

	render() {
		return <div className="html-plugin-node html-plugin-node--wrap" style={{		
			backgroundColor: "white"
		}}>{this.state.receivedPayload ? JSON.stringify(this.state.receivedPayload, null, 2) : ""}			
		</div>;
	}
}