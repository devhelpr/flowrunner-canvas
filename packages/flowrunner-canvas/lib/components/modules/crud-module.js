import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import useFetch, { CachePolicies } from 'use-http';
import { useCanvasModeStateStore } from '../../state/canvas-mode-state';
import { useModulesStateStore } from '../../state/modules-menu-state';
import { useFlowStore } from '../../state/flow-state';
import { FormNodeHtmlPlugin } from '../html-plugins/form-node';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;
export const CrudModule = (props) => {
    const [module, setModule] = useState(null);
    const [itemId, setItemId] = useState("");
    const [isAddingNewItem, setIsAddingNewItem] = useState(false);
    const [itemValues, setItemValues] = useState({});
    const modulesMenu = useModulesStateStore();
    const canvasMode = useCanvasModeStateStore();
    const flow = useFlowStore();
    const { get, del, post, put, response, loading, error } = useFetch({
        data: [],
        cachePolicy: CachePolicies.NO_CACHE
    });
    useEffect(() => {
        return () => {
        };
    }, []);
    const loadModuleContent = useCallback((itemId) => {
        const controller = new AbortController();
        const { signal } = controller;
        fetch('/api/modulecontent?moduleId=' + modulesMenu.moduleId + '&id=' + itemId, { signal })
            .then(res => {
            if (res.status >= 400) {
                throw new Error("Bad response from server");
            }
            return res.json();
        })
            .then(moduleContent => {
            console.log("module content", moduleContent);
            setItemId(itemId);
        })
            .catch(err => {
            console.error(err);
        });
        return () => {
            controller.abort();
        };
    }, [modulesMenu.selectedModule]);
    const loadModule = useCallback((controller) => {
        const { signal } = controller;
        let isAborting = false;
        if (modulesMenu.moduleId) {
            fetch('/api/module?id=' + modulesMenu.moduleId, { signal })
                .then(res => {
                if (res.status >= 400) {
                    throw new Error("Bad response from server");
                }
                return res.json();
            })
                .then(module => {
                console.log("module", module);
                if (!isAborting) {
                    setModule(module);
                }
            })
                .catch(err => {
                console.log(`loadModule exception`);
                console.error(err);
                isAborting = true;
                controller.abort();
            });
        }
        return () => {
            console.log(`loadModule unmount`);
            isAborting = true;
            controller.abort();
        };
    }, [modulesMenu.selectedModule]);
    useEffect(() => {
        const controller = new AbortController();
        loadModule(controller);
        return () => {
            console.log("unmount crud-module");
            controller.abort();
        };
    }, [modulesMenu.selectedModule, flow]);
    const openModuleItem = (moduleItem, event) => {
        event.preventDefault();
        if (itemId === moduleItem.id) {
            setItemId("");
            setItemValues({});
        }
        else {
            setItemId(moduleItem.id);
            setItemValues(moduleItem);
        }
        return false;
    };
    const deleteModuleItem = (moduleItem, event) => {
        event.preventDefault();
        if (module && module.datasource == "flows" && moduleItem.id == flow.flowId) {
            alert(`You can't delete the current flow in the editor`);
            return;
        }
        if (confirm(`Are you sure you want to delete "${moduleItem.title || moduleItem.name}"?`)) {
            del(`/api/modulecontent?moduleId=${modulesMenu.moduleId}&id=${moduleItem.id}`).then(() => {
                setItemId("");
                setIsAddingNewItem(false);
                setItemValues({});
                if (module && module.datasource == "flows") {
                    canvasMode.setFlowsUpdateId(uuidV4());
                }
                const controller = new AbortController();
                loadModule(controller);
            });
        }
        ;
        return false;
    };
    const onStoreMediaFile = (moduleItem) => {
        let file = undefined;
        module.fields.forEach(field => {
            if (field.fieldType === "fileupload") {
                file = itemValues[field.fieldName].fileData;
            }
        });
        console.log("onStoreMediaFile", itemValues.filename, itemValues, module.fields);
        if (file) {
            console.log("onStoreMediaFile : call media api");
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/media');
            const data = new FormData();
            data.append('image', file);
            xhr.send(data);
        }
    };
    const onSaveItem = (moduleItem, event) => {
        event.preventDefault();
        onStoreMediaFile(moduleItem);
        put(`/api/modulecontent?moduleId=${modulesMenu.moduleId}&id=${moduleItem.id}`, {
            data: { ...itemValues }
        }).then(() => {
            setItemId("");
            setIsAddingNewItem(false);
            setItemValues({});
            if (module && module.datasource == "flows") {
                canvasMode.setFlowsUpdateId(uuidV4());
            }
            const controller = new AbortController();
            loadModule(controller);
        });
        return false;
    };
    const onSaveNewItem = (event) => {
        event.preventDefault();
        onStoreMediaFile(undefined);
        post(`/api/modulecontent?moduleId=${modulesMenu.moduleId}`, {
            data: { ...itemValues }
        }).then(() => {
            setItemId("");
            setIsAddingNewItem(false);
            setItemValues({});
            const controller = new AbortController();
            loadModule(controller);
        });
        return false;
    };
    const onAddNewItem = (event) => {
        event.preventDefault();
        setItemId("");
        setIsAddingNewItem(true);
        setItemValues({});
        return false;
    };
    const onCancelEdit = (event) => {
        event.preventDefault();
        setItemId("");
        setIsAddingNewItem(false);
        setItemValues({});
        return false;
    };
    const onSetValue = (newValue, fieldName) => {
        setItemValues({ ...itemValues, [fieldName]: newValue || "" });
    };
    const supportsAdd = () => {
        console.log("supportsAdd", module);
        if (module &&
            ((!module.crudOperations) ||
                (module.crudOperations && module.crudOperations.indexOf("add") >= 0))) {
            return true;
        }
        return false;
    };
    return _jsxs(_Fragment, { children: [!isAddingNewItem && module && module.items && module.items.map((item, index) => {
                return _jsxs("div", { className: "row no-gutters position-relative", children: [_jsxs("div", { className: "col", children: [_jsx("h2", { className: "h5", children: item.title || item.name }), item.url && _jsx("p", { className: "text-secondary mb-0", children: item.url })] }), _jsx("a", { href: "#", onClick: (event) => { deleteModuleItem(item, event); }, className: "col-auto align-self-center text-center position-static mr-2", children: _jsx("span", { className: "fa fa-trash" }) }), _jsx("a", { href: "#", onClick: (event) => { openModuleItem(item, event); }, className: "col-auto align-self-center text-center position-static", children: _jsx("span", { className: "fa fa-edit" }) }), _jsx("div", { className: "col-12", children: _jsx("hr", {}) }), itemId == item.id && _jsxs("div", { className: "col-12 d-flex flex-column", children: [_jsx("div", { className: "border mb-2", children: _jsx(FormNodeHtmlPlugin, { isNodeSettingsUI: true, isInFlowEditor: false, node: item, taskSettings: {
                                            configMenu: {
                                                fields: module.fields
                                            }
                                        }, onSetValue: onSetValue, flowrunnerConnector: undefined }) }), _jsxs("div", { className: "align-self-start mb-4", children: [_jsx("button", { onClick: (event) => { onSaveItem(item, event); }, className: "btn btn-primary mr-2", children: "Save" }), _jsx("button", { onClick: onCancelEdit, className: "btn btn-outline-primary", children: "Cancel" })] })] })] }, "module-item-" + index);
            }), _jsxs("div", { children: [supportsAdd() && !isAddingNewItem && itemId == "" && _jsx("button", { onClick: onAddNewItem, className: "btn btn-outline-primary", children: "Add" }), isAddingNewItem && _jsxs(_Fragment, { children: [_jsx("div", { className: "border mb-2", children: _jsx(FormNodeHtmlPlugin, { isNodeSettingsUI: true, isInFlowEditor: false, node: {}, taskSettings: {
                                        configMenu: {
                                            fields: module.fields
                                        }
                                    }, onSetValue: onSetValue, flowrunnerConnector: undefined }) }), _jsxs("div", { className: "d-flex", children: [_jsx("button", { onClick: onSaveNewItem, className: "btn btn-primary mr-2", children: "Save" }), _jsx("button", { onClick: onCancelEdit, className: "btn btn-outline-primary", children: "Cancel" })] })] })] })] });
};
//# sourceMappingURL=crud-module.js.map