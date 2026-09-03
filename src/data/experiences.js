export const experiences = [
  {
    id: 'invite', title: 'NSF National AI Research Institute (INVITE)', role: 'AI Researcher', dateStr: 'Jun 2026 - Aug 2026',
    logo: import.meta.env.BASE_URL + 'images/experience/invite.jpg',
    images: [
      import.meta.env.BASE_URL + 'images/experience/invite.jpg'
    ],
    startM: 6, startY: 2026, endM: 8, endY: 2026, side: 'left',
    shortDesc: 'Deployed local quantized Gemma LLMs, built Router-Tools-Composer & RAG pipelines with ChromaDB, and interactive Vis.js knowledge graphs.',
    bullets: [
      'Deployed local <strong>Gemma</strong> models with <strong>Ollama</strong>, <strong>PyTorch</strong>, and <strong>FastAPI</strong>, using quantization and structured JSON outputs for query classification while keeping student data local.',
      'Built a <strong>Router–Tools–Composer</strong> pipeline that separated request routing, data analysis, and response generation, with keyword-based fallbacks when LLM inference was unavailable.',
      'Built a <strong>RAG pipeline</strong> with <strong>ChromaDB</strong> and <strong>Sentence-Transformers</strong> embeddings, while using <strong>DuckDB</strong>, <strong>Pandas</strong>, and <strong>NumPy</strong> to reduce unnecessary LLM inference calls by 40%.',
      'Developed a <strong>Next.js/React</strong> and <strong>FastAPI</strong> interface with streaming chat responses and interactive <strong>Vis.js</strong> knowledge graphs, improving query performance by 30% over the legacy CSV system.'
    ],
    tags: ['FastAPI', 'Next.js', 'PyTorch', 'Ollama', 'RAG', 'ChromaDB', 'DuckDB', 'Vis.js', 'Pandas']
  },
  {
    id: 'uiuc_tech_services', title: 'Technology Services, UIUC', role: 'Site Consultant', dateStr: 'Apr 2026 - Present',
    logo: import.meta.env.BASE_URL + 'images/experience/uiuc.jpg',
    images: [
      import.meta.env.BASE_URL + 'images/experience/uiuc.jpg'
    ],
    startM: 4, startY: 2026, endM: 8, endY: 2026, side: 'right',
    shortDesc: 'Provided frontline technical support and ensured seamless operation of computing labs for students and faculty.',
    bullets: [
      'Delivered <strong>frontline technical support</strong> and customer service to students, faculty, and staff across <strong>7 campus computing labs</strong>.',
      'Troubleshot <strong>hardware and software issues</strong>, managed urgent classroom technology needs, and escalated complex incidents via <strong>ticketing systems</strong>.',
      'Maintained lab operations by conducting regular walkthroughs, monitoring equipment, and utilizing <strong>Microsoft Teams</strong> for rapid communication with management.'
    ],
    tags: ['Linux', 'Networking', 'Bash', 'System Admin', 'IT Support']
  },
  {
    id: 'mathnasium', title: 'Mathnasium', role: 'Mathematics Instructor', dateStr: 'Jan 2024 - Aug 2025',
    logo: import.meta.env.BASE_URL + 'images/experience/mathnasium.jpg',
    images: [
      import.meta.env.BASE_URL + 'images/experience/mathnasium.jpg'
    ],
    startM: 1, startY: 2024, endM: 8, endY: 2025, side: 'right',
    shortDesc: 'Provided tailored mathematical instruction and competition coaching for K-12 students of all learning abilities.',
    bullets: [
      'Provided <strong>1-on-1 to 1-on-4 tutoring</strong> to <strong>300+ students (K–12)</strong>, from arithmetic to <strong>SAT Math</strong> and <strong>pre-calculus</strong>.',
      'Coached <strong>10+ Math Kangaroo International medalists</strong> for competitions.',
      'Created tailored lesson plans for students with <strong>dyscalculia, dyslexia, autism, and ADHD</strong>.'
    ],
    tags: ['Tutoring', 'SAT Math', 'Competition Coaching']
  },
  {
    id: 'techknowhow_lead', title: 'TechKnowHow Franchises', role: 'Lead Instructor', dateStr: 'May 2024 - Aug 2024',
    logo: import.meta.env.BASE_URL + 'images/experience/techknowhow.jpg',
    images: [
      import.meta.env.BASE_URL + 'images/experience/techknowhow.jpg'
    ],
    startM: 5, startY: 2024, endM: 8, endY: 2024, side: 'right',
    shortDesc: 'Led robotics and coding classes of 20+ students, ensuring individualized instruction in Python and Roblox.',
    bullets: [
      'Mentored <strong>250+ students</strong> in robotics and coding using <strong>Scratch, Roblox, and Minecraft</strong>.',
      'Managed <strong>classroom dynamics</strong> and taught fundamental computer science concepts.'
    ],
    tags: ['Scratch', 'Roblox', 'Python', 'Robotics']
  },
  {
    id: 'thecoderschool', title: 'theCoderSchool', role: 'Code Coach', dateStr: 'Aug 2023 - Jan 2024',
    logo: import.meta.env.BASE_URL + 'images/experience/thecoderschool.jpg',
    images: [
      import.meta.env.BASE_URL + 'images/experience/thecoderschool.jpg'
    ],
    startM: 8, startY: 2023, endM: 1, endY: 2024, side: 'left',
    shortDesc: 'Mentored students in foundational computer science logic through custom game development in Python and Scratch.',
    bullets: [
      'Coached <strong>30+ students (ages 8–12)</strong> in <strong>Scratch, Python, and PixelPad</strong>.',
      'Guided students in building games and solving <strong>coding challenges</strong>.'
    ],
    tags: ['Scratch', 'Python', 'PixelPad', 'Game Dev']
  },
  {
    id: 'techknowhow_asst', title: 'TechKnowHow Franchises', role: 'Lead Instructor', dateStr: 'May 2023 - Aug 2023',
    logo: import.meta.env.BASE_URL + 'images/experience/techknowhow.jpg',
    images: [
      import.meta.env.BASE_URL + 'images/experience/techknowhow.jpg'
    ],
    startM: 5, startY: 2023, endM: 8, endY: 2023, side: 'right',
    shortDesc: 'Guided young learners through engaging robotics and coding camps, fostering early technical interest.',
    bullets: [
      'Assisted in mentoring students (ages 5–12) in <strong>introductory robotics</strong> and <strong>block-based coding</strong>.',
      'Supported lead instructors in executing lesson plans and facilitating <strong>hands-on STEM activities</strong>.'
    ],
    tags: ['STEM', 'Robotics', 'Block Coding']
  },
  {
    id: 'kesselworks', title: 'KesselWorks, LLC', role: 'Software Developer & UI/UX Intern', dateStr: 'Jun 2022 - Aug 2024',
    logo: import.meta.env.BASE_URL + 'images/experience/kesselworks.jpg',
    images: [
      import.meta.env.BASE_URL + 'images/experience/kesselworks.jpg'
    ],
    startM: 6, startY: 2022, endM: 8, endY: 2024, side: 'left',
    shortDesc: 'Developed a React scheduling platform supporting 10+ contractor schedules and refactored AWS REST APIs, reducing page load latency by 35%.',
    bullets: [
      'Developed a <strong>React</strong> scheduling platform supporting <strong>10+ concurrent contractor schedules</strong> and project timelines, enabling real-time resource allocation and project tracking.',
      'Refactored <strong>MySQL</strong> schemas and optimized <strong>AWS REST API</strong> endpoints, reducing page load latency by <strong>35%</strong>.',
      'Deployed and managed containerized microservices via <strong>Docker</strong> and <strong>Kubernetes on AWS</strong>, establishing <strong>CI/CD workflows</strong> and cloud infrastructure best practices.'
    ],
    tags: ['React', 'JavaScript', 'AWS', 'REST APIs', 'MySQL', 'Docker', 'Kubernetes']
  }
];

// Timeline Constraints
export const TIMELINE_END_YEAR = 2026;
export const TIMELINE_END_MONTH = 8;
export const TIMELINE_START_YEAR = 2022;
export const TIMELINE_START_MONTH = 1;
