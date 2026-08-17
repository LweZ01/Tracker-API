import "dotenv/config";

const REQUIRED_ENVS = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "NODE_ENV",
];
const PORT = parseInt(process.env.PORT || "3000", 10);

const missingEnvs = REQUIRED_ENVS.filter(
  (key) => !process.env[key] || process.env[key].trim() === "",
);

if (missingEnvs.length > 0) {
  console.error(
    `[Config] Missing required environment variables: ${missingEnvs.join(", ")}`,
  );
  process.exit(1);
}
if (isNaN(PORT)) {
  console.error(`[Config] Invalid PORT value: "${process.env.PORT}" is not a number`);
  process.exit(1);
}

const rawConfig = {
  PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  NODE_ENV: process.env.NODE_ENV || "development",
  REFRESH_TOKEN_TTL_MS: 7 * 24 * 60 * 60 * 1000,
};

function deepFreeze(obj) {
  Object.values(obj).forEach((value) => {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });
  return Object.freeze(obj);
}

export const config = deepFreeze(rawConfig);
