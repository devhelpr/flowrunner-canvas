import * as React from 'react';
import { useState, useEffect } from 'react';
import { IFormControlProps } from './form-control-interface';
import { useFormControl } from './use-form-control';
import { onFocus } from './helpers/focus';

export interface ISelectOption {
	value : string;
	label : string;
}

export const Select = (props: IFormControlProps) => {
	const {metaInfo, node} = props;
	let formControl = useFormControl(props.value, metaInfo, props.onChange);

	useEffect(() => {
		formControl.setValue(props.value);
	}, [props.value]);
	
	/*useEffect(() => {
		let isOptionFound = false;
		let trigger = false;
		if (props.datasource) {
			trigger = true;
			props.datasource.map((option) => {
				if (formControl.value === option.value) {
					isOptionFound = true;
				}
			});
		}

		if (trigger) {
			if (!isOptionFound) {
				formControl.value = "";
				props.onChange("", metaInfo);
			} else {
				// OORZAAK VAN DE DEADLOCK??
				props.onChange(formControl.value, metaInfo);
			}
		}
	}, [props.datasource]);


	useEffect(() => {
		let isOptionFound = false;
		let trigger = false;
		if (metaInfo.options && !props.datasource) {
			trigger = true;
			metaInfo.options.map((option) => {
				if (formControl.value === option.value) {
					isOptionFound = true;
				}
			});
		}
		if (trigger) {
			if (!isOptionFound) {
				formControl.value = "";
				props.onChange("", metaInfo);
			} else {
				// OORZAAK VAN DE DEADLOCK??
				props.onChange(formControl.value, metaInfo);
			}
		}
	}, [metaInfo.options]);
	*/
	let showDefaultOption = true;
	if (metaInfo.hideDefaultOption === true) {
		showDefaultOption = false;
	}
	return <div className="form-group">						
		<label htmlFor={"input-" + props.node.name}><strong>{metaInfo.label || metaInfo.fieldName || node.name}</strong>{!!metaInfo.required && " *"}</label>
		<div className="input-group mb-1">
			<select className="form-control form-select" required={props.metaInfo && !!props.metaInfo.required} 
				id={"select-" + props.node.name + "-" + metaInfo.fieldName}
				value={formControl.value} 
				disabled={!props.enabled}
				onFocus={onFocus}
				onChange={formControl.onChange} >
				{showDefaultOption === true && <option value="" disabled>Select value</option>}
				{metaInfo && (props.datasource || metaInfo.options || []).map((option : ISelectOption, index) => {
					return <React.Fragment key={"select"+index}>
						<option value={option.value}>{option.label}</option>
					</React.Fragment>
				})}
			</select>
		</div>
	</div>;
}