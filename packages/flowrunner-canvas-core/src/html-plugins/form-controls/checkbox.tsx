import * as React from 'react';
import { useState, useEffect } from 'react';

import { IFormControlProps } from './form-control-interface';
import { useFormControlFromCode } from './use-form-control';
import { onFocus } from './helpers/focus';

export interface IRadioButtonOption {
  value: string;
  label: string;
}

export const CheckBox = (props: IFormControlProps) => {
  const { metaInfo, node } = props;
  let formControl = useFormControlFromCode(props.value, metaInfo, props.onChange);
  useEffect(() => {
    formControl.setValue(props.value);
  }, [props.value]);

  useEffect(() => {
    if (props.value === props.metaInfo.defaultValue && props.metaInfo.defaultValue !== undefined) {
      formControl.handleChangeByValue(props.value);
    }
  }, []);
  const onClick = (event) => {
    formControl.handleChangeByValue(!formControl.value);
  };
  return (
    <div className="form-group">
      <div className="form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id={node.name + '-' + metaInfo.fieldName + '-checkbox'}
          name={metaInfo.fieldName}
          onChange={onClick}
          onFocus={onFocus}
          checked={formControl.value === true}
          disabled={!props.enabled}
        ></input>
        <label className="form-check-label" htmlFor={node.name + '-' + metaInfo.fieldName + '-checkbox'}>
          {metaInfo.label || metaInfo.fieldName || node.name}
          {!!metaInfo.required && ' *'}
        </label>
      </div>
    </div>
  );
};
