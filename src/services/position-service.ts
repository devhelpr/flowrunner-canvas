let positions = new Map();
let orgPositions = new Map();

export const clearPositions = () => {
  positions = new Map();
};

export const getPositions = () => {
  return positions;
};

export const setPosition = (nodeName: string, position: any) => {
  //positions[nodeName] = position;
  positions.set(nodeName, position);
};

export const getPosition = (nodeName: string) => {
  //return positions[nodeName];
  return positions.get(nodeName);
};

export const setOrgPosition = (nodeName: string, position: any) => {
  //positions[nodeName] = position;
  orgPositions.set(nodeName, position);
};

export const getOrgPosition = (nodeName: string) => {
  //return positions[nodeName];
  return orgPositions.get(nodeName);
};
