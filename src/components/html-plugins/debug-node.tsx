import * as React from 'react';
import { connect } from "react-redux";

import { Children, isValidElement, cloneElement } from 'react';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { XYCanvas } from './visualizers/xy-canvas';
import { Number } from './visualizers/number';
import { Color } from './visualizers/color';
import { Text } from './visualizers/text';

import { GridCanvas, GridCanvasInfo } from './visualizers/grid-canvas';

import * as uuid from 'uuid';
const uuidV4 = uuid.v4;

export class DebugNodeHtmlPluginInfo {
	getWidth = (node) => {

		if (node && node.visualizer && node.visualizer == "gridcanvas") {
			const visualizerInfo = new GridCanvasInfo();
			return visualizerInfo.getWidth(node);
		}
		return;
	}

	getHeight(node) {
		if (node && node.visualizer && node.visualizer == "gridcanvas") {
			const visualizerInfo = new GridCanvasInfo();
			return visualizerInfo.getHeight(node);
		}
		return;
	}
}

export interface DebugNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
	nodes : any;
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
}

export class ContainedDebugNodeHtmlPlugin extends React.Component<DebugNodeHtmlPluginProps, DebugNodeHtmlPluginState> {
	state = {
		receivedPayload : []
	}

	observableId = uuidV4();

	componentDidMount() {
		console.log("registerFlowNodeObserver", this.props.node.name, this.observableId);
		this.props.flowrunnerConnector.registerFlowNodeObserver(this.props.node.name, this.observableId, this.receivePayloadFromNode);
	}

	componentDidUpdate(prevProps : any) {
		if (prevProps.nodes != this.props.nodes || prevProps.flow != this.props.flow) {
			console.log("componentDidUpdate 1",this.observableId,  this.props.node);
			this.props.flowrunnerConnector.unregisterFlowNodeObserver(prevProps.node.name, this.observableId);
			this.props.flowrunnerConnector.registerFlowNodeObserver(this.props.node.name, this.observableId, this.receivePayloadFromNode);
		}

		if (!prevProps || !prevProps.node || 
			(prevProps.node.name != this.props.node.name)) {
				console.log("componentDidUpdate 2", this.observableId, this.props.node);
			this.props.flowrunnerConnector.unregisterFlowNodeObserver(prevProps.node.name, this.observableId);
			this.props.flowrunnerConnector.registerFlowNodeObserver(this.props.node.name, this.observableId, this.receivePayloadFromNode);
		}

	}


	getWidth = () => {

		if (this.props.node.visualizer == "gridcanvas") {
			const visualizer = new GridCanvas({node: this.props.node,
				payloads: this.state.receivedPayload});
			return visualizer.getWidth();
		}
		return;
	}

	getHeight() {
		if (this.props.node.visualizer == "gridcanvas") {
			const visualizer = new GridCanvas({node: this.props.node,
				payloads: this.state.receivedPayload});
			return visualizer.getHeight();
		}
		return;
	}

	unmounted = false;
	componentWillUnmount() {
		this.unmounted = true;
		console.log("componentWillUnmount",this.observableId, this.props.node);
		this.props.flowrunnerConnector.unregisterFlowNodeObserver(this.props.node.name, this.observableId);
	}

	receivePayloadFromNode = (payload : any) => {
		//console.log("receivePayloadFromNode", payload, this.props.node);
		if (this.unmounted) {
			return;
		}		

		if (!!payload.isDebugCommand) {
			if (payload.debugCommand  === "resetPayloads") {
				this.setState((state, props) => {
					return {
						receivedPayload: []
					}
				})
			}
			return;
		}

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

		return;
	}

	render() {

		let visualizer = <></>;
		let additionalCssClass = "";

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
		if (this.props.node.visualizer == "color") {
			additionalCssClass = "html-plugin-node__h-100";
			visualizer = <Color node={this.props.node} payloads={this.state.receivedPayload}></Color>
		} else 
		if (this.props.node.visualizer == "gridcanvas") {
			additionalCssClass = "html-plugin-node__h-100";
			visualizer = <GridCanvas node={this.props.node} payloads={this.state.receivedPayload}></GridCanvas>
		} else
		if (this.props.node.visualizer == "xycanvas") {
			additionalCssClass = "html-plugin-node__h-100";
			visualizer = <XYCanvas flowrunnerConnector={this.props.flowrunnerConnector} selectedNode={this.props.selectedNode} node={this.props.node} payloads={this.state.receivedPayload}></XYCanvas>
		} else {
			const payload = this.state.receivedPayload[this.state.receivedPayload.length-1];
			if (payload && (payload as any).debugId) {
				delete (payload as any).debugId;
			}
			//console.log("debugtask" , this.props.node, payload, this.state);
			visualizer = <>{payload ? JSON.stringify(payload, null, 2) : ""}</>;
		}
		return <div className={"html-plugin-node html-plugin-node--wrap html-plugin-node--" + this.props.node.visualizer + " " + additionalCssClass} style={{		
			backgroundColor: "white"
		}}>{visualizer}			
		</div>;
		
	
	}
}

export const DebugNodeHtmlPlugin = connect(mapStateToProps)(ContainedDebugNodeHtmlPlugin);