export * from './types';
export * from './bubbleSort';
export * from './mergeSort';
export * from './bogoSort';
export * from './selectionSort';
export * from './insertionSort';
export * from './quickSort';

import { SortingAlgorithm } from './types';
import { bubbleSort } from './bubbleSort';
import { mergeSort } from './mergeSort';
import { bogoSort } from './bogoSort';
import { selectionSort } from './selectionSort';
import { insertionSort } from './insertionSort';
import { quickSort } from './quickSort';

export const algorithms: Record<string, SortingAlgorithm> = {
  'Bubble Sort': bubbleSort,
  'Merge Sort': mergeSort,
  'Quick Sort': quickSort,
  'Selection Sort': selectionSort,
  'Insertion Sort': insertionSort,
  'Bogo Sort': bogoSort,
};


