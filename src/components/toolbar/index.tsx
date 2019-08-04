import * as React from 'react';
import { connect } from "react-redux";
import { storeFlow, storeFlowNode, addFlowNode } from '../../redux/actions/flow-actions';
import { TaskSelector } from '../task-selector';
import { EditPopup } from '../edit-popup';

export interface ToolbarProps {
	storeFlow : any;
	storeFlowNode: any;
	selectedNode : any;
	addFlowNode: any;
}

export interface ToolbarState {
	showEditPopup : boolean;
}

const mapStateToProps = (state : any) => {
	return {
		selectedNode : state.selectedNode
	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		storeFlow: (flow) => dispatch(storeFlow(flow)),
		storeFlowNode: (node) => dispatch(storeFlowNode(node)),
		addFlowNode: (node) => dispatch(addFlowNode(node))
	}
}

class ContainedToolbar extends React.Component<ToolbarProps, ToolbarState> {

	state = {
		showEditPopup : false
	}

	addNode = (e) => {
		e.preventDefault();
		this.props.addFlowNode({
			name: "abc",
			task: "TraceConsoleTask",
			shapeType: "Circle", 
			x: 50,
			y: 50
		})
		return false;
	}

	editNode = (e) => {
		e.preventDefault();
		this.setState({showEditPopup : true});
		return false;
	}

	onClose = () => {
		this.setState({showEditPopup : false});
	}

	render() {
		const selectedNode = this.props.selectedNode;
		console.log(selectedNode);
		return <>
			<div className="container-fluid bg-dark sticky-top">
				<div className="container toolbar__container">
					<div className="navbar navbar-expand-lg navbar-dark bg-dark toolbar">
						<form className="form-inline">
							{!!!selectedNode.name && <TaskSelector></TaskSelector>}
							{!!!selectedNode.name && <a href="#" onClick={this.addNode} className="mx-2 btn btn-outline-light">Add</a>}
							{!!selectedNode.name && <a href="#" onClick={this.editNode} className="mx-2 btn btn-outline-light">Edit</a>}
							{!!selectedNode.name && <span className="navbar-text">{selectedNode.name}</span>}
						</form>
					</div>
				</div>
			</div>
			{this.state.showEditPopup && <EditPopup onClose={this.onClose}></EditPopup>}
		</>
	}

}

export const Toolbar = connect(mapStateToProps, mapDispatchToProps)(ContainedToolbar);