export interface Ticket {
  _id: string
  status: "active" | "used"
  createdAt: string
  deactivatedAt?: string
}
