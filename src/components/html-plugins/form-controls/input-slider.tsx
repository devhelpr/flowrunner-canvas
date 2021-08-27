import * as React from 'react';
import { useState, useEffect } from 'react';

import { IFormControlProps } from './form-control-interface';
import { useFormControlFromCode } from './use-form-control';
import Slider from '@material-ui/core/Slider';
import { onFocus } from './helpers/focus';

export const InputSlider = (props: IFormControlProps) => {
	const { metaInfo, node } = props;
	let formControl = useFormControlFromCode(props.value, metaInfo, props.onChange);
	
	useEffect(() => {
		formControl.setValue(props.value);
	}, [props.value]);

	const onChange = (event: object, value: number | number[]) => {
		formControl.handleChangeByValue(value);
	}

	return <div className="form-group"
				onClick={(event) => props.onFormControlGroupClick(event, metaInfo.fieldName, "slider-" + props.node.name + "-" + metaInfo.fieldName)}
			>						
			<label><strong>{metaInfo.label || metaInfo.fieldName || node.name} ({formControl.value || 0})</strong>{!!metaInfo.required && " *"}</label>
			<Slider 
				name={metaInfo.fieldName} 
				min={Number(metaInfo.min) || 0}
				max={Number(metaInfo.max) || 100} 					
				value={parseInt(formControl.value) || 0} 
				onChange={onChange}
				onFocus={onFocus} 
				disabled={!props.enabled}
				id={"slider-" + props.node.name + "-" + metaInfo.fieldName}
			/>			
	</div>;
}