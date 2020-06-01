import express from 'express'

const app = express()

app.get('/users', (req, res) => {
  console.log("listagem de users")

  res.json([
    'Rafael',
    'Pedro',
    'Claudio'
  ])
})

app.listen(3333)
