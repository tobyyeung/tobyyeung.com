export const initialProjects = [
  {
    id: "3",
    title: "Tacho Tasks",
    shortDescription: "An Electron desktop application bidirectionally synchronizing Firebase Firestore and Google Calendar via OAuth 2.0 PKCE.",
    description: "Tacho Tasks is an <strong>Electron</strong> desktop application built using <strong>JavaScript/TypeScript</strong>, separating UI renderers from background processes through <strong>IPC</strong>. I engineered bidirectional synchronization between <strong>Firebase Firestore</strong> and <strong>Google Calendar</strong> using <strong>OAuth 2.0 PKCE</strong> and <strong>REST APIs</strong>, including automatic token refresh and credential management. It integrates <strong>chrono-node</strong> to convert natural-language date expressions into structured task schedules for automated calendar management.",
    technologies: ["Electron", "TypeScript", "JavaScript", "Firebase Firestore", "Google Calendar API", "OAuth 2.0 PKCE", "chrono-node", "IPC", "REST APIs"],
    websiteUrl: "https://tasks.tobyyeung.com",
    githubUrl: "https://github.com/tobyyeung/tachotasks",
    imageUrl: import.meta.env.BASE_URL + "images/projects/tacho.png"
  },
  {
    id: "5",
    title: "Keating Framework (INVITE AI)",
    shortDescription: "A privacy-first AI platform helping educators identify at-risk students.",
    description: "Built at the INVITE AI Institute, Keating helps educators identify at-risk students while keeping data local. I developed a <strong>RAG</strong> pipeline using <strong>LangChain</strong>, <strong>DuckDB</strong>, and <strong>ChromaDB</strong>, with local LLM inference through <strong>Ollama</strong> and a <strong>FastAPI</strong> backend.",
    technologies: ["FastAPI", "Python", "DuckDB", "ChromaDB", "Ollama", "LLMs", "RAG", "LangChain", "Pytest"],
    websiteUrl: "https://invite.illinois.edu/",
    githubUrl: "",
    imageUrl: import.meta.env.BASE_URL + "images/projects/keating.png"
  },
  {
    id: "1",
    title: "Aleago",
    shortDescription: "A Next.js/Supabase platform deployed on Vercel with deterministic probability models and async PostgreSQL pipelines.",
    description: "Aleago is a high-performance <strong>Next.js</strong> and <strong>Supabase</strong> platform deployed on <strong>Vercel</strong>, implementing deterministic probability models and server-side validation to prevent client-side state manipulation. I designed asynchronous <strong>PostgreSQL</strong> data pipelines to process high-frequency stochastic events and synchronize real-time application state across concurrent sessions.",
    technologies: ["Next.js", "React", "Supabase", "PostgreSQL", "Vercel", "TypeScript", "Tailwind CSS"],
    websiteUrl: "https://aleago.tobyyeung.com",
    githubUrl: "https://github.com/tobyyeung/aleago",
    imageUrl: import.meta.env.BASE_URL + "images/projects/aleago.png"
  },
  {
    id: "2",
    title: "Birthday Blitz",
    shortDescription: "A Manifest V3 Chrome extension automating one-click creation of recurring Google Calendar events via OAuth 2.0.",
    description: "Birthday Blitz is a <strong>Manifest V3 Chrome extension</strong> developed using <strong>JavaScript</strong> to automate one-click creation of recurring Google Calendar events. I implemented authentication with <strong>chrome.identity</strong>, including token caching, session management, and automated credential revocation, and integrated the <strong>Google Calendar API v3</strong> to generate and modify RFC 5545 iCalendar recurrence rules and handle timezone offsets.",
    technologies: ["JavaScript", "Chrome Extension (Manifest V3)", "Google Calendar API v3", "chrome.identity", "OAuth 2.0", "RFC 5545 iCalendar"],
    websiteUrl: "https://chromewebstore.google.com/detail/birthday-blitz/kmgkppagkcdodaddflajjdhkmbpgcaag",
    githubUrl: "https://github.com/tobyyeung/birthdayblitz",
    imageUrl: import.meta.env.BASE_URL + "images/projects/birthdayblitz.png"
  },
  {
    id: "6",
    title: "Cloud Calendar System (KesselWorks)",
    shortDescription: "A scalable calendar system for project timeline tracking and contractor coordination.",
    description: "Developed natively for internal enterprise teams at KesselWorks, this highly scalable, multi-tenant calendar system centralizes project timeline tracking, resource allocation, and contractor coordination. The application features a feature-rich, interactive <strong>React</strong> frontend seamlessly backed by a <strong>Node.js</strong> microservice architecture, executing highly optimized <strong>MySQL</strong> queries via streamlined <strong>REST APIs</strong>. To ensure zero-downtime deployments and massive horizontal scalability, I fully containerized the entire application stack using <strong>Docker</strong>, orchestrated it with <strong>Kubernetes</strong>, and configured an automated <strong>CI/CD</strong> pipeline. The entire infrastructure is securely deployed and load-balanced via <strong>Nginx</strong> across high-availability <strong>AWS EC2</strong> and <strong>AWS S3</strong> environments.",
    technologies: ["React", "Node.js", "MySQL", "Docker", "Kubernetes", "AWS EC2", "AWS S3", "Nginx", "CI/CD"],
    websiteUrl: "https://kledger.com/",
    githubUrl: "",
    imageUrl: import.meta.env.BASE_URL + "images/projects/kesselworks.png"
  },
  {
    id: "4",
    title: "Computer Vision Emotion Recognition",
    shortDescription: "A real-time facial expression analysis pipeline that classifies human emotions from live video feeds.",
    description: "This research-oriented project pushes the boundaries of real-time facial expression analysis through a highly optimized <strong>Python</strong>-based computer vision pipeline. Utilizing the power of <strong>OpenCV</strong> for high-framerate image processing alongside custom <strong>Deep Learning Neural Networks</strong> built with <strong>TensorFlow</strong> and <strong>Keras</strong>, the system continuously processes live video feeds. It meticulously extracts key facial landmarks and employs advanced <strong>Machine Learning</strong> classifiers to accurately detect and categorize micro-expressions and complex human emotions on the fly, backed by extensive <strong>Pandas</strong> and <strong>NumPy</strong> data processing.",
    technologies: ["Python", "OpenCV", "TensorFlow", "Keras", "Machine Learning", "Neural Networks", "Pandas", "NumPy"],
    websiteUrl: "",
    githubUrl: "",
    imageUrl: import.meta.env.BASE_URL + "images/projects/vision.png"
  }
];

export const getProjects = () => {
  return initialProjects;
};
