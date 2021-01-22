import * as React from 'react';
import { RadioButton } from './radiobutton';
import { Select } from './select';
import { Input } from './input';
import { CheckBox } from './checkbox';
import { Textarea } from './textarea';
import { InputSlider } from './input-slider';
import { List } from './list';
import { ObjectList } from './object-list';
import { IFormControlProps } from './form-control-interface';

const formControls = {
	select: Select,
	text: Input,
	radiobutton : RadioButton,
	checkbox: CheckBox,
	textarea: Textarea,
	slider: InputSlider,
	list: List,
	objectList: ObjectList
}

export const getFormControl = (formControl, props : IFormControlProps) => {
	if (formControls[formControl]) {
		const FormControl = formControls[formControl];
		return <FormControl {...props}></FormControl>;
	}
	return <></>;
}