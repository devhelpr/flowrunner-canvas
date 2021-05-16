import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import useFetch, { CachePolicies } from 'use-http'
import { Button } from 'react-bootstrap';

import { PopupEnum, useCanvasModeStateStore} from '../../state/canvas-mode-state';
import { useModulesStateStore } from '../../state/modules-menu-state';
import { FormNodeHtmlPlugin } from '../html-plugins/form-node';

export interface CrudModulePopupProps {
	
}

export const CrudModule = (props: CrudModulePopupProps) => {
	const [module , setModule] = useState(null as any);
	const [itemId, setItemId] = useState("");
	const [isAddingNewItem , setIsAddingNewItem] = useState(false);
	const [itemValues, setItemValues] = useState({} as any);
	const modulesMenu = useModulesStateStore();
	const canvasMode = useCanvasModeStateStore();
	
	const { get, post, put, response, loading, error } = useFetch(
		{
			data: [],
			cachePolicy: CachePolicies.NO_CACHE
		}
	);

	useEffect(() => {
		return () => {
		}
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

	const loadModule = useCallback(() => {
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
	}, []);

	useEffect(() => {
		loadModule();
		return () => {
			//
		}
	}, [modulesMenu.selectedModule]);

	const openModuleItem = (moduleItem, event) => {
		event.preventDefault();
		//loadModuleContent(moduleItem.id);
		if (itemId === moduleItem.id) {
			setItemId("");
			setItemValues({});
		} else {
			setItemId(moduleItem.id);
			setItemValues(moduleItem);
		}
		return false;
	}

	const onSaveItem = (moduleItem, event) => {
		event.preventDefault();
		put(`/api/modulecontent?moduleId=${modulesMenu.moduleId}&id=${moduleItem.id}`, 
			{
				data: {...itemValues}
			}).then(() => {
				setItemId("");
				setIsAddingNewItem(false);
				setItemValues({});
				loadModule();
		});
		return false;
	}

	const onSaveNewItem = (event) => {
		event.preventDefault();
		post(`/api/modulecontent?moduleId=${modulesMenu.moduleId}`, 
			{
				data: {...itemValues}
			}).then(() => {
				setItemId("");
				setIsAddingNewItem(false);
				setItemValues({});
				loadModule();
		});
		return false;
	}

	const onAddNewItem = (event) => {
		event.preventDefault();
		setItemId("");
		setIsAddingNewItem(true);
		setItemValues({});
		return false;
	}

	const onCancelEdit = (event) => {
		event.preventDefault();
		setItemId("");
		setIsAddingNewItem(false);
		setItemValues({});
		return false;
	}

	const onSetValue = (newValue, fieldName) => {
		setItemValues({...itemValues, [fieldName]: newValue || ""});
	}
	
	return <>
		{!isAddingNewItem && module && module.items && module.items.map((item, index) => { 
			return <div key={"module-item-" + index} 
				className="row no-gutters position-relative">
				<div className="col">
					<h2 className="h5">{item.title}</h2>
					<p className="text-secondary mb-0">{item.url}</p>
				</div>
				<a href="#" onClick={(event) => {openModuleItem(item ,event)}} 
					className={(itemId == "" && "stretched-link ") + "col-auto align-self-center text-center position-static"}>
					<span className="fa fa-edit"></span>
				</a>
				<div className="col-12">
					<hr />
				</div>
				{itemId == item.id && <div className="col-12 d-flex flex-column">
					<div className="border mb-2">
						<FormNodeHtmlPlugin 
							isNodeSettingsUI={true} 
							node={item} 
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
					<div className="align-self-start mb-2">
						<button onClick={(event) => {onSaveItem(item ,event)}} className="btn btn-primary mr-2">Save</button>
						<button onClick={onCancelEdit} className="btn btn-outline-primary">Cancel</button>
					</div>
				</div>
				}				
			</div>;
		})}
		<div>
			{!isAddingNewItem && itemId == "" && <button onClick={onAddNewItem} className="btn btn-outline-primary">Add</button>}
			{isAddingNewItem && <>
				<div className="border mb-2">
					<FormNodeHtmlPlugin 
						isNodeSettingsUI={true} 
						node={{}} 
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
				<div className="d-flex">
					<button onClick={onSaveNewItem} className="btn btn-primary mr-2">Save</button>
					<button onClick={onCancelEdit} className="btn btn-outline-primary">Cancel</button>
				</div>
			</>}

		</div>		
	</>;
}
