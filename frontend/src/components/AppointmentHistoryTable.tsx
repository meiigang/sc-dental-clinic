import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function AppointmentHistoryTable() {
  return (
    <Table className="rounded-2xl mt-8">
      <TableHeader className="bg-blue-primary rounded-2xl">
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[200px] text-white">Date</TableHead>
          <TableHead className="text-white">Time</TableHead>
          <TableHead className="text-white">Service(s)</TableHead>
          <TableHead className="text-white">Price</TableHead>
          <TableHead className="text-white">Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="bg-background hover:bg-blue-accent">
          <TableCell>September 16, 2025</TableCell>
          <TableCell>10:00 AM</TableCell>
          <TableCell>Teeth Cleaning</TableCell>
          <TableCell>₱500</TableCell>
          <TableCell>notes</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}