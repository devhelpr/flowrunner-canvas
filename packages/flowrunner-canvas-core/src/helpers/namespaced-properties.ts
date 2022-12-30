export const getPropertyByNamespacedName = (propertyName: string, payload: any) => {
  const propertyPath = propertyName.split('.');
  if (propertyPath && propertyPath.length > 1) {
    let result: any = undefined;
    let payloadHelper: any = undefined;
    propertyPath.forEach((pathPart, index) => {
      if (index === 0) {
        payloadHelper = payload[pathPart];
      } else {
        if (payloadHelper) {
          payloadHelper = payloadHelper[pathPart];
        }
      }
      if (index === propertyPath.length - 1) {
        result = payloadHelper;
      }
    });

    return result;
  }
  return payload[propertyName];
};
