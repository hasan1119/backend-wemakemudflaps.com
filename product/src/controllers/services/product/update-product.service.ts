import { In } from "typeorm";
import { Product } from "../../../entities";
import { AppDataSource } from "../../../helper";
import { MutationUpdateProductArgs } from "../../../types";
import {
  productAttributeRepository,
  productAttributeValueRepository,
  productPriceRepository,
  productRepository,
  productVariationRepository,
} from "../repositories/repositories";
import { getProductById } from "./get-product.service";

/**
 * Updates a product and its related entities including variations and tier pricing.
 *
 * Handles:
 * - Scalar fields replacement
 * - Relations replacement (category, subcategories, brands, tags, tax, shipping, etc.)
 * - Variations replacement with proper create/update/delete and tierPricingInfo association by ID
 * - Tier pricing for main product replacement
 *
 * @param productId - UUID of product to update
 * @param currentProduct - The current product entity to update
 * @param data - Partial data to update the product
 * @returns Updated Product entity
 */
export const updateProduct = async (
  currentProduct: Product,
  data: Partial<MutationUpdateProductArgs>
): Promise<Product> => {
  return await AppDataSource.manager.transaction(async (entityManager) => {
    const product = currentProduct;

    // Replace scalar fields directly
    if (data.name !== undefined && data.name !== null) product.name = data.name;
    if (data.slug !== undefined && data.slug !== null) product.slug = data.slug;
    if (data.defaultImage !== undefined)
      product.defaultImage = data.defaultImage;
    if (data.images !== undefined) product.images = data.images;
    if (data.videos !== undefined) product.videos = data.videos;
    if (data.defaultMainDescription !== undefined)
      product.defaultMainDescription = data.defaultMainDescription;
    if (data.defaultShortDescription !== undefined)
      product.defaultShortDescription = data.defaultShortDescription;
    if (data.regularPrice !== undefined)
      product.regularPrice = data.regularPrice;
    if (data.salePrice !== undefined) product.salePrice = data.salePrice;
    if (data.salePriceStartAt !== undefined) {
      product.salePriceStartAt =
        data.salePriceStartAt === null
          ? null
          : typeof data.salePriceStartAt === "string"
          ? new Date(data.salePriceStartAt)
          : data.salePriceStartAt;
    }
    if (data.salePriceEndAt !== undefined) {
      product.salePriceEndAt =
        data.salePriceEndAt === null
          ? null
          : typeof data.salePriceEndAt === "string"
          ? new Date(data.salePriceEndAt)
          : data.salePriceEndAt;
    }
    if (data.saleQuantity !== undefined)
      product.saleQuantity = data.saleQuantity;
    if (data.saleQuantityUnit !== undefined)
      product.saleQuantityUnit = data.saleQuantityUnit;
    if (data.minQuantity !== undefined) product.minQuantity = data.minQuantity;
    if (data.defaultQuantity !== undefined)
      product.defaultQuantity = data.defaultQuantity;
    if (data.maxQuantity !== undefined) product.maxQuantity = data.maxQuantity;
    if (data.quantityStep !== undefined)
      product.quantityStep = data.quantityStep ?? 1;
    if (data.sku !== undefined) product.sku = data.sku;
    if (data.model !== undefined) product.model = data.model;
    if (data.manageStock !== undefined) product.manageStock = data.manageStock;
    if (data.stockQuantity !== undefined)
      product.stockQuantity = data.stockQuantity;
    if (data.allowBackOrders !== undefined)
      product.allowBackOrders = (data.allowBackOrders as any) ?? null;
    if (data.lowStockThresHold !== undefined)
      product.lowStockThresHold = data.lowStockThresHold ?? null;
    if (data.stockStatus !== undefined)
      product.stockStatus = (data.stockStatus as any) ?? null;
    if (data.soldIndividually !== undefined)
      product.soldIndividually = data.soldIndividually;
    if (data.initialNumberInStock !== undefined)
      product.initialNumberInStock = (data.initialNumberInStock as any) ?? null;
    if (data.weightUnit !== undefined)
      product.weightUnit = (data.weightUnit as any) ?? null;
    if (data.weight !== undefined) product.weight = data.weight;
    if (data.dimensionUnit !== undefined)
      product.dimensionUnit = (data.dimensionUnit as any) ?? null;
    if (data.length !== undefined) product.length = data.length;
    if (data.width !== undefined) product.width = data.width;
    if (data.height !== undefined) product.height = data.height;
    if (data.purchaseNote !== undefined)
      product.purchaseNote = data.purchaseNote;
    if (data.enableReviews !== undefined)
      product.enableReviews = data.enableReviews ?? true;
    if (data.customBadge !== undefined) product.customBadge = data.customBadge;
    if (data.isVisible !== undefined)
      product.isVisible = data.isVisible ?? false;
    if (data.productConfigurationType !== undefined)
      product.productConfigurationType =
        (data.productConfigurationType as any) ?? null;
    if (data.productDeliveryType !== undefined)
      product.productDeliveryType = (data.productDeliveryType as any) ?? null;
    if (data.isCustomized !== undefined)
      product.isCustomized = data.isCustomized;
    if (data.warrantyDigit !== undefined)
      product.warrantyDigit = data.warrantyDigit;
    if (data.defaultWarrantyPeriod !== undefined)
      product.defaultWarrantyPeriod =
        (data.defaultWarrantyPeriod as any) ?? null;
    if (data.warrantyPolicy !== undefined)
      product.warrantyPolicy = data.warrantyPolicy;
    if (data.taxStatus !== undefined)
      product.taxStatus = (data.taxStatus as any) ?? null;

    // Replace relational fields
    if (data.brandIds !== undefined) {
      product.brands = data.brandIds?.length
        ? data.brandIds.map((id) => ({ id } as any))
        : null;
    }

    if (data.tagIds !== undefined) {
      product.tags = data.tagIds?.length
        ? data.tagIds.map((id) => ({ id } as any))
        : null;
    }

    if (data.categoryIds !== undefined) {
      product.categories = data.categoryIds?.length
        ? data.categoryIds.map((id) => ({ id } as any))
        : null;
    }

    if (data.taxClassId !== undefined) {
      product.taxClass = data.taxClassId
        ? ({ id: data.taxClassId } as any)
        : null;
    }

    if (data.shippingClassId !== undefined) {
      product.shippingClass = data.shippingClassId
        ? ({ id: data.shippingClassId } as any)
        : null;
    }

    if (data.attributeIds !== undefined) {
      const currentProductAttributes = currentProduct.attributes.map(
        (attr) => attr.id
      );

      if (data.attributeIds?.length > 0) {
        await productAttributeRepository.update(
          { id: In(currentProductAttributes) },
          { product: null }
        );

        product.attributes = data.attributeIds.map((id) => ({ id } as any));
      } else {
        await productAttributeRepository.delete({
          product: { id: currentProduct.id },
        });

        product.attributes = null;
      }
    }

    // Process variations
    const processedVariations = [];

    // Replace variations
    if (data.variations !== undefined) {
      const idsToDelete = currentProduct.variations.map((v) => v.id);

      const variationsToDelete = await productVariationRepository.find({
        where: { id: In(idsToDelete), product: { id: currentProduct.id } },
        relations: ["brands", "attributeValues", "tierPricingInfo"],
      });

      // Remove product attribute values for variations
      await productAttributeRepository.update(
        { id: In(currentProduct.variations.map((v) => v.id)) },
        { product: null }
      );

      currentProduct.variations.map(async (variation) => {
        const tierPricingInfo = await variation.tierPricingInfo;
        if (tierPricingInfo) {
          await productPriceRepository.remove(tierPricingInfo);
        }
      });

      if (variationsToDelete?.length > 0) {
        await productVariationRepository.delete({
          id: In(variationsToDelete.map((v) => v.id)),
          product: { id: currentProduct.id },
        });

        await productAttributeValueRepository.delete({
          id: In(
            (
              await Promise.all(
                variationsToDelete.map(async (v) => await v.attributeValues)
              )
            )
              .flat()
              .map((av) => av.id)
          ),
        });
      }
    }

    if (data.variations && data.variations?.length > 0) {
      for (const v of data.variations) {
        // Create variation without brands to avoid type mismatch
        const variation = productVariationRepository.create({
          ...v,
          brands: v.brandIds?.length
            ? v.brandIds.map((id) => ({ id } as any))
            : [],
          tierPricingInfo: null,
          attributeValues: v.attributeValueIds?.length
            ? v.attributeValueIds.map((av) => ({ id: av }))
            : [],
          shippingClass: v.shippingClassId ? { id: v.shippingClassId } : null,
          taxClass: v.taxClassId ? { id: v.taxClassId } : null,
          product: currentProduct, // Link to the main product
          quantityStep: v.quantityStep ?? 1,
        } as any);
        processedVariations.push(variation);

        currentProduct.variations = processedVariations?.length
          ? await productVariationRepository.save(processedVariations as any)
          : null;

        // Save tier pricing info for the variation
        if (v.tierPricingInfo) {
          const processedTierPricingInfo = await productPriceRepository.create({
            ...v.tierPricingInfo,
            productVariation: variation, // Link to the variation
          } as any);

          const savedPricing = await productPriceRepository.save(
            processedTierPricingInfo
          );

          // Attach tier pricing back to the variation (only if the relation allows it)
          if (currentProduct.variations[0]) {
            currentProduct.variations[0].tierPricingInfo = savedPricing as any;
          }
          await productVariationRepository.save(variation);
        }
      }
    } else {
      // If no variations are provided, set variations to null
      currentProduct.variations = null;
    }

    // Replace upsells
    if (data.upsellIds !== undefined) {
      if (data.upsellIds === null) {
        const upsellExists = await entityManager.query(`
          SELECT to_regclass('public.product_upsells') IS NOT NULL AS exists
        `);
        if (upsellExists?.[0]?.exists) {
          (await entityManager
            .createQueryBuilder()
            .delete()
            .from("product_upsells")
            .where('"productId_1" = :id', { id: product.id })
            .execute()) ||
            (await entityManager
              .createQueryBuilder()
              .delete()
              .from("product_upsells")
              .where('"productId_2" = :id', { id: product.id })
              .execute());
        }
        product.upsells = [];
      } else {
        product.upsells = data.upsellIds?.length
          ? data.upsellIds.map((id) => ({ id } as any))
          : [];
      }
    }

    // Replace cross sells
    if (data.crossSellIds !== undefined) {
      if (data.crossSellIds === null) {
        const crossSellExists = await entityManager.query(`
          SELECT to_regclass('public.product_cross_sells') IS NOT NULL AS exists
        `);
        if (crossSellExists?.[0]?.exists) {
          (await entityManager
            .createQueryBuilder()
            .delete()
            .from("product_cross_sells")
            .where('"productId_1" = :id', { id: product.id })
            .execute()) ||
            (await entityManager
              .createQueryBuilder()
              .delete()
              .from("product_cross_sells")
              .where('"productId_2" = :id', { id: product.id })
              .execute());
        }
        product.crossSells = [];
      } else {
        product.crossSells = data.crossSellIds?.length
          ? data.crossSellIds.map((id) => ({ id } as any))
          : [];
      }
    }

    // Replace tier pricing info for main product
    if (data.tierPricingInfo !== undefined) {
      if (currentProduct.tierPricingInfo) {
        const tierPricingInfo = await productPriceRepository.find({
          where: { product: { id: currentProduct.id } },
          relations: ["productVariation", "tieredPrices"],
        });

        product.tierPricingInfo = null;

        await productRepository.save(product);

        await productPriceRepository.remove(tierPricingInfo);
      }

      const processedTierPricingInfo = data.tierPricingInfo
        ? await productPriceRepository.create({
            ...data.tierPricingInfo,
            product: { id: currentProduct.id }, // Ensure productId is set
          } as any)
        : null;

      product.tierPricingInfo = processedTierPricingInfo
        ? await productPriceRepository.save(processedTierPricingInfo as any)
        : null;
    }

    // Save and return updated product
    await productRepository.save(product);
    return getProductById(product.id);
  });
};
