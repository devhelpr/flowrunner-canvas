import { useState } from 'react';
export const useFormControl = (initialValue, metaInfo, sendChange) => {
    const [value, setValue] = useState(initialValue || '');
    const handleChange = event => {
        setValue(event.target.value);
        sendChange(event.target.value, metaInfo);
    };
    return {
        value: value,
        onChange: handleChange,
        setValue,
    };
};
export const useFormControlFromCode = (initialValue, metaInfo, sendChange) => {
    const [value, setValue] = useState(initialValue || '');
    const handleChange = event => {
        setValue(event.target.value);
        sendChange(event.target.value, metaInfo);
    };
    const handleChangeByValue = value => {
        setValue(value);
        sendChange(value, metaInfo);
    };
    const sendChangeDirect = value => {
        sendChange(value, metaInfo);
    };
    return {
        value: value,
        onChange: handleChange,
        handleChangeByValue: handleChangeByValue,
        setValue,
        sendChangeDirect,
    };
};
//# sourceMappingURL=use-form-control.js.map