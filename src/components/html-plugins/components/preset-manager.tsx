import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';

import useFetch, { CachePolicies } from 'use-http'
import { PopupEnum, useCanvasModeStateStore} from '../../../state/canvas-mode-state';
import { useFlowStore} from '../../../state/flow-state';

import * as uuid from 'uuid';
const uuidV4 = uuid.v4;
/*
	TODO:
		- load presets for a given node name for the current flow
		- when saving a preset, send also flowId
		- add "new preset" button (show popup to enter name)
		- add "change preset name" button (show popup to change name)
		- add "delete preset" button to remove current preset 

		- should be configurarable via config for node that has FormNode as UI

		- button to mark preset as default
		- load default preset after initialising flow
*/
export interface IPresetManagerProps {
	node : any;
	onLoadPreset : any;
	onGetData : any;
	onSetData : any;
}

export const PresetManager = (props : IPresetManagerProps) => {
	const [presets, setPresets] = useState([] as any[]);
	const [selectedPreset, setSelectedPreset] = useState("");
	const [showPresetNamePopup , setShowPrestNamePopup] = useState(false);
	const canvasMode = useCanvasModeStateStore();
	const flow = useFlowStore();
	
	const { get, post, response, loading, error } = useFetch(
		{
			data: [],
			cachePolicy: CachePolicies.NO_CACHE
		}
	);
	const loadInitialPresets = useCallback(async () => {
		// 
		const initialPresets = await get(`/get-presets?flowId=${flow.flowId}&nodeName=${props.node.name}`);
		if (response.ok) {
			setPresets(initialPresets.data);
		}
	  }, [get, response, flow]);
	
	useEffect(() => { 
		loadInitialPresets() 
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
	}, [props.node, flow.flow])

	const onSavePreset = useCallback((event) => {
		event.preventDefault();
		if (props.onGetData && selectedPreset != "") {
			const data = props.onGetData();
			const foundPresets = presets.filter((preset) => {
				return preset.preset == selectedPreset;
			});
			let presetName = (foundPresets.length > 0 && foundPresets[0].name) || "Preset " + selectedPreset;
			post(`/save-preset?flowId=${flow.flowId}&name=${presetName}&nodeName=${props.node.name}&preset=${selectedPreset}`, {data: data}).then(() => {
				//
			});
		}
		return false;
	}, [props.node, flow.flow])

	const onPresetName = (name : string) => {
		const newId = uuidV4();
		const data = props.onGetData();
		setPresets([...presets, {
			preset: newId,
			name,
			data: data	
		}]);
		setSelectedPreset(newId);

		post(`/save-preset?flowId=${flow.flowId}&nodeName=${props.node.name}&name=${name}&preset=${newId}`, {data: data}).then(() => {
			//
		});
	}

	const onNewPreset = (event) => {
		event.preventDefault();
		canvasMode.setCurrentPopup(PopupEnum.editNamePopup, onPresetName);
		return false;
	}
	
	return <>
		<form className="form w-100">
			<div className="form-group">
				<select className="form-control" 
					onChange={onSelectPreset}
					value={selectedPreset}
					>
					<option value="" disabled>Select preset</option>
					{presets && presets.map((preset : any,index) => {
						if (!preset) {
							return null;
						}
						return <option key={"preset-" + index} value={preset.preset}>{preset.name}</option>
					})}
				</select>
			</div>
			<div className="form-group">
				<button onClick={onSavePreset} className="btn btn-primary mr-2">Save</button>
				<button onClick={onNewPreset} className="btn btn-outline-primary">New preset</button>
			</div>
		</form>		
	</>;	
}