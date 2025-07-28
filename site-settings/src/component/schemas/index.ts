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
