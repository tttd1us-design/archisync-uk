import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Custom plugin to save voice recordings directly into Documents/음성
function localVoiceStoragePlugin() {
  const documentsDir = path.join(os.homedir(), 'Documents')
  const voiceDir = path.join(documentsDir, '음성')

  if (!fs.existsSync(voiceDir)) {
    try {
      fs.mkdirSync(voiceDir, { recursive: true })
    } catch (e) {
      console.warn('Could not create voice directory:', e)
    }
  }

  return {
    name: 'local-voice-storage',
    configureServer(server) {
      server.middlewares.use('/api/save-audio', (req, res, next) => {
        if (req.method === 'POST') {
          const chunks = []
          req.on('data', chunk => chunks.push(chunk))
          req.on('end', () => {
            try {
              const buffer = Buffer.concat(chunks)
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
              const filename = `voice_recording_${timestamp}.webm`
              const targetPath = path.join(voiceDir, filename)

              fs.writeFileSync(targetPath, buffer)
              console.log(`[ArchiSync Audio Saved]: ${targetPath}`)

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ 
                success: true, 
                filename, 
                path: targetPath,
                directory: voiceDir
              }))
            } catch (err) {
              console.error('Failed to save audio file:', err)
              res.statusCode = 500
              res.end(JSON.stringify({ success: false, error: err.message }))
            }
          })
        } else {
          next()
        }
      })

      server.middlewares.use('/api/save-transcript', (req, res, next) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => body += chunk)
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
              const filename = `transcript_${timestamp}.txt`
              const targetPath = path.join(voiceDir, filename)

              fs.writeFileSync(targetPath, data.content || body, 'utf-8')
              console.log(`[ArchiSync Transcript Saved]: ${targetPath}`)

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ 
                success: true, 
                filename, 
                path: targetPath,
                directory: voiceDir
              }))
            } catch (err) {
              console.error('Failed to save transcript:', err)
              res.statusCode = 500
              res.end(JSON.stringify({ success: false, error: err.message }))
            }
          })
        } else {
          next()
        }
      })

      server.middlewares.use('/api/translate', async (req, res, next) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => body += chunk)
          req.on('end', async () => {
            try {
              const { text, sl = 'en', tl = 'ko' } = JSON.parse(body)
              if (!text || !text.trim()) {
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: true, translation: '' }))
              }

              const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text.trim())}`
              const fetchRes = await fetch(url)
              if (fetchRes.ok) {
                const data = await fetchRes.json()
                if (Array.isArray(data) && Array.isArray(data[0])) {
                  const translatedText = data[0].map(item => item[0]).filter(Boolean).join('')
                  res.setHeader('Content-Type', 'application/json')
                  return res.end(JSON.stringify({ success: true, translation: translatedText }))
                }
              }

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, translation: text }))
            } catch (err) {
              console.error('Translation proxy error:', err)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, error: err.message }))
            }
          })
        } else {
          next()
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), localVoiceStoragePlugin()],
  server: {
    port: 5173,
    host: true,
    open: false
  }
})

