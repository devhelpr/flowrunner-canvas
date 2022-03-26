import * as React from 'react';
import { useEffect, useState, useCallback, useRef } from 'react';

import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { getNewNode } from '../../helpers/flow-methods';
import { EditPopup } from '../edit-popup';
//import { ShowSchemaPopup } from '../show-schema-popup';

import fetch from 'cross-fetch';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { Subject } from 'rxjs';
import { NewFlow } from '../new-flow';
import { HelpPopup } from '../help-popup';
import { ModulesPopup } from '../modules-popup';

import Navbar from 'react-bootstrap/Navbar';

import { useFlowStore} from '../../state/flow-state';
import { PopupEnum, useCanvasModeStateStore} from '../../state/canvas-mode-state';
import { useSelectedNodeStore} from '../../state/selected-node-state';
import { useLayoutStore } from '../../state/layout-state';
import { useModulesStateStore } from '../../state/modules-menu-state';
import { getPosition, setPosition } from '../../services/position-service';

import { NamePopup } from '../popups/name-popup';
import * as uuid from 'uuid';

import { FlowState } from '../../use-flows';
import { ThumbPositionRelativeToNode } from '../canvas/shapes/shape-types';
import { EditBundle } from '../edit-bundle';

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
	
	hasCustomNodesAndRepository: boolean;
	hasShowDependenciesInMenu?: boolean;
	renderMenuOptions? : () => JSX.Element;

	flow : any[];
	flowId? : number | string;
	flows: any[] | undefined;
	flowState : FlowState;
	flowType : string;

	isFlowEditorOnly? : boolean;
	canvasToolbarsubject : Subject<string>;
	hasRunningFlowRunner: boolean;

	onEditorMode?: (editorMode) => void;

	flowrunnerConnector : IFlowrunnerConnector;

	getFlows : () => void;
	loadFlow : (flowId) => void;
	saveFlow : (flowId?) => void;
	onGetFlows : (id? : string | number) => void;

	getNodeInstance?: (node: any, flowrunnerConnector?: IFlowrunnerConnector, flow?: any, taskSettings? : any) => any;	
	renderHtmlNode?: (node: any, flowrunnerConnector : IFlowrunnerConnector, flow: any, taskSettings? : any) => any;

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
	const [showEditBundle, setShowEditBundle]	= useState(false);
	const [showSchemaPopup, setShowSchemaPopup]	= useState(false);
	const [showNewFlow, setShowNewFlow]	= useState(false);
	const [selectedTask, setSelectedTask]	= useState("");
	const [showDependencies, setShowDependencies]	= useState(false);
	const [flowFiles, setFlowFiles]	= useState([] as any[]);
	const [selectedFlow, setSelectedFlow]	= useState("");
	const [showTaskHelp, setShowTaskHelp]	= useState(false);
	const [snapToGrid, setSnapToGrid] = useState(false);

	const flow = useFlowStore();
	const canvasMode = useCanvasModeStateStore();
	const selectedNode = useSelectedNodeStore();
	const layout = useLayoutStore();
	const modulesMenu = useModulesStateStore();
	
	useEffect(() => {		
		props.getFlows();
	}, []);

	useEffect(() => {
		console.log("TOOLBAR useffect1");
		canvasMode.setSelectedTask("");		
		setFlows(props.flows, selectedFlow || props.flowId);
	}, [props.flow, props.flowId, canvasMode.flowsUpdateId]);

	/*
	*useEffect(() => {
		console.log("TOOLBAR useffect2");
		canvasMode.setSelectedTask("");		
		getFlows();
	}, [canvasMode.flowsUpdateId]);
	*/

	useEffect(() => {
		if (modulesMenu.selectedModule == "tests") {
			setShowModulesPopup(true);
		} else if (modulesMenu.selectedModule != "") {
			setShowModulesPopup(true);
		} else {
			setShowModulesPopup(false);
		}
	}, [modulesMenu.selectedModule]);

	const setFlows = (flows : any[] | undefined, id?: number | string) => {
		if (flows && flows.length > 0) {
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
		}
	}

	/*const getFlows = (id? : number | string) => {
		if (props.flowrunnerConnector.hasStorageProvider) {
			setTimeout(()=> {
				const flows = props.flowrunnerConnector.storageProvider?.getFlows();
				setFlows(flows as any[], id);
				return;
			}, 50);
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
	*/

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

	const editBundle = (event) => {
		event.preventDefault();
		if (!canvasMode.isConnectingNodes) {
			setShowEditBundle(true);
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
		flow.deleteNode(selectedNode.node, !!event.shiftKey);
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

	const getSelectedNodes = () => {
		let inputConnections : any[] = [];
		let outputConnections : any[] = [];
		let orgNodes : any[] = [];
		let repoFlow : any[] = [];
		let renameIdMap : any = {};
		let idCounter = 1;
		let xmin = 99999999;
		let ymin = 99999999;
		canvasMode.selectedNodes.forEach((nodeName) => {
			flow.flow.forEach((node) => {
				if (node.shapeType !== "Line" && node.name === nodeName) {
					renameIdMap[nodeName] = "node" + idCounter;
					idCounter++;
					repoFlow.push({...node, 
						id :renameIdMap[nodeName], 
						name: renameIdMap[nodeName]
					});
					orgNodes.push(node);

					const position = getPosition(node.name) || {
						x: node.x,
						y: node.y
					}

					if (position.x < xmin) {
						xmin = position.x;
					}

					if (node.y < ymin) {
						ymin = position.y;
					}
				}
			 });
		});

		flow.flow.forEach((node) => {

			if (node.shapeType === "Line" && 						
				!renameIdMap[node.startshapeid] &&
				renameIdMap[node.endshapeid]) {
				node.endshapeid = renameIdMap[node.endshapeid];
				inputConnections.push(node);
			} else
			if (node.shapeType === "Line" && 						
				renameIdMap[node.startshapeid] &&
				!renameIdMap[node.endshapeid]) {
				node.startshapeid = renameIdMap[node.startshapeid];
				outputConnections.push(node);
			} else
			if (node.shapeType === "Line" && 						
				renameIdMap[node.startshapeid] &&
				renameIdMap[node.endshapeid]) {
				orgNodes.push(node);

				renameIdMap[node.name] = "node" + idCounter;
				idCounter++;

				repoFlow.push({...node, 
					id: renameIdMap[node.name], 
					name: renameIdMap[node.name],
					startshapeid: renameIdMap[node.startshapeid],
					endshapeid: renameIdMap[node.endshapeid]
				});					
			}				
		});

		let centerX = 0;
		let centerY = 0;
		let positionsAdded = 0;
		repoFlow.forEach((node) => {
			if (node.shapeType !== "Line") {
				const position = getPosition(node.name) || {
					x: node.x,
					y: node.y
				};

				centerX += position.x;
				centerY += position.y; 
				positionsAdded++;
			}
		});
		if (positionsAdded > 0) {
			centerX /= positionsAdded;
			centerY /= positionsAdded;
		}
		return {
			inputConnections,
			outputConnections,
			orgNodes,
			center : {
				x: centerX,
				y: centerY
			},
			flow: repoFlow.map((node) => {
				if (node.shapeType === "Line") {

					const position = getPosition(node.name) || {
						xstart: node.xstart,
						ystart: node.ystart,
						xend: node.xend,
						yend: node.yend,
					}

					return {...node, 
						xstart: position.xstart - xmin, 
						ystart: position.ystart - ymin, 
						xend: position.xend - xmin, 
						yend: position.yend - ymin
					}; 
				} else {
					const position = getPosition(node.name) || {
						x: node.x,
						y: node.y
					};

					return {...node, 
						x: position.x - xmin, 
						y: position.y - ymin
					};
				}
			})
		};
	}

	const addToRepository =	(event) => {
		event.preventDefault();
		console.log("addToRepository", canvasMode.selectedNodes, flow.flow);
		if (flow.flow &&
			canvasMode.isInMultiSelect && canvasMode.selectedNodes.length > 0) {
			
			const repoFlowInfo = getSelectedNodes();

			console.log("repoFlow", repoFlowInfo);

			if (repoFlowInfo.flow.length > 0) {
				const unique = new Date().getTime();
				fetch('/api/modulecontent?moduleId=repository', {
					method: 'POST',
					body: JSON.stringify({
						data: {
							name: "repo" + unique,
							title: "repo" + unique,
							flow: JSON.stringify(repoFlowInfo.flow)
						}
					}),
					headers: {
					  'Content-Type': 'application/json',
					},
				  })
				.then(res => {
					if (res.status >= 400) {
					throw new Error('Bad response from server');
					}
		
					return true;
				})					
				.catch(err => {
					console.error(err);
				});
			}
		}
		return false;
	}

	const bundleNode = (event) => {
		
		/*
			TODO : also handle output node ...
		*/

		event.preventDefault();
		if (flow.flow &&
			canvasMode.isInMultiSelect && canvasMode.selectedNodes.length > 0) {
			
			const bundledNodesInfo = getSelectedNodes();
			if (bundledNodesInfo.flow.length > 0) {
				let allowBundling = true;
				bundledNodesInfo.flow.forEach((node) => {
					if (node.taskType === "BundleFlowTask") {
						allowBundling = false;
					} 
				});
				if (!allowBundling) {
					alert("Nested Bundles are not allowed");
					return;
				}

				flow.deleteNodes(bundledNodesInfo.orgNodes);

				const newNodeId = "bundle_"+uuidV4();
				let startNodeName : string = "";
				if (bundledNodesInfo.inputConnections.length > 0) {
					startNodeName = bundledNodesInfo.inputConnections[0].endshapeid;
				} else {
					const connections : any[] = [];
					bundledNodesInfo.flow.forEach(node => {
						if (node.shapeType === "Line") {
							connections.push(node);
						}
					});
					let startNode : any = undefined;
					bundledNodesInfo.flow.forEach(node => {
						if (node.shapeType !== "Line") {
							let hasInputNode = false;
							connections.forEach((connection) => {
								if (connection.endshapeid === node.name) {
									hasInputNode = true;
								}
							});
							if (!hasInputNode && !startNode) {
								startNode = node;
							}
						}
					});
					if (startNode) {
						startNodeName = startNode.name;
					}
				}

				let newNode = getNewNode({
					name: newNodeId,
					id: newNodeId,
					taskType: "BundleFlowTask",
					shapeType: "Circle",
					x: bundledNodesInfo.center.x || bundledNodesInfo.flow[0].x || bundledNodesInfo.flow[0].xstart,
					y: (bundledNodesInfo.center.y || bundledNodesInfo.flow[0].y || bundledNodesInfo.flow[0].ystart) - 50,
					flow: JSON.stringify(bundledNodesInfo.flow),
					startNode: startNodeName
				}, flow.flow, true);
				flow.addFlowNode(newNode);
console.log("newNode", newNodeId, newNode);
				setPosition(newNode.name, {
					x: newNode.x,
					y: newNode.y
				});
				
				const storeNodes : any = [];
				if (bundledNodesInfo.inputConnections.length > 0) {
					bundledNodesInfo.inputConnections[0].endshapeid = newNodeId;

					let newEndPosition =  FlowToCanvas.getEndPointForLine(newNode, {
						x: newNode.x,
						y: newNode.y
					}, bundledNodesInfo.inputConnections[0], props.getNodeInstance,
						bundledNodesInfo.inputConnections[0].thumbPosition as ThumbPositionRelativeToNode);
					bundledNodesInfo.inputConnections[0].xend = newEndPosition.x;
					bundledNodesInfo.inputConnections[0].yend = newEndPosition.y;

					setPosition(bundledNodesInfo.inputConnections[0].name, {
						xstart: bundledNodesInfo.inputConnections[0].xstart,
						ystart: bundledNodesInfo.inputConnections[0].ystart,
						xend: newEndPosition.x,
						yend: newEndPosition.y
					});

					storeNodes.push(bundledNodesInfo.inputConnections[0]);
				}
								
				//flow.storeFlowNode(bundledNodesInfo.inputConnections[0], bundledNodesInfo.inputConnections[0].id);

				if (bundledNodesInfo.outputConnections.length > 0) {
					bundledNodesInfo.outputConnections.forEach(outputConnection => {
						outputConnection.startshapeid = newNodeId;

						let newStartPosition =  FlowToCanvas.getStartPointForLine(newNode, {
							x: newNode.x,
							y: newNode.y
						}, outputConnection, props.getNodeInstance,
							outputConnection.thumbPosition as ThumbPositionRelativeToNode);

						outputConnection.xstart = newStartPosition.x;
						outputConnection.ystart = newStartPosition.y;
		
						setPosition(outputConnection.name, {
							xstart: newStartPosition.x,
							ystart: newStartPosition.y,
							xend: outputConnection.xend,
							yend: outputConnection.yend
						});

						//flow.storeFlowNode(outputConnection, outputConnection.id);						
						storeNodes.push(outputConnection);
					});
				}
				flow.storeFlowNodes(storeNodes);

				if (props.canvasToolbarsubject) {
					props.canvasToolbarsubject.next("resetMultiSelect");
				}
			}
		}
		return false;
	}

	const saveFlow = (event) => {
		event.preventDefault();
		props.saveFlow(selectedFlow);
		return false;
	}

	const onClose = (pushFlow? : boolean) => {
		setShowEditBundle(false);
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

		props.onGetFlows(id);

		setSelectedFlow(id as string);
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

	const onSnapToGridChange = (event) => {
		canvasMode.setSnapToGrid(!snapToGrid);
		setSnapToGrid(!snapToGrid);		
	}

	const loadFlow = (flowId, withoutRefit? : boolean) => {

		/*if (!withoutRefit) {
			if (props.canvasToolbarsubject) {
				
				// TODO : change this to a more reliable way 
				// of communicating with the canvas
				//.. intention is to fadeout the current flow
				// when starting loading a new flow
				// .. and once it loaded.. fitstage and fade-in
				//
				// solution: state machine and custom hook on higher level?

				console.log("RENDER ORDER 2");
				props.canvasToolbarsubject.next("loadFlow");
			}
		}
		*/

		//props.flowrunnerConnector.setFlowType(props.flowType || "playground");
		canvasMode.setFlowrunnerPaused(false);
		canvasMode.setFlowType(props.flowType || "playground");
		//flow.storeFlow(props.flow, flowId);
		//layout.storeLayout(JSON.stringify(props.layout));

		/*
		if (props.flowrunnerConnector.hasStorageProvider) {
			const flowPackage : any = props.flowrunnerConnector.storageProvider?.getFlow(flowId) as any;
			props.flowrunnerConnector.setFlowType(flowPackage.flowType || "playground");
			canvasMode.setFlowrunnerPaused(false);
			canvasMode.setFlowType(flowPackage.flowType || "playground");
			flow.storeFlow(flowPackage.flow, flowId);
			layout.storeLayout(JSON.stringify(flowPackage.layout));
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
		*/
	}

	const setSelectedFlowChange = (event) => {
		console.log("FLOW selected",event.target.value,performance.now());
		props.flowrunnerConnector.killAndRecreateWorker();
		setSelectedFlow(event.target.value);
		if (props.flowrunnerConnector.hasStorageProvider && 
			props.flowrunnerConnector.storageProvider) {
			props.flowrunnerConnector.storageProvider.setSelectedFlow(event.target.value);
		}
		props.loadFlow(event.target.value);		
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
		if (props.onEditorMode) {
			canvasMode.setEditorMode("uiview-editor");
			props.onEditorMode("uiview-editor");
		}
		return false;
	}

	const swithToCanvasEditor = (event) => {
		event.preventDefault();
		if (props.onEditorMode) {
			canvasMode.setEditorMode("canvas");
			props.onEditorMode("canvas");
			setTimeout(() => {
				if (props.canvasToolbarsubject) {
					props.canvasToolbarsubject.next("fitStage");
				}
			}, 50);
		}
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

	let isFlowEditorOnly = false;
	if (props.isFlowEditorOnly !== undefined && !!props.isFlowEditorOnly) {
		isFlowEditorOnly = true;
	}

	return <>
		<div className="bg-dark toolbar__root" role="menu">
			<div className="toolbar__container">
				<Navbar bg="dark" expand="lg">
					<div className="bg-dark toolbar w-100">						
						<Navbar.Collapse id="basic-navbar-nav">
							<form className="form-inline toolbar__form flex-nowrap">
								{!isFlowEditorOnly && canvasMode.editorMode === "canvas" && 								
									<div className="mr-2">
										<a href="#" onClick={showModules} className="btn btn-outline-light ml-2"><span className="fas fa-bars"></span></a>
									</div>	
								}
								<>
									{!isFlowEditorOnly && <select className="form-control mr-2" 
										disabled={canvasMode.editorMode !== "canvas"}
										value={selectedFlow}
										onChange={setSelectedFlowChange}>
										<option value="" disabled>Choose flow</option>
										{flowFiles.map((flow : IFlowFile, index) => {
											return <option key={index} value={flow.id}>{flow.name}</option>;
										})}								
									</select>}
									{!props.flowrunnerConnector.hasStorageProvider && <a href="#" onClick={addNewFlow} 
										className={"btn-link mr-4 text-light text-decoration-none " + (!!selectedNode.node.name || canvasMode.editorMode !== "canvas" ? "disabled" : "") } 
										title="Add new flow"><span>New</span></a>}									
								</>
								{!isFlowEditorOnly && canvasMode.flowType === "playground" && canvasMode.editorMode === "canvas" && 
									<img title="playground" width="32px" style={{marginLeft:-10,marginRight:10}} src="/svg/game-board-light.svg" />
								}
								{!isFlowEditorOnly && canvasMode.flowType === "rustflowrunner" && canvasMode.editorMode === "canvas" && 
									<img title="rust/webassembly flow" width="32px" style={{marginLeft:-10,marginRight:10}} src="/svg/webassembly.svg" />
								}
								{!isFlowEditorOnly && canvasMode.flowType === "backend" && canvasMode.editorMode === "canvas" && 
									<img title="backend flow" width="32px" style={{marginLeft:-10,marginRight:10}} src="/svg/server-solid.svg" />
								}
								{canvasMode.isInMultiSelect && props.hasCustomNodesAndRepository &&
									<a href="#" onClick={addToRepository} className="mx-2 btn btn-outline-light">Add to repository</a>
								}
								{canvasMode.isInMultiSelect && 
									<a href="#" onClick={bundleNode} className="mx-2 btn btn-outline-light">Bundle nodes</a>
								}

								{!canvasMode.isInMultiSelect && 
									!!selectedNode.node.name && selectedNode.node.node && selectedNode.node.node.taskType === "BundleFlowTask" && 
									<a href="#" onClick={editBundle} className="mx-2 btn btn-outline-light">Edit Bundle</a>
								}

								{!canvasMode.isInMultiSelect && canvasMode.editorMode === "canvas" && <>
									<input id="snapToGrid" type="checkbox" className="ml-2" checked={snapToGrid} onChange={onSnapToGridChange} />
									<label className="text-white mr-2" htmlFor="snapToGrid">&nbsp;Snap to grid</label>								
								</>}

								{!canvasMode.isInMultiSelect && 
									(props.hasShowDependenciesInMenu === undefined || 
									props.hasShowDependenciesInMenu === true) &&
									!!!selectedNode.node.name && canvasMode.editorMode === "canvas" && <>
									<input id="showDependenciesInput" type="checkbox" checked={showDependencies} onChange={onShowDependenciesChange} />
									<label className="text-white" htmlFor="showDependenciesInput">&nbsp;Show dependencies</label>								
								</>}

								{!!selectedNode.node.name && selectedNode.node.node && selectedNode.node.node.shapeType !== "Line" && 
									<a href="#" onClick={editNode} className="mx-2 btn btn-outline-light">Edit</a>
								}
								{!!selectedNode.node.name && selectedNode.node.node && selectedNode.node.node.shapeType === "Line" && 
									<a href="#" onClick={editNode} className="mx-2 btn btn-outline-light">Edit connection</a>
								}
								{false && !!selectedNode.node.name && selectedNode.node.node && selectedNode.node.node.shapeType !== "Line" && 
									<a href="#" onClick={connectNode} className={"mx-2 btn " + (canvasMode.isConnectingNodes ? "btn-light" : "btn-outline-light")}>Connect</a>
								}
								{!!selectedNode.node.name && selectedNode.node.node && selectedNode.node.node.shapeType === "Line" && 
									<a href="#" onClick={deleteLine} className={"mx-2 btn btn-danger"}>Delete</a>
								}
								{false && !isFlowEditorOnly && !!selectedNode.node.name && selectedNode.node.node && selectedNode.node.node.shapeType !== "Line" && 
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
								{(canvasMode.isInMultiSelect || 
									(!!selectedNode.node.name && selectedNode.node.node && selectedNode.node.node.shapeType !== "Line")) && 
									<a href="#" onClick={deleteNode} className={"mx-2 btn btn-danger"}>Delete</a>
								}
								{!isFlowEditorOnly && !!selectedNode.node.name && selectedNode.node.node && selectedNode.node.node.shapeType !== "Line" && 
									<a href="#" onClick={showSchema} className={"mx-2 btn btn-info"}>Show Schema</a>
								}
								
								{!isFlowEditorOnly && !!props.hasRunningFlowRunner && 
									canvasMode.editorMode === "canvas" &&
									canvasMode.flowType == "playground" && 
									<a href="#" onClick={onSetPausedClick} className="ml-2 text-white pause-button">{!!canvasMode.isFlowrunnerPaused ? "paused":"pause"}</a>
								}							
								{canvasMode.editorMode === "canvas" && 
									<a href="#" onClick={fitStage} className="ml-2 btn btn-outline-light">Fit stage</a>
								}
								{!isFlowEditorOnly && !props.flowrunnerConnector.hasStorageProvider && <a href="#" onClick={saveFlow} className="ml-2 btn btn-primary">Save</a>}
								{!isFlowEditorOnly && <span className="ml-auto"></span>}
								{!isFlowEditorOnly && canvasMode.flowType == "playground" && 
									<a href={"/ui/" + selectedFlow} className="ml-2 text-white">UI View</a>
								}
								{!isFlowEditorOnly && !!!selectedNode.node.name &&
									canvasMode.flowType == "playground" &&
									canvasMode.editorMode == "canvas" &&
									<a href="#" onClick={swithToUIViewEditor} className="ml-2 text-white">Edit UI View</a>
								}
								{!isFlowEditorOnly && canvasMode.flowType == "playground" &&
									canvasMode.editorMode != "canvas" &&
									<a href="#" onClick={swithToCanvasEditor} className="ml-2 text-white">Edit Flow</a>
								}
								<>{
									props.renderMenuOptions && <span className="ml-auto">{props.renderMenuOptions()}</span>
								}</>
							</form>
						</Navbar.Collapse>
					</div>
				</Navbar>
			</div>
		</div>
		{showEditBundle && <EditBundle 
			renderHtmlNode={props.renderHtmlNode}
			getNodeInstance={props.getNodeInstance}
			flowrunnerConnector={props.flowrunnerConnector} onClose={onClose}></EditBundle>}
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
