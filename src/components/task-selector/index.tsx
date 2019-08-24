import * as React from 'react';
import { getFlowEventRunner } from '@devhelpr/flowrunner-redux';

export interface TaskSelectorProps {
	selectTask : (taskClassName : string) => void
}

export interface TaskSelectorState {
	selectedTaskClassName : string;
}

export class TaskSelector extends React.Component<TaskSelectorProps, TaskSelectorState> {

	state = {
		selectedTaskClassName : ""
	}

	selectTask = (event) => {
		this.setState({selectedTaskClassName : event.target.value});
		if (this.props.selectTask !== undefined) {
			this.props.selectTask(event.target.value);
		}
	}

	render() {
		const metaDataInfo = getFlowEventRunner().getTaskMetaData().sort((a, b) => {
			if (a.fullName < b.fullName) {
				return -1;
			}
			if (a.fullName > b.fullName) {
				return 1;
			}
			return 0;
		});

		return <div className="task-selector">
			<select className="form-control" value={this.state.selectedTaskClassName}
				onChange={this.selectTask}
			>
				<option value="" disabled>Kies een taak om toe te voegen</option>
				{metaDataInfo.map((taskMetaData, index) => {
					return <option key={"metadata-"+index} value={taskMetaData.className}>{taskMetaData.fullName}</option>
				})}
			</select>
		</div>
	}
}
