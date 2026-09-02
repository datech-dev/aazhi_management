import { prisma } from "@/lib/prisma";
import { Prisma, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { logAudit } from "./audit.service";

/**
 * Staff Administration & User Management Service
 */

export interface StaffFilterInput {
  role?: UserRole;
  search?: string;
  isActive?: boolean;
}

export interface CreateStaffUserInput {
  email: string;
  name: string;
  phone?: string;
  password: string;
  role?: UserRole;
  branchId?: string;
}

export async function getStaffList(filters: StaffFilterInput = {}) {
  const { role, search, isActive } = filters;

  const where: Prisma.UserWhereInput = {
    ...(role ? { role } : {}),
    ...(typeof isActive === "boolean" ? { isActive } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      branch: {
        select: { id: true, name: true, code: true },
      },
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  return users;
}

export async function createStaffUser(data: CreateStaffUserInput, actorId: string) {
  const { email, name, phone, password, role = UserRole.STAFF, branchId } = data;

  // 1. Check existing email
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    throw new Error("A user account with this email already exists");
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      phone: phone || null,
      hashedPassword,
      role,
      branchId: branchId || null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  await logAudit({
    userId: actorId,
    action: "create",
    entityType: "staff",
    entityId: user.id,
    newValue: { email: user.email, name: user.name, role: user.role },
  });

  return user;
}

export async function updateStaffRole(userId: string, role: UserRole, actorId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  await logAudit({
    userId: actorId,
    action: "update",
    entityType: "staff",
    entityId: userId,
    newValue: { role },
  });

  return user;
}

export async function toggleStaffStatus(userId: string, isActive: boolean, actorId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });

  await logAudit({
    userId: actorId,
    action: "update",
    entityType: "staff",
    entityId: userId,
    newValue: { isActive },
  });

  return user;
}

export async function getAllPermissions() {
  return await prisma.permission.findMany({
    orderBy: { module: "asc" },
  });
}

export async function updateUserPermissions(
  userId: string,
  permissionIds: string[],
  actorId: string
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Delete existing user permissions
    await tx.userPermission.deleteMany({
      where: { userId },
    });

    // 2. Create new permissions
    if (permissionIds.length > 0) {
      await tx.userPermission.createMany({
        data: permissionIds.map((pId) => ({
          userId,
          permissionId: pId,
          granted: true,
        })),
      });
    }

    await logAudit({
      userId: actorId,
      action: "update",
      entityType: "user_permissions",
      entityId: userId,
      newValue: { permissionCount: permissionIds.length },
    });

    return true;
  });
}
