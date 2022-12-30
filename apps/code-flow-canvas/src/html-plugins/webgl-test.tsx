import React, { useLayoutEffect, useRef } from 'react';

export interface IWebGlTestProps {
  node: any;
}

export const WebGlTest = (props: IWebGlTestProps) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const rafHandler = useRef<number | null>(null);
  useLayoutEffect(() => {
    let unmounted = false;
    if (canvas.current) {
      const gl = canvas.current.getContext('webgl2');
      if (gl) {
        const rafFunction = () => {
          // TODO : handle timers...
          // TODO : draw something...
          // TODO : figure out how to use the flow from here in a performant way?
          //     ... perhaps with some basic nodes to be converted to straight glsl?? convert part of flow to AST ???
          if (!unmounted) {
            rafHandler.current = requestAnimationFrame(rafFunction);
          }
        };
        rafHandler.current = requestAnimationFrame(rafFunction);
      }
    }
    return () => {
      unmounted = true;
      if (rafHandler.current !== null) {
        cancelAnimationFrame(rafHandler.current);
        rafHandler.current = null;
      }
    };
  }, []);
  const { node } = props;
  return (
    <canvas
      ref={(ref) => (canvas.current = ref)}
      width={node.width || 256}
      height={node.height || 256}
      style={{ perspective: '1px', backfaceVisibility: 'hidden', position: 'relative', zIndex: 10 }}
    ></canvas>
  );
};

export const getWebGlTestComponent = (secrets) => {
  return WebGlTest;
};
