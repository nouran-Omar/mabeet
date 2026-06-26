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

var builder = WebApplication.CreateBuilder(args);

// 1. إعداد الـ CORS مفتوح بالكامل للـ Production لضمان تواصل الفرونت إند بسلاسة
var MyAllowedOrigins = "_myAllowedOrigins";
builder.Services.AddCors(options =>
{
	options.AddPolicy(name: MyAllowedOrigins,
		policy =>
		{
			policy.AllowAnyOrigin()
				  .AllowAnyHeader()
				  .AllowAnyMethod();
		});
});

// 2. إعداد قاعدة البيانات مع دعم منفذ SQL Server صراحة لـ MonsterASP
builder.Services.AddDbContext<AppDbContext>(options =>
{
	// 🟢 الطريقة الصحيحة والآمنة: قراءة الـ Connection String من إعدادات السيرفر فقط
	var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
	options.UseSqlServer(connectionString, sqlOptions => sqlOptions.EnableRetryOnFailure());
});

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

// 5. تسجيل الخدمات والتحكم في الـ Cycles
builder.Services.AddControllers().AddJsonOptions(x =>
	x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IAdminUserService, AdminUserService>();
builder.Services.AddScoped<IAdminAccommodationService, AdminAccommodationService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IAccommodationService, AccommodationService>();

var app = builder.Build();

// 🔥 تشغيل الـ Migrations تلقائياً فور قيام السيرفر أونلاين لإنشاء الجداول
using (var scope = app.Services.CreateScope())
{
	var services = scope.ServiceProvider;
	try
	{
		var context = services.GetRequiredService<AppDbContext>();
		if (context.Database.GetPendingMigrations().Any())
		{
			context.Database.Migrate(); // تم تفعيلها رسمياً
			Console.WriteLine("🚀 Database Migrations applied successfully on production!");
		}
	}
	catch (Exception ex)
	{
		var logger = services.GetRequiredService<ILogger<Program>>();
		logger.LogError(ex, "❌ An error occurred while migrating the database automatically: {Message}", ex.Message);
	}
}

// 🟢 Seed Data (Development only) - تم إعادة الشرط لمنع حذف البيانات في كل مرة
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

// 🌐 تفعيل الـ Swagger في الـ Development والـ Production لرؤية وتجربة الـ Endpoints
app.UseSwagger();
app.UseSwaggerUI(c =>
{
	c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mabeet API V1");
});

// 🛑 تفعيل الملفات الثابتة (الصور والمرفقات داخل wwwroot)
app.UseStaticFiles();

app.UseRouting();

app.UseCors(MyAllowedOrigins);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();