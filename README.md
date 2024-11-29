
# Job Portal Application

The Job Portal Application is an online platform designed to help both job seekers and employers connect seamlessly. Job seekers can search and apply for job opportunities, while employers can post job listings, review applicants, and manage their recruitment process.

## Features

- **User Authentication**: Secure authentication using JWT (JSON Web Tokens) for both job seekers and employers.
- **Job Listings**: Browse through a wide range of job listings fetched from MongoDB.
- **Application Management**: Job seekers can manage their job applications, and employers can view and manage received applications.
- **Role Based Access Control(RBAC)**: Securing routes and resources based on user roles and permissions.

## Technology Used

- **Backend**:
  - Node.js with Express (for API development)

- **Database**:
  - MongoDB

- **Authentication**:
  - JWT (JSON Web Tokens) for secure authentication,Bcrypt(for password hash)

- **Other Tools**:
  - Postman (for API testing)
  - Git/GitHub (for version control)

## Implementation of Authentication and Authorization

#### 1.  Install Required Libraries

- **jsonwebtoken**: This package is used to generate and verify JWT tokens.
- **bcryptjs**: This is used to hash passwords before saving them to the database and to compare hashes during login.

#### 2. Generate JWT Token (Login)
- When the user logs in with their credentials (email and password), server compare their credentials with the stored data in the database. If they match, server generate a JWT token using **sign method** which takes payload, secret key as a argument and using algorithm to generate token and send it to the user.
- **Payload**: This typically contains the user’s unique identifier (id, email, etc.), which can be used later for verification.
- **JWT Secret**: A secret key used to sign the token. This key should be kept private and not exposed publicly.
- **Expiration(optional)**: The expiresIn option sets how long the token will be valid. Once expired, the user will need to reauthenticate.

#### 3. Hashing Passwords
- When a user registers or creates a password, we hash their password before saving it to the database. This ensures that sensitive information is not stored in plain text. Hash method takes two argument(salt, and password)and generate hased password.

#### 4. Authentication Middleware
- Once the JWT token is issued to the user, we need to verify the token on each request to protected routes. We can create middleware to check the validity of the JWT token. Verify method helps to verify token, it provides playlod.

#### 5. Protect Routes
- After creating the authentication middleware, We can protect routes that require authentication. Any route that should only be accessible by authenticated users will use the authenticateToken middleware.

#### 6.  Token Expiry and Refresh
- JWT tokens expire after a certain amount of time, defined during the creation process. If a user’s token expires, they will need to log in again to get a new token.

### Role-Based Access Control (RBAC)

RBAC is a security model that assigns users to specific roles, and each role has predefined permissions to access certain resources. By using this approach, we can easily manage access to various parts of the application based on the user's role.

**1. User Logs In**: The user provides valid credentials (email and password).

- The server authenticates the user and generates a JWT token, which includes the user's role (e.g., admin, user).
  
**2. Client Stores Token**: The client stores the JWT token (in localStorage or sessionStorage).

**3. User Accesses Protected Route** :

- For any request to a protected route, the client sends the JWT token in the Authorization header.
- The server decodes the JWT token and checks if the user’s role matches the required role for the route.

**4. Role Validation**:

- If the user has the correct role (e.g., admin), they are granted access to the resource.
- If the user’s role does not match the required role, the server responds with a 403 Forbidden error.

## How to Run the Project Locally

### Prerequisites:
1. Node.js and npm (or yarn) installed for backend development.
2. MongoDB installed (or use cloud databases).
3. A text editor like VSCode or any other IDE.
4. Git installed to clone the repository.

### Steps to Run:
1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/job-portal.git
   cd job-portal
   ```
2. **Install dependenices for : Backend**:
   ```bash
   npm install
   ```
3. **Set up environment variables (e.g., database credentials, JWT secrets): Create a .env file in the root directory with the necessary variables, such as**:
```bash
MONGO_URI=mongodb://localhost:27017/job-portal
SECRET_KEY=your_jwt_secret
```
4. **Run the application: For backend**:
```bash
npm run dev
```
5. **Access the application**:
   ```bash
   Open your browser and navigate to http://localhost:3000 (or your custom port) to view the Job Portal.
   ```
## How to test the Application

 ### About the Apis
 ***
The Job Portal exposes the following API endpoints:

### Job Seekers Endpoints
--------

* **POST /api/v1/jobseeker/register**: Register a new job seeker account.
* **POST /api/v1/jobseeker/login**: Log in to an existing job seeker account.
* **GET /api/v1/jobseeker/logout**: log out of the existing job seeker account.
* **PUT /api/v1/jobseeker/profile/update**: Update job seeker profile details.

### Employers Endpoints
--------

* **POST /api/v1/recruiter/registraion**: Register a new recruiter account.
* **POST /api/v1/recruiter/login**: Log in to an existing recruiter account.
* **GET /api/v1/recruiter/logout**: log out of the existing recruiter account.
* **PUT /api/v1/recruiter/profile/update**: Update recruiter profile details.
---

### Company Endpoinst (Employer only) :

* **POST /api/v1/company/register** : Register a new Company
* **GET /api/vi/company/get** : Get company details.
* **GET /api/v1/company/get/{id}** : Get company details by company id.
* **PUT /api/v1/company/update/{id}**: Update company details.
* **DELETE /api/v1/company/{id}/remove** : Remove company details completely.

### Job Listings Endpoints:
---------
#### (Employer only)

* **POST /api/v1/job/post**: Creating a job.
* **GET /api/v1/job/alljobs**: Get information about all jobs, created by current recruiter.
* **GET /api/v1/job/job/{id}**: Get  detailed information about a job.
* **DELETE /ai/v1/job/{id}/removejob** : Remove job completely.
  
----
#### (Job Seeker Only)

* **GET /api/v1/job/getjobs**: Get information about all jobs.
* **GET /api/v1/job/job/{id}**: Get  detailed information about a job.
* **GET /api/v1/job/savejob/{id}**: Save job details.
* **GET /api/v1/job/removesavejob/{id}**: Remove jobs from saved section.
* **GET /api/v1/job/savejobs**: Get all jobs details from save section.

### Job Applications Endpoints:
--------
#### (Job Seeker Only)

* **GET /api/v1/application/apply/{id}**: Apply to a job.
* **GET /api/v1/application/get**: See applied jobs.

#### (Employer only)
----------
* **GET /api/v1/application/{id}/applicants**: recruiter can see applide users information.
* **GET /api/v1/application/status/{id}/update**: update the status of a job application.

## Future Updation
The following features are planned for future releases:

* **Job Recommendations**: Personalized job recommendations based on user skills and preferences.
* **Job Alerts**: Real-time notifications for new job postings based on user preferences.
* **Advanced Search Filters**: Allow users to search for jobs by multiple criteria such as salary, experience level, etc.

## Contributing
We welcome contributions to improve this project! Please feel free to fork the repository, make changes, and submit pull requests. If you have any suggestions or found a bug, please open an issue.

```css
This `README.md` provides a complete overview of the Job Portal application, including its purpose, key features, how to run and test the project, details about the APIs, and future 
```
   


