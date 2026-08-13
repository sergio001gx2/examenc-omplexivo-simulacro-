export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export function toArray<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : (data?.results || []);
}
