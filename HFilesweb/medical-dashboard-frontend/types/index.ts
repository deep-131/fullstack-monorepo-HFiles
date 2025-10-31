export interface User {
  id: number;
  fullName: string;
  email: string;
  gender: string;
  phoneNumber: string;
  profileImage?: string;
}

export interface MedicalFile {
  id: number;
  fileType: string;
  fileName: string;
  storedFileName: string;
  originalFileName: string;
  filePath: string;
  uploadedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}