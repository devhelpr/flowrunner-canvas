import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderHook } from '@testing-library/react-hooks';
import { useFlowStore, useLayoutStore, useNodesStateStore } from '@devhelpr/flowrunner-canvas-core';

/*
const TestComponent = (props : any) => {
	const layoutStore = useLayoutStore();
	layoutStore.storeLayout({a:"hello zustand"})
	return <div role="test-element">{layoutStore.layout.a}</div>;
	//return <div role="test-element">hello zustand</div>;
}
*/

test('testZustand', async () => {
  //render(<TestComponent></TestComponent>);
  //expect(await screen.getByRole("test-element")).toHaveTextContent("hello zustand");

  const { result } = renderHook(() => useLayoutStore());

  act(() => {
    result.current.storeLayout(JSON.stringify({ a: 'hello zustand' }));
  });

  expect(result.current.layout).toBeDefined();
  expect(JSON.parse(result.current.layout).a).toBe('hello zustand');
});

test('testZustandImmer', async () => {
  const { result } = renderHook(() => useNodesStateStore());

  act(() => {
    result.current.setNodeState('test', 'state');
  });

  expect(result.current.nodes).toBeDefined();
  expect(result.current.nodes.test).toBeDefined();
  expect(result.current.nodes.test).toBe('state');
});

test('testZustandFlow', async () => {
  const { result } = renderHook(() => useFlowStore());

  act(() => {
    result.current.addFlowNode({ name: 'test', id: 'test', something: 123 });
  });

  expect(result.current.flow).toBeDefined();
  expect(result.current.flow.length).toBe(1);
  expect(result.current.flow[0].name).toBe('test');

  act(() => {
    result.current.addFlowNode({ name: 'test2', id: 'test2', something: 1234 });
  });

  expect(result.current.flow.length).toBe(2);

  expect(result.current.flow[1].name).toBe('test2');

  act(() => {
    result.current.storeFlowNode({ name: 'test2', id: 'test2', something: 12345 }, 'test2');
    result.current.storeFlowNode({ name: 'test2', id: 'test2', something: 123 }, 'test2');
  });

  expect(result.current.flow[1].something).toBe(123);
});
