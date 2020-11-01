import * as React from 'react';
import { connect } from "react-redux";

import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';

import { storeFlowNode } from '../../redux/actions/flow-actions';

import { ICanvasMode } from '../../redux/reducers/canvas-mode-reducers';

import { getFormControl } from './form-controls';

import * as uuid from 'uuid';
const uuidV4 = uuid.v4;


/*
	import { useSelector } from 'react-redux'
	import { useDispatch } from 'react-redux'


	export const CounterComponent = () => {
		const counter = useSelector(state => state.counter);
		const dispatch = useDispatch();
		return <><div>{counter}</div>
			<button onClick={() => dispatch({ type: 'increment-counter' })}>
				Increment counter
			</button>
		</>
	}
*/
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

		let metaInfo : any[] = [];
		if (this.taskSettings && this.taskSettings.metaInfo) {
			metaInfo = this.taskSettings && this.taskSettings.metaInfo;
		}
		if (!!this.taskSettings.hasMetaInfoInNode) {
			metaInfo = node.metaInfo || [];
		}

		if (metaInfo.length > 0) {
			const height = metaInfo.length * (70 + 16) + (48);

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
}

export interface FormNodeHtmlPluginState {
	value : string;
	values : string[];
	node : any;
	errors : any;
	datasource : any;
	receivedPayload : any;
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
	}
}

class ContainedFormNodeHtmlPlugin extends React.Component<FormNodeHtmlPluginProps, FormNodeHtmlPluginState> {

	state = {
		value : "",
		values : [],
		node : {},
		errors : {},
		datasource : {},
		receivedPayload : {}
	};

	observableId = uuidV4();

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

		this.props.flowrunnerConnector.registerFlowNodeObserver(this.props.node.name, this.observableId, this.receivePayloadFromNode);

	}

	componentDidUpdate(prevProps : FormNodeHtmlPluginProps) {
		if (prevProps.node !== this.props.node) {
			this.setState({
				node: this.props.node 
			});
		}

		if (prevProps.flow != this.props.flow) {
			this.props.flowrunnerConnector.unregisterFlowNodeObserver(prevProps.node.name, this.observableId);
			this.props.flowrunnerConnector.registerFlowNodeObserver(this.props.node.name, this.observableId, this.receivePayloadFromNode);
		}

		if (!prevProps || !prevProps.node || 
			(prevProps.node.name != this.props.node.name)) {
			this.props.flowrunnerConnector.unregisterFlowNodeObserver(prevProps.node.name, this.observableId);
			this.props.flowrunnerConnector.registerFlowNodeObserver(this.props.node.name, this.observableId, this.receivePayloadFromNode);
		}

	}

	unmounted = false;
	componentWillUnmount() {
		this.unmounted = true;
		if (this.throttleTimer) {
			clearTimeout(this.throttleTimer);
			this.throttleTimer = undefined;
		}

		this.props.flowrunnerConnector.unregisterFlowNodeObserver(this.props.node.name, this.observableId);
	}

	receivePayloadFromNode = (payload : any) => {
		const maxPayloads = 1;
		if (this.unmounted) {
			return;
		}		

		let metaInfo : any[] = [];
		if (this.props.taskSettings && this.props.taskSettings.metaInfo) {
			metaInfo = this.props.taskSettings && this.props.taskSettings.metaInfo;
		}
		if (!!this.props.taskSettings.hasMetaInfoInNode) {
			metaInfo = this.props.node.metaInfo || [];
		}

		if (!!payload.isDebugCommand) {
			if (payload.debugCommand  === "resetPayloads") {
				this.setState((state, props) => {
					return {
						receivedPayload: {}
					}
				})
			}
			return;
		}

		this.setState((state, props) => {
			let datasourcePropertyName: any = undefined;
			metaInfo.map((metaInfo) => {
				if (metaInfo.datasource && payload[metaInfo.datasource]) {
					datasourcePropertyName = metaInfo.datasource;
				}
		
			});
			let datasource = {...state.datasource};
			if (datasourcePropertyName) {
				datasource[datasourcePropertyName] = payload[datasourcePropertyName];
			}
			return {
				receivedPayload: payload,
				datasource : datasource
			}
		});

		return;
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

		let metaInfo : any[] = [];
		if (this.props.taskSettings && this.props.taskSettings.metaInfo) {
			metaInfo = this.props.taskSettings && this.props.taskSettings.metaInfo;
		}
		if (!!this.props.taskSettings.hasMetaInfoInNode) {
			metaInfo = this.props.node.metaInfo || [];
		}

		(metaInfo || []).map((metaInfo) => {
			if (metaInfo && !!metaInfo.required) {
				const value = this.state.values[metaInfo.fieldName] || this.props.node[metaInfo.fieldName] || "";
				if (value === "") {
					doSubmit = false;
					errors[metaInfo.fieldName] = `${metaInfo.fieldName} is a required field`;					
				}
			}
		});
		if (doSubmit) {
			this.setState({errors: []});
		} else {
			this.setState({errors: errors});
		}
		return false;
	}

	throttleTimer : any = undefined;
	onChange = (fieldName, fieldType, event: any) => {

		if (this.throttleTimer) {
			clearTimeout(this.throttleTimer)
		}
		
		const value = event.target.value;
		this.throttleTimer = setTimeout(() => {
			
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
					
					this.props.storeFlowNode(this.state.node, this.props.node.name);
				});
			}

		}, fieldType == "color" ? 50 : 5);
		
	}

	onReceiveValue = (value, metaInfo) => {

		if (this.throttleTimer) {
			clearTimeout(this.throttleTimer)
		}
		
		this.throttleTimer = setTimeout(() => {
			
			if (this.props.node && metaInfo.fieldName) {	
				let errors = {...this.state.errors};
				if (errors[metaInfo.fieldName]) {
					delete errors[metaInfo.fieldName];
				}

				this.setState({values : {
						...this.state.values,				
						[metaInfo.fieldName]: value
					},
					errors: errors, 	
					node : {
						...this.state.node, 
						[metaInfo.fieldName]: value
					}
				}, () => {
					
					this.props.storeFlowNode(this.state.node, this.props.node.name);
				});
			}

		}, metaInfo.fieldType == "color" ? 50 : 5);
		
	}

	getFieldType = (metaInfo) => {
		if (metaInfo.fieldType === "color") {
			return "color";
		}
		if (!metaInfo.fieldType) {
			return "text";
		}
		return metaInfo.fieldType;
	}

	render() {
		let metaInfo : any[] = [];
		if (this.props.taskSettings && this.props.taskSettings.metaInfo) {
			metaInfo = this.props.taskSettings && this.props.taskSettings.metaInfo;
		}
		if (!!this.props.taskSettings.hasMetaInfoInNode) {
			metaInfo = this.props.node.metaInfo || [];
		}
		return <div className="html-plugin-node" style={{			
				backgroundColor: "white"
			}}>
			<div className={"w-100 h-auto"}>
				<form className="form" onSubmit={this.onSubmit}>
					<>
						{metaInfo.map((metaInfo, index) => {
							const fieldType = this.getFieldType(metaInfo);
							if (!fieldType || fieldType == "text" || fieldType == "color") {						
								return <React.Fragment key={"index-f-" + index}>
										<div className="form-group">						
											<label htmlFor={"input-" + this.props.node.name}><strong>{metaInfo.fieldName || this.props.node.name}</strong>{!!metaInfo.required && " *"}</label>
											<div className="input-group mb-1">
												<input
													onChange={this.onChange.bind(this, metaInfo.fieldName, metaInfo.fieldType || "text")}
													key={"index" + index}
													type={fieldType}
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
							}
							if (fieldType) {
								let datasource : any;

								if (metaInfo.datasource == "[PLAYGROUNDFLOW]") {
									datasource = this.props.canvasMode.flowsPlayground;
								} else
								if (metaInfo.datasource == "[WASMFLOW]") {
									datasource = this.props.canvasMode.flowsWasm;
								} else
								if (metaInfo.datasource && this.state.datasource[metaInfo.datasource]) {
									datasource = this.state.datasource[metaInfo.datasource];
								} else {
									datasource = [];
								}

								return <React.Fragment key={"index-f-" + index}>{getFormControl(fieldType,{
									value: this.state.values[metaInfo.fieldName] || this.props.node[metaInfo.fieldName] || "",
									onChange: this.onReceiveValue,
									node: this.props.node,
									fieldName: metaInfo.fieldName,
									fieldType: metaInfo.fieldType,
									metaInfo: metaInfo,
									datasource : datasource
								})}</React.Fragment>
							}
							return null;
						})}
						<button className="d-none">OK</button>
					</> 
																				
				</form>
			</div>
		</div>;
	}
}

export const FormNodeHtmlPlugin = connect(mapStateToProps, mapDispatchToProps)(ContainedFormNodeHtmlPlugin);