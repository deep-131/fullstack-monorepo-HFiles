using System.ComponentModel.DataAnnotations;

public class MedicalFile
{
  [Key]
  public int Id { get; set; }

  [Required]
  public string FileType { get; set; }

  [Required]
  public string FileName { get; set; }

  [Required]
  public string StoredFileName { get; set; }

  public string OriginalFileName { get; set; }

  public string FilePath { get; set; }

  public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

  public int UserId { get; set; }
  public User User { get; set; }
}