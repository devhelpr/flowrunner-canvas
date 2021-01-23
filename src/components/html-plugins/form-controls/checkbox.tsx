import * as React from 'react';
import { useState, useEffect } from 'react';

import { IFormControlProps } from './form-control-interface';
import { useFormControlFromCode } from './use-form-control';

export interface IRadioButtonOption {
	value : string;
	label : string;
}

export const CheckBox = (props: IFormControlProps) => {
	const {metaInfo, node} = props;
	let formControl = useFormControlFromCode(props.value, metaInfo, props.onChange);

	useEffect(() => {
		formControl.setValue(props.value);
	}, [props.value]);

	const onClick = (event) => {
		formControl.handleChangeByValue(!formControl.value);
	}	
	return <div className="form-group">						
		<div className="form-check">
			<input 
				type="checkbox" 
				className="form-check-input"
				id={metaInfo.fieldName+"-checkbox"}
				name={metaInfo.fieldName} 
				onChange={onClick} 
				checked={formControl.value === true}></input>
			<label 
				className="form-check-label"
				htmlFor={metaInfo.fieldName+"-checkbox"}>{metaInfo.label || metaInfo.fieldName || node.name}</label>
		</div>
	</div>;
}