import { StudyContent } from "../types";

function generateBulletPoints(topic: string): string[] {
  const bullets: Record<string, string[]> = {
    machine: [
      "Machine learning is a subset of artificial intelligence (AI).",
      "It involves training algorithms on data to make predictions or decisions.",
      "Supervised learning uses labeled data to train models.",
      "Unsupervised learning finds patterns in unlabeled data.",
      "Reinforcement learning uses rewards and penalties to train agents.",
      "Common algorithms include linear regression, decision trees, and neural networks.",
      "Deep learning uses multi-layered neural networks for complex tasks.",
    ],
    react: [
      "React is a JavaScript library for building user interfaces.",
      "It uses a component-based architecture for reusable UI pieces.",
      "JSX allows you to write HTML-like syntax within JavaScript.",
      "State and props manage data flow between components.",
      "Hooks like useState and useEffect enable functional component logic.",
      "The Virtual DOM optimizes rendering performance.",
      "React's unidirectional data flow makes debugging easier.",
    ],
    javascript: [
      "JavaScript is a high-level, interpreted programming language.",
      "It is one of the core technologies of the World Wide Web.",
      "JavaScript supports object-oriented, functional, and imperative programming.",
      "ES6 introduced classes, arrow functions, template literals, and more.",
      "Asynchronous programming is handled via callbacks, promises, and async/await.",
      "JavaScript runs on both the client-side and server-side (Node.js).",
    ],
    typescript: [
      "TypeScript is a typed superset of JavaScript developed by Microsoft.",
      "It adds static type checking to catch errors at compile time.",
      "Interfaces and types define the shape of data objects.",
      "Generics allow creating reusable components with type safety.",
      "TypeScript compiles down to plain JavaScript for browser execution.",
      "It enhances developer productivity with better tooling and autocompletion.",
    ],
    css: [
      "CSS (Cascading Style Sheets) controls the visual presentation of web pages.",
      "Selectors target HTML elements to apply styles.",
      "The box model consists of content, padding, border, and margin.",
      "Flexbox provides one-dimensional layout capabilities.",
      "Grid offers two-dimensional layout control.",
      "Responsive design uses media queries for different screen sizes.",
      "CSS animations and transitions create dynamic user experiences.",
    ],
    python: [
      "Python is a high-level, interpreted programming language known for readability.",
      "It uses indentation for code blocks instead of curly braces.",
      "Python has a vast standard library and ecosystem of third-party packages.",
      "It is widely used in data science, machine learning, and web development.",
      "List comprehensions provide a concise way to create lists.",
      "Python supports multiple programming paradigms including OOP and functional.",
    ],
    node: [
      "Node.js is a JavaScript runtime built on Chrome's V8 engine.",
      "It allows JavaScript to run on the server-side.",
      "Node.js uses an event-driven, non-blocking I/O model.",
      "npm (Node Package Manager) is the largest ecosystem of open-source libraries.",
      "Express.js is a popular web framework for building APIs.",
      "Node.js is ideal for building scalable network applications.",
    ],
  };

  const key = topic.toLowerCase();
  for (const [pattern, items] of Object.entries(bullets)) {
    if (key.includes(pattern)) return items;
  }

  return [
    `${topic} is an important topic in this subject area.`,
    `Key principles of ${topic} form the foundation of understanding.`,
    `${topic} has several practical applications in real-world scenarios.`,
    `Studying ${topic} helps develop critical thinking skills.`,
    `Advanced concepts in ${topic} build upon these fundamentals.`,
    `${topic} continues to evolve with new research and developments.`,
    `Understanding ${topic} is essential for academic and professional growth.`,
  ];
}

function generateSummary(topic: string, title: string): string {
  return `${title || topic} encompasses a wide range of concepts and applications. Mastering these fundamentals will provide a solid foundation for further exploration. Remember to practice regularly, apply what you've learned through hands-on projects, and seek out additional resources to deepen your understanding. Continuous learning is key to staying current in this field.`;
}

export function generateStudyNotes(title: string, topic: string): StudyContent {
  const bulletPoints = generateBulletPoints(topic);
  const summary = generateSummary(topic, title);
  return {
    title: title || `Study Notes: ${topic}`,
    bulletPoints,
    summary,
  };
}