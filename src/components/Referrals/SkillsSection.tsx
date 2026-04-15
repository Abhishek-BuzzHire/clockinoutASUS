"use client";

import { useState } from "react";
import { addBtnCls } from "@/lib/types/ReferalTypes/FieldStyles";
import { Skill } from "@/lib/types/ReferalTypes/referalindex";
import { emptySkill } from "@/lib/types/ReferalTypes/referral";

interface Props { data: Skill[]; onChange: (d: Skill[]) => void; }

export default function SkillsSection({ data, onChange }: Props) {
    const [input, setInput] = useState("");

    const addSkill = () => {
        const trimmed = input.trim();
        if (!trimmed) return;
        onChange([...data, { ...emptySkill(), skill_name: trimmed }]);
        setInput("");
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Input row */}
            <div className="flex gap-2">
                <input
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 transition-colors bg-white"
                    placeholder="Type a skill and press Add or Enter"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSkill()}
                />
                <button type="button" className={addBtnCls} onClick={addSkill}>
                    Add
                </button>
            </div>

            {data.length === 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-sm text-gray-400 bg-white">
                    No skills added yet.
                </div>
            )}

            {/* Skill bubbles */}
            <div className="flex flex-wrap gap-2">
                {data.map((skill, i) => (
                    <div
                        key={skill.skill_id}
                        className="flex items-center gap-1 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full text-xs text-blue-700 hover:bg-blue-100 transition-all"
                    >
                        <span>{skill.skill_name}</span>
                        <button
                            type="button"
                            aria-label={`Remove ${skill.skill_name}`}
                            className="text-blue-400 hover:text-red-500 ml-1 leading-none"
                            onClick={() => onChange(data.filter((_, idx) => idx !== i))}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}