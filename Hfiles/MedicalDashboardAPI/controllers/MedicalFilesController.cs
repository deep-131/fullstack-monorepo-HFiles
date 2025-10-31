using System.Security.Claims;
using MedicalDashboardAPI.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MedicalFilesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public MedicalFilesController(ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile([FromForm] FileUploadDto fileUpload)
    {
        if (fileUpload.File == null || fileUpload.File.Length == 0)
            return BadRequest("No file uploaded");

        // Validate file type
        var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png" };
        var fileExtension = Path.GetExtension(fileUpload.File.FileName).ToLower();
        if (!allowedExtensions.Contains(fileExtension))
            return BadRequest("Invalid file type");

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

        // Create uploads directory if it doesn't exist
        var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads");
        if (!Directory.Exists(uploadsPath))
            Directory.CreateDirectory(uploadsPath);

        // Generate unique filename
        var uniqueFileName = Guid.NewGuid().ToString() + fileExtension;
        var filePath = Path.Combine(uploadsPath, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await fileUpload.File.CopyToAsync(stream);
        }

        var medicalFile = new MedicalFile
        {
            FileType = fileUpload.FileType,
            FileName = fileUpload.FileName,
            StoredFileName = uniqueFileName,
            OriginalFileName = fileUpload.File.FileName,
            FilePath = filePath,
            UserId = userId
        };

        _context.MedicalFiles.Add(medicalFile);
        await _context.SaveChangesAsync();

        return Ok(new { message = "File uploaded successfully", file = medicalFile });
    }

    [HttpGet]
    public async Task<IActionResult> GetUserFiles()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        var files = await _context.MedicalFiles
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.UploadedAt)
            .ToListAsync();

        return Ok(files);
    }

  [HttpDelete("{id}")]
  public async Task<IActionResult> DeleteFile(int id)
  {
    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
    var file = await _context.MedicalFiles.FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);

    if (file == null)
      return NotFound("File not found");

    // Delete physical file
    if (System.IO.File.Exists(file.FilePath))
      System.IO.File.Delete(file.FilePath);

    _context.MedicalFiles.Remove(file);
    await _context.SaveChangesAsync();

    return Ok(new { message = "File deleted successfully" });
  }

  [HttpGet("download/{id}")]
  public async Task<IActionResult> DownloadFile(int id)
  {
    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
    var file = await _context.MedicalFiles.FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);

    if (file == null)
      return NotFound("File not found");

    if (!System.IO.File.Exists(file.FilePath))
      return NotFound("File not found on server");

    var fileBytes = await System.IO.File.ReadAllBytesAsync(file.FilePath);
    return File(fileBytes, "application/octet-stream", file.OriginalFileName);
  }

  [HttpGet("{id}")]
  public async Task<IActionResult> GetFileById(int id)
  {
    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
    var file = await _context.MedicalFiles
        .Where(f => f.Id == id && f.UserId == userId)
        .Select(f => new FileDetailsDto
        {
          Id = f.Id,
          FileType = f.FileType,
          FileName = f.FileName,
          OriginalFileName = f.OriginalFileName,
          StoredFileName = f.StoredFileName,
          UploadedAt = f.UploadedAt,
          FilePath = f.FilePath
        })
        .FirstOrDefaultAsync();

    if (file == null)
      return NotFound("File not found");

    return Ok(file);
  }
}