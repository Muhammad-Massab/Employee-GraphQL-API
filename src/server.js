import express from "express";
import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import depthLimit from "graphql-depth-limit";
import { createComplexityLimitRule } from "graphql-validation-complexity";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import resolvers and database config
import resolvers from "./resolvers/index.js";
import connectDB from "./config/db.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: "GET,POST",
    allowedHeaders: "Content-Type,Authorization",
  })
);
app.use(compression());

connectDB();

const typeDefs = readFileSync(
  path.join(__dirname, "./schemas/index.graphql"),
  "utf-8"
);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [
    depthLimit(5),
    createComplexityLimitRule(1000, {
      onCost: (cost) => console.log("Query cost:", cost),
    }),
  ],
  context: ({ req }) => ({ req }),
  cache: "bounded",
  persistedQueries: false,
  introspection: process.env.NODE_ENV !== "production",
  plugins: [
    {
      requestDidStart: () => ({
        willSendResponse({ response }) {
          // Security headers for GraphQL responses
          response.http.headers.set("X-Content-Type-Options", "nosniff");
          response.http.headers.set("X-Frame-Options", "DENY");
        },
      }),
    },
  ],
});

async function startServer() {
  try {
    await server.start();

    server.applyMiddleware({
      app,
      path: "/graphql",
      cors: false,
    });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(
        `Server running at http://localhost:${PORT}${server.graphqlPath}`
      );
      console.log(
        `GraphQL playground available at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully");
  server.stop().then(() => process.exit(0));
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully");
  server.stop().then(() => process.exit(0));
});

startServer();
