A student profile organizer buit using 
![ASP.NET](https://img.shields.io/badge/ASP.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white) for the Backend and 
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) for the frontend.

Steps to run this project :
1. Extract the project into a folder (say dotnet_pro)
2. cd Backend
3. dotnet dev-certs https --trust
// Install Backend dependencies
4. dotnet add package Microsoft.EntityFrameworkCore.SqlServer
5. dotnet add package Microsoft.EntityFrameworkCore.Tools
6. dotnet add package Microsoft.EntityFrameworkCore.Design
7. dotnet add package Microsoft.AspNetCore.JwtBearer
// check Dependencies
8. dotnet list package
// Database connection
9. dotnet restore
10. dotnet clean
11. dotnet build
// creates the file to make schemas without manual table creations -- 
12. dotnet ef migrations add InitialCreate
13. dotnet ef database update
// For tables
14. Open SQLServer Management Studio, connect to "Server=(localdb)\\MSSQLLocalDB"
15. Open Databases > aspdotnetdb > Tables
// Run the Backend server
16. dotnet run
17. Open new terminal
18. cd Frontend
// Run the Frontend
20. npm run dev
21. Open "http://localhost:5173/"
