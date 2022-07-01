import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import useFetch, { CachePolicies } from 'use-http';
import { PopupEnum, useCanvasModeStateStore } from '../../../state/canvas-mode-state';
import { useFlowStore } from '../../../state/flow-state';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;
export const PresetManager = (props) => {
    const [presets, setPresets] = useState([]);
    const [selectedPreset, setSelectedPreset] = useState("");
    const [showPresetNamePopup, setShowPrestNamePopup] = useState(false);
    const canvasMode = useCanvasModeStateStore();
    const flow = useFlowStore();
    const { get, post, response, loading, error } = useFetch({
        data: [],
        cachePolicy: CachePolicies.NO_CACHE
    });
    const loadInitialPresets = useCallback(async () => {
        const initialPresets = await get(`/get-presets?flowId=${flow.flowId}&nodeName=${props.node.name}`);
        if (response.ok) {
            setPresets(initialPresets.data);
        }
    }, [get, response, flow]);
    useEffect(() => {
        loadInitialPresets();
    }, [props.node, flow.flow]);
    const onSelectPreset = useCallback((event) => {
        event.preventDefault();
        setSelectedPreset(event.target.value);
        if (event.target.value != "") {
            get(`/get-preset?flowId=${flow.flowId}&nodeName=${props.node.name}&preset=${event.target.value}`).then((preset) => {
                console.log("preset.data", preset.data);
                props.onSetData(JSON.parse(preset.data));
            });
        }
        return false;
    }, [props.node, flow.flow]);
    const onSavePreset = useCallback((event) => {
        event.preventDefault();
        if (props.onGetData && selectedPreset != "") {
            const data = props.onGetData();
            const foundPresets = presets.filter((preset) => {
                return preset.preset == selectedPreset;
            });
            let presetName = (foundPresets.length > 0 && foundPresets[0].name) || "Preset " + selectedPreset;
            post(`/save-preset?flowId=${flow.flowId}&name=${presetName}&nodeName=${props.node.name}&preset=${selectedPreset}`, { data: data }).then(() => {
            });
        }
        return false;
    }, [props.node, flow.flow]);
    const onPresetName = (name) => {
        const newId = uuidV4();
        const data = props.onGetData();
        setPresets([...presets, {
                preset: newId,
                name,
                data: data
            }]);
        setSelectedPreset(newId);
        post(`/save-preset?flowId=${flow.flowId}&nodeName=${props.node.name}&name=${name}&preset=${newId}`, { data: data }).then(() => {
        });
    };
    const onNewPreset = (event) => {
        event.preventDefault();
        canvasMode.setCurrentPopup(PopupEnum.editNamePopup, onPresetName);
        return false;
    };
    return _jsx(_Fragment, { children: _jsxs("form", { className: "form w-100", children: [_jsx("div", { className: "form-group", children: _jsxs("select", { className: "form-control form-select", onChange: onSelectPreset, value: selectedPreset, children: [_jsx("option", { value: "", disabled: true, children: "Select preset" }), presets && presets.map((preset, index) => {
                                if (!preset) {
                                    return null;
                                }
                                return _jsx("option", { value: preset.preset, children: preset.name }, "preset-" + index);
                            })] }) }), _jsxs("div", { className: "form-group", children: [_jsx("button", { onClick: onSavePreset, className: "btn btn-primary mr-2", children: "Save" }), _jsx("button", { onClick: onNewPreset, className: "btn btn-outline-primary", children: "New preset" })] })] }) });
};
//# sourceMappingURL=preset-manager.js.map