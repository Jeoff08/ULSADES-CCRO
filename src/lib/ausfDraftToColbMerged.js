/**
 * Map AUSF print draft fields to the same merged shape used by Field Position / COLB overlays.
 */

function parseDateOfBirth(dateStr) {
  if (!dateStr || typeof dateStr !== "string") {
    return { day: "", month: "", year: "" };
  }
  const trimmed = dateStr.trim();
  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(trimmed);
  if (isoMatch) {
    return { day: isoMatch[3], month: isoMatch[2], year: isoMatch[1] };
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return { day: "", month: "", year: "" };
  }
  return {
    day: String(date.getDate()),
    month: String(date.getMonth() + 1),
    year: String(date.getFullYear()),
  };
}

/**
 * @param {Record<string, unknown>} data AUSF draft from storage / print
 * @returns {Record<string, unknown>}
 */
export function ausfDraftToColbMerged(data) {
  if (!data || typeof data !== "object") return {};
  const birth = data.dateOfBirth
    ? parseDateOfBirth(String(data.dateOfBirth))
    : {};
  return {
    ...data,
    remarks: data.remarks ?? "",
  };
}
