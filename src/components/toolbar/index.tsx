import * as React from 'react';
import { connect } from "react-redux";
import { storeFlow, storeFlowNode, addFlowNode, deleteConnection, deleteNode, addNode } from '../../redux/actions/flow-actions';
import { storeRawFlow } from '../../redux/actions/raw-flow-actions';
import { selectNode } from '../../redux/actions/node-actions';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';

import { TaskSelector } from '../task-selector';
import { EditPopup } from '../edit-popup';
import { ShowSchemaPopup } from '../show-schema-popup';
import { ICanvasMode } from '../../redux/reducers/canvas-mode-reducers';
import {
	setConnectiongNodeCanvasMode,
	setConnectiongNodeCanvasModeFunction,
	setSelectedTask,
	setSelectedTaskFunction,
	setShowDependencies,
	setShowDependenciesFunction,
	setAllowInputToHtmlNodes,
	setAllowInputToHtmlNodesFunction
} from '../../redux/actions/canvas-mode-actions';

import fetch from 'cross-fetch';
import { EnumBooleanBody } from '@babel/types';

export interface ToolbarProps {
	flow: any;
	canvasMode: ICanvasMode;
	selectedNode: any;

	storeFlow: any;
	storeFlowNode: any;
	addFlowNode: any;
	addNode: any;
	deleteConnection: any;
	deleteNode: any;
	selectNode: (name, node) => void;
	setConnectiongNodeCanvasMode: setConnectiongNodeCanvasModeFunction;
	setSelectedTask: setSelectedTaskFunction;
	setShowDependencies: setShowDependenciesFunction;
	storeRawFlow: (flow : any) => void;
	setAllowInputToHtmlNodes: setAllowInputToHtmlNodesFunction;
}

export interface ToolbarState {
	showEditPopup: boolean;
	showSchemaPopup: boolean;
	selectedTask: string;
	showDependencies: boolean;
	flowFiles : string[];
	selectedFlow : string;
	allowInputToHtmlNodes: boolean;
}

const mapStateToProps = (state: any) => {
	return {
		selectedNode: state.selectedNode,
		canvasMode: state.canvasMode,
		flow: state.flow
	}
}

const mapDispatchToProps = (dispatch: any) => {
	return {
		setShowDependencies: (showDependencies) => dispatch(setShowDependencies(showDependencies)),
		selectNode: (name, node) => dispatch(selectNode(name, node)),
		storeFlow: (flow) => dispatch(storeFlow(flow)),
		storeFlowNode: (node, orgNodeName) => dispatch(storeFlowNode(node, orgNodeName)),
		addFlowNode: (node) => dispatch(addFlowNode(node)),
		addNode: (node, flow) => dispatch(addNode(node, flow)),
		deleteConnection: (node) => dispatch(deleteConnection(node)),
		deleteNode: (node) => dispatch(deleteNode(node)),
		storeRawFlow: (flow) => dispatch(storeRawFlow(flow)),
		setSelectedTask: (selectedTask: string) => dispatch(setSelectedTask(selectedTask)),
		setConnectiongNodeCanvasMode: (enabled: boolean) => dispatch(setConnectiongNodeCanvasMode(enabled)),
		setAllowInputToHtmlNodes: (allowInputToHtmlNodes) => dispatch(setAllowInputToHtmlNodes(allowInputToHtmlNodes))
	}
}

class ContainedToolbar extends React.Component<ToolbarProps, ToolbarState> {

	state = {
		showEditPopup: false,
		showSchemaPopup: false,
		selectedTask: "",
		showDependencies: false,
		flowFiles: [],
		selectedFlow: "",
		allowInputToHtmlNodes: false
	}

	componentDidMount() {
		this.props.setSelectedTask("");
		this.getFlows();
	}

	getFlows = () => {
		fetch('/get-flows')
		.then(res => {
			if (res.status >= 400) {
				throw new Error("Bad response from server");
			}
			return res.json();
		})
		.then(flows => {
			if (flows.length > 0) {
				this.setState({flowFiles : flows, selectedFlow : flows[0]});
				this.loadFlow(flows[0]);
			}
		})
		.catch(err => {
			console.error(err);
		});
	}

	addNode = (event) => {
		event.preventDefault();
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

	editNode = (event) => {
		event.preventDefault();
		if (!this.props.canvasMode.isConnectingNodes) {
			this.setState({ showEditPopup: true, showSchemaPopup: false });
		}
		return false;
	}

	connectNode = (event) => {
		event.preventDefault();
		if (!this.state.showEditPopup) {
			this.props.setConnectiongNodeCanvasMode(!this.props.canvasMode.isConnectingNodes);
		}
		return false;
	}

	deleteLine = (event) => {
		event.preventDefault();
		this.props.deleteConnection(this.props.selectedNode.node);
		this.props.selectNode(undefined, undefined);

		return false;
	}

	deleteNode = (event) => {
		event.preventDefault();
		this.props.deleteNode(this.props.selectedNode.node);
		this.props.selectNode(undefined, undefined);

		return false;
	}

	markAsUnHappyFlow = (event) => {
		event.preventDefault();
		this.props.storeFlowNode(
			{
				...this.props.selectedNode.node,
				"followflow": "onfailure"
			},
			this.props.selectedNode.node.name);
		return false;
	}

	markAsHappyFlow = (event) => {
		event.preventDefault();
		this.props.storeFlowNode(
			{
				...this.props.selectedNode.node,
				"followflow": "onsuccess"
			},
			this.props.selectedNode.node.name);
		return false;
	}

	saveFlow = (event) => {
		event.preventDefault();
		fetch('/save-flow?flow=' + this.state.selectedFlow, {
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
		this.setState({ showEditPopup: false, showSchemaPopup: false });
	}

	onSelectTask = (taskClassName) => {
		this.setState({ selectedTask: taskClassName });
		this.props.setSelectedTask(taskClassName);
	}

	showSchema = (event) => {
		event.preventDefault();
		if (!this.props.canvasMode.isConnectingNodes) {
			this.setState({ showEditPopup: false, showSchemaPopup: true });
		}
		return false;
	}

	onShowDependenciesChange = (event) => {
		this.setState({
			showDependencies: !this.state.showDependencies
		}, () => {
			this.props.setShowDependencies(this.state.showDependencies);
		});
	}

	onAllowInputToHtmlNodesChange = (event) => {
		this.setState({
			allowInputToHtmlNodes: !this.state.allowInputToHtmlNodes
		}, () => {
			this.props.setAllowInputToHtmlNodes(this.state.allowInputToHtmlNodes);
		});
	}

	loadFlow = (flowName) => {
		fetch('/get-flow?flow=' + flowName)
		.then(res => {
			if (res.status >= 400) {
				throw new Error("Bad response from server");
			}
			return res.json();
		})
		.then(flowPackage => {
			this.props.storeRawFlow(flowPackage);
		})
		.catch(err => {
			console.error(err);
		});
	}

	setSelectedFlow = (event) => {
		this.setState({selectedFlow : event.target.value});
		this.loadFlow(event.target.value);		
	}

	render() {
		const selectedNode = this.props.selectedNode;
		let shapeType = "";
		if (selectedNode && selectedNode.node) {
			shapeType = FlowToCanvas.getShapeType(selectedNode.node.shapeType, selectedNode.node.taskType, selectedNode.node.isStartEnd);
		}
		return <>
			<div className="container-fluid bg-dark sticky-top">
				<div className="container toolbar__container">
					<div className="navbar navbar-expand-lg navbar-dark bg-dark toolbar">
						<form className="form-inline w-100">
							{!!!selectedNode.name && <select className="form-control mr-2" 
								value={this.state.selectedFlow}
								onChange={this.setSelectedFlow}>
								<option value="" disabled>Choose flow</option>
								{this.state.flowFiles.map((flow, index) => {
									return <option key={index} value={flow}>{flow}</option>;
								})}								
							</select>}
							{!!!selectedNode.name && <TaskSelector selectTask={this.onSelectTask}></TaskSelector>}
							{!!!selectedNode.name && <a href="#" onClick={this.addNode} className="mx-2 btn btn-outline-light">Add</a>}
							{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && <a href="#" onClick={this.editNode} className="mx-2 btn btn-outline-light">Edit</a>}
							{!!selectedNode.name && selectedNode.node.shapeType === "Line" && <a href="#" onClick={this.editNode} className="mx-2 btn btn-outline-light">Edit connection</a>}
							{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && <a href="#" onClick={this.connectNode} className={"mx-2 btn " + (this.props.canvasMode.isConnectingNodes ? "btn-light" : "btn-outline-light")}>Connect</a>}
							{!!selectedNode.name && selectedNode.node.shapeType === "Line" && <a href="#" onClick={this.deleteLine} className={"mx-2 btn btn-danger"}>Delete</a>}
							{!!selectedNode.name && selectedNode.node.shapeType === "Line" &&
								selectedNode.node.followflow !== "onfailure" && <a href="#" onClick={this.markAsUnHappyFlow} className={"mx-2 btn btn-outline-danger"}>Mark as unhappy flow</a>}
							{!!selectedNode.name && selectedNode.node.shapeType === "Line" &&
								selectedNode.node.followflow !== "onsuccess" && <a href="#" onClick={this.markAsHappyFlow} className={"mx-2 btn btn-outline-success"}>Mark as happy flow</a>}
							{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && <a href="#" onClick={this.deleteNode} className={"mx-2 btn btn-danger"}>Delete</a>}
							{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && <a href="#" onClick={this.showSchema} className={"mx-2 btn btn-info"}>Show Schema</a>}
							{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && <span className="navbar-text">{selectedNode.name} &nbsp;</span>}
							{!!!selectedNode.name && <><input id="showDependenciesInput" type="checkbox" checked={this.state.showDependencies} onChange={this.onShowDependenciesChange} />
								<label className="text-white" htmlFor="showDependenciesInput">&nbsp;Show dependencies</label>							
								<input className={"ml-2"} id="allowInputToHtmlNodes" type="checkbox" checked={this.state.allowInputToHtmlNodes} onChange={this.onAllowInputToHtmlNodesChange} />
								<label className="text-white" htmlFor="allowInputToHtmlNodes">&nbsp;Allow input to html nodes</label>
							</>}							
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