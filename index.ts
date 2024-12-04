import express, { type Express, type Request, type Response } from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import http from "http";

import { initDB } from "./app/common/services/database.service";
import { initPassport } from "./app/common/services/passport-jwt.service";
import { loadConfig } from "./app/common/helper/config.hepler";
import { type IUser } from "./app/user/user.dto";
import errorHandler from "./app/common/middleware/error-handler.middleware";
import routes from "./app/routes";
import cors from "cors";
import Stripe from "stripe";
import { handleStripeWebhook } from "./app/payment/payment.controller";

loadConfig();

declare global {
  namespace Express {
    interface User extends Omit<IUser, "password"> {}
    interface Request {
      user?: User;
    }
  }
}

console.log(process.env.STRIPE_SECRET_KEY, "here")

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-11-20.acacia",
});

export const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

const port = Number(process.env.PORT) ?? 5000;

const app: Express = express();

app.use(cors());

app.post(
  "/webhook",
  express.raw({ type: "application/json" }), // Stripe expects raw body for webhooks
  handleStripeWebhook
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(morgan("dev"));

const initApp = async (): Promise<void> => {
  // init mongodb
  await initDB();

  // passport init
  initPassport();

  // set base path to /api
  app.use("/api", routes);

  app.get("/", (req: Request, res: Response) => {
    res.send({ status: "ok" });
  });

  // error handler
  app.use(errorHandler);
  http.createServer(app).listen(port, () => {
    console.log("Server is runnuing on port", port);
  });
};

void initApp();
