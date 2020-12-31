import * as React from 'react';
import { IFormControlProps } from './form-control-interface';
import { useFormControl } from './use-form-control';

export const Textarea = (props: IFormControlProps) => {
	const {metaInfo, node} = props;
	let formControl = useFormControl(props.value, metaInfo, props.onChange);
	
	return <div className="form-group">						
			<label>{metaInfo.fieldName || node.name}</label>
			<textarea 				
				className="form-control"
				name={metaInfo.fieldName} 			
				{...formControl}></textarea>
	</div>;
}