// ============================================
// API Test File - For Testing Backend Endpoints
// ============================================

// You can use this file to test your API endpoints using Node.js
// Or use tools like Postman, Thunder Client, or Insomnia

const API_URL = 'http://localhost:3000';

// Test 1: Check Server Status
console.log('\n=== Testing GET / ===');
fetch(`${API_URL}/`)
  .then(res => res.json())
  .then(data => console.log('✅ Server Status:', data))
  .catch(err => console.error('❌ Error:', err));

// Test 2: Add a New User
setTimeout(() => {
  console.log('\n=== Testing POST /addUser ===');
  fetch(`${API_URL}/addUser`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: 'test@example.com'
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log('✅ Add User Response:', data);
      
      // Test 3: Get All Users
      setTimeout(() => {
        console.log('\n=== Testing GET /users ===');
        fetch(`${API_URL}/users`)
          .then(res => res.json())
          .then(data => console.log('✅ Users List:', data))
          .catch(err => console.error('❌ Error:', err));
      }, 1000);
      
      // Test 4: Login
      setTimeout(() => {
        console.log('\n=== Testing POST /login ===');
        fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com' })
        })
          .then(res => res.json())
          .then(data => console.log('✅ Login Response:', data))
          .catch(err => console.error('❌ Error:', err));
      }, 2000);
    })
    .catch(err => console.error('❌ Error:', err));
}, 1000);

// ============================================
// CURL Commands for Testing (Copy & Paste in Terminal)
// ============================================

/*

# 1. Test Server
curl http://localhost:3000/

# 2. Add New User
curl -X POST http://localhost:3000/addUser \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# 3. Get All Users
curl http://localhost:3000/users

# 4. Login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'

# 5. Update User (replace USER_ID with actual ID)
curl -X PUT http://localhost:3000/updateUser/USER_ID \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com"}'

# 6. Delete User (replace USER_ID with actual ID)
curl -X DELETE http://localhost:3000/deleteUser/USER_ID

*/
