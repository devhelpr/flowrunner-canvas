import * as React from 'react';

export interface ListProps {
	node : any;
	payloads : any[];
}

export interface ListState {
	
}

export class List extends React.Component<ListProps, ListState> {
	override state = {
				
	}

	override render() {
		let payload;
		if (this.props.payloads.length > 0) {
			payload = this.props.payloads[this.props.payloads.length - 1];
		}
		
		const node = this.props.node;
		return <div className="h-auto">
			{node && node.list && node.list.map((listItem, index) => {
				return <div key={"index-" + index} className="mb-1">
					<label className="font-weight-bolder mb-0">{listItem.label}</label>
					<div>{payload && payload[listItem.propertyName]}</div>
				</div>
			})}
			
		</div>;
	}
}