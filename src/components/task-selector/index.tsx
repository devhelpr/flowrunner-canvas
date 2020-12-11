import * as React from 'react';
import { getFlowEventRunner } from '@devhelpr/flowrunner-redux';
import fetch from 'cross-fetch';
import { connect } from "react-redux";
import { setCustomConfig } from "../../config";
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';

export interface TaskSelectorProps {
	selectTask : (taskClassName : string) => void;
	canvasMode : any;
	flowrunnerConnector : IFlowrunnerConnector;
}

export interface TaskSelectorState {
	selectedTaskClassName : string;
	metaDataInfo: any[];
}

const mapStateToProps = (state: any) => {
	return {
		canvasMode: state.canvasMode
	}
}


class ContainedTaskSelector extends React.Component<TaskSelectorProps, TaskSelectorState> {

	state = {
		selectedTaskClassName : "",
		metaDataInfo: []
	}

	setupTasks(metaDataInfo : any[]) {
		if (metaDataInfo) {
			metaDataInfo.map((taskPlugin) => {
				if (taskPlugin.config) {
					setCustomConfig(taskPlugin.className, taskPlugin.config);
				}
			})
		}
		const pluginRegistry = this.props.flowrunnerConnector.getPluginRegistry();
		if (pluginRegistry && this.props.canvasMode.flowType == "playground") {

			for (var key of Object.keys(pluginRegistry)) {
				const plugin = pluginRegistry[key];
				if (plugin) {
					metaDataInfo.push({className:key, fullName: key});
				}
			  }

		  }

		// tasks.push({className:"PieChartVisualizer", fullName:"PieChartVisualizer"});
		this.setState({selectedTaskClassName:"",
			metaDataInfo:metaDataInfo.filter((task) => { 
				return task.flowType == this.props.canvasMode.flowType; 
			})
		}, () => {
			this.props.selectTask("");
		});
	}

	loadTasks = () => {

		if (this.props.flowrunnerConnector.hasStorageProvider) {
			let tasks : any[] = this.props.flowrunnerConnector.storageProvider?.getTasks() || [];
			this.setupTasks(tasks);
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
			this.setupTasks(metaDataInfo);
		})
		.catch(err => {
			console.error(err);
		});
	}
	componentDidMount() {
		
		console.log("taskselector", this.props.flowrunnerConnector.getPluginRegistry());
		this.loadTasks();
		
	}


	componentDidUpdate(prevProps: any) {
		if (prevProps.canvasMode.flowType != this.props.canvasMode.flowType) {
			this.loadTasks();
		}
	}

	selectTask = (event) => {
		this.setState({selectedTaskClassName : event.target.value});
		if (this.props.selectTask !== undefined) {
			this.props.selectTask(event.target.value);
		}
	}

	render() {
		/*const metaDataInfo = getFlowEventRunner().getTaskMetaData().sort((a, b) => {
			if (a.fullName < b.fullName) {
				return -1;
			}
			if (a.fullName > b.fullName) {
				return 1;
			}
			return 0;
		});
		*/

		return <div className="task-selector">
			<select className="form-control" value={this.props.canvasMode.selectedTask}
				onChange={this.selectTask}
			>
				<option value="" disabled>Select task</option>
				{this.state.metaDataInfo.map((taskMetaData : any, index) => {
					return <option key={"metadata-"+index} value={taskMetaData.className}>{taskMetaData.fullName}</option>
				})}
			</select>
		</div>
	}
}

export const TaskSelector = connect(mapStateToProps)(ContainedTaskSelector);