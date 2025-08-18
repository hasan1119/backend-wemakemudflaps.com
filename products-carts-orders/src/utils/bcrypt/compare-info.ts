import bcrypt from "bcryptjs";

/**
 * Compares plain data with hashed data using bcrypt.
 *
 * Workflow:
 * 1. Uses bcrypt to compare the provided plain data against the hashed data.
 * 2. Returns a boolean indicating whether the data matches the hash.
 *
 * @param data - The plain data to compare.
 * @param hash - The hashed data to compare against.
 * @returns A promise resolving to a boolean indicating if the data matches the hash.
 */
const CompareInfo = async (data: string, hash: string): Promise<boolean> => {
  // Compare the plain data with the hashed data using bcrypt
  return await bcrypt.compare(data, hash);
};

export default CompareInfo;
