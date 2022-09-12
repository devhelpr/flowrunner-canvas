import * as React from 'react';
import { useEffect } from 'react';
import { replaceValues } from '../../helpers/replace-values';

import { IFormControlProps } from './form-control-interface';
import { useFormControlFromCode } from './use-form-control';

export const LinkButton = (props: IFormControlProps) => {
	const { metaInfo, node } = props;
	let formControl = useFormControlFromCode(props.value, metaInfo, props.onChange);
	
	useEffect(() => {
		formControl.setValue(props.value);
	}, [props.value]);

	const values = {...props.currentFormValues, ...props.payload};

	let disabled = !props.enabled;
	if (props.fieldDefinition.enabledIfPropertyIsTruthy) {
		if (!values[props.fieldDefinition.enabledIfPropertyIsTruthy]) {
			disabled = true;
		}
	}

	return <div className={`form-group ${props.fieldIndex > 0 ? "tw-mt-2 tw-mb-2" : "tw-mb-2"}`}>						
			<button className={`btn btn-primary tw-w-full`}
				disabled={disabled}
				onClick={(event) => {
					event.preventDefault();
					console.log("props", props);
					if (props.fieldDefinition.linkTemplate) {
						const url = replaceValues(props.fieldDefinition.linkTemplate, values, false);
						location.href = url;
					}
					return false;
				}}>{metaInfo.label || metaInfo.fieldName || node.name}</button>		
	</div>;
}