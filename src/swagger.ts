import { Router, Request, Response } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { env } from "./env";

const router = Router();

const options: swaggerJSDoc.Options = {
  swaggerDefinition: {
    openapi: "3.0.0",

    info: {
      title: "Video Streaming API",
      version: "1.0.0",
      description: "API documentation for Video Streaming API",
    },

    servers: [
      {
        url: `${env.BASE_URL}/api/v1`,
        description: "Production Server",
      },
      ...(env.NODE_ENV === "development"
        ? [
            {
              url: `http://localhost:${env.PORT}/api/v1`,
              description: "Development Server",
            },
          ]
        : []),
    ],

    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
        },
      },
    },

    tags: [
      { name: "Auth", description: "Authentication related endpoints" },
      { name: "User", description: "User related endpoints" },
      { name: "Video", description: "Video related endpoints" },
      { name: "Like", description: "Like related endpoints" },
      { name: "Comment", description: "Comment related endpoints" },
      { name: "Playlist", description: "Playlist related endpoints" },
      { name: "CommunityPost", description: "Community Post related endpoints" },
      { name: "Follower", description: "Follower related endpoints" },
      { name: "Dashboard", description: "Dashboard related endpoints" },
    ],
  },

  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

router.get("/json", (_req: Request, res: Response) => {
  res.json(swaggerSpec);
});

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;
