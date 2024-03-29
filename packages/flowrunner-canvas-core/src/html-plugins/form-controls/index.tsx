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
import { HashMap } from './hashmap';
import { Image } from './image';
import { Video } from './video';
import { StateMachineEventButton } from './stateMachineEventButton';
import { LinkButton } from './link-button';
import { TriggerButton } from './trigger-button';
import { Icon } from './icon';
const RichTextEditor = React.lazy(() =>
  import('./richtexteditor').then(({ RichTextEditor }) => ({ default: RichTextEditor })),
);

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
  icon: Icon,
  image: Image,
  video: Video,
  stateMachineEventButton: StateMachineEventButton,
  linkbutton: LinkButton,
  triggerbutton: TriggerButton,
};

export const getFormControl = (formControl, props: IFormControlProps) => {
  if (formControls[formControl]) {
    const FormControl = formControls[formControl];
    return <FormControl {...props}></FormControl>;
  }
  return <></>;
};
