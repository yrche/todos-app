import { fileURLToPath } from "node:url";
import * as path from "node:path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFilePath = path.join(__dirname, "../../.env");
dotenv.config({ path: envFilePath });

const logFilePath = path.join(
  __dirname,
  `../${process.env.LOG_PATH as string}`,
);

export default process.env;
export { __filename, __dirname, envFilePath, logFilePath };
