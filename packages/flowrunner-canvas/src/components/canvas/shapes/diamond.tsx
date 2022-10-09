import * as React from 'react';
import { useImperativeHandle, useRef, useMemo } from 'react';

import {
  Group,
  Text,
  Shape as KonvaShape,
  RegularPolygon,
  Image as KonvaImage,
  Arrow as KonvaArrow,
  Circle as KonvaCircle,
} from 'react-konva';

import { ShapeTypeProps, ModifyShapeEnum, ShapeStateEnum } from '@devhelpr/flowrunner-canvas-core';
import { ShapeMeasures } from '@devhelpr/flowrunner-canvas-core';
import { ShapeSettings } from '@devhelpr/flowrunner-canvas-core';
import { replaceValuesExpressions, hasReplacebleValuesExistingInPayload } from '@devhelpr/flowrunner-canvas-core';
import { Lines } from './line-helper';

import useImage from 'use-image';

export const Diamond = React.forwardRef((props: ShapeTypeProps, ref: any) => {
  const [image] = useImage(`${(window as any).globalPathImages || ''}/assets/svg/cog.svg`);
  const groupRef = useRef(null as any);
  const regularPolygonRef = useRef(null as any);
  const shapeRef = useRef(null as any);
  const settings = useMemo(
    () => ShapeSettings.getShapeSettings(props.taskType, props.node),
    [props.taskType, props.node],
  );

  useImperativeHandle(ref, () => ({
    getGroupRef: () => {
      return groupRef.current;
    },
    modifyShape: (action: ModifyShapeEnum, parameters: any) => {
      switch (+action) {
        case ModifyShapeEnum.GetShapeType: {
          return 'diamond';
          break;
        }
        case ModifyShapeEnum.GetXY: {
          if (groupRef && groupRef.current) {
            return {
              x: (groupRef.current as any).x(),
              y: (groupRef.current as any).y(),
            };
          }
          break;
        }
        case ModifyShapeEnum.SetXY: {
          if (groupRef && groupRef.current && parameters) {
            groupRef.current.x(parameters.x);
            groupRef.current.y(parameters.y);
          }
          break;
        }
        case ModifyShapeEnum.SetOpacity: {
          if (groupRef && groupRef.current && parameters) {
            groupRef.current.opacity(parameters.opacity);
            if (settings.subShapeType === 'Loop') {
            } else {
              regularPolygonRef.current.to({
                duration: 0.05,
                opacity: parameters.opacity,
              });
            }
          }
          break;
        }
        case ModifyShapeEnum.SetPoints: {
          break;
        }
        case ModifyShapeEnum.SetState: {
          if (settings.subShapeType === 'Loop') {
          } else {
            if (regularPolygonRef && regularPolygonRef.current && parameters) {
              if (parameters.state == ShapeStateEnum.Selected) {
                regularPolygonRef.current.to({
                  duration: 0.15,
                  stroke: settings.strokeColor,
                  fill: settings.fillSelectedColor,
                });
              } else if (parameters.state == ShapeStateEnum.Default) {
                //regularPolygonRef.current.stroke(settings.strokeColor);
                //regularPolygonRef.current.fill(settings.fillColor);
                regularPolygonRef.current.to({
                  duration: 0.15,
                  stroke: settings.strokeColor,
                  fill: settings.fillColor,
                });
              } else if (parameters.state == ShapeStateEnum.Error) {
                //regularPolygonRef.current.stroke("#f00000");
                //regularPolygonRef.current.fill("#ff9d9d");
                regularPolygonRef.current.to({
                  duration: 0.15,
                  stroke: '#f00000',
                  fill: '#ff9d9d',
                });
              } else if (parameters.state == ShapeStateEnum.Ok) {
                //regularPolygonRef.current.stroke("#00e000");
                //regularPolygonRef.current.fill("#9dff9d");
                regularPolygonRef.current.to({
                  duration: 0.15,
                  stroke: '#00e000',
                  fill: '#9dff9d',
                });
              }
            }
          }
          break;
        }
        default:
          break;
      }
    },
  }));

  let labelText = props.node && props.node.label ? props.node.label : props.name;
  if ((settings as any).label && hasReplacebleValuesExistingInPayload((settings as any).label, props.node)) {
    labelText = replaceValuesExpressions((settings as any).label, props.node, '-');
  } else if (!!props.hasTaskNameAsNodeTitle) {
    labelText = props.node.taskType;
  }

  let textDecoration = '';

  let strokeColor = settings.strokeColor;
  let fillColor = props.isSelected ? settings.fillSelectedColor : settings.fillColor;
  if (props.nodeState === 'error') {
    strokeColor = props.isSelected ? '#f00000' : '#e00000';
    fillColor = props.isSelected ? '#ff5454' : '#ff9d9d';
    //textDecoration = "line-through"
  } else if (props.nodeState === 'ok') {
    strokeColor = props.isSelected ? '#00f000' : '#00e000';
    fillColor = props.isSelected ? '#54ff54' : '#9dff9d';
  }

  return (
    <>
      <Group
        x={props.x}
        y={props.y}
        ref={groupRef}
        onDragMove={props.onDragMove}
        onDragEnd={props.onDragEnd}
        draggable={false}
        transformsEnabled={'position'}
        onClick={props.onClickShape}
        onMouseOver={props.onMouseOver}
        onMouseOut={props.onMouseOut}
        onTouchStart={props.onTouchStart}
        onTouchMove={props.onTouchMove}
        onTouchEnd={props.onTouchEnd}
        onMouseDown={props.onMouseStart}
        onMouseMove={props.onMouseMove}
        onMouseUp={props.onMouseEnd}
        onMouseLeave={props.onMouseLeave}
        opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 1 : 1}
      >
        <>
          {settings.subShapeType === 'Loop' ? (
            <>
              <KonvaCircle
                x={ShapeMeasures.diamondSize / 2}
                y={ShapeMeasures.diamondSize / 2}
                radius={ShapeMeasures.diamondSize}
                strokeWidth={0}
                opacity={1}
                width={ShapeMeasures.diamondSize}
                height={ShapeMeasures.diamondSize}
                fill={props.isSelected ? settings.fillSelectedColor : settings.fillColor}
                transformsEnabled={'position'}
                perfectDrawEnabled={false}
              ></KonvaCircle>
              <KonvaShape
                x={ShapeMeasures.diamondSize / 2}
                y={ShapeMeasures.diamondSize / 2}
                width={ShapeMeasures.diamondSize}
                height={ShapeMeasures.diamondSize}
                stroke={strokeColor}
                strokeWidth={4}
                ref={shapeRef}
                transformsEnabled={'position'}
                sceneFunc={(context, shape) => {
                  context.beginPath();
                  (context as any).lineWidth = 3;
                  context.arc(0, 0, ShapeMeasures.diamondSize / 2, 1.5 * Math.PI, 0.95 * Math.PI, false);
                  context.stroke();
                }}
              ></KonvaShape>
              <KonvaArrow
                x={0.25}
                y={12 + ShapeMeasures.diamondSize / 2}
                points={[0.5, 0, 0, -4]}
                stroke={'#000000'}
                strokeWidth={1}
                pointerLength={10}
                pointerWidth={10}
                lineCap="round"
                lineJoin="round"
                opacity={1}
                transformsEnabled={'position'}
                fill={'#000000'}
                perfectDrawEnabled={false}
                hitStrokeWidth={0}
                noMouseEvents={true}
                shadowForStrokeEnabled={false}
              ></KonvaArrow>
            </>
          ) : (
            <RegularPolygon
              x={ShapeMeasures.diamondSize / 2}
              y={ShapeMeasures.diamondSize / 2}
              stroke={strokeColor}
              strokeWidth={4}
              cornerRadius={4}
              sides={4}
              transformsEnabled={'position'}
              ref={regularPolygonRef}
              radius={ShapeMeasures.diamondSize}
              width={ShapeMeasures.diamondSize}
              height={ShapeMeasures.diamondSize}
              fill={fillColor}
              perfectDrawEnabled={false}
            ></RegularPolygon>
          )}
        </>
        <Text
          x={10}
          y={0}
          text={labelText}
          align="center"
          width={ShapeMeasures.diamondSize - 20}
          height={ShapeMeasures.diamondSize}
          verticalAlign="middle"
          listening={false}
          wrap="word"
          transformsEnabled={'position'}
          textDecoration={textDecoration}
          fontSize={18}
          ellipsis={true}
          fill={settings.textColor}
          perfectDrawEnabled={false}
        ></Text>
        {!!settings.hasConfigMenu && (
          <KonvaImage
            image={image}
            pathColor={settings.textColor}
            width={Math.round(ShapeMeasures.diamondSize / 8)}
            height={Math.round(ShapeMeasures.diamondSize / 8)}
            keepRatio={true}
            x={Math.round(ShapeMeasures.diamondSize / 2 - ShapeMeasures.diamondSize / 16)}
            y={16}
            perfectDrawEnabled={false}
            transformsEnabled={'position'}
            onClick={props.onClickSetup}
          />
        )}
      </Group>
    </>
  );
});
