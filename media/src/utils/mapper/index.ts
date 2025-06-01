/**
 * Exports utilities for mapping User entities to various response formats.
 *
 * Workflow:
 * 1. Provides functions to transform User entities for email-based, ID-based, and token-based responses.
 */
export {
  mapUserToResponseByEmail,
  mapUserToResponseById,
  mapUserToTokenData,
} from "./user/user.mapper";
