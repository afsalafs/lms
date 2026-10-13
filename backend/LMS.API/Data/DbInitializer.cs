using LMS.API.Models;
using Microsoft.EntityFrameworkCore;

namespace LMS.API.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Ensure database exists
        await context.Database.EnsureCreatedAsync();

        // Check if already seeded
        if (await context.Users.AnyAsync())
        {
            return;
        }

        // 1. Create Default Users
        var adminPassword    = BCrypt.Net.BCrypt.HashPassword("Password123!");
        var instructorPassword = BCrypt.Net.BCrypt.HashPassword("Password123!");
        var studentPassword  = BCrypt.Net.BCrypt.HashPassword("Password123!");

        var admin = new User
        {
            Name = "System Administrator",
            Email = "admin@eduberg.in",
            PasswordHash = adminPassword,
            Role = "Admin",
            AccountStatus = "Approved",
            Bio = "Head of Platform & Curriculum at EduBerg India",
            AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        };

        var instructor1 = new User
        {
            Name = "Dr. Alan Turing",
            Email = "instructor@eduberg.in",
            PasswordHash = instructorPassword,
            Role = "Instructor",
            AccountStatus = "Approved",
            Bio = "Principal Architect & Lead Software Engineering Instructor with 15+ years of experience.",
            AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
        };

        var instructor2 = new User
        {
            Name = "Sarah Jenkins",
            Email = "sarah.dev@eduberg.in",
            PasswordHash = instructorPassword,
            Role = "Instructor",
            AccountStatus = "Approved",
            Bio = "Cloud Specialist & Database Engineering Consultant at EduBerg India.",
            AvatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
        };

        var student = new User
        {
            Name = "Alex Johnson",
            Email = "student@eduberg.in",
            PasswordHash = studentPassword,
            Role = "Student",
            AccountStatus = "Approved", // Pre-approved demo student
            Bio = "Aspiring Full-Stack Software Engineer & Technology Enthusiast.",
            AvatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
        };

        // A pending student to demonstrate the approval workflow
        var pendingStudent = new User
        {
            Name = "Priya Sharma",
            Email = "priya@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            Role = "Student",
            AccountStatus = "Pending",
            Bio = "Eager to learn full-stack development.",
            AvatarUrl = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80"
        };

        context.Users.AddRange(admin, instructor1, instructor2, student, pendingStudent);
        await context.SaveChangesAsync();

        // 2. Create Courses
        var course1 = new Course
        {
            Title = "Modern Full-Stack Development with React & ASP.NET Core",
            ShortDescription = "Build end-to-end, production-ready enterprise web applications with React 19, ASP.NET Core Web API, and modern databases.",
            Description = "This comprehensive hands-on masterclass takes you from foundational concepts to architecting scalable, secure full-stack applications. You will learn RESTful API architecture, JWT authentication, Entity Framework Core with PostgreSQL & SQLite, responsive React state management, and modern component design.",
            Category = "Web Development",
            Level = "Beginner",
            Price = 0,
            IsPublished = true,
            InstructorId = instructor1.Id,
            ThumbnailUrl = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
            CreatedAt = DateTime.UtcNow.AddDays(-30)
        };

        var course2 = new Course
        {
            Title = "Mastering Database Systems: PostgreSQL & SQLite",
            ShortDescription = "Learn relational schema modeling, indexing, query optimization, and transactions using open-source database engines.",
            Description = "Understand how to design normalized relational schemas, write high-performance SQL queries, implement ACID transactions, and leverage Entity Framework Core migrations seamlessly for both development and production.",
            Category = "Database",
            Level = "Intermediate",
            Price = 49.99m,
            IsPublished = true,
            InstructorId = instructor2.Id,
            ThumbnailUrl = "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80",
            CreatedAt = DateTime.UtcNow.AddDays(-20)
        };

        var course3 = new Course
        {
            Title = "DevOps, IIS & Cloud Deployment Essentials",
            ShortDescription = "Deploy ASP.NET Core and React applications to IIS, Windows Server, Docker containers, and cloud environments.",
            Description = "A practical guide to deploying web applications. Learn IIS site configurations, reverse proxy setups, SSL certificates, CI/CD automation pipelines, and monitoring.",
            Category = "DevOps",
            Level = "Intermediate",
            Price = 29.99m,
            IsPublished = true,
            InstructorId = instructor2.Id,
            ThumbnailUrl = "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=800&auto=format&fit=crop&q=80",
            CreatedAt = DateTime.UtcNow.AddDays(-15)
        };

        var course4 = new Course
        {
            Title = "AI & Machine Learning Fundamentals",
            ShortDescription = "Explore foundational concepts of artificial intelligence, neural networks, supervised learning, and LLMs.",
            Description = "Kickstart your journey into machine learning. Understand data preprocessing, regression models, classification algorithms, and practical generative AI integration.",
            Category = "Data Science",
            Level = "Advanced",
            Price = 0,
            IsPublished = true,
            InstructorId = instructor1.Id,
            ThumbnailUrl = "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };

        context.Courses.AddRange(course1, course2, course3, course4);
        await context.SaveChangesAsync();

        // 3. Create Modules for Course 1 (Full-Stack Dev)
        var c1Module1 = new Module
        {
            CourseId = course1.Id,
            Title = "Module 1: Foundations & Architecture",
            Description = "Understand the modern web development landscape, client-server separation, and REST principles.",
            OrderIndex = 1
        };
        var c1Module2 = new Module
        {
            CourseId = course1.Id,
            Title = "Module 2: Backend with ASP.NET Core",
            Description = "Build production-grade Web APIs using ASP.NET Core, EF Core, and JWT authentication.",
            OrderIndex = 2
        };
        var c1Module3 = new Module
        {
            CourseId = course1.Id,
            Title = "Module 3: Frontend with React",
            Description = "Create dynamic, stateful React applications with hooks, routing, and REST API integration.",
            OrderIndex = 3
        };

        // Modules for Course 2 (Database)
        var c2Module1 = new Module
        {
            CourseId = course2.Id,
            Title = "Module 1: Relational Database Fundamentals",
            Description = "Schema design, normalization rules, and entity-relationship modeling.",
            OrderIndex = 1
        };
        var c2Module2 = new Module
        {
            CourseId = course2.Id,
            Title = "Module 2: Performance & Optimization",
            Description = "Indexing strategies, query plans, and EXPLAIN ANALYZE.",
            OrderIndex = 2
        };

        context.Modules.AddRange(c1Module1, c1Module2, c1Module3, c2Module1, c2Module2);
        await context.SaveChangesAsync();

        // 4. Create Lessons inside each Module
        // Course1 - Module1
        var c1M1L1 = new Lesson
        {
            ModuleId = c1Module1.Id,
            Title = "Introduction to Modern Web Architecture",
            Description = "Overview of Client-Server architecture, RESTful principles, and modern frontend-backend separation.",
            DurationMinutes = 15,
            OrderIndex = 1,
            IsFreePreview = true,
            VideoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ",
            Content = @"# Modern Web Architecture Overview

In modern web development, applications are decoupled into two primary layers:
1. **Frontend (Client Layer)**: Handles presentation, user interface, and user interactions (e.g. React.js, Vue, Angular).
2. **Backend (Server & API Layer)**: Handles business logic, security authentication, data persistence, and external integrations (e.g. ASP.NET Core Web API).

### Key Architectural Benefits
- **Separation of Concerns**: Teams can develop client and server independently.
- **Cross-Platform Reusability**: The same Web API can serve web, mobile (iOS/Android), and third-party systems.
- **Scalability**: Backend APIs can scale horizontally behind load balancers."
        };

        var c1M1L2 = new Lesson
        {
            ModuleId = c1Module1.Id,
            Title = "HTTP, REST Principles & API Design",
            Description = "Deep dive into HTTP verbs, status codes, REST constraints, and best practices.",
            DurationMinutes = 18,
            OrderIndex = 2,
            IsFreePreview = true,
            Content = @"# REST API Design Principles

REST (Representational State Transfer) relies on six constraints:
1. **Stateless** - each request contains all information needed.
2. **Client-Server** - clear separation of concerns.
3. **Cacheable** - responses declare cacheability.
4. **Uniform Interface** - standard HTTP verbs and resource URIs.
5. **Layered System** - clients cannot tell whether they're directly connected to the server.
6. **Code on Demand (optional)** - server can extend client functionality."
        };

        // Course1 - Module2
        var c1M2L1 = new Lesson
        {
            ModuleId = c1Module2.Id,
            Title = "Setting up ASP.NET Core Web API & Entity Framework Core",
            Description = "Creating controllers, configuring dependency injection, and connecting database contexts.",
            DurationMinutes = 25,
            OrderIndex = 1,
            IsFreePreview = true,
            VideoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ",
            Content = @"# ASP.NET Core Web API & EF Core

ASP.NET Core provides blazing fast HTTP throughput, built-in dependency injection, and clean middleware pipelines.

### Dependency Injection Pipeline
In `Program.cs`, we register services such as:
```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { ... });
```

### Entity Framework Core Benefits
- Strongly typed LINQ queries prevent SQL syntax errors.
- Automatic migration tracking.
- Provider agnosticism: effortlessly switch between SQLite, PostgreSQL, and SQL Server."
        };

        var c1M2L2 = new Lesson
        {
            ModuleId = c1Module2.Id,
            Title = "Securing Web APIs with JWT Bearer Authentication",
            Description = "Token creation, claims, role-based authorization, and token verification.",
            DurationMinutes = 30,
            OrderIndex = 2,
            IsFreePreview = false,
            VideoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ",
            Content = @"# JSON Web Token (JWT) Authentication

JWT allows stateless, cryptographically signed authentication.

### Token Structure:
- **Header**: Algorithm & token type (HS256).
- **Payload**: Claims (User Id, Email, Role).
- **Signature**: Verifies token hasn't been altered."
        };

        // Course1 - Module3
        var c1M3L1 = new Lesson
        {
            ModuleId = c1Module3.Id,
            Title = "Building Interactive React Components with Hooks",
            Description = "Managing state with useState, useEffect, context API, and consuming REST APIs.",
            DurationMinutes = 20,
            OrderIndex = 1,
            IsFreePreview = false,
            VideoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ",
            Content = @"# React Component State & Data Fetching

Modern React simplifies state management through hooks.

### Clean Data Fetching Pattern
```javascript
useEffect(() => {
  async function fetchCourses() {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (err) {
      console.error(err);
    }
  }
  fetchCourses();
}, []);
```
Use custom hooks or state containers to share global state like user authentication!"
        };

        // Course2 - Module1
        var c2M1L1 = new Lesson
        {
            ModuleId = c2Module1.Id,
            Title = "Relational Database Modeling & Normalization",
            Description = "Learn 1NF, 2NF, 3NF and how to structure primary and foreign keys.",
            DurationMinutes = 20,
            OrderIndex = 1,
            IsFreePreview = true,
            Content = "# Relational Modeling\n\nDesigning scalable schemas requires solid understanding of entities, cardinality, and constraints."
        };

        // Course2 - Module2
        var c2M2L1 = new Lesson
        {
            ModuleId = c2Module2.Id,
            Title = "PostgreSQL Indexes & Query Optimization",
            Description = "B-Tree, Hash, GIN indexes and analyzing EXPLAIN ANALYZE queries.",
            DurationMinutes = 25,
            OrderIndex = 1,
            IsFreePreview = false,
            Content = "# Indexing Strategies\n\nIndexes dramatically speed up SELECT queries while adding minimal write overhead when properly designed."
        };

        context.Lessons.AddRange(c1M1L1, c1M1L2, c1M2L1, c1M2L2, c1M3L1, c2M1L1, c2M2L1);
        await context.SaveChangesAsync();

        // 5. Create Quiz for Course 1
        var quiz1 = new Quiz
        {
            CourseId = course1.Id,
            Title = "Full-Stack Web Development Knowledge Check",
            Description = "Test your comprehension of Web APIs, React lifecycle, and authentication mechanics.",
            PassingScore = 70,
            TimeLimitMinutes = 10,
            Questions = new List<Question>
            {
                new Question
                {
                    Text = "What does REST stand for in web development?",
                    OptionA = "Representational State Transfer",
                    OptionB = "Remote Execution Standard Tool",
                    OptionC = "Realtime Enterprise Server Template",
                    OptionD = "Relational Entity Synchronous Transfer",
                    CorrectOption = "A",
                    Explanation = "REST stands for Representational State Transfer, an architectural style for networked hypermedia applications.",
                    Points = 25
                },
                new Question
                {
                    Text = "Which HTTP method is most appropriate for updating an existing resource partially?",
                    OptionA = "GET",
                    OptionB = "PATCH",
                    OptionC = "POST",
                    OptionD = "DELETE",
                    CorrectOption = "B",
                    Explanation = "PATCH is used for partial modifications of a resource, whereas PUT typically replaces the entire resource.",
                    Points = 25
                },
                new Question
                {
                    Text = "Where should sensitive secrets like JWT signing keys be stored in production?",
                    OptionA = "Hardcoded in frontend JavaScript files",
                    OptionB = "Public Git repositories",
                    OptionC = "Environment variables or secure Key Vaults",
                    OptionD = "Plaintext in HTML meta tags",
                    CorrectOption = "C",
                    Explanation = "Secrets must always be stored securely in server environment variables or dedicated secret managers.",
                    Points = 25
                },
                new Question
                {
                    Text = "What hook is used in React to handle side-effects like fetching data from an API?",
                    OptionA = "useState",
                    OptionB = "useMemo",
                    OptionC = "useEffect",
                    OptionD = "useRef",
                    CorrectOption = "C",
                    Explanation = "useEffect allows functional React components to perform side-effects such as HTTP requests and event subscriptions.",
                    Points = 25
                }
            }
        };

        context.Quizzes.Add(quiz1);

        // 6. Create Assignment for Course 1
        var assignment1 = new Assignment
        {
            CourseId = course1.Id,
            Title = "Capstone: Build a RESTful Controller & React View",
            Instructions = "Create a custom API controller with CRUD operations in ASP.NET Core, and connect it to a React component with stateful form inputs. Submit your code snippet or GitHub repository link.",
            MaxPoints = 100,
            DueDate = DateTime.UtcNow.AddDays(14)
        };

        context.Assignments.Add(assignment1);
        await context.SaveChangesAsync();

        // 7. Pre-enroll & Approve the demo Student in Course 1 with partial progress
        var enrollment1 = new Enrollment
        {
            StudentId = student.Id,
            CourseId = course1.Id,
            Status = "Approved",
            EnrolledAt = DateTime.UtcNow.AddDays(-7),
            ApprovedAt = DateTime.UtcNow.AddDays(-6),
            ProgressPercentage = 40 // 2 of 5 lessons completed
        };
        context.Enrollments.Add(enrollment1);

        // Pending enrollment to demonstrate approval workflow
        var pendingEnrollment = new Enrollment
        {
            StudentId = pendingStudent.Id,
            CourseId = course1.Id,
            Status = "Pending",
            EnrolledAt = DateTime.UtcNow.AddDays(-1),
            ProgressPercentage = 0
        };
        context.Enrollments.Add(pendingEnrollment);

        await context.SaveChangesAsync();

        var lessonProgress1 = new LessonProgress
        {
            EnrollmentId = enrollment1.Id,
            LessonId = c1M1L1.Id,
            IsCompleted = true,
            CompletedAt = DateTime.UtcNow.AddDays(-5)
        };
        var lessonProgress2 = new LessonProgress
        {
            EnrollmentId = enrollment1.Id,
            LessonId = c1M1L2.Id,
            IsCompleted = true,
            CompletedAt = DateTime.UtcNow.AddDays(-2)
        };
        context.LessonProgresses.AddRange(lessonProgress1, lessonProgress2);

        // 8. Seed sample discussion
        var discussion1 = new Discussion
        {
            CourseId = course1.Id,
            UserId = student.Id,
            Content = "Hi Dr. Turing! Could you explain why SQLite is recommended for local development and PostgreSQL for large multi-node deployments?",
            CreatedAt = DateTime.UtcNow.AddDays(-3)
        };
        context.Discussions.Add(discussion1);
        await context.SaveChangesAsync();

        var reply1 = new Discussion
        {
            CourseId = course1.Id,
            UserId = instructor1.Id,
            ParentId = discussion1.Id,
            Content = "Great question Alex! SQLite is zero-configuration and file-based, making it ideal for fast local testing and embedded setups. PostgreSQL shines in concurrency, advanced indexing, JSONB queries, and high-availability clustered architectures.",
            CreatedAt = DateTime.UtcNow.AddDays(-2)
        };
        context.Discussions.Add(reply1);

        // 9. Seed Live Classes with Zoom integration
        var liveClass1 = new LiveClass
        {
            CourseId = course1.Id,
            InstructorId = instructor1.Id,
            Title = "🔴 Live Zoom Workshop: Full-Stack Architecture & Code Review",
            Description = "Join Dr. Alan Turing live on Zoom for interactive architecture breakdown, code refactoring, and live student Q&A.",
            Platform = "Zoom",
            JoinUrl = "https://zoom.us/j/9876543210?pwd=demopasscode",
            MeetingId = "987 654 3210",
            Passcode = "123456",
            ScheduledStartTime = DateTime.UtcNow.AddMinutes(-10), // Started 10 mins ago -> LIVE NOW!
            DurationMinutes = 60,
            Status = "Live",
            RecordingUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ"
        };

        var liveClass2 = new LiveClass
        {
            CourseId = course2.Id,
            InstructorId = instructor2.Id,
            Title = "Live Office Hours: PostgreSQL Query Tuning & Indexes",
            Description = "Live interactive debugging session discussing index selectivity, EXPLAIN ANALYZE, and optimizing complex JOIN queries.",
            Platform = "Zoom",
            JoinUrl = "https://zoom.us/j/1234567890?pwd=dbpasscode",
            MeetingId = "123 456 7890",
            Passcode = "db2026",
            ScheduledStartTime = DateTime.UtcNow.AddDays(2).Date.AddHours(14),
            DurationMinutes = 45,
            Status = "Scheduled"
        };

        context.LiveClasses.AddRange(liveClass1, liveClass2);
        await context.SaveChangesAsync();
    }
}
