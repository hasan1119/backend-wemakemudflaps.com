import bcrypt from "bcryptjs";
import config from "../../config/config";

/**
 * Hashes data using bcrypt with a configured salt.
 *
 * Workflow:
 * 1. Applies bcrypt hashing to the input data using the specified salt rounds from config.
 * 2. Returns the resulting hash as a string.
 *
 * @param data - The data to be hashed.
 * @returns A promise resolving to the hashed data.
 */
const HashInfo = async (data: string) => {
  // Hash the data using bcrypt with a salt rounds value
  return await bcrypt.hash(data, config.SALT_ROUNDS);
};

export default HashInfo;
