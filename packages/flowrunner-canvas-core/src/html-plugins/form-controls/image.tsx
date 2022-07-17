import * as React from 'react';
import { useEffect } from 'react';

import { IFormControlProps } from './form-control-interface';
import { useFormControlFromCode } from './use-form-control';

export const Image = (props: IFormControlProps) => {
	const { metaInfo, node } = props;
	let formControl = useFormControlFromCode(props.value, metaInfo, props.onChange);
	useEffect(() => {
		formControl.setValue(props.value);
	}, [props.value]);

	return <div className="form-group">						
			<img src={props.payload?.imageUrl ?? metaInfo.defaultValue}
				className="tw-aspect-square tw-object-cover tw-w-full tw-h-auto"				 
				id={"image-" + props.node.name + "-" + metaInfo.fieldName}
			/>			
	</div>;
}