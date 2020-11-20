import * as React from 'react';
import { useState, useEffect } from 'react';
import { IFormControlProps } from './form-control-interface';
import { useFormControl } from './use-form-control';

export interface IRadioButtonOption {
	value : string;
	label : string;
}

export const RadioButton = (props: IFormControlProps) => {
	const {metaInfo, node} = props;
	let formControl = useFormControl(props.value, metaInfo, props.onChange);
		
	return <div className="form-group">						
		<label htmlFor={"input-" + props.node.name}><strong>{metaInfo.fieldName || node.name}</strong>{!!metaInfo.required && " *"}</label>
		<div className="mb-1">
			{metaInfo && (props.datasource || metaInfo.options || []).map((option : IRadioButtonOption, index) => {
				return <React.Fragment key={"radiobutton"+index}>
					<div className="form-check">
						<input 
							type="radio" 
							className="form-check-input"
							id={props.node.name + "-" + index}
							name={props.node.name} 
							value={option.value} 
							onChange={formControl.onChange} 
							checked={formControl.value === option.value}></input>
						<label 
							className="form-check-label"
							htmlFor={props.node.name + "-" + index}>{option.label}</label>
					</div>
				</React.Fragment>
			})}
		</div>
	</div>;
}