export const flow = [
  { id: 'Event', x: 350, y: 250, shapeType: 'Html', name: 'Event', taskType: 'Event', EventName: 'Toggle On' },
  { id: 'Event1', x: 362, y: -51, shapeType: 'Html', name: 'Event1', taskType: 'Event', EventName: 'Toggle Off' },
  { name: 'StartState', id: 'StartState', taskType: 'StartState', shapeType: 'Html', x: -250, y: 250 },
  { id: 'State', x: 0, y: 250, shapeType: 'Html', name: 'State', taskType: 'State', StateName: 'Off' },
  { id: 'State1', x: 700, y: 250, shapeType: 'Html', name: 'State1', taskType: 'State', StateName: 'On' },
  {
    name: 'connection-1752d51f-170e-42f6-add2-44d7c680032b',
    taskType: 'connection',
    shapeType: 'Line',
    startshapeid: 'StartState',
    endshapeid: 'State',
    xstart: -186,
    ystart: 284,
    xend: -8,
    yend: 284,
    thumbPosition: 0,
    x: -250,
    y: 250,
  },
  {
    name: 'connection-bf771ddd-d0df-4f06-bc24-94e44f1cc8a7',
    taskType: 'connection',
    shapeType: 'Line',
    startshapeid: 'State',
    endshapeid: 'Event',
    xstart: 200,
    ystart: 286,
    xend: 342,
    yend: 284,
    thumbPosition: 0,
  },
  {
    name: 'connection-354dcda9-388d-464f-8515-834ac7ad50c2',
    taskType: 'connection',
    shapeType: 'Line',
    startshapeid: 'Event',
    endshapeid: 'State1',
    xstart: 550,
    ystart: 286,
    xend: 692,
    yend: 284,
    thumbPosition: 0,
  },
  {
    name: 'connection-b0b657d6-a208-4692-b388-b9849b8768d6',
    taskType: 'connection',
    shapeType: 'Line',
    startshapeid: 'Event1',
    endshapeid: 'State',
    xstart: 462,
    ystart: 37,
    xend: 100,
    yend: 238,
    thumbPosition: 2,
    thumbEndPosition: 1,
    x: 362,
    y: -51,
  },
  {
    name: 'connection-ac452212-519c-4c50-bae3-fd74bb19de5b',
    taskType: 'connection',
    shapeType: 'Line',
    startshapeid: 'State1',
    endshapeid: 'Event1',
    xstart: 900,
    ystart: 286,
    xend: 354,
    yend: -17,
    thumbPosition: 0,
    thumbEndPosition: 1,
  },
  {
    name: 'section_aa97e263-1a57-4a2d-ad9c-1ebd2d16717f',
    id: 'section_aa97e263-1a57-4a2d-ad9c-1ebd2d16717f',
    label: 'Section',
    taskType: 'Annotation',
    shapeType: 'Section',
    isAnnotation: true,
    isStateMachine: true,
    x: -391.37021697666626,
    y: -258.7841359689476,
    width: 1559.0977658138343,
    height: 808.0872813177676,
    nodes: ['Event', 'Event1', 'StartState', 'State', 'State1'],
  },
];
