import { SortingGenerator } from './types';

export function* selectionSort(arr: number[]): SortingGenerator {
  const n = arr.length;
  let comparisons = 0;
  let accesses = 0;
  const sorted: number[] = [];
  const workArray = [...arr];

  for (let i = 0; i < n; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      accesses += 2;
      
      yield {
        array: [...workArray],
        comparing: [minIdx, j],
        swapping: null,
        sorted: [...sorted],
        comparisons,
        accesses,
      };

      if (workArray[j] < workArray[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      accesses += 4;
      [workArray[i], workArray[minIdx]] = [workArray[minIdx], workArray[i]];
      
      yield {
        array: [...workArray],
        comparing: null,
        swapping: [i, minIdx],
        sorted: [...sorted],
        comparisons,
        accesses,
      };
    }
    sorted.push(i);
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
