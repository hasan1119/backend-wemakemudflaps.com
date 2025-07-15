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
 * - Scalar fields update
 * - Relations update (category, subcategories, brands, tags, tax, shipping, etc.)
 * - Variations update with proper create/update/delete and tierPricingInfo association by ID
 * - Tier pricing for main product update
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

  // Update scalar fields if provided, else keep existing
  product.name = data.name ?? product.name;
  product.slug = data.slug ?? product.slug;
  product.defaultImage = data.defaultImage ?? product.defaultImage;
  product.images = data.images ?? product.images;
  product.videos = data.videos ?? product.videos;
  product.defaultMainDescription =
    data.defaultMainDescription ?? product.defaultMainDescription;
  product.defaultShortDescription =
    data.defaultShortDescription ?? product.defaultShortDescription;
  product.defaultTags = data.defaultTags ?? product.defaultTags;
  product.regularPrice = data.regularPrice ?? product.regularPrice;
  product.salePrice = data.salePrice ?? product.salePrice;

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

  product.saleQuantity = data.saleQuantity ?? product.saleQuantity;
  product.saleQuantityUnit = data.saleQuantityUnit ?? product.saleQuantityUnit;
  product.minQuantity = data.minQuantity ?? product.minQuantity;
  product.defaultQuantity = data.defaultQuantity ?? product.defaultQuantity;
  product.maxQuantity = data.maxQuantity ?? product.maxQuantity;
  product.quantityStep = data.quantityStep ?? product.quantityStep;
  product.sku = data.sku ?? product.sku;
  product.model = data.model ?? product.model;
  product.manageStock = data.manageStock ?? product.manageStock;
  product.stockQuantity = data.stockQuantity ?? product.stockQuantity;
  product.allowBackOrders = data.allowBackOrders ?? product.allowBackOrders;
  product.lowStockThresHold =
    data.lowStockThresHold ?? product.lowStockThresHold;
  product.stockStatus = data.stockStatus ?? product.stockStatus;
  product.soldIndividually = data.soldIndividually ?? product.soldIndividually;
  product.initialNumberInStock =
    data.initialNumberInStock ?? product.initialNumberInStock;
  product.weightUnit = data.weightUnit ?? product.weightUnit;
  product.weight = data.weight ?? product.weight;
  product.dimensionUnit = data.dimensionUnit ?? product.dimensionUnit;
  product.length = data.length ?? product.length;
  product.width = data.width ?? product.width;
  product.height = data.height ?? product.height;
  product.purchaseNote = data.purchaseNote ?? product.purchaseNote;
  product.enableReviews = data.enableReviews ?? product.enableReviews;
  product.customBadge = data.customBadge ?? product.customBadge;
  product.isPreview = data.isPreview ?? product.isPreview;
  product.isVisible = data.isVisible ?? product.isVisible;
  product.productConfigurationType =
    data.productConfigurationType ?? product.productConfigurationType;
  product.productDeliveryType =
    data.productDeliveryType ?? product.productDeliveryType;
  product.isCustomized = data.isCustomized ?? product.isCustomized;
  product.warrantyDigit = data.warrantyDigit ?? product.warrantyDigit;
  product.defaultWarrantyPeriod =
    data.defaultWarrantyPeriod ?? product.defaultWarrantyPeriod;
  product.warrantyPolicy = data.warrantyPolicy ?? product.warrantyPolicy;
  product.taxStatus = data.taxStatus ?? product.taxStatus;

  // Update relational fields
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

  // Handle variations update
  if (data.variations !== undefined) {
    // Load existing variations from DB
    const existingVariations = await productRepository
      .createQueryBuilder("product")
      .relation(Product, "variations")
      .of(product)
      .loadMany();

    const newVariationIds = data.variations
      .filter((v: any) => v.id)
      .map((v: any) => v.id);

    const oldVariationIds = existingVariations.map((v) => v.id);

    // Determine variations to delete (present in DB but missing in update data)
    const toDeleteIds = oldVariationIds.filter(
      (id) => !newVariationIds.includes(id)
    );

    if (toDeleteIds.length > 0) {
      // Delete variations from DB (hard delete)
      await productRepository.manager
        .getRepository("ProductVariation")
        .delete(toDeleteIds);
    }

    const variationRepo =
      productRepository.manager.getRepository("ProductVariation");
    const tierPriceRepo =
      productRepository.manager.getRepository("ProductPrice");

    // Process each variation input for update or create
    for (const variationInput of data.variations) {
      let variationEntity;

      if (variationInput.id) {
        // Existing variation - find entity to update
        variationEntity = existingVariations.find(
          (v) => v.id === variationInput.id
        );
        if (!variationEntity) continue; // Skip if not found

        // Update scalar fields for variation
        variationEntity.sku = variationInput.sku ?? variationEntity.sku;
        variationEntity.productDeliveryType =
          variationInput.productDeliveryType ??
          variationEntity.productDeliveryType;
        variationEntity.minQuantity =
          variationInput.minQuantity ?? variationEntity.minQuantity;
        variationEntity.defaultQuantity =
          variationInput.defaultQuantity ?? variationEntity.defaultQuantity;
        variationEntity.maxQuantity =
          variationInput.maxQuantity ?? variationEntity.maxQuantity;
        variationEntity.quantityStep =
          variationInput.quantityStep ?? variationEntity.quantityStep;
        variationEntity.regularPrice =
          variationInput.regularPrice ?? variationEntity.regularPrice;
        variationEntity.salePrice =
          variationInput.salePrice ?? variationEntity.salePrice;
        variationEntity.salePriceStartAt =
          typeof variationInput.salePriceStartAt === "string"
            ? new Date(variationInput.salePriceStartAt)
            : variationInput.salePriceStartAt ??
              variationEntity.salePriceStartAt;
        variationEntity.salePriceEndAt =
          typeof variationInput.salePriceEndAt === "string"
            ? new Date(variationInput.salePriceEndAt)
            : variationInput.salePriceEndAt ?? variationEntity.salePriceEndAt;
        variationEntity.stockStatus =
          variationInput.stockStatus ?? variationEntity.stockStatus;
        variationEntity.weightUnit =
          variationInput.weightUnit ?? variationEntity.weightUnit;
        variationEntity.weight =
          variationInput.weight ?? variationEntity.weight;
        variationEntity.dimensionUnit =
          variationInput.dimensionUnit ?? variationEntity.dimensionUnit;
        variationEntity.length =
          variationInput.length ?? variationEntity.length;
        variationEntity.width = variationInput.width ?? variationEntity.width;
        variationEntity.height =
          variationInput.height ?? variationEntity.height;
        variationEntity.warrantyDigit =
          variationInput.warrantyDigit ?? variationEntity.warrantyDigit;
        variationEntity.defaultWarrantyPeriod =
          variationInput.defaultWarrantyPeriod ??
          variationEntity.defaultWarrantyPeriod;
        variationEntity.warrantyPolicy =
          variationInput.warrantyPolicy ?? variationEntity.warrantyPolicy;
        variationEntity.description =
          variationInput.description ?? variationEntity.description;
        variationEntity.images =
          variationInput.images ?? variationEntity.images;
        variationEntity.videos =
          variationInput.videos ?? variationEntity.videos;
        variationEntity.taxStatus =
          variationInput.taxStatus ?? variationEntity.taxStatus;

        // Update relational fields for variation
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

        // Handle tierPricingInfo association by ID
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

        // Save updated variation entity
        await variationRepo.save(variationEntity);
      } else {
        // New variation - create entity
        variationEntity = variationRepo.create({
          ...variationInput,
          product: Promise.resolve(product),
        });

        // Associate existing tierPricingInfo if tierPricingInfoId is provided
        if (variationInput.tierPricingInfoId) {
          const tierPricing = await tierPriceRepo.findOne({
            where: { id: variationInput.tierPricingInfoId },
          });
          if (tierPricing) {
            variationEntity.tierPricingInfo = Promise.resolve(tierPricing);
          }
        }

        // Save new variation entity
        await variationRepo.save(variationEntity);
      }
    }
  }

  // Update upsells if provided
  if (data.upsellIds !== undefined) {
    product.upsells = data.upsellIds.map((id) => ({ id })) as any;
  }

  // Update cross sells if provided
  if (data.crossSellIds !== undefined) {
    product.crossSells = data.crossSellIds.map((id) => ({ id })) as any;
  }

  // Handle tier pricing for the main product (not variations)
  if (data.tierPricingInfo !== undefined) {
    const newTier = productPriceRepository.create(data.tierPricingInfo);
    const savedTier = await productPriceRepository.save(newTier);
    product.tierPricingInfo = Promise.resolve(savedTier);
  }

  // Save and return updated product entity
  return await productRepository.save(product);
};
