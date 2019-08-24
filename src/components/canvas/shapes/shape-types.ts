export interface ShapeTypeProps {
	x: number,
	y: number,
	name: string,
	onDragMove : any,
	onDragEnd : any,
	onClickShape : any,
	isSelected: boolean
}

export interface LineTypeProps {
	xstart: number,
	ystart: number,
	xend: number,
	yend: number
}

export const shapeBackgroundColor : string = "#f2f2f2";
export const shapeSelectedBackgroundColor : string = "#a2a2a2";