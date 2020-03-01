import * as React from 'react';
import { Stage, Layer , Circle } from 'react-konva';

export interface XYCanvasProps {
	node : any;
	payloads : any[];
}

export interface XYCanvasState {
	
}

export class XYCanvas extends React.Component<XYCanvasProps, XYCanvasState> {
	state = {
				
	}
	componentDidMount() {
	}

	render() {
		let circles : any = null;
		const {node, payloads} = this.props;
		circles = payloads.map((payload, index) => {
			let circle : any = null;
			if (node.xProperty && node.yProperty) {
				if (!isNaN(payload[node.xProperty]) && !isNaN(payload[node.yProperty])) {
					circle = <Circle 
						key={"xycanvas-" + index}
						x={payload[node.xProperty]}
						y={payload[node.yProperty]}
						radius={4}
						stroke={"#000000"}
						strokeWidth={2}
						width={4}
						height={4}
						fill={"#000000"} 
						perfectDrawEnabled={false}>
					</Circle>
				}
			}
			return circle;
		});
		return <Stage
				pixelRatio={1} 
				width={this.props.node.width || 250}
				height={this.props.node.height || 250}>		
			<Layer>
			{circles}
			</Layer>
		</Stage>;
	}
}