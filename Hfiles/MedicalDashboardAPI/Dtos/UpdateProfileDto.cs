using System.ComponentModel.DataAnnotations;

namespace MedicalDashboardAPI.Dtos
{
  public class UpdateProfileDto
  {
    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    public string Gender { get; set; }

    [Required]
    public string PhoneNumber { get; set; }
  }
}