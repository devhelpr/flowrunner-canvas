import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

import { LayoutWithDropArea } from './components/layout-with-droparea';

import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { ShapeSettings } from '../../helpers/shape-settings';

import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { renderFlowNode } from '../userinterface-view/components/layout-renderer';
import { Flow } from '../flow';

import { useFlowStore} from '../../state/flow-state';
import { useLayoutStore} from '../../state/layout-state';
import { useCanvasModeStateStore} from '../../state/canvas-mode-state';

export interface UserInterfaceViewEditorProps {
	flowrunnerConnector : IFlowrunnerConnector;
	renderHtmlNode?: (node: any, flowrunnerConnector : IFlowrunnerConnector, flow: any, taskSettings? : any) => any;
	getNodeInstance?: (node: any, flowrunnerConnector: IFlowrunnerConnector, flow: any, taskSettings? : any) => any;
}

export interface UserInterfaceViewEditorState {
	tree : any;
	renderIndex : number;
	flowHash : any;
	nodesOnLayout : any;
}

export const UserInterfaceViewEditor = (props : UserInterfaceViewEditorProps) => {

	const [tree, setTree] = useState({} as any);
	const [renderIndex, setRenderIndex] = useState(1);
	const [flowHash, setFlowHash] = useState({} as any);
	const [nodesOnLayout, setNodesOnLayout] = useState({} as any);

	const flow = useFlowStore();
	const canvasMode = useCanvasModeStateStore();
	const layout = useLayoutStore();

	useEffect(() => {
		let newFlowHash = {};
		flow.flow.map((node) => {
			newFlowHash[node.name] = node;
			return true;
		});

		let initTree : any = JSON.parse(layout.layout) || {};
		setTree(initTree);
		setFlowHash(newFlowHash);
		setNodesOnLayout(getFlowNodeFromTree(initTree, 1,0,0));
		
	}, []);

	const getFlowNodeFromTree = (layoutTree : any, level, index, subIndex) => {
		let treeHashKey = level + "." + index + "." + subIndex;
		if (layoutTree[treeHashKey]) {
			let tree : any[] = layoutTree[treeHashKey];
			let flowNodes : any = {};
			tree.map((layoutBlock, treeIndex) => {
				if (layoutBlock.title == "flowNode") {
					flowNodes[layoutBlock.subtitle] = true;
				} else
				if (layoutBlock.title == "layout2columns") {
					flowNodes = {...flowNodes,...getFlowNodeFromTree(layoutTree, level + 1, treeIndex , 0)};
					flowNodes = {...flowNodes,...getFlowNodeFromTree(layoutTree, level + 1, treeIndex , 1)};
				} else {
					flowNodes = {...flowNodes,...getFlowNodeFromTree(layoutTree, level + 1, treeIndex , 0)};				
				}
			});
			return flowNodes;
		}
		return {};
	}

	const onStoreLayout = (level, index, subIndex, layout : any) => {
		
		let updatedTree = {...tree};
		let treeHashKey = level + "." + index + "." + subIndex;
		updatedTree[treeHashKey] = layout;
		setRenderIndex(renderIndex + 1);

		setTree(updatedTree);
		setNodesOnLayout(getFlowNodeFromTree(updatedTree, 1,0,0));
						
	}

	useEffect(() => {
		layout.storeLayout(JSON.stringify(tree));
	}, [tree]);

	const onGetLayout = (level, index, subIndex) => {
		let treeHashKey = level + "." + index + "." + subIndex;
		if (tree[treeHashKey]) {
			return tree[treeHashKey];
		}
		return false;
	}

	const onDragStart = (event) => {
		// event.target.id
		event.dataTransfer.setData("data-draggable", 
			JSON.stringify({
				title:event.target.getAttribute("data-draggable"),
				subtitle: event.target.getAttribute("data-id") || ""
			})
		)
	}

	const clearLayout = (event) => {
		event.preventDefault();
		setTree({});
		setRenderIndex(renderIndex + 1);
		setNodesOnLayout({});		
		return false;
	}

	/*shouldComponentUpdate(nextProps, nextState) {
		return (nextProps.layout !== props.layout ||
			nextState.tree !== state.tree ||
			nextState.renderIndex !== state.renderIndex ||
			nextProps.flow !== props.flow ||
			nextState.flowHash !== state.flowHash ||
			nextState.flowHash.keys.length !== state.flowHash.keys.length ||
			nextState.nodesOnLayout !== state.nodesOnLayout ||
			nextState.nodesOnLayout.keys.length !== state.nodesOnLayout.keys.length
			);
	}
	*/

	return <>
		<div className="container-fluid">
			<h1>UIVIEW EDITOR</h1>
			<div className="row ui-editor__row">
				<div className="col-10 layout__dropzone">
					<div className="layout__dropzone-inner" data-renderindex={renderIndex}>
						<LayoutWithDropArea 
							onGetLayout={onGetLayout}
							onStoreLayout={onStoreLayout} 
							layoutIndex={0} 
							name="l" 
							level={1}
							tree={tree}
							getNodeInstance={props.getNodeInstance}
							flowrunnerConnector={props.flowrunnerConnector}
							flow={flow.flow}
							renderHtmlNode={props.renderHtmlNode}
							flowHash={flowHash}
						></LayoutWithDropArea>
					</div>
				</div>
				<div className="col-2 layout__draggables">
					<div>
						<button type="button" onClick={clearLayout} className="btn btn-danger">Clear layout</button>
					</div>
					<div onDragStart={onDragStart} data-draggable="layout" draggable={true} className="layout__draggable">Layout</div>
					<div onDragStart={onDragStart} data-draggable="layout2columns" draggable={true} className="layout__draggable">Layout 2columns</div>
					<div onDragStart={onDragStart} data-draggable="element" draggable={true} className="layout__draggable">Element</div>

						{flow.flow.filter((node, index) => {
								if (!!node.hideFromUI || nodesOnLayout[node.name]) {
									return false
								}

								let shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);
								const settings = ShapeSettings.getShapeSettings(node.taskType, node);
								if (shapeType === "Html" && !!settings.hasUI) { //&& Shape
									return true;
								}
								return false;
							}).map((flowNode, index) => {
								//console.log("flowNode", flowNode.name);
								return <div key={"flowNode-"+index} onDragStart={onDragStart} data-draggable="flowNode" data-id={flowNode.name} draggable={true} className="layout__draggable">
									<label>{flowNode.name}</label>
									{renderFlowNode(flowNode, {
										context : {
											getNodeInstance: props.getNodeInstance,
											flowrunnerConnector: props.flowrunnerConnector,
											flow: flow.flow,
											renderHtmlNode: props.renderHtmlNode
										}
									}, false)}
								</div>;
							})
						}
				</div>
			</div>
		</div>
		<Flow 
			flow={flow.flow} 
			flowrunnerConnector={props.flowrunnerConnector}
			flowId={flow.flowId}
		></Flow>
	</>;
}