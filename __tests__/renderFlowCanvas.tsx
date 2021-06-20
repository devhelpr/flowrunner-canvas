import React from 'react'
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { FlowrunnerCanvas , flowrunnerLocalStorageProvider } from '../src';
test('testRenderFlowCanvas', async () => {
	render(<FlowrunnerCanvas flowStorageProvider={flowrunnerLocalStorageProvider}></FlowrunnerCanvas>);
	expect(await screen.getByRole("menu")).toHaveClass("toolbar__root");
});