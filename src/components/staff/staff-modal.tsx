"use client";

import { useState } from "react";
import { createStaffUserAction } from "@/actions/staff.actions";
import { toast } from "sonner";
import { X, UserPlus, Shield, Mail, Phone, Lock } from "lucide-react";
import { UserRole } from "@prisma/client";

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StaffModal({ isOpen, onClose }: StaffModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.STAFF);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createStaffUserAction({
        name,
        email,
        phone,
        password,
        role,
      });

      if (res.success) {
        toast.success(`Staff user ${name} onboarded successfully!`);
        onClose();
      } else {
        toast.error(res.error || "Failed to onboard staff user");
      }
    } catch {
      toast.error("An error occurred while creating staff user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background text-foreground w-full max-w-md rounded-xl border border-border shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div>
            <h2 className="text-base font-bold font-heading">Onboard Team Member</h2>
            <p className="text-xs text-muted-foreground">Create account & assign system role</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Priya Sundaram"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Email Address (Login ID) *
            </label>
            <input
              type="email"
              required
              placeholder="priya@aazhi.studio"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Assign System Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background font-semibold"
              >
                <option value="STAFF">Staff</option>
                <option value="TAILOR">Master Tailor</option>
                <option value="SALES">Sales Executive</option>
                <option value="ADMIN">Studio Admin</option>
                <option value="OWNER">Studio Owner</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Initial Password *
            </label>
            <input
              type="password"
              required
              placeholder="Enter secure initial password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
            />
          </div>

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
              {isSubmitting ? "Creating..." : "Onboard Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
