"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Ticket, Plus } from "lucide-react"
import { ticketAPI } from "../services/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface GenerateTicketsProps {
  onTicketsGenerated: () => void
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

export const GenerateTickets: React.FC<GenerateTicketsProps> = ({ 
  onTicketsGenerated,
  variant = "default",
  size = "default"
}) => {
  const [ticketCount, setTicketCount] = useState<string>("10")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleGenerateTickets = async () => {
    const count = Number.parseInt(ticketCount)

    // Validation
    if (!ticketCount || isNaN(count) || count <= 0 || count > 1000) {
      setMessage({
        type: "error",
        text: "Please enter a valid number between 1 and 1000",
      })
      return
    }

    setShowConfirmDialog(true)
  }

  const confirmGeneration = async () => {
    const count = Number.parseInt(ticketCount)
    setShowConfirmDialog(false)
    setIsLoading(true)
    setMessage(null)

    try {
      await ticketAPI.createMultipleTickets(count)
      setMessage({
        type: "success",
        text: `Successfully generated ${count} ticket${count > 1 ? "s" : ""}!`,
      })
      setTicketCount("10")
      onTicketsGenerated()
      // Close the modal after a short delay to show the success message
      setTimeout(() => {
        setIsModalOpen(false)
        setMessage(null)
      }, 2000)
    } catch (error) {
      console.error("Error generating tickets:", error)
      setMessage({
        type: "error",
        text: "Failed to generate tickets. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleGenerateTickets()
    }
  }

  const handleSliderChange = (value: number[]) => {
    setTicketCount(value[0].toString())
  }

  const presetValues = [10, 25, 50, 100]

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button variant={variant} size={size}>
            {size === "icon" ? (
              <Plus className="h-4 w-4" />
            ) : (
              <>
                <Ticket className="mr-2 h-4 w-4" />
                Generate Tickets
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Tickets</DialogTitle>
            <DialogDescription>Enter the number of tickets you want to generate</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="ticket-count">Number of Tickets</Label>
                  <Input
                    id="ticket-count"
                    type="number"
                    value={ticketCount}
                    onChange={(e) => setTicketCount(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    min="1"
                    max="1000"
                    className="w-24 text-right"
                  />
                </div>
                <Slider
                  value={[Number(ticketCount)]}
                  onValueChange={handleSliderChange}
                  min={1}
                  max={100}
                  step={1}
                  className="py-2"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {presetValues.map((value) => (
                  <Button
                    key={value}
                    variant="outline"
                    size="sm"
                    onClick={() => setTicketCount(value.toString())}
                    className={cn(
                      "flex-1",
                      Number(ticketCount) === value && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {value} tickets
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={handleGenerateTickets} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Tickets...
                </>
              ) : (
                "Generate Tickets"
              )}
            </Button>

            {message && (
              <Alert variant={message.type === "error" ? "destructive" : "default"}>
                {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to generate {ticketCount} ticket{Number(ticketCount) !== 1 ? "s" : ""}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmGeneration}>Generate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
