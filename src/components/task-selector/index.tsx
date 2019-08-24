import * as React from 'react';
import { getFlowEventRunner } from '@devhelpr/flowrunner-redux';
import fetch from 'cross-fetch';

export interface TaskSelectorProps {
	selectTask : (taskClassName : string) => void
}

export interface TaskSelectorState {
	selectedTaskClassName : string;
	metaDataInfo: any[];
}

export class TaskSelector extends React.Component<TaskSelectorProps, TaskSelectorState> {

	state = {
		selectedTaskClassName : "",
		metaDataInfo: []
	}

	componentDidMount() {
		fetch('/get-tasks')
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
			<select className="form-control" value={this.state.selectedTaskClassName}
				onChange={this.selectTask}
			>
				<option value="" disabled>Kies een taak om toe te voegen</option>
				{this.state.metaDataInfo.map((taskMetaData : any, index) => {
					return <option key={"metadata-"+index} value={taskMetaData.className}>{taskMetaData.fullName}</option>
				})}
			</select>
		</div>
	}
}
