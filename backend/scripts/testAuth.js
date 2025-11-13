const axios = require('axios')

// Base API URL
const API_URL = 'http://localhost:5000/api/auth'

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
    email: `intwaribonheur"gmail.com`, // Unique email to avoid duplicates
    password: 'pass123'
  }
  let registerResponse
  try {
    registerResponse = await makeRequest('post', 'register', registerData)
  } catch (error) {
    return // Stop if registration fails
  }
}
 
// Run the script
runAuthFlow()