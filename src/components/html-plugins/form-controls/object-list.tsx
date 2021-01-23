import * as React from 'react';
import { useState, useEffect } from 'react';

import { IFormControlProps } from './form-control-interface';
import { useFormControlFromCode } from './use-form-control';

import { FormNodeHtmlPlugin } from '../form-node';
/*
	Purpose:
		show list of form-nodes
		props.metaInfo.metaNodeInfo contains fields to edit with formNode
		props.values is array of objects

		isObjectListNodeEditing : set on FormNode to indicating editing via object-list
			.. form-node should not store values in flow directly

			.. we need read only mode 
				isReadOnly

		form-node should be editable using an object-list
*/

export const ObjectList = (props: IFormControlProps) => {
	const { metaInfo, node } = props;
	const [ isAdding , setAdding] = useState(false);
	const [ newValue, setNewValue ] = useState({});
	let formControl = useFormControlFromCode(props.value || [], metaInfo, props.onChange);
	
	useEffect(() => {
		formControl.setValue(props.value);
	}, [props.value]);

	// TODO : add delete option for form-controls
	const deleteClick = (event, index) => {
		event.preventDefault();
		
		setAdding(false);

		let newList = [...formControl.value];
		newList.splice(index, 1);
		formControl.handleChangeByValue(newList);
		return false;
	}

	const addItem = (event) => {
		event.preventDefault();
		
		setAdding(true);

		return false;
	}

	const onAppendValue = (event) => {
		event.preventDefault();

		let newList = [...formControl.value];
		newList.push(newValue);
		formControl.handleChangeByValue(newList);

		setAdding(false);
		setNewValue({});

		return false;
	}
	
	const onEditNodeKeyValue = (index, value, fieldName) => {
		const clonedValue = {...formControl.value[index]};
		clonedValue[fieldName] = value;
		let newList = [...formControl.value];
		newList[index] = clonedValue;
		formControl.handleChangeByValue(newList);
	}

	const onAddNodeKeyValue = (value, fieldName) => {
		const clonedValue = {...newValue};
		clonedValue[fieldName] = value;
		setNewValue(clonedValue);
	}

	const onCloseAppendValue = (event) => {
		event.preventDefault();

		setAdding(false);

		return false;
	}
	return <div className="form-group">						
			<label><strong>{metaInfo.label || metaInfo.fieldName || node.name}</strong></label>
			{Array.isArray(formControl.value) && formControl.value.map((listItem, index) => {
				return <div className="form-control__object-list-node" key={"input" + metaInfo.fieldName + index}>
					<a href="#" onClick={(event) => deleteClick(event, index)} className="form-control__object-list-node-delete fas fa-trash-alt"></a>
					<FormNodeHtmlPlugin 
						node={{...formControl.value[index], metaInfo:props.metaInfo.metaInfo, name: props.node.name + "-edit-" + index, id: props.node.name + "-edit-" + index}}
						isObjectListNodeEditing={true}
						onSetValue={(value, fieldName) => onEditNodeKeyValue(index, value, fieldName)}
					></FormNodeHtmlPlugin>
					
				</div>
			})}
			{isAdding ? 
				<div className="form-control__object-list-node">
					<FormNodeHtmlPlugin 
						node={{...newValue, metaInfo:props.metaInfo.metaInfo, name: props.node.name + "-add", id: props.node.name + "-add"}}
						isObjectListNodeEditing={true}
						onSetValue={onAddNodeKeyValue}
					></FormNodeHtmlPlugin>
					<div className="form-control__object-list-node-controls">
						<button onClick={onAppendValue} className="btn btn-primary mr-2">Add</button>
						<button onClick={onCloseAppendValue} className="btn btn-outline-primary">Close</button>
					</div>
				</div> :
				<div>
					<a href="#" onClick={addItem} className="fas fa-plus-circle"></a>
				</div>
			}
	</div>;
}