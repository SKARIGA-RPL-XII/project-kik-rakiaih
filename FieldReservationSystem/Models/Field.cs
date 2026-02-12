using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
namespace FieldReservationSystem.Models
{
    public enum FieldStatus
    {
        Available,
        Maintenance,
        Unavailable
    }

    public class Field
    {
        [Key]
        public int FieldId { get; set; }

        [Required]
        [ForeignKey("FieldType")]
        public int FieldTypeId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FieldName { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal PricePerHour { get; set; }

        [Required]
        public FieldStatus Status { get; set; } = FieldStatus.Available;

        [MaxLength(255)]
        public string ImageUrl { get; set; }

        // Ubah dari DateTime.Now menjadi DateTime.UtcNow
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [JsonIgnore] 
public virtual FieldType? FieldType { get; set; }
        [JsonIgnore]
public virtual ICollection<Booking>? Bookings { get; set; } = new List<Booking>();
    }
}