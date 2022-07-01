import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useFormControlFromCode } from './use-form-control';
import Slider from '@material-ui/core/Slider';
import { onFocus } from './helpers/focus';
export const InputSlider = (props) => {
    const { metaInfo, node } = props;
    let formControl = useFormControlFromCode(props.value, metaInfo, props.onChange);
    useEffect(() => {
        formControl.setValue(props.value);
    }, [props.value]);
    const onChange = (event, value) => {
        formControl.handleChangeByValue(value);
    };
    return _jsxs("div", { className: "form-group", children: [_jsxs("label", { children: [_jsxs("strong", { children: [metaInfo.label || metaInfo.fieldName || node.name, " (", formControl.value || 0, ")"] }), !!metaInfo.required && " *"] }), _jsx(Slider, { name: metaInfo.fieldName, min: Number(metaInfo.min) || 0, max: Number(metaInfo.max) || 100, value: parseInt(formControl.value) || 0, onChange: onChange, onFocus: onFocus, disabled: !props.enabled, id: "slider-" + props.node.name + "-" + metaInfo.fieldName })] });
};
//# sourceMappingURL=input-slider.js.map