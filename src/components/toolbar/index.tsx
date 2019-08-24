import * as React from 'react';
import { connect } from "react-redux";
import { storeFlow, storeFlowNode, addFlowNode } from '../../redux/actions/flow-actions';
import { TaskSelector } from '../task-selector';
import { EditPopup } from '../edit-popup';
import { ICanvasMode } from '../../redux/reducers/canvas-mode-reducers';
import { setConnectiongNodeCanvasMode , setConnectiongNodeCanvasModeFunction } from '../../redux/actions/canvas-mode-actions';

export interface ToolbarProps {
	storeFlow : any;
	storeFlowNode: any;
	selectedNode : any;
	addFlowNode: any;
	canvasMode: ICanvasMode;
	setConnectiongNodeCanvasMode: setConnectiongNodeCanvasModeFunction;
}

export interface ToolbarState {
	showEditPopup : boolean;
	selectedTask : string;
}

const mapStateToProps = (state : any) => {
	return {
		selectedNode : state.selectedNode,
		canvasMode : state.canvasMode
	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		storeFlow: (flow) => dispatch(storeFlow(flow)),
		storeFlowNode: (node) => dispatch(storeFlowNode(node)),
		addFlowNode: (node) => dispatch(addFlowNode(node)),
		setConnectiongNodeCanvasMode : (enabled : boolean) => dispatch(setConnectiongNodeCanvasMode(enabled))
	}
}

class ContainedToolbar extends React.Component<ToolbarProps, ToolbarState> {

	state = {
		showEditPopup : false,
		selectedTask : ""
	}

	addNode = (e) => {
		e.preventDefault();
		if (!this.props.canvasMode.isConnectingNodes) {
			this.props.addFlowNode({
				name: "task",
				task: this.state.selectedTask || "TraceConsoleTask",
				shapeType: "Circle", 
				x: 50,
				y: 50
			})
		}
		return false;
	}

	editNode = (e) => {
		e.preventDefault();
		if (!this.props.canvasMode.isConnectingNodes) {
			this.setState({showEditPopup : true});
		}
		return false;
	}

	connectNode = (e) => {
		e.preventDefault();
		if (!this.state.showEditPopup) {
			this.props.setConnectiongNodeCanvasMode(!this.props.canvasMode.isConnectingNodes);
		}
		return false;
	}

	onClose = () => {
		this.setState({showEditPopup : false});
	}

	onSelectTask = (taskClassName) => {
		this.setState({selectedTask : taskClassName});
	}

	render() {
		const selectedNode = this.props.selectedNode;
		return <>
			<div className="container-fluid bg-dark sticky-top">
				<div className="container toolbar__container">
					<div className="navbar navbar-expand-lg navbar-dark bg-dark toolbar">
						<form className="form-inline">
							{!!!selectedNode.name && <TaskSelector selectTask={this.onSelectTask}></TaskSelector>}
							{!!!selectedNode.name && <a href="#" onClick={this.addNode} className="mx-2 btn btn-outline-light">Add</a>}
							{!!selectedNode.name && <a href="#" onClick={this.editNode} className="mx-2 btn btn-outline-light">Edit</a>}
							{!!selectedNode.name && <a href="#" onClick={this.connectNode} className={"mx-2 btn " + (this.props.canvasMode.isConnectingNodes ? "btn-light" : "btn-outline-light")}>Connect</a>}
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