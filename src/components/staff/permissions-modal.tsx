"use client";

import { useState } from "react";
import { updateUserPermissionsAction } from "@/actions/staff.actions";
import { toast } from "sonner";
import { X, ShieldCheck, Check } from "lucide-react";

interface PermissionItem {
  id: string;
  code: string;
  name: string;
  module: string;
}

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  availablePermissions: PermissionItem[];
  userPermissionIds?: string[];
}

export function PermissionsModal({
  isOpen,
  onClose,
  userId,
  userName,
  availablePermissions,
  userPermissionIds = [],
}: PermissionsModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(userPermissionIds);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const togglePermission = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((p) => p !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await updateUserPermissionsAction(userId, selectedIds);
      if (res.success) {
        toast.success(`Custom permissions updated for ${userName}`);
        onClose();
      } else {
        toast.error(res.error || "Failed to update permissions");
      }
    } catch {
      toast.error("Error saving permissions");
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedModules = availablePermissions.reduce<Record<string, PermissionItem[]>>(
    (acc, item) => {
      const mod = item.module || "General";
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(item);
      return acc;
    },
    {}
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background text-foreground w-full max-w-lg rounded-xl border border-border shadow-xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/30 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold font-heading flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Granular Permission Overrides
            </h2>
            <p className="text-xs text-muted-foreground">Configuring overrides for {userName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {Object.entries(groupedModules).map(([moduleName, permList]) => (
            <div key={moduleName} className="space-y-2 border border-border/60 p-3 rounded-lg bg-muted/10">
              <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-primary">
                {moduleName} Module
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {permList.map((p) => {
                  const isChecked = selectedIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePermission(p.id)}
                      className={`flex items-center justify-between p-2 rounded text-xs border text-left transition-colors ${
                        isChecked
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <span>{p.name}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium hover:bg-muted text-muted-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Overrides"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
