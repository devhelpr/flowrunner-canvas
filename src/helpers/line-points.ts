import Victor from "victor";

export const calculateLineControlPoints = (xstart, ystart, xend, yend) => {
	//let diffAbsX = Math.abs(props.xstart - props.xend);
	let controlPointx1;
	let controlPointy1;
	let controlPointx2;
	let controlPointy2;
	let factor = 0.75;
	/*
	if (props.xstart < props.xend) {
		controlPointx1 = props.xstart+(factor*diffAbsX);
		controlPointy1 = props.ystart; 
		controlPointx2 = props.xend-(factor*diffAbsX);
		controlPointy2 = props.yend; 
	} else {
		controlPointx1 = props.xstart-(factor*diffAbsX);
		controlPointy1 = props.ystart; 
		controlPointx2 = props.xend+(factor*diffAbsX);
		controlPointy2 = props.yend; 
	}
	*/

	var vec1 = new Victor(xstart, ystart);
	var vec2 = new Victor(xend, yend);
	
	var distance = vec1.distance(vec2) * factor;
	let yadjust = 0;
	let xadjust = 0;
	if (xend < xstart && Math.abs(ystart - yend) < 32) {
		yadjust = Math.abs(xstart - xend) * 0.5;
		xadjust = 200;
	}
	/*if (this.props.shape.outputSnap == "bottom") {
		controlPointx1 = xStart;
		controlPointy1 = yStart+(distance); 
	} else*/ {
		controlPointx1 = xstart + (distance) + xadjust;
		controlPointy1 = ystart + yadjust; 
	}
	
	/*if (this.props.shape.inputSnap == "top") {
		controlPointx2 = xEnd;
		controlPointy2 = yEnd-(distance); 
	} else */ {
		controlPointx2 = xend - (distance) - xadjust;
		controlPointy2 = yend + yadjust; 
	}

	return {
		controlPointx1 : controlPointx1,
		controlPointy1 : controlPointy1,
		controlPointx2 : controlPointx2,
		controlPointy2 : controlPointy2
	}
}