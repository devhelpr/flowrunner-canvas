import * as React from 'react';
import { useEffect, useState, useRef } from 'react';

import { IFlowrunnerConnector } from '../interfaces/IFlowrunnerConnector';

import { useFlowStore} from '../state/flow-state';
import { useCanvasModeStateStore} from '../state/canvas-mode-state';
import { useSelectedNodeStore} from '../state/selected-node-state';

export class InputNodeHtmlPluginInfo {
	getWidth = (node) => {
		return 300;
	}

	getHeight(node) {		
		return 300;
	}
}

/*
	#TODO

	- delete en add moet bijvoorbeeld de quicksort triggeren
		.. probleem doet zich ook voor bij typen
		.. de flow loopt 1 update achter

*/
export interface InputNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
}

export interface InputNodeHtmlPluginState {
	value : string;
	values : string[];
	node : any;
}

export const InputNodeHtmlPlugin = (props : InputNodeHtmlPluginProps) => {

	const [value, setValue] = useState("");
	const [values, setValues] = useState([] as any[]);
	const [node, setNode] = useState({} as any);
	
	const flow = useFlowStore();
	const canvasMode = useCanvasModeStateStore();

	useEffect(() => {
		if (props.node) {

			if (props.node.nodeDatasource && props.node.nodeDatasource === "flow") {
				if (props.node.mode && props.node.mode === "list") {
					setNode(props.node);
					setValues(props.node.values || props.node.defaultValues || []);
				} else {
					setNode(props.node);
					setValue(props.node.value || props.node.defaultValue || "");
				}
			} else {
				props.flowrunnerConnector.modifyFlowNode(
					props.node.name, 
					props.node.propertyName, 
					props.node.defaultValue || "",
					""
				);
				setNode(props.node);
				setValue(props.node.defaultValue || "");
			}
		}
	}, []);
	
	const onSubmit = (event: any) => {
		event.preventDefault();
		if (!!canvasMode.isFlowrunnerPaused) {
			return;
		}
		
		if (props.node.formMode !== false) {
			props.flowrunnerConnector.executeFlowNode(props.node.executeNode || props.node.name, {});
		}
		return false;
	}

	const storeNode = (newNode) => {
		flow.storeFlowNode(newNode, props.node.name);
	}
	
	const onChange = (event: any) => {
		console.log("input", event.target.value, props.node);
		if (props.node) {
			if (props.node.nodeDatasource && props.node.nodeDatasource === "flow") {
				const newNode = {...props.node, value: props.node.value }; 				
				setNode(newNode);
				setValue(props.node.value);
				storeNode(newNode);
				
			} else {
				props.flowrunnerConnector.modifyFlowNode(
					props.node.name, 
					props.node.propertyName, 
					event.target.value,
					props.node.onChange || ""
				);
				setValue(event.target.value);
			}	
		}
	}

	const onChangeList = (index, event: any) => {
		console.log("input onChangeList", event.target.value, props.node);
		if (props.node) {

			if (props.node.mode && props.node.mode === "list") {
				let newValues : string[] = [...values];
				//console.log("newValues", newValues);
				newValues[parseInt(index)] = event.target.value;
			
				if (props.node.nodeDatasource && props.node.nodeDatasource === "flow") {
					const newNode = {...props.node, values: newValues };
					setNode(newNode);
					setValues(newValues);

					// TODO : fix this bug!! .. quicksort doesn't work anymore when changing the node
					storeNode(newNode);
					// THIS SEEMS TO FIX IT: (the extra props.node.name triggers the current node)
					props.flowrunnerConnector.modifyFlowNode(
						props.node.name, 
						props.node.propertyName, 
						newValues,
						props.node.name || "",
						"",
						newNode
						
					);
					

				} else {
				
					//console.log("newValues", newValues);

					props.flowrunnerConnector.modifyFlowNode(
						props.node.name, 
						props.node.propertyName, 
						newValues,
						props.node.onChange || ""
					);
					setValues(newValues);
				}
				
			}
		}
	}

	const deleteListItem = (index, event: any) => {
		event.preventDefault();

		if (!!canvasMode.isFlowrunnerPaused) {
			return;
		}

		if (props.node) {

			if (props.node.mode && props.node.mode === "list") {
				let newValues : string[] = [...values];
				if (index > -1) {
					newValues.splice(index, 1);
					//console.log("newValues delete", newValues);

					if (props.node.nodeDatasource && props.node.nodeDatasource === "flow") {
						const newNode = {...props.node, values: newValues };
						setNode(newNode);
						setValues(newValues);
						storeNode(newNode);
					} else {						
						props.flowrunnerConnector.modifyFlowNode(
							props.node.name, 
							props.node.propertyName, 
							newValues,
							props.node.onChange || ""
						);
						setValues(newValues);
					}
				}
			}
		}
		return false;
	}

	const onAddValue = (event) => {
		event.preventDefault();

		if (!!canvasMode.isFlowrunnerPaused) {
			return;
		}

		if (props.node) {
			let newValues : string[] = [...values];
			newValues.push("");

			if (props.node.nodeDatasource && props.node.nodeDatasource === "flow") {

				const newNode = {...props.node, values: newValues };
				setNode(newNode);
				setValues(newValues);
				storeNode(newNode);

			} else {
				props.flowrunnerConnector.modifyFlowNode(
					props.node.name, 
					props.node.propertyName, 
					newValues,
					props.node.onChange || ""
				);
				setValues(newValues);
			}
			
		}
		return false;
	}

	return <div className="html-plugin-node" style={{			
		backgroundColor: "white"
	}}>
		<div className={props.node.mode && props.node.mode === "list"? "w-100 overflow-y-scroll no-wheel" : "w-100 h-auto"}>
			<form className="form" onSubmit={onSubmit}>
				<div className="form-group">						
					<div>
						<label htmlFor={"input-" + props.node.name}><strong>{props.node.title || props.node.name}</strong></label>
					</div>
					{props.node.mode && props.node.mode === "list" ? <>
						{(values || []).map((value, index) => {
							return <React.Fragment key={"index-f-" + index}>
									<div className="input-group mb-1">
										<input 
											key={"index" + index}
											className="form-control"
											id={"input-" + props.node.name + "-" + index}
											value={value}
											data-index={index}
											disabled={!!canvasMode.isFlowrunnerPaused}
											onChange={(event) => onChangeList(index, event)} 
									/>
									<div className="input-group-append">
										<a href="#" title="delete item" 
											onClick={(event) => deleteListItem(index, event)} 											
											role="button" className="btn btn-outline-secondary"><i className="fas fa-trash-alt"></i></a>
									</div>
								</div>
							</React.Fragment>
						})}
						<div className="d-flex">
							<button onClick={onAddValue} className="ml-auto mt-2 btn btn-primary pl-4 pr-4">ADD</button>
						</div>
						{!!props.node.formMode && <>
							<br /><hr /><br />
						</>}
					</> :
					<input 
						className="form-control"
						id={"input-" + props.node.name}
						value={value}
						onChange={onChange} 
						disabled={!!canvasMode.isFlowrunnerPaused}
					/>
					}
					{!!props.node.formMode && 
						<div className="d-flex">
							<button className="ml-auto mt-2 btn btn-primary pl-4 pr-4">OK</button>
						</div>
					}
				</div>
			</form>
		</div>
	</div>;	
}