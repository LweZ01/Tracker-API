import ApiError from "./ApiError.js";

const VALID_FILTERS = ["week", "month", "3months", "custom"];

function toDateOnlyString(date) {
  return date.toISOString().split("T")[0];
}

function getDateRangeForFilter(filterType, customRange = {}) {
  if (!VALID_FILTERS.includes(filterType)) {
    throw new ApiError(
      `Invalid filter type. Must be one of: ${VALID_FILTERS.join(", ")}`,
      400,
    );
  }

  const today = new Date();
  const endDate = toDateOnlyString(today);

  if (filterType === "week") {
    const start = new Date(today);
    start.setDate(start.getDate() - 7);
    return { startDate: toDateOnlyString(start), endDate };
  }

  if (filterType === "month") {
    const start = new Date(today);
    start.setMonth(start.getMonth() - 1);
    return { startDate: toDateOnlyString(start), endDate };
  }

  if (filterType === "3months") {
    const start = new Date(today);
    start.setMonth(start.getMonth() - 3);
    return { startDate: toDateOnlyString(start), endDate };
  }

  // filterType === "custom"
  const { startDate, endDate: customEndDate } = customRange;

  if (!startDate || !customEndDate) {
    throw new ApiError(
      "Custom filter requires both startDate and endDate",
      400,
    );
  }

  const start = new Date(startDate);
  const end = new Date(customEndDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ApiError("Invalid date format. Use YYYY-MM-DD", 400);
  }

  if (start > end) {
    throw new ApiError("startDate must be before or equal to endDate", 400);
  }

  return { startDate: toDateOnlyString(start), endDate: toDateOnlyString(end) };
}

export { getDateRangeForFilter };
