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
        if (endTime <= startTime)
            return BadRequest(new { message = "End time must be greater than start time" });

        // ✅ PERBAIKAN 1: Pastikan tanggal dalam format Date murni tanpa peduli Timezone
        // Kita bandingkan Year, Month, dan Day secara eksplisit agar lebih akurat
        var checkDate = date.Date;

        // 1. Cari ID Lapangan yang sedang "terpakai"
        var bookedFieldIds = await _context.Bookings
            .Where(b => 
                // ✅ PERBAIKAN 2: Gunakan perbandingan Date yang lebih aman
                b.BookingDate.Date == checkDate &&
                (b.Status == BookingStatus.Approved || b.Status == BookingStatus.Pending) &&
                // ✅ PERBAIKAN 3: Pastikan tipe data TimeSpan dibandingkan dengan benar
                b.StartTime < endTime && 
                b.EndTime > startTime
            )
            .Select(b => b.FieldId)
            .Distinct()
            .ToListAsync();

        // Debugging (Cek di terminal dotnet apakah ID lapangan masuk ke sini)
        Console.WriteLine($"Check Date: {checkDate:yyyy-MM-dd}");
        Console.WriteLine($"Booked IDs found: {string.Join(",", bookedFieldIds)}");

        // 2. Ambil lapangan yang tersedia
        var availableFields = await _context.Fields
            .Include(f => f.FieldType)
            .Where(f => 
                f.Status == FieldStatus.Available && 
                !bookedFieldIds.Contains(f.FieldId)
            )
            .OrderBy(f => f.FieldName)
            .ToListAsync();

        return Ok(availableFields);
    }
    catch (Exception ex)
    {
        // Debug error detail di console backend
        Console.WriteLine($"Error in GetAvailableFields: {ex.Message}");
        return StatusCode(500, new { message = "Server Error", detail = ex.Message });
    }
}

        private bool FieldExists(int id)
        {
            return _context.Fields.Any(e => e.FieldId == id);
        }
    }
}