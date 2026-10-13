using System.Text;
using LMS.API.Data;
using LMS.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure Database (SQLite by default, or PostgreSQL if configured)
var provider = builder.Configuration["DatabaseProvider"] ?? "SQLite";
if (provider.Equals("PostgreSQL", StringComparison.OrdinalIgnoreCase))
{
    var pgConn = builder.Configuration.GetConnectionString("PostgreSQL");
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(pgConn));
}
else
{
    var sqliteConn = builder.Configuration.GetConnectionString("SQLite") ?? "Data Source=lms.db";
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlite(sqliteConn));
}

// 2. Register Application Services
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddHttpClient<IZoomService, ZoomService>();

// 3. Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "LMS_UltraSecure_JWT_Key_2026_EnterpriseGradeSecretValue!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "LMS.API";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "LMS.Client";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 4. Configure CORS for frontend access
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

builder.Services.AddEndpointsApiExplorer();

// 5. Configure Swagger with JWT Auth UI
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "EduBerg India API",
        Version = "v1",
        Description = "EduBerg India Learning Management System RESTful Web API with Zoom & Admin Approvals"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 6. Auto-Migrate / Seed Database on Startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DbInitializer.SeedAsync(db);
}

// 7. Configure Middleware Pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "EduBerg India API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");

// Serve static frontend files if built into wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Fallback for Single Page Application client-side routing
app.MapFallbackToFile("index.html");

app.Run();
