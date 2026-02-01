# Project 786 Backend API

Node.js backend for Project 786 Flutter mobile application.

## Features

- 🚀 RESTful API with Express.js
- 📦 MongoDB Atlas database integration
- 🔐 User authentication endpoints
- ✅ CRUD operations for user management
- 🌐 CORS enabled for mobile apps
- 📝 Comprehensive error handling

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory with your MongoDB connection string:
```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

3. Start the development server:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

## API Endpoints

### Base URL
- Development: `http://localhost:3000`
- Production: `https://your-app-name.onrender.com`

### Endpoints

#### 1. Test API Connection
```
GET /
```
Returns API information and available endpoints.

#### 2. Add New User
```
POST /addUser
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User added successfully",
  "data": {
    "id": "65f1234567890abcdef",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-02-01T10:30:00.000Z"
  }
}
```

#### 3. Get All Users
```
GET /users
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "count": 2,
  "data": [
    {
      "_id": "65f1234567890abcdef",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-02-01T10:30:00.000Z",
      "updatedAt": "2026-02-01T10:30:00.000Z"
    }
  ]
}
```

#### 4. Login (Authenticate by Email)
```
POST /login
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "65f1234567890abcdef",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-02-01T10:30:00.000Z"
  }
}
```

#### 5. Update User
```
PUT /updateUser/:id
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "65f1234567890abcdef",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "updatedAt": "2026-02-01T11:00:00.000Z"
  }
}
```

#### 6. Delete User
```
DELETE /deleteUser/:id
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": "65f1234567890abcdef",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created successfully
- `400` - Bad request (validation error)
- `404` - Resource not found
- `409` - Conflict (duplicate entry)
- `500` - Internal server error

## Deployment to Render.com

1. Push your code to GitHub
2. Create a new Web Service on Render.com
3. Connect your GitHub repository
4. Set the following:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:** Add `MONGODB_URI` with your connection string
5. Deploy!

Your API will be available at: `https://your-app-name.onrender.com`

## Flutter Integration Example

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

// Base URL
final String baseUrl = 'https://your-app-name.onrender.com';

// Add User
Future<void> addUser(String name, String email) async {
  final response = await http.post(
    Uri.parse('$baseUrl/addUser'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'name': name, 'email': email}),
  );
  
  if (response.statusCode == 201) {
    print('User added successfully');
  }
}

// Get All Users
Future<List<dynamic>> getUsers() async {
  final response = await http.get(Uri.parse('$baseUrl/users'));
  
  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return data['data'];
  }
  return [];
}

// Login
Future<Map<String, dynamic>?> login(String email) async {
  final response = await http.post(
    Uri.parse('$baseUrl/login'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'email': email}),
  );
  
  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return data['data'];
  }
  return null;
}
```

## License

ISC

## Author

Project 786 Team
