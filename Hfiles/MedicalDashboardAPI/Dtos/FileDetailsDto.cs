namespace MedicalDashboardAPI.Dtos
{
  public class FileDetailsDto
  {
    public int Id { get; set; }
    public string FileType { get; set; }
    public string FileName { get; set; }
    public string OriginalFileName { get; set; }
    public string StoredFileName { get; set; }
    public string FilePath { get; set; }
    public DateTime UploadedAt { get; set; }
  }
}