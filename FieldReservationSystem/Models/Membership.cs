using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldReservationSystem.Models
{
    public enum MembershipType
    {
        Regular,
        Premium,
        VIP
    }

    public enum MembershipStatus
    {
        Active,
        Expired
    }

    public class Membership
    {
        [Key]
        public int MembershipId { get; set; }

        [Required]
        [ForeignKey("User")]
        public int UserId { get; set; }

        [Required]
        public MembershipType MembershipType { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal DiscountPercentage { get; set; }

        [Required]
        public MembershipStatus Status { get; set; } = MembershipStatus.Active;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation Properties
        public virtual User User { get; set; }
    }
}