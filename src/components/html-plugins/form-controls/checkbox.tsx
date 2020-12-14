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
	const onClick = (event) => {
		formControl.handleChangeByValue(!formControl.value);
	}	
	return <div className="form-group">						
		<div className="form-check">
			<input 
				type="checkbox" 
				className="form-check-input"
				id={props.node.name+"-checkbox"}
				name={props.node.name} 
				onChange={onClick} 
				checked={formControl.value === true}></input>
			<label 
				className="form-check-label"
				htmlFor={props.node.name+"-checkbox"}>{metaInfo.fieldName || node.name}</label>
		</div>
	</div>;
}