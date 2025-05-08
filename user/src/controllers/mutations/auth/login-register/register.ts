import { DeepPartial, Repository } from 'typeorm';
import { Context } from '../../../../context';
import {
  Permission,
  PermissionName,
} from '../../../../entities/permission.entity';
import { Role } from '../../../../entities/user-role.entity';
import { User } from '../../../../entities/user.entity';
import {
  getRegisterUserCountKeyCacheKey,
  getSingleUserCacheKey,
  getSingleUserPermissionCacheKey,
  getSingleUserRoleCacheKey,
  getSingleUserRoleInfoByNameCacheKey,
  getUserEmailCacheKey,
  getUserInfoByEmailCacheKey,
} from '../../../../helper/redis/session-keys';
import { BaseResponseOrError, MutationRegisterArgs } from '../../../../types';
import HashInfo from '../../../../utils/bcrypt/hash-info';
import { registerSchema } from '../../../../utils/data-validation';

// List of all possible permission names for the system
const PermissionNames: PermissionName[] = [
  'User',
  'Brand',
  'Category',
  'Permission',
  'Product',
  'Product Review',
  'Shipping Class',
  'Sub Category',
  'Tax Class',
  'Tax Status',
  'FAQ',
  'News Letter',
  'Pop Up Banner',
  'Privacy & Policy',
  'Terms & Conditions',
  'Role',
  'Order',
  'Notification',
  'Media',
];

/**
 * Registers a new user in the system.
 *
 * Steps:
 * - Validates input using Zod schema
 * - Registers the first user as a Super Admin if no users or Super Admin role exists
 * - Otherwise registers a user with a Customer role and sets default permissions
 * - Sends a account activation email
 * - Caches the user's data, role, and permissions in Redis
 *
 * @param _ - Unused GraphQL parent argument
 * @param args - Registration arguments (firstName, lastName, email, password, gender)
 * @param context - GraphQL context with AppDataSource
 * @returns Promise<BaseResponseOrError> - Response status and message
 */
export const register = async (
  _: any,
  args: MutationRegisterArgs,
  { AppDataSource, redis }: Context
): Promise<BaseResponseOrError> => {
  const { firstName, lastName, email, password, gender } = args;
  const { getSession, setSession, deleteSession } = redis;

  try {
    // Validate input data using Zod schema
    const validationResult = await registerSchema.safeParseAsync({
      firstName,
      lastName,
      email,
      password,
      gender,
    });

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((error) => ({
        field: error.path.join('.'),
        message: error.message,
      }));

      return {
        statusCode: 400,
        success: false,
        message: 'Validation failed',
        errors: errorMessages,
        __typename: 'ErrorResponse',
      };
    }

    // Initialize repositories
    const userRepository: Repository<User> = AppDataSource.getRepository(User);
    const roleRepository: Repository<Role> = AppDataSource.getRepository(Role);
    const permissionRepository: Repository<Permission> =
      AppDataSource.getRepository(Permission);

    // Check Redis for cached user's email
    let userEmail;

    userEmail = await getSession(getUserEmailCacheKey(email));

    if (userEmail) {
      return {
        statusCode: 400,
        success: false,
        message: 'Email already in use',
        __typename: 'BaseResponse',
      };
    } else {
      // Cache miss: Fetch user from database
      userEmail = await userRepository.findOne({ where: { email } });
      if (userEmail) {
        return {
          statusCode: 400,
          success: false,
          message: 'Email already in use',
          __typename: 'BaseResponse',
        };
      }
    }

    // Hash the password
    const hashedPassword = await HashInfo(password);

    // Check Redis for cached users count
    let userCount;

    userCount = await getSession(getRegisterUserCountKeyCacheKey());

    if (!userCount) {
      // Cache miss: Fetch users count from database
      userCount = await userRepository.count();
    }

    // Initiate the empty variable for the user role & super admin
    let role;

    if (Number(userCount) === 0) {
      // Create Super Admin role
      const savedRole = roleRepository.create({
        name: 'SUPER ADMIN',
        description: 'Has full control over all aspects of the platform.',
        createdBy: null,
      });
      role = await roleRepository.save(savedRole);

      // Cache user role info in Redis with configurable TTL(default 30 days of redis session because of the env)
      await setSession(
        getSingleUserRoleInfoByNameCacheKey('super admin'),
        role
      );

      // Create Super Admin user
      const newUser = userRepository.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        gender: gender || null,
        role, // Assign the Role entity object
      });

      const savedUser = await userRepository.save(newUser);

      // Create permissions for Super Admin
      const permissions = PermissionNames.map((name: PermissionName) =>
        permissionRepository.create({
          name,
          description: `${name} permission for Super Admin`,
          user: savedUser, // Assign user to each permission
          createdBy: null, // Since no one created the first user
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
        } as DeepPartial<Permission>)
      );

      const fullPermissions = await permissionRepository.save(permissions);

				// Create the account activation link with user id
    		const activationLink = `${CONFIG.FRONTEND_URL}/active-account/?userId=${savedUser.id}`;

    // Prepare email contents
    const subject = 'Account Activation Request';
    const text = `Please use the following link to active your account: ${resetLink}`;
    const html = `<p>Please use the following link to active your account: <a href="${activationLink}">${activationLink}</a></p>`;

    // Attempt to send the reset email
    const emailSent = await SendEmail({
      to: email,
      subject,
      text,
      html,
    });

    // If email sending fails, return an error
    if (!emailSent) {
 				// Delete the newly created user's permissions & user
				await permissionRepository.delete({ user: savedUser });
				await userRepository.delete({ id: savedUser.id });

      return {
        statusCode: 500,
        success: false,
        message: 'Registration failed. Failed to send account activation email.',
        __typename: 'BaseResponse',
      };
    }

      // Cache newly register user, user email, user role & his/her permissions for curd, and update the userCount in Redis with configurable TTL(default 30 days of redis session because of the env)
      await setSession(getSingleUserCacheKey(savedUser.id), {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role.name,
      });
      await setSession(getUserInfoByEmailCacheKey(email), {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        password: savedUser.password,
        gender: savedUser.gender,
        role: savedUser.role.name,
        resetPasswordToken: null,
				  emailVerified: savedUser.emailVerified,
				  isAccountActivated: savedUser.isAccountActivated
      });
      await setSession(
        getRegisterUserCountKeyCacheKey(),
        (userCount + 1).toString()
      );
      await setSession(getUserEmailCacheKey(email), email);
      await setSession(getSingleUserRoleCacheKey(role.id), role);
      await setSession(
        getSingleUserPermissionCacheKey(savedUser.id),
        fullPermissions
      );

      return {
        statusCode: 201,
        success: true,
        message: 'Super Admin registered successfully. To active your account check your email.',
        __typename: 'BaseResponse',
      };
    } else {
      // Initiate the empty variable for the user role & customer
      let role;
      // Check Redis for cached user role info
      role = await getSession(getSingleUserRoleInfoByNameCacheKey('customer'));

      if (!role) {
        // Cache miss: Fetch user from database
        role = await roleRepository.findOne({
          where: { name: 'CUSTOMER' },
        });

        if (!role) {
          // Create customer role
          const savedRole = roleRepository.create({
            name: 'CUSTOMER',
            description:
              'Regular customers who can browse products, place orders, view their purchase history and other related things.',
            createdBy: null,
          });
          role = await roleRepository.save(savedRole);
        }

        // Cache user role info in Redis with configurable TTL(default 30 days of redis session because of the env)
        await setSession(getSingleUserRoleInfoByNameCacheKey('customer'), role);
      }

      // Create Customer user
      const savedUser = userRepository.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        gender: gender || null,
        role, // Assign the Role entity object
      });
      await userRepository.save(savedUser);

      // Assign CUSTOMER permissions
      const customerPermissions = PermissionNames.map(
        (name: PermissionName) => {
          let canCreate = false;
          let canRead = true;
          let canUpdate = false;
          let canDelete = false;

          if (name === 'Order') {
            canCreate = true;
            canRead = true;
            canUpdate = false;
            canDelete = true;
          }
          if (name === 'Permission') {
            canCreate = false;
            canRead = false;
            canUpdate = false;
            canDelete = false;
          }
          if (name === 'News Letter') {
            canCreate = false;
            canRead = false;
            canUpdate = false;
            canDelete = false;
          }

          if (name === 'Product Review') {
            canCreate = true;
            canRead = true;
            canUpdate = true;
            canDelete = true;
          }

          if (name === 'Notification') {
            canCreate = false;
            canRead = true;
            canUpdate = true;
            canDelete = true;
          }

          if (name === 'User') {
            canCreate = false;
            canRead = false;
            canUpdate = false;
            canDelete = false;
          }

          if (name === 'Role') {
            canCreate = false;
            canRead = false;
            canUpdate = false;
            canDelete = false;
          }

          if (name === 'Media') {
            canCreate = false;
            canRead = false;
            canUpdate = false;
            canDelete = false;
          }

          return permissionRepository.create({
            name,
            description: `Access to ${name} features`,
            user: savedUser,
            createdBy: null,
            canCreate,
            canRead,
            canUpdate,
            canDelete,
          } as DeepPartial<Permission>);
        }
      );

      const fullCustomerPermissions = await permissionRepository.save(
        customerPermissions
      );

// Create the account activation link with user id
    		const activationLink = `${CONFIG.FRONTEND_URL}/active-account/?userId=${savedUser.id}`;

    // Prepare email contents
    const subject = 'Account Activation Request';
    const text = `Please use the following link to active your account: ${resetLink}`;
    const html = `<p>Please use the following link to active your account: <a href="${activationLink}">${activationLink}</a></p>`;

    // Attempt to send the reset email
    const emailSent = await SendEmail({
      to: email,
      subject,
      text,
      html,
    });

    // If email sending fails, return an error
    if (!emailSent) {
 				// Delete the newly created user's permissions & user
				await permissionRepository.delete({ user: savedUser });
				await userRepository.delete({ id: savedUser.id });

      return {
        statusCode: 500,
        success: false,
        message: 'Registration failed. Failed to send account activation email.',
        __typename: 'BaseResponse',
      };
    }

      // Cache newly register user, user email, user role & his/her permissions for curd, and update useCount in Redis with configurable TTL(default 30 days of redis session because of the env)
      await setSession(getSingleUserCacheKey(savedUser.id), {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role.name,
      });
      await setSession(getUserInfoByEmailCacheKey(email), {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        password: savedUser.password,
        gender: savedUser.gender,
        role: savedUser.role.name,
        resetPasswordToken: null,
				  emailVerified: savedUser.emailVerified,
				  isAccountActivated: savedUser.isAccountActivated
      });
      await setSession(
        getRegisterUserCountKeyCacheKey(),
        (userCount + 1).toString()
      );
      await setSession(getUserEmailCacheKey(email), savedUser.email);
      await setSession(getSingleUserRoleCacheKey(role.id), role);
      await setSession(
        getSingleUserPermissionCacheKey(savedUser.id),
        fullCustomerPermissions
      );

      return {
        statusCode: 201,
        success: true,
        message: 'Registration successful. To active your account check your email.',
        __typename: 'BaseResponse',
      };
    }
  } catch (error: any) {
    console.error('Error registering user:', error);
    return {
      statusCode: 500,
      success: false,
      message: error.message || 'Internal server error',
      __typename: 'BaseResponse',
    };
  }
};
