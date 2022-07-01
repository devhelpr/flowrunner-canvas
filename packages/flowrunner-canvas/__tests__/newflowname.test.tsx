import { getNewNode } from '../src/helpers/flow-methods';


test('testNewFlowName', async () => {
	const newNode = getNewNode(
		{name:"test"},[
		{name:"test1"},
		{name:"test2"}
	]);
	
	expect(newNode.name).toBe("test3");

});

test('testNewFlowName1', async () => {
	const newNode = getNewNode(
		{name:"test"},[
		{name:"test"},
		{name:"test1"},
		{name:"test2"}
	]);
	
	expect(newNode.name).toBe("test3");

});

test('testNewFlowName2', async () => {
	const newNode = getNewNode(
		{name:"test"},[
		{name:"test"}
	]);
	
	expect(newNode.name).toBe("test1");

});

test('testNewFlowName3', async () => {
	const newNode = getNewNode(
		{name:"test"},[
		{name:"test"},
		{name:"test1"},
		{name:"test2"},
		{name:"test3"}
	]);
	
	expect(newNode.name).toBe("test4");

});

test('testNewFlowName4', async () => {
	const newNode = getNewNode(
		{name:"test2"},[
		{name:"test"},
		{name:"test1"},
		{name:"test2"},
		{name:"test3"}
	]);
	
	expect(newNode.name).toBe("test4");

});

test('testNewFlowName10', async () => {
	const newNode = getNewNode(
		{name:"test2"},[
		{name:"test"},
		{name:"test1"},
		{name:"test2"},
		{name:"test3"},
		{name:"test4"},
		{name:"test5"},
		{name:"test6"},
		{name:"test7"},
		{name:"test8"},
		{name:"test9"},
	]);
	
	expect(newNode.name).toBe("test10");

});

test('testNewFlowName11', async () => {
	const newNode = getNewNode(
		{name:"test2"},[
		{name:"test"},
		{name:"test1"},
		{name:"test2"},
		{name:"test3"},
		{name:"test4"},
		{name:"test5"},
		{name:"test6"},
		{name:"test7"},
		{name:"test8"},
		{name:"test9"},
		{name:"test10"},
	]);
	
	expect(newNode.name).toBe("test11");

});