import { Brackets } from "typeorm";
import { SiteSettings } from "../../../entities";
import {
  shopAddressRepository,
  siteSettingsRepository,
} from "../repositories/repositories";

/**
 * Retrieves the site settings.
 *
 * Workflow:
 * 1. Fetches the first site settings record from the database.
 * 2. Returns null if no records are found.
 *
 * @returns Promise resolving to SiteSettings or null if not found.
 */
export const getSiteSettings = async (): Promise<SiteSettings | null> => {
  const siteSettings = await siteSettingsRepository.findOne({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      metaData: true,
      favIcon: true,
      logo: true,
      contactNumber: true,
      contactEmail: true,
      privacyPolicy: true,
      termsAndConditions: true,
      createdBy: true,
      createdAt: true,
      deletedAt: true,
    },
  });

  return siteSettings || null;
};

interface ShopAddress {
  id: string;
  brunchName?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  emails?:
    | {
        type: "Corporate" | "Complain" | "Support" | "Other" | null;
        email: string | null;
      }[]
    | null;
  phones?:
    | {
        type: "Mobile" | "Landline" | "Fax" | "Other" | null;
        number: string | null;
      }[]
    | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipCode?: string | null;
  direction?: string | null;
}

/**
 * Retrieves shop addresses with pagination and optional search using query builder.
 *
 * Workflow:
 * 1. Builds a query to fetch shop addresses from the database.
 * 2. Applies isActive filter for customers if forCustomer is true.
 * 3. Applies search filter across brunchName, city, state, and country if provided.
 * 4. Paginates the results.
 *
 * @param page - The page number to retrieve.
 * @param limit - The number of items per page.
 * @param search - Optional search term to filter results.
 * @param forCustomer - If true, returns only active addresses; if false, returns all addresses.
 * @returns Promise resolving to an object containing the paginated shop addresses and total count.
 */
export const getShopAddresses = async (
  page: number,
  limit: number,
  search?: string,
  forCustomer: boolean = true
): Promise<{ data: ShopAddress[]; total: number }> => {
  // Create base query
  const query = shopAddressRepository
    .createQueryBuilder("address")
    .where("address.deletedAt IS NULL"); // Filter out soft-deleted addresses

  // Apply isActive filter for customers
  if (forCustomer) {
    query.andWhere("address.isActive = :isActive", { isActive: true });
  }

  // Apply search filter if provided
  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim()}%`;
    query.andWhere(
      new Brackets((qb) => {
        qb.where("address.brunchName ILIKE :searchTerm", { searchTerm })
          .orWhere("address.city ILIKE :searchTerm", { searchTerm })
          .orWhere("address.state ILIKE :searchTerm", { searchTerm })
          .orWhere("address.country ILIKE :searchTerm", { searchTerm });
      })
    );
  }

  // Get total count for pagination
  const total = await query.getCount();

  // Apply pagination
  const data = await query
    .skip((page - 1) * limit)
    .take(limit)
    .getMany();

  return { data, total };
};

/**
 * Retrieves the shop address marked as default for tax purposes using query builder.
 *
 * Workflow:
 * 1. Builds a query to fetch the shop address with isDefaultForTax set to true.
 * 2. Returns the first matching address or null if not found.
 *
 * @returns Promise resolving to the default tax shop address or null if not found.
 */
export const getShopForDefaultTax = async (): Promise<ShopAddress | null> => {
  const address = await shopAddressRepository
    .createQueryBuilder("address")
    .where("address.isDefaultForTax = :isDefaultForTax", {
      isDefaultForTax: true,
    })
    .andWhere("address.deletedAt IS NULL")
    .getOne();

  return address || null;
};
