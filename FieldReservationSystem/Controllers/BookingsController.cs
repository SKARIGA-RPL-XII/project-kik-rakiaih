using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FieldReservationSystem.Data;
using FieldReservationSystem.Models;

namespace FieldReservationSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BookingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Bookings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Booking>>> GetBookings()
        {
            return await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Field)
                .Include(b => b.Payment)
                .OrderByDescending(b => b.CreatedAt) // Terbaru di atas
        .ToListAsync();
                
        }

        // GET: api/Bookings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Booking>> GetBooking(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Field)
                .Include(b => b.Payment)
                
                .FirstOrDefaultAsync(b => b.BookingId == id);

            if (booking == null)
                return NotFound();

            return booking;
        }

        // GET: api/Bookings/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Booking>>> GetUserBookings(int userId)
        {
            return await _context.Bookings
                .Include(b => b.Field)
                .Include(b => b.Payment)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        // POST: api/Bookings
        [HttpPost]
        public async Task<ActionResult<Booking>> CreateBooking(BookingDto dto)
{
    try
    {
        // ✅ Validasi input
        if (dto.EndTime <= dto.StartTime)
        {
            return BadRequest(new { message = "End time must be greater than start time" });
        }

        // ✅ Normalize date to UTC midnight
        var bookingDateUtc = DateTime.SpecifyKind(dto.BookingDate.Date, DateTimeKind.Utc);

        // ✅ Check for time conflict dengan query yang lebih eksplisit
        var hasConflict = await _context.Bookings.AnyAsync(b =>
    b.FieldId == dto.FieldId &&
    b.BookingDate.Date == bookingDateUtc.Date &&
    // Hanya cek status yang mengunci lapangan
    (b.Status == BookingStatus.Pending || 
     b.Status == BookingStatus.Approved || 
     b.Status == BookingStatus.Completed) &&
    // Rumus Overlap: (Mulai_Baru < Selesai_Lama) DAN (Selesai_Baru > Mulai_Lama)
    dto.StartTime < b.EndTime && 
    dto.EndTime > b.StartTime
);

if (hasConflict)
{
    return BadRequest(new { 
        message = "Jadwal Gagal: Lapangan sudah dipesan pada jam tersebut.",
        detail = "Silakan pilih jam mulai atau jam selesai yang berbeda."
    });
}

        // ✅ Validate field exists and is available
        var field = await _context.Fields.FindAsync(dto.FieldId);
        if (field == null)
        {
            return NotFound(new { message = "Field not found" });
        }

        if (field.Status != FieldStatus.Available)
        {
            return BadRequest(new { message = "Field is not available for booking" });
        }

        // ✅ Validate user exists
        var user = await _context.Users
            .Include(u => u.Membership)
            .FirstOrDefaultAsync(u => u.UserId == dto.UserId);
        
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // ✅ Calculate duration (handle proper calculation)
        var startHour = dto.StartTime.Hours + (dto.StartTime.Minutes / 60.0);
        var endHour = dto.EndTime.Hours + (dto.EndTime.Minutes / 60.0);
        var durationHours = (int)Math.Ceiling(endHour - startHour);

        if (durationHours <= 0)
        {
            return BadRequest(new { message = "Invalid duration" });
        }

        // ✅ Calculate price
        var totalPrice = field.PricePerHour * durationHours;
        var discountAmount = 0m;

        // ✅ Apply membership discount if active
        if (user.Membership != null && 
            user.Membership.Status == MembershipStatus.Active &&
            user.Membership.EndDate >= DateTime.UtcNow)
        {
            discountAmount = totalPrice * (user.Membership.DiscountPercentage / 100);
        }

        // ✅ Create booking
        var booking = new Booking
        {
            UserId = dto.UserId,
            FieldId = dto.FieldId,
            BookingDate = bookingDateUtc,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            DurationHours = durationHours,
            TotalPrice = totalPrice,
            DiscountAmount = discountAmount,
            FinalPrice = totalPrice - discountAmount,
            Status = BookingStatus.Pending,
            Notes = dto.Notes ?? "",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        // ✅ Return booking dengan relasi
        var createdBooking = await _context.Bookings
            .Include(b => b.Field)
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.BookingId == booking.BookingId);

        return CreatedAtAction(nameof(GetBooking), new { id = booking.BookingId }, createdBooking);
    }
    catch (Exception ex)
    {
        // ✅ Log error (add logging service if available)
        Console.WriteLine($"Error creating booking: {ex.Message}");
        return StatusCode(500, new { message = "An error occurred while creating the booking" });
    }
}

        // PUT: api/Bookings/5/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateBookingStatus(int id, BookingStatusDto dto)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return NotFound();

            booking.Status = dto.Status;
            booking.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Bookings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return NotFound();

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class BookingDto
    {
        public int UserId { get; set; }
        public int FieldId { get; set; }
        public DateTime BookingDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Notes { get; set; }
    }

    public class BookingStatusDto
    {
        public BookingStatus Status { get; set; }
    }
}