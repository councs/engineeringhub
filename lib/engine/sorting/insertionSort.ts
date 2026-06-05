import { SortingGenerator } from './types';

export function* insertionSort(arr: number[]): SortingGenerator {
  const n = arr.length;
  let comparisons = 0;
  let accesses = 0;
  const workArray = [...arr];

  for (let i = 1; i < n; i++) {
    let j = i;
    accesses += 1; // Read key element
    
    while (j > 0) {
      comparisons++;
      accesses += 2;
      
      yield {
        array: [...workArray],
        comparing: [j - 1, j],
        swapping: null,
        sorted: [],
        comparisons,
        accesses,
      };

      if (workArray[j - 1] > workArray[j]) {
        accesses += 4;
        [workArray[j], workArray[j - 1]] = [workArray[j - 1], workArray[j]];
        
        yield {
          array: [...workArray],
          comparing: null,
          swapping: [j - 1, j],
          sorted: [],
          comparisons,
          accesses,
        };
        j--;
      } else {
        break;
      }
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
