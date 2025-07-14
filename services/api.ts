import axios from "axios";

import type { Ticket } from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
  withCredentials: true,
});

// Ensure every backend shape resolves to a Ticket[]
function normalizeTickets(data: unknown): Ticket[] {
  // If the response is an object with a 'data' array, use that
  if (data && typeof data === "object" && "data" in (data as any) && Array.isArray((data as any).data)) {
    return ((data as any).data ?? []) as Ticket[]
  }
  // If it's already an array (e.g., for single ticket responses that might be wrapped)
  if (Array.isArray(data)) return data as Ticket[]
  return []
}

export const ticketAPI = {
  // Create a single ticket
  createTicket: async (): Promise<Ticket> => {
    const res = await api.post("/tickets")
    // Assuming single ticket creation also returns { success: true, data: { id: '...' } }
    return (res.data as any).data ?? res.data
  },

  // Create multiple tickets in parallel
  createMultipleTickets: async (count: number): Promise<Ticket[]> => {
    const promises = Array.from({ length: count }, () => ticketAPI.createTicket())
    return Promise.all(promises)
  },

  // Get all tickets
  getAllTickets: async (): Promise<Ticket[]> => {
    const res = await api.get("/tickets")
    console.log("API raw response:", res.data)
    const normalized = normalizeTickets(res.data)
    console.log("Normalized tickets:", normalized)
    return normalized
  },

  // Deactivate a ticket
  deactivateTicket: async (id: string): Promise<Ticket> => {
    const res = await api.patch(`/tickets/${id}/deactivate`)
    // Assuming deactivation also returns { success: true, data: { id: '...' } }
    return (res.data as any).data ?? res.data
  },
}

