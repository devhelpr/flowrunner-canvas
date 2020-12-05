import { FlowTask } from '@devhelpr/flowrunner';

/*

  - mode:
    - default / empty : just map object
    - array
    - objectsToArray (property is an object where the properties are an index)

  - transformProperty
    - empty : root
    - other.. property name
  - mappings : array of IFieldMap : sourceProperty , targetProperty

  - outputProperty
    
*/

export class TransformTask extends FlowTask {
  public execute(node: any, services: any) {
    let payload = { ...node.payload };
    if (node.outputProperty) { 
      if (node.mode && node.mode == "indexedObjects") {
        let transformObject : any;
        if (node.transformProperty !== undefined && node.transformProperty == "") {
          transformObject = payload;
        } else
        if (node.transformProperty !== undefined && payload[node.transformProperty]) {
          transformObject = payload[node.transformProperty];
        }

        if (transformObject) {
          const result : any[] = [];
          for (var key of Object.keys(transformObject)) {
            if (!isNaN(parseInt(key))) {            
              result.push(this.mapObject(node , transformObject[key]));
            }
          }
          
          if (!!node.clearPayload) {
            payload = {};
          }

          payload[node.outputProperty] = result;
        } 
      } else 
      if (node.mode && node.mode == "array") {
        let list : any;
        if (node.transformProperty !== undefined && node.transformProperty == "") {
          list = payload;
        } else
        if (node.transformProperty !== undefined && payload[node.transformProperty]) {
          list = payload[node.transformProperty];
        }

        if (list) {
          const result : any[] = [];
          list.map((listItem) => {
            result.push(this.mapObject(node , listItem));
          });        
          
          if (!!node.clearPayload) {
            payload = {};
          }

          payload[node.outputProperty] = result;
        } 
      } else 
      if (node.mode && (node.mode == "" || node.mode == "default")) {

        let transformObject : any;
        if (node.transformProperty !== undefined && node.transformProperty == "") {
          transformObject = payload;
        } else
        if (node.transformProperty !== undefined && payload[node.transformProperty]) {
          transformObject = payload[node.transformProperty];
        }
        if (transformObject) {         
          
          if (!!node.clearPayload) {
            payload = {};
          }

          payload[node.outputProperty] = this.mapObject(node , transformObject);
        } 
      }
    }
    return payload;
  }

  public getName() {
    return 'TransformTask';
  }

  private mapObject(node: any, objectToMap) {
    if (node.mappings && node.mappings.length > 0) {
      let newObject : any = {};
      node.mappings.map((fieldMap : any) => {
        if (objectToMap[fieldMap.sourceProperty]) {
          newObject[fieldMap.targetProperty] = objectToMap[fieldMap.sourceProperty];
        } else {
          newObject[fieldMap.targetProperty] = "";
        }
        return true;
      });
      return newObject;
    }
    return objectToMap;
  }
}
