"use client";

import type { DataProvider } from "react-admin";

async function readJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? String(payload.error)
        : "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

export const adminDataProvider: DataProvider = {
  async getList() {
    const data = await readJson<any[]>("/api/admin/pages");
    return {
      data,
      total: data.length,
    };
  },
  async getOne(_resource, params) {
    const data = await readJson<any>(`/api/admin/pages/${params.id}`);
    return { data };
  },
  async update(_resource, params) {
    const data = await readJson<any>(`/api/admin/pages/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params.data),
    });
    return { data };
  },
  async getMany(_resource, params) {
    const records = await Promise.all(
      params.ids.map((id) => readJson<any>(`/api/admin/pages/${id}`)),
    );
    return { data: records };
  },
  async getManyReference() {
    return { data: [], total: 0 };
  },
  async create() {
    throw new Error("Create is not implemented yet");
  },
  async delete() {
    throw new Error("Delete is not implemented yet");
  },
  async deleteMany() {
    throw new Error("Delete is not implemented yet");
  },
  async updateMany() {
    throw new Error("Bulk update is not implemented yet");
  },
};
