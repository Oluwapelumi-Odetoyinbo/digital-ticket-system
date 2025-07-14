"use client"

import { useState } from "react"
import { GenerateTickets } from "./components/GenerateTickets"
import { TicketList } from "./components/TicketList"

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleTicketsGenerated = () => {
    // Trigger a refresh of the ticket list
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Ticket System</h1>
          <p className="text-gray-600">Generate and manage digital tickets with ease</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <GenerateTickets onTicketsGenerated={handleTicketsGenerated} />
          </div>

          <div className="lg:col-span-2">
            {/* Added key prop to force remount on refreshTrigger change */}
            <TicketList key={refreshTrigger} refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </div>
  )
}
