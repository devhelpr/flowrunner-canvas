import { number } from "prop-types";

export interface ShapeTypeProps {
	x: number,
	y: number,
	name: string
}

export interface LineTypeProps {
	xstart: number,
	ystart: number,
	xend: number,
	yend: number
}