using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FieldReservationSystem.Data;
using FieldReservationSystem.Models;

namespace FieldReservationSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MembershipsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MembershipsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Memberships
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Membership>>> GetMemberships()
        {
            return await _context.Memberships.Include(m => m.User).ToListAsync();
        }

        // GET: api/Memberships/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Membership>> GetMembership(int id)
        {
            var membership = await _context.Memberships.Include(m => m.User).FirstOrDefaultAsync(m => m.MembershipId == id);

            if (membership == null)
                return NotFound();

            return membership;
        }

        // POST: api/Memberships
        [HttpPost]
        public async Task<ActionResult<Membership>> CreateMembership(MembershipDto dto)
        {
            var membership = new Membership
            {
                UserId = dto.UserId,
                MembershipType = dto.MembershipType,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                DiscountPercentage = dto.DiscountPercentage
            };

            _context.Memberships.Add(membership);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMembership), new { id = membership.MembershipId }, membership);
        }

        // PUT: api/Memberships/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMembership(int id, Membership membership)
        {
            if (id != membership.MembershipId)
                return BadRequest();

            _context.Entry(membership).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MembershipExists(id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Memberships/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMembership(int id)
        {
            var membership = await _context.Memberships.FindAsync(id);
            if (membership == null)
                return NotFound();

            _context.Memberships.Remove(membership);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MembershipExists(int id)
        {
            return _context.Memberships.Any(e => e.MembershipId == id);
        }
    }

    public class MembershipDto
    {
        public int UserId { get; set; }
        public MembershipType MembershipType { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal DiscountPercentage { get; set; }
    }
}