import { createRequire } from "module";
import dotenv from "dotenv";

dotenv.config();

const require = createRequire(import.meta.url);
const SSLCommerzPayment = require("sslcommerz-lts");

export const instance = new SSLCommerzPayment(
  process.env.STORE_ID,
  process.env.STORE_PASSWORD,
  process.env.IS_LIVE === "true",
);

export const PRICE_PER_DAY = 10;
export const MAX_SUBSCRIPTION_DAYS = 30;
