export interface IStateMachine {
  currentState: () => string;
  event: (eventName: string) => string;
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
}

export interface IEvent {
  name: string;
  nodeName: string;
  newState: string;
  connectedStateNodeName: string;
}

export const createStateMachine = (flow: any[]): IStateMachine => {
  let currentState = '';
  let states: IState[] = [];
  let events: IEvent[] = [];
  let startStateNode = '';
  let startState = '';

  flow.forEach(node => {
    if (node.taskType === 'State') {
      if (!node.StateName) {
        throw new Error('States should have a name');
      }

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
  });

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
        // add found event to the allowed events list of a state
        connectedStatesByStart[0].events.push({
          name: connectedEventsByEnd[0].name,
          newState: connectedEventsByEnd[0].newState,
        });
      }
    }
  });

  if (!startStateNode || !startState) {
    throw new Error('StateMachine should have a start state');
  }

  currentState = startState;
  return {
    currentState: () => currentState,
    states,
    event: (eventName: string) => {
      const currentStates = states.filter(state => {
        return state.name === currentState;
      });

      if (currentStates.length === 1) {
        const allowedEvents = currentStates[0].events;
        const foundEvents = allowedEvents.filter(event => event.name === eventName);
        if (foundEvents.length === 1) {
          currentState = foundEvents[0].newState;
        }
        return currentState;
      } else {
        throw new Error('Invalid current state');
      }
    },
  };
};
