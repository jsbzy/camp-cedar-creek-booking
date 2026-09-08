import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { getBookingByToken } from "@/lib/data/bookings";
import { getPropertyInfo } from "@/lib/data/property";
import { computeRefund, todayPacific } from "@/lib/cancellation";
import { CancelBookingCard } from "@/components/cancel-booking-card";
import { BookingThread } from "@/components/booking-thread";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending payment",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
  refunded: "Refunded",
};

function fmt(date: string) {
  return format(new Date(date + "T12:00:00"), "EEEE, MMMM d, yyyy");
}

export default async function ManageBookingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const booking = await getBookingByToken(token);
  if (!booking) notFound();

  const info = await getPropertyInfo();
  const today = todayPacific();
  const cancellable =
    (booking.status === "confirmed" || booking.status === "pending") && booking.checkIn > today;
  const refund = computeRefund(booking, info.cancellationTerms, today);
  const isCancelled = booking.status === "cancelled" || booking.status === "refunded";

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm text-muted-foreground">Your booking</p>
      <div className="mt-1 flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold">{booking.siteName}</h1>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            isCancelled ? "text-muted-foreground" : ""
          }`}
        >
          {STATUS_LABELS[booking.status] ?? booking.status}
        </span>
      </div>

      {isCancelled && (
        <div className="mt-6 rounded-lg border bg-secondary p-4 text-sm">
          This booking was cancelled
          {booking.cancelledAt ? ` on ${format(new Date(booking.cancelledAt), "MMMM d, yyyy")}` : ""}.
          {booking.refundAmount != null && booking.refundAmount > 0
            ? ` A refund of $${booking.refundAmount.toFixed(2)} is due back to your original payment method.`
            : " It was not eligible for a refund."}
        </div>
      )}

      <div className="mt-8 rounded-lg border bg-card p-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Confirmation #</span>
            <span className="font-mono text-xs">{booking.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Check-in</span>
            <span>
              {fmt(booking.checkIn)} at {info.checkInTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Check-out</span>
            <span>
              {fmt(booking.checkOut)} at {info.checkOutTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Guests</span>
            <span>{booking.guests}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nights</span>
            <span>{booking.nights}</span>
          </div>

          <Separator className="my-3" />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Guest</span>
            <span>
              {booking.guest.firstName} {booking.guest.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{booking.guest.email}</span>
          </div>

          <Separator className="my-3" />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Lodging</span>
            <span>${booking.subtotal.toFixed(2)}</span>
          </div>
          {booking.addOns.map((a) => (
            <div key={a.addOnId} className="flex justify-between">
              <span className="text-muted-foreground">
                {a.name} ×{a.quantity}
                {a.perNight ? ` × ${booking.nights} nights` : ""}
              </span>
              <span>
                ${(a.unitPrice * a.quantity * (a.perNight ? booking.nights : 1)).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>${booking.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Above cancelling on purpose: most people with a question are not
          trying to cancel, and putting the cancel card first suggests they are. */}
      <BookingThread token={token} />

      {cancellable && (
        <CancelBookingCard
          token={token}
          policyText={info.cancellationPolicy}
          refundAmount={refund.amount}
          refundPercent={refund.percent}
          daysUntilCheckIn={refund.daysUntilCheckIn}
        />
      )}
    </div>
  );
}
