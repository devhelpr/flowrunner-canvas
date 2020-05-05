import * as React from 'react';
import { connect } from "react-redux";
import { ShapeSettings } from '../../helpers/shape-settings';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { Shapes } from '../canvas/shapes'; 
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';


export interface UIControlsBarProps {
	nodes : any[];
	flow: any[];

	renderHtmlNode?: (node: any, flowrunnerConnector : IFlowrunnerConnector, nodes: any, flow: any) => any;
	flowrunnerConnector : IFlowrunnerConnector;

}

export interface UIControlsBarState {
	
}

const mapStateToProps = (state : any) => {
	return {
		flow: state.flow,
		nodes: state.rawFlow		
	}
}

class ContainedUIControlsBar extends React.Component<UIControlsBarProps, UIControlsBarState> {
	constructor(props) {
		super(props);

		this.htmlElement = React.createRef();
	}

	htmlElement : any;

	render() {
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

export const UIControlsBar = connect(mapStateToProps)(ContainedUIControlsBar);