import * as React from 'react';
import { useEffect, useState, useRef , useCallback } from 'react';
import { Suspense } from 'react';

import { ApplicationMode, IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';

import { getFormControl } from './form-controls';

import { createExpressionTree, executeExpressionTree } from '@devhelpr/expressionrunner';

import { useFlowStore} from '../../state/flow-state';
import { useCanvasModeStateStore} from '../../state/canvas-mode-state';
import { useSelectedNodeStore} from '../../state/selected-node-state';

import { onFocus } from './form-controls/helpers/focus';

import { PresetManager } from './components/preset-manager';

import * as uuid from 'uuid';
const uuidV4 = uuid.v4;

/*
	supportsPresets

	Limitations

		- can currently have only 1 datasource per form
*/
export class FormNodeHtmlPluginInfo {

	private taskSettings: any;
	constructor(taskSettings: any) {
		this.taskSettings = taskSettings;
		//console.log("FormNodeHtmlPluginInfo constructor", this.taskSettings);
	}

	getWidth(node) {
		let width = node.width || 300;
		if (width < 300) {
			width = 300;
		}
		return width;
	}

	getMetaInfoLength(metaInfo, node , isParent) {
		if (metaInfo) {
			let metaInfolength = 0;
			metaInfo.map((metaInfoItem) => {
				if (metaInfoItem.fieldType == 'radiobutton' &&
					metaInfoItem.options) {
					metaInfolength += metaInfoItem.options.length;
				} else
				if (metaInfoItem.fieldType == 'textarea') {
					metaInfolength += (node && node.rows) || metaInfo.rows || 3;
				} else			
				if (isParent && 
					metaInfoItem.fieldType == 'objectList' &&
					node && node[metaInfoItem.fieldName]) {
					metaInfolength += node[metaInfoItem.fieldName].length;
				} else
				if (metaInfoItem.metaInfo) {
					metaInfolength += this.getMetaInfoLength(metaInfoItem.metaInfo, node, false);
				} else {
					metaInfolength += 2;
				}
			});
			return metaInfolength;
		}
		return 0;
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
			// 70 + 16
			const height = this.getMetaInfoLength(metaInfo, node, true) * (36) + (48);

			//console.log("FormNodeHtmlPluginInfo height", height);
			return height;
		}
		return 0;
		//return (((node && node.rows) || 8) * 16) + (3 * 16) + 4 + 150;
	}
}


export interface FormNodeHtmlPluginProps {
	flowrunnerConnector? : IFlowrunnerConnector;
	node : any;
	taskSettings? : any;

	isObjectListNodeEditing? : boolean;
	isReadOnly? : boolean;
	isInFlowEditor: boolean;
	isNodeSettingsUI? : boolean;
	datasources? : any;
	onSetValue? : (value, fieldName) => void;
}

export interface FormNodeHtmlPluginState {
	value : string;
	values : string[];
	node : any;
	errors : any;
	datasource : any;
	receivedPayload : any;
}

export const FormNodeHtmlPlugin = (props: FormNodeHtmlPluginProps) => {
	
	const [value, setValue] = useState("");
	const [values, setValues] = useState([] as any[]);
	const [node, setNode] = useState({} as any);
	const [errors, setErrors] = useState({} as any);
	const [datasource, setDatasource] = useState({} as any);
	const [receivedPayload, setReceivedPayload] = useState({} as any);		

	//const flow = useFlowStore();
	//const [storeFlowNode] = useFlowStore();
	const storeFlowNode = useFlowStore(useCallback(state => state.storeFlowNode, []));
	const canvasMode = useCanvasModeStateStore();
	const selectedNode = useSelectedNodeStore();

	const observableId = useRef(uuidV4());

	const unmounted = useRef(false);
	const timer : any = useRef(null);
	const lastTime : any = useRef(null);
	const throttleTimer : any = useRef(null);

	useEffect(() => {

		if (props.node) {
			
			if (props.node.nodeDatasource && props.node.nodeDatasource === "flow") {
				if (props.node.mode && props.node.mode === "list") {
					setNode(props.node);
					setValues(props.node.values || props.node.defaultValues || []);
				} else {
					setNode(props.node);
					setValues([]);
					setValue(props.node.value || props.node.defaultValue || "");
				}
			} else {
				if (props.node.taskType == "FormTask" ||
					(props.taskSettings && !!props.taskSettings.isFormTask)) {
					//console.log("pre modifyFlowNode mount", values);
					if (props.flowrunnerConnector) {
						props.flowrunnerConnector?.modifyFlowNode(
							props.node.name, 
							props.node.propertyName, 
							props.node.defaultValue || "",
							""
						);
					}
				}
				setNode(props.node);
				setValues([]);
				setValue(props.node.defaultValue || "");
			}
		} else {
			setValues([]);
		}

		if (props.flowrunnerConnector) {
			props.flowrunnerConnector?.registerFlowNodeObserver(props.node.name, observableId.current, receivePayloadFromNode);
		}
		return () => {
			unmounted.current = true;
			if (throttleTimer.current) {
				clearTimeout(throttleTimer.current);
				throttleTimer.current = undefined;
			}
			if (props.flowrunnerConnector) {
				props.flowrunnerConnector?.unregisterFlowNodeObserver(props.node.name, observableId.current);
			}
		}
	}, [props.node, ]);

	useEffect(() => {

		setNode({...props.node});
		//console.log("FORM-NODE use-effect", props.node.name, props.node);
		if (props.flowrunnerConnector) {
			props.flowrunnerConnector?.registerFlowNodeObserver(props.node.name, observableId.current, receivePayloadFromNode);
		}
		return () => {
			if (props.flowrunnerConnector) {
				props.flowrunnerConnector?.unregisterFlowNodeObserver(props.node.name, observableId.current);
			}
		}
	}, [props.node]);

	/*

		// TODO : implement initializeFlowNode 
		//         .. this should only intialize the values of the node in the flowrunner lib
		// 			AND NOT START THE NODE like modifyFlowNode does
		//
		// QUESTION : Will this be to late? it needs to be in sync with pushflowrunner
		//		and starting of the flow so that when a flow is restarted that
		//      it has the correct values of nodes
		//      
		//		can this lead to problems with "inferred visibilityConditions"


		useEffect(() => {
			if (!props.isNodeSettingsUI && !props.isObjectListNodeEditing) {
				if (props.node.taskType == "FormTask") {
					props.flowrunnerConnector?.initializeFlowNode(
						props.node.name, 
						fieldName, 
						value,
						props.node.name,
						'',
						{...values}	
					);
				}
			}
		}, [flow.flow]);
	*/

	/*
	useEffect(() => {
		props.flowrunnerConnector?.registerFlowNodeObserver(props.node.name, observableId.current, receivePayloadFromNode);
		setValues([]);

		return () => {
			props.flowrunnerConnector?.unregisterFlowNodeObserver(props.node.name, observableId.current);

		}
	}, [flow]);
	*/
	
	const receivePayloadFromNode = useCallback((payload : any) => {
		const maxPayloads = 1;
		if (unmounted.current) {
			return;
		}		
		

		let metaInfo : any[] = [];

		if (!!props.isNodeSettingsUI) {
			metaInfo = props.taskSettings.configMenu.fields
		} else {
			if (props.taskSettings && props.taskSettings.metaInfo) {
				metaInfo = props.taskSettings && props.taskSettings.metaInfo;
			}
			if (!!props.taskSettings.hasMetaInfoInNode) {
				metaInfo = props.node.metaInfo || [];
			}
		}

		if (!!payload.isDebugCommand) {
			if (payload.debugCommand  === "resetPayloads") {
				setReceivedPayload({});
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
			if (!lastTime || performance.now() > lastTime + 30) {
				lastTime.current = performance.now();
				if (timer.current) {
					clearTimeout(timer.current);
					timer.current = undefined;
				}
									
				let _datasource = {...datasource};
				if (datasourcePropertyName) {
					_datasource[datasourcePropertyName] = payload[datasourcePropertyName];
				}
				setDatasource(_datasource);
				setReceivedPayload(payload);
					
			} else {
				if (timer.current) {
					clearTimeout(timer.current);
					timer.current = undefined;
				}
	
				timer.current = setTimeout(() => {
					timer.current = undefined;
				
					let _datasource = {...datasource};
					if (datasourcePropertyName) {
						_datasource[datasourcePropertyName] = payload[datasourcePropertyName];
					}
					setDatasource(_datasource);
					setReceivedPayload(payload);
				}, 30);
			}
		} else {
			setReceivedPayload(payload);
		}
		return;
	}, [props.taskSettings, props.node]);

	
	const onSubmit = useCallback((event: any) => {
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
		let updatedErrors = {};

		let metaInfo : any[] = [];
		if (!!props.isObjectListNodeEditing) {
			metaInfo = props.node.metaInfo || [];
		} else
		if (!!props.isNodeSettingsUI) {
			metaInfo = props.taskSettings.configMenu.fields
		} else {
			if (props.taskSettings && props.taskSettings.metaInfo) {
				metaInfo = props.taskSettings && props.taskSettings.metaInfo;
			}
			if (!!props.taskSettings.hasMetaInfoInNode) {
				metaInfo = props.node.metaInfo || [];
			}
		}		

		(metaInfo || []).map((metaInfo) => {
			if (metaInfo && !!metaInfo.required) {
				const value = values[metaInfo.fieldName] || props.node[metaInfo.fieldName] || "";
				if (value === "") {
					doSubmit = false;
					updatedErrors[metaInfo.fieldName] = `${metaInfo.fieldName} is a required field`;					
				}
			}
		});
		if (doSubmit) {
			setErrors([]);
		} else {
			setErrors(updatedErrors);
		}
		return false;
	}, [props.taskSettings, props.node, values, props.isObjectListNodeEditing, props.isNodeSettingsUI]);

	const setValueHelper = useCallback((fieldName, value, metaInfo) => {
		if (props.node && fieldName) {	
			let updatedErrors = {...errors};
			if (updatedErrors[fieldName]) {
				delete updatedErrors[fieldName];
			}

			if (metaInfo.fieldType == "date") {
				console.log("setValueHelper date", value);
			}
			let clearValues = {};
			if (values[fieldName] === undefined || value != values[fieldName]) {
				if (metaInfo.clearFields) {
					metaInfo.clearFields.map((fieldName) => {
						clearValues[fieldName] = "";
					})
				}
			}
			//console.log("setValueViaOnReceive", metaInfo.fieldName, clearValues);
			const updatedValues = {
				...values,
				...clearValues,			
				[fieldName]: value
			};
			setValues(updatedValues);
			setErrors(updatedErrors);
			const updatedNode = {
				...node, 
				[fieldName]: value
			};
			setNode(updatedNode);
			//console.log("setValueHelper",updatedValues);
			//console.log("props.node.name",value,props.node.name);
			if (!props.isNodeSettingsUI && !props.isObjectListNodeEditing) {
				if (props.node.taskType == "FormTask" ||
					(props.taskSettings && !!props.taskSettings.isFormTask)) {
					//console.log("pre modifyFlowNode 2", updatedValues);
					if (props.flowrunnerConnector) {
						props.flowrunnerConnector?.modifyFlowNode(
							props.node.name, 
							fieldName, 
							value,
							props.node.name,
							'',
							updatedValues
						);
					}
				} else {
					//console.log("formnode storeFlowNode updatedNode", updatedNode, props.node.name);
					if (props.flowrunnerConnector) {
						storeFlowNode(updatedNode, props.node.name);
						
						// additional fix for updating nodes 
						props.flowrunnerConnector?.modifyFlowNode(
							props.node.name, 
							fieldName, 
							value,
							props.node.name,
							'',
							updatedValues
						);
					}
					
				}
				
			} else if (props.onSetValue) {
				props.onSetValue(value, fieldName);
			}
			
		}
	}, [props.taskSettings, props.node, values, node, props.isObjectListNodeEditing, props.isNodeSettingsUI,
		props.onSetValue
	]);

	
	const onChange = (fieldName, fieldType, metaInfo, event: any) => {
		event.preventDefault();
		let valueForNode : any;
		if (metaInfo && metaInfo.dataType === "number") {
			valueForNode = Number(event.target.value);
		} else {
			valueForNode = event.target.value;
		}

		if (fieldType == "color" ) {
			if (throttleTimer.current) {
				clearTimeout(throttleTimer.current)
			}
						
			throttleTimer.current = setTimeout(() => {
				
				setValueHelper(fieldName, valueForNode, metaInfo);

			}, fieldType == "color" ? 50 : 5);
		} else {					
			setValueHelper(fieldName, valueForNode, metaInfo);
		}
		
		return false;
	};

	const setValueViaOnReceive = useCallback((newValue, metaInfo) => {
		if (props.node && metaInfo.fieldName) {	
			let _errors = {...errors};
			if (_errors[metaInfo.fieldName]) {
				delete _errors[metaInfo.fieldName];
			}			

			let clearValues = {};
			if (values[metaInfo.fieldName] === undefined || newValue != values[metaInfo.fieldName]) {
				if (metaInfo.clearFields) {
					metaInfo.clearFields.map((fieldName) => {
						clearValues[fieldName] = "";
					})
				}
			}
			
			let newValues = {
				...values,
				...clearValues,				
				[metaInfo.fieldName]: newValue
			};
			//console.log("setValueViaOnReceive", metaInfo.fieldName, newValue, newValues);
			setValues(newValues);
			setErrors(_errors);
			let updatedNode = {
				...node, 
				[metaInfo.fieldName]: newValue
			};
			setNode(updatedNode);
			
			if (!props.isNodeSettingsUI && !props.isObjectListNodeEditing) {
				if (props.node.taskType == "FormTask" ||
					(props.taskSettings && !!props.taskSettings.isFormTask)) {

					// TODO : this should also push through all fields from this formnode
					// 		kan dat de hele state.values zijn ?
					//console.log("pre modifyFlowNode 1", newValues);
					if (props.flowrunnerConnector) {
						props.flowrunnerConnector?.modifyFlowNode(
							props.node.name, 
							metaInfo.fieldName, 
							newValue,
							props.node.name,
							'',
							newValues
						);
					}
				} else { 					
					//console.log("formnode storeFlowNode setValueViaOnReceive", updatedNode, props.node.name);
					if (props.flowrunnerConnector) {
						storeFlowNode(updatedNode, props.node.name);
						// Looks like this is the fix...
						props.flowrunnerConnector?.modifyFlowNode(
							props.node.name, 
							metaInfo.fieldName, 
							newValue,
							props.node.name,
							'',
							newValues
						);
					}
				}
			} else  if (props.onSetValue) {
				props.onSetValue(newValue, metaInfo.fieldName);
			}
			
		}
	}, [props.taskSettings, props.node, values, props.isObjectListNodeEditing,props.isNodeSettingsUI,props.onSetValue]);

	const onReceiveValue = (value, metaInfo) => {

		if (metaInfo.fieldType == "color") {
			if (throttleTimer.current) {
				clearTimeout(throttleTimer.current)
			}
			
			throttleTimer.current = setTimeout(() => {
				setValueViaOnReceive(value, metaInfo);		
			}, metaInfo.fieldType == "color" ? 50 : 5);
		} else {
			setValueViaOnReceive(value, metaInfo);
		}
		
	}

	const getFieldType = (metaInfo) => {
		if (metaInfo.fieldType === "color") {
			return "color";
		}
		if (!metaInfo.fieldType) {
			return "text";
		}
		return metaInfo.fieldType;
	}
	
	/*
	let metaInfo : any[] = [];
	if (!!props.isNodeSettingsUI) {
		metaInfo = props.taskSettings.configMenu.fields
	} else {
		if (props.taskSettings && props.taskSettings.metaInfo) {
			metaInfo = props.taskSettings && props.taskSettings.metaInfo;
		}
		if (!!props.isObjectListNodeEditing || 
			!!props.taskSettings.hasMetaInfoInNode) {
			metaInfo = props.node.metaInfo || [];
		}
	}
	*/

	const onLoadPreset = () => {

	}

	const onGetData = useCallback(() => {			
		let data = {...props.node,...node,...values};
		delete data.x;
		delete data.y;
		delete data.name;
		delete data.id;
		delete data._id;
		delete data.shapeType;
		delete data.taskType;
		return data;
	}, [props.node, node, value, values]);

	const onSetData = useCallback((data) => {

		setValues(data);
		const updatedNode = {
			...props.node,
			...node,
			...data
		};
		
		//console.log("Preset onSetData", updatedNode);

		setNode(updatedNode);
		if (props.flowrunnerConnector) {
			storeFlowNode(updatedNode, props.node.name);
			props.flowrunnerConnector?.modifyFlowNode(
				props.node.name, 
				"", 
				value,
				props.node.name,
				'',
				data
			);
		}
	}, [props.node, node, value, values]);

	const renderFields = useCallback(() => {
		
		let metaInfo : any[] = [];
		if (!!props.isNodeSettingsUI) {
			if (props.taskSettings) {
				metaInfo = props.taskSettings.configMenu.fields;
			} else {
				metaInfo = [];
			}
		} else {
			if (props.taskSettings && props.taskSettings.metaInfo) {
				metaInfo = props.taskSettings && props.taskSettings.metaInfo;
			}
			if (!!props.isObjectListNodeEditing || 
				!!props.taskSettings.hasMetaInfoInNode) {
				metaInfo = props.node.metaInfo || [];
			}
		}
		//console.log("renderFields", receivedPayload, values);
		return <>
			{metaInfo.map((metaInfo, index) => {
				const fieldType = getFieldType(metaInfo);
				if (metaInfo.visibilityCondition) {				
					const expression = createExpressionTree(metaInfo.visibilityCondition);
					let data = {};
					if (!!props.isObjectListNodeEditing) {
						data = {...props.node, ...receivedPayload, ...values};
					} else {
						data = {...props.node, ...receivedPayload, ...values};
					}
					const result = executeExpressionTree(expression, data);
					//console.log("visibilityCondition", metaInfo.visibilityCondition, data, result, expression);
					if (!result) {
						return <React.Fragment key={"index-f-vc-" + index}></React.Fragment>;
					}								
				}
				if (!fieldType || fieldType == "text" || fieldType == "fileupload" || fieldType == "color" || fieldType == "date") {
					if (!!props.isReadOnly) {
						return <React.Fragment key={"index-f-r-" + index}>
							<div className="form-group">						
								<label htmlFor={"input-" + props.node.name}><strong>{metaInfo.fieldName || props.node.name}</strong></label>
								<div className="">{values[metaInfo.fieldName] || props.node[metaInfo.fieldName] || ""}</div>
							</div>
						</React.Fragment>
					}

					// below code replace this one-liner:
					//(values[metaInfo.fieldName] !== undefined && (values[metaInfo.fieldName] || "")) || props.node[metaInfo.fieldName] || "";
					let inputValue = "";
					if (values[metaInfo.fieldName] !== undefined) {
						inputValue = values[metaInfo.fieldName];
					} else {
						inputValue = props.node[metaInfo.fieldName] || "";
						if (!inputValue) {
							if (metaInfo.defaultValue) {
								inputValue = metaInfo.defaultValue;
							}
						}
					}
					return <React.Fragment key={"index-f-" + index}>
							<div className="form-group">						
								<label htmlFor={"input-" + props.node.name}><strong>{metaInfo.label || metaInfo.fieldName || props.node.name}</strong>{!!metaInfo.required && " *"}</label>
								<div className="input-group mb-1">
									{!!(props.taskSettings?.showNotSelectedAsLabels ?? false) && !props.isObjectListNodeEditing &&
										(!selectedNode || 
											(!props.isNodeSettingsUI && props.flowrunnerConnector?.getAppMode() !== ApplicationMode.UI && 
											  selectedNode && selectedNode.node && selectedNode.node.name !== props.node.name)) ?
											<label key={"index-label-" + index} className="static-control static-control__form-node-input-as-label"
												id={"label-" + props.node.name + "-" +metaInfo.fieldName}
											>{inputValue}</label> :										
											<input
												onChange={(event) => onChange(metaInfo.fieldName, metaInfo.fieldType || "text", metaInfo, event)}
												onFocus={onFocus}
												key={"index" + index}
												type={fieldType === "fileupload" ? "file" : fieldType}
												className="form-control"
												value={inputValue}
												accept={metaInfo.acceptFiles || ""}
												id={"input-" + props.node.name + "-" +metaInfo.fieldName}
												data-index={index}
												disabled={!props.isNodeSettingsUI && props.flowrunnerConnector?.getAppMode() !== ApplicationMode.UI && (
														!props.isObjectListNodeEditing && (!!canvasMode?.isFlowrunnerPaused || 
														(!selectedNode || 
															(selectedNode && selectedNode.node && selectedNode.node.name !== props.node.name))
													) 
												)}													 
											/>
									}			
								</div>
								{errors[metaInfo.fieldName] && <div className="text-danger">{errors[metaInfo.fieldName]}</div>}
							</div>
					</React.Fragment>
				}
				if (fieldType) {
					let datasourceToUse : any;
					if (metaInfo.datasource == "module") {
						datasourceToUse = props.datasources[metaInfo.datasourceId] || [];
					} else
					if (metaInfo.datasource == "[PLAYGROUNDFLOW]") {
						datasourceToUse = canvasMode?.flowsPlayground;
					} else
					if (metaInfo.datasource == "[WASMFLOW]") {
						datasourceToUse = canvasMode?.flowsWasm;
					} else
					if (metaInfo.datasource && datasource[metaInfo.datasource]) {
						datasourceToUse = datasource[metaInfo.datasource];
					}

					if (!!props.isReadOnly) {
						let data = "";
						if (metaInfo.fieldType == "objectList") {
							data = "[Object]";
						} else {
							data = values[metaInfo.fieldName] || props.node[metaInfo.fieldName] || "";
						}
						return <React.Fragment key={"index-f-r-" + index}>
							<div className="form-group">						
								<label htmlFor={"input-" + props.node.name}><strong>{metaInfo.fieldName || props.node.name}</strong></label>
								<div className="">{data}</div>
							</div>
						</React.Fragment>
					}	

					let inputValue = "";
					if (values[metaInfo.fieldName] !== undefined) {
						inputValue = values[metaInfo.fieldName];
					} else {
						inputValue = props.node[metaInfo.fieldName] || "";
						if (!inputValue) {
							if (metaInfo.defaultValue) {
								inputValue = metaInfo.defaultValue;
							}
						}
					}

					return <React.Fragment key={"index-f-" + index}>{getFormControl(fieldType,{
						value: inputValue,
						onChange: onReceiveValue,
						node: props.node,
						fieldName: metaInfo.fieldName,
						fieldType: metaInfo.fieldType,
						metaInfo: metaInfo,
						datasource : datasourceToUse,
						datasources: props.datasources,
						payload: receivedPayload,
						isInFlowEditor:!!props.isInFlowEditor,
						fieldDefinition: metaInfo,
						selected: (!!props.isNodeSettingsUI || props.flowrunnerConnector?.getAppMode() == ApplicationMode.UI || props.isObjectListNodeEditing || (selectedNode && selectedNode.node && selectedNode.node.name === props.node.name))
					})}</React.Fragment>
				}
				return null;
			})}
			{!props.isReadOnly && !props.isObjectListNodeEditing &&
				<button onFocus={onFocus} className="d-none">OK</button>}
		</>; 
	}, [selectedNode.node, props.taskSettings, props.node, props.datasources, 
		value, values, errors, receivedPayload, node,
		props.isInFlowEditor, props.isNodeSettingsUI, props.isObjectListNodeEditing
	]);

	return <div className="html-plugin-node" style={{			
			backgroundColor: "white"
		}}>
		<div className={"w-100 h-auto"}>
			<Suspense fallback={<div>Loading...</div>}>
			{!!props.isObjectListNodeEditing ?
			<div className="form">
				{renderFields()}
			</div>
			:
			<form className="form" onSubmit={onSubmit}>				
				{renderFields()}
			</form>
			}
			{props.taskSettings && !!props.taskSettings.supportsPresets && 
				<PresetManager
					node={props.node}
					onLoadPreset={onLoadPreset}
					onGetData={onGetData}
					onSetData={onSetData}
				></PresetManager>}
			</Suspense>
		</div>
	</div>;
}