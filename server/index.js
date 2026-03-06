import express from 'express'
import cors from 'cors'
import * as db from './db.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/draft', (req, res) => {
  try {
    const data = db.getDraft()
    res.json({ ok: true, data })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.post('/api/draft', (req, res) => {
  try {
    db.saveDraft(req.body)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.delete('/api/draft', (req, res) => {
  try {
    db.clearDraft()
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.get('/api/saved', (req, res) => {
  try {
    const list = db.getSavedList()
    res.json({ ok: true, list })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.post('/api/saved', (req, res) => {
  try {
    const id = db.addSaved(req.body)
    res.json({ ok: true, id })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.delete('/api/saved/:id', (req, res) => {
  try {
    db.deleteSaved(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.post('/api/saved/:id/load', (req, res) => {
  try {
    const loaded = db.loadSavedToDraft(req.params.id)
    res.json({ ok: true, loaded })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`ACDL-ADES API running at http://localhost:${PORT}`)
})
