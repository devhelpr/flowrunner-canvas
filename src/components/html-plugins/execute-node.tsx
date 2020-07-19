import * as React from 'react';
import { connect } from "react-redux";

import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { ICanvasMode } from '../../redux/reducers/canvas-mode-reducers';

export interface ExecuteNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
	canvasMode: ICanvasMode;
}

const mapStateToProps = (state : any) => {
	return {
		canvasMode: state.canvasMode,		
	}
}

export class ExecuteNodeHtmlPluginInfo {
	getWidth = (node) => {
		return;
	}

	getHeight(node) {
		return;
	}
}

export class ContainedExecuteNodeHtmlPlugin extends React.Component<ExecuteNodeHtmlPluginProps> {
	
	click = (event) => {
		event.preventDefault();

		if (!!this.props.canvasMode.isFlowrunnerPaused) {
			return;
		}

		if (this.props.node) {
			this.props.flowrunnerConnector.executeFlowNode(this.props.node.name, {});
		}
		return false;
	}
	
	render() {
		return <div className="html-plugin-node" style={{			
			backgroundColor: "white"
		}}>
			<a href="#" className={(!!this.props.canvasMode.isFlowrunnerPaused ? "disabled " : "") + "btn btn-primary"} onClick={this.click}>Click to Execute</a>
		</div>;
	}
}

export const ExecuteNodeHtmlPlugin = connect(mapStateToProps)(ContainedExecuteNodeHtmlPlugin);