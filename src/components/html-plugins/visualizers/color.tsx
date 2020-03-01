import * as React from 'react';

export interface ColorProps {
	node : any;
	payloads : any[];
}

export interface ColorState {
	
}

export class Color extends React.Component<ColorProps, ColorState> {
	state = {
				
	}

	render() {
		let background = "#ffffff";
		if (this.props.payloads.length > 0) 
		{
			let payload = this.props.payloads[this.props.payloads.length - 1];
			if (payload.color !== undefined) {
				background = payload.color
			}
		}
		//console.log("color", background);
		return <div className="h-100 w-100" style={{
			background : background
		}}></div>;
	}
}