using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MedicalDashboardAPI.Dtos;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

  public AuthController(ApplicationDbContext context, IConfiguration configuration, IWebHostEnvironment environment)
    {
        _context = context;
        _configuration = configuration;
        _environment = environment;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            return BadRequest("User already exists");

        var user = new User
        {
            FullName = registerDto.FullName,
            Email = registerDto.Email,
            Gender = registerDto.Gender,
            PhoneNumber = registerDto.PhoneNumber,
            Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user);
        return Ok(new { token, user = new { user.Id, user.FullName, user.Email, user.Gender, user.PhoneNumber } });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
            return Unauthorized("Invalid credentials");

        var token = GenerateJwtToken(user);
        return Ok(new { token, user = new { user.Id, user.FullName, user.Email, user.Gender, user.PhoneNumber } });
    }

    private string GenerateJwtToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        var user = await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => new UserProfileDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Gender = u.Gender,
                PhoneNumber = u.PhoneNumber,
                ProfileImage = u.ProfileImage
            })
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound("User not found");

        return Ok(user);
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto updateDto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            return NotFound("User not found");

        // Update allowed fields
        user.Email = updateDto.Email;
        user.Gender = updateDto.Gender;
        user.PhoneNumber = updateDto.PhoneNumber;

        try
        {
            await _context.SaveChangesAsync();
            return Ok(new { message = "Profile updated successfully" });
        }
        catch (DbUpdateException ex)
        {
            return BadRequest("Error updating profile: " + ex.Message);
        }
    }

    [Authorize]
    [HttpPost("profile-image")]
    public async Task<IActionResult> UpdateProfileImage([FromForm] IFormFile profileImage)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            return NotFound("User not found");

        if (profileImage == null || profileImage.Length == 0)
            return BadRequest("No image provided");

        // Validate image type
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
        var fileExtension = Path.GetExtension(profileImage.FileName).ToLower();
        if (!allowedExtensions.Contains(fileExtension))
            return BadRequest("Invalid image type. Allowed: JPG, JPEG, PNG, GIF");

        // Validate file size (2MB limit for profile images)
        if (profileImage.Length > 2 * 1024 * 1024)
            return BadRequest("Image size too large. Maximum 2MB allowed.");

        var uploadsPath = Path.Combine(_environment.ContentRootPath, "profile-images");
        if (!Directory.Exists(uploadsPath))
            Directory.CreateDirectory(uploadsPath);

        // Generate unique filename
        var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(uploadsPath, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await profileImage.CopyToAsync(stream);
        }

        // Delete old profile image if exists
        if (!string.IsNullOrEmpty(user.ProfileImage) && System.IO.File.Exists(user.ProfileImage))
        {
            System.IO.File.Delete(user.ProfileImage);
        }

        user.ProfileImage = filePath;
        await _context.SaveChangesAsync();

        return Ok(new { 
            message = "Profile image updated successfully",
            imagePath = filePath 
        });
    }
}

