using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend_manajemen_lapangan.Migrations
{
    /// <inheritdoc />
    public partial class ResetAdminPassword : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FieldTypes",
                keyColumn: "FieldTypeId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 3, 15, 0, 35, 443, DateTimeKind.Utc).AddTicks(5595));

            migrationBuilder.UpdateData(
                table: "FieldTypes",
                keyColumn: "FieldTypeId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 3, 15, 0, 35, 443, DateTimeKind.Utc).AddTicks(5768));

            migrationBuilder.UpdateData(
                table: "FieldTypes",
                keyColumn: "FieldTypeId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 3, 15, 0, 35, 443, DateTimeKind.Utc).AddTicks(5770));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 1,
                columns: new[] { "CreatedAt", "Email", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 3, 15, 0, 35, 654, DateTimeKind.Utc).AddTicks(2817), "admin@example.com", "$2a$11$2T62TXucTBstpnUi5p.5mO8RPpC2pyc5RSbb2TMTpMXldXVtW4com", new DateTime(2026, 2, 3, 15, 0, 35, 654, DateTimeKind.Utc).AddTicks(3001) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FieldTypes",
                keyColumn: "FieldTypeId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 2, 18, 4, 53, 490, DateTimeKind.Utc).AddTicks(9023));

            migrationBuilder.UpdateData(
                table: "FieldTypes",
                keyColumn: "FieldTypeId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 2, 18, 4, 53, 490, DateTimeKind.Utc).AddTicks(9184));

            migrationBuilder.UpdateData(
                table: "FieldTypes",
                keyColumn: "FieldTypeId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 2, 18, 4, 53, 490, DateTimeKind.Utc).AddTicks(9185));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 1,
                columns: new[] { "CreatedAt", "Email", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 2, 18, 4, 53, 491, DateTimeKind.Utc).AddTicks(4441), "admin@fieldreservation.com", "$2a$11$XdKXn8z.qZJ3WZK7Q6qDSOqxE.LuJv.xYxBj6vKcR3kqY8JgLxGGi", new DateTime(2026, 2, 2, 18, 4, 53, 491, DateTimeKind.Utc).AddTicks(4555) });
        }
    }
}
