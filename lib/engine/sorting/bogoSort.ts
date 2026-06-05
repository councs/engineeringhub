import { SortingGenerator } from './types';

export function* bogoSort(arr: number[]): SortingGenerator {
  const n = arr.length;
  let comparisons = 0;
  let accesses = 0;
  const workArray = [...arr];

  while (true) {
    let sorted = true;
    
    // Check if sorted
    for (let i = 0; i < n - 1; i++) {
      comparisons++;
      accesses += 2;
      
      yield {
        array: [...workArray],
        comparing: [i, i + 1],
        swapping: null,
        sorted: [],
        comparisons,
        accesses,
      };

      if (workArray[i] > workArray[i + 1]) {
        sorted = false;
        // Optimization for stats: break early as we know it's not sorted
        break; 
      }
    }

    if (sorted) {
      break;
    }

    // Shuffle (Fisher-Yates)
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      
      accesses += 4; // Read two, write two
      [workArray[i], workArray[j]] = [workArray[j], workArray[i]];
      
      yield {
        array: [...workArray],
        comparing: null,
        swapping: [i, j],
        sorted: [],
        comparisons,
        accesses,
      };
    }
  }

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
