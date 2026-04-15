export const SKILL_DICTIONARY: string[] = [
  // Programming Languages
  "java", "python", "javascript", "typescript", "c++", "c#", "c", "go", "golang",
  "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "perl",
  "objective-c", "dart", "lua", "haskell", "elixir", "clojure", "groovy",
  
  // Frontend
  "react", "angular", "vue", "vue.js", "svelte", "next.js", "nextjs", "nuxt.js",
  "gatsby", "html", "css", "sass", "scss", "less", "tailwind", "tailwindcss",
  "bootstrap", "material ui", "chakra ui", "jquery", "redux", "mobx", "zustand",
  "webpack", "vite", "babel", "storybook",
  
  // Backend
  "node.js", "nodejs", "express", "express.js", "django", "flask", "fastapi",
  "spring", "spring boot", "springboot", ".net", "asp.net", "laravel", "rails",
  "ruby on rails", "gin", "fiber", "nestjs", "nest.js", "koa", "hapi",
  
  // Databases
  "sql", "mysql", "postgresql", "postgres", "mongodb", "redis", "elasticsearch",
  "cassandra", "dynamodb", "oracle", "sqlite", "mariadb", "couchdb", "neo4j",
  "firebase", "firestore", "supabase",
  
  // Cloud & DevOps
  "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
  "terraform", "ansible", "jenkins", "ci/cd", "github actions", "gitlab ci",
  "circleci", "travis ci", "nginx", "apache", "linux", "unix", "bash",
  "shell scripting", "prometheus", "grafana", "datadog", "new relic",
  
  // Data & ML
  "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
  "scikit-learn", "pandas", "numpy", "spark", "hadoop", "hive", "airflow",
  "kafka", "rabbitmq", "data science", "nlp", "computer vision", "tableau",
  "power bi", "etl",
  
  // Mobile
  "react native", "flutter", "android", "ios", "swiftui", "xamarin",
  "ionic", "cordova",
  
  // APIs & Protocols
  "rest api", "restful", "graphql", "grpc", "websocket", "soap", "oauth",
  "jwt", "api gateway",
  
  // Architecture
  "microservices", "monolithic", "serverless", "event-driven", "mvc",
  "mvvm", "clean architecture", "domain-driven design", "ddd",
  
  // Testing
  "jest", "mocha", "chai", "cypress", "selenium", "junit", "pytest",
  "testng", "cucumber", "playwright", "vitest",
  
  // Tools
  "git", "github", "gitlab", "bitbucket", "jira", "confluence",
  "slack", "figma", "postman", "swagger", "openapi",
  
  // Other
  "agile", "scrum", "kanban", "devops", "sre", "blockchain",
  "web3", "solidity", "security", "penetration testing",
  "data structures", "algorithms", "system design", "oop",
  "functional programming", "design patterns",
];

export function findSkills(text: string): string[] {
  const lowerText = text.toLowerCase();
  const found: string[] = [];
  
  for (const skill of SKILL_DICTIONARY) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[\\s,;|/()\\[\\]])${escaped}(?:[\\s,;|/()\\[\\]]|$)`, 'i');
    if (regex.test(lowerText) || lowerText.includes(skill.toLowerCase())) {
      if (!found.includes(skill)) {
        found.push(skill);
      }
    }
  }
  
  return found;
}
