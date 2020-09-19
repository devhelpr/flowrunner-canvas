import * as React from 'react';
import { connect } from "react-redux";
import * as uuid from 'uuid';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { ShapeSettings } from '../../helpers/shape-settings';
import { Shapes } from '../canvas/shapes'; 
import { storeRawFlow } from '../../redux/actions/raw-flow-actions';
import { storeFlow } from '../../redux/actions/flow-actions';

import {
	setFlowrunnerPaused,
	setFlowrunnerPausedFunction,
	setFlowTypeFunction,
	setFlowType
} from '../../redux/actions/canvas-mode-actions';
import fetch from 'cross-fetch';

const uuidV4 = uuid.v4;

import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';

export interface UserInterfaceViewProps {	

	nodes : any[];
	flow: any[];

	storeFlow : any;
	storeRawFlow: (flow : any) => void;
	setFlowrunnerPaused: setFlowrunnerPausedFunction;
	setFlowType: setFlowTypeFunction;

	renderHtmlNode?: (node: any, flowrunnerConnector : IFlowrunnerConnector, nodes: any, flow: any, taskSettings? : any) => any;
	flowrunnerConnector : IFlowrunnerConnector;
	getNodeInstance?: (node: any, flowrunnerConnector: IFlowrunnerConnector, nodes : any, flow: any, taskSettings? : any) => any;
	
}

const mapStateToProps = (state : any) => {
	return {
		flow: state.flow,
		nodes: state.rawFlow		
	}
}
const mapDispatchToProps = (dispatch: any) => {
	return {
		storeFlow: (flow) => dispatch(storeFlow(flow)),
		storeRawFlow: (flow) => dispatch(storeRawFlow(flow)),
		setFlowrunnerPaused: (paused: boolean) => dispatch(setFlowrunnerPaused(paused)),
		setFlowType: (flowType: string) => dispatch(setFlowType(flowType))

	}
};

export class ContainedUserInterfaceView extends React.Component<UserInterfaceViewProps> {


	constructor(props) {
		super(props);

		this.htmlWrapper = React.createRef();
	}

	componentDidMount() {
		const paths = location.pathname.split("/");
		if (paths.length > 2) {
			if (paths[1] == "ui") {
				const flowId = Number(paths[2]);
				if (!isNaN(flowId)) {
					this.loadFlow(flowId);
				}
			}
		}

	}

	htmlWrapper : any;
	loadFlow = (flowId) => {

		fetch('/flow?flow=' + flowId)
		.then(res => {
			if (res.status >= 400) {
				throw new Error("Bad response from server");
			}
			return res.json();
		})
		.then(flowPackage => {

			setTimeout(() => {
				if (flowPackage.flowType === "playground") {
					this.props.flowrunnerConnector.setFlowType(flowPackage.flowType || "playground");
					this.props.setFlowrunnerPaused(false);
					this.props.setFlowType(flowPackage.flowType || "playground");
					this.props.flowrunnerConnector.pushFlowToFlowrunner(flowPackage.flow);			
					this.props.storeRawFlow(flowPackage.flow);
				}

			} , 500);
			
		})
		.catch(err => {
			console.error(err);
		});
	}

	componentDidUpdate(prevProps : UserInterfaceViewProps) {
		if (prevProps.nodes != this.props.nodes) {
			this.props.storeFlow(this.props.nodes);
		}
	}

	render() {
		console.log("flow" , this.props.flow);
		return <div>
			<h1>UserInterface View</h1>

			<div ref={this.htmlWrapper} 
					className="canvas__html-elements">
					
					{this.props.flow.map((node, index) => {
							let shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);
							const settings = ShapeSettings.getShapeSettings(node.taskType, node);
							const Shape = Shapes[shapeType];
							if (shapeType === "Html" && Shape && !!settings.hasUI) {
								const nodeClone = {...node};

								const isSelected = false;
								nodeClone.htmlPlugin = node.htmlPlugin || (settings as any).htmlPlugin || "";
								
								let width = undefined;
								let height = undefined;

								if (this.props.getNodeInstance) {
									const instance = this.props.getNodeInstance(node, this.props.flowrunnerConnector, this.props.nodes, this.props.flow, settings);
									if (instance) {
										if (instance.getWidth && instance.getHeight) {
											width = instance.getWidth(node);
											height = instance.getHeight(node);
										}
									}
								}

								return <div key={"html" + index}
									style={{																						
											width: "100%",
											height: height ? height + "px" : "auto",
											opacity: 1,
											position: "relative"						 
										}}
									data-node={node.name}	 
									data-x={node.x} 
									data-y={node.y} 
									className="canvas__html-shape">
										<div className="canvas__html-shape-body">
										{this.props.renderHtmlNode && this.props.renderHtmlNode(nodeClone, this.props.flowrunnerConnector, this.props.nodes, this.props.flow, settings)}</div>										
										</div>;
							}
							return null;
						})
					}
				</div>
		</div>
	}
}

export const UserInterfaceView = connect(mapStateToProps, mapDispatchToProps)(ContainedUserInterfaceView);