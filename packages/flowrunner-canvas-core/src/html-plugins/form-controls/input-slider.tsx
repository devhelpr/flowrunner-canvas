import * as React from 'react';
import { useState, useEffect } from 'react';

import { IFormControlProps } from './form-control-interface';
import { useFormControlFromCode } from './use-form-control';
import { onFocus } from './helpers/focus';

import * as muicore from '@material-ui/core';
const Slider = muicore.Slider;

export const InputSlider = (props: IFormControlProps) => {
	const { metaInfo, node } = props;
	let formControl = useFormControlFromCode(props.value, metaInfo, props.onChange);
	
	useEffect(() => {
		formControl.setValue(props.value);
	}, [props.value]);

	const onChange = (event: object, value: number | number[]) => {
		formControl.handleChangeByValue(value);
	}

	return <div className="form-group">						
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