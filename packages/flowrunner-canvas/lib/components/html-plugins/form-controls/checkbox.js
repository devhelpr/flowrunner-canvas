import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useFormControlFromCode } from './use-form-control';
import { onFocus } from './helpers/focus';
export const CheckBox = (props) => {
    const { metaInfo, node } = props;
    let formControl = useFormControlFromCode(props.value, metaInfo, props.onChange);
    useEffect(() => {
        formControl.setValue(props.value);
    }, [props.value]);
    const onClick = (event) => {
        formControl.handleChangeByValue(!formControl.value);
    };
    return _jsx("div", { className: "form-group", children: _jsxs("div", { className: "form-check", children: [_jsx("input", { type: "checkbox", className: "form-check-input", id: node.name + "-" + metaInfo.fieldName + "-checkbox", name: metaInfo.fieldName, onChange: onClick, onFocus: onFocus, checked: formControl.value === true, disabled: !props.enabled }), _jsxs("label", { className: "form-check-label", htmlFor: node.name + "-" + metaInfo.fieldName + "-checkbox", children: [metaInfo.label || metaInfo.fieldName || node.name, !!metaInfo.required && " *"] })] }) });
};
//# sourceMappingURL=checkbox.js.map