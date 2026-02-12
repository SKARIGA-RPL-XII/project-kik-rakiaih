using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
namespace FieldReservationSystem.Models
{
    public enum UserRole
    {
        Customer,
        Admin
    }

    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; }

        [Required]
        [MaxLength(20)]
        public string Phone { get; set; }

        [MaxLength(255)]
        public string Address { get; set; }

        [Required]
        public UserRole Role { get; set; } = UserRole.Customer;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Navigation Properties
       [JsonIgnore] // Tambahkan ini agar saat Booking diambil, daftar booking user tidak ikut diproses
    public virtual ICollection<Booking> Bookings { get; set; }
        public virtual Membership Membership { get; set; }
    }
}