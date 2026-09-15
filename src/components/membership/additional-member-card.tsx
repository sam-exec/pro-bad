import React from "react";
import { Trash2, User } from "lucide-react";
import { LinkedMember } from "@/types/membership";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AdditionalMemberCardProps {
  index: number;
  member: LinkedMember;
  onChange: (updated: LinkedMember) => void;
  onRemove: () => void;
}

export function AdditionalMemberCard({
  index,
  member,
  onChange,
  onRemove,
}: AdditionalMemberCardProps) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 relative group transition-all hover:border-slate-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
            {index + 1}
          </div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Additional Member {index + 1}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            ({member.memberId || `LM-${index + 1}`})
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          title="Remove Member"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          <span>Remove</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label htmlFor={`mem-name-${member.id}`} required>
            Full Name
          </Label>
          <Input
            id={`mem-name-${member.id}`}
            value={member.name}
            onChange={(e) => onChange({ ...member, name: e.target.value })}
            placeholder="e.g. Sarah Smith"
            className="h-10 text-xs mt-1"
          />
        </div>

        <div>
          <Label htmlFor={`mem-phone-${member.id}`} required>
            Mobile Number
          </Label>
          <Input
            id={`mem-phone-${member.id}`}
            value={member.mobileNumber}
            onChange={(e) => onChange({ ...member, mobileNumber: e.target.value })}
            placeholder="e.g. 9123456789"
            maxLength={10}
            className="h-10 text-xs font-mono mt-1"
          />
        </div>

        <div>
          <Label htmlFor={`mem-contrib-${member.id}`} required>
            Contribution (₹)
          </Label>
          <Input
            id={`mem-contrib-${member.id}`}
            type="number"
            value={member.individualContribution}
            onChange={(e) => {
              const val = e.target.value;
              onChange({
                ...member,
                individualContribution: val === "" ? "" : Math.max(0, parseInt(val, 10) || 0),
              });
            }}
            placeholder="e.g. 1000"
            className="h-10 text-xs mt-1"
          />
        </div>
      </div>
    </div>
  );
}
