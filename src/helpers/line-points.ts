import Victor from 'victor';
import { ThumbPositionRelativeToNode } from '../components/canvas/shapes/shape-types';

export const calculateLineControlPoints = (
  xstart,
  ystart,
  xend,
  yend,
  startPositionRelativeToNode?: ThumbPositionRelativeToNode,
  endPositionRelativeToNode?: ThumbPositionRelativeToNode,
) => {
  let controlPointx1;
  let controlPointy1;
  let controlPointx2;
  let controlPointy2;

  // TODO : make a way to tweak these on a line-basis together with bezier/tension
  let factor = 0.35; //0.25;//0.75; // 0.75 is for the bezier-curves .. 0.5 is for straigt lines with tension 0.05

  var vec1 = new Victor(xstart, ystart);
  var vec2 = new Victor(xend, yend);

  var distance = vec1.distance(vec2) * factor;
  let yadjust = 0;
  let xadjust = 0;
  if (xend < xstart && Math.abs(ystart - yend) < 32) {
    yadjust = Math.abs(xstart - xend) * 0.5;
    xadjust = 200;
  }

  if (startPositionRelativeToNode == ThumbPositionRelativeToNode.top) {
    controlPointx1 = xstart;
    controlPointy1 = ystart - distance;
  } else if (startPositionRelativeToNode == ThumbPositionRelativeToNode.bottom) {
    controlPointx1 = xstart;
    controlPointy1 = ystart + distance;
  } else {
    controlPointx1 = xstart + distance + xadjust;
    controlPointy1 = ystart + yadjust;
  }

  /*if (this.props.shape.inputSnap == "top") {
		controlPointx2 = xEnd;
		controlPointy2 = yEnd-(distance); 
	} else */

  if (endPositionRelativeToNode == ThumbPositionRelativeToNode.top) {
    controlPointx2 = xend;
    controlPointy2 = yend - distance;
  } else {
    controlPointx2 = xend - distance - xadjust;
    controlPointy2 = yend + yadjust;
  }

  return {
    controlPointx1: controlPointx1,
    controlPointy1: controlPointy1,
    controlPointx2: controlPointx2,
    controlPointy2: controlPointy2,
  };
};
