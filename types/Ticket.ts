export interface Ticket {
  id: string
  status: "active" | "used"
  createdAt: string
  deactivatedAt?: string
}
