import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useFormControlFromCode } from './use-form-control';
export const Image = (props) => {
    var _a, _b;
    const { metaInfo, node } = props;
    let formControl = useFormControlFromCode(props.value, metaInfo, props.onChange);
    useEffect(() => {
        formControl.setValue(props.value);
    }, [props.value]);
    return _jsx("div", { className: "form-group", children: _jsx("img", { src: (_b = (_a = props.payload) === null || _a === void 0 ? void 0 : _a.imageUrl) !== null && _b !== void 0 ? _b : metaInfo.defaultValue, className: "tw-aspect-square tw-object-cover tw-w-full tw-h-auto", id: "image-" + props.node.name + "-" + metaInfo.fieldName }) });
};
//# sourceMappingURL=image.js.map