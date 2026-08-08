using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Admin> Admins { get; set; }
    public DbSet<Student> Students { get; set; }
    public DbSet<Certificate> Certificates { get; set; }
    public DbSet<Achievement> Achievements { get; set; }
    public DbSet<CodingProfile> CodingProfiles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Admin>()
            .HasIndex(a => a.Username)
            .IsUnique();

        base.OnModelCreating(modelBuilder);
    }
}