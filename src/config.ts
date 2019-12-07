const stateTypeTask = {
  strokeColor: '#0080e0',
  fillColor: '#f7a145',
  fillSelectedColor: '#065c9d',
  textColor: '#000000',
};

const actionTask = {
  strokeColor: '#f78306',
  fillColor: '#34a5fa',
  fillSelectedColor: '#ce791f',
  textColor: '#ffffff',
};

export const taskTypeConfig: any = {
  AssignTask: {
    shapeType: 'Rect',
  },
  InjectIntoPayloadTask: {
    shapeType: 'Rect',
  },
  ClearTask: {
    shapeType: 'Rect',
  },
  FunctionCallTask: {
    cornerRadius: 10,
  },
  FetchTask: {
    shapeType: 'Rect',
    isSkewed: true,
  },
  ExpressionTask: {
    shapeType: 'Rect',
  },
  ObservableTask: {
    strokeColor: '#510a24',
    fillColor: '#d81b60',
    fillSelectedColor: '#921241',
    textColor: '#ffffff',
  },
  ObserverTask: {
    strokeColor: '#510a24',
    fillColor: '#d81b60',
    fillSelectedColor: '#921241',
    textColor: '#ffffff',
  },
  ReduxArrayStateType: stateTypeTask,
  ReduxPropertyStateType: stateTypeTask,
  ReduxHashmapStateType: stateTypeTask,
  ReduxActionTask: actionTask,
  ReduxAssignArrayActionTask: actionTask,
  ReduxSetItemByKeyArrayActionTask: actionTask,
  ReduxClearArrayActionTask: actionTask,
  ReduxGetKeyTask: actionTask,
  ReduxGetTask: actionTask,
  ReduxPushArrayActionTask: actionTask,
};
