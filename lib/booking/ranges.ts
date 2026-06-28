export type TimeRange = {
  start: Date;
  end: Date;
};

export function createRange(start: Date, end: Date): TimeRange {
  if (end <= start) {
    throw new Error('Range end must be after start.');
  }

  return { start, end };
}

export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

export function rangeContains(range: TimeRange, inner: TimeRange): boolean {
  return range.start <= inner.start && inner.end <= range.end;
}

export function rangeDurationMinutes(range: TimeRange): number {
  return (range.end.getTime() - range.start.getTime()) / 60_000;
}

export function sortRanges(ranges: TimeRange[]): TimeRange[] {
  return [...ranges].sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function mergeOverlappingRanges(ranges: TimeRange[]): TimeRange[] {
  if (ranges.length === 0) {
    return [];
  }

  const sorted = sortRanges(ranges);
  const merged: TimeRange[] = [{ ...sorted[0] }];

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index];
    const last = merged[merged.length - 1];

    if (current.start <= last.end) {
      if (current.end > last.end) {
        last.end = current.end;
      }
      continue;
    }

    merged.push({ ...current });
  }

  return merged;
}

export function clipRangeToBounds(
  range: TimeRange,
  bounds: TimeRange,
): TimeRange | null {
  const start = range.start > bounds.start ? range.start : bounds.start;
  const end = range.end < bounds.end ? range.end : bounds.end;

  if (end <= start) {
    return null;
  }

  return { start, end };
}

export function subtractRange(
  windows: TimeRange[],
  removal: TimeRange,
): TimeRange[] {
  const result: TimeRange[] = [];

  for (const window of windows) {
    if (!rangesOverlap(window, removal)) {
      result.push({ ...window });
      continue;
    }

    if (removal.start > window.start) {
      result.push({
        start: window.start,
        end: removal.start,
      });
    }

    if (removal.end < window.end) {
      result.push({
        start: removal.end,
        end: window.end,
      });
    }
  }

  return mergeOverlappingRanges(
    result.filter((range) => range.end > range.start),
  );
}

export function subtractRanges(
  windows: TimeRange[],
  removals: TimeRange[],
): TimeRange[] {
  return removals.reduce(
    (current, removal) => subtractRange(current, removal),
    windows,
  );
}

export function hasBlockingOverlap(
  candidate: TimeRange,
  blockers: TimeRange[],
): boolean {
  return blockers.some((blocker) => rangesOverlap(candidate, blocker));
}
