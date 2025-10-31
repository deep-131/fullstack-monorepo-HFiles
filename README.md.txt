# Medical Record Dashboard

A full-stack web application for managing medical records with secure file upload, user authentication, and profile management.

##  Features

### Frontend (Next.js 14)
- **User Authentication** - Sign up and login with JWT
- **User Profile Management** - Edit personal details and upload profile picture
- **Medical File Management** - Upload, view, download, and delete medical files
- **File Preview** - Modal view for images and PDFs
- **Responsive Design** - Works on all screen sizes
- **Secure API Integration** - Protected routes and API calls

### Backend (.NET Core Web API)
- **JWT Authentication** - Secure user authentication
- **User Management** - CRUD operations for user profiles
- **File Upload System** - Secure file storage and retrieval
- **Database Integration** - MSSQL database with Entity Framework
- **RESTful APIs** - Clean API endpoints

##  Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Hooks

### Backend
- **Framework**: .NET Core Web API
- **Database**: MSSQL
- **ORM**: Entity Framework Core
- **Authentication**: JWT Bearer Tokens
- **File Storage**: Local file system

##  Project Structure

medical-dashboard/
├── backend/
│ ├── Controllers/
│ │ ├── AuthController.cs
│ │ └── MedicalFilesController.cs
│ ├── Models/
│ │ ├── User.cs
│ │ └── MedicalFile.cs
│ ├── Data/
│ │ └── ApplicationDbContext.cs
│ └── Program.cs
├── frontend/
│ ├── app/
│ │ ├── layout.tsx
│ │ ├── page.tsx
│ │ ├── login/
│ │ │ └── page.tsx
│ │ └── signup/
│ │ └── page.tsx
│ ├── components/
│ │ ├── Auth/
│ │ │ ├── Login.tsx
│ │ │ └── SignUp.tsx
│ │ └── Dashboard/
│ │ ├── UserProfile.tsx
│ │ ├── FileUpload.tsx
│ │ └── FileList.tsx
│ ├── lib/
│ │ └── api.ts
│ └── types/
│ └── index.ts
└── README.md


### Prerequisites
- Node.js 18+ 
- .NET 8 SDK
- MSSQL Server
