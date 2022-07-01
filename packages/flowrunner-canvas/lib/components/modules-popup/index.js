import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useModulesStateStore } from '../../state/modules-menu-state';
import { TestsModule } from '../modules/tests-module';
import { CrudModule } from '../modules/crud-module';
import { ObjectModule } from '../modules/object-module';
export const ModulesPopup = (props) => {
    const [show, setShow] = useState(false);
    const modulesMenu = useModulesStateStore();
    const containerRef = useRef(null);
    useEffect(() => {
        setShow(true);
    }, []);
    return _jsxs(_Fragment, { children: [_jsx("div", { ref: containerRef }), _jsxs(Modal, { show: show, centered: true, size: "xl", container: containerRef.current, children: [_jsx(Modal.Header, { children: _jsx(Modal.Title, { children: modulesMenu.selectedModule }) }), _jsxs(Modal.Body, { children: [modulesMenu.selectedModule == "tests" &&
                                _jsx(TestsModule, { flowrunnerConnector: props.flowrunnerConnector }), modulesMenu.selectedModule != "tests" && modulesMenu.selectedModule != "" &&
                                modulesMenu.moduleType == "crud-model" &&
                                _jsx(CrudModule, {}), modulesMenu.selectedModule != "tests" && modulesMenu.selectedModule != "" &&
                                modulesMenu.moduleType == "object-model" &&
                                _jsx(ObjectModule, {})] }), _jsx(Modal.Footer, { children: _jsx("a", { href: "#", className: "btn btn-secondary", onClick: props.onClose, children: "Close" }) })] })] });
};
//# sourceMappingURL=index.js.map