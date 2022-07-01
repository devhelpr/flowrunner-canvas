import * as React from 'react';
import { useEffect } from 'react';
import { getCurrentStateMachine } from '../../../state-machine';

import { IFormControlProps } from './form-control-interface';
import { useFormControlFromCode } from './use-form-control';

export const StateMachineEventButton = (props: IFormControlProps) => {
	const { metaInfo, node } = props;
	let formControl = useFormControlFromCode(props.value, metaInfo, props.onChange);
	
	useEffect(() => {
		formControl.setValue(props.value);
	}, [props.value]);

	return <div className={`form-group ${props.fieldIndex > 0 ? "tw-mt-2 tw-mb-2" : "tw-mb-2"}`}>						
			<button className={`btn btn-primary tw-w-full`}
				disabled={!props.enabled}
				onClick={(event) => {
					event.preventDefault();
					const stateMachine = getCurrentStateMachine();				
					stateMachine.event(metaInfo.defaultValue, props.payload);
					return false;
				}}>{metaInfo.label || metaInfo.fieldName || node.name}</button>		
	</div>;
}