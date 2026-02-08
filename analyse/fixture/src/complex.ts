export function processData(
  data: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  const results: Array<Record<string, unknown>> = [];

  for (const item of data) {
    if (item.type === "A") {
      if (item.status === "active") {
        if (item.priority === "high") {
          results.push({ ...item, processed: true, tier: 1 });
        } else {
          results.push({ ...item, processed: true, tier: 2 });
        }
      }
    } else if (item.type === "B") {
      for (const [key, value] of Object.entries(item)) {
        if (key !== "type" && typeof value === "number") {
          results.push({ key, value: value * 2 });
        }
      }
    }
  }

  return results;
}
