import { SortingGenerator, SortStep } from './types';

export function* quickSort(arr: number[]): SortingGenerator {
  const workArray = [...arr];
  let comparisons = 0;
  let accesses = 0;
  const n = workArray.length;
  const sorted: number[] = [];

  function* quickSortHelper(low: number, high: number): Generator<SortStep, void, unknown> {
    if (low < high) {
      const pivotIdxRef = { value: low };
      yield* partition(low, high, pivotIdxRef);
      const p = pivotIdxRef.value;
      sorted.push(p);
      
      yield* quickSortHelper(low, p - 1);
      yield* quickSortHelper(p + 1, high);
    } else if (low === high) {
      sorted.push(low);
    }
  }

  function* partition(low: number, high: number, pivotIdxRef: { value: number }): Generator<SortStep, void, unknown> {
    const pivot = workArray[high];
    accesses += 1;
    let i = low - 1;

    for (let j = low; j < high; j++) {
      comparisons++;
      accesses += 2;
      yield {
        array: [...workArray],
        comparing: [j, high] as [number, number],
        swapping: null,
        sorted: [...sorted],
        comparisons,
        accesses,
      };

      if (workArray[j] < pivot) {
        i++;
        accesses += 4;
        [workArray[i], workArray[j]] = [workArray[j], workArray[i]];
        yield {
          array: [...workArray],
          comparing: null,
          swapping: [i, j] as [number, number],
          sorted: [...sorted],
          comparisons,
          accesses,
        };
      }
    }

    accesses += 4;
    [workArray[i + 1], workArray[high]] = [workArray[high], workArray[i + 1]];
    yield {
      array: [...workArray],
      comparing: null,
      swapping: [i + 1, high] as [number, number],
      sorted: [...sorted],
      comparisons,
      accesses,
    };

    pivotIdxRef.value = i + 1;
  }

  yield* quickSortHelper(0, n - 1);

  // Final yield when fully sorted
  yield {
    array: [...workArray],
    comparing: null,
    swapping: null,
    sorted: Array.from({ length: n }, (_, i) => i),
    comparisons,
    accesses,
  };
}
