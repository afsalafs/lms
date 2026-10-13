using Microsoft.EntityFrameworkCore;
using LMS.API.Models;

namespace LMS.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Module> Modules => Set<Module>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<LessonProgress> LessonProgresses => Set<LessonProgress>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<QuizSubmission> QuizSubmissions => Set<QuizSubmission>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<AssignmentSubmission> AssignmentSubmissions => Set<AssignmentSubmission>();
    public DbSet<Discussion> Discussions => Set<Discussion>();
    public DbSet<Certificate> Certificates => Set<Certificate>();
    public DbSet<LiveClass> LiveClasses => Set<LiveClass>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Course - Instructor
        modelBuilder.Entity<Course>()
            .HasOne(c => c.Instructor)
            .WithMany(u => u.InstructedCourses)
            .HasForeignKey(c => c.InstructorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Course - Module
        modelBuilder.Entity<Module>()
            .HasOne(m => m.Course)
            .WithMany(c => c.Modules)
            .HasForeignKey(m => m.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Module - Lesson
        modelBuilder.Entity<Lesson>()
            .HasOne(l => l.Module)
            .WithMany(m => m.Lessons)
            .HasForeignKey(l => l.ModuleId)
            .OnDelete(DeleteBehavior.Cascade);

        // Enrollment
        modelBuilder.Entity<Enrollment>()
            .HasOne(e => e.Student)
            .WithMany(u => u.Enrollments)
            .HasForeignKey(e => e.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Enrollment>()
            .HasOne(e => e.Course)
            .WithMany(c => c.Enrollments)
            .HasForeignKey(e => e.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // QuizSubmission
        modelBuilder.Entity<QuizSubmission>()
            .HasOne(qs => qs.Student)
            .WithMany(u => u.QuizSubmissions)
            .HasForeignKey(qs => qs.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<QuizSubmission>()
            .HasOne(qs => qs.Quiz)
            .WithMany(q => q.Submissions)
            .HasForeignKey(qs => qs.QuizId)
            .OnDelete(DeleteBehavior.Cascade);

        // AssignmentSubmission
        modelBuilder.Entity<AssignmentSubmission>()
            .HasOne(asub => asub.Student)
            .WithMany(u => u.AssignmentSubmissions)
            .HasForeignKey(asub => asub.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AssignmentSubmission>()
            .HasOne(asub => asub.Assignment)
            .WithMany(a => a.Submissions)
            .HasForeignKey(asub => asub.AssignmentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Discussion self-referencing relationship for replies
        modelBuilder.Entity<Discussion>()
            .HasOne(d => d.Parent)
            .WithMany(p => p.Replies)
            .HasForeignKey(d => d.ParentId)
            .OnDelete(DeleteBehavior.Cascade);

        // LiveClass
        modelBuilder.Entity<LiveClass>()
            .HasOne(l => l.Course)
            .WithMany(c => c.LiveClasses)
            .HasForeignKey(l => l.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LiveClass>()
            .HasOne(l => l.Instructor)
            .WithMany()
            .HasForeignKey(l => l.InstructorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Unique constraints
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Enrollment>()
            .HasIndex(e => new { e.StudentId, e.CourseId })
            .IsUnique();
    }
}
