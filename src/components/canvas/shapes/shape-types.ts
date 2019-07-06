import { number } from "prop-types";

export interface ShapeTypeProps {
	x: number,
	y: number,
	name: string,
	onDragMove : any,
	onDragEnd : any
}

export interface LineTypeProps {
	xstart: number,
	ystart: number,
	xend: number,
	yend: number
}