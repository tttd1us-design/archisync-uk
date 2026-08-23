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

              // 🏛️ Pre-correct English Phonetic STT distortions before sending to translation engine
              function preCorrectPhoneticSpeech(raw) {
                if (!raw) return '';
                let c = raw;
                c = c.replace(/\b(?:cotton\s*wool|curtain\s*falling|curtain\s*fall|cotton\s*walling)\b/gi, 'curtain walling');
                c = c.replace(/\b(?:breeze\s*so\s*lay|brise\s*sole|breeze\s*soleil|brice\s*so\s*lay|breeze\s*solar)\b/gi, 'brise-soleil');
                c = c.replace(/\b(?:you\s*value|new\s*value|you\s*values)\b/gi, 'U-value');
                c = c.replace(/\b(?:pot\s*l|party\s*l|part\s*elle|part\s*el)\b/gi, 'Part L');
                c = c.replace(/\b(?:pot\s*b|party\s*b)\b/gi, 'Part B');
                c = c.replace(/\b(?:sex\s*in\s*one\s*oh\s*six|s\s*one\s*oh\s*six|s\s*106)\b/gi, 'Section 106');
                c = c.replace(/\b(?:million|mull\s*in|mull\s*yon)\b/gi, 'mullion');
                c = c.replace(/\b(?:train\s*some|tran\s*some)\b/gi, 'transom');
                c = c.replace(/\b(?:saw\s*fit|soft\s*fit)\b/gi, 'soffit');
                c = c.replace(/\b(?:span\s*drill|spandrel\s*glass)\b/gi, 'spandrel panel');
                c = c.replace(/\b(?:rebar\s*stage|river\s*stage)\b/gi, 'RIBA Stage');
                c = c.replace(/\b(?:bree\s*am|bream)\b/gi, 'BREEAM');
                c = c.replace(/\b(?:flash\s*detection|clash\s*de\s*tech)\b/gi, 'Clash Detection');
                return c;
              }

              const query = (sl.startsWith('en') ? preCorrectPhoneticSpeech(text.trim()) : text.trim())
              let translatedText = ''

              // 1. Tier 1: Google Clients5 High-Speed Endpoint
              try {
                const url1 = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${sl}&tl=${tl}&q=${encodeURIComponent(query)}`
                const res1 = await fetch(url1, { headers: { 'User-Agent': 'Mozilla/5.0' } })
                if (res1.ok) {
                  const data1 = await res1.json()
                  if (Array.isArray(data1) && data1[0]) {
                    translatedText = Array.isArray(data1[0]) ? data1[0].join('') : data1[0]
                  }
                }
              } catch (e1) {
                console.warn('Clients5 translation fallback:', e1.message)
              }

              // 2. Tier 2: MyMemory Translation API (Backup)
              if (!translatedText) {
                try {
                  const url2 = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=${sl}|${tl}`
                  const res2 = await fetch(url2)
                  if (res2.ok) {
                    const data2 = await res2.json()
                    if (data2.responseData?.translatedText) {
                      translatedText = data2.responseData.translatedText
                    }
                  }
                } catch (e2) {
                  console.warn('MyMemory translation fallback:', e2.message)
                }
              }

              function polishKoreanText(korean, src) {
                if (!korean) return '';
                let t = korean.trim();
                const s = (src || '').toLowerCase();

                // 1. Natural Business/Architectural Tone Polishing
                t = t.replace(/좋은\s*오후(?:에요|입니다|예요)/g, '안녕하십니까');
                t = t.replace(/좋은\s*아침(?:이에요|입니다|예요)/g, '안녕하십니까');
                t = t.replace(/좋은\s*저녁(?:이에요|입니다|예요)/g, '안녕하십니까');
                t = t.replace(/우리는\s*/g, '');
                t = t.replace(/당신은\s*/g, '');
                t = t.replace(/확인\s*해야\s*합니다|확인해야\s*합니다/g, '확인 및 검토가 필요합니다');
                t = t.replace(/해야\s*합니다/g, '검토가 필요합니다');
                t = t.replace(/할\s*필요가\s*있습니다/g, '해야 합니다');
                t = t.replace(/확인하시기\s*바랍니다/g, '확인 부탁드립니다');
                t = t.replace(/해\s*주십시오/g, '해주시기 바랍니다');
                t = t.replace(/확인\s*확인/g, '확인');

                // 2. 🇯🇵 Japanese Architectural Specific Corrections
                t = t.replace(/납품\s*상세도|수납\s*상세도|수납\s*도면/g, '접합부 마감 상세도(納まり)');
                t = t.replace(/납품\s*검토|수납\s*검토/g, '마감 접합부(納まり) 검토');
                t = t.replace(/내진구조의\s*구조계산서/g, '내진구조 계산서');
                t = t.replace(/의장\s*설계/g, '의장/건축계획 설계');
                t = t.replace(/확인\s*신청/g, '건축 확인 인허가 신청');
                t = t.replace(/시공도/g, '현장 시공 상세도(施工図)');
                t = t.replace(/배근\s*납품/g, '배근 마감 상세');

                // 3. 🇨🇳 Chinese Architectural Specific Corrections
                t = t.replace(/심화\s*설계|심화설계/g, '실시설계 상세도(深化设计)');
                t = t.replace(/보건\s*승인|보건\s*심비|보건\s*심사/g, '건축 인허가 승인(报建审批)');
                t = t.replace(/항진\s*설방|항진설방/g, '초고층 내진설계(抗震设防)');
                t = t.replace(/열성능\s*계산서|열공\s*성능/g, '열공학 단열성능 계산서');
                t = t.replace(/건물\s*밀도|건축\s*밀도/g, '건폐율(Building Coverage)');
                t = t.replace(/용적\s*비율|용적\s*지표/g, '용적률(FAR)');
                t = t.replace(/전단\s*벽/g, '구조 전단벽(Shear Wall)');

                // 4. 🇬🇧/🇺🇸 UK & US Architectural Standards & Regulation Polishing
                t = t.replace(/건축\s*규정\s*파트\s*l|건물\s*규정\s*파트\s*l|파트\s*l/gi, '영국 단열·에너지기준(Part L)');
                t = t.replace(/건축\s*규정\s*파트\s*b|건물\s*규정\s*파트\s*b|파트\s*b/gi, '영국 화재안전기준(Part B)');
                t = t.replace(/건축\s*규정\s*파트\s*m|파트\s*m/gi, '배리어프리·접근성기준(Part M)');
                t = t.replace(/106조|섹션\s*106/g, 'Section 106(공공기여 협약)');
                t = t.replace(/파티\s*월|정당\s*벽/g, '인접대지 경계벽(Party Wall Act)');
                t = t.replace(/스내깅|하자\s*목록/g, '준공 전 결함 점검(Snagging list)');
                t = t.replace(/커튼\s*월/g, '외벽 커튼월(Curtain Wall)');
                t = t.replace(/브리즈\s*솔레일|브리즈\s*솔레이/g, '일사차단 루버(Brise-soleil)');
                t = t.replace(/충돌\s*감지|간섭\s*감지/g, 'BIM 간섭 체크(Clash Detection)');
                t = t.replace(/수량\s*조사관|수량\s*조사원/g, '공사비 적산사(QS)');
                t = t.replace(/우수\s*감쇄|우수\s*감쇠/g, '우수 저감조(Attenuation)');
                t = t.replace(/브리암|브림/gi, '친환경 건축인증(BREEAM)');

                return t;
              }

              if (translatedText) {
                const polished = polishKoreanText(translatedText, query);
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({ success: true, translation: polished }))
              }

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, translation: text }))
            } catch (err) {
              console.error('Translation proxy error:', err)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, error: err.message, translation: '' }))
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

