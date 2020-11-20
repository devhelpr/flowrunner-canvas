import * as React from 'react';
import { RadioButton } from './radiobutton';
import { Select } from './select';
import { Input } from './input';
import { IFormControlProps } from './form-control-interface';
const formControls = {
	select: Select,
	text: Input,
	radiobutton : RadioButton
}

export const getFormControl = (formControl, props : IFormControlProps) => {
	if (formControls[formControl]) {
		const FormControl = formControls[formControl];
		return <FormControl {...props}></FormControl>;
	}
	return <></>;
}