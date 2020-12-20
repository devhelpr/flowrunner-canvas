import * as React from 'react';
import { IFormControlProps } from './form-control-interface';
import { useFormControlFromCode } from './use-form-control';
import Slider from '@material-ui/core/Slider';

export const InputSlider = (props: IFormControlProps) => {
	const { metaInfo, node } = props;
	let formControl = useFormControlFromCode(props.value, metaInfo, props.onChange);
	
	const onChange = (event: object, value: number | number[]) => {
		formControl.handleChangeByValue(value);
	}

	return <div className="form-group">						
			<label>{metaInfo.fieldName || node.name}</label>
			<Slider 
				name={metaInfo.fieldName} 
				min={metaInfo.minValue || 0}
				max={metaInfo.maxValue || 100} 					
				value={formControl.value || 0} 
				onChange={onChange} 
			/>			
	</div>;
}