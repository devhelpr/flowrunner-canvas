import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
export const NamePopup = (props) => {
    const [show, setShow] = useState(false);
    const [value, setValue] = useState("");
    const containerRef = useRef(null);
    useEffect(() => {
        setShow(true);
    }, []);
    const onSave = (e) => {
        if (value === "") {
            alert(`${props.nameCaption} is required.`);
        }
        else {
            props.onSave(value);
        }
        e.preventDefault();
        return false;
    };
    const onChangeName = (event) => {
        event.preventDefault();
        setValue(event.target.value);
        return false;
    };
    return _jsxs(_Fragment, { children: [_jsx("div", { ref: containerRef }), _jsxs(Modal, { show: show, centered: true, size: "sm", container: containerRef.current, children: [_jsx(Modal.Header, { children: _jsxs(Modal.Title, { children: ["Edit ", props.nameCaption] }) }), _jsx(Modal.Body, { children: _jsxs("div", { className: "form-group", children: [_jsx("label", { children: props.nameCaption }), _jsx("input", { className: "form-control", value: value, required: true, onChange: onChangeName })] }) }), _jsxs(Modal.Footer, { children: [_jsx(Button, { variant: "secondary", onClick: props.onClose, children: "Close" }), _jsx(Button, { variant: "primary", onClick: onSave, children: "OK" })] })] })] });
};
//# sourceMappingURL=index.js.map