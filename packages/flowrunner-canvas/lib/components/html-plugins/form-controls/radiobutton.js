import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { useEffect } from 'react';
import { useFormControl } from './use-form-control';
import { onFocus } from './helpers/focus';
export const RadioButton = (props) => {
    const { metaInfo, node } = props;
    let formControl = useFormControl(props.value, metaInfo, props.onChange);
    useEffect(() => {
        formControl.setValue(props.value);
    }, [props.value]);
    return _jsxs("div", { className: "form-group", children: [_jsxs("label", { htmlFor: "input-" + props.node.name, children: [_jsx("strong", { children: metaInfo.label || metaInfo.fieldName || node.name }), !!metaInfo.required && " *"] }), _jsx("div", { className: "mb-1", children: metaInfo && (props.datasource || metaInfo.options || []).map((option, index) => {
                    return _jsx(React.Fragment, { children: _jsxs("div", { className: "form-check", children: [_jsx("input", { type: "radio", className: "form-check-input", id: metaInfo.fieldName + "-" + index, name: metaInfo.fieldName, value: option.value, onChange: formControl.onChange, onFocus: onFocus, checked: formControl.value === option.value }), _jsx("label", { className: "form-check-label", htmlFor: metaInfo.fieldName + "-" + index, children: option.label })] }) }, "radiobutton" + index);
                }) })] });
};
//# sourceMappingURL=radiobutton.js.map