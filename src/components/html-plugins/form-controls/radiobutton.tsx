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

	useEffect(() => {
		formControl.setValue(props.value);
	}, [props.value]);

	return <div className="form-group">						
		<label htmlFor={"input-" + props.node.name}><strong>{metaInfo.label || metaInfo.fieldName || node.name}</strong>{!!metaInfo.required && " *"}</label>
		<div className="mb-1">
			{metaInfo && (props.datasource || metaInfo.options || []).map((option : IRadioButtonOption, index) => {
				return <React.Fragment key={"radiobutton"+index}>
					<div className="form-check">
						<input 
							type="radio" 
							className="form-check-input"
							id={metaInfo.fieldName + "-" + index}
							name={metaInfo.fieldName} 
							value={option.value} 
							onChange={formControl.onChange} 
							checked={formControl.value === option.value}></input>
						<label 
							className="form-check-label"
							htmlFor={metaInfo.fieldName + "-" + index}>{option.label}</label>
					</div>
				</React.Fragment>
			})}
		</div>
	</div>;
}