const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../models/task')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
      ...req.body,
      owner: req.user._id
    })
    try{
      await task.save();
      res.status(201).send(task)
    }catch(e){
      res.status(400).send(e)
    }
})

router.get('/tasks', auth, async (req, res) => {
  try{
    // const tasks = await Task.find({owner: req.user._id});
    // res.send(tasks)
    await req.user.populate('tasks').execPopulate()
    res.send(req.user.tasks)
  }catch(e){
    res.status(500).send(e)
  }
})

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  try{
    const task = Task.findOne({_id, owner: req.user.id})
    if(!task)return res.status(404).send()
    res.send(task)
  }catch(e){
    res.status(500).send(e)
  }
})

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']
  const isValidOperarion = updates.every((update) => allowedUpdates.includes(update))
  if(!isValidOperarion) return res.status(404).send({error: "Invalid updates"})

  try{
    const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
    if(!task) return res.status(404).send()

    updates.forEach((update) => user[update] = req.body[update])
    await task.save()
    res.send(task)
  }catch(e){
    res.status(400).send(e)
  }
})

router.delete('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  try{
    const task = await Task.findOneAndDelete({_id, owner: req.user._id})
    if(!task) return res.status(404).send()
    res.send(task)
  }catch(e){
    res.status(500).send(e)
  }
})

module.exports = router