using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FieldReservationSystem.Data;
using FieldReservationSystem.Models;

namespace FieldReservationSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PaymentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Payments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Payment>>> GetPayments()
        {
            return await _context.Payments.Include(p => p.Booking).ToListAsync();
        }

        // GET: api/Payments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Payment>> GetPayment(int id)
        {
            var payment = await _context.Payments.Include(p => p.Booking).FirstOrDefaultAsync(p => p.PaymentId == id);

            if (payment == null)
                return NotFound();

            return payment;
        }

        // POST: api/Payments
        [HttpPost]
        public async Task<ActionResult<Payment>> CreatePayment(PaymentDto dto)
        {
            var booking = await _context.Bookings.FindAsync(dto.BookingId);
            if (booking == null)
                return NotFound("Booking not found");

            var payment = new Payment
            {
                BookingId = dto.BookingId,
                Amount = booking.FinalPrice,
                PaymentMethod = dto.PaymentMethod,
                PaymentProofUrl = dto.PaymentProofUrl,
                Notes = dto.Notes
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPayment), new { id = payment.PaymentId }, payment);
        }

        // PUT: api/Payments/5/confirm
       [HttpPut("{id}/confirm")]
public async Task<IActionResult> ConfirmPayment(int id, [FromBody] ConfirmPaymentDto dto)
{
    // 1. Cari payment beserta data booking-nya
    var payment = await _context.Payments
        .Include(p => p.Booking)
        .FirstOrDefaultAsync(p => p.PaymentId == id);

    if (payment == null) return NotFound(new { message = "Payment data not found" });

    // 2. Update status Payment
    payment.Status = PaymentStatus.Confirmed;
    payment.ConfirmedAt = DateTime.UtcNow; // Gunakan UtcNow agar konsisten
    payment.ConfirmedBy = dto.ConfirmedBy;

    // 3. Update status Booking menjadi Completed (atau Approved)
    // Biasanya jika sudah bayar, status booking otomatis selesai/sah
    if (payment.Booking != null)
    {
        payment.Booking.Status = BookingStatus.Completed; // Ubah ke Completed karena sudah lunas
        payment.Booking.UpdatedAt = DateTime.UtcNow;
    }

    try
    {
        await _context.SaveChangesAsync();
        return Ok(new { message = "Pembayaran dikonfirmasi dan status booking diperbarui." });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "Gagal memperbarui data", error = ex.Message });
    }
}

        // DELETE: api/Payments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePayment(int id)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null)
                return NotFound();

            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class PaymentDto
    {
        public int BookingId { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public string PaymentProofUrl { get; set; }
        public string Notes { get; set; }
    }

    public class ConfirmPaymentDto
{
    public int ConfirmedBy { get; set; }
}
}