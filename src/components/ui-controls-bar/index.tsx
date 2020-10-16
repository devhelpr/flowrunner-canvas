import * as React from 'react';
import { connect } from "react-redux";
import { IFlowrunnerConnector, IExecutionEvent } from '../../interfaces/IFlowrunnerConnector';
import { selectNode , setPayload} from '../../redux/actions/node-actions';

import Slider from '@material-ui/core/Slider';

export interface UIControlsBarProps {
	nodes : any[];
	flow: any[];

	canvasMode : any;
	selectedNode : any;
	selectNode : (name, node) => void;
	setPayload : (name, payload) => void;
	renderHtmlNode?: (node: any, flowrunnerConnector : IFlowrunnerConnector, nodes: any, flow: any, taskSettings: any) => any;
	flowrunnerConnector : IFlowrunnerConnector;

}

export interface UIControlsBarState {
	
}

const mapStateToProps = (state : any) => {
	return {
		flow: state.flow,
		nodes: state.rawFlow,
		selectedNode : state.selectedNode,		
		setPayload: state.setPayload,
		canvasMode : state.canvasMode
	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		selectNode: (name, node) => dispatch(selectNode(name, node)),
		setPayload: (name, payload) => dispatch(setPayload(name, payload))
	}
}

class ContainedUIControlsBar extends React.Component<UIControlsBarProps, UIControlsBarState> {
	constructor(props) {
		super(props);

		this.htmlElement = React.createRef();
	}

	htmlElement : any;
	componentDidMount() {
		this.props.flowrunnerConnector.registerFlowExecutionObserver("ContainedUIControlsBar" , (executionEvent : IExecutionEvent) => {
			if (!this.unmounted) {
				// TODO : fix this nasty workaround
				this.forceUpdate();
				//this.setState({payload: executionEvent.payload});
			}
		});
	}

	unmounted : boolean = false;
	componentWillUnmount() {
		this.unmounted = true;
		this.props.flowrunnerConnector.unregisterFlowExecuteObserver("ContainedUIControlsBar");

	}

	onChange = (event: object, value: number | number[]) => {
		let list = this.props.flowrunnerConnector.getNodeExecutions();
		if (value < list.length) {

			const root = document.getElementById("flowstudio-root");
			let maxHeight = (root?.clientHeight || 0) - (72 + 56);
			const maxValue = Math.min(list.length - 1 , maxHeight);

			const nodeInfo = list[(list.length - 1 - maxValue) + (value as number)];
			let nodes = this.props.nodes.filter(node => {
				return node.name == nodeInfo.name;
			});
			if (nodes.length > 0) {
				this.props.selectNode(nodeInfo.name, nodes[0]);
				this.props.setPayload(nodeInfo.name, nodeInfo.payload);
			}

		}
		(list as any) = null;
	}

	render() {
		if (this.props.canvasMode.flowType !== "playground") {
			return <></>;
		}
		/*if (this.props.selectedNode && this.props.selectedNode.name) {
			let list = this.props.flowrunnerConnector.getNodeExecutionsByNodeName(this.props.selectedNode.name);
			

			if (list && list.length > 0) {
				const debugInfo = JSON.stringify(list[list.length - 1], null, 2);
				return <div className="ui-controls-bar">
					<div className="ui-controls-bar__debug-info">
						<div className="ui-controls-bar__debug-info-content">
							{debugInfo}
						</div>
					</div>
				</div>
			}
			
			return <div className="ui-controls-bar"></div>;
		}
		*/
		let list = this.props.flowrunnerConnector.getNodeExecutions();
		let listLength = list.length;
		(list as any) = null;
		const root = document.getElementById("flowstudio-root");
		let maxHeight = (root?.clientHeight || 0) - (72 + 56);
		return <div className="ui-controls-bar ui-controls-bar__small-width">
			<Slider 
					valueLabelDisplay="auto"
					max={Math.min(listLength - 1 , maxHeight)} 
					defaultValue={0} 
					orientation="vertical"
					onChange={this.onChange} 
				/>
		</div>;
	/*
		return <div className="ui-controls-bar">
			{this.props.flow.map((node, index) => {
					let shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);
					const settings = ShapeSettings.getShapeSettings(node.taskType, node);
					const Shape = Shapes[shapeType];
					if (shapeType === "Html" && Shape) {
						const nodeClone = {...node};
						
						nodeClone.htmlPlugin = node.htmlPlugin || (settings as any).htmlPlugin || "";

						//console.log("ui control bar node.htmlPlugin", nodeClone.htmlPlugin);
						// height: (node.height || 250)+"px",

						if (node.htmlPlugin === "debugNode") {
							return <div key={"html" + index}					
								data-x={node.x} 
								data-y={node.y} 
								ref={this.htmlElement} 
								className="canvas__html-shape--in-bar"
								style={{											
									minHeight: (node.height || 250)+"px"									 
								}} 
								>
								<div className="canvas__html-shape-bar">{node.label ? node.label : node.name}</div>
									<div className="canvas__html-shape-body">
										{this.props.renderHtmlNode && this.props.renderHtmlNode(nodeClone, this.props.flowrunnerConnector, this.props.nodes, this.props.flow, settings)}
									</div>
								</div>;
						}
					}
					return null;
				})
			}
			
		</div>;
		*/
	}
}

export const UIControlsBar = connect(mapStateToProps, mapDispatchToProps)(ContainedUIControlsBar);