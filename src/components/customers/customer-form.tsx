"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  customerCreateSchema,
  CustomerCreateInput,
} from "@/lib/validations/customer";
import {
  createCustomerAction,
  updateCustomerAction,
} from "@/actions/customer.actions";
import {
  User,
  Phone,
  MapPin,
  Tag as TagIcon,
  FileText,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { InstagramIcon } from "@/components/shared/icons";
import { buttonVariants } from "@/components/ui/button";

interface CustomerFormProps {
  initialData?: Partial<CustomerCreateInput> & { id?: string };
  isEditing?: boolean;
}

const COMMON_TAGS = ["Bridal", "VIP", "Repeat", "Urgent", "Blouse Specialist", "Regular"];

export function CustomerForm({ initialData, isEditing = false }: CustomerFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [customTagInput, setCustomTagInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomerCreateInput>({
    resolver: zodResolver(customerCreateSchema) as any,
    defaultValues: {
      fullName: initialData?.fullName || "",
      preferredName: initialData?.preferredName || "",
      phone: initialData?.phone || "",
      whatsappNumber: initialData?.whatsappNumber || "",
      instagramUsername: initialData?.instagramUsername || "",
      email: initialData?.email || "",
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : undefined,
      anniversary: initialData?.anniversary ? new Date(initialData.anniversary) : undefined,
      preferredChannel: initialData?.preferredChannel || "WHATSAPP",
      source: initialData?.source || "WALK_IN",
      notes: initialData?.notes || "",
      tags: initialData?.tags || [],
      addresses: initialData?.addresses || [
        {
          label: "Home",
          line1: "",
          line2: "",
          city: "Chennai",
          state: "Tamil Nadu",
          pincode: "",
          isDefault: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
  });

  const selectedTags = watch("tags") || [];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setValue("tags", selectedTags.filter((t) => t !== tag));
    } else {
      setValue("tags", [...selectedTags, tag]);
    }
  };

  const addCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTagInput.trim()) return;
    const trimmed = customTagInput.trim();
    if (!selectedTags.includes(trimmed)) {
      setValue("tags", [...selectedTags, trimmed]);
    }
    setCustomTagInput("");
  };

  const onSubmit = async (data: CustomerCreateInput) => {
    setError("");
    setLoading(true);

    try {
      if (isEditing && initialData?.id) {
        const res = await updateCustomerAction(initialData.id, data);
        if (!res.success) {
          setError(res.error || "Failed to update customer");
          return;
        }
        router.push(`/customers/${initialData.id}`);
      } else {
        const res = await createCustomerAction(data);
        if (!res.success || !res.data) {
          setError(res.error || "Failed to register customer");
          return;
        }
        router.push(`/customers/${res.data.id}`);
      }
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl pb-12">
      {error && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
          {error}
        </div>
      )}

      {/* 1. Personal Information */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <User className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold font-heading text-foreground">
            Personal Details
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              {...register("fullName")}
              placeholder="e.g., Priya Sundaram"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Preferred / Nickname
            </label>
            <input
              {...register("preferredName")}
              placeholder="e.g., Priya"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Date of Birth
            </label>
            <input
              type="date"
              {...register("dateOfBirth", { valueAsDate: true })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Wedding / Special Anniversary
            </label>
            <input
              type="date"
              {...register("anniversary", { valueAsDate: true })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* 2. Contact & Social Channels */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Phone className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold font-heading text-foreground">
            Contact & Social Channels
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Primary Phone Number
            </label>
            <input
              {...register("phone")}
              placeholder="e.g., 9876543210"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              WhatsApp Number
            </label>
            <input
              {...register("whatsappNumber")}
              placeholder="e.g., 9876543210 (leave empty if same)"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.whatsappNumber && (
              <p className="text-xs text-destructive">
                {errors.whatsappNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
              Instagram Handle
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                @
              </span>
              <input
                {...register("instagramUsername")}
                placeholder="priya_designs"
                className="w-full pl-7 pr-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {errors.instagramUsername && (
              <p className="text-xs text-destructive">
                {errors.instagramUsername.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Email Address
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="priya@example.com"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Acquisition / Lead Source
            </label>
            <select
              {...register("source")}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="INSTAGRAM">Instagram DM / Post</option>
              <option value="WHATSAPP">WhatsApp Enquiry</option>
              <option value="WALK_IN">Direct Walk-in</option>
              <option value="REFERRAL">Customer Referral</option>
              <option value="PHONE">Phone Call</option>
              <option value="WEBSITE">Website / Online</option>
              <option value="OTHER">Other Source</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Preferred Communication Channel
            </label>
            <select
              {...register("preferredChannel")}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="WHATSAPP">WhatsApp Message</option>
              <option value="INSTAGRAM">Instagram DM</option>
              <option value="PHONE">Phone Call</option>
              <option value="WALK_IN">In-Studio Consultation</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Boutique Tags & Customer Categories */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <TagIcon className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold font-heading text-foreground">
            Boutique Tags & Categories
          </h2>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {COMMON_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                </button>
              );
            })}
          </div>

          {/* Add custom tag */}
          <div className="flex items-center gap-2 pt-1 max-w-xs">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              placeholder="Add custom tag..."
              className="px-2.5 py-1 text-xs bg-background border border-input rounded-md flex-1 focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="button"
              onClick={addCustomTag}
              className={buttonVariants({ variant: "outline", size: "sm", className: "h-7 px-2 text-xs" })}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* 4. Stylist & Consultation Notes */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <FileText className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold font-heading text-foreground">
            Stylist & Consultation Notes
          </h2>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Client Fit Preferences, Design Requests & Style Notes
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="e.g., Prefers deep back blouses with latkan ties. Allergic to synthetic linings. Likes subtle zari embroidery on sleeves."
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* 5. Addresses */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold font-heading text-foreground">
              Delivery & Billing Addresses
            </h2>
          </div>
          <button
            type="button"
            onClick={() =>
              append({
                label: "Delivery",
                line1: "",
                line2: "",
                city: "Chennai",
                state: "Tamil Nadu",
                pincode: "",
                isDefault: false,
              })
            }
            className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 text-xs" })}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Address
          </button>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 rounded-lg border border-border/80 bg-background/50 space-y-3 relative"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  {...register(`addresses.${index}.label`)}
                  placeholder="Address Label (Home / Delivery)"
                  className="px-2 py-1 text-xs font-medium bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring w-32"
                />
                <label className="text-xs flex items-center gap-1.5 text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(`addresses.${index}.isDefault`)}
                    className="rounded border-input text-primary focus:ring-ring"
                  />
                  Default Address
                </label>
              </div>

              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  aria-label="Remove address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <input
                  {...register(`addresses.${index}.line1`)}
                  placeholder="Address Line 1 (Door No, Building, Street) *"
                  className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <input
                  {...register(`addresses.${index}.line2`)}
                  placeholder="Address Line 2 (Area, Landmark)"
                  className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <input
                  {...register(`addresses.${index}.city`)}
                  placeholder="City *"
                  className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <input
                  {...register(`addresses.${index}.state`)}
                  placeholder="State"
                  className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <input
                  {...register(`addresses.${index}.pincode`)}
                  placeholder="Pincode (e.g., 600001)"
                  className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Submission Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className={buttonVariants({ variant: "outline" })}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={buttonVariants({
            variant: "default",
            className: "bg-primary text-primary-foreground hover:bg-primary/90 min-w-[140px]",
          })}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Update Client Profile"
          ) : (
            "Register Client"
          )}
        </button>
      </div>
    </form>
  );
}
