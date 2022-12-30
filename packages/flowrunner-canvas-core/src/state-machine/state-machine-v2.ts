import { StateMachine } from './state-machine';

export interface IStateMachine {
  hasStateMachine: boolean;
  currentState: () => string;
  event: (eventName: string, payload?: any) => Promise<string>;
  states: IState[];
  setInitialState: (state: string) => void;
}

export interface IState {
  name: string;
  events: IEventState[];
  nodeName: string;
}

export interface IEventState {
  name: string;
  newState: string;
  guards?: IGuard[];
}

export interface IEvent {
  name: string;
  nodeName: string;
  newState: string;
  connectedStateNodeName: string;
  guards?: IGuard[];
}

export interface IGuard {
  name: string;
  nodeName: string;
  node: any;
}

export interface IStateMachineInfo {
  startNodeName: string;
  stateMachineName: string;
}

export const getStartStateNodeName = (flow: any): IStateMachineInfo[] => {
  let startNodeNames: IStateMachineInfo[] = [];
  flow.forEach((node) => {
    if (node.taskType === 'StartState') {
      startNodeNames.push({
        startNodeName: node.name,
        stateMachineName: node.stateMachine,
      });
    }
  });
  return startNodeNames;
};

export const getFlowByStartStateNode = (
  startNodeName: string,
  flow: any[],
  flowStoreHashMap: any,
  visitedNodes?: string[],
): any[] => {
  let outputConnections: any[] = [];
  if (!flowStoreHashMap || !flow) {
    return [];
  }
  //console.log('getFlowByStartStateNode', startNodeName, visitedNodes);
  const mappedNode = (flowStoreHashMap as any).get(startNodeName);
  if (mappedNode && mappedNode.index >= 0) {
    const node = flow[mappedNode.index];
    if (!visitedNodes) {
      outputConnections.push(node);
    }

    const outputs = mappedNode.start;
    //console.log('getFlowByStartStateNode2', startNodeName, outputs);
    if (outputs && outputs.length > 0) {
      //console.log('getFlowByStartStateNode3', startNodeName, outputs);
      outputs.forEach((outputIndex) => {
        if (flow) {
          const outputLineNode = flow[outputIndex];
          outputConnections.push(outputLineNode);

          // console.log(
          //   'getFlowByStartStateNode4',
          //   startNodeName,
          //   outputIndex,
          //   outputLineNode,
          //   outputLineNode.endshapeid,
          //   visitedNodes,
          // );

          if (!visitedNodes || (visitedNodes && visitedNodes.indexOf(outputLineNode.endshapeid) < 0)) {
            //console.log('getFlowByStartStateNode5', startNodeName, outputIndex, outputLineNode, visitedNodes);
            if (outputLineNode.endshapeid) {
              //console.log('getFlowByStartStateNode6', startNodeName, outputIndex, outputLineNode, visitedNodes);
              if (!visitedNodes || (visitedNodes && visitedNodes.indexOf(outputLineNode.endshapeid) < 0)) {
                const mappedNode = (flowStoreHashMap as any).get(outputLineNode.endshapeid);
                if (mappedNode && mappedNode.index >= 0) {
                  const outputNode = flow[mappedNode.index];
                  outputConnections.push(outputNode);
                }

                //console.log('getFlowByStartStateNode7', startNodeName, outputIndex, outputLineNode, visitedNodes);
                outputConnections = [
                  ...outputConnections,
                  ...getFlowByStartStateNode(outputLineNode.endshapeid, flow, flowStoreHashMap, [
                    ...(visitedNodes || []),
                    outputLineNode.endshapeid,
                  ]),
                ];
              }
            }
          }
        }
      });
    }
  }
  return outputConnections;
};

let _stateMachines: any = {};

export const initStateMachines = () => {
  _stateMachines = {};
};

export const registerStateMachine = (stateMachineName: string, stateMachine: StateChart) => {
  _stateMachines[stateMachineName] = stateMachine;
};

export const getStateMachines = () => {
  const stateCharts: StateChart[] = [];
  Object.keys(_stateMachines).forEach((stateMachineName) => {
    stateCharts.push(_stateMachines[stateMachineName] as unknown as StateChart);
  });
  return stateCharts;
};

export const getCurrentStateMachine = (stateMachineName: string) => _stateMachines[stateMachineName];

export class StateChart {
  emptyStateMachine = {
    hasStateMachine: false,
    currentState: () => '',
    states: [],
    event: (eventName: string) => Promise.resolve(''),
    setInitialState: (_state: string) => undefined,
  };

  stateMachinesState: any = {};

  stateMachine: IStateMachine = this.emptyStateMachine;
  _currentState: string = '';

  private _stateMachineName: string = '';
  private _oldStateMachine: IStateMachine = this.emptyStateMachine;
  private _stateChangeHandlers: any = {};
  private _onSetCanvasStateCallback: undefined | ((stateMachineName: string, currentState: string) => void);

  public hasStateMachineChanged = (oldStates: IState[], newStates: IState[]) => {
    let isDifferentStateMachine: boolean = false;
    console.log('oldstates vs states', oldStates, newStates);
    if (oldStates.length === newStates.length) {
      newStates.forEach((state) => {
        let stateIsInOldState = true;
        let isStateInOldState = oldStates.filter((oldState) => oldState.name === state.name).length > 0;

        oldStates.forEach((oldState) => {
          if (oldState.name === state.name) {
            let hasSameEvents = true;
            if (state.events.length !== oldState.events.length) {
              hasSameEvents = false;
            }
            state.events.forEach((event) => {
              let eventIsInOldEvent = true;
              let isEventInOldEvent = oldState.events.filter((oldEvent) => oldEvent.name === event.name).length > 0;
              oldState.events.forEach((oldEvent) => {
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

  public clearStateMachine = () => {
    this.stateMachinesState = {};
    this.stateMachine = this.emptyStateMachine;
  };

  public getCurrentState = (stateMachine: string) => {
    return this.stateMachinesState[stateMachine] || '';
  };

  public createStateMachine = (flow: any[]): IStateMachine => {
    let currentState = '';
    let states: IState[] = [];
    let events: IEvent[] = [];
    let guards: IGuard[] = [];
    let startStateNode = '';
    let startState = '';
    let stateMachineName = '';
    let hasStateNodes = false;

    let oldStates: IState[] = [];
    if (this._stateMachineName) {
      oldStates = [...this._oldStateMachine.states];
    }

    flow.forEach((node) => {
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
        stateMachineName = (node.stateMachine || node.label || node.name).replaceAll(' ', '');
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
          node: node,
        });
      }
    });

    console.log('Guards', guards);

    flow.forEach((node) => {
      if (node.taskType === 'connection' && startStateNode && node.startshapeid === startStateNode) {
        const startStates = states.filter((state) => {
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
        const connectedEventsByStart = events.filter((event) => {
          return event.nodeName === node.startshapeid;
        });

        const connectedStatesByEnd = states.filter((state) => {
          return state.nodeName === node.endshapeid;
        });

        // search events with the newState they point to
        // update the event in the events array with this newState

        if (connectedEventsByStart.length === 1 && connectedStatesByEnd.length === 1) {
          connectedEventsByStart[0].newState = connectedStatesByEnd[0].name;
        }
      }
    });

    flow.forEach((node) => {
      if (node.taskType === 'connection') {
        // lookup the connected start state
        const connectedStatesByStart = states.filter((state) => {
          return state.nodeName === node.startshapeid;
        });

        // lookup the connected event
        const connectedEventsByEnd = events.filter((event) => {
          return event.nodeName === node.endshapeid;
        });

        if (connectedStatesByStart.length === 1 && connectedEventsByEnd.length === 1) {
          const eventNodeName = node.endshapeid;

          const guardsForEvent: IGuard[] = [];
          flow.forEach((nodeConnection) => {
            if (nodeConnection.taskType === 'connection') {
              if (nodeConnection.startshapeid === eventNodeName) {
                const connectedGuardsByEnd = guards.filter((guard) => {
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
            flow.forEach((nodeConnection) => {
              if (nodeConnection.taskType === 'connection') {
                if (nodeConnection.startshapeid === guardsForEvent[0].nodeName) {
                  const connectedStates = states.filter((state) => {
                    return state.nodeName === nodeConnection.endshapeid;
                  });
                  if (connectedStates.length > 0) {
                    newState = connectedStates[0].name;
                  }
                }
              }
            });
          }

          // add found event to the allowed events list of a state
          connectedStatesByStart[0].events.push({
            name: connectedEventsByEnd[0].name,
            newState,
            guards: guardsForEvent,
          });
        }
      }
    });

    if (!hasStateNodes) {
      this._oldStateMachine = this.emptyStateMachine;
      return this.emptyStateMachine;
    }

    if (!startStateNode || !startState) {
      throw new Error('StateMachine should have a start state');
    }

    currentState = startState;
    this._stateMachineName = stateMachineName;

    this.stateMachinesState[stateMachineName] = currentState;

    if (this._onSetCanvasStateCallback) {
      this._onSetCanvasStateCallback(stateMachineName, currentState);
    }

    Object.keys(this._stateChangeHandlers).forEach((handlerName) => {
      this._stateChangeHandlers[handlerName](stateMachineName, currentState, true);
    });

    this.stateMachine = {
      hasStateMachine: true,
      currentState: () => currentState,
      states,
      setInitialState: (newState: string) => {
        if (!newState) {
          throw new Error(`No new state given`);
        }

        const searchState = states.filter((state) => {
          return state.name === newState;
        });

        if (searchState.length == 0) {
          throw new Error(`New state ${newState} doesn't exist`);
        }
        currentState = newState;

        this.stateMachinesState[stateMachineName] = currentState;

        if (this._onSetCanvasStateCallback) {
          this._onSetCanvasStateCallback(stateMachineName, currentState);
        }

        Object.keys(this._stateChangeHandlers).forEach((handlerName) => {
          this._stateChangeHandlers[handlerName](stateMachineName, currentState);
        });

        this._currentState = currentState;
      },
      event: async (eventName: string, payload?: any) => {
        console.log('StateMachine event', eventName, payload);

        const currentStates = states.filter((state) => {
          return state.name === currentState;
        });

        if (currentStates.length === 1) {
          let triggerStateEvent = false;
          const allowedEvents = currentStates[0].events;
          const foundEvents = allowedEvents.filter((event) => event.name === eventName);
          if (foundEvents.length === 1) {
            if (this._onGuardEventCallback && foundEvents[0].guards && foundEvents[0].guards.length > 0) {
              const result = await this._onGuardEventCallback(
                stateMachineName,
                currentState,
                eventName,
                foundEvents[0].guards[0].node || {},
                payload || {},
              );

              if (!result) {
                return currentState;
              }
            }
            triggerStateEvent = currentState !== foundEvents[0].newState;
            currentState = foundEvents[0].newState;
          }

          this.stateMachinesState[stateMachineName] = currentState;

          if (this._onSetCanvasStateCallback) {
            this._onSetCanvasStateCallback(stateMachineName, currentState);
          }
          if (triggerStateEvent) {
            Object.keys(this._stateChangeHandlers).forEach((handlerName) => {
              this._stateChangeHandlers[handlerName](stateMachineName, currentState);
            });
          }

          this._currentState = currentState;
          return currentState;
        } else {
          throw new Error('Invalid current state');
        }
      },
    };

    this._oldStateMachine = this.stateMachine;
    this._currentState = currentState;
    return this.stateMachine;
  };

  public getCurrentStateMachine = () => this.stateMachine;

  public setOnSetCanvasStateCallback = (
    onSetCanvasStateCallback: (stateMachineName: string, currentState: string) => void,
  ) => {
    this._onSetCanvasStateCallback = onSetCanvasStateCallback;
  };

  public resetOnSetCanvasStateCallback = () => {
    this._onSetCanvasStateCallback = undefined;
  };

  public registerStateChangeHandler = (
    name: string,
    onStateChangeHandler: (stateMachineName: string, currentState: string, isStateMachineStarting?: boolean) => void,
  ) => {
    this._stateChangeHandlers[name] = onStateChangeHandler;
  };

  public unRegisterStateChangeHandler = (name: string) => {
    delete this._stateChangeHandlers.name;
  };

  public sendCurrentState = () => {
    if (this._onSetCanvasStateCallback) {
      this._onSetCanvasStateCallback(this._stateMachineName, this.stateMachine.currentState());
    }
    Object.keys(this._stateChangeHandlers).forEach((handlerName) => {
      this._stateChangeHandlers[handlerName](this._stateMachineName, this.stateMachine.currentState());
    });
  };

  public _onGuardEventCallback:
    | undefined
    | ((stateMachineName: string, currentState: string, eventName: string, node: any, payload: any) => boolean);

  public setOnGuardEventCallback = (
    onGuardEventCallback: (
      stateMachineName: string,
      currentState: string,
      eventName: string,
      node: any,
      payload: any,
    ) => boolean,
  ) => {
    this._onGuardEventCallback = onGuardEventCallback;
  };

  public resetOnGuardEventCallback = () => {
    this._onGuardEventCallback = undefined;
  };
}
