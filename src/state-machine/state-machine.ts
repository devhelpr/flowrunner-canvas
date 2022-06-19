/*

	TODO: support for simple guards which can run an expression 
			depending on the result, the event is executed
			otherwise.. for now .. stay in the current state
				
			- next step: trigger "else" event
			- next step: use flows for gaurd logic (async)


	TODO: create multiple statemachine by statemachine-name on StartState
		(if it's not defined then use uniqueid)

	TODO: allow for registering statemachine observers

		STATE node should show state of current machine
		
		FormNode needs to be able to attach visibility condition to state of statemachine
		State should be usable in expressions
		State should be usable in ifconditions
		new StateFlow node : triggered when statemachine is transitioned to given state

*/

export interface IStateMachine {
  hasStateMachine: boolean;
  currentState: () => string;
  event: (eventName: string, payload? : any) => Promise<string>;
  states: IState[];
}

export interface IState {
  name: string;
  events: IEventState[];
  nodeName: string;
}

export interface IEventState {
  name: string;
  newState: string;
	guards? : IGuard[];
}

export interface IEvent {
  name: string;
  nodeName: string;
  newState: string;
  connectedStateNodeName: string;
	guards? : IGuard[];
}

export interface IGuard {
	name: string;
	nodeName: string;
	node: any;
}

let stateMachinesState: any = {};

export const emptyStateMachine = {
  hasStateMachine: false,
  currentState: () => '',
  states: [],
  event: (eventName: string) => Promise.resolve(""),
};

let stateMachine: IStateMachine = emptyStateMachine;
let _stateMachineName: string = '';
let _oldStateMachine: IStateMachine = emptyStateMachine;
let _currentState: string = '';

const hasStateMachineChanged = (oldStates: IState[], newStates: IState[]) => {
  let isDifferentStateMachine: boolean = false;
  console.log('oldstates vs states', oldStates, newStates);
  if (oldStates.length === newStates.length) {
    newStates.forEach(state => {
      let stateIsInOldState = true;
      let isStateInOldState = oldStates.filter(oldState => oldState.name === state.name).length > 0;

      oldStates.forEach(oldState => {
        if (oldState.name === state.name) {
          let hasSameEvents = true;
          if (state.events.length !== oldState.events.length) {
            hasSameEvents = false;
          }
          state.events.forEach(event => {
            let eventIsInOldEvent = true;
            let isEventInOldEvent = oldState.events.filter(oldEvent => oldEvent.name === event.name).length > 0;
            oldState.events.forEach(oldEvent => {
              if (oldEvent.name === event.name) {
                if (oldEvent.newState !== event.newState) {
                  eventIsInOldEvent = false;
                }
              }
            });
            if (!eventIsInOldEvent || !isEventInOldEvent) {
              hasSameEvents = false;
            }
          });

          if (!hasSameEvents) {
            stateIsInOldState = false;
          }
        }
      });

      if (!stateIsInOldState || !isStateInOldState) {
        isDifferentStateMachine = true;
      }
    });
  } else {
    isDifferentStateMachine = true;
  }
  return isDifferentStateMachine;
};

export const clearStateMachine = () => {
  stateMachinesState = {};
  stateMachine = emptyStateMachine;
};

export const getCurrentState = (stateMachine: string) => {
  return stateMachinesState[stateMachine] || '';
};

export const createStateMachine = (flow: any[]): IStateMachine => {
  let currentState = '';
  let states: IState[] = [];
  let events: IEvent[] = [];
	let guards: IGuard[] = [];
  let startStateNode = '';
  let startState = '';
  let stateMachineName = '';
  let hasStateNodes = false;

  let oldStates: IState[] = [];
  if (_stateMachineName) {
    oldStates = [..._oldStateMachine.states];
  }

  flow.forEach(node => {
    if (node.taskType === 'State') {
      if (!node.StateName) {
        throw new Error('States should have a name');
      }

      hasStateNodes = true;

      states.push({
        name: node.StateName,
        events: [],
        nodeName: node.name,
      });
    }

    if (node.taskType === 'StartState') {
      if (startStateNode) {
        throw new Error('StateMachine can only have 1 start state');
      }
      startStateNode = node.name;
      stateMachineName = (node.label || node.name).replaceAll(' ', '');
    }

    if (node.taskType === 'Event') {
      if (!node.EventName) {
        throw new Error('Events should have a name');
      }

      events.push({
        name: node.EventName,
        nodeName: node.name,
        connectedStateNodeName: '',
        newState: '',
      });
    }

		if (node.taskType === 'Guard') {
      if (!node.GuardName) {
        throw new Error('Guard should have a name');
      }

      guards.push({
        name: node.GuardName,
				nodeName: node.name,
        node: node
      });
    }
  });

	console.log("Guards", guards);

  flow.forEach(node => {
    if (node.taskType === 'connection' && startStateNode && node.startshapeid === startStateNode) {
      const startStates = states.filter(state => {
        return state.nodeName === node.endshapeid;
      });

      if (startStates.length === 1) {
        startState = startStates[0].name;
      } else if (startStates.length === 0) {
        throw new Error('StateMachine should have a start state');
      } else if (startStates.length > 1) {
        throw new Error("Start node can't be connected to multiple states, there can only be a single start state");
      }
    } else if (node.taskType === 'connection') {
      const connectedEventsByStart = events.filter(event => {
        return event.nodeName === node.startshapeid;
      });

      const connectedStatesByEnd = states.filter(state => {
        return state.nodeName === node.endshapeid;
      });

      // search events with the newState they point to
      // update the event in the events array with this newState

      if (connectedEventsByStart.length === 1 && connectedStatesByEnd.length === 1) {
        connectedEventsByStart[0].newState = connectedStatesByEnd[0].name;
      }
    }
  });

  flow.forEach(node => {
    if (node.taskType === 'connection') {
      // lookup the connected start state
      const connectedStatesByStart = states.filter(state => {
        return state.nodeName === node.startshapeid;
      });

      // lookup the connected event
      const connectedEventsByEnd = events.filter(event => {
        return event.nodeName === node.endshapeid;
      });

      if (connectedStatesByStart.length === 1 && connectedEventsByEnd.length === 1) {
				const eventNodeName = node.endshapeid;

				const guardsForEvent : IGuard[] = [];
				flow.forEach(nodeConnection => {
					if (nodeConnection.taskType === 'connection') {
						if (nodeConnection.startshapeid === eventNodeName) {
							const connectedGuardsByEnd = guards.filter(guard => {
								return guard.nodeName === nodeConnection.endshapeid;
							});
				
							if (connectedGuardsByEnd.length === 1) {
								guardsForEvent.push(connectedGuardsByEnd[0]);
							}
						}
					}

					//TODO : lookup connected state to guards if there were guards
					// (and set newState on event)
				});
				
				let newState = connectedEventsByEnd[0].newState;

				if (guardsForEvent.length > 0) {
					flow.forEach(nodeConnection => {
						if (nodeConnection.taskType === 'connection') {
							if (nodeConnection.startshapeid === guardsForEvent[0].nodeName) {
								const connectedStates = states.filter(state => {
									return state.nodeName === nodeConnection.endshapeid;
								});
								if (connectedStates.length > 0) {
									newState = connectedStates[0].name
								}
							}
						}
					});
				}

        // add found event to the allowed events list of a state
        connectedStatesByStart[0].events.push({
          name: connectedEventsByEnd[0].name,
          newState,
					guards: guardsForEvent
        });
      }
    }
  });

  if (!hasStateNodes) {
    _oldStateMachine = emptyStateMachine;
    return emptyStateMachine;
  }

  if (!startStateNode || !startState) {
    throw new Error('StateMachine should have a start state');
  }

	currentState = startState;
	_stateMachineName = stateMachineName;

  stateMachinesState[stateMachineName] = currentState;

  if (_onSetCanvasStateCallback) {
    _onSetCanvasStateCallback(stateMachineName, currentState);
  }

  Object.keys(_stateChangeHandlers).forEach(handlerName => {
    _stateChangeHandlers[handlerName](stateMachineName, currentState);
  });

  stateMachine = {
    hasStateMachine: true,
    currentState: () => currentState,
    states,
    event: async (eventName: string, payload? : any) => {

			console.log("StateMachine event" , eventName, payload);

      const currentStates = states.filter(state => {
        return state.name === currentState;
      });

      if (currentStates.length === 1) {
        let triggerStateEvent = false;
        const allowedEvents = currentStates[0].events;
        const foundEvents = allowedEvents.filter(event => event.name === eventName);
        if (foundEvents.length === 1) {
					if (_onGuardEventCallback && foundEvents[0].guards && foundEvents[0].guards.length > 0) {
						const result = await _onGuardEventCallback(
							stateMachineName,
							currentState,
							eventName,
							foundEvents[0].guards[0].node || {},
							payload || {});

						if (!result) {
							return currentState;
						}
					}
          triggerStateEvent = currentState !== foundEvents[0].newState;
          currentState = foundEvents[0].newState;
        }

        stateMachinesState[stateMachineName] = currentState;
        
				if (_onSetCanvasStateCallback) {
          _onSetCanvasStateCallback(stateMachineName, currentState);
        }
        if (triggerStateEvent) {					
          Object.keys(_stateChangeHandlers).forEach(handlerName => {
            _stateChangeHandlers[handlerName](stateMachineName, currentState);
          });
        }
        
				_currentState = currentState;
        return currentState;
      } else {
        throw new Error('Invalid current state');
      }
    },
  };

  _oldStateMachine = stateMachine;
  _currentState = currentState;
  return stateMachine;
};

export const getCurrentStateMachine = () => stateMachine;

let _onSetCanvasStateCallback: undefined | ((stateMachineName: string, currentState: string) => void);

export const setOnSetCanvasStateCallback = (
  onSetCanvasStateCallback: (stateMachineName: string, currentState: string) => void,
) => {
  _onSetCanvasStateCallback = onSetCanvasStateCallback;
};

export const resetOnSetCanvasStateCallback = () => {
  _onSetCanvasStateCallback = undefined;
};

let _stateChangeHandlers: any = {};
export const registerStateChangeHandler = (
  name: string,
  onStateChangeHandler: (stateMachineName: string, currentState: string) => void,
) => {
  _stateChangeHandlers[name] = onStateChangeHandler;
};

export const unRegisterStateChangeHandler = (name: string) => {
  delete _stateChangeHandlers.name;
};

export const sendCurrentState = () => {
  if (_onSetCanvasStateCallback) {
    _onSetCanvasStateCallback(_stateMachineName, stateMachine.currentState());
  }
  Object.keys(_stateChangeHandlers).forEach(handlerName => {
    _stateChangeHandlers[handlerName](_stateMachineName, stateMachine.currentState());
  });
};


let _onGuardEventCallback: undefined | ((stateMachineName: string, currentState: string, eventName: string, node: any, payload: any) => boolean);

export const setOnGuardEventCallback = (
  onGuardEventCallback: (stateMachineName: string, currentState: string, eventName: string, node: any, payload: any) => boolean
) => {
  _onGuardEventCallback = onGuardEventCallback;
};

export const resetOnGuardEventCallback = () => {
  _onGuardEventCallback = undefined;
};