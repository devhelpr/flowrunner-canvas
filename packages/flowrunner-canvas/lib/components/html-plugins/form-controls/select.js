import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { useEffect } from 'react';
import { useFormControl } from './use-form-control';
import { onFocus } from './helpers/focus';
export const Select = (props) => {
    const { metaInfo, node } = props;
    let formControl = useFormControl(props.value, metaInfo, props.onChange);
    useEffect(() => {
        formControl.setValue(props.value);
    }, [props.value]);
    let showDefaultOption = true;
    if (metaInfo.hideDefaultOption === true) {
        showDefaultOption = false;
    }
    return _jsxs("div", { className: "form-group", children: [_jsxs("label", { htmlFor: "input-" + props.node.name, children: [_jsx("strong", { children: metaInfo.label || metaInfo.fieldName || node.name }), !!metaInfo.required && " *"] }), _jsx("div", { className: "input-group mb-1", children: _jsxs("select", { className: "form-control form-select", required: props.metaInfo && !!props.metaInfo.required, id: "select-" + props.node.name + "-" + metaInfo.fieldName, value: formControl.value, disabled: !props.enabled, onFocus: onFocus, onChange: formControl.onChange, children: [showDefaultOption === true && _jsx("option", { value: "", disabled: true, children: "Select value" }), metaInfo && (props.datasource || metaInfo.options || []).map((option, index) => {
                            return _jsx(React.Fragment, { children: _jsx("option", { value: option.value || (typeof option === "string" && option) || "", children: option.label || (typeof option === "string" && option) || "" }) }, "select" + index);
                        })] }) })] });
};
//# sourceMappingURL=select.js.map