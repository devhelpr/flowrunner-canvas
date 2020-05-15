import * as React from 'react';
import { connect } from "react-redux";
import { ShapeSettings } from '../../helpers/shape-settings';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { Shapes } from '../canvas/shapes'; 
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';

export interface DebugInfoProps {
	nodes : any[];
	flow: any[];

	selectedNode : any;
	flowrunnerConnector : IFlowrunnerConnector;
}

export interface DebugInfoState {
	
}

const mapStateToProps = (state : any) => {
	return {
		flow: state.flow,
		nodes: state.rawFlow,
		selectedNode : state.selectedNode,		
	}
}


class ContainedDebugInfo extends React.Component<DebugInfoProps, DebugInfoState> {
	constructor(props) {
		super(props);

		this.htmlElement = React.createRef();
	}

	htmlElement : any;
	componentDidMount() {
		this.props.flowrunnerConnector.registerFlowExecutionObserver("ContainedDebugInfo" , () => {
			if (!this.unmounted) {
				// TODO : fix this nasty workaround
				this.forceUpdate();
			}
		});
	}

	unmounted : boolean = false;
	componentWillUnmount() {
		this.unmounted = true;
		this.props.flowrunnerConnector.unregisterFlowExecuteObserver("ContainedDebugInfo");

	}

	render() {
		
		if (this.props.selectedNode && this.props.selectedNode.name) {
			let list = this.props.flowrunnerConnector.getNodeExecutionsByNodeName(this.props.selectedNode.name);

			if (list && list.length > 0) {
				const debugInfo = JSON.stringify(list[list.length - 1], null, 2);
				return <div className="debug-info">
					<div className="debug-info__debug-info">
						<div className="debug-info__debug-info-content">
							{debugInfo}
						</div>
					</div>
				</div>
			}
		}

		return null;
		
	}
}

export const DebugInfo = connect(mapStateToProps, )(ContainedDebugInfo);