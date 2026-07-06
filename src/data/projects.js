export const initialProjects = [
  {
    id: "1",
    title: "Aleago",
    shortDescription: "A dynamic web application powering a unique virtual economy using deterministic probability models.",
    description: "Aleago is a high-performance web application built with <strong>Next.js</strong>, <strong>React</strong>, and <strong>Supabase</strong> that powers a unique virtual economy and robust digital marketplace. I designed the architecture to execute complex deterministic probability models and transactional logic using highly scalable <strong>serverless edge functions</strong>. The backend is structured with asynchronous, highly-concurrent <strong>PostgreSQL</strong> pipelines, meticulously crafted to seamlessly handle millions of mathematical value-matching algorithms and concurrent requests in real-time.",
    technologies: ["Next.js", "React", "Supabase", "PostgreSQL", "Tailwind CSS", "Vercel"],
    websiteUrl: "https://aleago.vercel.app/",
    githubUrl: "https://github.com/tobyyeung/aleago",
    imageUrl: import.meta.env.BASE_URL + "images/projects/aleago.png"
  },
  {
    id: "2",
    title: "Birthday Blitz",
    shortDescription: "A streamlined Chrome Extension for instantly adding recurring birthdays to Google Calendar.",
    description: "Birthday Blitz is a fast, lightweight <strong>Chrome Extension</strong> built with <strong>JavaScript</strong> and <strong>HTML/CSS</strong> that integrates directly with the <strong>Google Calendar API</strong>. Designed to ensure you never forget a birthday again, it utilizes secure <strong>OAuth 2.0</strong> authentication via Chrome Identity to fetch and manage a user's calendars. The extension enables users to quickly input a name and birthdate to automatically generate and sync recurring yearly events directly to their selected calendar.",
    technologies: ["JavaScript", "HTML/CSS", "Chrome Extension API", "Google Calendar API", "OAuth 2.0"],
    websiteUrl: "https://tobyyeung.github.io/birthdayblitz/",
    githubUrl: "https://github.com/tobyyeung/birthdayblitz",
    imageUrl: import.meta.env.BASE_URL + "images/projects/birthdayblitz.png"
  },
  {
    id: "3",
    title: "Tacho Tasks",
    shortDescription: "A task management platform bidirectionally synchronizing events across Google Calendar and Google Tasks.",
    description: "Tacho Tasks is a comprehensive, productivity-boosting task management platform designed to unify and streamline your daily scheduling. I developed a custom, high-efficiency two-pronged sync engine powered by <strong>Node.js</strong> and <strong>WebSockets</strong> that seamlessly integrates with the <strong>Google Workspace API</strong> using secure <strong>OAuth 2.0</strong> authentication. This enables real-time, bidirectional synchronization of events and to-dos across both <strong>Google Calendar</strong> and <strong>Google Tasks</strong>, seamlessly surfaced through a highly responsive <strong>React</strong> frontend and robust <strong>REST APIs</strong>.",
    technologies: ["React", "Node.js", "Express", "REST APIs", "Google Workspace API", "OAuth 2.0", "WebSockets"],
    websiteUrl: "",
    githubUrl: "https://github.com/tobyyeung/tachotasks",
    imageUrl: import.meta.env.BASE_URL + "images/projects/tacho.png"
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
  },
  {
    id: "5",
    title: "Keating Framework (INVITE AI)",
    shortDescription: "An intelligent platform designed to proactively identify at-risk students using RAG and local ML inference.",
    description: "The Keating Framework, developed at the INVITE AI Institute, is an intelligent, privacy-first platform designed to empower educators by proactively identifying and assisting at-risk students. I engineered the core intelligence utilizing <strong>LangChain</strong> to build a powerful, context-aware <strong>RAG (Retrieval-Augmented Generation)</strong> system. This system efficiently queries massive student datasets using highly-optimized <strong>DuckDB</strong> columnar storage and semantic search via <strong>ChromaDB</strong> vector databases. To ensure deep data privacy and low-latency performance without relying on external APIs, I engineered a complete local inference pipeline running quantized <strong>Local LLMs</strong> via <strong>Ollama</strong>, orchestrated by a blazing fast asynchronous <strong>FastAPI</strong> backend and rigorously tested with <strong>Pytest</strong>.",
    technologies: ["FastAPI", "Python", "DuckDB", "ChromaDB", "Ollama", "LLMs", "RAG", "LangChain", "Pytest"],
    websiteUrl: "https://invite.illinois.edu/",
    githubUrl: "",
    imageUrl: import.meta.env.BASE_URL + "images/projects/keating.png"
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
  }
];

export const getProjects = () => {
  return initialProjects;
};
