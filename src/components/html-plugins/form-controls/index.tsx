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

const RichTextEditor = React.lazy(() => import('./richtexteditor').then(({ RichTextEditor }) => ({ default: RichTextEditor })));

const formControls = {
	select: Select,
	text: Input,
	radiobutton : RadioButton,
	checkbox: CheckBox,
	textarea: Textarea,
	slider: InputSlider,
	list: List,
	objectList: ObjectList,
	richtexteditor: RichTextEditor
}

export const getFormControl = (formControl, props : IFormControlProps) => {
	if (formControls[formControl]) {
		const FormControl = formControls[formControl];
		return <FormControl {...props}></FormControl>;
	}
	return <></>;
}