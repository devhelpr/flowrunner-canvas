import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import useFetch, { CachePolicies } from 'use-http'
import { Button } from 'react-bootstrap';

import { PopupEnum, useCanvasModeStateStore} from '../../state/canvas-mode-state';
import { useModulesStateStore } from '../../state/modules-menu-state';
import { useFlowStore } from '../../state/flow-state';
import { FormNodeHtmlPlugin } from '../html-plugins/form-node';

import * as uuid from 'uuid';

const uuidV4 = uuid.v4;


export interface ObjectModulePopupProps {
	
}

export const ObjectModule = (props: ObjectModulePopupProps) => {
	const [module , setModule] = useState(null as any);
	const [itemValues, setItemValues] = useState({} as any);
	const modulesMenu = useModulesStateStore();
	const canvasMode = useCanvasModeStateStore();
	const flow = useFlowStore();
	const [datasources, setDatasources] = useState({} as any);

	const { get, del, post, put, response, loading, error } = useFetch(
		{
			data: [],
			cachePolicy: CachePolicies.NO_CACHE
		}
	);

	useEffect(() => {
		return () => {
		}
	}, []);

	const loadContent = () => {
		fetch('/api/module?codeName=content', {  })
		.then(res => {
			if (res.status >= 400) {
				throw new Error("Bad response from server");
			}
			return res.json();
		})
		.then(module => {
			let datasource : any[] = [];
			module.items.map((item) => {
				datasource.push({
					label: item.title,
					value: item.id
				});
			})
			setDatasources({...datasources, "content": datasource});
		})
		.catch(err => {
			console.log(`loadModule exception`);
			console.error(err);
			
		});
	}

	const loadDatasources = (datasources) => {
		if (datasources) {
			datasources.map((datasourceId) => {
				if (datasourceId == "content") {
					loadContent();
				}
			});
		}
	}

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
		put(`/api/modulecontent?moduleId=${modulesMenu.moduleId}`, 
			{
				data: {...itemValues}
			}).then(() => {
				setItemValues({});

				if (module && module.datasource == "flows") {
					canvasMode.setFlowsUpdateId(uuidV4());
				}				
			});
		return false;
	}
	

	const onCancelEdit = (event) => {
		event.preventDefault();
		setItemValues({});
		return false;
	}

	const onSetValue = (newValue, fieldName) => {
		setItemValues({...itemValues, [fieldName]: newValue || ""});
	}
	
	return <>
		{module && module.items && <>{ 
			<div className="row no-gutters position-relative">
				<div className="col">
					<h2 className="h5">{module.name}</h2>
				</div>
				<div className="col-12">
					<hr />
				</div>
				<div className="col-12 d-flex flex-column">
					<div className="border mb-2">
						<FormNodeHtmlPlugin 
							isNodeSettingsUI={true} 
							node={module.items}
							datasources={datasources} 
							taskSettings={
								{
									configMenu: {
										fields: module.fields
									}
								}
							}
							onSetValue={onSetValue}
							flowrunnerConnector={undefined}
							></FormNodeHtmlPlugin>
					</div>
					<div className="align-self-start mb-4">
						<button onClick={(event) => {onSaveItem(module.items ,event)}} className="btn btn-primary mr-2">Save</button>
						<button onClick={onCancelEdit} className="btn btn-outline-primary">Cancel</button>
					</div>
				</div>
				
			</div>
		}</>}			
	</>;
}
