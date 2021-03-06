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

	return <div className="form-group">						
			<label><strong>{metaInfo.label || metaInfo.fieldName || node.name} ({formControl.value || 0})</strong>{!!metaInfo.required && " *"}</label>
			<Slider 
				name={metaInfo.fieldName} 
				min={metaInfo.min || 0}
				max={metaInfo.max || 100} 					
				value={formControl.value || 0} 
				onChange={onChange}
				onFocus={onFocus} 
			/>			
	</div>;
}