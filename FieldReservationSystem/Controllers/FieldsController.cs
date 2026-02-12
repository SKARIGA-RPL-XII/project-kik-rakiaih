using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FieldReservationSystem.Data;
using FieldReservationSystem.Models;

namespace FieldReservationSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FieldsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FieldsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Fields
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Field>>> GetFields()
        {
            return await _context.Fields.Include(f => f.FieldType).ToListAsync();
        }

        // GET: api/Fields/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Field>> GetField(int id)
        {
            var field = await _context.Fields.Include(f => f.FieldType).FirstOrDefaultAsync(f => f.FieldId == id);

            if (field == null)
                return NotFound();

            return field;
        }

        // POST: api/Fields
        [HttpPost]
        public async Task<ActionResult<Field>> CreateField(Field field)
        {
            _context.Fields.Add(field);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetField), new { id = field.FieldId }, field);
        }

        // PUT: api/Fields/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateField(int id, Field field)
        {
            if (id != field.FieldId)
                return BadRequest();

            field.UpdatedAt = DateTime.Now;
            _context.Entry(field).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FieldExists(id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Fields/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteField(int id)
        {
            var field = await _context.Fields.FindAsync(id);
            if (field == null)
                return NotFound();

            _context.Fields.Remove(field);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Fields/available?date=2024-01-01&startTime=10:00&endTime=12:00
        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<Field>>> GetAvailableFields(
    [FromQuery] DateTime date, 
    [FromQuery] TimeSpan startTime, 
    [FromQuery] TimeSpan endTime)
{
    try
    {
        // ✅ Validasi input
        if (endTime <= startTime)
        {
            return BadRequest(new { message = "End time must be greater than start time" });
        }

        // ✅ Validasi tanggal tidak boleh di masa lalu
        if (date.Date < DateTime.Today)
        {
            return BadRequest(new { message = "Cannot book for past dates" });
        }

        // ✅ Normalize date to UTC midnight
        var utcDate = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);

        Console.WriteLine($"🔍 Checking availability for date: {utcDate:yyyy-MM-dd}, time: {startTime}-{endTime}");

        // ✅ Get field IDs that are booked and conflict with requested time
        var bookedFieldIds = await _context.Bookings
            .Where(b => 
                b.BookingDate.Date == utcDate.Date &&
                (b.Status == BookingStatus.Pending || 
                 b.Status == BookingStatus.Approved || 
                 b.Status == BookingStatus.Completed) &&
                // Time overlap check
                b.StartTime < endTime && 
                b.EndTime > startTime
            )
            .Select(b => b.FieldId)
            .Distinct()
            .ToListAsync();

        Console.WriteLine($"📋 Booked field IDs: {string.Join(", ", bookedFieldIds)}");

        // ✅ Get available fields (not booked at requested time)
        var availableFields = await _context.Fields
            .Include(f => f.FieldType)
            .Where(f => 
                f.Status == FieldStatus.Available && 
                !bookedFieldIds.Contains(f.FieldId)
            )
            .OrderBy(f => f.FieldName)
            .ToListAsync();

        Console.WriteLine($"✅ Available fields count: {availableFields.Count}");

        return Ok(availableFields);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Error in GetAvailableFields: {ex.Message}");
        return StatusCode(500, new { message = "An error occurred while fetching available fields" });
    }
}

        private bool FieldExists(int id)
        {
            return _context.Fields.Any(e => e.FieldId == id);
        }
    }
}