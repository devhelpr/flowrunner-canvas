import * as React from 'react';
import { Stage, Layer, Circle, Line, Text, Label, Tag, Rect } from 'react-konva';

import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';

const heightCorrection = 42;
const widthCorrection = 0;
export interface XYCanvasProps {
  node: any;
  payloads: any[];
  selectedNode: any;
  flowrunnerConnector: IFlowrunnerConnector;
}

export interface XYCanvasState {}

/*
	this.props.flowrunnerConnector.getNodeExecutions()

	IF selectedNode
		search selectedNode in nodeExecutions : index
			foreach node < index and payload not FOUND
				foreach payload (from max to 0)
					if payload.debugId == node.debugId
						FOUND and show line on that payload

	

*/

interface IMinMax {
  min?: number;
  max?: number;
  minX?: number;
  maxX?: number;
  ratio: number;
  ratioX: number;
  correction: number;
  correctionX: number;
}

export class XYCanvas extends React.Component<XYCanvasProps, XYCanvasState> {
  override state = {};

  getCurrentDebugNotifier = () => {
    if (this.props.selectedNode && this.props.selectedNode.node) {
      let selectedNodePayload = this.props.selectedNode.payload;
      if (selectedNodePayload) {
        if (!selectedNodePayload.nodeExecutionId) {
          return null;
        }
        let nodeExecutions = this.props.flowrunnerConnector.getNodeExecutions();
        let executionIndex = -1;
        nodeExecutions.map((nodeExec, index) => {
          if (nodeExec && nodeExec.payload && nodeExec.payload.nodeExecutionId == selectedNodePayload.nodeExecutionId) {
            executionIndex = index;
          }
        });

        if (executionIndex >= 0) {
          let isFound = false;
          let resultPayloadIndex = -1;
          let loop = executionIndex;
          while (loop >= 0) {
            let index = loop;
            let nodeExec = nodeExecutions[loop];
            if (!isFound && index <= executionIndex) {
              this.props.payloads.map((payload, payloadIndex) => {
                if (!isFound && payload && nodeExec.payload && payload.debugId == nodeExec.payload.debugId) {
                  isFound = true;
                  // FOUND
                  resultPayloadIndex = payloadIndex;
                }
              });
            }
            loop--;
          }

          if (resultPayloadIndex >= 0) {
            let height = (this.props.node.height || 250) - heightCorrection;
            let width = this.props.node.width || 250;

            return (
              <Line
                points={[resultPayloadIndex, 0, resultPayloadIndex, height]}
                tension={0}
                closed
                stroke={'#3f51b5'}
                strokeWidth={2}
              />
            );
          }
        }
      }
    }
    return null;
  };

  getMinMax = (payloads: any[], series: any[], height: number, width: number, node) => {
    let result: IMinMax = {
      min: undefined,
      max: undefined,
      ratio: 1,
      ratioX: 1,
      correction: 0,
      correctionX: 0,
      minX: undefined,
      maxX: undefined,
    };
    payloads.map((payload, index) => {
      series.map((serie) => {
        if (payload[serie.yProperty] || serie.yProperty === 'value') {
          const yValue =
            payload[serie.yProperty] ||
            (payload[serie.yProperty] === 0 ? 0 : serie.yProperty === 'value' ? payload || 0 : 0);
          if (result.min === undefined || yValue < result.min) {
            result.min = yValue;
          }

          if (result.max === undefined || yValue > result.max) {
            result.max = yValue;
          }
        }

        if (payload[serie.xProperty] || serie.xProperty === 'value' || serie.xProperty === 'index') {
          const xValue =
            serie.xProperty === 'index'
              ? index
              : payload[serie.xProperty] ||
                (payload[serie.xProperty] === 0 ? 0 : serie.xProperty === 'value' ? payload || 0 : 0);
          if (result.minX === undefined || xValue < result.minX) {
            result.minX = xValue;
          }

          if (result.maxX === undefined || xValue > result.maxX) {
            result.maxX = xValue;
          }
        }
      });
    });

    if (node.minValue !== undefined) {
      result.min = result.min !== undefined && node.minValue > result.min ? result.min : node.minValue;
    }
    if (node.maxValue !== undefined) {
      result.max = result.max !== undefined && node.maxValue < result.max ? result.max : node.maxValue;
    }

    if (node.minValueX !== undefined) {
      result.minX = result.minX !== undefined && node.minValueX > result.minX ? result.minX : node.minValueX;
    }
    if (node.maxValueX !== undefined) {
      result.maxX = result.maxX !== undefined && node.maxValueX < result.maxX ? result.maxX : node.maxValueX;
    }

    if (result.min !== undefined && result.max !== undefined) {
      if (result.max - result.min != 0 && height != 0) {
        result.ratio = 1 / ((result.max - result.min) / (height - 2));
      }

      if (result.min < 0) {
        result.correction = -(result.min * result.ratio) + 1;
      } else {
        // ok
        result.correction = -(result.min * result.ratio) + 1;
      }
    }

    if (result.minX !== undefined && result.maxX !== undefined) {
      if (result.maxX - result.minX != 0 && width != 0) {
        result.ratioX = 1 / ((result.maxX - result.minX) / (width - 2));
      }

      if (result.minX < 0) {
        result.correctionX = -(result.minX * result.ratioX) + 1;
      } else {
        // ok
        result.correctionX = -(result.minX * result.ratioX) + 1;
      }
    }
    return result;
  };

  getLineChart = (
    node: any,
    xProperty,
    yProperty,
    payload: any,
    index: number,
    payloads: any[],
    color: string,
    serieIndex: number,
    title: string,
    fill: string,
    minmax: IMinMax,
  ) => {
    let circle: any = null;
    const width = this.props.node.width || 250;
    const height = (this.props.node.height || 250) - heightCorrection;

    let xPosition = index;
    //if (payloads.length < 250) {
    //  xPosition = index + (250 - payloads.length);
    // }
    const xCorrection = 8;
    const yCorrection = 8;
    const yCorrectionHeight = 16;

    if (
      ((xProperty == 'index' || !isNaN(payload[xProperty] || !isNaN(payload as unknown as any))) &&
        !isNaN(payload[yProperty])) ||
      !isNaN(payload as unknown as any)
    ) {
      const xValue =
        xProperty === 'index'
          ? index
          : payload[xProperty] || (payload[xProperty] === 0 ? 0 : xProperty === 'value' ? payload || 0 : 0);
      const yValue = payload[yProperty] || (payload[yProperty] === 0 ? 0 : yProperty === 'value' ? payload || 0 : 0);
      let x = 0;
      if (xProperty == 'index') {
        x = xCorrection + xPosition * minmax.ratioX; //- xCorrection * minmax.ratio;
      } else {
        x = xValue;
        x += width / 2 - xCorrection - (minmax.maxX ?? 0) / 2;
      }

      let y = yCorrection + (height - yCorrectionHeight - (yValue * minmax.ratio + minmax.correction));

      let xNext = 0;
      let yNext = 0;
      if (!!node.includeLines && index < payloads.length - 1) {
        if (xProperty == 'index') {
          xNext = xPosition + 1;
        } else {
          xNext = payloads[index + 1][xProperty];
        }
        yNext =
          yCorrection +
          (height - yCorrectionHeight - (payloads[index + 1][yProperty] * minmax.ratio + minmax.correction));
      }
      circle = (
        <React.Fragment key={'xycanvas-wrapper-' + index + '-' + serieIndex}>
          {!node.includeLines && (
            <Circle
              key={'xycanvas-' + index + '-' + serieIndex}
              x={x}
              y={y}
              radius={4}
              stroke={color}
              strokeWidth={2}
              width={4}
              height={4}
              fill={color}
              perfectDrawEnabled={true}
            ></Circle>
          )}
          {fill !== '' && !!node.includeLines && index < payloads.length - 1 && (
            <Line
              points={[x, y, xNext, yNext, xNext, height, x, height]}
              tension={0}
              closed
              strokeWidth={1}
              fill={fill}
            />
          )}
          {!!node.includeLines && index < payloads.length - 1 && (
            <Line points={[x, y, xNext, yNext]} tension={0} closed stroke={color} strokeWidth={1} />
          )}
          <Label x={4} y={serieIndex * 24}>
            <Text
              text={title}
              fontSize={18}
              align="left"
              height={24}
              verticalAlign="middle"
              listening={false}
              wrap="none"
              ellipsis={true}
              fill={color}
              perfectDrawEnabled={true}
            ></Text>
          </Label>
        </React.Fragment>
      );
    }
    return circle;
  };

  getCurved = (node: any, xProperty, yProperty, payloads: any[], minmax: IMinMax) => {
    let height = (this.props.node.height || 250) - heightCorrection;
    let points: number[] = [];
    payloads.map((payload, index) => {
      if (index % (node.sample || 10) == 0) {
        if ((xProperty == 'index' || !isNaN(payload[xProperty])) && !isNaN(payload[yProperty])) {
          let xPosition = index;
          if (payloads.length < 250) {
            xPosition = index + (250 - payloads.length);
          }

          let x = 0;
          if (xProperty == 'index') {
            x = xPosition;
          } else {
            x = payload[xProperty];
          }
          let y = 2 + (height - 2 - (payload[yProperty] * minmax.ratio + minmax.correction));
          points.push(x);
          points.push(y);
        }
      }
    });
    // tension={node.tension || 1}
    return <Line points={points} stroke={'#000000'} bezier={true} strokeWidth={1}></Line>;
  };

  override render() {
    const height = (this.props.node.height || 250) - heightCorrection;
    const width = (this.props.node.width || 250) - widthCorrection;
    let circles: any = null;
    let { node, payloads } = this.props;

    if (node.listProperty) {
      if (payloads[payloads.length - 1]) {
        payloads = payloads[payloads.length - 1][node.listProperty];
      } else {
        return <>no payload</>;
      }
      if (!payloads) {
        return <>no list found</>;
      }
    }

    let minmax = this.getMinMax(
      payloads,
      node.series ? node.series : [{ xProperty: node.xProperty, yProperty: node.yProperty }],
      height - 16,
      width - 16,
      this.props.node,
    );
    if (!!node.showCurved) {
      circles = this.getCurved(node, node.xProperty, node.yProperty, payloads, minmax);
    } else {
      circles = payloads.map((payload, index) => {
        let circle: any = null;
        if (node.series) {
          circle = node.series.map((serie, serieIndex) => {
            if (serie.xProperty && serie.yProperty && serie.color) {
              return this.getLineChart(
                node,
                serie.xProperty,
                serie.yProperty,
                payload,
                index,
                payloads,
                serie.color,
                serieIndex,
                serie.title || '',
                serie.fill || '',
                minmax,
              );
            }
            return null;
          });
        } else if (node.xProperty && node.yProperty) {
          circle = this.getLineChart(
            node,
            node.xProperty,
            node.yProperty,
            payload,
            index,
            payloads,
            node.color || '#000000',
            0,
            node.lineTitle || '',
            node.fill || '',
            minmax,
          );
        }
        return circle;
      });
    }
    const yAdd = 6;
    return (
      <>
        <Stage pixelRatio={1} width={(this.props.node.width || 250) + 1} height={height}>
          <Layer>
            {circles}
            {this.getCurrentDebugNotifier()}
          </Layer>
        </Stage>
        <div className="xy-canvas__legend">
          <div className="xy-canvas__text">min: {(minmax.min || 0).toFixed(2)}</div>
          <div className="xy-canvas__text">max: {(minmax.max || 0).toFixed(2)}</div>
        </div>
      </>
    );
  }
}
