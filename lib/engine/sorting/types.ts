export interface SortStep {
  array: number[];
  comparing: [number, number] | null;
  swapping: [number, number] | null;
  sorted: number[];
  comparisons: number;
  accesses: number;
}

export type SortingGenerator = Generator<SortStep, void, unknown>;
export type SortingAlgorithm = (arr: number[]) => SortingGenerator;
