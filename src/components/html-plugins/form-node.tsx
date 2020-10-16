import * as React from 'react';
import { connect } from "react-redux";

import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';

import { storeFlowNode } from '../../redux/actions/flow-actions';
import { modifyRawFlow } from '../../redux/actions/raw-flow-actions';
import { storeRawFlow } from '../../redux/actions/raw-flow-actions';

import { ICanvasMode } from '../../redux/reducers/canvas-mode-reducers';

export class FormNodeHtmlPluginInfo {

	private taskSettings: any;
	constructor(taskSettings: any) {
		this.taskSettings = taskSettings;
		//console.log("FormNodeHtmlPluginInfo constructor", this.taskSettings);
	}

	getWidth(node) {
		return 300;
	}

	getHeight(node) {
		if (this.taskSettings && this.taskSettings.metaInfo) {
			const height = this.taskSettings.metaInfo.length * (70 + 16) + (48);

			//console.log("FormNodeHtmlPluginInfo height", height);
			return height;
		}
		//return (((node && node.rows) || 8) * 16) + (3 * 16) + 4 + 150;
	}
}


export interface FormNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
	flow: any;
	taskSettings : any;

	selectedNode: any;
	canvasMode: ICanvasMode;

	storeFlowNode: (node, orgNodeName) => void;
	modifyRawFlow: (node, orgNodeName) => void;
	storeRawFlow: (flow : any) => void;
}

export interface FormNodeHtmlPluginState {
	value : string;
	values : string[];
	node : any;
	errors : any;
}

const mapStateToProps = (state : any) => {
	return {
		selectedNode : state.selectedNode,
		flow: state.flow,
		canvasMode: state.canvasMode
	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		storeFlowNode: (node, orgNodeName) => dispatch(storeFlowNode(node, orgNodeName)),
		modifyRawFlow: (node, orgNodeName) => dispatch(modifyRawFlow(node, orgNodeName)),
		storeRawFlow: (flow) => dispatch(storeRawFlow(flow)),
	}
}

class ContainedFormNodeHtmlPlugin extends React.Component<FormNodeHtmlPluginProps, FormNodeHtmlPluginState> {

	state = {
		value : "",
		values : [],
		node : {},
		errors : {}
	};

	componentDidMount() {
		if (this.props.node) {

			if (this.props.node.nodeDatasource && this.props.node.nodeDatasource === "flow") {
				if (this.props.node.mode && this.props.node.mode === "list") {
					this.setState({node: this.props.node, values : this.props.node.values || this.props.node.defaultValues || []});
				} else {
					this.setState({node: this.props.node, value : this.props.node.value || this.props.node.defaultValue || ""});
				}
			} else {
				this.props.flowrunnerConnector.modifyFlowNode(
					this.props.node.name, 
					this.props.node.propertyName, 
					this.props.node.defaultValue || "",
					""
				);
				this.setState({node: this.props.node, value : this.props.node.defaultValue || ""});
			}
		}
	}
	
	onSubmit = (event: any) => {
		event.preventDefault();
		//		
		//	 debugNode doesn't get triggered after pushFlow...
		//   .. in the worker the observables that are used to send SendObservableNodePayload
		//     are reset/cleared before starting the flow
		//   .. this works different for SliderNode and GridEdit because they only use modifyFlowNode
		//	   and don't push the whole flow and restart it
		//   .. althought there seems to be a construct that should force this, but it doesn't always work probably 
		//
		//   .. do we need a "reset" method in DebugNodeHtmlPlugin which gets called from the outside after
		//      a flow has been pushed (via flowRunnerConnector) ?
		//	.. NO : simply store the flow again after pushing to flow to the flowrunner

		let doSubmit = true;
		let errors = {};
		(this.props.taskSettings.metaInfo || []).map((metaInfo) => {
			if (metaInfo && !!metaInfo.required) {
				const value = this.state.values[metaInfo.fieldName] || this.props.node[metaInfo.fieldName];
				if (value === "") {
					doSubmit = false;
					errors[metaInfo.fieldName] = `${metaInfo.fieldName} is a required field`;					
				}
			}
		});
		if (doSubmit) {
			this.setState({errors: []});
			this.props.flowrunnerConnector.pushFlowToFlowrunner(this.props.flow);
			this.props.storeRawFlow(this.props.flow);
		} else {
			this.setState({errors: errors});
		}
		return false;
	}

	onChange = (fieldName, event: any) => {

		const value = event.target.value;
		
		if (this.props.node && fieldName) {	
			let errors = {...this.state.errors};
			if (errors[fieldName]) {
				delete errors[fieldName];
			}

			this.setState({values : {
					...this.state.values,				
					[fieldName]: value
				},
				errors: errors, 	
				node : {
					...this.state.node, 
					[fieldName]: value
				}
			}, () => {
				
				this.props.modifyRawFlow(this.state.node, this.props.node.name);
				this.props.storeFlowNode(this.state.node, this.props.node.name);
			});
		}
	}

		

	render() {
		return <div className="html-plugin-node" style={{			
			backgroundColor: "white"
		}}>
			<div className={this.props.taskSettings && this.props.taskSettings.metaInfo ? "w-100 h-auto" : "w-100 h-auto"}>
				<form className="form" onSubmit={this.onSubmit}>
					{this.props.taskSettings && this.props.taskSettings.metaInfo && <>
						{(this.props.taskSettings.metaInfo || []).map((metaInfo, index) => {
							return <React.Fragment key={"index-f-" + index}>
									<div className="form-group">						
										<label htmlFor={"input-" + this.props.node.name}><strong>{metaInfo.fieldName || this.props.node.name}</strong>{!!metaInfo.required && " *"}</label>
										<div className="input-group mb-1">
											<input
												onChange={this.onChange.bind(this, metaInfo.fieldName)}
												key={"index" + index}
												className="form-control"
												value={this.state.values[metaInfo.fieldName] || this.props.node[metaInfo.fieldName]}
												id={"input-" + this.props.node.name + "-" +metaInfo.fieldName}
												data-index={index}
												disabled={!!this.props.canvasMode.isFlowrunnerPaused}													 
											/>			
										</div>
										{this.state.errors[metaInfo.fieldName] && <div className="text-danger">{this.state.errors[metaInfo.fieldName]}</div>}
									</div>
							</React.Fragment>
						})}
						<button className="d-none">OK</button>
					</> 
					}															
				</form>
			</div>
		</div>;
	}
}

export const FormNodeHtmlPlugin = connect(mapStateToProps, mapDispatchToProps)(ContainedFormNodeHtmlPlugin);