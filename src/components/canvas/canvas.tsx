import * as React from 'react';
import { Stage, Layer , Rect } from 'react-konva';
import { Circle } from './shapes/circle'; 

export const Canvas = () => {
	return <>
		<Stage
			draggable={true}
			pixelRatio={1} 
			width={ 1024 } 
			height={750} className="stage-container">
			<Layer>
				<Rect  x={0} y={0} width={1024} height={750}></Rect>
				<Circle></Circle>
			</Layer>
		</Stage>
	</>
} 