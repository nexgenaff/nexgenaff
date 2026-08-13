const http = require('http')

async function testTemplatesAPI() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/landing-pages/templates',
      method: 'GET',
    }

    const req = http.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        console.log('Status:', res.statusCode)
        console.log('Response:', data)
        resolve()
      })
    })

    req.on('error', (error) => {
      console.error('Error:', error.message)
      resolve()
    })

    req.end()
  })
}

testTemplatesAPI()
