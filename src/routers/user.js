 const express = require('express')
 const User = require('../models/user')
 const auth = require('../middleware/auth')
 const jws = require('jsonwebtoken')

 const router = new express.Router()

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try{
      await user.save();
      const token = await user.generateAuthToken()
      res.status(201).send({user, token})
    }catch(e){
      res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
  try {
      const user = await User.findByCredentials(req.body.email, req.body.password)
      const token = await user.generateAuthToken()
      res.send({ user, token })
  } catch (e) {
      res.status(400).send()
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try{
    req.user.tokens = req.user.tokens.filter(a => a.token !== req.token)
    await req.user.save()
    res.send()
  }catch(e){
    res.status(500).send()
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try{
    req.user.tokens = []
    await req.user.save()
    res.send()
  }catch(e){
    res.status(500).send()
  }
})

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOperarion = updates.every((update) => allowedUpdates.includes(update))
  if(!isValidOperarion) return res.status(404).send({error: "Invalid updates"})
  try{
    const user = req.user
    updates.forEach((a) => req.user[a] = req.body[a])
    await req.user.save()
    res.send(user)
  }catch(e){
    res.status(400).send(e)
  }
})

router.delete('/users/me', auth, async (req, res) => {
  try{
    await req.user.remove()
    res.send(req.user)
  }catch(e){
    res.status(500).send(e)
  }
})

const token = async () => {
  return await jws.sign(_id, 'somerandomstring')

}

module.exports = router