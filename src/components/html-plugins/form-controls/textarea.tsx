import * as React from 'react';
import { useState, useEffect } from 'react';

import { IFormControlProps } from './form-control-interface';
import { useFormControl } from './use-form-control';

export const Textarea = (props: IFormControlProps) => {
	const {metaInfo, node} = props;
	let formControl = useFormControl(props.value, metaInfo, props.onChange);
	
	useEffect(() => {
		formControl.setValue(props.value);
	}, [props.value]);

	return <div className="form-group">						
			<label><strong>{metaInfo.label || metaInfo.fieldName || node.name}</strong></label>
			<textarea 				
				className="form-control"
				name={metaInfo.fieldName} 			
				{...formControl}></textarea>
	</div>;
}