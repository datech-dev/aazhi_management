import { PrismaClient, UserRole, CustomerSource, OrderStatus, PaymentStatus, PaymentMethod, PaymentType, Priority, ChannelType, ConversationStatus, MessageDirection } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Aazhi Designer Studio database...");

  // 1. Clean up existing data in reverse relation order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.paymentRefund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.qualityCheckItem.deleteMany();
  await prisma.qualityCheck.deleteMany();
  await prisma.productionStatusHistory.deleteMany();
  await prisma.productionJob.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.measurementValue.deleteMany();
  await prisma.measurementProfile.deleteMany();
  await prisma.measurementField.deleteMany();
  await prisma.measurementTemplate.deleteMany();
  await prisma.messageAttachment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.leadActivity.deleteMany();
  await prisma.leadTag.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.customerTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.customerNote.deleteMany();
  await prisma.customerAddress.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.businessSettings.deleteMany();
  await prisma.numberSequence.deleteMany();
  await prisma.messageTemplate.deleteMany();
  await prisma.userPermission.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();

  // 2. Business Settings
  await prisma.businessSettings.createMany({
    data: [
      { key: "business_name", value: "Aazhi Designer Studio", group: "general" },
      { key: "currency", value: "INR", group: "general" },
      { key: "currency_symbol", value: "₹", group: "general" },
      { key: "timezone", value: "Asia/Kolkata", group: "general" },
      { key: "phone", value: "+91 98765 43210", group: "general" },
      { key: "whatsapp", value: "+91 98765 43210", group: "communication" },
      { key: "instagram", value: "@aazhi_designer_studio", group: "communication" },
      { key: "gst_enabled", value: "true", group: "tax" },
      { key: "gst_percentage", value: "5.0", group: "tax" },
      { key: "default_delivery_days", value: "10", group: "orders" },
    ],
  });

  // 3. Branches
  const mainBranch = await prisma.branch.create({
    data: {
      name: "Main Studio — Chennai",
      code: "AZ-CHE",
      address: "142, TTK Road, Alwarpet",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600018",
      phone: "+91 98765 43210",
      email: "chennai@aazhi.studio",
    },
  });

  // 4. Users
  const passwordHash = await bcrypt.hash("Aazhi@2026!", 10);

  const owner = await prisma.user.create({
    data: {
      name: "Aazhi Owner",
      email: "owner@aazhi.studio",
      phone: "+91 98765 43210",
      hashedPassword: passwordHash,
      role: UserRole.OWNER,
      branchId: mainBranch.id,
    },
  });

  const tailor = await prisma.user.create({
    data: {
      name: "Meena Tailor Master",
      email: "tailor@aazhi.studio",
      phone: "+91 98765 43211",
      hashedPassword: passwordHash,
      role: UserRole.TAILOR,
      branchId: mainBranch.id,
    },
  });

  const salesStaff = await prisma.user.create({
    data: {
      name: "Pooja Sales Exec",
      email: "sales@aazhi.studio",
      phone: "+91 98765 43212",
      hashedPassword: passwordHash,
      role: UserRole.SALES,
      branchId: mainBranch.id,
    },
  });

  // 5. Measurement Templates
  const blouseTemplate = await prisma.measurementTemplate.create({
    data: {
      name: "Blouse (Standard)",
      category: "Tops",
      fields: {
        create: [
          { name: "Bust", key: "bust", sortOrder: 1 },
          { name: "Under Bust", key: "under_bust", sortOrder: 2 },
          { name: "Waist", key: "waist", sortOrder: 3 },
          { name: "Shoulder", key: "shoulder", sortOrder: 4 },
          { name: "Armhole", key: "armhole", sortOrder: 5 },
          { name: "Sleeve Length", key: "sleeve_length", sortOrder: 6 },
          { name: "Sleeve Round", key: "sleeve_round", sortOrder: 7 },
          { name: "Blouse Length", key: "blouse_length", sortOrder: 8 },
          { name: "Front Neck Depth", key: "front_neck", sortOrder: 9 },
          { name: "Back Neck Depth", key: "back_neck", sortOrder: 10 },
        ],
      },
    },
  });

  const kurtiTemplate = await prisma.measurementTemplate.create({
    data: {
      name: "Kurti / Salwar",
      category: "Full Dress",
      fields: {
        create: [
          { name: "Chest", key: "chest", sortOrder: 1 },
          { name: "Waist", key: "waist", sortOrder: 2 },
          { name: "Hip", key: "hip", sortOrder: 3 },
          { name: "Shoulder", key: "shoulder", sortOrder: 4 },
          { name: "Sleeve Length", key: "sleeve_length", sortOrder: 5 },
          { name: "Kurti Length", key: "kurti_length", sortOrder: 6 },
          { name: "Bottom Length", key: "bottom_length", sortOrder: 7 },
        ],
      },
    },
  });

  // 6. Tags
  const vipTag = await prisma.tag.create({ data: { name: "VIP Customer", color: "#B8860B" } });
  const bridalTag = await prisma.tag.create({ data: { name: "Bridal", color: "#CD7F32" } });
  const repeatTag = await prisma.tag.create({ data: { name: "Repeat Buyer", color: "#2E7D32" } });

  // 7. Customers
  const customerPriya = await prisma.customer.create({
    data: {
      fullName: "Priya Sundaram",
      preferredName: "Priya",
      phone: "+91 98401 23456",
      whatsappNumber: "+91 98401 23456",
      instagramUsername: "priya_sundar",
      email: "priya.sundar@gmail.com",
      preferredChannel: CustomerSource.WHATSAPP,
      source: CustomerSource.INSTAGRAM,
      totalOrders: 3,
      totalLifetimeValue: 28500,
      notes: "Prefers boat neck blouses and delicate zardosi work. Bridal customer for Nov wedding.",
      branchId: mainBranch.id,
      addresses: {
        create: [
          {
            label: "Home",
            line1: "Flat 4B, Emerald Haven, Gandhi Nagar",
            city: "Chennai",
            state: "Tamil Nadu",
            pincode: "600020",
            isDefault: true,
          },
        ],
      },
      tags: {
        create: [{ tagId: vipTag.id }, { tagId: bridalTag.id }],
      },
    },
  });

  const customerAnanya = await prisma.customer.create({
    data: {
      fullName: "Ananya Krishnan",
      preferredName: "Ananya",
      phone: "+91 98402 34567",
      whatsappNumber: "+91 98402 34567",
      instagramUsername: "ananya_krish",
      email: "ananya.k@yahoo.com",
      preferredChannel: CustomerSource.INSTAGRAM,
      source: CustomerSource.INSTAGRAM,
      totalOrders: 1,
      totalLifetimeValue: 8500,
      branchId: mainBranch.id,
      tags: {
        create: [{ tagId: repeatTag.id }],
      },
    },
  });

  const customerDeepa = await prisma.customer.create({
    data: {
      fullName: "Deepa Ramanathan",
      preferredName: "Deepa",
      phone: "+91 98403 45678",
      whatsappNumber: "+91 98403 45678",
      instagramUsername: "deepa_ram",
      preferredChannel: CustomerSource.WHATSAPP,
      source: CustomerSource.WALK_IN,
      branchId: mainBranch.id,
    },
  });

  // 8. Measurement Profiles
  await prisma.measurementProfile.create({
    data: {
      customerId: customerPriya.id,
      templateId: blouseTemplate.id,
      version: 1,
      createdById: owner.id,
      notes: "Tight fit preferred on sleeves. Padded front.",
      values: {
        create: [
          { fieldKey: "bust", value: 36.5 },
          { fieldKey: "under_bust", value: 31.0 },
          { fieldKey: "waist", value: 29.0 },
          { fieldKey: "shoulder", value: 14.5 },
          { fieldKey: "armhole", value: 16.0 },
          { fieldKey: "sleeve_length", value: 11.0 },
          { fieldKey: "sleeve_round", value: 12.0 },
          { fieldKey: "blouse_length", value: 14.0 },
          { fieldKey: "front_neck", value: 7.0 },
          { fieldKey: "back_neck", value: 9.5 },
        ],
      },
    },
  });

  // 9. Product Categories & Products
  const catBlouses = await prisma.productCategory.create({
    data: { name: "Designer Blouses", slug: "designer-blouses" },
  });

  const catSarees = await prisma.productCategory.create({
    data: { name: "Handloom Sarees", slug: "handloom-sarees" },
  });

  const catKurtis = await prisma.productCategory.create({
    data: { name: "Custom Kurtis", slug: "custom-kurtis" },
  });

  const productBlouse1 = await prisma.product.create({
    data: {
      sku: "AZ-BL-001",
      name: "Royal Peacock Zardosi Bridal Blouse",
      description: "Handcrafted pure raw silk blouse with intricate gold zardosi and pearl embellishments.",
      categoryId: catBlouses.id,
      collection: "Vedic Bridal 2026",
      price: 12500,
      costPrice: 6500,
      availableQuantity: 10,
      fabric: "Pure Raw Silk",
      color: "Crimson Red",
      isCustomizable: true,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
            isPrimary: true,
            altText: "Bridal Zardosi Blouse",
          },
        ],
      },
    },
  });

  const productSaree1 = await prisma.product.create({
    data: {
      sku: "AZ-SR-002",
      name: "Kanchipuram Gold Tissue Brocade Saree",
      description: "Authentic pure silk Kanchipuram tissue saree with rich korvai border and contrast pallu.",
      categoryId: catSarees.id,
      collection: "Heritage Gold",
      price: 24000,
      costPrice: 16000,
      availableQuantity: 4,
      fabric: "Pure Silk Tissue",
      color: "Antique Gold",
      isCustomizable: false,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80",
            isPrimary: true,
            altText: "Gold Tissue Saree",
          },
        ],
      },
    },
  });

  const productKurti1 = await prisma.product.create({
    data: {
      sku: "AZ-KT-003",
      name: "Hand-Embroidered Chanderi Anarkali Set",
      description: "Flowing Chanderi silk anarkali with delicate threadwork, matching dupatta and pants.",
      categoryId: catKurtis.id,
      collection: "Summer Festive",
      price: 8500,
      costPrice: 4200,
      availableQuantity: 6,
      fabric: "Chanderi Silk",
      color: "Powder Blue",
      isCustomizable: true,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1596783074418-c999c853114d?w=800&q=80",
            isPrimary: true,
            altText: "Chanderi Anarkali Set",
          },
        ],
      },
    },
  });

  // 10. Orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "AZ-2026-0001",
      customerId: customerPriya.id,
      salespersonId: salesStaff.id,
      assignedTailorId: tailor.id,
      source: CustomerSource.WHATSAPP,
      orderDate: new Date(),
      expectedDeliveryDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      subtotal: 12500,
      taxPercent: 5,
      taxAmount: 625,
      total: 13125,
      advancePaid: 6000,
      balance: 7125,
      status: OrderStatus.STITCHING,
      paymentStatus: PaymentStatus.ADVANCE_PAID,
      priority: Priority.HIGH,
      notes: "Bridal delivery. Customer requested photo update before final stitching.",
      branchId: mainBranch.id,
      items: {
        create: [
          {
            productId: productBlouse1.id,
            description: "Royal Peacock Zardosi Bridal Blouse (Customized)",
            quantity: 1,
            unitPrice: 12500,
            totalPrice: 12500,
            customizations: "Boat neck front, deep U back with Latkan hangings, padded.",
          },
        ],
      },
      statusHistory: {
        create: [
          { toStatus: OrderStatus.CONFIRMED, notes: "Order confirmed with ₹6,000 advance via UPI" },
          { toStatus: OrderStatus.CUTTING, notes: "Fabric cutting completed by Meena" },
          { toStatus: OrderStatus.STITCHING, notes: "Zardosi embroidery completed, stitching ongoing" },
        ],
      },
    },
  });

  // 11. Production Job for Order 1
  await prisma.productionJob.create({
    data: {
      orderId: order1.id,
      assignedTailorId: tailor.id,
      stage: "STITCHING",
      priority: Priority.HIGH,
      startDate: new Date(),
      expectedCompletionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      notes: "Double check shoulder measurement. Ensure neat piping along neckline.",
    },
  });

  // 12. Payments
  await prisma.payment.create({
    data: {
      paymentNumber: "PAY-2026-0001",
      orderId: order1.id,
      customerId: customerPriya.id,
      amount: 6000,
      method: PaymentMethod.UPI,
      type: PaymentType.ADVANCE,
      referenceNumber: "UPI/20260901/984012",
      notes: "GPay advance payment received.",
      recordedById: salesStaff.id,
    },
  });

  // 13. Leads
  await prisma.lead.create({
    data: {
      leadNumber: "LD-2026-0001",
      customerId: customerAnanya.id,
      source: CustomerSource.INSTAGRAM,
      enquiryMessage: "Saw the Powder Blue Anarkali on your IG reel. Can this be customized in Lilac color for my sister's reception?",
      interestedProductId: productKurti1.id,
      estimatedValue: 9500,
      assignedStaffId: salesStaff.id,
      status: "INTERESTED",
      priority: Priority.HIGH,
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      branchId: mainBranch.id,
    },
  });

  // 14. Unified Inbox Conversation
  const conv1 = await prisma.conversation.create({
    data: {
      customerId: customerPriya.id,
      channel: ChannelType.WHATSAPP,
      externalId: "wa_thread_9840123456",
      assignedStaffId: salesStaff.id,
      status: ConversationStatus.OPEN,
      priority: Priority.HIGH,
      subject: "Bridal Blouse Order Update & Delivery",
      lastMessageAt: new Date(),
      lastMessagePreview: "Sure Priya, I will share the embroidery progress photos by tomorrow noon!",
      relatedOrderId: order1.id,
      branchId: mainBranch.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv1.id,
        direction: MessageDirection.INBOUND,
        content: "Hi Pooja, could you let me know the status of my wedding blouse?",
        senderName: "Priya Sundaram",
        senderIdentifier: "+91 98401 23456",
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        conversationId: conv1.id,
        direction: MessageDirection.OUTBOUND,
        content: "Sure Priya, I will share the embroidery progress photos by tomorrow noon!",
        senderName: "Pooja Sales Exec",
        senderIdentifier: "sales@aazhi.studio",
        createdAt: new Date(),
      },
    ],
  });

  // 15. In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: owner.id,
        type: "NEW_ORDER",
        title: "New Order AZ-2026-0001",
        message: "Priya Sundaram placed an order for Bridal Blouse worth ₹13,125",
        entityType: "order",
        entityId: order1.id,
      },
      {
        userId: tailor.id,
        type: "ORDER_READY",
        title: "Stitching Assigned",
        message: "Order AZ-2026-0001 assigned to you for stitching. Due in 5 days.",
        entityType: "order",
        entityId: order1.id,
      },
    ],
  });

  // 16. Suppliers & Raw Material Inventory
  const supplierSilk = await prisma.supplier.create({
    data: {
      name: "Sri Lakshmi Silks Wholesale",
      contactPerson: "Rangarajan",
      phone: "+91 94441 55667",
      whatsapp: "+91 94441 55667",
      address: "24 Weaver Street, Kanchipuram, Tamil Nadu",
    },
  });

  const supplierZari = await prisma.supplier.create({
    data: {
      name: "Royal Zari & Lace Emporium",
      contactPerson: "Mahesh Bhai",
      phone: "+91 98251 33445",
      whatsapp: "+91 98251 33445",
      address: "Shop 14, Textile Market, Surat, Gujarat",
    },
  });

  await prisma.inventoryItem.createMany({
    data: [
      {
        name: "Pure Raw Silk - Peacock Blue",
        sku: "FAB-SLK-BLU",
        type: "FABRIC",
        unit: "meters",
        quantity: 24.5,
        reorderThreshold: 5.0,
        costPerUnit: 650,
        supplierId: supplierSilk.id,
        location: "Fabric Rack 1, Bin A",
        branchId: mainBranch.id,
      },
      {
        name: "Pure Raw Silk - Crimson Bridal Red",
        sku: "FAB-SLK-RED",
        type: "FABRIC",
        unit: "meters",
        quantity: 18.0,
        reorderThreshold: 5.0,
        costPerUnit: 650,
        supplierId: supplierSilk.id,
        location: "Fabric Rack 1, Bin B",
        branchId: mainBranch.id,
      },
      {
        name: "Tissue Gold Brocade - Festive Weave",
        sku: "FAB-BRO-GLD",
        type: "FABRIC",
        unit: "meters",
        quantity: 4.5, // Low stock
        reorderThreshold: 5.0,
        costPerUnit: 850,
        supplierId: supplierSilk.id,
        location: "Fabric Rack 2, Shelf 1",
        branchId: mainBranch.id,
      },
      {
        name: "Pure Cotton Mulmul Lining Cloth",
        sku: "LIN-COT-WHT",
        type: "LINING",
        unit: "meters",
        quantity: 65.0,
        reorderThreshold: 15.0,
        costPerUnit: 120,
        supplierId: supplierSilk.id,
        location: "Rolls Section - Shelf 3",
        branchId: mainBranch.id,
      },
      {
        name: "Handcrafted Antique Gold Cutwork Lace (2 inch)",
        sku: "LAC-ANT-GLD",
        type: "LACE",
        unit: "meters",
        quantity: 32.0,
        reorderThreshold: 10.0,
        costPerUnit: 280,
        supplierId: supplierZari.id,
        location: "Lace Drawer L-2",
        branchId: mainBranch.id,
      },
      {
        name: "Kundan Stones & Pearl Beads Assorted Box",
        sku: "EMB-KUN-BOX",
        type: "EMBELLISHMENT",
        unit: "packets",
        quantity: 12.0,
        reorderThreshold: 3.0,
        costPerUnit: 450,
        supplierId: supplierZari.id,
        location: "Embroidery Tray E-1",
        branchId: mainBranch.id,
      },
      {
        name: "YKK Concealed Blouse Zippers (10 inch)",
        sku: "ZIP-YKK-10",
        type: "ZIPPERS",
        unit: "pcs",
        quantity: 45.0,
        reorderThreshold: 10.0,
        costPerUnit: 35,
        supplierId: supplierZari.id,
        location: "Hardware Bin H-1",
        branchId: mainBranch.id,
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
  console.log("------------------------------------------");
  console.log("👑 Owner Login:  owner@aazhi.studio / Aazhi@2026!");
  console.log("✂️ Tailor Login: tailor@aazhi.studio / Aazhi@2026!");
  console.log("🛍️ Sales Login:  sales@aazhi.studio / Aazhi@2026!");
  console.log("------------------------------------------");
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
