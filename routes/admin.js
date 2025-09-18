import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import OptionSet from '../models/OptionSets.js'

const router = express.Router()

function loadSeed(){
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const p = path.join(__dirname, '..', 'seed', 'defaultOptions.json')
  const raw = fs.readFileSync(p, 'utf-8')
  return JSON.parse(raw)
}

// POST /api/admin/seed?token=SEED_TOKEN
router.post('/seed', async (req,res)=>{
  const token = req.query.token || req.headers['x-seed-token']
  if (!process.env.SEED_TOKEN) return res.status(400).json({message:'SEED_TOKEN not set on server'})
  if (token !== process.env.SEED_TOKEN) return res.status(403).json({message:'forbidden'})
  const data = loadSeed()
  await OptionSet.deleteMany({})
  await OptionSet.create(data)
  res.json({ ok: true, inserted: data.length })
})

export default router
