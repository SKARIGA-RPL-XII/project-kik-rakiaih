// Data/ApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using FieldReservationSystem.Models;
using Microsoft.EntityFrameworkCore.Diagnostics;
namespace FieldReservationSystem.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Membership> Memberships { get; set; }
        public DbSet<FieldType> FieldTypes { get; set; }
        public DbSet<Field> Fields { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Payment> Payments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.Username).IsUnique();
                
                entity.HasOne(u => u.Membership)
                    .WithOne(m => m.User)
                    .HasForeignKey<Membership>(m => m.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Membership Configuration
            modelBuilder.Entity<Membership>(entity =>
            {
                entity.HasOne(m => m.User)
                    .WithOne(u => u.Membership)
                    .HasForeignKey<Membership>(m => m.UserId);
            });

            // FieldType Configuration
            modelBuilder.Entity<FieldType>(entity =>
            {
                entity.HasIndex(e => e.TypeName).IsUnique();
            });

            // Field Configuration
            modelBuilder.Entity<Field>(entity =>
            {
                entity.HasOne(f => f.FieldType)
                    .WithMany(ft => ft.Fields)
                    .HasForeignKey(f => f.FieldTypeId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Booking Configuration
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasOne(b => b.User)
                    .WithMany(u => u.Bookings)
                    .HasForeignKey(b => b.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(b => b.Field)
                    .WithMany(f => f.Bookings)
                    .HasForeignKey(b => b.FieldId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(b => b.Payment)
                    .WithOne(p => p.Booking)
                    .HasForeignKey<Payment>(p => p.BookingId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Index untuk cek konflik booking
                entity.HasIndex(e => new { e.FieldId, e.BookingDate, e.StartTime });
            });

            // Payment Configuration
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasOne(p => p.Booking)
                    .WithOne(b => b.Payment)
                    .HasForeignKey<Payment>(p => p.BookingId);

                entity.HasOne(p => p.ConfirmedByUser)
                    .WithMany()
                    .HasForeignKey(p => p.ConfirmedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Seed Initial Data
            SeedData(modelBuilder);
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    base.OnConfiguring(optionsBuilder);
    // Abaikan peringatan perubahan model yang tertunda
    optionsBuilder.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));
}

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed FieldTypes
            modelBuilder.Entity<FieldType>().HasData(
                new FieldType { FieldTypeId = 1, TypeName = "Futsal", Description = "Lapangan Futsal Indoor/Outdoor", CreatedAt = DateTime.UtcNow },
                new FieldType { FieldTypeId = 2, TypeName = "Badminton", Description = "Lapangan Badminton Indoor", CreatedAt = DateTime.UtcNow },
                new FieldType { FieldTypeId = 3, TypeName = "Basket", Description = "Lapangan Basket Indoor/Outdoor", CreatedAt = DateTime.UtcNow }
            );

            // Seed Admin User (password: Admin123!)
            modelBuilder.Entity<User>().HasData(
                new User
                {
                UserId = 1,
                Username = "admin",
                Email = "admin@example.com",
                // Gunakan fungsi hash langsung di sini supaya formatnya pasti cocok dengan library yang kamu pakai
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), 
                FullName = "System Administrator",
                Phone = "081234567890",
                Address = "Malang, Indonesia",
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
        }
            );
        }
    }
    
}