import { SortingGenerator } from './types';

export function* bubbleSort(arr: number[]): SortingGenerator {
  const n = arr.length;
  let comparisons = 0;
  let accesses = 0;
  const sorted: number[] = [];
  const workArray = [...arr];

  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      accesses += 2;
      yield {
        array: [...workArray],
        comparing: [j, j + 1],
        swapping: null,
        sorted: [...sorted],
        comparisons,
        accesses,
      };

      if (workArray[j] > workArray[j + 1]) {
        accesses += 4; // Read two, write two
        [workArray[j], workArray[j + 1]] = [workArray[j + 1], workArray[j]];
        swapped = true;
        
        yield {
          array: [...workArray],
          comparing: null,
          swapping: [j, j + 1],
          sorted: [...sorted],
          comparisons,
          accesses,
        };
      }
    }
    sorted.push(n - i - 1);
    if (!swapped) {
      for (let k = 0; k < n - i; k++) {
        if (!sorted.includes(k)) sorted.push(k);
      }
      break;
    }
  }
  
  yield {
    array: [...workArray],
    comparing: null,
    swapping: null,
    sorted: Array.from({ length: n }, (_, i) => i),
    comparisons,
    accesses,
  };
}
