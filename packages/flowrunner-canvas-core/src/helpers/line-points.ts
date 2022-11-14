import Victor from 'victor';
import { ThumbPositionRelativeToNode } from '../interfaces/shape-types';

export const calculateLineControlPoints = (
  xstart,
  ystart,
  xend,
  yend,
  startPositionRelativeToNode?: ThumbPositionRelativeToNode,
  endPositionRelativeToNode?: ThumbPositionRelativeToNode,
  lineNode?: any,
) => {
  let controlPointx1;
  let controlPointy1;
  let controlPointx2;
  let controlPointy2;

  let useNodeArc = lineNode && lineNode.curveMode === 'arc';
  let useStraightLine = lineNode && lineNode.curveMode === 'straight';

  // TODO : make a way to tweak these on a line-basis together with bezier/tension
  let factor = 0.35; //0.25;//0.75; // 0.75 is for the bezier-curves .. 0.5 is for straigt lines with tension 0.05
  if (useNodeArc) {
    factor = 0.5;
  }
  if (useStraightLine) {
    factor = 0;
  }

  let vec1 = new Victor(xstart, ystart);
  var vec2 = new Victor(xend, yend);

  let distance = vec1.distance(vec2) * factor;
  let yadjust = 0;
  let xadjust = 0;
  if (xend < xstart) {
    // && Math.abs(ystart - yend) < 32
    yadjust = Math.abs(xstart - xend) * 0.5;
    xadjust = 500;
    distance = vec1.distance(vec2) * 0;
  }

  if (useStraightLine) {
    yadjust = ystart + (yend - ystart) * 0.5;
    xadjust = xstart + (xend - xstart) * 0.5;

    controlPointx1 = xadjust;
    controlPointy1 = yadjust;
    controlPointx2 = xadjust;
    controlPointy2 = yadjust;
  } else if (useNodeArc) {
    yadjust = ystart + (yend - ystart) * 0.33;
    xadjust = xstart + (xend - xstart) * 0.33;

    let yadjust2 = ystart + (yend - ystart) * 0.66;
    let xadjust2 = xstart + (xend - xstart) * 0.66;
    distance = 0;

    const lengthVector = Math.sqrt((ystart - yend) * (ystart - yend) + (xstart - xend) * (xstart - xend));
    const normX = (xstart - xend) / lengthVector;
    const normY = (ystart - yend) / lengthVector;

    controlPointx1 = xadjust - normY * (lengthVector * 0.25);
    controlPointy1 = yadjust + normX * (lengthVector * 0.25);
    controlPointx2 = xadjust2 - normY * (lengthVector * 0.25);
    controlPointy2 = yadjust2 + normX * (lengthVector * 0.25);
  } else {
    if (startPositionRelativeToNode == ThumbPositionRelativeToNode.left) {
      controlPointx1 = xstart - distance - xadjust;
      controlPointy1 = ystart + yadjust;
    } else if (startPositionRelativeToNode == ThumbPositionRelativeToNode.top) {
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
  }

  return {
    controlPointx1: controlPointx1,
    controlPointy1: controlPointy1,
    controlPointx2: controlPointx2,
    controlPointy2: controlPointy2,
  };
};
