namespace LMS.API.DTOs;

public class AdminDashboardDto
{
    public int TotalStudents { get; set; }
    public int TotalInstructors { get; set; }
    public int TotalCourses { get; set; }
    public int TotalEnrollments { get; set; }
    public int CompletedEnrollments { get; set; }
    public int PendingRegistrationsCount { get; set; }
    public int PendingEnrollmentsCount { get; set; }
    public List<CourseEnrollmentStatDto> PopularCourses { get; set; } = new();
    public List<RecentActivityDto> RecentActivities { get; set; } = new();
}

public class InstructorDashboardDto
{
    public int TotalCoursesTaught { get; set; }
    public int TotalEnrolledStudents { get; set; }
    public int PendingAssignmentsToGrade { get; set; }
    public List<CourseSummaryStatDto> Courses { get; set; } = new();
}

public class StudentDashboardDto
{
    public int EnrolledCoursesCount { get; set; }
    public int InProgressCoursesCount { get; set; }
    public int CompletedCoursesCount { get; set; }
    public int CertificatesEarned { get; set; }
    public List<EnrollmentDto> RecentCourses { get; set; } = new();
}

public class CourseEnrollmentStatDto
{
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int StudentCount { get; set; }
}

public class CourseSummaryStatDto
{
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int StudentCount { get; set; }
    public int LessonCount { get; set; }
    public int QuizCount { get; set; }
    public int AssignmentCount { get; set; }
    public bool IsPublished { get; set; }
}

public class RecentActivityDto
{
    public string Action { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string TargetTitle { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
