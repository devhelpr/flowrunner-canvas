import * as React from 'react';
import { getFlowEventRunner } from '@devhelpr/flowrunner-redux';
import fetch from 'cross-fetch';
import { connect } from "react-redux";

export interface TaskSelectorProps {
	selectTask : (taskClassName : string) => void;
	canvasMode : any;
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