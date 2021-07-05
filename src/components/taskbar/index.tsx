import * as React from 'react';
import { useState, useEffect } from 'react';
import { Draggable } from './draggable';
import fetch from 'cross-fetch';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { useCanvasModeStateStore} from '../../state/canvas-mode-state';
import { useModulesStateStore } from '../../state/modules-menu-state';
import { DragginTask} from '../../dragging-task';


export interface TaskbarProps {
	flowrunnerConnector : IFlowrunnerConnector;
}

export interface TaskbarState {
	metaDataInfo: any[];
}

export enum TaskMenuMode {
	tasks = 0,
	modules
}

export interface IModule {
	id: string;
	name: string;
	fileName: string
	moduleType: string;
	urlProperty : string;
	structure : string;
	primaryKey : string;
}

export const Taskbar = (props: TaskbarProps) => {
	const [metaDataInfo, setMetaDataInfo] = useState([] as any[]);
	const [menuMode, setMenuMode] = useState(TaskMenuMode.tasks);
	const [modules , setModules] = useState([] as IModule[]);
	const canvasMode = useCanvasModeStateStore();
	const modulesMenu = useModulesStateStore();
	
	const setupTasks = (metaDataInfo : any[]) => {
		const taskPluginsSortedList = metaDataInfo.sort((a, b) => {
			if (a.fullName < b.fullName) {
				return -1;
			}
			if (a.fullName > b.fullName) {
				return 1;
			}
			return 0;
		});
		
		setMetaDataInfo(taskPluginsSortedList.filter((task) => { 
				return task.flowType == canvasMode.flowType; 
			}).map((task) => {
					const taskSettings = FlowToCanvas.getTaskSettings(task.className);
					return {...task, 
						icon : taskSettings.icon || task.icon || ""
					};
				})
			);
	}

	const loadTasks = () => {

		if (props.flowrunnerConnector.hasStorageProvider) {
			let tasks : any[] = props.flowrunnerConnector.storageProvider?.getTasks() || [];
			setupTasks([...tasks, ...props.flowrunnerConnector.getTasksFromPluginRegistry()]);
			return;
		}

		fetch('/tasks')
		.then(res => {
			if (res.status >= 400) {
				throw new Error("Bad response from server");
			}
			return res.json();
		})
		.then(metaDataInfo => {
			setupTasks([...metaDataInfo,...props.flowrunnerConnector.getTasksFromPluginRegistry()]);			
		})
		.catch(err => {
			console.error(err);
		});
	}

	const loadModules = () => {
		fetch('/api/modules')
		.then(res => {
			if (res.status >= 400) {
				throw new Error("Bad response from server");
			}
			return res.json();
		})
		.then(modules => {
			console.log("modules", modules);
			setModules(modules);			
		})
		.catch(err => {
			console.error(err);
		});
	}

	useEffect(() => {
		loadTasks();
	}, [canvasMode]);

	useEffect(() => {
		if (modulesMenu.isOpen) {
			setMenuMode(TaskMenuMode.modules);
			loadModules();
		} else {
			setMenuMode(TaskMenuMode.tasks);
		}
	}, [modulesMenu.isOpen])
	
	useEffect(() => {
		if (metaDataInfo.length > 0) {
			let loadingElement = document.getElementById("loading");
			if (loadingElement && !loadingElement.classList.contains("loaded")) {
				loadingElement.classList.add("loaded");
				setTimeout(() => {
					let loadingElement = document.getElementById("loading");
					if (loadingElement) {
						loadingElement.classList.add("hidden");
					}
				},350);
			}
		}
	}, [metaDataInfo]);

	const onShowTests = (event) => {
		event.preventDefault();
		modulesMenu.showModule("tests");
		return false;
	}

	const onShowModule = (module : IModule, event) => {
		event.preventDefault();
		modulesMenu.showModule(module.name, module.id, module.moduleType);
		return false;
	}

	const onDragStart = (event) => {
		// event.target.id
		event.dataTransfer.setData("data-task", event.target.getAttribute("data-task"));
	}

	const renderRect = (className, taskMetaData) => {
		let html5DragAndDrop = false;
		const shapeType = FlowToCanvas.getShapeType("Rect", className, false);

		if (shapeType == "Circle") {			
			return <div className="taskbar__task" title={className} data-task={className}  draggable={html5DragAndDrop} onDragStart={onDragStart}>				
				<div className="taskbar__taskname">{className}</div>
			</div>;
		}

		if (shapeType == "Ellipse") {			
			return <div className="taskbar__task" title={className} data-task={className}  draggable={html5DragAndDrop} onDragStart={onDragStart}>	
				<div className="taskbar__taskname">{className}</div>			
			</div>;
		}

		if (shapeType == "Diamond") {									
			return <div className="taskbar__task" title={className} data-task={className}  draggable={html5DragAndDrop} onDragStart={onDragStart}>				
				<div className="taskbar__taskname">{className}</div>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
					<polygon points="8,2,14,8,8,14,2,8"  className="taskbar__task-circle"  />
				</svg>							
			</div>;	
		}	

		return <div className="taskbar__task" title={className} data-task={className}  draggable={html5DragAndDrop} onDragStart={onDragStart}>
			<div className="taskbar__taskname">{className}</div>
			{taskMetaData.icon && <span className={"taskbar__task-icon fas " +  taskMetaData.icon}></span>}			
		</div>;
	}

	return <>
		<div className="taskbar">
			{menuMode == TaskMenuMode.tasks ?
				<>{metaDataInfo.map((taskMetaData : any, index) => {
					return <Draggable id={taskMetaData.className} key={taskMetaData.className}>
							{renderRect(taskMetaData.className, taskMetaData)}
						</Draggable>					
				})}</> : 
				<>{modules.map((module, index) => {
						return <button key={"module-" + index} onClick={(event) => onShowModule(module, event)} className="btn btn-outline-primary w-100 mb-2">{module.name}</button>
					})}
					{canvasMode.flowType == "playground" && <button onClick={onShowTests} className="btn btn-outline-primary w-100">Tests</button>}
				</>} 
		</div>
	</>;

}

