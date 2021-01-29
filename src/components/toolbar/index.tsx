import * as React from 'react';
import { connect } from "react-redux";
import { storeFlow, storeFlowNode, addFlowNode, deleteConnection, deleteNode } from '../../redux/actions/flow-actions';
import { storeLayout } from '../../redux/actions/layout-actions';
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
	setFlowrunnerPausedFunction,
	setFlowTypeFunction,
	setFlowType,
	setEditorModeFunction,
	setEditorMode,
	setFlowsFunction,
	setFlowsWasm,
	setFlowsPlayground
} from '../../redux/actions/canvas-mode-actions';

import fetch from 'cross-fetch';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { Observable, Subject } from 'rxjs';
import { NewFlow } from '../new-flow';
import { HelpPopup } from '../help-popup';

import Navbar from 'react-bootstrap/Navbar';

/*
	TODO:
		- show flowType in toolbar
		- hide debug ui-controlsbar when flowType is not "playground"
		- "F" is focus on selected node

*/

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
	deleteConnection: any;
	deleteNode: any;

	layout : string;
	storeLayout: (layout : string) => void;

	onEditorMode: (editorMode) => void;

	selectNode: (name, node) => void;
	setConnectiongNodeCanvasMode: setConnectiongNodeCanvasModeFunction;
	setSelectedTask: setSelectedTaskFunction;
	setShowDependencies: setShowDependenciesFunction;
	setFlowrunnerPaused: setFlowrunnerPausedFunction;
	setFlowType: setFlowTypeFunction;
	setEditorMode : setEditorModeFunction;
	setFlowsPlayground : setFlowsFunction;
	setFlowsWasm : setFlowsFunction;

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
		flow: state.flow,
		layout : state.layout
	}
}

const mapDispatchToProps = (dispatch: any) => {
	return {
		setShowDependencies: (showDependencies) => dispatch(setShowDependencies(showDependencies)),
		selectNode: (name, node) => dispatch(selectNode(name, node)),
		storeFlow: (flow) => dispatch(storeFlow(flow)),
		storeFlowNode: (node, orgNodeName) => dispatch(storeFlowNode(node, orgNodeName)),
		addFlowNode: (node) => dispatch(addFlowNode(node)),
		deleteConnection: (node) => dispatch(deleteConnection(node)),
		deleteNode: (node) => dispatch(deleteNode(node)),
		setSelectedTask: (selectedTask: string) => dispatch(setSelectedTask(selectedTask)),
		setConnectiongNodeCanvasMode: (enabled: boolean) => dispatch(setConnectiongNodeCanvasMode(enabled)),
		setFlowrunnerPaused: (paused: boolean) => dispatch(setFlowrunnerPaused(paused)),
		setFlowType: (flowType: string) => dispatch(setFlowType(flowType)),
		setEditorMode: (editorMode : string) => dispatch(setEditorMode(editorMode)),
		storeLayout: (layout : string) => dispatch(storeLayout(layout)),
		setFlowsPlayground : (flows : any[]) => dispatch(setFlowsPlayground(flows)),
		setFlowsWasm : (flows : any[]) => dispatch(setFlowsWasm(flows))
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

	setFlows = (flows : any[], id?: number | string) => {
		if (flows.length > 0) {
			const flowId = (id === undefined) ? flows[0].id : id;

			this.props.setFlowsPlayground(flows.filter((flow)=> {
				return flow.flowType == "playground";
			}).map((flow) => {
				return {
					"label" : flow.name,
					"value" : flow.id
				}
			}));
			
			this.props.setFlowsWasm(flows.filter((flow)=> {
				return flow.flowType == "rustflowrunner";
			}).map((flow) => {
				return {
					"label" : flow.name,
					"value" : flow.id
				}
			}));

			if (this.props.flowrunnerConnector.hasStorageProvider) {
				this.props.flowrunnerConnector.storageProvider?.setSelectedFlow(flowId);
			}
			this.setState({flowFiles : flows, selectedFlow : flowId});
			this.loadFlow(flowId);
		}
	}

	getFlows = (id? : number | string) => {
		if (this.props.flowrunnerConnector.hasStorageProvider) {
			const flows = this.props.flowrunnerConnector.storageProvider?.getFlows();
			this.setFlows(flows as any[], id);
			return;
		};

		fetch('/get-flows')
		.then(res => {
			if (res.status >= 400) {
				throw new Error("Bad response from server");
			}
			return res.json();
		})
		.then(flows => {
			this.setFlows(flows, id);
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
			this.props.addFlowNode(newNode, this.props.flow);
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
			this.props.setConnectiongNodeCanvasMode(true);
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
		fetch('/save-flow?id=' + this.state.selectedFlow, {
			method: "POST",
			body: JSON.stringify({
				flow: this.props.flow,
				layout: JSON.parse(this.props.layout) 
			}),
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
				this.loadFlow(this.state.selectedFlow, true);
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
				this.props.flowrunnerConnector.pushFlowToFlowrunner(this.props.flow, true);
			}
		});
	}

	onCloseNewFlowPopup = (id : number | string, flowType) => {
		this.props.setFlowType(flowType || "playground");
		this.props.flowrunnerConnector.setFlowType(flowType);
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

	loadFlow = (flowId, withoutRefit? : boolean) => {

		if (!withoutRefit) {
			if (this.props.canvasToolbarsubject) {
				setTimeout(() => {
					this.props.canvasToolbarsubject.next("loadFlow");
				}, 5);
			}
		}

		if (this.props.flowrunnerConnector.hasStorageProvider) {
			const flowPackage : any = this.props.flowrunnerConnector.storageProvider?.getFlow(flowId) as any;
			setTimeout(() => {
				this.props.flowrunnerConnector.setFlowType(flowPackage.flowType || "playground");
				this.props.setFlowrunnerPaused(false);
				this.props.setFlowType(flowPackage.flowType || "playground");
				this.props.storeFlow(flowPackage.flow);
				this.props.storeLayout(JSON.stringify(flowPackage.layout));
			}, 500);
			return;
		}

		fetch('/flow?flow=' + flowId)
		.then(res => {
			if (res.status >= 400) {
				throw new Error("Bad response from server");
			}
			return res.json();
		})
		.then(flowPackage => {

			this.props.flowrunnerConnector.setFlowType(flowPackage.flowType || "playground");
			this.props.setFlowrunnerPaused(false);
			this.props.setFlowType(flowPackage.flowType || "playground");
			this.props.storeFlow(flowPackage.flow);
			this.props.storeLayout(JSON.stringify(flowPackage.layout));
			
		})
		.catch(err => {
			console.error(err);
		});
	}

	setSelectedFlow = (event) => {
		this.props.flowrunnerConnector.killAndRecreateWorker();
		this.setState({selectedFlow : event.target.value});
		if (this.props.flowrunnerConnector.hasStorageProvider && 
			this.props.flowrunnerConnector.storageProvider) {
			this.props.flowrunnerConnector.storageProvider.setSelectedFlow(event.target.value);
		}
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

	exportFlowToPng = (event) => {
		event.preventDefault();
		if (this.props.canvasToolbarsubject) {
			this.props.canvasToolbarsubject.next("export");
		}
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

	swithToUIViewEditor = (event) => {
		event.preventDefault();
		this.props.setEditorMode("uiview-editor");
		this.props.onEditorMode("uiview-editor");
		return false;
	}
	swithToCanvasEditor = (event) => {
		event.preventDefault();
		this.props.setEditorMode("canvas");
		this.props.onEditorMode("canvas");
		setTimeout(() => {
			if (this.props.canvasToolbarsubject) {
				this.props.canvasToolbarsubject.next("fitStage");
			}
		}, 50);
		return false;
	}

	render() {
		const selectedNode = this.props.selectedNode;
		let shapeType = "";
		if (selectedNode && selectedNode.node) {
			shapeType = FlowToCanvas.getShapeType(selectedNode.node.shapeType, selectedNode.node.taskType, selectedNode.node.isStartEnd);
		}
		/*
			{!!!selectedNode.name && this.props.canvasMode.editorMode === "canvas" && 
				<TaskSelector flowrunnerConnector={this.props.flowrunnerConnector} selectTask={this.onSelectTask}></TaskSelector>
			}
			{!!!selectedNode.name && this.props.canvasMode.editorMode === "canvas" && 
				<a href="#" onClick={this.addNode} className="mx-2 btn btn-outline-light">Add</a>
			}
		*/
		return <>
			<div className="bg-dark sticky-top toolbar__root">
				<div className="toolbar__container">
					<Navbar bg="dark" expand="lg">
						<div className="navbar navbar-expand-lg navbar-dark bg-dark toolbar w-100">
							<Navbar.Toggle aria-controls="basic-navbar-nav" />
							<Navbar.Collapse id="basic-navbar-nav">
								<form className="form-inline w-100">
									<>
										<select className="form-control mr-2" 
											disabled={!!selectedNode.name || this.props.canvasMode.editorMode !== "canvas"}
											value={this.state.selectedFlow}
											onChange={this.setSelectedFlow}>
											<option value="" disabled>Choose flow</option>
											{this.state.flowFiles.map((flow : IFlowFile, index) => {
												return <option key={index} value={flow.id}>{flow.name}</option>;
											})}								
										</select>
										{!this.props.flowrunnerConnector.hasStorageProvider && <a href="#" onClick={this.addNewFlow} 
											className={"btn-link mr-4 text-light text-decoration-none " + (!!selectedNode.name || this.props.canvasMode.editorMode !== "canvas" ? "disabled" : "") } 
											title="Add new flow"><span>New</span></a>}
										{this.props.flowrunnerConnector.hasStorageProvider && <span className="mr-4"></span>}
									</>
									{this.props.canvasMode.flowType === "playground" && this.props.canvasMode.editorMode === "canvas" && 
										<img title="playground" width="32px" style={{marginLeft:-10,marginRight:10}} src="/svg/game-board-light.svg" />
									}
									{this.props.canvasMode.flowType === "rustflowrunner" && this.props.canvasMode.editorMode === "canvas" && 
										<img title="rust/webassembly flow" width="32px" style={{marginLeft:-10,marginRight:10}} src="/svg/webassembly.svg" />
									}
									
									{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && 
										<a href="#" onClick={this.editNode} className="mx-2 btn btn-outline-light">Edit</a>
									}
									{!!selectedNode.name && selectedNode.node.shapeType === "Line" && 
										<a href="#" onClick={this.editNode} className="mx-2 btn btn-outline-light">Edit connection</a>
									}
									{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && 
										<a href="#" onClick={this.connectNode} className={"mx-2 btn " + (this.props.canvasMode.isConnectingNodes ? "btn-light" : "btn-outline-light")}>Connect</a>
									}
									{!!selectedNode.name && selectedNode.node.shapeType === "Line" && 
										<a href="#" onClick={this.deleteLine} className={"mx-2 btn btn-danger"}>Delete</a>
									}
									{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && 
										<a href="#" onClick={this.helpNode} className="mx-2 btn btn-outline-light">Help</a>
									}

									{!!selectedNode.name && selectedNode.node.shapeType === "Line" &&
										selectedNode.node.followflow !== "onfailure" && 
											<a href="#" onClick={this.markAsUnHappyFlow} className={"mx-2 btn btn-outline-danger"}>Mark as unhappy flow</a>
									}
									{!!selectedNode.name && selectedNode.node.shapeType === "Line" &&
										selectedNode.node.followflow !== "onsuccess" && 
											<a href="#" onClick={this.markAsHappyFlow} className={"mx-2 btn btn-outline-success"}>Mark as happy flow</a>
									}
									{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && 
										<a href="#" onClick={this.deleteNode} className={"mx-2 btn btn-danger"}>Delete</a>
									}
									{!!selectedNode.name && selectedNode.node.shapeType !== "Line" && 
										<a href="#" onClick={this.showSchema} className={"mx-2 btn btn-info"}>Show Schema</a>
									}
									{!!!selectedNode.name && this.props.canvasMode.editorMode === "canvas" && <>
										<input id="showDependenciesInput" type="checkbox" checked={this.state.showDependencies} onChange={this.onShowDependenciesChange} />
										<label className="text-white" htmlFor="showDependenciesInput">&nbsp;Show dependencies</label>								
									</>}
									{!!this.props.hasRunningFlowRunner && 
									 this.props.canvasMode.editorMode === "canvas" &&
									 this.props.canvasMode.flowType == "playground" && 
									 	<a href="#" onClick={this.onSetPausedClick} className="ml-2 pause-button">{!!this.props.canvasMode.isFlowrunnerPaused ? "paused":"pause"}</a>
									}							
									{this.props.canvasMode.editorMode === "canvas" && 
										<a href="#" onClick={this.fitStage} className="ml-2 btn btn-outline-light">Fit stage</a>
									}
									{!this.props.flowrunnerConnector.hasStorageProvider && <a href="#" onClick={this.saveFlow} className="ml-2 btn btn-primary">Save</a>}
									<span className="ml-auto"></span>
									{this.props.canvasMode.flowType == "playground" && 
										<a href={"/ui/" + this.state.selectedFlow} className="ml-2">UI View</a>
									}
									{!!!selectedNode.name &&
									 this.props.canvasMode.flowType == "playground" &&
									 this.props.canvasMode.editorMode == "canvas" &&
										<a href="#" onClick={this.swithToUIViewEditor} className="ml-2">Edit UI View</a>
									}
									{this.props.canvasMode.flowType == "playground" &&
									 this.props.canvasMode.editorMode != "canvas" &&
										<a href="#" onClick={this.swithToCanvasEditor} className="ml-2">Edit Flow</a>
									}
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
// <a href="#" onClick={this.exportFlowToPng} className="ml-2">Export png</a>
		
export const Toolbar = connect(mapStateToProps, mapDispatchToProps)(ContainedToolbar);