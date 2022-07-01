import { FlowTask } from '@devhelpr/flowrunner';

/*

  - mode:
    - ascending
    - descending

  - sortProperty
  - compareField

*/

export class SortTask extends FlowTask {
  public execute(node: any, services: any) {
    let payload = { ...node.payload };
    if (node.sortProperty && node.mode && node.compareField) {
      if (payload[node.sortProperty]) {
        payload[node.sortProperty] = this.sort(payload[node.sortProperty], node.compareField, node.mode);
      }
    }
    return payload;
  }

  public getName() {
    return 'SortTask';
  }

  private sort = (data, compareField, mode) => {
    return data.sort((a, b) => {
      if (mode == 'ascending') {
        if (a[compareField] < b[compareField]) {
          return -1;
        }
        if (a[compareField] > b[compareField]) {
          return 1;
        }
      } else {
        if (a[compareField] > b[compareField]) {
          return -1;
        }
        if (a[compareField] < b[compareField]) {
          return 1;
        }
      }
      return 0;
    });
  };
}
