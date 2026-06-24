import { defineRailway, project, service } from "railway/iac";

export default defineRailway(() => {
  const frontend = service("frontend", {
    build: "cd frontend && npm install && npm run build",
    start: "cd frontend && node server.js",
    env: {
      NODE_ENV: "production",
    },
  });

  const backend = service("backend", {
    env: {
      NODE_ENV: "production",
    },
  });

  return project("Hallo-Bunda-Creative-Management", {
    resources: [frontend, backend],
  });
});
