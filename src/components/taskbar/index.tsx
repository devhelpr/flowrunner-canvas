import * as React from 'react';
import fetch from 'cross-fetch';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { ShapeSettings } from '../../helpers/shape-settings';

export interface TaskbarProps {
}

export interface TaskbarState {
	metaDataInfo: any[];
}


export class Taskbar extends React.Component<TaskbarProps, TaskbarState> {

	state = {
		metaDataInfo : []
	}

	componentDidMount() {
		fetch('/tasks')
		.then(res => {
			if (res.status >= 400) {
				throw new Error("Bad response from server");
			}
			return res.json();
		})
		.then(metaDataInfo => {
			this.setState({metaDataInfo:metaDataInfo});
		})
		.catch(err => {
			console.error(err);
		});
	}

	onDragStart = (event) => {
		// event.target.id
		event.dataTransfer.setData("data-task", event.target.getAttribute("data-task"));
	}

	renderRect = (className) => {
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
			return <div className="taskbar__task" title={className} data-task={className}  draggable={true} onDragStart={this.onDragStart}>				
				<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36">
					<circle cx="18" cy="18" r="14" className="taskbar__task-circle" />
					<text fill="#000000" className="taskbar__task-text" x="50%" y="19px" dominantBaseline="middle" textAnchor="middle" fontSize="12" height={36} width={32}>{className.substring(0,2)}</text>
				</svg>
			</div>;
		}

		if (shapeType == "Ellipse") {
			return <div className="taskbar__task" title={className} data-task={className}  draggable={true} onDragStart={this.onDragStart}>				
				<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36">
					<ellipse cx="18" cy="18" rx="14" ry="10" className="taskbar__task-circle" />
					<text fill="#000000" className="taskbar__task-text" x="50%" y="19px" dominantBaseline="middle" textAnchor="middle" fontSize="12" height={36} width={32}>{className.substring(0,2)}</text>
				</svg>
			</div>;
		}

		if (shapeType == "Diamond") {
			return <div className="taskbar__task" title={className} data-task={className}  draggable={true} onDragStart={this.onDragStart}>				
				<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36">
					<polygon points="18,4,34,20,18,36,2,20" className="taskbar__task-circle"  />
					<text fill="#000000" className="taskbar__task-text" x="50%" y="19px" dominantBaseline="middle" textAnchor="middle" fontSize="12" height={36} width={32}>{className.substring(0,2)}</text>
				</svg>
			</div>;	
		}

		return <div className="taskbar__task" title={className} data-task={className}  draggable={true} onDragStart={this.onDragStart}>
		<svg xmlns="http://www.w3.org/2000/svg" width="36" height="20" viewBox="0 0 36 22">
			<rect fill="#ffffff" strokeWidth={2} stroke="#000000" width="32" y="1" x="2" height="20" rx="0" ry="0"  />
			<text fill="#000000" className="taskbar__task-text" x="50%" y="13px" dominantBaseline="middle" textAnchor="middle" fontSize="12" height={20} width={32}>{className.substring(0,2)}</text>
		</svg>
	</div>;

	}

	/*
		<img src="/svg/flow-rect.svg" alt="rect" data-task="Assign"  draggable={true} onDragStart={this.onDragStart} />
		<img src="/svg/flow-rect.svg" alt="rect" data-task="InjectIntoPayload"  draggable={true} onDragStart={this.onDragStart} />
		<img src="/svg/flow-rect.svg" alt="rect" data-task="SliderTask"  draggable={true} onDragStart={this.onDragStart} />
		<img src="/svg/flow-circle.svg" alt="rect" data-task="InjectIntoPayload" draggable={true} />
		<img src="/svg/flow-ellipse.svg" alt="rect" data-task="InjectIntoPayload" draggable={true} />
	*/

	render() {
		return <>
			<div className="taskbar">
				{this.state.metaDataInfo.map((taskMetaData : any, index) => {
					//return <img key={"metadata-"+index} src="/svg/flow-rect.svg" alt={taskMetaData.fullName} data-task={taskMetaData.className}  draggable={true} onDragStart={this.onDragStart} />
					return <React.Fragment key={index}>
						{this.renderRect(taskMetaData.className)}
					</React.Fragment>
				})}
			</div>
		</>;
	}
}