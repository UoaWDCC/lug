const enumLabels: Record<string, string> = {
  TFC_PRE_UNI: "TFC / Pre-Uni",
  PHD: "PhD",
};

export function formatEnum(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return (
    enumLabels[value] ??
    value
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

export function formatEnumList(values: readonly string[] | null | undefined) {
  if (!values || values.length === 0) {
    return "—";
  }

  return values.map(formatEnum).join(", ");
}

export function formatBoolean(value: boolean | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }

  return value ? "Yes" : "No";
}

export function truncateText(value: string | null | undefined, maxLength = 50) {
  if (!value) {
    return "—";
  }

  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
}
