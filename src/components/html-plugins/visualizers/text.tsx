import * as React from 'react';

export interface TextProps {
	node : any;
	payloads : any[];
}

export interface TextState {
	
}

export class Text extends React.Component<TextProps, TextState> {
	state = {
				
	}

	render() {
		let data = "";
		if (this.props.payloads.length > 0) {
			let payload = this.props.payloads[this.props.payloads.length - 1];
			if (this.props.node.propertyName && payload[this.props.node.propertyName]) {						
				data = payload[this.props.node.propertyName];
			}
		}
		let afterLabel = "";
		if (this.props.node.afterLabel) {
			afterLabel = this.props.node.afterLabel;
		}
		return <div className="h-auto">
			<strong className="h1 font-weight-bolder">{data}{afterLabel}</strong>
		</div>;
	}
}