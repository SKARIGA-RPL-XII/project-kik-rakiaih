using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldReservationSystem.Models
{
    public enum PaymentMethod
    {
        Cash,
        Transfer,
        EWallet
    }

    public enum PaymentStatus
    {
        Pending,
        Confirmed,
        Failed
    }

    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }

        [Required]
        [ForeignKey("Booking")]
        public int BookingId { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }

        [Required]
        public PaymentMethod PaymentMethod { get; set; }

        [MaxLength(255)]
        public string PaymentProofUrl { get; set; }

        [Required]
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

        public DateTime PaymentDate { get; set; } = DateTime.Now;

        public DateTime? ConfirmedAt { get; set; }

        [ForeignKey("ConfirmedByUser")]
        public int? ConfirmedBy { get; set; }

        [MaxLength(500)]
        public string Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation Properties
        public virtual Booking Booking { get; set; }
        public virtual User ConfirmedByUser { get; set; }
    }
}