namespace MedicalDashboardAPI.Dtos
{
  public class FileUploadDto
  {
    public string FileType { get; set; }
    public string FileName { get; set; }
    public IFormFile File { get; set; }
  }
}


