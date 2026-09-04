export const initialProjects = [
  {
    id: "3",
    title: "Tacho Tasks",
    shortDescription: "A desktop task planner that turns natural-language input into schedules and syncs with Google Calendar.",
    description: "A desktop task planner that turns natural-language input into schedules and syncs with Google Calendar.",
    highlights: [
      { keywords: "Electron · TypeScript", text: "Built a desktop app with separate UI and background processes connected through IPC." },
      { keywords: "Firebase · Google Calendar", text: "Implemented two-way synchronization with OAuth 2.0 PKCE, automatic token refresh, and credential management." },
      { keywords: "Natural-language scheduling", text: "Integrated chrono-node to turn typed dates and times into calendar-ready task schedules." }
    ],
    technologies: ["Electron", "TypeScript", "JavaScript", "Firebase Firestore", "Google Calendar API", "OAuth 2.0 PKCE", "chrono-node", "IPC", "REST APIs"],
    websiteUrl: "https://tasks.tobyyeung.com",
    githubUrl: "https://github.com/tobyyeung/tachotasks",
    imageUrl: import.meta.env.BASE_URL + "images/projects/tacho.png"
  },
  {
    id: "5",
    title: "Keating Framework (INVITE AI)",
    shortDescription: "A privacy-first AI platform that helps educators identify at-risk students using locally processed data.",
    description: "A privacy-first AI platform that helps educators identify at-risk students using locally processed data.",
    highlights: [
      { keywords: "RAG · LangChain", text: "Built a retrieval pipeline to surface relevant student information for educators at the INVITE AI Institute." },
      { keywords: "DuckDB · ChromaDB", text: "Combined structured data queries with semantic search to retrieve student context." },
      { keywords: "Ollama · FastAPI", text: "Integrated local LLM inference with an API backend to keep student data on local infrastructure." }
    ],
    technologies: ["FastAPI", "Python", "DuckDB", "ChromaDB", "Ollama", "LLMs", "RAG", "LangChain", "Pytest"],
    websiteUrl: "https://invite.illinois.edu/",
    githubUrl: "",
    imageUrl: import.meta.env.BASE_URL + "images/projects/keating.png"
  },
  {
    id: "1",
    title: "Aleago",
    shortDescription: "A web platform for probability-based interactions with real-time state synchronization.",
    description: "A web platform for probability-based interactions with real-time state synchronization.",
    highlights: [
      { keywords: "Next.js · Supabase", text: "Built and deployed the platform on Vercel with a React interface and database-backed application state." },
      { keywords: "Server-side validation", text: "Implemented deterministic probability models and validation to prevent client-side state manipulation." },
      { keywords: "PostgreSQL · Async pipelines", text: "Processed stochastic events and synchronized application state across concurrent sessions." }
    ],
    technologies: ["Next.js", "React", "Supabase", "PostgreSQL", "Vercel", "TypeScript", "Tailwind CSS"],
    websiteUrl: "https://aleago.tobyyeung.com",
    githubUrl: "https://github.com/tobyyeung/aleago",
    imageUrl: import.meta.env.BASE_URL + "images/projects/aleago.png"
  },
  {
    id: "2",
    title: "Birthday Blitz",
    shortDescription: "A Chrome extension that adds recurring birthday reminders to Google Calendar in one click.",
    description: "A Chrome extension that adds recurring birthday reminders to Google Calendar in one click.",
    highlights: [
      { keywords: "JavaScript · Manifest V3", text: "Built a Chrome extension to automate recurring calendar-event creation." },
      { keywords: "OAuth 2.0 · chrome.identity", text: "Implemented authentication, token caching, session management, and credential revocation." },
      { keywords: "Google Calendar API", text: "Created and updated recurring events using RFC 5545 recurrence rules and timezone handling." }
    ],
    technologies: ["JavaScript", "Chrome Extension (Manifest V3)", "Google Calendar API v3", "chrome.identity", "OAuth 2.0", "RFC 5545 iCalendar"],
    websiteUrl: "https://chromewebstore.google.com/detail/birthday-blitz/kmgkppagkcdodaddflajjdhkmbpgcaag",
    githubUrl: "https://github.com/tobyyeung/birthdayblitz",
    imageUrl: import.meta.env.BASE_URL + "images/projects/birthdayblitz.png"
  },
  {
    id: "6",
    title: "Cloud Calendar System (KesselWorks)",
    shortDescription: "An internal calendar app for coordinating contractors, allocating resources, and tracking project timelines.",
    description: "An internal calendar app for coordinating contractors, allocating resources, and tracking project timelines.",
    highlights: [
      { keywords: "React · Node.js · MySQL", text: "Built an interactive scheduling interface backed by REST APIs and database queries." },
      { keywords: "Docker · Kubernetes · CI/CD", text: "Containerized the application and configured orchestration and automated deployment workflows." },
      { keywords: "AWS · Nginx", text: "Deployed the system across EC2 and S3 with Nginx load balancing." }
    ],
    technologies: ["React", "Node.js", "MySQL", "Docker", "Kubernetes", "AWS EC2", "AWS S3", "Nginx", "CI/CD"],
    websiteUrl: "https://kledger.com/",
    githubUrl: "",
    imageUrl: import.meta.env.BASE_URL + "images/projects/kesselworks.png"
  },
  {
    id: "4",
    title: "Computer Vision Emotion Recognition",
    shortDescription: "A computer-vision project that recognizes facial expressions from live video.",
    description: "A computer-vision project that recognizes facial expressions from live video.",
    highlights: [
      { keywords: "Python · OpenCV", text: "Built a real-time video-processing pipeline to extract facial landmarks." },
      { keywords: "TensorFlow · Keras", text: "Applied neural-network classifiers to recognize emotions from facial expressions." },
      { keywords: "Pandas · NumPy", text: "Processed and prepared data for the emotion-recognition pipeline." }
    ],
    technologies: ["Python", "OpenCV", "TensorFlow", "Keras", "Machine Learning", "Neural Networks", "Pandas", "NumPy"],
    websiteUrl: "",
    githubUrl: "",
    imageUrl: import.meta.env.BASE_URL + "images/projects/vision.png"
  }
];

export const getProjects = () => {
  return initialProjects;
};
