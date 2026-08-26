import { apiFetch } from "./api.js";

export async function createExpense({
  categoryId,
  amount,
  description,
  expenseDate,
}) {
  const response = await apiFetch("/expenses", {
    method: "POST",
    body: JSON.stringify({ categoryId, amount, description, expenseDate }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to create expense");
  }
  return data;
}

export async function listExpenses({
  filter,
  startDate,
  endDate,
  page,
  limit,
} = {}) {
  const queryParams = {};

  if (filter) queryParams.filter = filter;
  if (startDate) queryParams.startDate = startDate;
  if (endDate) queryParams.endDate = endDate;
  if (page) queryParams.page = page;
  if (limit) queryParams.limit = limit;

  const queryString = new URLSearchParams(queryParams).toString();
  const url = queryString ? `/expenses?${queryString}` : "/expenses";

  const response = await apiFetch(url, {
    method: "GET",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch expenses");
  }
  return data;
}

export async function updateExpense(id, updates) {
  const response = await apiFetch(`/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to update expense");
  }
  return data;
}

export async function deleteExpense(id) {
  const response = await apiFetch(`/expenses/${id}`, {
    method: "DELETE",
  });

  if (response.status === 204) {
    return { success: true };
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to delete expense");
  }

  return data;
}
