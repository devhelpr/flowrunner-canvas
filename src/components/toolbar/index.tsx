import * as React from 'react';
import { connect } from "react-redux";
import { storeFlow, storeFlowNode, addFlowNode, deleteConnection, deleteNode, addNode } from '../../redux/actions/flow-actions';
import { storeRawFlow } from '../../redux/actions/raw-flow-actions';
import { selectNode } from '../../redux/actions/node-actions';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { getNewNode } from '../../helpers/flow-methods';
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
	setFlowrunnerPaused,
	setFlowrunnerPausedFunction
} from '../../redux/actions/canvas-mode-actions';

import fetch from 'cross-fetch';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { Observable, Subject } from '@reactivex/rxjs';
import { NewFlow } from '../new-flow';
import { HelpPopup } from '../help-popup';
import { addRawFlow, deleteRawConnection, deleteRawNode, storeRawNode } from '../../redux/actions/raw-flow-actions';

import Navbar from 'react-bootstrap/Navbar';

export interface IFlowFile {
	name: string;
	id : number;
}

export interface ToolbarProps {
	flow: any;
	canvasMode: ICanvasMode;
	selectedNode: any;
	canvasToolbarsubject : Subject<string>;
	hasRunningFlowRunner: boolean;

	storeFlow: any;
	storeFlowNode: any;
	addFlowNode: any;
	addNode: any;
	addRawFlow: any;
	deleteConnection: any;
	deleteNode: any;
	deleteRawConnection: any;
	deleteRawNode: any;
	storeRawNode: any;

	selectNode: (name, node) => void;
	setConnectiongNodeCanvasMode: setConnectiongNodeCanvasModeFunction;
	setSelectedTask: setSelectedTaskFunction;
	setShowDependencies: setShowDependenciesFunction;
	setFlowrunnerPaused: setFlowrunnerPausedFunction;
	storeRawFlow: (flow : any) => void;
	flowrunnerConnector : IFlowrunnerConnector;
}

export interface ToolbarState {
	showEditPopup: boolean;
	showSchemaPopup: boolean;
	selectedTask: string;
	showDependencies: boolean;
	showNewFlow: boolean;
	flowFiles : string[];
	selectedFlow : string;
	showTaskHelp: boolean;
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
		addRawFlow: (node) => dispatch(addRawFlow(node)),
		deleteConnection: (node) => dispatch(deleteConnection(node)),
		deleteNode: (node) => dispatch(deleteNode(node)),
		deleteRawConnection: (node) => dispatch(deleteRawConnection(node)),
		deleteRawNode: (node) => dispatch(deleteRawNode(node)),
		storeRawNode: (node, orgNodeName) => dispatch(storeRawNode(node, orgNodeName)),
		storeRawFlow: (flow) => dispatch(storeRawFlow(flow)),
		setSelectedTask: (selectedTask: string) => dispatch(setSelectedTask(selectedTask)),
		setConnectiongNodeCanvasMode: (enabled: boolean) => dispatch(setConnectiongNodeCanvasMode(enabled)),
		setFlowrunnerPaused: (paused: boolean) => dispatch(setFlowrunnerPaused(paused))
	}
}

class ContainedToolbar extends React.Component<ToolbarProps, ToolbarState> {

	state = {
		showEditPopup: false,
		showSchemaPopup: false,
		showNewFlow: false,
		selectedTask: "",
		showDependencies: false,
		flowFiles: [],
		selectedFlow: "",
		showTaskHelp: false
	}

	componentDidMount() {
		this.props.setSelectedTask("");
		this.getFlows();
	}

	getFlows = (id? : number) => {
		fetch('/get-flows')
		.then(res => {
			if (res.status >= 400) {
				throw new Error("Bad response from server");
			}
			return res.json();
		})
		.then(flows => {
			if (flows.length > 0) {
				const flowId = isNaN(id as number) ? flows[0].id : id;
				this.setState({flowFiles : flows, selectedFlow : flowId});
				this.loadFlow(flowId);
			}
		})
		.catch(err => {
			console.error(err);
		});
	}

	addNewFlow = (event) => {
		event.preventDefault();
		this.setState({showNewFlow : true});
		return false;
	}

	addNode = (event) => {
		event.preventDefault();
		if (!this.props.canvasMode.isConnectingNodes) {

			let newNode = getNewNode({
				name: this.state.selectedTask,
				id: this.state.selectedTask,
				taskType: this.state.selectedTask || "TraceConsoleTask",
				shapeType: this.state.selectedTask == "IfConditionTask" ? "Diamond" : "Circle",
				x: 50,
				y: 50
			},this.props.flow);
			this.props.addNode(newNode, this.props.flow);
			this.props.addRawFlow(newNode);
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

		console.log("connectNode connect button oldstate", this.props.canvasMode.isConnectingNodes, this.props.selectedNode);

		if (!this.state.showEditPopup) {
			this.props.setConnectiongNodeCanvasMode(true);
			console.log("connectNode connect button newstate", this.props.canvasMode.isConnectingNodes, this.props.selectedNode);
		}
		return false;
	}

	deleteLine = (event) => {
		event.preventDefault();
		this.props.deleteConnection(this.props.selectedNode.node);
		this.props.deleteRawConnection(this.props.selectedNode.node);
		this.props.selectNode(undefined, undefined);

		return false;
	}

	deleteNode = (event) => {
		event.preventDefault();
		this.props.deleteNode(this.props.selectedNode.node);
		this.props.deleteRawNode(this.props.selectedNode.node);
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
		this.props.storeRawNode(
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
		this.props.storeRawNode(
			{
				...this.props.selectedNode.node,
				"followflow": "onfailure"
			},
			this.props.selectedNode.node.name);
		return false;
	}

	saveFlow = (event) => {
		event.preventDefault();
		//this.props.flowrunnerConnector.pushFlowToFlowrunner(this.props.flow);
		fetch('/save-flow?id=' + this.state.selectedFlow, {
			method: "POST",
			body: JSON.stringify({flow:this.props.flow}),
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
				this.loadFlow(this.state.selectedFlow);
			})
			.catch(err => {
				console.error(err);
			});
		return false;
	}

	onClose = (pushFlow? : boolean) => {
		this.setState({
			showEditPopup: false,
			showSchemaPopup: false,
			showNewFlow: false 
		}, () => {
			if (!!pushFlow) {
				this.props.setFlowrunnerPaused(false);
				this.props.flowrunnerConnector.pushFlowToFlowrunner(this.props.flow);
			}
		});
	}

	onCloseNewFlowPopup = (id : number) => {
		this.setState({
			showEditPopup: false,
			showSchemaPopup: false,
			showNewFlow: false 
		}, () => {
			this.getFlows(id);
		});
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

	loadFlow = (flowId) => {
		fetch('/flow?flow=' + flowId)
		.then(res => {
			if (res.status >= 400) {
				throw new Error("Bad response from server");
			}
			return res.json();
		})
		.then(flowPackage => {
			this.props.setFlowrunnerPaused(false);
			this.props.flowrunnerConnector.pushFlowToFlowrunner(flowPackage);
			
			this.props.storeRawFlow(flowPackage);

			if (this.props.canvasToolbarsubject) {
				//this.props.canvasToolbarsubject.next("reload");
			}
			setTimeout(() => {
				if (this.props.canvasToolbarsubject) {
					//this.props.canvasToolbarsubject.next("fitStage");
					//this.props.canvasToolbarsubject.next("reload");
				}
			}, 1000);
			
		})
		.catch(err => {
			console.error(err);
		});
	}

	setSelectedFlow = (event) => {
		this.setState({selectedFlow : event.target.value});
		this.loadFlow(event.target.value);		
	}

	onSetPausedClick = (event) => {
		event.preventDefault();
		if (this.props.canvasMode.isFlowrunnerPaused) {
			this.props.flowrunnerConnector.resumeFlowrunner();
		} else {
			this.props.flowrunnerConnector.pauseFlowrunner();
		}
		this.props.setFlowrunnerPaused(!this.props.canvasMode.isFlowrunnerPaused);
		return false;
	}

	fitStage = (event) => {
		event.preventDefault();
		if (this.props.canvasToolbarsubject) {
			this.props.canvasToolbarsubject.next("fitStage");
		}
		return false;
	}

	helpNode = (event) => {
		event.preventDefault();
		this.setState({showTaskHelp : true});
		return false;
	}

	render() {
		const selectedNode = this.props.selectedNode;
		let shapeType = "";
		if (selectedNode && selectedNode.node) {
			shapeType = FlowToCanvas.getShapeType(selectedNode.node.shapeType, selectedNode.node.taskType, selectedNode.node.isStartEnd);
		}
		return <>
			<div className="bg-dark sticky-top toolbar__root">
				<div className="toolbar__container">
					<Navbar bg="dark" expand="lg">
						<div className="navbar navbar-expand-lg navbar-dark bg-dark toolbar">
							<Navbar.Toggle aria-controls="basic-navbar-nav" />
							<Navbar.Collapse id="basic-navbar-nav">
								<form className="form-inline w-100">
									{!!!selectedNode.name && <>
										<select className="form-control mr-2" 
											value={this.state.selectedFlow}
											onChange={this.setSelectedFlow}>
											<option value="" disabled>Choose flow</option>
											{this.state.flowFiles.map((flow : IFlowFile, index) => {
												return <option key={index} value={flow.id}>{flow.name}</option>;
											})}								
										</select>
										<a href="#" onClick={this.addNewFlow} className="mr-4 text-light text-decoration-none" title="Add new flow"><span>New</span></a>
									</>}
									{!!!selectedNode.name && <TaskSelector flowrunnerConnector={this.props.flowrunnerConnector} selectTask={this.onSelectTask}></TaskSelector>}
									{!!!selectedNode.name && <a href="#" onClick={this.addNode} className="mx-2 btn btn-outline-light">Add</a>}
									{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && <a href="#" onClick={this.editNode} className="mx-2 btn btn-outline-light">Edit</a>}
									{!!selectedNode.name && selectedNode.node.shapeType === "Line" && <a href="#" onClick={this.editNode} className="mx-2 btn btn-outline-light">Edit connection</a>}
									{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && <a href="#" onClick={this.connectNode} className={"mx-2 btn " + (this.props.canvasMode.isConnectingNodes ? "btn-light" : "btn-outline-light")}>Connect</a>}
									{!!selectedNode.name && selectedNode.node.shapeType === "Line" && <a href="#" onClick={this.deleteLine} className={"mx-2 btn btn-danger"}>Delete</a>}
									{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && <a href="#" onClick={this.helpNode} className="mx-2 btn btn-outline-light">Help</a>}

									{!!selectedNode.name && selectedNode.node.shapeType === "Line" &&
										selectedNode.node.followflow !== "onfailure" && <a href="#" onClick={this.markAsUnHappyFlow} className={"mx-2 btn btn-outline-danger"}>Mark as unhappy flow</a>}
									{!!selectedNode.name && selectedNode.node.shapeType === "Line" &&
										selectedNode.node.followflow !== "onsuccess" && <a href="#" onClick={this.markAsHappyFlow} className={"mx-2 btn btn-outline-success"}>Mark as happy flow</a>}
									{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && <a href="#" onClick={this.deleteNode} className={"mx-2 btn btn-danger"}>Delete</a>}
									{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && <a href="#" onClick={this.showSchema} className={"mx-2 btn btn-info"}>Show Schema</a>}
									{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && <span className="navbar-text">{selectedNode.name} &nbsp;</span>}
									{!!!selectedNode.name && <><input id="showDependenciesInput" type="checkbox" checked={this.state.showDependencies} onChange={this.onShowDependenciesChange} />
										<label className="text-white" htmlFor="showDependenciesInput">&nbsp;Show dependencies</label>								
									</>}
									{!!this.props.hasRunningFlowRunner && <a href="#" onClick={this.onSetPausedClick} className="ml-2 pause-button">{!!this.props.canvasMode.isFlowrunnerPaused ? "paused":"pause"}</a>}							
									<a href="#" onClick={this.fitStage} className="ml-2 btn btn-outline-light">Fit stage</a>
									<a href="#" onClick={this.saveFlow} className="ml-2 btn btn-primary">Save</a>
								</form>
							</Navbar.Collapse>
						</div>
					</Navbar>
				</div>
			</div>
			{this.state.showEditPopup && <EditPopup flowrunnerConnector={this.props.flowrunnerConnector} onClose={this.onClose}></EditPopup>}
			{this.state.showSchemaPopup && <ShowSchemaPopup onClose={this.onClose}></ShowSchemaPopup>}
			{this.state.showNewFlow && <NewFlow onClose={this.onClose} onSave={this.onCloseNewFlowPopup}></NewFlow>}
			{this.state.showTaskHelp && <HelpPopup taskName={selectedNode && selectedNode.node ? selectedNode.node.taskType : ""}></HelpPopup>}
		</>
			}
		
		}
		
export const Toolbar = connect(mapStateToProps, mapDispatchToProps)(ContainedToolbar);