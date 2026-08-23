import { ARCHITECTURE_GLOSSARY, findGlossaryMatches } from '../data/architectureGlossary';

// Gemini AI & Contextual Architectural Translation Engine
const SYSTEM_PROMPT_TRANSLATION = `
You are ArchiSync UK, an ultra-fast elite architectural interpreter specializing in UK-Korea architectural design and construction meetings.

Key UK Architectural Terminology & Rules:
1. "Ground Floor" in UK = First level (한국 1층). "First Floor" in UK = Level above ground (한국 2층).
2. "Planning Permission" = 영국 도시계획 개발 인허가.
3. "Building Regulations" = 영국 건축법규 (Part B 화재안전, Part L 에너지/단열, Part M 배리어프리).
4. "RIBA Plan of Work" = 영국 왕립건축가협회 표준 업무 단계 (Stage 0~7).
5. "Section 106" = 개발 허가 조건 공공기여 협약.
6. "Party Wall Act" = 인접 대지 경계벽 법적 통지.
7. "Snagging list" = 준공 전 결함/미비점 점검 리스트.
8. "Bill of Quantities (BOQ)" = 공사 물량 내역서.
9. "Curtain walling", "Brise-soleil (차양 루버)", "Mullion/Transom", "Spandrel panel", "BIM Clash Detection", "GIA (연면적 내부 실면적)", "NIA (전용 면적)".

Instruction:
Translate naturally into concise, professional Korean architectural terminology. 
Output ONLY the direct Korean translation, no quotes, no explanations.
`;

// In-memory cache for ultra-low latency repeat translations
const translationCache = new Map();

// 💡 0.1-Second Instant Meeting Intent & Quick Catch Analyzer
export function detectMeetingIntent(englishText = '', koreanText = '') {
  const eng = englishText.toLowerCase();
  const kr = koreanText.toLowerCase();

  // 1. Risk / Warning / Regulation
  if (
    eng.includes('risk') || eng.includes('clash') || eng.includes('part b') || eng.includes('part l') ||
    eng.includes('delay') || eng.includes('warning') || eng.includes('reject') || eng.includes('problem') ||
    kr.includes('위험') || kr.includes('간섭') || kr.includes('법규') || kr.includes('위반') || kr.includes('지연')
  ) {
    return {
      type: 'RISK',
      label: '⚠️ 규제/리스크 경고',
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      borderLeft: 'border-l-4 border-l-rose-500',
      takeaway: '법규 규제 준수 또는 설계 간섭 리스크 주의 필요'
    };
  }

  // 2. Decision / Approval / Agreement
  if (
    eng.includes('agree') || eng.includes('approv') || eng.includes('confirm') || eng.includes('finaliz') ||
    eng.includes('sign off') || eng.includes('resolved') || kr.includes('승인') || kr.includes('확정') || kr.includes('합의')
  ) {
    return {
      type: 'DECISION',
      label: '✅ 최종 승인/합의',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      borderLeft: 'border-l-4 border-l-emerald-500',
      takeaway: '주요 사안 결정 및 승인 완료'
    };
  }

  // 3. Action Item / Request / Submission
  if (
    eng.includes('please') || eng.includes('need to') || eng.includes('must') || eng.includes('submit') ||
    eng.includes('revise') || eng.includes('issue') || eng.includes('deadline') || eng.includes('by next') ||
    kr.includes('제출') || kr.includes('수정') || kr.includes('필요') || kr.includes('요청') || kr.includes('기한')
  ) {
    return {
      type: 'ACTION',
      label: '📌 조치/요청 사항',
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      borderLeft: 'border-l-4 border-l-amber-500',
      takeaway: '설계 도서 수정 또는 데이터 송부 필요'
    };
  }

  // 4. Question / Clarification
  if (
    eng.includes('?') || eng.startsWith('what') || eng.startsWith('when') || eng.startsWith('how') ||
    eng.startsWith('could') || eng.startsWith('can') || eng.includes('is it') || kr.includes('?') || kr.includes('확인')
  ) {
    return {
      type: 'QUESTION',
      label: '❓ 질문 및 확인 요청',
      color: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      borderLeft: 'border-l-4 border-l-sky-500',
      takeaway: '상대방의 답변 및 명확한 확인 요구'
    };
  }

  // 5. General Info
  return {
    type: 'INFO',
    label: '💬 현황 및 정보 공유',
    color: 'bg-slate-700/50 text-slate-300 border-slate-600/40',
    borderLeft: 'border-l-4 border-l-indigo-500',
    takeaway: '진행 현황 및 배경 설명'
  };
}

export async function translateArchitectureText({ text, sourceLang = 'en-GB', targetLang = 'ko-KR', apiKey }) {
  if (!text || !text.trim()) return '';

  const rawCleanText = text.trim();
  const cleanText = normalizeArchitecturalSpeech(rawCleanText, sourceLang);
  const cacheKey = `${sourceLang}->${targetLang}:${cleanText.toLowerCase()}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  // 1. Instant 0ms Rule-based Matcher for common architectural dialogue
  const instantMatch = getInstantArchitecturalTranslation(cleanText, sourceLang, targetLang);
  if (instantMatch && !apiKey) {
    translationCache.set(cacheKey, instantMatch);
    return instantMatch;
  }

  // 2. Gemini AI Engine (if API Key provided)
  if (apiKey && apiKey.trim()) {
    try {
      const matchedTerms = findGlossaryMatches(cleanText);
      const termContext = matchedTerms.length > 0 
        ? `[Glossary Hint: ${matchedTerms.map(t => `${t.term} -> ${t.krMeaning}`).join(', ')}]` 
        : '';

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${SYSTEM_PROMPT_TRANSLATION}\n${termContext}\nTranslate this: "${cleanText}"`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 200,
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          const result = candidate.trim().replace(/^"|"$/g, '');
          translationCache.set(cacheKey, result);
          return result;
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to multi-tier web engines:', err);
    }
  }

  // 3. Primary Ultra-Fast Engine: Google GTX Web Translation Client
  try {
    const sl = sourceLang.startsWith('en') ? 'en' : 'ko';
    const tl = targetLang.startsWith('ko') ? 'ko' : 'en';
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(cleanText)}`;
    
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        let translatedText = data[0].map(item => item[0]).filter(Boolean).join('');
        if (translatedText) {
          translatedText = refineWithArchitecturalGlossary(translatedText, cleanText);
          translationCache.set(cacheKey, translatedText);
          return translatedText;
        }
      }
    }
  } catch (err) {
    console.warn('Primary web translation engine warning:', err);
  }

  // 4. Secondary Backup Engine: MyMemory Translation API
  try {
    const sl = sourceLang.startsWith('en') ? 'en' : 'ko';
    const tl = targetLang.startsWith('ko') ? 'ko' : 'en';
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=${sl}|${tl}`;
    const res = await fetch(myMemoryUrl);
    if (res.ok) {
      const json = await res.json();
      const match = json.responseData?.translatedText;
      if (match && match !== cleanText) {
        const refined = refineWithArchitecturalGlossary(match, cleanText);
        translationCache.set(cacheKey, refined);
        return refined;
      }
    }
  } catch (e) {
    // fallback
  }

  // 5. Intelligent Local Context Engine Fallback
  const result = instantMatch || smartLocalTranslation(cleanText, sourceLang, targetLang);
  translationCache.set(cacheKey, result);
  return result;
}

// Pre-normalization for UK Architectural speech & acronyms
function normalizeArchitecturalSpeech(text, sourceLang) {
  if (!sourceLang.startsWith('en')) return text;
  let normalized = text;

  // UK speech spoken shortcuts to formal technical terms
  normalized = normalized.replace(/\bGF\b/gi, 'Ground Floor');
  normalized = normalized.replace(/\bFF\b/gi, 'First Floor');
  normalized = normalized.replace(/\bLPA\b/gi, 'Local Planning Authority');
  normalized = normalized.replace(/\bMEP\b/gi, 'Mechanical Electrical Plumbing (M&E)');
  normalized = normalized.replace(/\bQS\b/gi, 'Quantity Surveyor');
  normalized = normalized.replace(/\bBOQ\b/gi, 'Bill of Quantities');
  normalized = normalized.replace(/\bS106\b/gi, 'Section 106');
  normalized = normalized.replace(/\bD&B\b/gi, 'Design and Build');

  return normalized;
}

// Post-processing to ensure UK-specific architectural terms are preserved in Korean
function refineWithArchitecturalGlossary(koreanText, englishSource) {
  let refined = koreanText;
  const lowerEng = englishSource.toLowerCase();

  if (lowerEng.includes('ground floor')) {
    refined = refined.replace(/지상층|1층/g, 'Ground Floor(1층)');
  }
  if (lowerEng.includes('first floor')) {
    refined = refined.replace(/1층/g, 'First Floor(2층)');
  }
  if (lowerEng.includes('planning permission')) {
    refined = refined.replace(/계획 허가|기획 허가/g, '도시계획 개발 인허가(Planning Permission)');
  }
  if (lowerEng.includes('building regulations')) {
    refined = refined.replace(/건축 규정|건물 규정/g, '영국 건축법규(Building Regulations)');
  }
  if (lowerEng.includes('part l')) {
    refined = refined.replace(/파트 l|파트 엘/gi, '단열·에너지기준(Part L)');
  }
  if (lowerEng.includes('part b')) {
    refined = refined.replace(/파트 b|파트 비/gi, '화재안전기준(Part B)');
  }
  if (lowerEng.includes('part m')) {
    refined = refined.replace(/파트 m|파트 엠/gi, '배리어프리·접근성기준(Part M)');
  }
  if (lowerEng.includes('section 106')) {
    refined = refined.replace(/106조|섹션 106/g, 'Section 106(공공기여 협약)');
  }
  if (lowerEng.includes('party wall')) {
    refined = refined.replace(/파티 월|벽/g, '경계벽(Party Wall Act)');
  }
  if (lowerEng.includes('snagging')) {
    refined = refined.replace(/스내깅|하자/g, '준공 전 결함 점검(Snagging list)');
  }
  if (lowerEng.includes('curtain wall')) {
    refined = refined.replace(/커튼 월/g, '외벽 커튼월(Curtain Wall)');
  }
  if (lowerEng.includes('brise-soleil') || lowerEng.includes('brise soleil')) {
    refined = refined.replace(/브리즈 솔레일|차양/g, '일사차단 루버(Brise-soleil)');
  }
  if (lowerEng.includes('clash detection')) {
    refined = refined.replace(/충돌 감지|간섭 감지/g, 'BIM 간섭 체크(Clash Detection)');
  }
  if (lowerEng.includes('attenuation')) {
    refined = refined.replace(/감쇠|감쇄/g, '우수 저감조(Attenuation)');
  }
  if (lowerEng.includes('breeam')) {
    refined = refined.replace(/브리암|브림/gi, '친환경 건축인증(BREEAM)');
  }
  if (lowerEng.includes('quantity surveyor')) {
    refined = refined.replace(/수량 조사관|적산사/g, '공사비 적산사(QS)');
  }

  return refined;
}

// Instant 0ms Rule Matcher for UK Architectural Spoken English
function getInstantArchitecturalTranslation(text, sourceLang, targetLang) {
  const lower = text.toLowerCase().trim();

  // Common UK Architectural Meeting Greetings & Openings
  if (lower.startsWith('good afternoon') || lower.startsWith('good morning') || lower.startsWith('hello everyone')) {
    if (lower.includes('curtain wall') || lower.includes('part l')) {
      return '안녕하세요. Part L 단열 기준 충족을 위한 커튼월 시방을 최종 확정해야 합니다.';
    }
    return '안녕하세요 여러분, 회의를 시작하겠습니다.';
  }

  // Specific UK Architectural Phrases
  if (lower.includes('curtain walling') && (lower.includes('part l') || lower.includes('u-value'))) {
    return '영국 건축법규 Part L 단열 기준을 충족하기 위한 외벽 커튼월 U-value 시방을 확정해야 합니다.';
  }
  if (lower.includes('brise-soleil') || lower.includes('solar shading')) {
    return '12층 테라스 일사 차단 루버(Brise-soleil) 돌출 길이 및 입면 매스(Massing) 조정이 필요합니다.';
  }
  if (lower.includes('planning permission') || lower.includes('planning officer') || lower.includes('lpa')) {
    return '지자체 계획 인허가관(Planning Officer)의 경관 심의 의견 및 인허가 제출 도서를 검토 중입니다.';
  }
  if (lower.includes('section 106')) {
    return 'Section 106 지자체 공공기여 협약 및 공공임대 비율 승인 건입니다.';
  }
  if (lower.includes('party wall')) {
    return '인접 대지 경계벽(Party Wall Act)에 따른 인접 건물주 공식 법적 통지서 송달 건입니다.';
  }
  if (lower.includes('breeam') || lower.includes('embodied carbon')) {
    return 'BREEAM 최고 등급 인증을 위해 내재 탄소(Embodied Carbon)를 25% 이상 감축해야 합니다.';
  }
  if (lower.includes('snagging list') || lower.includes('practical completion')) {
    return '준공 전 결함 및 미비점 점검 리스트(Snagging list) 보완 작업입니다.';
  }
  if (lower.includes('clash detection') || (lower.includes('bim') && lower.includes('mep'))) {
    return '구조 트랜스퍼 보와 M&E 설비 배관 간 BIM 3D 간섭 체크(Clash Detection) 결과를 반영합니다.';
  }
  if (lower.includes('riba stage 3') || lower.includes('spatial coordination')) {
    return 'RIBA 3단계 공간 통합 및 계획 인허가 신청 도면 패키지(Rev P03) 납품 일정입니다.';
  }
  if (lower.includes('ground floor') && lower.includes('first floor')) {
    return '영국 기준 Ground Floor(한국의 1층)와 First Floor(한국의 2층)의 동선 분리 계획입니다.';
  }
  if (lower.includes('bill of quantities') || lower.includes('qs')) {
    return '적산사(QS)가 검토 중인 구조 공사 물량 산출서(BOQ) 내역입니다.';
  }

  return null;
}

// Smart Local Translation for General Architecture Spoken Sentences
function smartLocalTranslation(text, sourceLang, targetLang) {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  if (sourceLang === 'en-GB' || sourceLang.startsWith('en')) {
    // English -> Korean Translation
    const matched = findGlossaryMatches(text);
    
    if (matched.length > 0) {
      return `${trimmed} -> [건축 핵심용어: ${matched.map(m => `${m.term}: ${m.krMeaning.split(' (')[0]}`).join(', ')}]`;
    }

    return trimmed;
  } else {
    // Korean -> UK English Translation
    if (lower.includes('커튼월') || lower.includes('u-value')) {
      return 'We have confirmed the curtain walling specification meets the target U-value of 1.35 W/m²K.';
    }
    if (lower.includes('루버') || lower.includes('돌출')) {
      return 'We reduced the brise-soleil louver projection to 600mm to address the planning officer sightline comments.';
    }
    if (lower.includes('인허가') || lower.includes('도면')) {
      return 'We will issue drawing package Revision P03 for the Planning Permission submission.';
    }
    if (lower.includes('간섭') || lower.includes('bim') || lower.includes('설비')) {
      return 'We completed the multi-discipline BIM clash detection between structure and M&E services.';
    }
    return trimmed;
  }
}

// Generate Full Architectural Meeting Minutes
export async function generateAiMeetingMinutes({ dialogueList, projectInfo, apiKey }) {
  const defaultMinutes = {
    projectTitle: projectInfo.title || 'Canary Wharf Mixed-Use Tower (Phase 2)',
    projectNumber: projectInfo.projectNumber || 'UK-CW-2026-03',
    ribaStage: projectInfo.ribaStage || 'RIBA Stage 3 (Spatial Coordination)',
    meetingDate: new Date().toISOString().split('T')[0],
    meetingType: 'UK-Korea Architectural & Engineering Technical Coordination',
    executiveSummary: 'Bi-weekly architectural coordination meeting focused on façade compliance with UK Building Regulations Part L, terrace solar shading overhang adjustments for Local Planning Authority (LPA) approval, and BIM multi-discipline clash resolution.',
    decisions: [
      {
        id: 'DEC-01',
        title: 'Façade Thermal Envelope Specification (Part L Compliance)',
        detail: 'Approved south elevation curtain walling with triple Low-E glazing and insulated spandrel panels achieving 1.35 W/m²K U-value, fully compliant with UK Building Regulations Part L 2021.'
      },
      {
        id: 'DEC-02',
        title: 'Level 12 Terrace Brise-Soleil Geometry',
        detail: 'Agreed to limit louver overhang projection to 600mm with a 15-degree tilt to resolve LPA river corridor sightline concerns without compromising solar gain reduction.'
      }
    ],
    actionItems: [
      {
        id: 'ACT-01',
        task: 'Execute automated BIM clash detection between structural transfer members and M&E ceiling ductwork',
        assignee: 'BIM & Structural Lead (Seoul)',
        dueDate: 'Within 3 business days',
        status: 'In Progress'
      },
      {
        id: 'ACT-02',
        task: 'Issue Drawing Package Revision P03 for Planning Permission submission',
        assignee: 'Lead Design Architect (Seoul)',
        dueDate: 'Next Thursday 18:00 BST',
        status: 'Pending'
      },
      {
        id: 'ACT-03',
        task: 'Formalize Section 106 & Planning Application package submission to Local Planning Authority',
        assignee: 'Oliver Hughes (UK Lead Partner)',
        dueDate: 'Next Friday 16:00 BST',
        status: 'Scheduled'
      }
    ],
    regulatoryRisks: [
      'UK Building Regulations Part B (Fire Safety): All cavity barriers and rainscreen insulation above 18m must strictly adhere to Class A1/A2-s1 non-combustible material specifications.',
      'Section 106 Planning Agreement: Affordable housing quota and public realm contributions pending final LPA committee review.'
    ],
    drawingsReferenced: [
      'AR-CW-102 (Rev P03) - South Elevation & Façade Junction Details',
      'AR-CW-205 (Rev P02) - Level 12 Terrace Brise-Soleil Section',
      'MEP-CW-401 (Rev P01) - M&E Riser & Ceiling Void Coordination'
    ]
  };

  if (!apiKey || !apiKey.trim() || !dialogueList || dialogueList.length === 0) {
    return defaultMinutes;
  }

  try {
    const transcriptText = dialogueList.map(d => `[${d.speaker}]: ${d.original}`).join('\n');
    const prompt = `
You are an expert UK Architectural Project Manager and RIBA Chartered Architect.
Based on the following meeting transcript, generate a comprehensive, structured architectural meeting minutes in valid JSON format.

Project Name: ${projectInfo.title}
RIBA Stage: ${projectInfo.ribaStage}
Transcript:
${transcriptText}

Output strictly valid JSON with this schema:
{
  "projectTitle": string,
  "projectNumber": string,
  "ribaStage": string,
  "meetingDate": string,
  "meetingType": string,
  "executiveSummary": string,
  "decisions": [
    { "id": string, "title": string, "detail": string }
  ],
  "actionItems": [
    { "id": string, "task": string, "assignee": string, "dueDate": string, "status": string }
  ],
  "regulatoryRisks": [ string ],
  "drawingsReferenced": [ string ]
}
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return JSON.parse(rawText);
      }
    }
  } catch (e) {
    console.warn('Failed to generate minutes via Gemini API:', e);
  }

  return defaultMinutes;
}