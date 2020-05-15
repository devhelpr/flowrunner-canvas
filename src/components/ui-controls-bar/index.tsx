import * as React from 'react';
import { connect } from "react-redux";
import { ShapeSettings } from '../../helpers/shape-settings';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { Shapes } from '../canvas/shapes'; 
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { selectNode } from '../../redux/actions/node-actions';

import Slider from '@material-ui/core/Slider';

export interface UIControlsBarProps {
	nodes : any[];
	flow: any[];

	selectedNode : any;
	selectNode : (name, node) => void;
	renderHtmlNode?: (node: any, flowrunnerConnector : IFlowrunnerConnector, nodes: any, flow: any) => any;
	flowrunnerConnector : IFlowrunnerConnector;

}

export interface UIControlsBarState {
	
}

const mapStateToProps = (state : any) => {
	return {
		flow: state.flow,
		nodes: state.rawFlow,
		selectedNode : state.selectedNode,		
	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		selectNode: (name, node) => dispatch(selectNode(name, node))
	}
}

class ContainedUIControlsBar extends React.Component<UIControlsBarProps, UIControlsBarState> {
	constructor(props) {
		super(props);

		this.htmlElement = React.createRef();
	}

	htmlElement : any;
	componentDidMount() {
		this.props.flowrunnerConnector.registerFlowExecutionObserver("ContainedUIControlsBar" , () => {
			if (!this.unmounted) {
				// TODO : fix this nasty workaround
				this.forceUpdate();
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
				return node.name !== nodeInfo.name;
			});
			if (nodes.length > 0) {
				this.props.selectNode(nodeInfo.name, nodes[0]);
			}

		}
	}

	render() {
		
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
		const root = document.getElementById("flowstudio-root");
		let maxHeight = (root?.clientHeight || 0) - (72 + 56);
		return <div className="ui-controls-bar ui-controls-bar__small-width">
			<Slider 
					valueLabelDisplay="auto"
					max={Math.min(list.length - 1 , maxHeight)} 
					defaultValue={0} 
					orientation="vertical"
					onChange={this.onChange} 
				/>
		</div>;

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
										{this.props.renderHtmlNode && this.props.renderHtmlNode(nodeClone, this.props.flowrunnerConnector, this.props.nodes, this.props.flow)}
									</div>
								</div>;
						}
					}
					return null;
				})
			}
			
		</div>;
	}
}

export const UIControlsBar = connect(mapStateToProps, mapDispatchToProps)(ContainedUIControlsBar);