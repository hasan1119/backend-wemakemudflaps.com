import jwt from "jsonwebtoken";
import config from "../../config/config";

/**
 * Generates a JWT token for a user based on their details.
 *
 * @param user_id - The user's unique ID.
 * @param email - The user's email.
 * @param username - The user's username.
 * @param first_name - The user's first name.
 * @param last_name - The user's last name.
 * @param role - The user's role.
 * @param trackingId - The user's tracking ID.
 * @param expiresIn - Optional. The token expiration time.
 * @returns {Promise<string>} - A promise that resolves to the signed JWT token.
 */
const EncodeToken = async (
  user_id: number,
  email: string,
  username: string,
  first_name: string,
  last_name: string,
  role: string,
  expiresIn?: string
): Promise<string> => {
  // Payload to include in the token
  const PAYLOAD = {
    user_id,
    email,
    username,
    first_name,
    last_name,
    role,
  };

  // Use the provided expiresIn value or the default from config
  const tokenExpiresIn = expiresIn || config.EXPIRE;

  // Sign and return the JWT token
  return jwt.sign(PAYLOAD, config.SECRET_KEY, { expiresIn: tokenExpiresIn });
};

export default EncodeToken;
