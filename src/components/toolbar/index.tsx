import * as React from 'react';
import { connect } from "react-redux";
import { storeFlow, storeFlowNode, addFlowNode, deleteConnection, deleteNode, addNode } from '../../redux/actions/flow-actions';
import { selectNode } from '../../redux/actions/node-actions';
import { TaskSelector } from '../task-selector';
import { EditPopup } from '../edit-popup';
import { ShowSchemaPopup } from '../show-schema-popup';
import { ICanvasMode } from '../../redux/reducers/canvas-mode-reducers';
import { 
	setConnectiongNodeCanvasMode , 
	setConnectiongNodeCanvasModeFunction, 
	setSelectedTask,
	setSelectedTaskFunction 
} from '../../redux/actions/canvas-mode-actions';

import fetch from 'cross-fetch';

export interface ToolbarProps {
	flow: any;
	canvasMode: ICanvasMode;
	selectedNode : any;

	storeFlow : any;
	storeFlowNode: any;
	addFlowNode: any;
	addNode : any;
	deleteConnection: any;
	deleteNode : any;
	selectNode : (name, node) => void;
	setConnectiongNodeCanvasMode: setConnectiongNodeCanvasModeFunction;
	setSelectedTask: setSelectedTaskFunction;
}

export interface ToolbarState {
	showEditPopup : boolean;
	showSchemaPopup : boolean;
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
		storeFlowNode: (node, orgNodeName) => dispatch(storeFlowNode(node, orgNodeName)),
		addFlowNode: (node) => dispatch(addFlowNode(node)),
		addNode: (node, flow) => dispatch(addNode(node, flow)),
		deleteConnection: (node) => dispatch(deleteConnection(node)),
		deleteNode:  (node) => dispatch(deleteNode(node)),
		setSelectedTask : (selectedTask : string) => dispatch(setSelectedTask(selectedTask)),
		setConnectiongNodeCanvasMode : (enabled : boolean) => dispatch(setConnectiongNodeCanvasMode(enabled))
	}
}

class ContainedToolbar extends React.Component<ToolbarProps, ToolbarState> {

	state = {
		showEditPopup : false,
		showSchemaPopup : false,
		selectedTask : ""
	}

	componentDidMount() {
		this.props.setSelectedTask("");
	}

	addNode = (e) => {
		e.preventDefault();
		if (!this.props.canvasMode.isConnectingNodes) {
			this.props.addNode({
				name: this.state.selectedTask,
				id: this.state.selectedTask,
				taskType: this.state.selectedTask || "TraceConsoleTask",
				shapeType: this.state.selectedTask == "IfConditionTask" ? "Diamond" : "Circle", 
				x: 50,
				y: 50
			}, this.props.flow);
		}
		return false;
	}

	editNode = (e) => {
		e.preventDefault();
		if (!this.props.canvasMode.isConnectingNodes) {
			this.setState({showEditPopup : true, showSchemaPopup : false});
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

	markAsUnHappyFlow = (e) => {
		e.preventDefault();
		this.props.storeFlowNode(
			{...this.props.selectedNode.node, 
				"followflow" : "onfailure"
			}, 
			this.props.selectedNode.node.name);
		return false;
	}

	markAsHappyFlow = (e) => {
		e.preventDefault();
		this.props.storeFlowNode(
			{...this.props.selectedNode.node, 
				"followflow" : "onsuccess"
			}, 
			this.props.selectedNode.node.name);
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
		this.setState({showEditPopup : false, showSchemaPopup : false});
	}

	onSelectTask = (taskClassName) => {
		this.setState({selectedTask : taskClassName});
		this.props.setSelectedTask(taskClassName);
	}

	showSchema = (e) => {
		e.preventDefault();
		if (!this.props.canvasMode.isConnectingNodes) {
			this.setState({showEditPopup : false, showSchemaPopup : true});
		}
		return false;
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
							{!!selectedNode.name && selectedNode.node.shapeType === "Line" && 
								selectedNode.node.followflow !== "onfailure" && <a href="#" onClick={this.markAsUnHappyFlow} className={"mx-2 btn btn-outline-danger"}>Mark as unhappy flow</a>}
							{!!selectedNode.name && selectedNode.node.shapeType === "Line" && 
								selectedNode.node.followflow !== "onsuccess" && <a href="#" onClick={this.markAsHappyFlow} className={"mx-2 btn btn-outline-success"}>Mark as happy flow</a>}
							{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && <a href="#" onClick={this.deleteNode} className={"mx-2 btn btn-danger"}>Delete</a>}
							{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && <a href="#" onClick={this.showSchema} className={"mx-2 btn btn-info"}>Show Schema</a>}
							{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && <span className="navbar-text">{selectedNode.name}</span>}
							<a href="#" onClick={this.saveFlow} className="ml-auto btn btn-primary">Save</a>
						</form>
					</div>
				</div>
			</div>
			{this.state.showEditPopup && <EditPopup onClose={this.onClose}></EditPopup>}
			{this.state.showSchemaPopup && <ShowSchemaPopup onClose={this.onClose}></ShowSchemaPopup>}
		</>
	}

}

export const Toolbar = connect(mapStateToProps, mapDispatchToProps)(ContainedToolbar);