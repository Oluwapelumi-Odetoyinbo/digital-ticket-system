"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, RefreshCw, AlertCircle, Search, Filter, SlidersHorizontal } from "lucide-react"
import { ticketAPI } from "../services/api"
import type { Ticket } from "../types/Ticket"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GenerateTickets } from "./GenerateTickets"
import { cn } from "@/lib/utils"

interface TicketListProps {
  refreshTrigger: number
}

type FilterStatus = "all" | "active" | "used"

export const TicketList: React.FC<TicketListProps> = ({ refreshTrigger }) => {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deactivatingIds, setDeactivatingIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")
  const [ticketsPerPage, setTicketsPerPage] = useState(6)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const fetchTickets = async () => {
    try {
      setError(null)
      const fetchedTickets = await ticketAPI.getAllTickets()
      setTickets(fetchedTickets)
    } catch (error) {
      console.error("Error fetching tickets:", error)
      setError("Failed to load tickets. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [refreshTrigger])

  const handleMarkAsUsed = async (ticketId: string) => {
    setDeactivatingIds((prev) => new Set(prev).add(ticketId))

    try {
      await ticketAPI.deactivateTicket(ticketId)
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, status: "used" as const, deactivatedAt: new Date().toISOString() }
            : ticket,
        ),
      )
    } catch (error) {
      console.error("Error deactivating ticket:", error)
      setError("Failed to mark ticket as used. Please try again.")
    } finally {
      setDeactivatingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(ticketId)
        return newSet
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const ticketArray = Array.isArray(tickets) ? tickets : []

  // Apply filters and sorting
  const filteredTickets = ticketArray
    .map((ticket, index) => ({ ...ticket, sequenceNumber: index + 1 }))
    .filter((ticket) => {
      const matchesSearch = searchQuery === "" || ticket.sequenceNumber.toString() === searchQuery
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.sequenceNumber - b.sequenceNumber
      }
      return b.sequenceNumber - a.sequenceNumber
    })

  const activeTickets = ticketArray.filter((t) => t.status === "active").length
  const usedTickets = ticketArray.filter((t) => t.status === "used").length

  // Calculate pagination
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage)
  const startIndex = (currentPage - 1) * ticketsPerPage
  const endIndex = startIndex + ticketsPerPage
  const currentTickets = filteredTickets.slice(startIndex, endIndex)
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, ticketsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading tickets...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ticket Management</CardTitle>
            <CardDescription>
              Total: {tickets.length} | Active: {activeTickets} | Used: {usedTickets}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <GenerateTickets onTicketsGenerated={fetchTickets} />
            <Button variant="outline" size="sm" onClick={fetchTickets} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Search by ticket number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                min={1}
                max={ticketArray.length}
              />
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="shrink-0">
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={(value: FilterStatus) => setStatusFilter(value)}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tickets</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="used">Used Only</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Display Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                  Sort: {sortOrder === "asc" ? "First Generated" : "Last Generated"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Items per page</DropdownMenuLabel>
                {[6, 12, 24, 48].map((number) => (
                  <DropdownMenuItem
                    key={number}
                    onClick={() => setTicketsPerPage(number)}
                    className={cn(ticketsPerPage === number && "bg-accent")}
                  >
                    Show {number} items
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {ticketArray.length === 0 ? (
              <div className="space-y-2">
                <p>No tickets found. Generate some tickets to get started.</p>
                <GenerateTickets onTicketsGenerated={fetchTickets} />
              </div>
            ) : (
              "No matching tickets found."
            )}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Deactivated At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{ticket.sequenceNumber}</TableCell>
                      <TableCell className="font-mono text-sm">{ticket.id.slice(-8)}</TableCell>
                      <TableCell>
                        <Badge variant={ticket.status === "active" ? "default" : "secondary"}>{ticket.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                      <TableCell>{ticket.deactivatedAt ? formatDate(ticket.deactivatedAt) : "-"}</TableCell>
                      <TableCell className="text-right">
                        {ticket.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsUsed(ticket.id)}
                            disabled={deactivatingIds.has(ticket.id)}
                          >
                            {deactivatingIds.has(ticket.id) ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                Marking...
                              </>
                            ) : (
                              "Mark as Used"
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredTickets.length)} of {filteredTickets.length} tickets
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>

                    {/* First page */}
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(1)}
                        isActive={currentPage === 1}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>

                    {/* Left ellipsis */}
                    {currentPage > 3 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    {/* Pages around current page */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        if (totalPages <= 7) return true;
                        if (page === 1 || page === totalPages) return false;
                        return Math.abs(currentPage - page) <= 1;
                      })
                      .map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                    {/* Right ellipsis */}
                    {currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    {/* Last page */}
                    {totalPages > 1 && (
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(totalPages)}
                          isActive={currentPage === totalPages}
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
