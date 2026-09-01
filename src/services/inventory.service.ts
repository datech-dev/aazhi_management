import { prisma } from "@/lib/prisma";
import { Prisma, InventoryTransactionType } from "@prisma/client";
import {
  InventoryItemCreateInput,
  InventoryItemUpdateInput,
  StockAdjustmentInput,
  InventorySearchInput,
} from "@/lib/validations/inventory";
import { logAudit } from "./audit.service";

/**
 * Raw Material & Fabric Inventory Service for Aazhi Designer Studio
 */

export async function getInventoryItems(query: InventorySearchInput, branchId?: string | null) {
  const {
    search,
    type,
    stockStatus = "all",
    page = 1,
    pageSize = 20,
    sortBy = "name",
    sortOrder = "asc",
  } = query;

  const where: Prisma.InventoryItemWhereInput = {
    isActive: true,
    ...(branchId ? { branchId } : {}),
    ...(type ? { type } : {}),
  };

  if (search && search.trim() !== "") {
    const term = search.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { sku: { contains: term, mode: "insensitive" } },
      { location: { contains: term, mode: "insensitive" } },
    ];
  }

  // Stock status filter
  if (stockStatus === "in_stock") {
    where.quantity = { gt: 0 };
  } else if (stockStatus === "out_of_stock") {
    where.quantity = { equals: 0 };
  }

  const skip = (page - 1) * pageSize;

  const [items, totalCount] = await Promise.all([
    prisma.inventoryItem.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
      include: {
        supplier: {
          select: { id: true, name: true, phone: true },
        },
        _count: {
          select: { transactions: true },
        },
      },
    }),
    prisma.inventoryItem.count({ where }),
  ]);

  // Filter low stock in memory if requested (comparing quantity <= reorderThreshold)
  let resultItems = items;
  if (stockStatus === "low_stock") {
    resultItems = items.filter(
      (item) => Number(item.quantity) > 0 && Number(item.quantity) <= Number(item.reorderThreshold)
    );
  }

  return {
    items: resultItems,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
}

export async function getInventoryItemById(id: string) {
  return prisma.inventoryItem.findUnique({
    where: { id },
    include: {
      supplier: true,
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

export async function createInventoryItem(
  data: InventoryItemCreateInput,
  actorId: string,
  branchId?: string | null
) {
  const { costPerUnit, ...rest } = data;

  const item = await prisma.inventoryItem.create({
    data: {
      ...rest,
      branchId: branchId || undefined,
      costPerUnit: costPerUnit ? new Prisma.Decimal(costPerUnit) : null,
      quantity: new Prisma.Decimal(rest.quantity),
      reorderThreshold: new Prisma.Decimal(rest.reorderThreshold),
    },
  });

  // Initial stock transaction if quantity > 0
  if (data.quantity > 0) {
    await prisma.inventoryTransaction.create({
      data: {
        inventoryItemId: item.id,
        type: InventoryTransactionType.STOCK_IN,
        quantity: new Prisma.Decimal(data.quantity),
        previousQuantity: new Prisma.Decimal(0),
        newQuantity: new Prisma.Decimal(data.quantity),
        unitCost: costPerUnit ? new Prisma.Decimal(costPerUnit) : null,
        reference: "Initial Stock Record",
        performedBy: actorId,
      },
    });
  }

  await logAudit({
    userId: actorId,
    action: "create",
    entityType: "inventory",
    entityId: item.id,
    newValue: { name: item.name, sku: item.sku, quantity: Number(item.quantity) },
  });

  return item;
}

export async function updateInventoryItem(
  id: string,
  data: InventoryItemUpdateInput,
  actorId: string
) {
  const { costPerUnit, quantity, reorderThreshold, ...rest } = data;

  const item = await prisma.inventoryItem.update({
    where: { id },
    data: {
      ...rest,
      ...(costPerUnit !== undefined ? { costPerUnit: costPerUnit ? new Prisma.Decimal(costPerUnit) : null } : {}),
      ...(quantity !== undefined ? { quantity: new Prisma.Decimal(quantity) } : {}),
      ...(reorderThreshold !== undefined ? { reorderThreshold: new Prisma.Decimal(reorderThreshold) } : {}),
    },
  });

  await logAudit({
    userId: actorId,
    action: "update",
    entityType: "inventory",
    entityId: id,
    newValue: { updatedFields: Object.keys(data) },
  });

  return item;
}

export async function recordStockAdjustment(data: StockAdjustmentInput, actorId: string) {
  const { inventoryItemId, type, quantity, unitCost, reference, notes } = data;

  const result = await prisma.$transaction(async (tx) => {
    const currentItem = await tx.inventoryItem.findUnique({
      where: { id: inventoryItemId },
    });

    if (!currentItem) {
      throw new Error("Inventory item not found");
    }

    const prevQty = Number(currentItem.quantity);
    let newQty = prevQty;

    switch (type) {
      case "STOCK_IN":
      case "RETURN":
        newQty = prevQty + Number(quantity);
        break;
      case "STOCK_OUT":
      case "DAMAGED":
        newQty = Math.max(0, prevQty - Number(quantity));
        break;
      case "ADJUSTMENT":
        newQty = Number(quantity); // Set absolute quantity
        break;
    }

    // 1. Update Inventory item quantity
    const updatedItem = await tx.inventoryItem.update({
      where: { id: inventoryItemId },
      data: {
        quantity: new Prisma.Decimal(newQty),
      },
    });

    // 2. Create Audit Transaction Record
    const transaction = await tx.inventoryTransaction.create({
      data: {
        inventoryItemId,
        type: type as InventoryTransactionType,
        quantity: new Prisma.Decimal(quantity),
        previousQuantity: new Prisma.Decimal(prevQty),
        newQuantity: new Prisma.Decimal(newQty),
        unitCost: unitCost ? new Prisma.Decimal(unitCost) : currentItem.costPerUnit,
        reference: reference || null,
        notes: notes || null,
        performedBy: actorId,
      },
    });

    return { updatedItem, transaction };
  });

  await logAudit({
    userId: actorId,
    action: "update",
    entityType: "inventory",
    entityId: inventoryItemId,
    newValue: {
      type,
      quantity,
      newTotalQuantity: Number(result.updatedItem.quantity),
      reference,
    },
  });

  return result;
}

export async function deleteInventoryItem(id: string, actorId: string) {
  const item = await prisma.inventoryItem.update({
    where: { id },
    data: { isActive: false },
  });

  await logAudit({
    userId: actorId,
    action: "delete",
    entityType: "inventory",
    entityId: id,
    newValue: { name: item.name, sku: item.sku },
  });

  return item;
}

export async function getInventoryStats(branchId?: string | null) {
  const where: Prisma.InventoryItemWhereInput = {
    isActive: true,
    ...(branchId ? { branchId } : {}),
  };

  const [allItems, suppliersCount] = await Promise.all([
    prisma.inventoryItem.findMany({
      where,
      select: {
        quantity: true,
        reorderThreshold: true,
        costPerUnit: true,
        type: true,
      },
    }),
    prisma.supplier.count({ where: { isActive: true } }),
  ]);

  const totalItems = allItems.length;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let totalStockValuation = 0;
  let fabricMetersCount = 0;

  for (const item of allItems) {
    const qty = Number(item.quantity);
    const threshold = Number(item.reorderThreshold);
    const cost = Number(item.costPerUnit || 0);

    totalStockValuation += qty * cost;

    if (qty === 0) {
      outOfStockCount++;
    } else if (qty <= threshold) {
      lowStockCount++;
    }

    if (item.type === "FABRIC") {
      fabricMetersCount += qty;
    }
  }

  return {
    totalItems,
    lowStockCount,
    outOfStockCount,
    totalStockValuation,
    fabricMetersCount,
    suppliersCount,
  };
}
