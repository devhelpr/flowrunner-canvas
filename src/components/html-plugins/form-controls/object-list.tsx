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
	const [ editIndex , setEditIndex] = useState(-1);
	const [ editValue, setEditValue ]= useState({});
	const [ isAdding , setAdding] = useState(false);
	const [ newValue, setNewValue ] = useState({});
	let formControl = useFormControlFromCode(props.value || [], metaInfo, props.onChange);
	
	useEffect(() => {
		formControl.setValue(props.value);
	}, [props.value]);

	const deleteClick = (event, index) => {
		event.preventDefault();
		
		setEditIndex(-1);
		setAdding(false);

		let newList = [...formControl.value];
		newList.splice(index, 1);
		formControl.handleChangeByValue(newList);
		return false;
	}

	const editClick = (event, index) => {
		event.preventDefault();
		
		setEditValue(formControl.value[index]);
		setEditIndex(index);
		setAdding(false);

		return false;
	}

	const addItem = (event) => {
		event.preventDefault();
		
		setEditIndex(-1);
		setAdding(true);

		return false;
	}

	const onAppendValue = (event) => {
		event.preventDefault();

		let newList = [...formControl.value];
		newList.push(newValue);
		formControl.handleChangeByValue(newList);

		setEditIndex(-1);
		setAdding(false);
		setNewValue({});

		return false;
	}

	const onSaveEditValue = (event) => {
		event.preventDefault();

		let newList = [...formControl.value];
		newList[editIndex] = editValue;
		formControl.handleChangeByValue(newList);

		setEditIndex(-1);
		setAdding(false);
		setEditValue({});

		return false;
	}
	
	const onEditNodeKeyValue = (value, fieldName) => {
		const clonedValue = {...editValue};
		clonedValue[fieldName] = value;
		setEditValue(clonedValue);
	}

	const onAddNodeKeyValue = (value, fieldName) => {
		const clonedValue = {...newValue};
		clonedValue[fieldName] = value;
		setNewValue(clonedValue);
	}

	const onCloseAppendValue = (event) => {
		event.preventDefault();

		setEditIndex(-1);
		setAdding(false);
		setEditValue({});

		return false;
	}

	return <div className="form-group">						
			<label>{metaInfo.fieldName || node.name}</label>
			{Array.isArray(formControl.value) && formControl.value.map((listItem, index) => {
				if (editIndex == index) {
					return <div className="form-control__object-list-node" key={"input" + metaInfo.fieldName + index}>
						<FormNodeHtmlPlugin 
							node={{...editValue, metaInfo:props.metaInfo.metaInfo}}
							isObjectListNodeEditing={true}
							onSetValue={onEditNodeKeyValue}
						></FormNodeHtmlPlugin>
						<div className="form-control__object-list-node-controls">
							<button onClick={onSaveEditValue} className="btn btn-primary">Save</button>
						</div>
					</div>
				}
				return <div className="form-control__object-list-node" key={metaInfo.fieldName + index}>
					<FormNodeHtmlPlugin 
						node={{...listItem, metaInfo:props.metaInfo.metaInfo}}
						isObjectListNodeEditing={true}
						isReadOnly={true}
					></FormNodeHtmlPlugin>
					<div className="form-control__object-list-node-controls">
						<a href="#" onClick={(event) => editClick(event, index)} className="fas fa-edit"></a>
						<a href="#" onClick={(event) => deleteClick(event, index)} className="fas fa-trash-alt"></a></div>
					</div>
			})}
			{isAdding ? 
				<div className="form-control__object-list-node">
					<FormNodeHtmlPlugin 
						node={{...newValue, metaInfo:props.metaInfo.metaInfo}}
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