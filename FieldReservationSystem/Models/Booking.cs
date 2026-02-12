using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldReservationSystem.Models
{
    public enum BookingStatus
    {
        Pending,
        Approved,
        Rejected,
        Completed,
        Cancelled
    }

    public class Booking
    {
        [Key]
        public int BookingId { get; set; }

        [Required]
        [ForeignKey("User")]
        public int UserId { get; set; }

        [Required]
        [ForeignKey("Field")]
        public int FieldId { get; set; }

        [Required]
        public DateTime BookingDate { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        [Required]
        public int DurationHours { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalPrice { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal DiscountAmount { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal FinalPrice { get; set; }

        [Required]
        public BookingStatus Status { get; set; } = BookingStatus.Pending;

        [MaxLength(500)]
        public string Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Navigation Properties
        public virtual User User { get; set; }
        public virtual Field Field { get; set; }
        public virtual Payment Payment { get; set; }
    }
}