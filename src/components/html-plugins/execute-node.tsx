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
			this.props.flowrunnerConnector.executeFlowNode(this.props.node.name, {});
		}
		return false;
	}
	
	render() {
		return <div className="html-plugin-node" style={{
			
			backgroundColor: "white"
		}}>
			<a href="#" className="btn btn-primary" onClick={this.click}>Click to Execute</a>
		</div>;
	}
}