using System.ComponentModel.DataAnnotations;

public class User
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public string FullName { get; set; }
    
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    
    [Required]
    public string Gender { get; set; }
    
    [Required]
    public string PhoneNumber { get; set; }
    
    [Required]
    public string Password { get; set; }
    
    public string? ProfileImage { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<MedicalFile> MedicalFiles { get; set; }
}