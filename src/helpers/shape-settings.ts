import { shapeBackgroundColor, shapeSelectedBackgroundColor } from '../components/canvas/shapes/shape-types';
import { taskTypeConfig } from '../config';

export interface IShapeSettings {
	strokeColor : string;
	fillColor: string;
	fillSelectedColor: string;
	textColor: string;
	cornerRadius : number;
}


export class ShapeSettings {
	static getShapeSettings(taskType : string) : IShapeSettings {
		let settings : IShapeSettings = {
			strokeColor: "#000000",
			fillColor: shapeBackgroundColor,
			fillSelectedColor: shapeSelectedBackgroundColor,
			textColor: '#000000',
			cornerRadius : 0
		};		
		if (taskTypeConfig[taskType]) {
			settings = {...settings, ...taskTypeConfig[taskType]};
		}
		return settings;
	}
}