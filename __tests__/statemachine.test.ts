import '@testing-library/jest-dom/extend-expect'
import { flow } from "./data/basic-state-machine-flow";
import { createStateMachine} from "../src/state-machine";

test('State Machine init', async () => {
	
	// Arrange
	const machine = createStateMachine(flow);

	// Act

	// Assert

	expect(machine).toBeDefined();
	expect(machine.currentState()).toBe("Off");
});


test('State Machine turn on', async () => {
	
	// Arrange
	const machine = createStateMachine(flow);

	// Act
	await machine.event("Toggle On");

	// Assert

	expect(machine.currentState()).toBe("On");
});

test('State Machine turn on and off', async () => {
	
	// Arrange
	const machine = createStateMachine(flow);

	// Act
	await machine.event("Toggle On");
	await machine.event("Toggle Off");

	// Assert

	expect(machine.currentState()).toBe("Off");
});
