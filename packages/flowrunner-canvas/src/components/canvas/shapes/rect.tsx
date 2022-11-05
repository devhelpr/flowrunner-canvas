import * as React from 'react';
import { useState, useEffect, RefObject, useImperativeHandle, useRef, useMemo } from 'react';

import useImage from 'use-image';
import { Group, Text, Rect as KonvaRect, Image as KonvaImage, Line as KonvaLine } from 'react-konva';
import { ShapeTypeProps, ModifyShapeEnum, ShapeStateEnum } from '@devhelpr/flowrunner-canvas-core';
import { ShapeMeasures } from '@devhelpr/flowrunner-canvas-core';
import { ShapeSettings } from '@devhelpr/flowrunner-canvas-core';
import { Lines } from './line-helper';

const getStrokeColor = (backgroundColorString, settings) => {
  switch (backgroundColorString) {
    case 'background-yellow': {
      return '#f0e938';
    }
    case 'background-orange': {
      return '#f8a523';
    }
    case 'background-blue': {
      return '#36a4f9';
    }
    case 'background-green': {
      return '#3bee76';
    }
    case 'background-purple': {
      return '#cc8aee';
    }
    default: {
      return settings.strokeColor;
    }
  }
};

const getFillColor = (backgroundColorString, settings) => {
  switch (backgroundColorString) {
    case 'background-yellow': {
      return '#fbf791';
    }
    case 'background-orange': {
      return '#f4c67d';
    }
    case 'background-blue': {
      return '#86c6f8';
    }
    case 'background-green': {
      return '#7df4a4';
    }
    case 'background-purple': {
      return '#e2bcf5';
    }
    default: {
      return settings.fillColor;
    }
  }
};

export const Rect = React.forwardRef((props: ShapeTypeProps, ref: any) => {
  const settings = useMemo(
    () => ShapeSettings.getShapeSettings(props.taskType, props.node),
    [props.taskType, props.node],
  );

  const [image] = useImage(`${(window as any).globalPathImages || ''}/assets/svg/layout.svg`);
  const [cogImage] = useImage(`${(window as any).globalPathImages || ''}/assets/svg/cog.svg`);
  const groupRef = useRef(null as any);

  let rect: any = useRef(null as any);
  let textRef: any = undefined;
  let skewX = 0;
  let skewXOffset = 0;
  let includeSvgIcon = false;

  if (settings.isSkewed) {
    skewX = -0.5;
    skewXOffset = ShapeMeasures.rectWidht / 8;
  }

  if (props.node && props.node.objectSchema) {
    if (props.node.objectSchema == 'layout') {
      includeSvgIcon = true;
    }
  }

  useEffect(() => {
    if (rect && rect.current) {
      rect.current.skew({
        x: skewX,
        y: 0,
      });
      //rect.current.cache();
    }

    if (textRef) {
      textRef.cache();
    }
  });

  const setRef = (ref) => {
    rect.current = ref;
    if (rect.current) {
      rect.current.skew({
        x: skewX,
        y: 0,
      });
    }
  };

  const setTextRef = (ref) => {
    textRef = ref;
  };

  useImperativeHandle(ref, () => ({
    getGroupRef: () => {
      return groupRef.current;
    },
    modifyShape: (action: ModifyShapeEnum, parameters: any) => {
      switch (+action) {
        case ModifyShapeEnum.GetShapeType: {
          return 'rect';
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
          }
          break;
        }
        case ModifyShapeEnum.SetPoints: {
          break;
        }
        case ModifyShapeEnum.SetState: {
          if (rect && rect.current && parameters) {
            if (parameters.state == ShapeStateEnum.Selected) {
              rect.current.to({
                duration: 0.15,
                stroke: settings.strokeColor,
                fill: settings.fillSelectedColor,
              });
            } else if (parameters.state == ShapeStateEnum.Default) {
              let strokeColor = settings.strokeColor;
              let fillColor = settings.fillColor;

              if (settings.background) {
                strokeColor = getStrokeColor(settings.background, settings);
                fillColor = getFillColor(settings.background, settings);
              }
              rect.current.to({
                duration: 0.15,
                stroke: strokeColor,
                fill: fillColor,
              });
            }
          }

          break;
        }
        default:
          break;
      }
    },
  }));

  let strokeColor = settings.strokeColor;
  let fillColor = props.isSelected ? settings.fillSelectedColor : settings.fillColor;
  if (!props.isSelected && settings.background) {
    strokeColor = getStrokeColor(settings.background, settings);
    fillColor = getFillColor(settings.background, settings);
  }

  //ref={ref} (group)
  return (
    <>
      <Group
        ref={groupRef}
        x={props.x}
        y={props.y}
        transformsEnabled={settings.isSkewed ? 'all' : 'position'}
        draggable={false}
        order={0}
        onTouchStart={props.onTouchStart}
        onTouchMove={props.onTouchMove}
        onTouchEnd={props.onTouchEnd}
        onDragStart={props.onDragStart}
        onDragMove={props.onDragMove}
        onDragEnd={props.onDragEnd}
        onMouseOver={props.onMouseOver}
        onMouseOut={props.onMouseOut}
        onMouseDown={props.onMouseStart}
        onMouseMove={props.onMouseMove}
        onMouseUp={props.onMouseEnd}
        onMouseLeave={props.onMouseLeave}
        onClick={props.onClickShape}
        listening={true}
        opacity={props.canvasHasSelectedNode && !props.isSelected && !props.isConnectedToSelectedNode ? 1 : 1}
      >
        <KonvaRect
          ref={(ref) => setRef(ref)}
          x={skewXOffset}
          y={0}
          stroke={strokeColor}
          hitStrokeWidth={0}
          strokeWidth={4}
          listening={true}
          cornerRadius={settings.cornerRadius}
          transformsEnabled={settings.isSkewed ? 'all' : 'position'}
          width={ShapeMeasures.rectWidht}
          height={ShapeMeasures.rectHeight}
          fill={fillColor}
          perfectDrawEnabled={false}
        ></KonvaRect>
        {settings.subShapeType && settings.subShapeType == 'Model' && (
          <KonvaLine
            points={[skewXOffset, 10, skewXOffset + ShapeMeasures.rectWidht, 10]}
            stroke={settings.strokeColor}
            transformsEnabled={'position'}
            listening={false}
            perfectDrawEnabled={false}
            strokeWidth={4}
          ></KonvaLine>
        )}
        {includeSvgIcon && (
          <KonvaImage
            image={image}
            pathColor={settings.textColor}
            width={Math.round(ShapeMeasures.rectWidht / 4)}
            height={Math.round(ShapeMeasures.rectWidht / 4)}
            keepRatio={true}
            listening={false}
            perfectDrawEnabled={false}
            transformsEnabled={'position'}
            x={Math.round(ShapeMeasures.rectWidht / 2 - ShapeMeasures.rectWidht / 8)}
            y={8}
          />
        )}
        <Text
          ref={(ref) => setTextRef(ref)}
          x={0}
          y={includeSvgIcon ? Math.round(ShapeMeasures.rectWidht / 8) : 0}
          text={
            props.node.label
              ? props.node.label
              : !!props.hasTaskNameAsNodeTitle
              ? props.node.taskType
              : props.node && props.node.label
              ? props.node.label
              : props.name
          }
          align="center"
          fontSize={18}
          transformsEnabled={'position'}
          width={ShapeMeasures.rectWidht}
          height={ShapeMeasures.rectHeight}
          verticalAlign="middle"
          listening={false}
          wrap="none"
          ellipsis={true}
          fill={settings.textColor}
          perfectDrawEnabled={false}
        ></Text>
        {!!settings.hasConfigMenu && (
          <KonvaImage
            image={cogImage}
            pathColor={settings.textColor}
            transformsEnabled={'position'}
            listening={true}
            perfectDrawEnabled={false}
            width={Math.round(ShapeMeasures.rectWidht / 8)}
            height={Math.round(ShapeMeasures.rectWidht / 8)}
            keepRatio={true}
            x={Math.round(ShapeMeasures.rectWidht - ShapeMeasures.rectWidht / 8 - 4)}
            y={4}
            onClick={props.onClickSetup}
            dataElementType="Settings"
          />
        )}
      </Group>
    </>
  );
});

/*

{settings.events && settings.events.map((event ,index) => {
				return <React.Fragment key={index}>
					<KonvaRect
						x={ShapeMeasures.rectWidht + 10 - 14}
						y={(index + 1) * 12 + 8}
						strokeWidth={2}
						stroke="#a000a0"
						cornerRadius={settings.cornerRadius}
						width={8}
						height={8}
						fill="#a000a0"
						title={event.eventName}
						opacity={1}  
						perfectDrawEnabled={false}></KonvaRect>	
					<KonvaRect
						x={ShapeMeasures.rectWidht + 10 - 2 - 14}
						y={(index + 1) * 12 - 2 + 8}
						strokeWidth={2}
						stroke="#e2e2e2"
						cornerRadius={settings.cornerRadius}
						width={12}
						height={12}					
						title={event.eventName}
						opacity={1}  
						perfectDrawEnabled={false}></KonvaRect>					
				</React.Fragment>
			})}	
			
<Group
		x={props.x}
		y={props.y}
		onMouseOver={props.onMouseConnectionEndOver}
			onMouseOut={props.onMouseConnectionEndOut}
			onMouseDown={props.onMouseConnectionEndStart}
			onMouseMove={props.onMouseConnectionEndMove}
			onMouseUp={props.onMouseConnectionEndEnd}
	>
		<KonvaRect
			x={-4}
			y={8}
			strokeWidth={2}
			stroke="#808080"
			cornerRadius={settings.cornerRadius}
			width={8}
			height={8}
			fill="#808080"
			opacity={1}  
			perfectDrawEnabled={false}
			name={"connectiontionend"}
			listening={true}
			
			></KonvaRect>	
		<KonvaRect
			x={-2 -4}
			y={- 2 + 8}
			strokeWidth={2}
			stroke="#e2e2e2"
			cornerRadius={settings.cornerRadius}
			width={12}
			height={12}					
			opacity={1}  
			perfectDrawEnabled={false}></KonvaRect>	

	</Group>
	<Group
		x={props.x}
		y={props.y}
		onMouseOver={props.onMouseConnectionStartOver}
		onMouseOut={props.onMouseConnectionStartOut}
		onMouseDown={props.onMouseConnectionStartStart}
		onMouseMove={props.onMouseConnectionStartMove}
		onMouseUp={props.onMouseConnectionStartEnd}
	>			
		<KonvaRect
			x={ShapeMeasures.rectWidht + 10 - 14}
			y={8}
			strokeWidth={2}
			stroke="#808080"
			cornerRadius={settings.cornerRadius}
			width={8}
			height={8}
			fill="#808080"
			opacity={1}
			order={1}  
			perfectDrawEnabled={false}
			listening={true}
			name={"connectiontionstart"}
			
			></KonvaRect>	
		<KonvaRect
			x={ShapeMeasures.rectWidht + 10 - 2 - 14}
			y={- 2 + 8}
			strokeWidth={2}
			stroke="#e2e2e2"
			cornerRadius={settings.cornerRadius}
			width={12}
			height={12}					
			opacity={1}  
			perfectDrawEnabled={false}></KonvaRect>	
	</Group>*/
