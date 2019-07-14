import * as React from 'react';
import { connect } from "react-redux";
import { storeFlow, storeFlowNode } from '../../redux/actions/flow-actions';
import { TaskSelector } from '../task-selector';

export interface ToolbarProps {
	storeFlow : any;
	storeFlowNode: any;
	selectedNode : any;
}
const mapStateToProps = (state : any) => {
	return {
		selectedNode : state.selectedNode
	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		storeFlow: (flow) => dispatch(storeFlow(flow)),
		storeFlowNode: (node) => dispatch(storeFlowNode(node))
	}
}

class ContainedToolbar extends React.Component<ToolbarProps> {

	render() {
		const { selectedNode } = this.props;

		return <div className="toolbar__container">
			<div className="toolbar">
				<TaskSelector></TaskSelector>
				{selectedNode && <p>{selectedNode.name}</p>}
			</div>
		</div>
	}

}

export const Toolbar = connect(mapStateToProps, mapDispatchToProps)(ContainedToolbar);