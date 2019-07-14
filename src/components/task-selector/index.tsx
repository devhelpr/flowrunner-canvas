import * as React from 'react';
import { getFlowEventRunner } from '@devhelpr/flowrunner-redux';

export class TaskSelector extends React.Component {
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
			<select defaultValue="">
				<option value="" disabled>Kies een taak om toe te voegen</option>
				{metaDataInfo.map((taskMetaData, index) => {
					return <option key={"metadata-"+index} value={taskMetaData.className}>{taskMetaData.fullName}</option>
				})}
			</select>
		</div>
	}
}
