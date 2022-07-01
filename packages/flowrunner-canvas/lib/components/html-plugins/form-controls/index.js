import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { RadioButton } from './radiobutton';
import { Select } from './select';
import { Input } from './input';
import { CheckBox } from './checkbox';
import { Textarea } from './textarea';
import { InputSlider } from './input-slider';
import { List } from './list';
import { ObjectList } from './object-list';
import { HashMap } from './hashmap';
import { Image } from './image';
import { StateMachineEventButton } from './stateMachineEventButton';
const RichTextEditor = React.lazy(() => import('./richtexteditor').then(({ RichTextEditor }) => ({ default: RichTextEditor })));
const formControls = {
    select: Select,
    text: Input,
    radiobutton: RadioButton,
    checkbox: CheckBox,
    textarea: Textarea,
    slider: InputSlider,
    list: List,
    objectList: ObjectList,
    hashmap: HashMap,
    richtexteditor: RichTextEditor,
    image: Image,
    stateMachineEventButton: StateMachineEventButton
};
export const getFormControl = (formControl, props) => {
    if (formControls[formControl]) {
        const FormControl = formControls[formControl];
        return _jsx(FormControl, { ...props });
    }
    return _jsx(_Fragment, {});
};
//# sourceMappingURL=index.js.map