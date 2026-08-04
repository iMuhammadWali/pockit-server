export default function formatList(items) {
  if (items.length === 1) {
    return `${items[0]} is required.`;
  }

  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]} are required.`;
}
