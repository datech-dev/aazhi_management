import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  ProductCreateInput,
  ProductUpdateInput,
  ProductSearchInput,
} from "@/lib/validations/product";
import { logAudit } from "./audit.service";

/**
 * Product & Custom Garments Catalog Service for Aazhi Designer Studio
 */

export async function getProducts(query: ProductSearchInput) {
  const {
    search,
    categoryId,
    collection,
    fabric,
    isCustomizable,
    stockStatus = "all",
    page = 1,
    pageSize = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const where: Prisma.ProductWhereInput = {
    isArchived: false,
    ...(categoryId ? { categoryId } : {}),
    ...(collection ? { collection: { contains: collection, mode: "insensitive" } } : {}),
    ...(fabric ? { fabric: { contains: fabric, mode: "insensitive" } } : {}),
    ...(isCustomizable !== undefined
      ? { isCustomizable: isCustomizable === "true" }
      : {}),
  };

  // Stock status filtering
  if (stockStatus === "in_stock") {
    where.availableQuantity = { gt: 0 };
  } else if (stockStatus === "out_of_stock") {
    where.availableQuantity = { equals: 0 };
  } else if (stockStatus === "low_stock") {
    where.AND = [
      { availableQuantity: { gt: 0 } },
      { availableQuantity: { lte: 5 } },
    ];
  }

  // Multi-attribute search (Name, SKU, Description, Fabric, Color)
  if (search && search.trim() !== "") {
    const term = search.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { sku: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { fabric: { contains: term, mode: "insensitive" } },
      { color: { contains: term, mode: "insensitive" } },
      { collection: { contains: term, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * pageSize;

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          where: { isActive: true },
        },
        _count: {
          select: {
            orderItems: true,
            quotationItems: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        include: {
          parent: true,
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
      variants: {
        orderBy: { name: "asc" },
      },
      orderItems: {
        take: 5,
        orderBy: { order: { createdAt: "desc" } },
        include: {
          order: {
            select: { id: true, orderNumber: true, status: true, createdAt: true, customer: { select: { fullName: true } } },
          },
        },
      },
      _count: {
        select: { orderItems: true, quotationItems: true },
      },
    },
  });

  return product;
}

export async function getProductCategories() {
  return prisma.productCategory.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: { where: { isArchived: false } } },
      },
    },
  });
}

export async function createProduct(data: ProductCreateInput, actorId: string) {
  const { images, variants, price, costPrice, salePrice, ...rest } = data;

  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        ...rest,
        price: new Prisma.Decimal(price),
        costPrice: costPrice ? new Prisma.Decimal(costPrice) : null,
        salePrice: salePrice ? new Prisma.Decimal(salePrice) : null,
        images: images && images.length > 0 ? {
          create: images.map((img, idx) => ({
            url: img.url,
            altText: img.altText || rest.name,
            isPrimary: img.isPrimary ?? idx === 0,
            sortOrder: img.sortOrder ?? idx,
          })),
        } : undefined,
        variants: variants && variants.length > 0 ? {
          create: variants.map((v) => ({
            name: v.name,
            sku: v.sku,
            size: v.size || null,
            color: v.color || null,
            price: v.price ? new Prisma.Decimal(v.price) : null,
            stock: v.stock,
            isActive: v.isActive,
          })),
        } : undefined,
      },
      include: {
        images: true,
        variants: true,
      },
    });

    return product;
  });

  await logAudit({
    userId: actorId,
    action: "create",
    entityType: "product",
    entityId: result.id,
    newValue: { name: result.name, sku: result.sku, price: Number(result.price) },
  });

  return result;
}

export async function updateProduct(id: string, data: ProductUpdateInput, actorId: string) {
  const { images, variants, price, costPrice, salePrice, ...rest } = data;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update main product fields
    const product = await tx.product.update({
      where: { id },
      data: {
        ...rest,
        ...(price !== undefined ? { price: new Prisma.Decimal(price) } : {}),
        ...(costPrice !== undefined ? { costPrice: costPrice ? new Prisma.Decimal(costPrice) : null } : {}),
        ...(salePrice !== undefined ? { salePrice: salePrice ? new Prisma.Decimal(salePrice) : null } : {}),
      },
    });

    // 2. Synchronize images if supplied
    if (images !== undefined) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img, idx) => ({
            productId: id,
            url: img.url,
            altText: img.altText || product.name,
            isPrimary: img.isPrimary ?? idx === 0,
            sortOrder: img.sortOrder ?? idx,
          })),
        });
      }
    }

    // 3. Synchronize variants if supplied
    if (variants !== undefined) {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      if (variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v) => ({
            productId: id,
            name: v.name,
            sku: v.sku,
            size: v.size || null,
            color: v.color || null,
            price: v.price ? new Prisma.Decimal(v.price) : null,
            stock: v.stock,
            isActive: v.isActive,
          })),
        });
      }
    }

    return product;
  });

  await logAudit({
    userId: actorId,
    action: "update",
    entityType: "product",
    entityId: id,
    newValue: { updatedFields: Object.keys(data) },
  });

  return result;
}

export async function deleteProduct(id: string, actorId: string) {
  const product = await prisma.product.update({
    where: { id },
    data: {
      isArchived: true,
      archivedAt: new Date(),
      isActive: false,
    },
  });

  await logAudit({
    userId: actorId,
    action: "delete",
    entityType: "product",
    entityId: id,
    newValue: { name: product.name, sku: product.sku },
  });

  return product;
}

export async function getProductStats() {
  const [
    totalProducts,
    customizableDesigns,
    lowStockItems,
    outOfStockItems,
    categoriesCount,
  ] = await Promise.all([
    prisma.product.count({ where: { isArchived: false } }),
    prisma.product.count({ where: { isArchived: false, isCustomizable: true } }),
    prisma.product.count({
      where: {
        isArchived: false,
        availableQuantity: { gt: 0, lte: 5 },
      },
    }),
    prisma.product.count({
      where: {
        isArchived: false,
        availableQuantity: { equals: 0 },
      },
    }),
    prisma.productCategory.count({ where: { isActive: true } }),
  ]);

  return {
    totalProducts,
    customizableDesigns,
    lowStockItems,
    outOfStockItems,
    categoriesCount,
  };
}
