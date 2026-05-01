import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pg = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../prisma/generated/client/index.js");

const connectionString = process.env.DATABASE_URL || "postgresql://adityaidnani@localhost:5432/workflow_engine";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
