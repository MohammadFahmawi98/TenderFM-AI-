import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { OrganizationType } from "@prisma/client";

const KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");

  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, hash] = stored.split(":");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const hashedInput = scryptSync(password, salt, KEY_LENGTH);
  const storedHash = Buffer.from(hash, "hex");

  if (storedHash.length !== hashedInput.length) {
    return false;
  }

  return timingSafeEqual(storedHash, hashedInput);
}

export function toOrganizationType(companyType: string): OrganizationType {
  const normalized = companyType.toLowerCase();

  if (normalized.includes("cleaning")) return "CLEANING";
  if (normalized.includes("landscaping")) return "LANDSCAPING";
  if (normalized.includes("mep")) return "MEP_CONTRACTOR";
  if (normalized.includes("hvac")) return "HVAC_CONTRACTOR";
  if (normalized.includes("security")) return "SECURITY";
  if (normalized.includes("pest")) return "PEST_CONTROL";
  if (normalized.includes("government")) return "GOVERNMENT_ENTITY";
  if (normalized.includes("property")) return "PROPERTY_MANAGEMENT";

  return "FACILITY_MANAGEMENT";
}
