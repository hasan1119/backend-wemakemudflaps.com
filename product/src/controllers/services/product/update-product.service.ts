import { Product } from "../../../entities";
import { MutationUpdateProductArgs } from "../../../types";
import {
  productPriceRepository,
  productRepository,
} from "../repositories/repositories";

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
  const product = currentProduct;

  // Replace scalar fields directly
  product.name = data.name;
  product.slug = data.slug;
  product.defaultImage = data.defaultImage;
  product.images = data.images;
  product.videos = data.videos;
  product.defaultMainDescription = data.defaultMainDescription;
  product.defaultShortDescription = data.defaultShortDescription;
  product.regularPrice = data.regularPrice;
  product.salePrice = data.salePrice;

  if (data.salePriceStartAt !== undefined) {
    product.salePriceStartAt =
      typeof data.salePriceStartAt === "string"
        ? new Date(data.salePriceStartAt)
        : data.salePriceStartAt;
  }

  if (data.salePriceEndAt !== undefined) {
    product.salePriceEndAt =
      typeof data.salePriceEndAt === "string"
        ? new Date(data.salePriceEndAt)
        : data.salePriceEndAt;
  }

  product.saleQuantity = data.saleQuantity;
  product.saleQuantityUnit = data.saleQuantityUnit;
  product.minQuantity = data.minQuantity;
  product.defaultQuantity = data.defaultQuantity;
  product.maxQuantity = data.maxQuantity;
  product.quantityStep = data.quantityStep;
  product.sku = data.sku;
  product.model = data.model;
  product.manageStock = data.manageStock;
  product.stockQuantity = data.stockQuantity;
  product.allowBackOrders = data.allowBackOrders;
  product.lowStockThresHold = data.lowStockThresHold;
  product.stockStatus = data.stockStatus;
  product.soldIndividually = data.soldIndividually;
  product.initialNumberInStock = data.initialNumberInStock;
  product.weightUnit = data.weightUnit;
  product.weight = data.weight;
  product.dimensionUnit = data.dimensionUnit;
  product.length = data.length;
  product.width = data.width;
  product.height = data.height;
  product.purchaseNote = data.purchaseNote;
  product.enableReviews = data.enableReviews;
  product.customBadge = data.customBadge;
  product.isPreview = data.isPreview;
  product.isVisible = data.isVisible;
  product.productConfigurationType = data.productConfigurationType;
  product.productDeliveryType = data.productDeliveryType;
  product.isCustomized = data.isCustomized;
  product.warrantyDigit = data.warrantyDigit;
  product.defaultWarrantyPeriod = data.defaultWarrantyPeriod;
  product.warrantyPolicy = data.warrantyPolicy;
  product.taxStatus = data.taxStatus;

  // Replace relational fields
  if (data.categoryIds !== undefined) {
    product.categories = data.categoryIds.map((id) => ({ id })) as any;
  }

  if (data.brandIds !== undefined) {
    product.brands = data.brandIds.map((id) => ({ id })) as any;
  }

  if (data.tagIds !== undefined) {
    product.tags = data.tagIds.map((id) => ({ id })) as any;
  }

  if (data.taxClassId !== undefined) {
    product.taxClass = data.taxClassId as any;
  }

  if (data.shippingClassId !== undefined) {
    product.shippingClass = data.shippingClassId
      ? ({ id: data.shippingClassId } as any)
      : null;
  }

  if (data.attributeIds !== undefined) {
    product.attributes = data.attributeIds.map((id) => ({ id })) as any;
  }

  // Replace variations
  if (data.variations !== undefined) {
    const existingVariations = await productRepository
      .createQueryBuilder("product")
      .relation(Product, "variations")
      .of(product)
      .loadMany();

    const newVariationIds = data.variations
      .filter((v: any) => v.id)
      .map((v: any) => v.id);

    const oldVariationIds = existingVariations.map((v) => v.id);

    const toDeleteIds = oldVariationIds.filter(
      (id) => !newVariationIds.includes(id)
    );

    if (toDeleteIds.length > 0) {
      await productRepository.manager
        .getRepository("ProductVariation")
        .delete(toDeleteIds);
    }

    const variationRepo =
      productRepository.manager.getRepository("ProductVariation");
    const tierPriceRepo =
      productRepository.manager.getRepository("ProductPrice");

    for (const variationInput of data.variations) {
      let variationEntity;

      if (variationInput.id) {
        variationEntity = existingVariations.find(
          (v) => v.id === variationInput.id
        );
        if (!variationEntity) continue;

        Object.assign(variationEntity, variationInput);

        if (variationInput.salePriceStartAt !== undefined) {
          variationEntity.salePriceStartAt =
            typeof variationInput.salePriceStartAt === "string"
              ? new Date(variationInput.salePriceStartAt)
              : variationInput.salePriceStartAt;
        }

        if (variationInput.salePriceEndAt !== undefined) {
          variationEntity.salePriceEndAt =
            typeof variationInput.salePriceEndAt === "string"
              ? new Date(variationInput.salePriceEndAt)
              : variationInput.salePriceEndAt;
        }

        if (variationInput.brandIds !== undefined) {
          variationEntity.brands = variationInput.brandIds.map((id) => ({
            id,
          })) as any;
        }

        if (variationInput.shippingClassId !== undefined) {
          variationEntity.shippingClass = variationInput.shippingClassId
            ? ({ id: variationInput.shippingClassId } as any)
            : null;
        }

        if (variationInput.taxClassId !== undefined) {
          variationEntity.taxClass = variationInput.taxClassId as any;
        }

        if (variationInput.attributeValues !== undefined) {
          variationEntity.attributeValues = variationInput.attributeValues.map(
            (attr) => ({
              id: attr.id,
              value: attr.value,
              attributeId: attr.attributeId,
              variationId: attr.variationId,
            })
          ) as any;
        }

        if (variationInput.tierPricingInfoId !== undefined) {
          const tierPricing = variationInput.tierPricingInfoId
            ? await tierPriceRepo.findOne({
                where: { id: variationInput.tierPricingInfoId },
              })
            : null;
          variationEntity.tierPricingInfo = tierPricing
            ? Promise.resolve(tierPricing)
            : null;
        }

        await variationRepo.save(variationEntity);
      } else {
        variationEntity = variationRepo.create({
          ...variationInput,
          product: Promise.resolve(product),
        });

        if (variationInput.tierPricingInfoId) {
          const tierPricing = await tierPriceRepo.findOne({
            where: { id: variationInput.tierPricingInfoId },
          });
          if (tierPricing) {
            variationEntity.tierPricingInfo = Promise.resolve(tierPricing);
          }
        }

        await variationRepo.save(variationEntity);
      }
    }
  }

  // Replace upsells
  if (data.upsellIds !== undefined) {
    product.upsells = data.upsellIds.map((id) => ({ id })) as any;
  }

  // Replace cross sells
  if (data.crossSellIds !== undefined) {
    product.crossSells = data.crossSellIds.map((id) => ({ id })) as any;
  }

  // Replace tier pricing info for main product
  if (data.tierPricingInfo !== undefined) {
    const newTier = productPriceRepository.create(data.tierPricingInfo);
    const savedTier = await productPriceRepository.save(newTier);
    product.tierPricingInfo = Promise.resolve(savedTier);
  }

  // Save and return updated product
  return await productRepository.save(product);
};
