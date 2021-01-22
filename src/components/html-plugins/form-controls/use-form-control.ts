import * as React from 'react';
import { useState } from 'react';

export const useFormControl = (initialValue, metaInfo: any, sendChange: (value, metaInfo) => void) => {
  const [value, setValue] = useState(initialValue || '');

  const handleChange = event => {
    setValue(event.target.value);
    sendChange(event.target.value, metaInfo);
  };

  return {
    value: value,
    onChange: handleChange,
    setValue
  };
};

export const useFormControlFromCode = (initialValue, metaInfo: any, sendChange: (value, metaInfo) => void) => {
  const [value, setValue] = useState(initialValue || '');

  const handleChange = event => {
    setValue(event.target.value);
    sendChange(event.target.value, metaInfo);
  };

  const handleChangeByValue = value => {
    setValue(value);
    sendChange(value, metaInfo);
  };

  return {
    value: value,
    onChange: handleChange,
    handleChangeByValue: handleChangeByValue,
    setValue
  };
};
