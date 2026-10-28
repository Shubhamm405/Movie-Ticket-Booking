function TicketModal({ booking, onClose, onViewBookings }) {
  if (!booking) return null

  const seatText = Array.isArray(booking.selectedSeats) && booking.selectedSeats.length > 0
    ? booking.selectedSeats.join(', ')
    : `${booking.seats} seat(s)`

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden z-10">
        {/* Success header ribbon */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white text-center py-3 px-4 shadow">
          <p className="text-xs uppercase tracking-widest font-black flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Booking Confirmed!
          </p>
        </div>

        {/* Ticket Body */}
        <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-950">
          <div className="border border-dashed border-gray-700 rounded-2xl p-5 bg-gray-950/60 relative">
            {/* Cutout notches */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-900 border-r border-gray-800" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-900 border-l border-gray-800" />

            {/* Movie Title */}
            <div className="text-center pb-4 border-b border-gray-800">
              <span className="text-[10px] uppercase tracking-wider text-red-500 font-bold">
                CineBook Premier Ticket
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                {booking.movie}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Screen 01 &bull; Dolby Atmos Theater
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-gray-800 text-xs">
              <div>
                <span className="text-gray-400 block uppercase font-semibold text-[10px]">Date</span>
                <span className="text-white font-bold text-sm">{booking.date}</span>
              </div>
              <div>
                <span className="text-gray-400 block uppercase font-semibold text-[10px]">Time</span>
                <span className="text-white font-bold text-sm">{booking.time}</span>
              </div>
              <div>
                <span className="text-gray-400 block uppercase font-semibold text-[10px]">Seats</span>
                <span className="text-red-400 font-black text-sm">{seatText}</span>
              </div>
              <div>
                <span className="text-gray-400 block uppercase font-semibold text-[10px]">Total Paid</span>
                <span className="text-emerald-400 font-black text-sm">
                  ${booking.totalPrice ? Number(booking.totalPrice).toFixed(2) : (booking.seats * 12).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Holder and ID */}
            <div className="pt-3 text-[11px] text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Passholder:</span>
                <span className="text-gray-200 font-medium">{booking.userName || 'Valued Guest'}</span>
              </div>
              <div className="flex justify-between">
                <span>Booking ID:</span>
                <span className="text-gray-200 font-mono text-[10px]">{booking._id || 'CBK-' + Date.now().toString().slice(-6)}</span>
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="mt-5 pt-3 border-t border-gray-800/80 flex flex-col items-center">
              <div className="h-9 w-4/5 flex justify-between items-end px-2 bg-gray-900 rounded py-1">
                <span className="w-1 h-full bg-gray-300" />
                <span className="w-0.5 h-4/5 bg-gray-400" />
                <span className="w-1.5 h-full bg-gray-300" />
                <span className="w-0.5 h-3/5 bg-gray-400" />
                <span className="w-2 h-full bg-gray-300" />
                <span className="w-1 h-3/4 bg-gray-400" />
                <span className="w-0.5 h-full bg-gray-300" />
                <span className="w-1.5 h-4/5 bg-gray-400" />
                <span className="w-1 h-full bg-gray-300" />
                <span className="w-2 h-3/4 bg-gray-400" />
                <span className="w-0.5 h-full bg-gray-300" />
                <span className="w-1 h-4/5 bg-gray-400" />
                <span className="w-1.5 h-full bg-gray-300" />
              </div>
              <span className="text-[9px] font-mono tracking-widest text-gray-400 mt-1">
                SCAN AT ENTRY POINT
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-700 hover:bg-gray-800 text-gray-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Ticket
          </button>
          <button
            type="button"
            onClick={() => {
              onClose()
              if (onViewBookings) onViewBookings()
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-1.5"
          >
            <span>View in Bookings</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketModal
