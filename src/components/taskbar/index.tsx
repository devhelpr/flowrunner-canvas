import * as React from 'react';
import { useState, useEffect } from 'react';
import fetch from 'cross-fetch';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { useCanvasModeStateStore} from '../../state/canvas-mode-state';
import { useModulesStateStore } from '../../state/modules-menu-state';

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

export const Taskbar = (props: TaskbarProps) => {
	const [metaDataInfo, setMetaDataInfo] = useState([] as any[]);
	const [menuMode, setMenuMode] = useState(TaskMenuMode.tasks);
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
			setupTasks(tasks);
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
			setupTasks(metaDataInfo);			
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

	const onDragStart = (event) => {
		// event.target.id
		event.dataTransfer.setData("data-task", event.target.getAttribute("data-task"));
	}

	const renderRect = (className, taskMetaData) => {
		/*
		style={{				
					fill: "rgb(255,255,255)",
					stroke-width: 2,
					stroke: "rgb(0,0,0)"
					}
				}
		*/

		const shapeType = FlowToCanvas.getShapeType("Rect", className, false);

		if (shapeType == "Circle") {
			/*
				<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36">
					<circle cx="18" cy="18" r="14" className="taskbar__task-circle" />
					<text fill="#000000" className="taskbar__task-text" x="50%" y="19px" dominantBaseline="middle" textAnchor="middle" fontSize="12" height={36} width={32}>{className.substring(0,2)}</text>
				</svg>

			*/
			return <div className="taskbar__task" title={className} data-task={className}  draggable={true} onDragStart={onDragStart}>				
				<div className="taskbar__taskname">{className}</div>
			</div>;
		}

		if (shapeType == "Ellipse") {
			/*
				<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36">
					<ellipse cx="18" cy="18" rx="14" ry="10" className="taskbar__task-circle" />
					<text fill="#000000" className="taskbar__task-text" x="50%" y="19px" dominantBaseline="middle" textAnchor="middle" fontSize="12" height={36} width={32}>{className.substring(0,2)}</text>
				</svg>

			*/
			return <div className="taskbar__task" title={className} data-task={className}  draggable={true} onDragStart={onDragStart}>	
				<div className="taskbar__taskname">{className}</div>			
			</div>;
		}

		if (shapeType == "Diamond") {						
			/*
				<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36">
					<polygon points="18,4,34,20,18,36,2,20" className="taskbar__task-circle"  />
					<text fill="#000000" className="taskbar__task-text" x="50%" y="19px" dominantBaseline="middle" textAnchor="middle" fontSize="12" height={36} width={32}>{className.substring(0,2)}</text>
				</svg>							

			*/
			return <div className="taskbar__task" title={className} data-task={className}  draggable={true} onDragStart={onDragStart}>				
				<div className="taskbar__taskname">{className}</div>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
					<polygon points="8,2,14,8,8,14,2,8"  className="taskbar__task-circle"  />
				</svg>							
			</div>;	
		}

		/*
			<svg xmlns="http://www.w3.org/2000/svg" width="36" height="20" viewBox="0 0 36 22">
				<rect fill="#ffffff" strokeWidth={2} stroke="#000000" width="32" y="1" x="2" height="20" rx="0" ry="0"  />
				<text fill="#000000" className="taskbar__task-text" x="50%" y="13px" dominantBaseline="middle" textAnchor="middle" fontSize="12" height={20} width={32}>{className.substring(0,2)}</text>
			</svg>

		*/	

		return <div className="taskbar__task" title={className} data-task={className}  draggable={true} onDragStart={onDragStart}>
			<div className="taskbar__taskname">{className}</div>
			{taskMetaData.icon && <span className={"taskbar__task-icon fas " +  taskMetaData.icon}></span>}			
		</div>;
	}

	/*
		<img src="/svg/flow-rect.svg" alt="rect" data-task="Assign"  draggable={true} onDragStart={this.onDragStart} />
		<img src="/svg/flow-rect.svg" alt="rect" data-task="InjectIntoPayload"  draggable={true} onDragStart={this.onDragStart} />
		<img src="/svg/flow-rect.svg" alt="rect" data-task="SliderTask"  draggable={true} onDragStart={this.onDragStart} />
		<img src="/svg/flow-circle.svg" alt="rect" data-task="InjectIntoPayload" draggable={true} />
		<img src="/svg/flow-ellipse.svg" alt="rect" data-task="InjectIntoPayload" draggable={true} />
	*/
	
	return <>
		<div className="taskbar">
			{menuMode == TaskMenuMode.tasks ?
				<>{metaDataInfo.map((taskMetaData : any, index) => {
					//return <img key={"metadata-"+index} src="/svg/flow-rect.svg" alt={taskMetaData.fullName} data-task={taskMetaData.className}  draggable={true} onDragStart={this.onDragStart} />
					return <React.Fragment key={index}>					
						{renderRect(taskMetaData.className, taskMetaData)}
					</React.Fragment>
				})}</> : 
				<>
					<button onClick={onShowTests} className="btn btn-outline-primary">Tests</button>
				</>} 
		</div>
	</>;

}

