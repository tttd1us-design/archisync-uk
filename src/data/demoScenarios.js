export const DEMO_SCENARIOS = [
  {
    id: "canary-wharf-stage3",
    title: "Canary Wharf Mixed-Use Tower - RIBA Stage 3 Coordination",
    project: "London E14 Commercial & Residential Scheme",
    ribaStage: "RIBA Stage 3 (Spatial Coordination)",
    location: "London / Seoul Video Conference",
    date: "2026-08-23",
    attendees: [
      { name: "Oliver Hughes (RIBA Part 3)", role: "UK Lead Architect / Partner", organization: "Studio Foster-Hughes London" },
      { name: "Dr. Minwoo Kim", role: "Design Director", organization: "Seoul Architectural Partners" },
      { name: "Charlotte Evans", role: "Façade Consultant", organization: "Eckerd Cladding Engineering UK" },
      { name: "Joon-ho Park", role: "BIM & Structural Lead", organization: "Seoul Architectural Partners" }
    ],
    dialogue: [
      {
        id: 1,
        speaker: "Oliver Hughes (UK Lead Architect)",
        speakerRole: "UK Architect",
        lang: "en-GB",
        accent: "UK (London RP)",
        original: "Good afternoon everyone. We need to finalize the curtain walling specs for the south elevation to ensure full compliance with Building Regulations Part L.",
        translation: "모두 안녕하세요. 영국 건축법규 Part L(에너지 및 단열 기준)을 완벽히 충족하기 위해 남측 입면의 커튼월 시방을 최종 확정해야 합니다.",
        terms: ["Curtain Walling", "Building Regulations", "Part L (Conservation of Fuel and Power)"],
        category: "Façade & Regulations",
        duration: 4500
      },
      {
        id: 2,
        speaker: "Dr. Minwoo Kim (Seoul Director)",
        speakerRole: "KR Director",
        lang: "ko-KR",
        accent: "Korean",
        original: "네 Oliver 소장님, 지난주 제안해주신 트리플 로이 복층 유리와 단열 스팬드럴 패널을 적용하여 전체 U-value를 1.35 W/m²K로 맞추었습니다.",
        translation: "Yes Oliver, by applying the triple low-e glazing and insulated spandrel panels you proposed last week, we achieved an overall U-value of 1.35 W/m²K.",
        terms: ["Spandrel Panel", "Part L (Conservation of Fuel and Power)"],
        category: "Façade & Envelope",
        duration: 4800
      },
      {
        id: 3,
        speaker: "Oliver Hughes (UK Lead Architect)",
        speakerRole: "UK Architect",
        lang: "en-GB",
        accent: "UK (London RP)",
        original: "Brilliant. What about the brise-soleil projection on the 12th floor terrace? The local planning officer was concerned about visual massing from the Thames corridor.",
        translation: "훌륭합니다. 12층 테라스의 일사 차단 루버(brise-soleil) 돌출부는 어떻게 되었나요? 템스강 조망 축에서 바라볼 때의 매스감(massing)에 대해 현지 계획 인허가관(Planning Officer)이 우려를 표명했었습니다.",
        terms: ["Solar Shading / Brise-Soleil", "Massing", "Planning Permission"],
        category: "Planning & Design",
        duration: 5200
      },
      {
        id: 4,
        speaker: "Joon-ho Park (BIM Lead)",
        speakerRole: "KR BIM Lead",
        lang: "ko-KR",
        accent: "Korean",
        original: "3D BIM 모델에서 루버 돌출 길이를 600mm로 축소하고 수평 핀 각도를 15도 조절하여, 하천변 조망 간섭을 최소화하면서도 일사 차단 성능을 88% 유지했습니다.",
        translation: "In our 3D BIM model, we reduced the louver projection to 600mm and adjusted the horizontal fin angle by 15 degrees, minimizing river sightline impact while maintaining 88% solar shading efficiency.",
        terms: ["BIM", "Solar Shading / Brise-Soleil"],
        category: "BIM & Design",
        duration: 5300
      },
      {
        id: 5,
        speaker: "Oliver Hughes (UK Lead Architect)",
        speakerRole: "UK Architect",
        lang: "en-GB",
        accent: "UK (London RP)",
        original: "Excellent work. Please issue the revised drawing package under revision P03. We will include this in the Section 106 and Planning Permission submission next Friday.",
        translation: "아주 좋습니다. 리비전 P03 번호로 수정 도면 패키지를 발행해 주십시오. 다음 주 금요일 Section 106 공공기여 협약 및 계획 인허가(Planning Permission) 제출 도서에 포함시키겠습니다.",
        terms: ["Section 106 Agreement", "Planning Permission", "RIBA Stage 3 (Spatial Coordination)"],
        category: "Planning Submission",
        duration: 5000
      },
      {
        id: 6,
        speaker: "Dr. Minwoo Kim (Seoul Director)",
        speakerRole: "KR Director",
        lang: "ko-KR",
        accent: "Korean",
        original: "알겠습니다. 구조 엔지니어 및 M&E 설비 팀과 함께 BIM 간섭 체크(Clash Detection)를 마친 후 목요일 오전까지 P03 도면을 전달하겠습니다.",
        translation: "Understood. After completing BIM clash detection with the structural and M&E services teams, we will deliver the P03 package by Thursday morning.",
        terms: ["M&E / MEP Services", "Clash Detection", "BIM"],
        category: "Action Item",
        duration: 4600
      }
    ],
    sampleMinutes: {
      projectTitle: "Canary Wharf Mixed-Use Tower (Phase 2)",
      projectNumber: "UK-CW-2026-03",
      ribaStage: "RIBA Stage 3 (Spatial Coordination)",
      meetingDate: "2026-08-23",
      meetingType: "Bi-Weekly Architectural & Façade Technical Coordination",
      decisions: [
        {
          id: "DEC-01",
          title: "Façade U-value & Part L Compliance",
          detail: "Approved south elevation curtain wall specification with triple Low-E glazing and insulated spandrel back pans achieving 1.35 W/m²K, satisfying UK Building Regulations Part L 2021 standards."
        },
        {
          id: "DEC-02",
          title: "Terrace Brise-Soleil Modification",
          detail: "Agreed to reduce 12th-floor solar shading louver overhang to 600mm with 15-degree tilt to resolve Local Planning Authority (LPA) Thames sightline concerns."
        }
      ],
      actionItems: [
        {
          id: "ACT-01",
          task: "Finalize BIM multi-discipline clash detection (Arch/Structure/M&E)",
          assignee: "Joon-ho Park (Seoul BIM Team)",
          dueDate: "2026-08-27 (Thu) 10:00 BST",
          status: "In Progress"
        },
        {
          id: "ACT-02",
          task: "Issue Drawing Package Revision P03 for Planning Submission",
          assignee: "Dr. Minwoo Kim / Seoul Team",
          dueDate: "2026-08-27 (Thu) 18:00 BST",
          status: "Pending"
        },
        {
          id: "ACT-03",
          task: "Submit Planning Application & Section 106 documentation to Tower Hamlets LPA",
          assignee: "Oliver Hughes (UK Lead Architect)",
          dueDate: "2026-08-28 (Fri) 16:00 BST",
          status: "Scheduled"
        }
      ],
      regulatoryRisks: [
        "Building Regulations Part B: Ensure all cavity barriers in the rainscreen cavity meet Class A1/A2-s1 non-combustibility rating.",
        "Planning Permission (Section 106): Local council consultation deadline approaching on Sept 15th."
      ],
      drawingsReferenced: [
        "AR-CW-102 (Rev P03) - South Elevation & Façade Details",
        "AR-CW-205 (Rev P02) - Level 12 Terrace Brise-Soleil Section",
        "MEP-CW-401 (Rev P01) - Riser & Ceiling Void Coordination"
      ]
    }
  },
  {
    id: "battersea-breeam-stage2",
    title: "Battersea Riverside Residential - BREEAM & Net Zero Review",
    project: "Battersea Waterfront Regeneration Project",
    ribaStage: "RIBA Stage 2 (Concept Design)",
    location: "London / Remote",
    date: "2026-08-23",
    attendees: [
      { name: "Emma Watson-Clarke (RIBA)", role: "Project Architect", organization: "Hawkins\\Brown UK" },
      { name: "Dr. Minwoo Kim", role: "Design Director", organization: "Seoul Architectural Partners" },
      { name: "Alastair Campbell", role: "BREEAM Sustainability Assessor", organization: "Buro Happold London" }
    ],
    dialogue: [
      {
        id: 1,
        speaker: "Emma Watson-Clarke (UK Architect)",
        speakerRole: "UK Architect",
        lang: "en-GB",
        accent: "UK (Southern)",
        original: "To hit the BREEAM Outstanding benchmark, we must reduce embodied carbon by at least 25% using timber-hybrid structural floorplates.",
        translation: "BREEAM Outstanding 최고 등급을 달성하기 위해 하이브리드 목구조 바닥판을 사용하여 내재 탄소(embodied carbon)를 최소 25% 감축해야 합니다.",
        terms: ["BREEAM", "Net Zero Carbon"],
        category: "Sustainability",
        duration: 4500
      },
      {
        id: 2,
        speaker: "Dr. Minwoo Kim (Seoul Director)",
        speakerRole: "KR Director",
        lang: "ko-KR",
        accent: "Korean",
        original: "목구조 적용 시 영국 건축법 Part B 화재 안전 기준 및 바닥 층간 차음재 규정을 충족하는 디테일을 준비했습니다.",
        translation: "We have prepared architectural details ensuring the mass timber elements fully comply with UK Building Regulations Part B fire safety and acoustic standards.",
        terms: ["Part B (Fire Safety)", "Building Regulations"],
        category: "Regulations",
        duration: 4800
      },
      {
        id: 3,
        speaker: "Emma Watson-Clarke (UK Architect)",
        speakerRole: "UK Architect",
        lang: "en-GB",
        accent: "UK (Southern)",
        original: "Superb. Also, please confirm that the Party Wall notices have been served to the adjoining residential owners on the eastern boundary.",
        translation: "탁월합니다. 또한 동측 경계의 인접 주거지 소유주들에게 인접 대지 경계벽(Party Wall) 통지서가 공식 송달되었는지 확인 부탁드립니다.",
        terms: ["Party Wall Act"],
        category: "UK Regulations",
        duration: 4800
      },
      {
        id: 4,
        speaker: "Dr. Minwoo Kim (Seoul Director)",
        speakerRole: "KR Director",
        lang: "ko-KR",
        accent: "Korean",
        original: "네, 지난주 영국 현지 변호인과 함께 통지서 발송을 완료하였고 14일 이내 회신을 기다리고 있습니다.",
        translation: "Yes, we completed dispatching the notices with our UK legal counsel last week and are awaiting responses within 14 days.",
        terms: ["Party Wall Act"],
        category: "UK Regulations",
        duration: 4300
      }
    ],
    sampleMinutes: {
      projectTitle: "Battersea Riverside Residential",
      projectNumber: "UK-BAT-2026-01",
      ribaStage: "RIBA Stage 2 (Concept Design)",
      meetingDate: "2026-08-23",
      meetingType: "Sustainability & BREEAM Strategy Session",
      decisions: [
        {
          id: "DEC-01",
          title: "Timber-Hybrid Structural Strategy",
          detail: "Adopted CLT and glulam hybrid slab system to secure 6 BREEAM credits for upfront embodied carbon reduction."
        }
      ],
      actionItems: [
        {
          id: "ACT-01",
          task: "Supply Fire Resistance Test Reports for timber junctions",
          assignee: "Seoul Technical Team",
          dueDate: "2026-09-02",
          status: "In Progress"
        }
      ],
      regulatoryRisks: [
        "Awaiting Party Wall agreement notices from eastern residential block owners."
      ],
      drawingsReferenced: [
        "SK-BAT-004 - Mass Timber Floor Slab Typical Junction Detail"
      ]
    }
  }
];