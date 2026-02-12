using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FieldReservationSystem.Models
{
    public class FieldType
    {
        [Key]
        public int FieldTypeId { get; set; }

        [Required]
        [MaxLength(50)]
        public string TypeName { get; set; } // Futsal, Badminton, Basket

        [MaxLength(255)]
        public string Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation Properties
        public virtual ICollection<Field> Fields { get; set; }
    }
}