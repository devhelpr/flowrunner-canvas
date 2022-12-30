/*
    how to handle nested "MapEvent"-nodes ? (and simulair scenario's...)
    \

    .. eventContext payload property die "namespaced" aangevuld wordt hoe dieper ie komt
       [nodeid-event-index].[nodeid-event-index].... etc
*/

let debugInfo: {};
let debugContext: {};

export const resetDebugInfo = () => {
  debugInfo = {};
  debugContext = {};
};

export const resetDebugInfoForEvent = (nodeName: string, contextId: string, eventName: string) => {
  const contextString = `${contextId}_${eventName}`;
  if (!debugInfo[nodeName]) {
    debugInfo[nodeName] = {};
  }
  if (!debugInfo[nodeName][contextString]) {
    debugInfo[nodeName][contextString] = [];
  }
  if (!debugContext[nodeName]) {
    debugContext[nodeName] = [];
  }
  if (!debugContext[nodeName][contextString]) {
    debugContext[nodeName][contextString] = false;
  }
};

export const addDebugInfoForEvent = (
  nodeName: string,
  contextId: string,
  eventName: string,
  index: number,
  payload: any,
) => {
  const contextString = `${contextId}_${eventName}`;

  if (!debugInfo[nodeName]) {
    debugInfo[nodeName] = {};
  }
  if (!debugInfo[nodeName][contextString]) {
    debugInfo[nodeName][contextString] = [];
  }
  if (!debugContext[nodeName]) {
    debugContext[nodeName] = [];
  }
  if (!debugContext[nodeName][contextString]) {
    debugContext[nodeName][contextString] = true;
  }
  debugInfo[nodeName][contextString].push({ index, payload });
};

export const getDebugContextsForNode = (nodeName: string) => {
  if (debugContext[nodeName]) {
    return Object.keys(debugContext[nodeName]);
  }
  return [];
};

export const getDebugInfoForNodeAndContext = (nodeName: string, contextString: string) => {
  if (!debugInfo[nodeName]) {
    return [];
  }
  if (!debugInfo[nodeName][contextString]) {
    return [];
  }
  return debugInfo[nodeName][contextString];
};
