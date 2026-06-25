using MabeetApi.Data;
using MabeetApi.Entities;
using MabeetApi.Interfaces;
using MabeetApi.Seeding;
using MabeetApi.Services;
using MabeetApi.Services.Admin;
using MabeetApi.Services.Admin.Accommodations;
using MabeetApi.Services.Property;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
// لا نحتاج Microsoft.Extensions.FileProviders هنا

var builder = WebApplication.CreateBuilder(args);

// 1. إعداد الـ CORS (origins من appsettings — Development / Production)
var MyAllowedOrigins = "_myAllowedOrigins";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
	?? new[] { "http://localhost:5216", "https://localhost:7066" };

builder.Services.AddCors(options =>
{
	options.AddPolicy(name: MyAllowedOrigins,
		policy =>
		{
			policy.WithOrigins(allowedOrigins)
				  .AllowAnyHeader()
				  .AllowAnyMethod();
		});
});

// 2. إعداد قاعدة البيانات
builder.Services.AddDbContext<AppDbContext>(options =>
	options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. إعداد Identity
builder.Services.AddIdentity<AppUser, IdentityRole>()
	.AddEntityFrameworkStores<AppDbContext>()
	.AddDefaultTokenProviders();

// 4. إعداد JWT Authentication
builder.Services.AddAuthentication(options =>
{
	options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
	options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
	options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
	options.SaveToken = true;
	options.RequireHttpsMetadata = false;
	options.TokenValidationParameters = new TokenValidationParameters()
	{
		ValidateIssuer = true,
		ValidateAudience = true,
		ValidAudience = builder.Configuration["JWT:ValidAudience"],
		ValidIssuer = builder.Configuration["JWT:ValidIssuer"],
		IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Secret"]))
	};
});

// 5. تسجيل الخدمات
builder.Services.AddControllers().AddJsonOptions(x =>
	x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IAdminUserService, AdminUserService>();
builder.Services.AddScoped<IAdminAccommodationService, AdminAccommodationService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IAccommodationService, AccommodationService>();
builder.Services.AddScoped<IBookingService, BookingService>();

var app = builder.Build();

// Seed Data (Development only — never wipe production data)
if (app.Environment.IsDevelopment())
{
	using (var scope = app.Services.CreateScope())
	{
		var services = scope.ServiceProvider;
		try
		{
			await DataSeeder.SeedData(services);
		}
		catch (Exception ex)
		{
			var logger = services.GetRequiredService<ILogger<Program>>();
			logger.LogError(ex, "❌ Error during data seeding: {Message}", ex.Message);
		}
	}
}

// Swagger
if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

// 🛑 تفعيل الملفات الثابتة (الصور داخل wwwroot)
// هذا السطر وحده كافٍ لقراءة أي ملف داخل wwwroot بما في ذلك uploads/accommodations
app.UseStaticFiles();

app.UseRouting();

app.UseCors(MyAllowedOrigins);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();