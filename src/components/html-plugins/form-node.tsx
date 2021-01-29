import * as React from 'react';
import { Suspense } from 'react';

import { connect } from "react-redux";

import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';

import { storeFlowNode } from '../../redux/actions/flow-actions';

import { ICanvasMode } from '../../redux/reducers/canvas-mode-reducers';

import { getFormControl } from './form-controls';

import { createExpressionTree, executeExpressionTree } from '@devhelpr/expressionrunner';


import * as uuid from 'uuid';
const uuidV4 = uuid.v4;


/*

	Limitations

		- can currently have only 1 datasource per form


	Example redux and hooks

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
	flowrunnerConnector? : IFlowrunnerConnector;
	node : any;
	flow? : any;
	taskSettings? : any;

	selectedNode?: any;
	canvasMode?: ICanvasMode;

	isObjectListNodeEditing? : boolean;
	isReadOnly? : boolean;

	isNodeSettingsUI? : boolean;

	onSetValue? : (value, fieldName) => void;
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
				if (this.props.node.taskType == "FormTask") {
					this.props.flowrunnerConnector?.modifyFlowNode(
						this.props.node.name, 
						this.props.node.propertyName, 
						this.props.node.defaultValue || "",
						""
					);
				}
				this.setState({node: this.props.node, values: [], value : this.props.node.defaultValue || ""});
			}
		}

		this.props.flowrunnerConnector?.registerFlowNodeObserver(this.props.node.name, this.observableId, this.receivePayloadFromNode);

	}

	componentDidUpdate(prevProps : FormNodeHtmlPluginProps) {
		if (prevProps.node !== this.props.node) {
			this.setState({
				node: this.props.node,				
			});
		}

		if (prevProps.flow != this.props.flow) {
			this.props.flowrunnerConnector?.unregisterFlowNodeObserver(prevProps.node.name, this.observableId);
			this.props.flowrunnerConnector?.registerFlowNodeObserver(this.props.node.name, this.observableId, this.receivePayloadFromNode);

			this.setState({values: []});
		}

		if (!prevProps || !prevProps.node || 
			(prevProps.node.name != this.props.node.name)) {
			this.props.flowrunnerConnector?.unregisterFlowNodeObserver(prevProps.node.name, this.observableId);
			this.props.flowrunnerConnector?.registerFlowNodeObserver(this.props.node.name, this.observableId, this.receivePayloadFromNode);
		}

	}

	unmounted = false;
	componentWillUnmount() {
		this.unmounted = true;
		if (this.throttleTimer) {
			clearTimeout(this.throttleTimer);
			this.throttleTimer = undefined;
		}

		this.props.flowrunnerConnector?.unregisterFlowNodeObserver(this.props.node.name, this.observableId);
	}

	timer : any;
	lastTime : any;
	receivePayloadFromNode = (payload : any) => {
		const maxPayloads = 1;
		if (this.unmounted) {
			return;
		}		
		

		let metaInfo : any[] = [];

		if (!!this.props.isNodeSettingsUI) {
			metaInfo = this.props.taskSettings.configMenu.fields
		} else {
			if (this.props.taskSettings && this.props.taskSettings.metaInfo) {
				metaInfo = this.props.taskSettings && this.props.taskSettings.metaInfo;
			}
			if (!!this.props.taskSettings.hasMetaInfoInNode) {
				metaInfo = this.props.node.metaInfo || [];
			}
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

		let datasourcePropertyName: any = undefined;
		metaInfo.map((metaInfo) => {
			if (metaInfo.datasource && payload[metaInfo.datasource]) {
				datasourcePropertyName = metaInfo.datasource;
			}
	
		});

		if (datasourcePropertyName) {
			if (!this.lastTime || performance.now() > this.lastTime + 30) {
				this.lastTime = performance.now();
				if (this.timer) {
					clearTimeout(this.timer);
					this.timer = undefined;
				}
				this.setState((state, props) => {
					
					let datasource = {...state.datasource};
					if (datasourcePropertyName) {
						datasource[datasourcePropertyName] = payload[datasourcePropertyName];
					}
					return {
						receivedPayload: payload,
						datasource : datasource
					}
				});
			} else {
				if (this.timer) {
					clearTimeout(this.timer);
					this.timer = undefined;
				}
	
				this.timer = setTimeout(() => {
					this.timer = undefined;
					this.setState((state, props) => {
				
						let datasource = {...state.datasource};
						if (datasourcePropertyName) {
							datasource[datasourcePropertyName] = payload[datasourcePropertyName];
						}
						return {
							receivedPayload: payload,
							datasource : datasource
						}
					});
				}, 30);
			}
		} else {
			this.setState((state, props) => {
				return {
					receivedPayload: payload
				}
			});
		}
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
		if (!!this.props.isObjectListNodeEditing) {
			metaInfo = this.props.node.metaInfo || [];
		} else
		if (!!this.props.isNodeSettingsUI) {
			metaInfo = this.props.taskSettings.configMenu.fields
		} else {
			if (this.props.taskSettings && this.props.taskSettings.metaInfo) {
				metaInfo = this.props.taskSettings && this.props.taskSettings.metaInfo;
			}
			if (!!this.props.taskSettings.hasMetaInfoInNode) {
				metaInfo = this.props.node.metaInfo || [];
			}
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

	setValue = (fieldName, value, metaInfo) => {
		if (this.props.node && fieldName) {	
			let errors = {...this.state.errors};
			if (errors[fieldName]) {
				delete errors[fieldName];
			}

			if (metaInfo.fieldType == "date") {
				console.log("setValue date", value);
			}
			let clearValues = {};
			if (this.state.values[fieldName] === undefined || value != this.state.values[fieldName]) {
				if (metaInfo.clearFields) {
					metaInfo.clearFields.map((fieldName) => {
						clearValues[fieldName] = "";
					})
				}
			}
			console.log("setValueViaOnReceive", metaInfo.fieldName, clearValues);
			this.setState({values : {
					...this.state.values,
					...clearValues,			
					[fieldName]: value
				},
				errors: errors, 	
				node : {
					...this.state.node, 
					[fieldName]: value
				}
			}, () => {
				console.log("this.props.node.name",value,this.props.node.name, this.state);
				if (!this.props.isNodeSettingsUI && !this.props.isObjectListNodeEditing) {
					if (this.props.node.taskType == "FormTask") {
						console.log("here1");
						this.props.flowrunnerConnector?.modifyFlowNode(
							this.props.node.name, 
							fieldName, 
							value,
							this.props.node.name,
							'',
							this.state.values
						);
					} else {
						console.log("here2");
						this.props.storeFlowNode(this.state.node, this.props.node.name);
					}
					
				} else if (this.props.onSetValue) {
					console.log("here3");

					this.props.onSetValue(value, fieldName);
				}
			});
		}
	}

	throttleTimer : any = undefined;
	onChange = (fieldName, fieldType, metaInfo, event: any) => {
		event.preventDefault();
		let valueForNode : any;
		if (metaInfo && metaInfo.dataType === "number") {
			valueForNode = Number(event.target.value);
		} else {
			valueForNode = event.target.value;
		}

		if (fieldType == "color" ) {
			if (this.throttleTimer) {
				clearTimeout(this.throttleTimer)
			}
						
			this.throttleTimer = setTimeout(() => {
				
				this.setValue(fieldName, valueForNode, metaInfo);

			}, fieldType == "color" ? 50 : 5);
		} else {					
			this.setValue(fieldName, valueForNode, metaInfo);
		}
		
		return false;
	}

	setValueViaOnReceive = (value, metaInfo) => {
		if (this.props.node && metaInfo.fieldName) {	
			let errors = {...this.state.errors};
			if (errors[metaInfo.fieldName]) {
				delete errors[metaInfo.fieldName];
			}			

			let clearValues = {};
			if (this.state.values[metaInfo.fieldName] === undefined || value != this.state.values[metaInfo.fieldName]) {
				if (metaInfo.clearFields) {
					metaInfo.clearFields.map((fieldName) => {
						clearValues[fieldName] = "";
					})
				}
			}
			console.log("setValueViaOnReceive", metaInfo.fieldName, clearValues);

			this.setState({values : {
					...this.state.values,
					...clearValues,				
					[metaInfo.fieldName]: value
				},
				errors: errors, 	
				node : {
					...this.state.node, 
					[metaInfo.fieldName]: value
				}
			}, () => {
				if (!this.props.isNodeSettingsUI && !this.props.isObjectListNodeEditing) {
					if (this.props.node.taskType == "FormTask") {

						// TODO : this should also push through all fields from this formnode
						// 		kan dat de hele state.values zijn ?

						this.props.flowrunnerConnector?.modifyFlowNode(
							this.props.node.name, 
							metaInfo.fieldName, 
							value,
							this.props.node.name,
							'',
							this.state.values
						);
					} else { 					
						this.props.storeFlowNode(this.state.node, this.props.node.name);
					}
				} else  if (this.props.onSetValue) {
					this.props.onSetValue(value, metaInfo.fieldName);
				}
			});
		}
	}

	onReceiveValue = (value, metaInfo) => {

		if (metaInfo.fieldType == "color") {
			if (this.throttleTimer) {
				clearTimeout(this.throttleTimer)
			}
			
			this.throttleTimer = setTimeout(() => {
				this.setValueViaOnReceive(value, metaInfo);		
			}, metaInfo.fieldType == "color" ? 50 : 5);
		} else {
			this.setValueViaOnReceive(value, metaInfo);
		}
		
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
		if (!!this.props.isNodeSettingsUI) {
			metaInfo = this.props.taskSettings.configMenu.fields
		} else {
			if (this.props.taskSettings && this.props.taskSettings.metaInfo) {
				metaInfo = this.props.taskSettings && this.props.taskSettings.metaInfo;
			}
			if (!!this.props.isObjectListNodeEditing || 
				!!this.props.taskSettings.hasMetaInfoInNode) {
				metaInfo = this.props.node.metaInfo || [];
			}
		}

		const renderFields = () => {
			return <>
				{metaInfo.map((metaInfo, index) => {
					const fieldType = this.getFieldType(metaInfo);
					if (metaInfo.visibilityCondition) {				
						const expression = createExpressionTree(metaInfo.visibilityCondition);
						let data = {};
						if (!!this.props.isObjectListNodeEditing) {
							data = {...this.props.node, ...this.state.receivedPayload, ...this.state.values};
						} else {
							data = {...this.state.receivedPayload, ...this.state.values};
						}
						const result = executeExpressionTree(expression, data);
						if (!result) {
							return <React.Fragment key={"index-f-vc-" + index}></React.Fragment>;
						}								
					}
					if (!fieldType || fieldType == "text" || fieldType == "color" || fieldType == "date") {
						if (!!this.props.isReadOnly) {
							return <React.Fragment key={"index-f-r-" + index}>
								<div className="form-group">						
									<label htmlFor={"input-" + this.props.node.name}><strong>{metaInfo.fieldName || this.props.node.name}</strong></label>
									<div className="">{this.state.values[metaInfo.fieldName] || this.props.node[metaInfo.fieldName] || ""}</div>
								</div>
							</React.Fragment>
						}						
						return <React.Fragment key={"index-f-" + index}>
								<div className="form-group">						
									<label htmlFor={"input-" + this.props.node.name}><strong>{metaInfo.fieldName || this.props.node.name}</strong>{!!metaInfo.required && " *"}</label>
									<div className="input-group mb-1">
										<input
											onChange={this.onChange.bind(this, metaInfo.fieldName, metaInfo.fieldType || "text", metaInfo)}
											key={"index" + index}
											type={fieldType}
											className="form-control"
											value={this.state.values[metaInfo.fieldName] || this.props.node[metaInfo.fieldName] || ""}
											id={"input-" + this.props.node.name + "-" +metaInfo.fieldName}
											data-index={index}
											disabled={!!this.props.canvasMode?.isFlowrunnerPaused}													 
										/>			
									</div>
									{this.state.errors[metaInfo.fieldName] && <div className="text-danger">{this.state.errors[metaInfo.fieldName]}</div>}
								</div>
						</React.Fragment>
					}
					if (fieldType) {
						let datasource : any;

						if (metaInfo.datasource == "[PLAYGROUNDFLOW]") {
							datasource = this.props.canvasMode?.flowsPlayground;
						} else
						if (metaInfo.datasource == "[WASMFLOW]") {
							datasource = this.props.canvasMode?.flowsWasm;
						} else
						if (metaInfo.datasource && this.state.datasource[metaInfo.datasource]) {
							datasource = this.state.datasource[metaInfo.datasource];
						}

						if (!!this.props.isReadOnly) {
							let data = "";
							if (metaInfo.fieldType == "objectList") {
								data = "[Object]";
							} else {
								data = this.state.values[metaInfo.fieldName] || this.props.node[metaInfo.fieldName] || "";
							}
							return <React.Fragment key={"index-f-r-" + index}>
								<div className="form-group">						
									<label htmlFor={"input-" + this.props.node.name}><strong>{metaInfo.fieldName || this.props.node.name}</strong></label>
									<div className="">{data}</div>
								</div>
							</React.Fragment>
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
				{!this.props.isReadOnly && !this.props.isObjectListNodeEditing &&
					<button className="d-none">OK</button>}
			</>; 
		}
		return <div className="html-plugin-node" style={{			
				backgroundColor: "white"
			}}>
			<div className={"w-100 h-auto"}>
				<Suspense fallback={<div>Loading...</div>}>
				{!!this.props.isObjectListNodeEditing ?
				<div className="form">
					{renderFields()}
				</div>
				:
				<form className="form" onSubmit={this.onSubmit}>				
					{renderFields()}
				</form>
				}
				</Suspense>
			</div>
		</div>;
	}
}

export const FormNodeHtmlPlugin = connect(mapStateToProps, mapDispatchToProps)(ContainedFormNodeHtmlPlugin);