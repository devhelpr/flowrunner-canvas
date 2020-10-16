import * as React from 'react';
import { LayoutWithDropArea } from './components/layout-with-droparea';

import { connect } from "react-redux";
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { ShapeSettings } from '../../helpers/shape-settings';
import { storeFlow } from '../../redux/actions/flow-actions';
import { storeLayout } from '../../redux/actions/layout-actions';

import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import produce from 'immer';
import { renderFlowNode } from '../userinterface-view/components/layout-renderer';

export interface UserInterfaceViewEditorProps {
	flow: any[];
	layout: string;

	storeFlow : any;
	flowrunnerConnector : IFlowrunnerConnector;

	storeLayout: (layout : string) => void;

	renderHtmlNode?: (node: any, flowrunnerConnector : IFlowrunnerConnector, flow: any, taskSettings? : any) => any;
	getNodeInstance?: (node: any, flowrunnerConnector: IFlowrunnerConnector, flow: any, taskSettings? : any) => any;

}

const mapStateToProps = (state : any) => {
	return {
		flow: state.flow,
		layout: state.layout	
	}
}
const mapDispatchToProps = (dispatch: any) => {
	return {
		storeFlow: (flow) => dispatch(storeFlow(flow)),
		storeLayout: (layout : string) => dispatch(storeLayout(layout))
	}
};


export interface UserInterfaceViewEditorState {
	tree : any;
	renderIndex : number;
	flowHash : any;
	nodesOnLayout : any;

}

export class ContainedUserInterfaceViewEditor extends React.Component<UserInterfaceViewEditorProps,UserInterfaceViewEditorState> {

	constructor(props) {
		super(props);
		this.state = {
			tree: (props.layout && JSON.parse(props.layout)) || {},
			renderIndex : 1,
			flowHash: {},
			nodesOnLayout: {}
		}
	}

	componentDidMount() {
		let flowHash = {};
		this.props.flow.map((node) => {
			flowHash[node.name] = node;
			return true;
		});

		this.setState({
			flowHash: flowHash,
			nodesOnLayout : this.getFlowNodeFromTree(this.state.tree, 1,0,0)
		});
	}

	getFlowNodeFromTree = (layoutTree : any, level, index, subIndex) => {
		let treeHashKey = level + "." + index + "." + subIndex;
		if (layoutTree[treeHashKey]) {
			let tree : any[] = layoutTree[treeHashKey];
			let flowNodes : any = {};
			tree.map((layoutBlock, treeIndex) => {
				if (layoutBlock.title == "flowNode") {
					flowNodes[layoutBlock.subtitle] = true;
				} else
				if (layoutBlock.title == "layout2columns") {
					flowNodes = {...flowNodes,...this.getFlowNodeFromTree(layoutTree, level + 1, treeIndex , 0)};
					flowNodes = {...flowNodes,...this.getFlowNodeFromTree(layoutTree, level + 1, treeIndex , 1)};
				} else {
					flowNodes = {...flowNodes,...this.getFlowNodeFromTree(layoutTree, level + 1, treeIndex , 0)};				
				}
			});
			return flowNodes;
		}
		return {};
	}

	onStoreLayout = (level, index, subIndex, layout : any) => {
		this.setState(state => {
			let tree = {...state.tree};
			let treeHashKey = level + "." + index + "." + subIndex;
			tree[treeHashKey] = layout;
			return produce(state, draft => {
				return {
					renderIndex : draft.renderIndex,
					tree,
					nodesOnLayout : this.getFlowNodeFromTree(tree, 1,0,0)
				}			
			});
		}, () => {
			this.props.storeLayout(JSON.stringify(this.state.tree));
		});
	}

	onGetLayout = (level, index, subIndex) => {
		let treeHashKey = level + "." + index + "." + subIndex;
		if (this.state.tree[treeHashKey]) {
			return this.state.tree[treeHashKey];
		}
		return false;
	}

	onDragStart = (event) => {
		// event.target.id
		event.dataTransfer.setData("data-draggable", 
			JSON.stringify({
				title:event.target.getAttribute("data-draggable"),
				subtitle: event.target.getAttribute("data-id") || ""
			})
		)
	}

	clearLayout = (event) => {
		event.preventDefault();
		this.setState(state => {			
			return produce(state, draft => {			
				return {
					tree: {},
					renderIndex : draft.renderIndex + 1,
					nodesOnLayout: {}
				}
			})
		}, () => {
			this.props.storeLayout(JSON.stringify({}));			
		});
		return false;
	}

	shouldComponentUpdate(nextProps, nextState) {
		return (nextProps.layout !== this.props.layout ||
			nextState.tree !== this.state.tree ||
			nextState.renderIndex !== this.state.renderIndex ||
			nextProps.flow !== this.props.flow ||
			nextState.flowHash !== this.state.flowHash ||
			nextState.flowHash.keys.length !== this.state.flowHash.keys.length ||
			nextState.nodesOnLayout !== this.state.nodesOnLayout ||
			nextState.nodesOnLayout.keys.length !== this.state.nodesOnLayout.keys.length
			);
	}

	render() {

		return <>
			<div className="container-fluid">
				<h1>UIVIEW EDITOR</h1>
				<div className="row ui-editor__row">
					<div className="col-10 layout__dropzone">
						<div className="layout__dropzone-inner" data-renderindex={this.state.renderIndex}>
							<LayoutWithDropArea 
								onGetLayout={this.onGetLayout}
								onStoreLayout={this.onStoreLayout} 
								layoutIndex={0} 
								name="l" 
								level={1}
								tree={this.state.tree}
								getNodeInstance={this.props.getNodeInstance}
								flowrunnerConnector={this.props.flowrunnerConnector}
								flow={this.props.flow}
								renderHtmlNode={this.props.renderHtmlNode}
								flowHash={this.state.flowHash}
							></LayoutWithDropArea>
						</div>
					</div>
					<div className="col-2 layout__draggables">
						<div>
							<button type="button" onClick={this.clearLayout} className="btn btn-danger">Clear layout</button>
						</div>
		  				<div onDragStart={this.onDragStart} data-draggable="layout" draggable={true} className="layout__draggable">Layout</div>
		  				<div onDragStart={this.onDragStart} data-draggable="layout2columns" draggable={true} className="layout__draggable">Layout 2columns</div>
		  				<div onDragStart={this.onDragStart} data-draggable="element" draggable={true} className="layout__draggable">Element</div>

						  {this.props.flow.filter((node, index) => {
							if (!!node.hideFromUI || this.state.nodesOnLayout[node.name]) {
								return false
							}

							let shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);
							const settings = ShapeSettings.getShapeSettings(node.taskType, node);
							if (shapeType === "Html" && !!settings.hasUI) { //&& Shape
								return true;
							}
							return false;
						}).map((flowNode, index) => {
							return <div key={"flowNode-"+index} onDragStart={this.onDragStart} data-draggable="flowNode" data-id={flowNode.name} draggable={true} className="layout__draggable"><label>{flowNode.name}</label>
							{renderFlowNode(flowNode, {
								context : {
									getNodeInstance: this.props.getNodeInstance,
									flowrunnerConnector: this.props.flowrunnerConnector,
									flow: this.props.flow,
									renderHtmlNode: this.props.renderHtmlNode
								}
							})}</div>
						})
					}
					</div>
				</div>
			</div>
		</>;
	}
}

export const UserInterfaceViewEditor = connect(mapStateToProps, mapDispatchToProps)(ContainedUserInterfaceViewEditor);