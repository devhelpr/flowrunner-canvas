import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { onFocus } from './helpers/focus';
import { useFormControl } from './use-form-control';
export const Textarea = (props) => {
    const textAreaRef = useRef(null);
    const [minRows, setMinRows] = useState(2);
    const [maxRows, setMaxRows] = useState(30);
    const [rows, setRows] = useState(2);
    const { metaInfo, node } = props;
    let formControl = useFormControl(props.value, metaInfo, props.onChange);
    useEffect(() => {
    }, []);
    useLayoutEffect(() => {
        formControl.setValue(props.value);
    }, [props.value]);
    const calculateTextareaHeight = () => {
        if (textAreaRef && textAreaRef.current) {
            const textareaLineHeight = 24;
            if (textAreaRef.current != null) {
                const textArea = textAreaRef.current;
                const previousRows = textArea.rows;
                textArea.rows = minRows;
                const currentRows = Math.floor(textArea.scrollHeight / textareaLineHeight);
                if (currentRows === previousRows) {
                    textArea.rows = currentRows;
                }
                if (currentRows >= maxRows) {
                    textArea.rows = maxRows;
                    textArea.scrollTop = textArea.scrollHeight;
                }
                setRows(currentRows < maxRows ? currentRows : maxRows);
            }
        }
        else {
            console.log("TEXTAREA REF is nog niet gezet in calculateTextareaHeight");
        }
    };
    const onChange = (event) => {
        event.preventDefault();
        formControl.onChange(event);
        return false;
    };
    return _jsxs("div", { className: "form-group", children: [_jsxs("label", { children: [_jsx("strong", { children: metaInfo.label || metaInfo.fieldName || node.name }), !!metaInfo.required && " *"] }), _jsx("textarea", { className: "form-control", id: "textarea-" + props.node.name + "-" + metaInfo.fieldName, name: metaInfo.fieldName, value: formControl.value, disabled: !props.enabled, onChange: onChange, onFocus: onFocus, readOnly: !props.enabled, rows: props.node.rows || metaInfo.rows || 3, ref: ref => (textAreaRef.current = ref), spellCheck: false })] });
};
//# sourceMappingURL=textarea.js.map