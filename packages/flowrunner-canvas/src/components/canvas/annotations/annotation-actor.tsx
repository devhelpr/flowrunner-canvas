import * as React from 'react';
import { useImperativeHandle, useRef } from 'react';

import { Group, Text, Shape, Rect as KonvaRect, Image as KonvaImage, Line as KonvaLine } from 'react-konva';
import { ModifyShapeEnum, ShapeStateEnum } from '@devhelpr/flowrunner-canvas-core';
import useImage from 'use-image';

export interface IAnnotationActorProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  node: any;

  onClick: any;
  onTouchStart: any;
  onMouseStart: any;
  onMouseMove: any;
  onMouseEnd: any;
  onMouseLeave: any;

  onMouseOver: any;
  onMouseOut: any;

  onDragStart: any;
  onDragMove: any;
  onDragEnd: any;
}

export const AnnotationActor = React.forwardRef((props: IAnnotationActorProps, ref: any) => {
  let rect: any = useRef(null as any);
  let actor: any = useRef(null as any);
  const [image] = useImage(`${(window as any).globalPathImages || ''}/assets/svg/actor.svg`);
  const setRef = (ref) => {
    rect.current = ref;
  };

  const setActorRef = (ref) => {
    actor.current = ref;
  };

  useImperativeHandle(ref, () => ({
    getGroupRef: () => {
      return rect.current;
    },
    modifyShape: (action: ModifyShapeEnum, parameters: any) => {
      switch (+action) {
        case ModifyShapeEnum.GetShapeType: {
          return 'section';
          break;
        }
        case ModifyShapeEnum.GetXY: {
          if (rect && rect.current) {
            return {
              x: (rect.current as any).x(),
              y: (rect.current as any).y(),
            };
          }
          break;
        }
        case ModifyShapeEnum.SetXY: {
          if (rect && rect.current && parameters) {
            rect.current.x(parameters.x + 50);
            rect.current.y(parameters.y - 40);
          }

          if (actor && actor.current && parameters) {
            actor.current.x(parameters.x);
            actor.current.y(parameters.y);
          }
          break;
        }
        case ModifyShapeEnum.SetOpacity: {
          if (rect && rect.current && parameters) {
            rect.current.opacity(parameters.opacity);
          }
          break;
        }
        case ModifyShapeEnum.SetPoints: {
          break;
        }
        case ModifyShapeEnum.SetState: {
          if (rect && rect.current && parameters) {
            if (parameters.state == ShapeStateEnum.Selected) {
            } else if (parameters.state == ShapeStateEnum.Default) {
            }
          }

          break;
        }
        default:
          break;
      }
    },
  }));

  let strokeColor = '#000000';
  /*

<Text
        ref={(ref) => setRef(ref)}
        draggable={false}
        transformsEnabled={'position'}
        x={props.x}
        y={props.y}
        fontSize={props.node?.fontSize ?? 18}
        text={props.node?.label ?? props.name}
        hitStrokeWidth={0}
        listening={true}
        width={props.width}
        height={props.height}
        perfectDrawEnabled={false}
        onClick={props.onClick}
        onMouseOver={props.onMouseOver}
        onMouseOut={props.onMouseOut}
        onTouchStart={props.onTouchStart}
        onTouchEnd={props.onMouseEnd}
        onTouchMove={props.onMouseMove}
        onMouseDown={props.onMouseStart}
        onMouseMove={props.onMouseMove}
        onMouseEnd={props.onMouseEnd}
        onMouseLeave={props.onMouseLeave}
        onDragStart={props.onDragStart}
        onDragMove={props.onDragMove}
        onDragEnd={props.onDragEnd}
      ></Text>

	  */
  //ref={ref} (group)
  return (
    <>
      <Shape
        ref={(ref) => setRef(ref)}
        x={props.x + 50}
        y={props.y - 40}
        sceneFunc={(context, shape) => {
          context._context.textAlign = 'center';
          context._context.textBaseline = 'middle';
          context._context.fillStyle = '#000000';
          context._context.font = `${props.node.fontSize || '24'}px sans-serif`;
          context.fillText(props.node?.label ?? props.name, 0, 0);
          context._context.textAlign = 'left';
          context._context.textBaseline = 'alphabetic';
        }}
        fill="#FF0000"
      />
      <KonvaImage
        ref={(ref) => setActorRef(ref)}
        image={image}
        pathColor={'#000000'}
        width={props.width}
        height={props.height}
        keepRatio={true}
        listening={true}
        perfectDrawEnabled={false}
        transformsEnabled={'position'}
        x={props.x}
        y={props.y}
        onClick={props.onClick}
        onMouseOver={props.onMouseOver}
        onMouseOut={props.onMouseOut}
        onTouchStart={props.onTouchStart}
        onTouchEnd={props.onMouseEnd}
        onTouchMove={props.onMouseMove}
        onMouseDown={props.onMouseStart}
        onMouseMove={props.onMouseMove}
        onMouseEnd={props.onMouseEnd}
        onMouseLeave={props.onMouseLeave}
        onDragStart={props.onDragStart}
        onDragMove={props.onDragMove}
        onDragEnd={props.onDragEnd}
      />
    </>
  );
});
