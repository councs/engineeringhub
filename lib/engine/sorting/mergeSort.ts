import { SortingGenerator } from './types';

export function* mergeSort(arr: number[]): SortingGenerator {
  let workArray = [...arr];
  let comparisons = 0;
  let accesses = 0;
  
  function* mergeSortHelper(start: number, end: number): SortingGenerator {
    if (end - start <= 1) return;

    const mid = Math.floor((start + end) / 2);
    
    yield* mergeSortHelper(start, mid);
    yield* mergeSortHelper(mid, end);

    let left = start;
    let right = mid;
    const temp: number[] = [];

    while (left < mid && right < end) {
      comparisons++;
      accesses += 2;
      yield {
        array: [...workArray],
        comparing: [left, right],
        swapping: null,
        sorted: [],
        comparisons,
        accesses,
      };

      if (workArray[left] <= workArray[right]) {
        accesses++;
        temp.push(workArray[left++]);
      } else {
        accesses++;
        temp.push(workArray[right++]);
      }
    }

    while (left < mid) {
      accesses++;
      temp.push(workArray[left++]);
    }

    while (right < end) {
      accesses++;
      temp.push(workArray[right++]);
    }

    for (let i = 0; i < temp.length; i++) {
      accesses += 2;
      workArray[start + i] = temp[i];
      yield {
        array: [...workArray],
        comparing: null,
        swapping: [start + i, start + i],
        sorted: [],
        comparisons,
        accesses,
      };
    }
  }

  yield* mergeSortHelper(0, workArray.length);
  
  yield {
    array: [...workArray],
    comparing: null,
    swapping: null,
    sorted: Array.from({ length: workArray.length }, (_, i) => i),
    comparisons,
    accesses,
  };
}
