const axios = require('axios')

// Base API URL
const API_URL = 'http://localhost:4000/api/auth'

// Helper to handle HTTP requests and log results
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
const runAuthFlow = async () => {
  console.log('=== Starting Auth Flow Simulation ===')

  // Step 1: Register a new user
  console.log('\n1. Registering user...')
  const registerData = {
    email: `test${Date.now()}@example.com`, // Unique email to avoid duplicates
    password: 'pass123'
  }
  let registerResponse
  try {
    registerResponse = await makeRequest('post', 'register', registerData)
  } catch (error) {
    return // Stop if registration fails
  }

  // Step 2: Login with same credentials
  console.log('\n2. Logging in...')
  let loginResponse
  try {
    loginResponse = await makeRequest('post', 'login', registerData)
  } catch (error) {
    return // Stop if login fails
  }

  // Step 3: Access protected profile endpoint with token
  console.log('\n3. Accessing profile...')
  const token = loginResponse.token
  try {
    await makeRequest('get', 'profile', null, {
      Authorization: `Bearer ${token}`
    })
  } catch (error) {
    return // Stop if profile access fails
  }

  // Step 4: Test error cases
  console.log('\n4. Testing error cases...')
  // 4.1: Try registering same email
  console.log('\n4.1 Trying to register duplicate email...')
  await makeRequest('post', 'register', registerData).catch(() => {})

  // 4.2: Try logging in with wrong password
  console.log('\n4.2 Trying to login with wrong password...')
  await makeRequest('post', 'login', {
    email: registerData.email,
    password: 'wrongpass'
  }).catch(() => {})

  // 4.3: Try accessing profile without token
  console.log('\n4.3 Trying to access profile without token...')
  await makeRequest('get', 'profile').catch(() => {})

  console.log('\n=== Auth Flow Simulation Complete ===')
}

// Run the script
runAuthFlow()