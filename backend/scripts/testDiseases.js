const axios = require('axios')

// Base API URL
const API_URL = 'http://localhost:4000/api'

// Helper to handle HTTP requests
const makeRequest = async (method, endpoint, data, headers = {}) => {
  try {
    const response = await axios({
      method,
      url: `${API_URL}/${endpoint}`,
      data,
      headers
    })
    console.log(`✅ ${method.toUpperCase()} /${endpoint}:`, response.data)
    return response.data
  } catch (error) {
    console.error(
      `❌ ${method.toUpperCase()} /${endpoint} failed:`,
      error.response?.data || error.message
    )
    throw error
  }
}

// Simulate user actions
const runAuthAndDiseaseFlow = async () => {
  console.log('=== Starting Auth, Disease & Log Flow Simulation ===')

  // Step 1: Register a new user
  console.log('\n1. Registering user...')
  const registerData = {
    name: `TestUser${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'pass123'
  }
  let registerResponse
  try {
    registerResponse = await makeRequest('post', 'auth/register', registerData)
  } catch (error) {
    return
  }

  // Step 2: Login
  console.log('\n2. Logging in...')
  let loginResponse
  try {
    loginResponse = await makeRequest('post', 'auth/login', {
      email: registerData.email,
      password: registerData.password
    })
  } catch (error) {
    return
  }

  const token = loginResponse.token

  // Step 3: Access profile
  console.log('\n3. Accessing profile...')
  try {
    await makeRequest('get', 'auth/profile', null, {
      Authorization: `Bearer ${token}`
    })
  } catch (error) {
    return
  }

  // Step 4: Submit symptoms
  console.log('\n4. Submitting symptoms...')
  let symptomResponse
  try {
    symptomResponse = await makeRequest('post', 'diseases/symptoms', { symptoms: ['fever', 'cough'] }, {
      Authorization: `Bearer ${token}`
    })
  } catch (error) {
    return
  }

  // Step 5: List all diseases
  console.log('\n5. Listing all diseases...')
  try {
    await makeRequest('get', 'diseases')
  } catch (error) {
    return
  }

  // Step 6: Create health log
  console.log('\n6. Creating health log...')
  let logResponse
  try {
    logResponse = await makeRequest('post', 'logs', {
      vitals: { bp: '120/80', temp: 36.6, heartRate: 75 },
      notes: 'Feeling okay, slight cough'
    }, {
      Authorization: `Bearer ${token}`
    })
  } catch (error) {
    return
  }

  // Step 7: Get all logs
  console.log('\n7. Getting all logs...')
  try {
    await makeRequest('get', 'logs', null, {
      Authorization: `Bearer ${token}`
    })
  } catch (error) {
    return
  }

  // Step 8: Get single log
  console.log('\n8. Getting single log...')
  try {
    await makeRequest('get', `logs/${logResponse.log._id}`, null, {
      Authorization: `Bearer ${token}`
    })
  } catch (error) {
    return
  }

// Add this after creating a log
console.log('\n10. Updating user profile...')
await makeRequest('put', 'users/profile', {
  age: 28,
  gender: 'female',
  weight: 60,
  isPregnant: true
}, { Authorization: `Bearer ${token}` })


  // Step 9: Error case - Create log without vitals
  console.log('\n9. Testing invalid log creation...')
  await makeRequest('post', 'logs', { notes: 'No vitals' }, {
    Authorization: `Bearer ${token}`
  }).catch(() => {})

  console.log('\n=== Auth, Disease & Log Flow Simulation Complete ===')
}

// Run the script
runAuthAndDiseaseFlow()