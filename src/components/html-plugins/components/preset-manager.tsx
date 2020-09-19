import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';

import useFetch, { CachePolicies } from 'use-http'

export interface IPresetManagerProps {
	node : any;
	onLoadPreset : any;
	onGetData : any;
	onSetData : any;
}

export const PresetManager = (props : IPresetManagerProps) => {
	const [presets, setPresets] = useState([]);
	const [selectedPreset, setSelectedPreset] = useState("");
	const { get, post, response, loading, error } = useFetch(
		{
			data: [],
			cachePolicy: CachePolicies.NO_CACHE
		}
	);
	const loadInitialPresets = useCallback(async () => {
		const initialPresets = await get(`/get-presets?nodeName=${props.node.name}`);
		if (response.ok) {
			setPresets(initialPresets.data);
		}
	  }, [get, response]);
	
	useEffect(() => { loadInitialPresets() }, []);

	const onSelectPreset = (event) => {
		event.preventDefault();
		setSelectedPreset(event.target.value);
		if (event.target.value != "") {
			get(`/get-preset?nodeName=${props.node.name}&preset=${event.target.value}`).then((preset) => {
				console.log("preset.data", preset.data);
				props.onSetData(JSON.parse(preset.data));
			});
		}
		return false;
	}

	const onSubmitPreset = (event) => {
		event.preventDefault();
		if (props.onGetData && selectedPreset != "") {
			const data = props.onGetData();
			
			post(`/save-preset?nodeName=${props.node.name}&preset=${selectedPreset}`, {data: data}).then(() => {
				//
			});
		}
		return false;
	}

	return <form className="form" onSubmit={onSubmitPreset}>
		<div className="form-group">
			<select className="form-control" 
				onChange={onSelectPreset}
				value={selectedPreset}
				>
				<option value="" disabled>Select preset</option>
				{presets.map((preset : any,index) => {
					if (!preset) {
						return null;
					}
					return <option key={"preset-" + index} value={preset.preset}>{preset.name}</option>
				})}
			</select>
		</div>
		<div className="form-group">
			<button className="btn btn-primary">Save</button>
		</div>
	</form>;
}