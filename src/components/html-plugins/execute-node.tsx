import * as React from 'react';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';

export interface ExecuteNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
}

export class ExecuteNodeHtmlPlugin extends React.Component<ExecuteNodeHtmlPluginProps> {
	
	click = (event) => {
		event.preventDefault();
		if (this.props.node) {
			// TODO : refactor to this.props.node.name... when flow is running in worker
			this.props.flowrunnerConnector.executeFlowNode(this.props.node.name, {});
		}
		return false;
	}
/*
width:this.props.node.width || 250,
			height:this.props.node.height || 250,
			*/
	render() {
		return <div className="html-plugin-node" style={{
			
			backgroundColor: "white"
		}}>
			<a href="#" onClick={this.click}>Click to Execute</a>
		</div>;
	}
}