import * as React from 'react';
import { connect } from "react-redux";
import * as uuid from 'uuid';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { ShapeSettings } from '../../helpers/shape-settings';
//import { Shapes } from '../canvas/shapes'; 
import { storeFlow } from '../../redux/actions/flow-actions';
import { storeLayout } from '../../redux/actions/layout-actions';
import { Layout } from '@devhelpr/layoutrunner';
import { renderLayoutType } from './components/layout-renderer';
import { Flow } from '../flow';

import {
	setFlowrunnerPaused,
	setFlowrunnerPausedFunction,
	setFlowTypeFunction,
	setFlowType
} from '../../redux/actions/canvas-mode-actions';
import fetch from 'cross-fetch';

const uuidV4 = uuid.v4;

import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { flowAction } from '@devhelpr/flowrunner-redux';

export interface UserInterfaceViewProps {	

	flow: any[];
	layout : string;

	storeFlow : any;
	flowrunnerConnector : IFlowrunnerConnector;

	setFlowrunnerPaused: setFlowrunnerPausedFunction;
	setFlowType: setFlowTypeFunction;
	storeLayout : (layout : string) => void;

	renderHtmlNode?: (node: any, flowrunnerConnector : IFlowrunnerConnector, flow: any, taskSettings? : any) => any;
	getNodeInstance?: (node: any, flowrunnerConnector: IFlowrunnerConnector, flow: any, taskSettings? : any) => any;
	
}

export interface UserInterfaceViewState {
	flowName : string;
	layout : any;
	flowHash : any;

	titleBarBackgroundcolor : string;
	titleBarTitle : string;
	titleBarColor : string;
	titleBarFont : string;
	titleBarFontSize : string;
	titleBarFontWeight : string;

	isFlowLoaded : boolean;

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
		setFlowrunnerPaused: (paused: boolean) => dispatch(setFlowrunnerPaused(paused)),
		setFlowType: (flowType: string) => dispatch(setFlowType(flowType)),
		storeLayout: (layout: string) => dispatch(storeLayout(layout))

	}
};

export class ContainedUserInterfaceView extends React.Component<UserInterfaceViewProps, UserInterfaceViewState> {

	layoutTree : any;

	constructor(props) {
		super(props);
		this.layoutTree = JSON.parse(props.layout) || {};
		this.htmlWrapper = React.createRef();
		this.state = {
			flowName : "",
			flowHash : {},
			layout : this.getLayoutNodeFromTree(1, 0, 0),
			titleBarBackgroundcolor : "",
			titleBarTitle : "",
			titleBarColor : "",
			titleBarFont : "",
			titleBarFontSize : "",
			titleBarFontWeight : "",
			isFlowLoaded : false
		}
	}

	getLayoutNodeFromTree = (level, index, subIndex) => {
		let treeHashKey = level + "." + index + "." + subIndex;
		if (this.layoutTree[treeHashKey]) {
			let tree : any[] = this.layoutTree[treeHashKey];
			let layoutTree : any[] = [];
			tree.map((layoutBlock, treeIndex) => {
				if (layoutBlock.title == "element") {
					layoutTree.push({
						type : "element",
						title: layoutBlock.title,
						subtitle: layoutBlock.subtitle || ""
					});
				} else
				if (layoutBlock.title == "flowNode") {
					layoutTree.push({
						type : "flowNode",
						title: layoutBlock.title,
						subtitle: layoutBlock.subtitle || "",
						name: layoutBlock.subtitle || ""
					});
				} else
				if (layoutBlock.title == "layout2columns") {
					layoutTree.push({
						type : "layout2columns",
						title: layoutBlock.title,
						layout : 
							[this.getLayoutNodeFromTree(level + 1, treeIndex , 0),
								this.getLayoutNodeFromTree(level + 1, treeIndex , 1),
							]
					});
				} else {
					layoutTree.push({
						type : "layout",
						title: layoutBlock.title,
						layout : this.getLayoutNodeFromTree(level + 1, treeIndex , 0)
					});
				}
			});
			return layoutTree;
		}
		return [];
	}
	
	screenUICallback = (command : any) => {
		console.log("screenUICallback", command);
		if (command && command.action == "SendScreen" && command.payload) {
			const payload = command.payload;
			this.setState((state) => {
				let settings : any = {};
				if (payload.titleBarBackgroundcolor) {
					settings.titleBarBackgroundcolor = payload.titleBarBackgroundcolor;
				}
				if (payload.titleBarColor) {
					settings.titleBarColor = payload.titleBarColor;
				}
				if (payload.titleBarFont) {
					settings.titleBarFont = payload.titleBarFont;
				}
				if (payload.titleBarFontSize) {
					settings.titleBarFontSize = payload.titleBarFontSize;
				}
				if (payload.titleBarFontWeight) {
					settings.titleBarFontWeight = payload.titleBarFontWeight;
				}
				if (payload.titleBarFontWeight) {
					settings.titleBarFontWeight = payload.titleBarFontWeight;
				}
				if (payload.titleBarTitle) {
					settings.titleBarTitle = payload.titleBarTitle
				}
				return {
					...state,
					...settings
				}
			})
		}
	}

	componentDidMount() {

		this.props.flowrunnerConnector.registerScreenUICallback(this.screenUICallback);
		const paths = location.pathname.split("/");
		if (paths.length > 2) {
			if (paths[1] == "ui") {
				const flowId = paths[2];
				if (flowId !== undefined) {
					this.loadFlow(flowId);
				} else {
					console.error("No flowId specified");
				}
			}
		}

	}

	setupFlow(flowPackage: any) {
		setTimeout(() => {
			if (flowPackage.flowType === "playground") {
				this.props.flowrunnerConnector.setFlowType(flowPackage.flowType || "playground");
				this.props.setFlowrunnerPaused(false);
				this.props.setFlowType(flowPackage.flowType || "playground");
				//this.props.flowrunnerConnector.(flowPackage.flow);			
				this.props.storeFlow(flowPackage.flow);
				this.props.storeLayout(JSON.stringify(flowPackage.layout));
				
				let flowHash = {};
				flowPackage.flow.map((node) => {
					flowHash[node.name] = node;
					return true;
				});

				this.setState({
					flowName : flowPackage.name,
					flowHash: flowHash,
					isFlowLoaded : true
				});
			}

		} , 500);
	}
	htmlWrapper : any;
	loadFlow = (flowId) => {

		if (this.props.flowrunnerConnector.hasStorageProvider) {
			const flowPackage : any = this.props.flowrunnerConnector.storageProvider?.getFlow(flowId) as any;
			this.setupFlow(flowPackage);
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

			this.setupFlow(flowPackage);
			
		})
		.catch(err => {
			console.error(err);
		});
	}

	componentDidUpdate(prevProps : UserInterfaceViewProps) {
		
		if (prevProps.layout != this.props.layout) {
			this.layoutTree = JSON.parse(this.props.layout) || {};
			const layout = this.getLayoutNodeFromTree(1,0,0);
			console.log("layout in componentdidupdate", layout);
			this.setState({
				layout : layout
			});
		}

	}

	// todo : create layout for Layout via tree..

	render() {
		if (!this.state.isFlowLoaded) {
			return <></>;
		}

		let title = this.state.flowName || "UserInterface View";
		if (this.state.titleBarTitle !== "") {
			title = this.state.titleBarTitle;
		}

		let style : any = {};
		let navContainerClassName = "bg-dark mb-4";
		let navbarClassName = "navbar navbar-expand-lg navbar-light bg-dark";
		let h1ClassName = "text-white";

		if (this.state.titleBarBackgroundcolor) {
			style.backgroundColor = this.state.titleBarBackgroundcolor;
			navContainerClassName = "mb-4";
			navbarClassName = "navbar navbar-expand-lg navbar-light";
		}
		if (this.state.titleBarColor) {
			style.color = this.state.titleBarColor;
			h1ClassName = "";
		}
		if (this.state.titleBarFont) {
			style.fontFamily = this.state.titleBarFont;
		}
		if (this.state.titleBarFontSize) {
			style.fontSize = this.state.titleBarFontSize;
		}
		if (this.state.titleBarFontWeight) {
			style.fontWeight = this.state.titleBarFontWeight;
		}
		console.log("state", this.state,style);

		return <div className="pb-4">
			<div style={style} className={navContainerClassName}>
				<nav style={style} className={navbarClassName}>
					<h1 className={h1ClassName}>{title}</h1>
				</nav>
			</div>
			<div className="container">
				<Layout nodeName="ui"
					renderLayoutType={renderLayoutType}
					payload={{
						layout: this.state.layout,
						context : {
								flowHash : this.state.flowHash,
								flow: this.props.flow,
								getNodeInstance: this.props.getNodeInstance,
								flowrunnerConnector: this.props.flowrunnerConnector,
								renderHtmlNode: this.props.renderHtmlNode
							}
						}} />
			</div>
			<Flow flow={this.props.flow} flowrunnerConnector={this.props.flowrunnerConnector}></Flow>
		</div>
	}
}

export const UserInterfaceView = connect(mapStateToProps, mapDispatchToProps)(ContainedUserInterfaceView);


/*

<div ref={this.htmlWrapper} 
					className="canvas__html-elements ui-view__html-elements">
					
					{this.props.flow.map((node, index) => {
							if (!!node.hideFromUI) {
								return <React.Fragment key={index}></React.Fragment>
							}

							let shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);
							const settings = ShapeSettings.getShapeSettings(node.taskType, node);
							//const Shape = Shapes[shapeType];
							if (shapeType === "Html" && !!settings.hasUI) { //&& Shape
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
											width: (width || node.width || 250)+"px",
											minHeight: (height || node.height || 250)+"px",
											height: "auto",
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

	*/