import * as React from 'react';
import { Suspense } from 'react';
import { connect } from "react-redux";

import { Children, isValidElement, cloneElement } from 'react';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { Number } from './visualizers/number';
import { Color } from './visualizers/color';
import { Text } from './visualizers/text';
import { List } from './visualizers/list';

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
	selectedNode : any;
	children? : any;
}

const mapStateToProps = (state : any) => {
	return {
		selectedNode : state.selectedNode
	}
}

export interface DebugNodeHtmlPluginState {
	receivedPayload : any[];
	expressionTree : any;
}

export class ContainedDebugNodeHtmlPlugin extends React.Component<DebugNodeHtmlPluginProps, DebugNodeHtmlPluginState> {
	state = {
		receivedPayload : [],
		expressionTree: undefined
	}

	observableId = uuidV4();

	componentDidMount() {
		//console.log("registerFlowNodeObserver", this.props.node.name, this.observableId);
		this.props.flowrunnerConnector.registerFlowNodeObserver(this.props.node.name, this.observableId, this.receivePayloadFromNode);
		if (this.props.node.visibilityCondition && 
			this.props.node.visibilityCondition !== "") {				
			this.setState({expressionTree: createExpressionTree(this.props.node.visibilityCondition)})
		}

	}

	componentDidUpdate(prevProps : any) {
		if (prevProps.node.visibilityCondition != this.props.node.visibilityCondition && 
			this.props.node.visibilityCondition && 
			this.props.node.visibilityCondition !== "") {				
			this.setState({expressionTree: createExpressionTree(this.props.node.visibilityCondition)})
		}

		if (prevProps.flow != this.props.flow) {
			//console.log("componentDidUpdate 1",this.observableId,  this.props.node);
			this.props.flowrunnerConnector.unregisterFlowNodeObserver(prevProps.node.name, this.observableId);
			this.props.flowrunnerConnector.registerFlowNodeObserver(this.props.node.name, this.observableId, this.receivePayloadFromNode);
		}

		if (!prevProps || !prevProps.node || 
			(prevProps.node.name != this.props.node.name)) {
			//console.log("componentDidUpdate 2", this.observableId, this.props.node);
			this.props.flowrunnerConnector.unregisterFlowNodeObserver(prevProps.node.name, this.observableId);
			this.props.flowrunnerConnector.registerFlowNodeObserver(this.props.node.name, this.observableId, this.receivePayloadFromNode);
		}

	}


	getWidth = () => {

		/*if (this.props.node.visualizer == "gridcanvas") {
			const visualizer = new GridCanvas({node: this.props.node,
				payloads: this.state.receivedPayload});
			return visualizer.getWidth();
		}
		*/
		return;
	}

	getHeight() {
		/*if (this.props.node.visualizer == "gridcanvas") {
			const visualizer = new GridCanvas({node: this.props.node,
				payloads: this.state.receivedPayload});
			return visualizer.getHeight();
		}*/
		return;
	}

	unmounted = false;
	componentWillUnmount() {
		this.unmounted = true;
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = undefined;
		}
		console.log("componentWillUnmount",this.observableId, this.props.node);
		this.props.flowrunnerConnector.unregisterFlowNodeObserver(this.props.node.name, this.observableId);
	}

	timer : any; 
	lastTime : any;
	receivedPayloads : any[] = [];
	receivePayloadFromNode = (payload : any) => {
		//console.log("receivePayloadFromNode", payload, this.props.node);
		if (this.unmounted) {
			return;
		}		
		
		if (!!payload.isDebugCommand) {
			if (payload.debugCommand  === "resetPayloads") {
				if (this.receivedPayloads.length > 0) {
					this.receivedPayloads = [];
					this.setState((state, props) => {
						return {
							receivedPayload: []
						}
					});
				}
			}
			return;
		}

		let receivedPayloads : any[] = [...this.receivedPayloads];
		receivedPayloads.push({...payload});
		if (receivedPayloads.length > 1) {
			receivedPayloads = receivedPayloads.slice(Math.max(receivedPayloads.length - (this.props.node.maxPayloads || 1), 0));
		}
		this.receivedPayloads = receivedPayloads;

		if (!this.lastTime || performance.now() > this.lastTime + 30) {
			this.lastTime = performance.now();
			if (this.timer) {
				clearTimeout(this.timer);
				this.timer = undefined;
			}
			this.setState({receivedPayload : this.receivedPayloads});
			/*
			this.setState((state, props) => {
				let receivedPayloads : any[] = [...state.receivedPayload];
				receivedPayloads.push({...payload});
				if (receivedPayloads.length > 1) {
					receivedPayloads = receivedPayloads.slice(Math.max(receivedPayloads.length - (this.props.node.maxPayloads || 1), 0));
				}
				return {
					receivedPayload: receivedPayloads
				}
			});
			*/
		} else {
			if (this.timer) {
				clearTimeout(this.timer);
				this.timer = undefined;
			}

			this.timer = setTimeout(() => {
				this.timer = undefined;		
				this.setState({receivedPayload : this.receivedPayloads});
			}, 30);
		}

		return;
	}

	render() {

		let visualizer = <></>;
		let additionalCssClass = "";

		/*
			const AppViewTemplate = getComponent(this.props.flowrunnerConnector.flowView)

			if this.props.flowrunnerConnector.flowView == "uiview" 
				check visbilityCondition
				if !visible then <></>

			<AppViewTemplate>{children}</AppViewTemplate>

		*/
		let visible = true;
		if (this.props.node.visibilityCondition && this.state.expressionTree) {
			let payload = this.state.receivedPayload.length > 0 ? this.state.receivedPayload[this.state.receivedPayload.length - 1] : {};
			const result = executeExpressionTree(this.state.expressionTree as unknown as ExpressionNode, payload);
			console.log("executeExpressionTree", result, result == 1, !(result == 1) && this.state.expressionTree && 
				this.props.flowrunnerConnector.flowView != "uiview", payload);
			visible = result == 1;
		}

		if (this.props.flowrunnerConnector.flowView == "uiview" && this.state.expressionTree) {
			if (!visible) {
				return <></>;
			} 
		}
		
		if (this.state.receivedPayload.length == 0) {
			visualizer = <div style={{		
				backgroundColor: "#f2f2f2"
			}}></div>;
		}
		
		if (this.props.node.visualizer == "children") {
			const childrenWithProps = Children.map(this.props.children, child => {
				if (isValidElement(child)) {
				  return cloneElement(child, { 
					nodeName: this.props.node.name,
					payload: this.state.receivedPayload.length > 0 ? this.state.receivedPayload[this.state.receivedPayload.length - 1] : {}
				   } as any);
				}
		  
				return child;
			  });
			//visualizer = <>{childrenWithProps}</>;
			return <>{childrenWithProps}</>;
		} else
		if (this.props.node.visualizer == "number") {
			visualizer = <Number node={this.props.node} payloads={this.state.receivedPayload}></Number>
		} else
		if (this.props.node.visualizer == "text") {
			visualizer = <Text node={this.props.node} payloads={this.state.receivedPayload}></Text>
		} else
		if (this.props.node.visualizer == "list") {
			visualizer = <List node={this.props.node} payloads={this.state.receivedPayload}></List>
		} else
		if (this.props.node.visualizer == "color") {
			additionalCssClass = "html-plugin-node__h-100";
			visualizer = <Color node={this.props.node} payloads={this.state.receivedPayload}></Color>
		} else 
		if (this.props.node.visualizer == "richtext") {
			additionalCssClass = "html-plugin-node__h-100";
			visualizer = <Suspense fallback={<div>Loading...</div>}>
							<RichText node={this.props.node} payloads={this.state.receivedPayload}></RichText>
				</Suspense>;
		} else
		if (this.props.node.visualizer == "gridcanvas") {
			additionalCssClass = "html-plugin-node__h-100";
			visualizer = <Suspense fallback={<div>Loading...</div>}>
							<GridCanvas node={this.props.node} payloads={this.state.receivedPayload}></GridCanvas>
				</Suspense>;
		} else
		if (this.props.node.visualizer == "animatedgridcanvas") {
			additionalCssClass = "html-plugin-node__h-100";
			visualizer = <Suspense fallback={<div>Loading...</div>}>
					<AnimatedGridCanvas node={this.props.node} payloads={this.state.receivedPayload}></AnimatedGridCanvas>
				</Suspense>;
		} else
		if (this.props.node.visualizer == "xycanvas") {
			additionalCssClass = "html-plugin-node__h-100";
			visualizer = <Suspense fallback={<div>Loading...</div>}>
					<XYCanvas flowrunnerConnector={this.props.flowrunnerConnector} selectedNode={this.props.selectedNode} node={this.props.node} payloads={this.state.receivedPayload}></XYCanvas>
				</Suspense>;
		} else {
			const payload = this.state.receivedPayload[this.state.receivedPayload.length-1];
			if (payload && (payload as any).debugId) {
				delete (payload as any).debugId;
			}
			//console.log("debugtask" , this.props.node, payload, this.state);
			visualizer = <>{payload ? JSON.stringify(payload, null, 2) : ""}</>;
		}
		return <>
			{!visible && this.state.expressionTree && 
				this.props.flowrunnerConnector.flowView != "uiview" && <div className="html-plugin-node__visibility fas fa-eye-slash"></div>}
			<div className={"html-plugin-node html-plugin-node--wrap html-plugin-node--" + this.props.node.visualizer + " " + additionalCssClass} style={{		
				backgroundColor: "white"
			}}>{visualizer}			
			</div>
		</>;
		
	
	}
}

export const DebugNodeHtmlPlugin = connect(mapStateToProps)(ContainedDebugNodeHtmlPlugin);