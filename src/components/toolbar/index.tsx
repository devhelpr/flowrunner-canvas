import * as React from 'react';
import { useEffect, useState, useCallback, useRef } from 'react';

import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { getNewNode } from '../../helpers/flow-methods';
import { EditPopup } from '../edit-popup';
//import { ShowSchemaPopup } from '../show-schema-popup';

import fetch from 'cross-fetch';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { Observable, Subject } from 'rxjs';
import { NewFlow } from '../new-flow';
import { HelpPopup } from '../help-popup';
import { ModulesPopup } from '../modules-popup';

import Navbar from 'react-bootstrap/Navbar';

import { useFlowStore} from '../../state/flow-state';
import { PopupEnum, useCanvasModeStateStore} from '../../state/canvas-mode-state';
import { useSelectedNodeStore} from '../../state/selected-node-state';
import { useLayoutStore } from '../../state/layout-state';
import { useModulesStateStore } from '../../state/modules-menu-state';

import { getPosition } from '../../services/position-service';

import { NamePopup } from '../popups/name-popup';
import * as uuid from 'uuid';

const uuidV4 = uuid.v4;


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
	
	canvasToolbarsubject : Subject<string>;
	hasRunningFlowRunner: boolean;

	onEditorMode: (editorMode) => void;

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

export const Toolbar = (props: ToolbarProps) => {
	const [showModulesPopup, setShowModulesPopup]	= useState(false);
	const [showEditPopup, setShowEditPopup]	= useState(false);
	const [showSchemaPopup, setShowSchemaPopup]	= useState(false);
	const [showNewFlow, setShowNewFlow]	= useState(false);
	const [selectedTask, setSelectedTask]	= useState("");
	const [showDependencies, setShowDependencies]	= useState(false);
	const [flowFiles, setFlowFiles]	= useState([] as any[]);
	const [selectedFlow, setSelectedFlow]	= useState("");
	const [showTaskHelp, setShowTaskHelp]	= useState(false);

	const flow = useFlowStore();
	const canvasMode = useCanvasModeStateStore();
	const selectedNode = useSelectedNodeStore();
	const layout = useLayoutStore();
	const modulesMenu = useModulesStateStore();

	useEffect(() => {
		canvasMode.setSelectedTask("");
		getFlows();
	}, []);

	useEffect(() => {
		canvasMode.setSelectedTask("");
		getFlows();
	}, [canvasMode.flowsUpdateId]);

	useEffect(() => {
		if (modulesMenu.selectedModule == "tests") {
			setShowModulesPopup(true);
		} else if (modulesMenu.selectedModule != "") {
			setShowModulesPopup(true);
		} else {
			setShowModulesPopup(false);
		}
	}, [modulesMenu.selectedModule]);
	

	const setFlows = (flows : any[], id?: number | string) => {
		if (flows.length > 0) {
			const flowId = (id === undefined) ? flows[0].id : id;

			canvasMode.setFlowsPlayground(flows.filter((flow)=> {
				return flow.flowType == "playground";
			}).map((flow) => {
				return {
					"label" : flow.name,
					"value" : flow.id
				}
			}));
			
			canvasMode.setFlowsWasm(flows.filter((flow)=> {
				return flow.flowType == "rustflowrunner";
			}).map((flow) => {
				return {
					"label" : flow.name,
					"value" : flow.id
				}
			}));

			if (props.flowrunnerConnector.hasStorageProvider) {
				props.flowrunnerConnector.storageProvider?.setSelectedFlow(flowId);
			}
			setFlowFiles(flows);
			setSelectedFlow(flowId);
			loadFlow(flowId);
		}
	}

	const getFlows = (id? : number | string) => {
		if (props.flowrunnerConnector.hasStorageProvider) {
			const flows = props.flowrunnerConnector.storageProvider?.getFlows();
			setFlows(flows as any[], id);
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
			setFlows(flows, id);
		})
		.catch(err => {
			console.error(err);
		});
	}

	const addNewFlow = (event) => {
		event.preventDefault();
		setShowNewFlow(true);
		return false;
	}

	const onSavePresetName = (name) => {
		if (canvasMode.onPresetName) {
			canvasMode.onPresetName(name);
		}
		canvasMode.setCurrentPopup(PopupEnum.none, undefined);
		return false;		
	}
	const onCloseNamePopup = () => {
		canvasMode.setCurrentPopup(PopupEnum.none, undefined);
		return false;		
	}

	const addNode = (event) => {
		event.preventDefault();
		if (!canvasMode.isConnectingNodes) {

			let newNode = getNewNode({
				name: selectedTask,
				id: selectedTask,
				taskType: selectedTask || "TraceConsoleTask",
				shapeType: selectedTask == "IfConditionTask" ? "Diamond" : "Circle",
				x: 50,
				y: 50
			},flow.flow);
			flow.addFlowNode(newNode);
		}
		return false;
	}

	const editNode = (event) => {
		event.preventDefault();
		if (!canvasMode.isConnectingNodes) {
			setShowEditPopup(true);
			setShowSchemaPopup(false);
		}
		return false;
	}

	const connectNode = (event) => {
		event.preventDefault();
		if (!showEditPopup) {
			canvasMode.setConnectiongNodeCanvasMode(true);
		}
		return false;
	}

	const deleteLine = (event) => {
		event.preventDefault();
		flow.deleteConnection(selectedNode.node);
		selectedNode.selectNode("", undefined);

		return false;
	}

	const deleteNode = (event) => {
		event.preventDefault();
		flow.deleteNode(selectedNode.node);
		selectedNode.selectNode("", undefined);

		return false;
	}

	const markAsUnHappyFlow = (event) => {
		event.preventDefault();
		flow.storeFlowNode(
			{
				...selectedNode.node.node,
				"followflow": "onfailure"
			},
			selectedNode.node.name);
		return false;
	}

	const markAsHappyFlow = (event) => {
		event.preventDefault();
		flow.storeFlowNode(
			{
				...selectedNode.node.node,
				"followflow": "onsuccess"
			},
			selectedNode.node.name);		
		return false;
	}

	const saveFlow = (event) => {
		event.preventDefault();
		const flowAndUpdatedPositions = flow.flow.map((node) => {
			let updatedNode = {...node};
			if (node.x && node.y && node.shapeType !== "Line") {
				const position = getPosition(node.name);
				updatedNode.x = position.x;
				updatedNode.y = position.y;
			} else if (node.xstart && node.ystart  && node.shapeType === "Line") {
				const position = getPosition(node.name);
				
				updatedNode.xstart = position.xstart;
				updatedNode.ystart = position.ystart;
				updatedNode.xend = position.xend;
				updatedNode.yend = position.yend;
			}
			return updatedNode;
		});
		fetch('/save-flow?id=' + selectedFlow, {
			method: "POST",
			body: JSON.stringify({
				flow: flowAndUpdatedPositions,
				layout: JSON.parse(layout.layout),
				flowType: canvasMode.flowType
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
				loadFlow(selectedFlow, true);
			})
			.catch(err => {
				console.error(err);
			});
		return false;
	}

	const onClose = (pushFlow? : boolean) => {
		setShowEditPopup(false);
		setShowSchemaPopup(false);
		setShowNewFlow(false);
		setShowModulesPopup(false);

		if (!!pushFlow) {
			canvasMode.setFlowrunnerPaused(false);
			props.flowrunnerConnector.pushFlowToFlowrunner(flow.flow, true, flow.flowId);
		}
	}

	const onCloseModulesPopup = () => {

		modulesMenu.showModule("");
		modulesMenu.setOpen(false);

		setShowEditPopup(false);
		setShowSchemaPopup(false);
		setShowNewFlow(false);
		setShowModulesPopup(false);		
	}

	const onCloseNewFlowPopup = (id : number | string, flowType) => {
		canvasMode.setFlowType(flowType || "playground");
		props.flowrunnerConnector.setFlowType(flowType);

		setShowEditPopup(false);
		setShowSchemaPopup(false);
		setShowNewFlow(false);
		setShowModulesPopup(false);

		getFlows(id);
	}

	const onSelectTask = (taskClassName) => {
		setSelectedTask(taskClassName);
		canvasMode.setSelectedTask(taskClassName);
	}

	const showSchema = (event) => {
		event.preventDefault();
		if (!canvasMode.isConnectingNodes) {
			setShowEditPopup(false);
			setShowSchemaPopup(true);
		}
		return false;
	}

	const onShowDependenciesChange = (event) => {
		canvasMode.setShowDependencies(!showDependencies);
		setShowDependencies(!showDependencies);		
	}

	const loadFlow = (flowId, withoutRefit? : boolean) => {

		if (!withoutRefit) {
			if (props.canvasToolbarsubject) {
				setTimeout(() => {
					props.canvasToolbarsubject.next("loadFlow");
				}, 5);
			}
		}

		if (props.flowrunnerConnector.hasStorageProvider) {
			const flowPackage : any = props.flowrunnerConnector.storageProvider?.getFlow(flowId) as any;
			setTimeout(() => {
				props.flowrunnerConnector.setFlowType(flowPackage.flowType || "playground");
				canvasMode.setFlowrunnerPaused(false);
				canvasMode.setFlowType(flowPackage.flowType || "playground");
				flow.storeFlow(flowPackage.flow, flowId);
				layout.storeLayout(JSON.stringify(flowPackage.layout));
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
			console.log("FLOW loaded 1", flowId , performance.now());

			props.flowrunnerConnector.setFlowType(flowPackage.flowType || "playground");
			console.log("FLOW loaded 2", flowId , performance.now());
			
			canvasMode.setFlowrunnerPaused(false);
			console.log("FLOW loaded 3", flowId , performance.now());
			
			canvasMode.setFlowType(flowPackage.flowType || "playground");
			console.log("FLOW loaded 4", flowId , performance.now());
			
			flow.storeFlow(flowPackage.flow, flowId);
			console.log("FLOW loaded 5", flowId , performance.now());
			
			layout.storeLayout(JSON.stringify(flowPackage.layout));
	
			console.log("FLOW loaded after zustand", flowId , performance.now());
		})
		.catch(err => {
			console.error(err);
		});
	}

	const setSelectedFlowChange = (event) => {
		console.log("FLOW selected",event.target.value,performance.now());
		props.flowrunnerConnector.killAndRecreateWorker();
		setSelectedFlow(event.target.value);
		if (props.flowrunnerConnector.hasStorageProvider && 
			props.flowrunnerConnector.storageProvider) {
			props.flowrunnerConnector.storageProvider.setSelectedFlow(event.target.value);
		}
		loadFlow(event.target.value);		
	}

	const onSetPausedClick = (event) => {
		event.preventDefault();
		if (canvasMode.isFlowrunnerPaused) {
			props.flowrunnerConnector.resumeFlowrunner();
		} else {
			props.flowrunnerConnector.pauseFlowrunner();
		}
		canvasMode.setFlowrunnerPaused(!canvasMode.isFlowrunnerPaused);
		return false;
	}

	const exportFlowToPng = (event) => {
		event.preventDefault();
		if (props.canvasToolbarsubject) {
			props.canvasToolbarsubject.next("export");
		}
		return false;
	}

	const fitStage = (event) => {
		event.preventDefault();
		if (props.canvasToolbarsubject) {
			props.canvasToolbarsubject.next("fitStage");
		}
		return false;
	}

	const helpNode = (event) => {
		event.preventDefault();
		setShowTaskHelp(true);
		return false;
	}

	const swithToUIViewEditor = (event) => {
		event.preventDefault();
		canvasMode.setEditorMode("uiview-editor");
		props.onEditorMode("uiview-editor");
		return false;
	}

	const swithToCanvasEditor = (event) => {
		event.preventDefault();
		canvasMode.setEditorMode("canvas");
		props.onEditorMode("canvas");
		setTimeout(() => {
			if (props.canvasToolbarsubject) {
				props.canvasToolbarsubject.next("fitStage");
			}
		}, 50);
		return false;
	}

	const showModules = (event) => {
		event.preventDefault();
		modulesMenu.setOpen(!modulesMenu.isOpen);
		return false;
	}

	
	let shapeType = "";
	if (selectedNode && selectedNode.node) {
		shapeType = FlowToCanvas.getShapeType(selectedNode.node.shapeType, selectedNode.node.taskType, selectedNode.node.isStartEnd);
	}
	/*
		{!!!selectedNode.name && props.canvasMode.editorMode === "canvas" && 
			<TaskSelector flowrunnerConnector={props.flowrunnerConnector} selectTask={onSelectTask}></TaskSelector>
		}
		{!!!selectedNode.name && props.canvasMode.editorMode === "canvas" && 
			<a href="#" onClick={addNode} className="mx-2 btn btn-outline-light">Add</a>
		}
	*/
	return <>
		<div className="bg-dark sticky-top toolbar__root">
			<div className="toolbar__container">
				<Navbar bg="dark" expand="lg">
					<div className="navbar navbar-expand-lg navbar-dark bg-dark toolbar w-100">
						<Navbar.Toggle aria-controls="basic-navbar-nav" />
						<Navbar.Collapse id="basic-navbar-nav">
							<form className="form-inline toolbar__form flex-nowrap">
								{canvasMode.editorMode === "canvas" && 
									!!!selectedNode.node.name &&
									<div className="mr-2">
										<a href="#" onClick={showModules} className="btn btn-outline-light"><span className="fas fa-bars"></span></a>
									</div>	
								}
								<>
									<select className="form-control mr-2" 
										disabled={canvasMode.editorMode !== "canvas"}
										value={selectedFlow}
										onChange={setSelectedFlowChange}>
										<option value="" disabled>Choose flow</option>
										{flowFiles.map((flow : IFlowFile, index) => {
											return <option key={index} value={flow.id}>{flow.name}</option>;
										})}								
									</select>
									{!props.flowrunnerConnector.hasStorageProvider && <a href="#" onClick={addNewFlow} 
										className={"btn-link mr-4 text-light text-decoration-none " + (!!selectedNode.node.name || canvasMode.editorMode !== "canvas" ? "disabled" : "") } 
										title="Add new flow"><span>New</span></a>}
									{props.flowrunnerConnector.hasStorageProvider && <span className="mr-4"></span>}
								</>
								{canvasMode.flowType === "playground" && canvasMode.editorMode === "canvas" && 
									<img title="playground" width="32px" style={{marginLeft:-10,marginRight:10}} src="/svg/game-board-light.svg" />
								}
								{canvasMode.flowType === "rustflowrunner" && canvasMode.editorMode === "canvas" && 
									<img title="rust/webassembly flow" width="32px" style={{marginLeft:-10,marginRight:10}} src="/svg/webassembly.svg" />
								}
								{canvasMode.flowType === "backend" && canvasMode.editorMode === "canvas" && 
									<img title="backend flow" width="32px" style={{marginLeft:-10,marginRight:10}} src="/svg/server-solid.svg" />
								}
								
								
								{!!selectedNode.node.name && selectedNode.node.node && selectedNode.node.node.shapeType !== "Line" && 
									<a href="#" onClick={editNode} className="mx-2 btn btn-outline-light">Edit</a>
								}
								{!!selectedNode.node.name && selectedNode.node.node && selectedNode.node.node.shapeType === "Line" && 
									<a href="#" onClick={editNode} className="mx-2 btn btn-outline-light">Edit connection</a>
								}
								{!!selectedNode.node.name && selectedNode.node.node && selectedNode.node.node.shapeType !== "Line" && 
									<a href="#" onClick={connectNode} className={"mx-2 btn " + (canvasMode.isConnectingNodes ? "btn-light" : "btn-outline-light")}>Connect</a>
								}
								{!!selectedNode.node.name && selectedNode.node.node && selectedNode.node.node.shapeType === "Line" && 
									<a href="#" onClick={deleteLine} className={"mx-2 btn btn-danger"}>Delete</a>
								}
								{!!selectedNode.node.name && selectedNode.node.node && selectedNode.node.node.shapeType !== "Line" && 
									<a href="#" onClick={helpNode} className="mx-2 btn btn-outline-light">Help</a>
								}

								{!!selectedNode.node.name && selectedNode.node.node && selectedNode.node.node.shapeType === "Line" &&
									selectedNode.node.followflow !== "onfailure" && 
										<a href="#" onClick={markAsUnHappyFlow} className={"mx-2 btn btn-outline-danger"}>Mark as unhappy flow</a>
								}
								{!!selectedNode.node.name && selectedNode.node.node && selectedNode.node.node.shapeType === "Line" &&
									selectedNode.node.followflow !== "onsuccess" && 
										<a href="#" onClick={markAsHappyFlow} className={"mx-2 btn btn-outline-success"}>Mark as happy flow</a>
								}
								{!!selectedNode.node.name && selectedNode.node.node && selectedNode.node.node.shapeType !== "Line" && 
									<a href="#" onClick={deleteNode} className={"mx-2 btn btn-danger"}>Delete</a>
								}
								{!!selectedNode.node.name && selectedNode.node.node && selectedNode.node.node.shapeType !== "Line" && 
									<a href="#" onClick={showSchema} className={"mx-2 btn btn-info"}>Show Schema</a>
								}
								{!!!selectedNode.node.name && canvasMode.editorMode === "canvas" && <>
									<input id="showDependenciesInput" type="checkbox" checked={showDependencies} onChange={onShowDependenciesChange} />
									<label className="text-white" htmlFor="showDependenciesInput">&nbsp;Show dependencies</label>								
								</>}
								{!!props.hasRunningFlowRunner && 
									canvasMode.editorMode === "canvas" &&
									canvasMode.flowType == "playground" && 
									<a href="#" onClick={onSetPausedClick} className="ml-2 pause-button">{!!canvasMode.isFlowrunnerPaused ? "paused":"pause"}</a>
								}							
								{canvasMode.editorMode === "canvas" && 
									<a href="#" onClick={fitStage} className="ml-2 btn btn-outline-light">Fit stage</a>
								}
								{!props.flowrunnerConnector.hasStorageProvider && <a href="#" onClick={saveFlow} className="ml-2 btn btn-primary">Save</a>}
								<span className="ml-auto"></span>
								{canvasMode.flowType == "playground" && 
									<a href={"/ui/" + selectedFlow} className="ml-2">UI View</a>
								}
								{!!!selectedNode.node.name &&
									canvasMode.flowType == "playground" &&
									canvasMode.editorMode == "canvas" &&
									<a href="#" onClick={swithToUIViewEditor} className="ml-2">Edit UI View</a>
								}
								{canvasMode.flowType == "playground" &&
									canvasMode.editorMode != "canvas" &&
									<a href="#" onClick={swithToCanvasEditor} className="ml-2">Edit Flow</a>
								}
							</form>
						</Navbar.Collapse>
					</div>
				</Navbar>
			</div>
		</div>
		{showEditPopup && <EditPopup flowrunnerConnector={props.flowrunnerConnector} onClose={onClose}></EditPopup>}
		{showNewFlow && <NewFlow onClose={onClose} onSave={onCloseNewFlowPopup}></NewFlow>}
		{showTaskHelp && <HelpPopup taskName={selectedNode && selectedNode.node ? (selectedNode.node as any).taskType : ""}></HelpPopup>}
		{showModulesPopup && <ModulesPopup flowrunnerConnector={props.flowrunnerConnector} onClose={onCloseModulesPopup}></ModulesPopup>}
		{canvasMode.currentPopup == PopupEnum.editNamePopup && <NamePopup 
			nameCaption="Preset name"
			onSave={onSavePresetName}
			onClose={onCloseNamePopup}
		></NamePopup>}
	</>
}

// 	{showSchemaPopup && <ShowSchemaPopup onClose={onClose}></ShowSchemaPopup>}
