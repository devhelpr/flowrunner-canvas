import * as React from 'react';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import * as uuid from 'uuid';
import { Layout } from '@devhelpr/layoutrunner';
import { renderLayoutType } from './components/layout-renderer';
import { Flow } from '../flow';

import fetch from 'cross-fetch';

import { useFlowStore} from '../../state/flow-state';
import { useLayoutStore} from '../../state/layout-state';
import { useCanvasModeStateStore} from '../../state/canvas-mode-state';

const uuidV4 = uuid.v4;

import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';

export interface UserInterfaceViewProps {	

	flowrunnerConnector : IFlowrunnerConnector;

	flowId? : string;

	renderHtmlNode?: (node: any, flowrunnerConnector : IFlowrunnerConnector, flow: any, taskSettings? : any) => any;
	getNodeInstance?: (node: any, flowrunnerConnector: IFlowrunnerConnector, flow: any, taskSettings? : any) => any;
	
}

export const UserInterfaceView = (props : UserInterfaceViewProps) => {
	const [flowName, setFlowName ] = useState("");
	const [flowHash, setFlowHash] = useState({} as any);

	const [titleBarBackgroundcolor, setTitleBarBackgroundcolor] = useState("");
	const [titleBarTitle, setTitleBarTitle ] = useState("");
	const [titleBarColor, setTitleBarColor ] = useState("");
	const [titleBarFont, setTitleBarFont ] = useState("");
	const [titleBarFontSize, setTitleBarFontSize ] = useState("");
	const [titleBarFontWeight, setTitleBarFontWeight ] = useState("");

	const [layoutTree, setLayoutTree] = useState({} as any);
	const [isFlowLoaded, setIsFlowLoaded ] = useState(false);
	const unmounted = useRef(false);
	const layoutTreeAsString = useRef("");

	const flow = useFlowStore();
	const canvasMode = useCanvasModeStateStore();
	const layout = useLayoutStore();
	let nodesStateLocal : any = useRef({} as any);
	let touchedNodesLocal : any = useRef({} as any);

	const getLayoutNodeFromTree = (level, index, subIndex) => {
		let treeHashKey = level + "." + index + "." + subIndex;
		if (layoutTreeAsString.current && layoutTreeAsString.current[treeHashKey]) {
			let tree : any[] = layoutTreeAsString.current[treeHashKey];
			let layoutTreeNode : any[] = [];
			tree.map((layoutBlock, treeIndex) => {
				if (layoutBlock.title == "element") {
					layoutTreeNode.push({
						type : "element",
						title: layoutBlock.title,
						subtitle: layoutBlock.subtitle || ""
					});
				} else
				if (layoutBlock.title == "flowNode") {
					layoutTreeNode.push({
						type : "flowNode",
						title: layoutBlock.title,
						subtitle: layoutBlock.subtitle || "",
						name: layoutBlock.subtitle || ""
					});
				} else
				if (layoutBlock.title == "layout2columns") {
					layoutTreeNode.push({
						type : "layout2columns",
						title: layoutBlock.title,
						layout : 
							[getLayoutNodeFromTree(level + 1, treeIndex , 0),
								getLayoutNodeFromTree(level + 1, treeIndex , 1),
							]
					});
				} else {
					layoutTreeNode.push({
						type : "layout",
						title: layoutBlock.title,
						layout : getLayoutNodeFromTree(level + 1, treeIndex , 0)
					});
				}
			});
			return layoutTreeNode;
		}
		return [];
	}
	
	const screenUICallback = (command : any) => {
		if (command && command.action == "SendScreen" && command.payload) {
			const payload = command.payload;
			
			// TODO : refactor this to use useReducer instead of single "setState" calls
			if (payload.titleBarBackgroundcolor) {
				setTitleBarBackgroundcolor(payload.titleBarBackgroundcolor);
			}
			if (payload.titleBarColor) {
				setTitleBarColor(payload.titleBarColor);
			}
			if (payload.titleBarFont) {
				setTitleBarFont(payload.titleBarFont);
			}
			if (payload.titleBarFontSize) {
				setTitleBarFontSize(payload.titleBarFontSize);
			}
			if (payload.titleBarFontWeight) {
				setTitleBarFontWeight(payload.titleBarFontWeight);
			}
			if (payload.titleBarFontWeight) {
				setTitleBarFontWeight(payload.titleBarFontWeight);
			}
			if (payload.titleBarTitle) {
				setTitleBarTitle(payload.titleBarTitle);
			}
					
		}
	}

	useLayoutEffect(() => {

		props.flowrunnerConnector.registerScreenUICallback(screenUICallback);

		props.flowrunnerConnector.unregisterNodeStateObserver("canvas");
		props.flowrunnerConnector.registerNodeStateObserver("canvas", nodeStateObserver);


		const paths = location.pathname.split("/");

		if (props.flowrunnerConnector.hasStorageProvider) {
			// TODO : make this data dependent instead of fixed
			loadFlow("flow");
		} else 
		if (props.flowId !== undefined && props.flowId !== "") {
			loadFlow(props.flowId);
		} else
		if (paths.length > 2) {
			if (paths[1] == "ui") {
				const flowId = paths[2];
				if (flowId !== undefined) {
					loadFlow(flowId);
				} else {
					console.error("No flowId specified");
				}
			}
		}

		return () => {
			unmounted.current = true;
			props.flowrunnerConnector.unregisterNodeStateObserver("canvas");
		}

	}, []);

	const setupFlow = (flowPackage: any, flowId) => {
		setTimeout(() => {
			if (flowPackage.flowType === "playground") {
				props.flowrunnerConnector.setFlowType(flowPackage.flowType || "playground");
				canvasMode.setFlowrunnerPaused(false);
				canvasMode.setFlowType(flowPackage.flowType || "playground");
				flow.storeFlow(flowPackage.flow, flowId);
				layout.storeLayout(JSON.stringify(flowPackage.layout));
				
				let flowHash = {};
				flowPackage.flow.map((node) => {
					flowHash[node.name] = node;
					return true;
				});

				setFlowName(flowPackage.name);
				setFlowHash(flowHash);
				setIsFlowLoaded(true);
			}

		} , 500);
	}

	const loadFlow = (flowId) => {

		if (props.flowrunnerConnector.hasStorageProvider) {
			const flowPackage : any = props.flowrunnerConnector.storageProvider?.getFlow(flowId) as any;
			setupFlow(flowPackage, flowId);
			return;
		}

		fetch('/flowui?flow=' + flowId)
		.then(res => {
			if (res.status >= 400) {
				throw new Error("Bad response from server");
			}
			return res.json();
		})
		.then(flowPackage => {

			setupFlow(flowPackage, flowId);
			
		})
		.catch(err => {
			console.error(err);
		});
	}

	useLayoutEffect(() => {
		layoutTreeAsString.current  = JSON.parse(layout.layout) || {};
		setLayoutTree(getLayoutNodeFromTree(1,0,0));	
		updateTouchedNodes();		
	}, [layout, flow]);


	const updateTouchedNodes = () => {
		if (touchedNodesLocal.current) {
			Object.keys(touchedNodesLocal.current).map((touchNodeId: string) => {
				const element = document.getElementById(touchNodeId);
				if (element) {
					if (touchedNodesLocal.current[touchNodeId] === true) {
						element.classList.remove("untouched");
					} else {
						element.classList.add("untouched");
					}					
				}
			})
		}
	}
	const nodeStateObserver = (nodeName: string, nodeState : string, touchedNodes : any) => {
		nodesStateLocal.current[nodeName] = nodeState;		
		touchedNodesLocal.current = touchedNodes;
		updateTouchedNodes();
	}

	if (!isFlowLoaded) {
		return <></>;
	}

	let title = flowName || "UserInterface View";
	if (titleBarTitle !== "") {
		title = titleBarTitle;
	}

	let style : any = {};
	let navContainerClassName = "bg-dark mb-4";
	let navbarClassName = "navbar navbar-expand-lg navbar-light bg-dark";
	let h1ClassName = "text-white";

	if (titleBarBackgroundcolor) {
		style.backgroundColor = titleBarBackgroundcolor;
		navContainerClassName = "mb-4";
		navbarClassName = "navbar navbar-expand-lg navbar-light";
	}
	if (titleBarColor) {
		style.color = titleBarColor;
		h1ClassName = "";
	}
	if (titleBarFont) {
		style.fontFamily = titleBarFont;
	}
	if (titleBarFontSize) {
		style.fontSize = titleBarFontSize;
	}
	if (titleBarFontWeight) {
		style.fontWeight = titleBarFontWeight;
	}

	return <div className="pb-4 container__background">
		<div style={style} className={navContainerClassName}>
			<nav style={style} className={navbarClassName}>
				<h1 className={h1ClassName}>{title}</h1>
			</nav>
		</div>
		<div className="container container__ui-view">
			<Layout nodeName="ui"
				renderLayoutType={renderLayoutType}
				payload={{
					layout: layoutTree,
					context : {
							flowHash : flowHash,
							flow: flow.flow,
							getNodeInstance: props.getNodeInstance,
							flowrunnerConnector: props.flowrunnerConnector,
							renderHtmlNode: props.renderHtmlNode
						}
					}} />
		</div>
		<Flow 
			flow={flow.flow} 
			flowId={flow.flowId}
			flowrunnerConnector={props.flowrunnerConnector}></Flow>
	</div>
	
}