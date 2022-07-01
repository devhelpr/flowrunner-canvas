import * as React from 'react';
import { useState, useEffect } from 'react';

import { IFormControlProps } from './form-control-interface';
import { useFormControlFromCode } from './use-form-control';

import { FormNodeHtmlPlugin } from '../form-node';
import { onFocus } from './helpers/focus';


/*
	show a list based on object properties
	each property has the same object structure

	object property can be of different types:
	- guid
	- name (cannot contain spaces)
*/
export const HashMap = (props: IFormControlProps) => {
	const { metaInfo, node } = props;
	const [ isAdding , setAdding] = useState(false);
	const [ newValue, setNewValue ] = useState({});
	const [ editProperty , setEditProperty] = useState("");
	const [ newProperty, setNewProperty] = useState("");

	let formControl = useFormControlFromCode(props.value || [], metaInfo, props.onChange);
	
	useEffect(() => {
		formControl.setValue(props.value);
	}, [props.value]);

	const deleteItem = (objectPropertyName, event) => {
		event.preventDefault();
		
		setAdding(false);
		setEditProperty("");

		let newObject = {...formControl.value};
		delete newObject[objectPropertyName];
		formControl.handleChangeByValue(newObject);
		
		return false;
	}

	const onEditNodeKeyValue = (objectPropertyName, value, fieldName) => {
		const clonedValue = {...formControl.value[objectPropertyName]};
		clonedValue[fieldName] = value;
		let newObject = {...formControl.value};
		newObject[objectPropertyName] = clonedValue;

		console.log("hashmap" , objectPropertyName, newObject);
		formControl.handleChangeByValue(newObject);
		
	}

	const editItem = (objectPropertyName, event) => {
		event.preventDefault();
		setAdding(false);
		if (editProperty == objectPropertyName) {
			setEditProperty("");
		} else {
			setEditProperty(objectPropertyName);
		}
		return false;
	}

	const onAddNodeKeyValue = (value, fieldName) => {
		const clonedValue = {...newValue};
		clonedValue[fieldName] = value;
		setNewValue(clonedValue);
	}

	const onAppendValue = (event) => {
		event.preventDefault();
		if (formControl.value[newProperty]) {
			alert(`${newProperty} already exists in ${metaInfo.label || metaInfo.fieldName || node.name}`);
			return false;
		}
		let newObject = {...formControl.value};
		newObject[newProperty] = newValue;
		formControl.handleChangeByValue(newObject);

		setAdding(false);
		setNewValue({});
		setNewProperty("");

		return false;
	}

	const onCloseAppendValue = (event) => {
		event.preventDefault();

		setAdding(false);

		return false;
	}

	const addItem = (event) => {
		event.preventDefault();
		
		setNewProperty("");
		setAdding(true);

		return false;
	}

	const onSetNewProperty = (event) => {
		event.preventDefault();
		setNewProperty((event.target.value || "").replace(/\s/g, ""));
		return false;
	}

	return <div className="form-group">						
		<label><strong>{metaInfo.label || metaInfo.fieldName || node.name}</strong></label>
		{
			Object.keys(formControl.value).map((objectPropertyName, index) => {
				return <div className="form-control__hash-map" key={"hashmap-" + objectPropertyName + index}>
					<div className="form-control__hash-map-heading row no-gutters position-relative" key={"input" + metaInfo.fieldName + index}>
						<div className="col form-control__hash-map-title">
							<label className="text-secondary">{objectPropertyName}</label>
						</div>
						<a href="#" onFocus={onFocus}  onClick={(event) => {(event) => deleteItem(objectPropertyName, event)}} 
							className={"col-auto align-self-center text-center position-static mr-2"}>
							<span className="fa fa-trash"></span>
						</a>
						<a href="#" onClick={(event) => {editItem(objectPropertyName ,event)}} 
							className={"col-auto align-self-center text-center position-static"}>
							<span className="fa fa-edit"></span>
						</a>
					</div>
					{editProperty == objectPropertyName && <div className="form-control__hash-map-details">
						<FormNodeHtmlPlugin 
							node={{
								...formControl.value[objectPropertyName], 
								metaInfo:props.metaInfo.blockFields, 
								name: props.node.name + "-edit-" + objectPropertyName, 
								id: props.node.name + "-edit-" + objectPropertyName}}
							isObjectListNodeEditing={true}
							isInFlowEditor={props.isInFlowEditor}
							onSetValue={(value, fieldName) => onEditNodeKeyValue(objectPropertyName, value, fieldName)}
							datasources={props.datasources}
						></FormNodeHtmlPlugin>
					</div>}
				</div>
			})
		}
		{isAdding ? 
				<div className="form-control__hash-map">
					<div className="form-control__hash-map-heading row no-gutters position-relative p-3" >
						<div className="w-100">
							<input className="form-control w-100" onChange={onSetNewProperty} value={newProperty} />
						</div>
					</div>
					<FormNodeHtmlPlugin 
						node={{...newValue, 
							metaInfo:props.metaInfo.blockFields, 
							name: props.node.name + "-add", 
							id: props.node.name + "-add"}}
						isObjectListNodeEditing={true}
						isInFlowEditor={props.isInFlowEditor}
						onSetValue={onAddNodeKeyValue}
						datasources={props.datasources}
					></FormNodeHtmlPlugin>
					<div className="form-control__object-list-node-controls">
						<button onFocus={onFocus} onClick={onAppendValue} className="btn btn-primary mr-2">Add</button>
						<button onFocus={onFocus} onClick={onCloseAppendValue} className="btn btn-outline-primary">Close</button>
					</div>
				</div> :
				<div className="form-control__hash-map">
					<a href="#" onFocus={onFocus} onClick={addItem} className="fas fa-plus-circle"></a>
				</div>
			}
	</div>;

}