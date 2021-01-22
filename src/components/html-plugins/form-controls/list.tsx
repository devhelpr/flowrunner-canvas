import * as React from 'react';
import { useState, useEffect } from 'react';

import { IFormControlProps } from './form-control-interface';
import { useFormControlFromCode } from './use-form-control';

export const List = (props: IFormControlProps) => {
	const {metaInfo, node} = props;
	const [ editIndex , setEditIndex] = useState(-1);
	const [ editValue, setEditValue ]= useState("");
	const [ isAdding , setAdding] = useState(false);
	const [ newValue, setNewValue ] = useState("");
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

	const onChangeAddValue = (event) => {
		event.preventDefault();
		setNewValue(event.target.value);
		return false;
	}

	const onAppendValue = (event) => {
		event.preventDefault();

		let newList = [...formControl.value];
		newList.push(newValue);
		formControl.handleChangeByValue(newList);

		setEditIndex(-1);
		setAdding(false);
		setNewValue("");

		return false;
	}

	const onEditValue = (event) => {
		event.preventDefault();
		setEditValue(event.target.value);
		return false;
	}

	const onSaveEditValue = (event) => {
		event.preventDefault();

		let newList = [...formControl.value];
		newList[editIndex] = editValue;
		formControl.handleChangeByValue(newList);

		setEditIndex(-1);
		setAdding(false);
		setEditValue("");

		return false;
	}

	return <div className="form-group">						
			<label>{metaInfo.fieldName || node.name}</label>
			{Array.isArray(formControl.value) && formControl.value.map((listItem, index) => {
				if (editIndex == index) {
					return <div key={"input" + metaInfo.fieldName + index}>
						<input className="form-control" value={editValue} onChange={onEditValue}></input>
						<button onClick={onSaveEditValue} className="btn btn-primary">Save</button>
					</div>
				}
				return <div key={metaInfo.fieldName + index}>
					<a href="#" onClick={(event) => editClick(event, index)} className="fas fa-edit"></a>
					<a href="#" onClick={(event) => deleteClick(event, index)} className="fas fa-trash-alt"></a>{listItem}</div>
			})}
			{isAdding ? 
				<div>
					<input className="form-control" value={newValue} onChange={onChangeAddValue}></input>
					<button onClick={onAppendValue} className="btn btn-primary">Add</button>
				</div> :
				<div>
					<a href="#" onClick={addItem} className="fas fa-plus-circle"></a>
				</div>
			}
	</div>;
}