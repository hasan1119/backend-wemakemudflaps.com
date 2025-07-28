import { readFileSync } from "fs";
import gql from "graphql-tag";
import path from "path";

/**
 * Loads and parses the shared GraphQL schema for common types used across services.
 *
 * Workflow:
 * 1. Reads the schema definition from the `shared.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed shared GraphQL schema as a DocumentNode.
 */
export const sharedDef = gql(
  readFileSync(path.join(__dirname, "./shared.graphql"), { encoding: "utf-8" })
);

/**
 * Loads and parses the GraphQL schema for faq-related types.
 *
 * Workflow:
 * 1. Reads the schema definition from the `faq/faq.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL schema for faqs as a DocumentNode.
 */
export const faqDef = gql(
  readFileSync(path.join(__dirname, "./faq/faq.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses the GraphQL schema for faq queries.
 *
 * Workflow:
 * 1. Reads the schema definition from the `faq/queries.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL schema for faq queries as a DocumentNode.
 */
export const faqQueriesDef = gql(
  readFileSync(path.join(__dirname, "./faq/queries.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses the GraphQL schema for faq mutations.
 *
 * Workflow:
 * 1. Reads the schema definition from the `faq/mutations.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL schema for faq mutations as a DocumentNode.
 */
export const faqMutationsDef = gql(
  readFileSync(path.join(__dirname, "./faq/mutations.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses the GraphQL schema for site settings-related types.
 *
 * Workflow:
 * 1. Reads the schema definition from the `site-settings/site-settings.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL schema for site settings as a DocumentNode.
 */
export const siteSettingsDef = gql(
  readFileSync(path.join(__dirname, "./site-settings/site-settings.graphql"), {
    encoding: "utf-8",
  })
);
/**
 * Loads and parses the GraphQL schema for site settings queries.
 *
 * Workflow:
 * 1. Reads the schema definition from the `site-settings/queries.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL schema for site settings queries as a DocumentNode.
 */
export const siteSettingsQueriesDef = gql(
  readFileSync(path.join(__dirname, "./site-settings/queries.graphql"), {
    encoding: "utf-8",
  })
);
/**
 * Loads and parses the GraphQL schema for site settings mutations.
 *
 * Workflow:
 * 1. Reads the schema definition from the `site-settings/mutations.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL schema for site settings mutations as a DocumentNode.
 */
export const siteSettingsMutationsDef = gql(
  readFileSync(path.join(__dirname, "./site-settings/mutations.graphql"), {
    encoding: "utf-8",
  })
);
