import * as React from 'react';
import { Suspense } from 'react';
import { useEffect, useState, useRef, useCallback, Children, isValidElement, cloneElement } from 'react';
import { IFlowrunnerConnector } from '../interfaces/IFlowrunnerConnector';
import { Number } from './visualizers/number';
import { Color } from './visualizers/color';
import { Text } from './visualizers/text';
import { List } from './visualizers/list';
import { useSelectedNodeStore } from '../state/selected-node-state';

import { createExpressionTree, executeExpressionTree, ExpressionNode } from '@devhelpr/expressionrunner';

const XYCanvas = React.lazy(() => import('./visualizers/xy-canvas').then(({ XYCanvas }) => ({ default: XYCanvas })));
const AnimatedGridCanvas = React.lazy(() =>
  import('./visualizers/animated-grid-canvas').then(({ AnimatedGridCanvas }) => ({ default: AnimatedGridCanvas })),
);
const GridCanvas = React.lazy(() =>
  import('./visualizers/grid-canvas').then(({ GridCanvas }) => ({ default: GridCanvas })),
);

const RichText = React.lazy(() => import('./visualizers/richtext').then(({ RichText }) => ({ default: RichText })));

import * as uuid from 'uuid';
import { StaticText } from './visualizers/static-text';
import { AsciiArt } from './visualizers/ascii-art';
const uuidV4 = uuid.v4;

export interface DebugNodeHtmlPluginProps {
  flowrunnerConnector: IFlowrunnerConnector;
  node: any;
  flow: any;
  children?: any;
}

export interface DebugNodeHtmlPluginState {
  receivedPayload: any[];
  expressionTree: any;
}

export const DebugNodeHtmlPlugin = (props: DebugNodeHtmlPluginProps) => {
  const [receivedPayload, setReceivedPayload] = useState([] as any[]);
  const [expressionTree, setExpressionTree] = useState(undefined as any);

  const selectedNode = useSelectedNodeStore();
  const observableId = useRef(uuidV4());
  const unmounted = useRef(false);

  const timer = useRef(undefined as any);
  const lastTime = useRef(undefined as any);
  const receivedPayloads = useRef([] as any[]);
  const lastReceivedPayload = useRef<any>(undefined);

  useEffect(() => {
    unmounted.current = false;
    props.flowrunnerConnector.registerFlowNodeObserver(props.node.name, observableId.current, receivePayloadFromNode);
    if (props.node.visibilityCondition && props.node.visibilityCondition !== '') {
      setExpressionTree(createExpressionTree(props.node.visibilityCondition));
    }
    return () => {
      props.flowrunnerConnector.unregisterFlowNodeObserver(props.node.name, observableId.current);
      unmounted.current = true;

      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = undefined;
      }
    };
  }, []);

  useEffect(() => {
    if (props.node.visibilityCondition && props.node.visibilityCondition && props.node.visibilityCondition !== '') {
      setExpressionTree(createExpressionTree(props.node.visibilityCondition));
    }

    props.flowrunnerConnector.registerFlowNodeObserver(props.node.name, observableId.current, receivePayloadFromNode);

    return () => {
      props.flowrunnerConnector.unregisterFlowNodeObserver(props.node.name, observableId.current);
    };
  }, [props.node]);

  useEffect(() => {
    props.flowrunnerConnector.registerFlowNodeObserver(props.node.name, observableId.current, receivePayloadFromNode);
    return () => {
      props.flowrunnerConnector.unregisterFlowNodeObserver(props.node.name, observableId.current);
    };
  }, [props.flow]);

  const receivePayloadFromNode = useCallback(
    (payload: any) => {
      if (unmounted.current) {
        return;
      }

      if (!!payload.isDebugCommand) {
        if (payload.debugCommand === 'resetPayloads') {
          if (receivedPayloads.current.length > 0) {
            receivedPayloads.current = [];
            setReceivedPayload([]);
          }
        }
        return;
      }

      let newReceivedPayloads: any[] = [...receivedPayloads.current];
      newReceivedPayloads.push({ ...payload });
      if (newReceivedPayloads.length > 1) {
        newReceivedPayloads = newReceivedPayloads.slice(
          Math.max(newReceivedPayloads.length - (props.node.maxPayloads || 1), 0),
        );
      }
      receivedPayloads.current = newReceivedPayloads;

      if (!lastTime.current || performance.now() > lastTime.current + 30) {
        lastTime.current = performance.now();
        if (timer.current) {
          clearTimeout(timer.current);
          timer.current = undefined;
        }
        setReceivedPayload(newReceivedPayloads);
      } else {
        if (timer.current) {
          clearTimeout(timer.current);
          timer.current = undefined;
        }

        timer.current = setTimeout(() => {
          timer.current = undefined;
          setReceivedPayload(receivedPayloads.current);
        }, 30);
      }

      return;
    },
    [props.flow, props.node],
  );

  let visualizer = <></>;
  let additionalCssClass = '';

  let visible = true;
  if (props.node.visibilityCondition && expressionTree) {
    let payload = receivedPayload.length > 0 ? receivedPayload[receivedPayload.length - 1] : {};
    const result = executeExpressionTree(expressionTree as unknown as ExpressionNode, payload);
    visible = result === 1;
  }

  if (props.flowrunnerConnector.flowView === 'uiview' && expressionTree) {
    if (!visible) {
      return <></>;
    }
  }

  if (receivedPayload.length === 0) {
    additionalCssClass = 'html-plugin-node__h-100';
  }

  if (props.node.visualizer === 'children') {
    const childrenWithProps = Children.map(props.children, (child) => {
      if (isValidElement(child)) {
        return cloneElement(child, {
          nodeName: props.node.name,
          node: props.node,
          payload: receivedPayload.length > 0 ? receivedPayload[receivedPayload.length - 1] : {},
        } as any);
      }

      return child;
    });
    return <>{childrenWithProps}</>;
  } else if (props.node.visualizer === 'number') {
    visualizer = <Number node={props.node} payloads={receivedPayload}></Number>;
  } else if (props.node.visualizer === 'text') {
    visualizer = <Text node={props.node} payloads={receivedPayload}></Text>;
  } else if (props.node.visualizer === 'statictext') {
    visualizer = <StaticText node={props.node} payloads={receivedPayload}></StaticText>;
  } else if (props.node.visualizer === 'asciiArt') {
    visualizer = <AsciiArt node={props.node} payloads={receivedPayload}></AsciiArt>;
  } else if (props.node.visualizer === 'list') {
    visualizer = <List node={props.node} payloads={receivedPayload}></List>;
  } else if (props.node.visualizer === 'color') {
    additionalCssClass = 'html-plugin-node__h-100';
    visualizer = <Color node={props.node} payloads={receivedPayload}></Color>;
  } else if (props.node.visualizer === 'richtext') {
    additionalCssClass = 'html-plugin-node__h-100';
    visualizer = (
      <Suspense fallback={<div>Loading...</div>}>
        <RichText node={props.node} payloads={receivedPayload}></RichText>
      </Suspense>
    );
  } else if (props.node.visualizer === 'gridcanvas') {
    additionalCssClass = 'html-plugin-node__h-100';
    visualizer = (
      <Suspense fallback={<div>Loading...</div>}>
        <GridCanvas node={props.node} payloads={receivedPayload}></GridCanvas>
      </Suspense>
    );
  } else if (props.node.visualizer === 'animatedgridcanvas') {
    additionalCssClass = 'html-plugin-node__h-100';
    visualizer = (
      <Suspense fallback={<div>Loading...</div>}>
        <AnimatedGridCanvas node={props.node} payloads={receivedPayload}></AnimatedGridCanvas>
      </Suspense>
    );
  } else if (props.node.visualizer === 'xycanvas') {
    additionalCssClass = 'html-plugin-node__h-100';
    visualizer = (
      <Suspense fallback={<div>Loading...</div>}>
        <XYCanvas
          flowrunnerConnector={props.flowrunnerConnector}
          selectedNode={selectedNode}
          node={props.node}
          payloads={receivedPayload}
        ></XYCanvas>
      </Suspense>
    );
  } else {
    const payload = receivedPayload[receivedPayload.length - 1];
    if (payload && (payload as any).debugId) {
      delete (payload as any).debugId;
    }
    if (payload) {
      lastReceivedPayload.current = payload;
    }
    let helperPayload = lastReceivedPayload.current;
    if (props.node.visualizer === 'json') {
      if (props.node && props.node.propertyName && lastReceivedPayload.current) {
        helperPayload = lastReceivedPayload.current[props.node.propertyName];
      }
    }
    visualizer = <div className="w-100 h-auto">{payload ? JSON.stringify(helperPayload, null, 2) : ''}</div>;
  }
  let elements: JSX.Element[] = [];
  if (props.node.elements) {
    props.node.elements.forEach((element, index) => {
      if (element.visibilityCondition) {
        const et = createExpressionTree(element.visibilityCondition);
        const payload = receivedPayload.length > 0 ? receivedPayload[receivedPayload.length - 1] : {};
        const result = executeExpressionTree(et as unknown as ExpressionNode, payload);
        if (result !== 1) {
          return;
        }
      }
      let visualizerElement: JSX.Element | null = null;
      if (element.visualizer === 'number') {
        visualizerElement = <Number key={`element${index}`} node={element} payloads={receivedPayload}></Number>;
      } else if (element.visualizer === 'text') {
        visualizerElement = <Text key={`element${index}`} node={element} payloads={receivedPayload}></Text>;
      } else if (element.visualizer === 'statictext') {
        visualizerElement = <StaticText key={`element${index}`} node={element} payloads={receivedPayload}></StaticText>;
      }
      if (visualizerElement) {
        elements.push(visualizerElement);
      }
    });
  }
  return (
    <>
      {!visible && expressionTree && props.flowrunnerConnector.flowView != 'uiview' && (
        <div className="html-plugin-node__visibility fas fa-eye-slash"></div>
      )}
      <div
        className={
          'html-plugin-node html-plugin-node--wrap html-plugin-node--' + props.node.visualizer + additionalCssClass
        }
        style={{
          backgroundColor: 'white',
        }}
      >
        {visualizer}
        {elements}
      </div>
    </>
  );
};
