import * as React from 'react';
import { Suspense } from 'react';
import { useEffect, useState, useRef } from 'react';

import { Children, isValidElement, cloneElement } from 'react';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { Number } from './visualizers/number';
import { Color } from './visualizers/color';
import { Text } from './visualizers/text';
import { List } from './visualizers/list';
import { useSelectedNodeStore} from '../../state/selected-node-state';

import { createExpressionTree, executeExpressionTree, ExpressionNode } from '@devhelpr/expressionrunner';

const XYCanvas = React.lazy(() => import('./visualizers/xy-canvas').then(({ XYCanvas }) => ({ default: XYCanvas })));
const AnimatedGridCanvas = React.lazy(() => import('./visualizers/animated-grid-canvas').then(({ AnimatedGridCanvas }) => ({ default: AnimatedGridCanvas })));
const GridCanvas = React.lazy(() => import('./visualizers/grid-canvas').then(({ GridCanvas}) => ({ default: GridCanvas })));

const RichText = React.lazy(() => import('./visualizers/richtext').then(({ RichText}) => ({ default: RichText })));

import * as uuid from 'uuid';
const uuidV4 = uuid.v4;


export interface DebugNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
	flow: any;
	children? : any;
}

export interface DebugNodeHtmlPluginState {
	receivedPayload : any[];
	expressionTree : any;
}

//export class ContainedDebugNodeHtmlPlugin extends React.Component<DebugNodeHtmlPluginProps, DebugNodeHtmlPluginState> {
export const DebugNodeHtmlPlugin = (props : DebugNodeHtmlPluginProps) => {
	const [receivedPayload, setReceivedPayload] = useState([] as any[]);
	const [expressionTree, setExpressionTree] = useState(undefined as any);

	const selectedNode = useSelectedNodeStore();
	const observableId = useRef(uuidV4());
	const unmounted = useRef(false);

	const timer = useRef(undefined as any);
	const lastTime = useRef(undefined as any);
	const receivedPayloads = useRef([] as any[]);

	useEffect(() => {
		//console.log("registerFlowNodeObserver", props.node.name, observableId);
		props.flowrunnerConnector.registerFlowNodeObserver(props.node.name, observableId.current, receivePayloadFromNode);
		if (props.node.visibilityCondition && 
			props.node.visibilityCondition !== "") {				
			setExpressionTree(createExpressionTree(props.node.visibilityCondition));
		}
		return () => {
			props.flowrunnerConnector.unregisterFlowNodeObserver(props.node.name, observableId.current);
			unmounted.current = true;

			if (timer.current) {
				clearTimeout(timer.current);
				timer.current = undefined;
			}
		}
	}, []);

	useEffect(() => {
		if (props.node.visibilityCondition && 
			props.node.visibilityCondition && 
			props.node.visibilityCondition !== "") {				
			setExpressionTree(createExpressionTree(props.node.visibilityCondition));
		}

		props.flowrunnerConnector.registerFlowNodeObserver(props.node.name, observableId.current, receivePayloadFromNode);

		return () => {
			props.flowrunnerConnector.unregisterFlowNodeObserver(props.node.name, observableId.current);
		}
	}, [props.node]);

	useEffect(() => {
		props.flowrunnerConnector.registerFlowNodeObserver(props.node.name, observableId.current, receivePayloadFromNode);
		return () => {
			props.flowrunnerConnector.unregisterFlowNodeObserver(props.node.name, observableId.current);
		}

	}, [props.flow]);

	const getWidth = () => {

		/*if (props.node.visualizer == "gridcanvas") {
			const visualizer = new GridCanvas({node: props.node,
				payloads: state.receivedPayload});
			return visualizer.getWidth();
		}
		*/
		return;
	}

	const getHeight = () => {
		/*if (props.node.visualizer == "gridcanvas") {
			const visualizer = new GridCanvas({node: props.node,
				payloads: state.receivedPayload});
			return visualizer.getHeight();
		}*/
		return;
	}

	
	const receivePayloadFromNode = (payload : any) => {
		//console.log("receivePayloadFromNode", payload, props.node);
		if (unmounted.current) {
			return;
		}		
		
		if (!!payload.isDebugCommand) {
			if (payload.debugCommand  === "resetPayloads") {
				if (receivedPayloads.current.length > 0) {
					receivedPayloads.current = [];
					setReceivedPayload([]);
				}
			}
			return;
		}

		let newReceivedPayloads : any[] = [...receivedPayloads.current];
		newReceivedPayloads.push({...payload});
		if (newReceivedPayloads.length > 1) {
			newReceivedPayloads = newReceivedPayloads.slice(Math.max(newReceivedPayloads.length - (props.node.maxPayloads || 1), 0));
		}
		receivedPayloads.current = newReceivedPayloads;

		if (!lastTime.current || performance.now() > lastTime.current + 30) {
			lastTime.current = performance.now();
			if (timer.current) {
				clearTimeout(timer.current);
				timer.current = undefined;
			}
			setReceivedPayload(newReceivedPayloads);
			/*
			setState((state, props) => {
				let receivedPayloads : any[] = [...state.receivedPayload];
				receivedPayloads.push({...payload});
				if (receivedPayloads.length > 1) {
					receivedPayloads = receivedPayloads.slice(Math.max(receivedPayloads.length - (props.node.maxPayloads || 1), 0));
				}
				return {
					receivedPayload: receivedPayloads
				}
			});
			*/
		} else {
			if (timer.current) {
				clearTimeout(timer.current);
				timer.current = undefined;
			}

			timer.current = setTimeout(() => {
				timer.current = undefined;		
				setReceivedPayload(receivedPayloads.current);
			}, 30);
		}

		return;
	}

	

	let visualizer = <></>;
	let additionalCssClass = "";

	/*
		const AppViewTemplate = getComponent(props.flowrunnerConnector.flowView)

		if props.flowrunnerConnector.flowView == "uiview" 
			check visbilityCondition
			if !visible then <></>

		<AppViewTemplate>{children}</AppViewTemplate>

	*/
	let visible = true;
	if (props.node.visibilityCondition && expressionTree) {
		let payload = receivedPayload.length > 0 ? receivedPayload[receivedPayload.length - 1] : {};
		const result = executeExpressionTree(expressionTree as unknown as ExpressionNode, payload);
		console.log("executeExpressionTree", result, result == 1, !(result == 1) && expressionTree && 
			props.flowrunnerConnector.flowView != "uiview", payload);
		visible = result == 1;
	}

	if (props.flowrunnerConnector.flowView == "uiview" && expressionTree) {
		if (!visible) {
			return <></>;
		} 
	}
	
	if (receivedPayload.length == 0) {
		visualizer = <div style={{		
			backgroundColor: "#f2f2f2"
		}}></div>;
	}
	
	if (props.node.visualizer == "children") {
		const childrenWithProps = Children.map(props.children, child => {
			if (isValidElement(child)) {
				return cloneElement(child, { 
				nodeName: props.node.name,
				payload: receivedPayload.length > 0 ? receivedPayload[receivedPayload.length - 1] : {}
				} as any);
			}
		
			return child;
			});
		//visualizer = <>{childrenWithProps}</>;
		return <>{childrenWithProps}</>;
	} else
	if (props.node.visualizer == "number") {
		visualizer = <Number node={props.node} payloads={receivedPayload}></Number>
	} else
	if (props.node.visualizer == "text") {
		visualizer = <Text node={props.node} payloads={receivedPayload}></Text>
	} else
	if (props.node.visualizer == "list") {
		visualizer = <List node={props.node} payloads={receivedPayload}></List>
	} else
	if (props.node.visualizer == "color") {
		additionalCssClass = "html-plugin-node__h-100";
		visualizer = <Color node={props.node} payloads={receivedPayload}></Color>
	} else 
	if (props.node.visualizer == "richtext") {
		additionalCssClass = "html-plugin-node__h-100";
		visualizer = <Suspense fallback={<div>Loading...</div>}>
						<RichText node={props.node} payloads={receivedPayload}></RichText>
			</Suspense>;
	} else
	if (props.node.visualizer == "gridcanvas") {
		additionalCssClass = "html-plugin-node__h-100";
		visualizer = <Suspense fallback={<div>Loading...</div>}>
						<GridCanvas node={props.node} payloads={receivedPayload}></GridCanvas>
			</Suspense>;
	} else
	if (props.node.visualizer == "animatedgridcanvas") {
		additionalCssClass = "html-plugin-node__h-100";
		visualizer = <Suspense fallback={<div>Loading...</div>}>
				<AnimatedGridCanvas node={props.node} payloads={receivedPayload}></AnimatedGridCanvas>
			</Suspense>;
	} else
	if (props.node.visualizer == "xycanvas") {
		additionalCssClass = "html-plugin-node__h-100";
		visualizer = <Suspense fallback={<div>Loading...</div>}>
				<XYCanvas flowrunnerConnector={props.flowrunnerConnector} selectedNode={selectedNode} node={props.node} payloads={receivedPayload}></XYCanvas>
			</Suspense>;
	} else {
		const payload = receivedPayload[receivedPayload.length-1];
		if (payload && (payload as any).debugId) {
			delete (payload as any).debugId;
		}
		//console.log("debugtask" , props.node, payload, state);
		visualizer = <>{payload ? JSON.stringify(payload, null, 2) : ""}</>;
	}
	return <>
		{!visible && expressionTree && 
			props.flowrunnerConnector.flowView != "uiview" && <div className="html-plugin-node__visibility fas fa-eye-slash"></div>}
		<div className={"html-plugin-node html-plugin-node--wrap html-plugin-node--" + props.node.visualizer + " " + additionalCssClass} style={{		
			backgroundColor: "white"
		}}>{visualizer}			
		</div>
	</>;
}

