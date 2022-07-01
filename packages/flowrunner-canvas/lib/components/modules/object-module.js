import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import useFetch, { CachePolicies } from 'use-http';
import { useCanvasModeStateStore } from '../../state/canvas-mode-state';
import { useModulesStateStore } from '../../state/modules-menu-state';
import { useFlowStore } from '../../state/flow-state';
import { FormNodeHtmlPlugin } from '../html-plugins/form-node';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;
export const ObjectModule = (props) => {
    const [module, setModule] = useState(null);
    const [itemValues, setItemValues] = useState({});
    const modulesMenu = useModulesStateStore();
    const canvasMode = useCanvasModeStateStore();
    const flow = useFlowStore();
    const [datasources, setDatasources] = useState({});
    const { get, del, post, put, response, loading, error } = useFetch({
        data: [],
        cachePolicy: CachePolicies.NO_CACHE
    });
    useEffect(() => {
        return () => {
        };
    }, []);
    const loadContent = () => {
        fetch('/api/module?codeName=content', {})
            .then(res => {
            if (res.status >= 400) {
                throw new Error("Bad response from server");
            }
            return res.json();
        })
            .then(module => {
            let datasource = [];
            module.items.map((item) => {
                datasource.push({
                    label: item.title,
                    value: item.id
                });
            });
            setDatasources({ ...datasources, "content": datasource });
        })
            .catch(err => {
            console.log(`loadModule exception`);
            console.error(err);
        });
    };
    const loadDatasources = (datasources) => {
        if (datasources) {
            datasources.map((datasourceId) => {
                if (datasourceId == "content") {
                    loadContent();
                }
            });
        }
    };
    useEffect(() => {
        const controller = new AbortController();
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
                    loadDatasources(module.datasources);
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
    }, [modulesMenu.selectedModule, flow]);
    const onSaveItem = (moduleItem, event) => {
        event.preventDefault();
        put(`/api/modulecontent?moduleId=${modulesMenu.moduleId}`, {
            data: { ...itemValues }
        }).then(() => {
            if (module && module.datasource == "flows") {
                canvasMode.setFlowsUpdateId(uuidV4());
            }
        });
        return false;
    };
    const onSetValue = (newValue, fieldName) => {
        setItemValues({ ...itemValues, [fieldName]: newValue || "" });
    };
    return _jsx(_Fragment, { children: module && module.items && _jsx(_Fragment, { children: _jsxs("div", { className: "row no-gutters position-relative", children: [_jsx("div", { className: "col", children: _jsx("h2", { className: "h5", children: module.name }) }), _jsx("div", { className: "col-12", children: _jsx("hr", {}) }), _jsxs("div", { className: "col-12 d-flex flex-column", children: [_jsx("div", { className: "border mb-2", children: _jsx(FormNodeHtmlPlugin, { isNodeSettingsUI: true, isInFlowEditor: false, node: module.items, datasources: datasources, taskSettings: {
                                        configMenu: {
                                            fields: module.fields
                                        }
                                    }, onSetValue: onSetValue, flowrunnerConnector: undefined }) }), _jsx("div", { className: "align-self-start mb-4", children: _jsx("button", { onClick: (event) => { onSaveItem(module.items, event); }, className: "btn btn-primary mr-2", children: "Save" }) })] })] }) }) });
};
//# sourceMappingURL=object-module.js.map