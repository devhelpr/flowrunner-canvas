import * as React from 'react';
import { connect } from "react-redux";
import { storeFlow, storeFlowNode, addFlowNode, deleteConnection, deleteNode } from '../../redux/actions/flow-actions';
import { selectNode } from '../../redux/actions/node-actions';
import { TaskSelector } from '../task-selector';
import { EditPopup } from '../edit-popup';
import { ICanvasMode } from '../../redux/reducers/canvas-mode-reducers';
import { setConnectiongNodeCanvasMode , setConnectiongNodeCanvasModeFunction } from '../../redux/actions/canvas-mode-actions';
import fetch from 'cross-fetch';

export interface ToolbarProps {
	flow: any;
	canvasMode: ICanvasMode;
	selectedNode : any;

	storeFlow : any;
	storeFlowNode: any;
	addFlowNode: any;
	deleteConnection: any;
	deleteNode : any;
	selectNode : (name, node) => void;
	setConnectiongNodeCanvasMode: setConnectiongNodeCanvasModeFunction;
}

export interface ToolbarState {
	showEditPopup : boolean;
	selectedTask : string;
}

const mapStateToProps = (state : any) => {
	return {
		selectedNode : state.selectedNode,
		canvasMode : state.canvasMode,
		flow: state.flow
	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		selectNode: (name, node) => dispatch(selectNode(name, node)),
		storeFlow: (flow) => dispatch(storeFlow(flow)),
		storeFlowNode: (node) => dispatch(storeFlowNode(node)),
		addFlowNode: (node) => dispatch(addFlowNode(node)),
		deleteConnection: (node) => dispatch(deleteConnection(node)),
		deleteNode:  (node) => dispatch(deleteNode(node)),
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
				name: this.state.selectedTask,
				id: this.state.selectedTask,
				taskType: this.state.selectedTask || "TraceConsoleTask",
				shapeType: this.state.selectedTask == "IfConditionTask" ? "Diamond" : "Circle", 
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

	deleteLine = (e) => {
		e.preventDefault();
		this.props.deleteConnection(this.props.selectedNode.node);
		this.props.selectNode(undefined, undefined);

		return false;
	}

	deleteNode = (e) => {
		e.preventDefault();
		this.props.deleteNode(this.props.selectedNode.node);
		this.props.selectNode(undefined, undefined);

		return false;
	}

	saveFlow = (e) => {
		e.preventDefault();
		fetch('/save-flow', {
			method: "POST",
			body: JSON.stringify(this.props.flow),
			headers: {
			  "Content-Type": "application/json"
			}
		  })
		.then(res => {
			if (res.status >= 400) {
				throw new Error("Bad response from server");
			}
			return res.json();
		})
		.then(status => {
			console.log(status);
		})
		.catch(err => {
			console.error(err);
		});
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
						<form className="form-inline w-100">
							{!!!selectedNode.name && <TaskSelector selectTask={this.onSelectTask}></TaskSelector>}
							{!!!selectedNode.name && <a href="#" onClick={this.addNode} className="mx-2 btn btn-outline-light">Add</a>}
							{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && <a href="#" onClick={this.editNode} className="mx-2 btn btn-outline-light">Edit</a>}
							{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && <a href="#" onClick={this.connectNode} className={"mx-2 btn " + (this.props.canvasMode.isConnectingNodes ? "btn-light" : "btn-outline-light")}>Connect</a>}
							{!!selectedNode.name && selectedNode.node.shapeType === "Line" && <a href="#" onClick={this.deleteLine} className={"mx-2 btn btn-danger"}>Delete</a>}
							{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && <a href="#" onClick={this.deleteNode} className={"mx-2 btn btn-danger"}>Delete</a>}
							{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && <span className="navbar-text">{selectedNode.name}</span>}
							<a href="#" onClick={this.saveFlow} className="ml-auto btn btn-primary">Save</a>
						</form>
					</div>
				</div>
			</div>
			{this.state.showEditPopup && <EditPopup onClose={this.onClose}></EditPopup>}
		</>
	}

}

export const Toolbar = connect(mapStateToProps, mapDispatchToProps)(ContainedToolbar);