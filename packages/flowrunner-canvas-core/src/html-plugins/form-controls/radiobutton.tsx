import * as React from 'react';
import { useState, useEffect } from 'react';
import { IFormControlProps } from './form-control-interface';
import { useFormControl } from './use-form-control';
import { onFocus } from './helpers/focus';

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

				let optionOutput: any = option;
				if (metaInfo.datasourceLabelProperty && metaInfo.datasourceValueProperty) {
					optionOutput.label = option[metaInfo.datasourceLabelProperty];
					optionOutput.value = option[metaInfo.datasourceValueProperty];
				}
				
				const currrentOptionValue = optionOutput.value || 
					((typeof option === "string" || typeof option === "number") && (option as any).toString()) || "";

				return <React.Fragment key={"radiobutton"+index}>
					<div className="form-check">
						<input 
							type="radio" 
							className="form-check-input"
							id={metaInfo.fieldName + "-" + index}
							name={metaInfo.fieldName} 
							value={currrentOptionValue} 
							onChange={formControl.onChange} 
							onFocus={onFocus}
							checked={formControl.value === currrentOptionValue}></input>
						<label 
							className="form-check-label"
							htmlFor={metaInfo.fieldName + "-" + index}>{optionOutput.label || 
								((typeof option === "string" || typeof option === "number") && (option as any).toString()) || ""}</label>
					</div>
				</React.Fragment>
			})}
		</div>
	</div>;
}