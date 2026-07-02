// "use client"

// import React, { useState, useEffect } from 'react';
// import {
//   Settings2,
//   CalendarDays,
//   Clock,
//   Save,
//   Building2,
//   CheckCircle2,
//   AlertCircle,
//   Loader2
// } from "lucide-react";
// import axios from "axios";
// import Cookies from "js-cookie";

// const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// const WEEKDAYS = [
//   { label: "Monday", value: "MON" },
//   { label: "Tuesday", value: "TUE" },
//   { label: "Wednesday", value: "WED" },
//   { label: "Thursday", value: "THU" },
//   { label: "Friday", value: "FRI" },
//   { label: "Saturday", value: "SAT" },
//   { label: "Sunday", value: "SUN" },
// ];

// export default function AdminWorkingRulesPage() {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [rules, setRules] = useState<any>(null);
//   const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

//   // Form State
//   const [formData, setFormData] = useState({
//     company_name: "",
//     working_days: [] as string[],
//     daily_work_hours: "8.00",
//     weekly_work_hours: "40.00",
//     monthly_work_hours: "176.00"
//   });

//   useEffect(() => {
//     fetchRules();
//   }, []);

//   const fetchRules = async () => {
//     const token = Cookies.get("access");

//     try {
//       const response = await axios.get(
//         `${apiUrl}/admin/working-rules/`,
//         {
//           headers: {
//             Authorization: token ? `Bearer ${token}` : "",
//           },
//         }
//       );

//       const data = response.data;

//       if (data && data.length > 0) {
//         setRules(data[0]); // Assuming one primary set of rules
//         setFormData({
//           company_name: data[0].company_name,
//           working_days: data[0].working_days,
//           daily_work_hours: data[0].daily_work_hours,
//           weekly_work_hours: data[0].weekly_work_hours,
//           monthly_work_hours: data[0].monthly_work_hours,
//         });
//       }
//     } catch (error) {
//       console.error("Failed to fetch rules", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDayToggle = (day: string) => {
//     setFormData(prev => ({
//       ...prev,
//       working_days: prev.working_days.includes(day)
//         ? prev.working_days.filter(d => d !== day)
//         : [...prev.working_days, day]
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSaving(true);
//     setMessage(null);

//     const url = rules
//       ? `${apiUrl}/admin/working-rules/${rules.id}/`
//       : `${apiUrl}/admin/working-rules/`;

//     const method = rules ? 'PUT' : 'POST';

//     const token = Cookies.get("access");

//     try {
//       const response = await axios({
//         url,
//         method,
//         data: formData,
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: token ? `Bearer ${token}` : "",
//         },
//       });

//       const updated = response.data;
//       setRules(updated);
//       setMessage({
//         type: "success",
//         text: "Working rules updated successfully!",
//       });
//     } catch (error: any) {
//       if (error.response) {
//         setMessage({
//           type: "error",
//           text: "Failed to save rules. Please check inputs.",
//         });
//       } else {
//         setMessage({
//           type: "error",
//           text: "Network error occurred.",
//         });
//       }
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) return (
//     <div className="flex h-96 items-center justify-center">
//       <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
//     </div>
//   );

//   return (
//     <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">

//       {/* HEADER */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
//         <div>
//           <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
//             <Settings2 className="w-3 h-3" />
//             <span>Core Configuration</span>
//           </div>
//           <h1 className="text-2xl font-black text-slate-800 tracking-tight">Working Rules</h1>
//           <p className="text-sm text-slate-500 font-medium">Define operational days and hourly expectations for the company.</p>
//         </div>
//       </div>

//       {message && (
//         <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
//           }`}>
//           {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
//           <span className="text-sm font-bold">{message.text}</span>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-6">

//         {/* COMPANY NAME CARD */}
//         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
//           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Company Profile</label>
//           <div className="relative">
//             <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
//             <input
//               type="text"
//               required
//               placeholder="Enter Company Name"
//               value={formData.company_name}
//               onChange={e => setFormData({ ...formData, company_name: e.target.value })}
//               className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
//             />
//           </div>
//         </div>

//         {/* WORKING DAYS SELECTION */}
//         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
//           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
//             <CalendarDays className="w-4 h-4 text-blue-500" /> Weekly Working Days
//           </label>
//           <div className="flex flex-wrap gap-3">
//             {WEEKDAYS.map((day) => {
//               const active = formData.working_days.includes(day.value);
//               return (
//                 <button
//                   key={day.value}
//                   type="button"
//                   onClick={() => handleDayToggle(day.value)}
//                   className={`px-5 py-3 rounded-xl text-xs font-black tracking-widest transition-all border-2 ${active
//                     ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
//                     : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
//                     }`}
//                 >
//                   {day.label}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* HOURLY TARGETS GRID */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
//             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
//               <Clock className="w-3.5 h-3.5" /> Daily Target
//             </label>
//             <div className="relative">
//               <input
//                 type="number" step="0.01"
//                 value={formData.daily_work_hours}
//                 onChange={e => setFormData({ ...formData, daily_work_hours: e.target.value })}
//                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800 focus:border-blue-500 outline-none"
//               />
//               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Hrs</span>
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
//             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
//               <Clock className="w-3.5 h-3.5 text-indigo-500" /> Weekly Target
//             </label>
//             <div className="relative">
//               <input
//                 type="number" step="0.01"
//                 value={formData.weekly_work_hours}
//                 onChange={e => setFormData({ ...formData, weekly_work_hours: e.target.value })}
//                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800 focus:border-blue-500 outline-none"
//               />
//               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Hrs</span>
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
//             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
//               <Clock className="w-3.5 h-3.5 text-emerald-500" /> Monthly Target
//             </label>
//             <div className="relative">
//               <input
//                 type="number" step="0.01"
//                 value={formData.monthly_work_hours}
//                 onChange={e => setFormData({ ...formData, monthly_work_hours: e.target.value })}
//                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800 focus:border-blue-500 outline-none"
//               />
//               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Hrs</span>
//             </div>
//           </div>
//         </div>

//         {/* SUBMIT BUTTON */}
//         <div className="flex justify-end pt-4">
//           <button
//             type="submit"
//             disabled={saving}
//             className="flex items-center gap-2 px-10 py-4 bg-slate-900 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-500/10 transition-all active:scale-95 disabled:opacity-50"
//           >
//             {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//             {rules ? 'Update Policies' : 'Initialize Policies'}
//           </button>
//         </div>

//       </form>
//     </div>
//   );
// }



// Same but with axios


// export default function AdminWorkingRulesPage() {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [rules, setRules] = useState<any>(null);
//   const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

//   const [formData, setFormData] = useState({
//     company_name: "",
//     working_days: [] as string[],
//     daily_work_hours: "8.00",
//     weekly_work_hours: "40.00",
//     monthly_work_hours: "176.00"
//   });

//   useEffect(() => {
//     fetchRules();
//   }, []);

//   // ---------------- FETCH RULES ----------------
//   const fetchRules = async () => {
//     const token = Cookies.get("access");

//     try {
//       const response = await axios.get(
//         `${apiUrl}/admin/working-rules/`,
//         {
//           headers: {
//             Authorization: token ? `Bearer ${token}` : "",
//           },
//         }
//       );

//       const data = response.data;

//       // Singleton logic — only first rule is used
//       if (data && data.length > 0) {
//         const rule = data[0];

//         setRules(rule);
//         setFormData({
//           company_name: rule.company_name,
//           working_days: rule.working_days,
//           daily_work_hours: String(rule.daily_work_hours),
//           weekly_work_hours: String(rule.weekly_work_hours),
//           monthly_work_hours: String(rule.monthly_work_hours),
//         });
//       }
//     } catch (error) {
//       console.error("Failed to fetch rules", error);
//       setMessage({
//         type: "error",
//         text: "Failed to load working rules"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------------- TOGGLE DAYS ----------------
//   const handleDayToggle = (day: string) => {
//     setFormData(prev => ({
//       ...prev,
//       working_days: prev.working_days.includes(day)
//         ? prev.working_days.filter(d => d !== day)
//         : [...prev.working_days, day]
//     }));
//   };

//   // ---------------- SAVE RULE (CREATE OR UPDATE) ----------------
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSaving(true);
//     setMessage(null);

//     const token = Cookies.get("access");

//     const url = rules
//       ? `${apiUrl}/admin/working-rules/${rules.id}/`
//       : `${apiUrl}/admin/working-rules/`;

//     const method = rules ? "PUT" : "POST";

//     try {
//       const response = await axios({
//         url,
//         method,
//         data: formData,
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: token ? `Bearer ${token}` : "",
//         },
//       });

//       const updatedRule = response.data;

//       setRules(updatedRule);

//       setMessage({
//         type: "success",
//         text: rules
//           ? "Working rules updated successfully"
//           : "Working rules initialized successfully",
//       });

//     } catch (error: any) {
//       setMessage({
//         type: "error",
//         text: error?.response?.data?.error || "Failed to save working rules",
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ---------------- LOADER ----------------
//   if (loading) return (
//     <div className="flex h-96 items-center justify-center">
//       <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
//     </div>
//   );

//   return (
//     <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">

//       {/* HEADER */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
//         <div>
//           <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
//             <Settings2 className="w-3 h-3" />
//             <span>Core Configuration</span>
//           </div>
//           <h1 className="text-2xl font-black text-slate-800 tracking-tight">
//             Working Rules
//           </h1>
//           <p className="text-sm text-slate-500 font-medium">
//             Define operational days and hourly expectations for the company.
//           </p>
//         </div>
//       </div>

//       {/* STATUS MESSAGE */}
//       {message && (
//         <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-2 ${
//           message.type === 'success'
//             ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
//             : 'bg-rose-50 border-rose-100 text-rose-700'
//         }`}>
//           {message.type === 'success'
//             ? <CheckCircle2 className="w-5 h-5" />
//             : <AlertCircle className="w-5 h-5" />}
//           <span className="text-sm font-bold">{message.text}</span>
//         </div>
//       )}

//       {/* FORM */}
//       <form onSubmit={handleSubmit} className="space-y-6">

//         {/* COMPANY NAME */}
//         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
//           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
//             Company Profile
//           </label>
//           <div className="relative">
//             <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
//             <input
//               type="text"
//               required
//               placeholder="Enter Company Name"
//               value={formData.company_name}
//               onChange={e => setFormData({ ...formData, company_name: e.target.value })}
//               className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
//             />
//           </div>
//         </div>

//         {/* WORKING DAYS */}
//         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
//           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
//             <CalendarDays className="w-4 h-4 text-blue-500" /> Weekly Working Days
//           </label>
//           <div className="flex flex-wrap gap-3">
//             {WEEKDAYS.map((day) => {
//               const active = formData.working_days.includes(day.value);
//               return (
//                 <button
//                   key={day.value}
//                   type="button"
//                   onClick={() => handleDayToggle(day.value)}
//                   className={`px-5 py-3 rounded-xl text-xs font-black tracking-widest transition-all border-2 ${
//                     active
//                       ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
//                       : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
//                   }`}
//                 >
//                   {day.label}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* HOURS GRID */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {[
//             { label: "Daily Target", key: "daily_work_hours" },
//             { label: "Weekly Target", key: "weekly_work_hours" },
//             { label: "Monthly Target", key: "monthly_work_hours" },
//           ].map(item => (
//             <div key={item.key} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
//               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
//                 {item.label}
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={(formData as any)[item.key]}
//                 onChange={e => setFormData({ ...formData, [item.key]: e.target.value })}
//                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800 focus:border-blue-500 outline-none"
//               />
//             </div>
//           ))}
//         </div>

//         {/* SUBMIT */}
//         <div className="flex justify-end pt-4">
//           <button
//             type="submit"
//             disabled={saving}
//             className="flex items-center gap-2 px-10 py-4 bg-slate-900 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-500/10 transition-all active:scale-95 disabled:opacity-50"
//           >
//             {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//             {rules ? "Update Policies" : "Initialize Policies"}
//           </button>
//         </div>

//       </form>
//     </div>
//   );
// }

























"use client"

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import WorkingRulesTable from "@/components/attendance/WorkingRulesTable";
import WorkingRulesFormModal from "@/components/attendance/WorkingRulesFormModal";
import HolidayFormModal from "@/components/attendance/HolidayFormModal";
import HolidayTable from "@/components/attendance/HolidayTable";
import OverrideFormModal from "@/components/attendance/OverrideFormModal";
import OverrideTable from "@/components/attendance/OverrideTable";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export function AdminWorkingRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [openForm, setOpenForm] = useState(false);
  const [editingRule, setEditingRule] = useState<any | null>(null);

  // ---------------- LOAD RULES ----------------
  const loadRules = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("access");

      const res = await axios.get(
        `${apiUrl}/admin/working-rules/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRules(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load working rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  // ---------------- CREATE / UPDATE ----------------
  const saveRule = async (payload: any, ruleId?: number) => {
    try {
      const token = Cookies.get("access");

      if (ruleId) {
        await axios.put(
          `${apiUrl}/admin/working-rules/${ruleId}/`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Rule updated successfully");
      } else {
        await axios.post(
          `${apiUrl}/admin/working-rules/`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Rule created successfully");
      }

      setOpenForm(false);
      setEditingRule(null);
      loadRules();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to save rule");
    }
  };

  // Only allow ONE rule
  const hasRule = rules.length > 0;
  const currentRule = hasRule ? rules[0] : null;

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Company Working Rules</h1>

        {/* SHOW CREATE ONLY IF NO RULE EXISTS */}
        {!hasRule && (
          <button
            className="bg-blue-600 text-white px-5 py-2 rounded"
            onClick={() => {
              setEditingRule(null);
              setOpenForm(true);
            }}
          >
            Add Working Rule
          </button>
        )}

        {/* SHOW EDIT ONLY IF RULE EXISTS */}
        {hasRule && (
          <button
            className="bg-blue-600 text-white px-5 py-2 rounded"
            onClick={() => {
              setEditingRule(currentRule);
              setOpenForm(true);
            }}
          >
            Edit Working Rule
          </button>
        )}
      </div>

      {/* RULE VIEW */}
      {hasRule && (
        <WorkingRulesTable
          loading={loading}
          rules={[currentRule]}   // show only one rule
          onEdit={() => {
            setEditingRule(currentRule);
            setOpenForm(true);
          }}
        />
      )}

      {!hasRule && !loading && (
        <div className="p-10 text-center text-slate-400 border rounded-lg">
          No working rules configured yet.
        </div>
      )}

      {/* MODAL */}
      {openForm && (
        <WorkingRulesFormModal
          rule={editingRule}
          onClose={() => {
            setOpenForm(false);
            setEditingRule(null);
          }}
          onSubmit={saveRule}
        />
      )}
    </div>
  );
}


export function AdminHolidayPage() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [openForm, setOpenForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<any | null>(null);

  // ---------- Load Holidays ----------
  const loadHolidays = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("access");

      const res = await axios.get(
        `${apiUrl}/admin/holidays/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setHolidays(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load holidays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  // ---------- Create / Update ----------
  const saveHoliday = async (payload: any, holidayId?: number) => {
    try {
      const token = Cookies.get("access");

      if (holidayId) {
        await axios.put(
          `${apiUrl}/admin/holidays/${holidayId}/`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Holiday updated successfully");
      } else {
        await axios.post(
          `${apiUrl}/admin/holidays/`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Holiday created successfully");
      }

      setOpenForm(false);
      setEditingHoliday(null);
      loadHolidays();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to save holiday");
    }
  };

  // ---------- Delete ----------
  const deleteHoliday = async (holidayId: number) => {
    if (!confirm("Are you sure you want to delete this holiday?")) return;

    try {
      const token = Cookies.get("access");

      await axios.delete(
        `${apiUrl}/admin/holidays/${holidayId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Holiday deleted");
      loadHolidays();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Company Holidays</h1>

        <button
          className="bg-blue-600 text-white px-5 py-2 rounded"
          onClick={() => {
            setEditingHoliday(null);
            setOpenForm(true);
          }}
        >
          Add Holiday
        </button>
      </div>

      {/* TABLE */}
      <HolidayTable
        loading={loading}
        holidays={holidays}
        onEdit={(holiday) => {
          setEditingHoliday(holiday);
          setOpenForm(true);
        }}
        onDelete={deleteHoliday}
      />

      {/* MODAL */}
      {openForm && (
        <HolidayFormModal
          holiday={editingHoliday}
          onClose={() => {
            setOpenForm(false);
            setEditingHoliday(null);
          }}
          onSubmit={saveHoliday}
        />
      )}

    </div>
  );
}

export function AdminHolidayOverridePage() {
  const [overrides, setOverrides] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [openForm, setOpenForm] = useState(false);

  // ---------- Load Overrides ----------
  const loadOverrides = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("access");

      const res = await axios.get(
        `${apiUrl}/admin/overrides/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOverrides(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load overrides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverrides();
  }, []);

  // ---------- Create Override ----------
  const createOverride = async (payload: any) => {
    try {
      const token = Cookies.get("access");

      await axios.post(
        `${apiUrl}/admin/overrides/`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Override created successfully");
      setOpenForm(false);
      loadOverrides();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to create override");
    }
  };

  // ---------- Delete Override ----------
  const deleteOverride = async (overrideId: number) => {
    if (!confirm("Are you sure you want to delete this override?")) return;

    try {
      const token = Cookies.get("access");

      await axios.delete(
        `${apiUrl}/admin/overrides/${overrideId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Override deleted");
      loadOverrides();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Holiday Overrides</h1>

        <button
          className="bg-blue-600 text-white px-5 py-2 rounded"
          onClick={() => setOpenForm(true)}
        >
          Add Override
        </button>
      </div>

      {/* TABLE */}
      <OverrideTable
        loading={loading}
        overrides={overrides}
        onDelete={deleteOverride}
      />

      {/* MODAL */}
      {openForm && (
        <OverrideFormModal
          onClose={() => setOpenForm(false)}
          onSubmit={createOverride}
        />
      )}

    </div>
  );
}


import { format } from "date-fns";
import { CheckCircle2, ChevronDown, Users } from "lucide-react";
import { CalendarDay } from "@/lib/types";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";

interface AttendanceDay {
  date: string;
  punch_in: string | null;
  punch_out: string | null;
  total_time: string | null;
  work_status: string | null;
}

interface EmployeeAttendance {
  emp_id: number;
  employee_name: string;
  attendance: AttendanceDay[];
}

export function AdminAttendancePivotReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const [employees, setEmployees] = useState<{ id: number, name: string }[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  const dropdownRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const EXCLUDED_EMP_IDS = new Set<number>([4, 5, 9, 12]);


  const [data, setData] = useState<EmployeeAttendance[]>([]);
  const [expectedHours, setExpectedHours] = useState<number>(0);

  const [calendarMap, setCalendarMap] = useState<Record<string, CalendarDay>>({});


  // ---------- Load Employee List ----------
  useEffect(() => {
    const loadEmployees = async () => {
      const token = Cookies.get("access");

      const res = await axios.get(
        `${apiUrl}/api/admin/emp-total-details/`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          params: { start_date: "2025-01-01" }
        }
      );

      const list = res.data.emps
        .filter((e: any) => !EXCLUDED_EMP_IDS.has(e.emp_id))
        .map((e: any) => ({
          id: e.emp_id,
          name: e.employee_name
        }));

      setEmployees(list);
    };

    loadEmployees();
  }, []);

  const fetchCompanyCalendar = async (start: string, end: string) => {
    const token = Cookies.get("access");

    const res = await axios.get(`${apiUrl}/api/company-calendar`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      params: { start_date: start, end_date: end }
    });

    const map: Record<string, CalendarDay> = {};
    res.data.calendar.forEach((d: CalendarDay) => {
      map[d.date] = d;
    });

    setCalendarMap(map);
  };

  // ---------------- FETCH REPORT ----------------
  const fetchReport = async () => {
    if (!startDate) return alert("Start date is required");

    try {
      setLoading(true);
      const token = Cookies.get("access");

      const params: any = {
        start_date: format(new Date(startDate), "yyyy-MM-dd"),
      };

      if (endDate) params.end_date = format(new Date(endDate), "yyyy-MM-dd");

      if (selectedIds.length > 0) params.ids = selectedIds.join(",");
      else params.ids = "";

      const res = await axios.get(
        `${apiUrl}/api/admin/emp-total-details/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params
        }
      );

      const emps: EmployeeAttendance[] = res.data.emps || [];

      setData(res.data.emps || []);
      setExpectedHours(res.data.expected_total_hours || 0);

      await fetchCompanyCalendar(startDate, endDate);
    } catch (err) {
      console.error(err);
      alert("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- BUILD MATRIX ----------------

  const dates: string[] = [];
  if (data.length > 0) {
    data[0].attendance.forEach(d => dates.push(d.date));
  }

  // const employees = data.map(e => ({
  //   id: e.emp_id,
  //   name: e.employee_name
  // }));

  // Build map: date -> emp_id -> total_time
  type CellData = {
    total_time?: string | null;
    work_status?: string | null;
  };

  const matrix: Record<string, Record<number, CellData>> = {};

  data.forEach(emp => {
    emp.attendance.forEach(day => {
      if (!matrix[day.date]) matrix[day.date] = {};
      matrix[day.date][emp.emp_id] = {
        total_time: day.total_time,
        work_status: day.work_status
      };
    });
  });

  // ---------------- HELPERS ----------------

  const timeToMinutes = (time?: string | null) => {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const minutesToHHMM = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  // Calculate totals per employee
  // Calculate totals per employee
  const employeeTotals: Record<number, number> = {};
  const employeeLeaves: Record<number, number> = {};
  const employeeWfh: Record<number, number> = {};
  const employeePresent: Record<number, number> = {};
  const employeeAbsent: Record<number, number> = {};

  data.forEach(emp => {
    let totalMins = 0;
    let leaves = 0;
    let wfh = 0;
    let present = 0;
    let absent = 0;

    emp.attendance.forEach(day => {
      totalMins += timeToMinutes(day.total_time);
      const cell = matrix[day.date]?.[emp.emp_id];
      const calendarDay = calendarMap[day.date];
      const weekday = new Date(day.date).getDay();

      const isHolidayOrWeekend = calendarDay?.calendar_type === "HOLIDAY" || weekday === 0 || weekday === 6;

      if (cell?.work_status === "LEAVE") {
        leaves++;
      } else if (cell?.work_status === "WFH") {
        wfh++;
      } else if (cell?.total_time) {
        present++;
      } else if (!isHolidayOrWeekend) {
        absent++;
      }
    });

    employeeTotals[emp.emp_id] = totalMins;
    employeeLeaves[emp.emp_id] = leaves;
    employeeWfh[emp.emp_id] = wfh;
    employeePresent[emp.emp_id] = present;
    employeeAbsent[emp.emp_id] = absent;
  });

  const displayedEmployees = data.length > 0
    ? data.map(e => ({ id: e.emp_id, name: e.employee_name }))
    : (selectedIds.length > 0 ? employees.filter(e => selectedIds.includes(e.id)) : employees);

  const scrollTable = (offset: number) => {
    tableScrollRef.current?.scrollBy({ left: offset, behavior: "smooth" });
  };

  // ---------------- UI ----------------

  return (
    <div className="space-y-4 flex flex-col h-full">

      {/* FILTERS */}
      <div className="flex flex-wrap gap-4 items-end shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Start Date</label>
          <CustomDatePicker
            value={startDate}
            onChange={val => setStartDate(val)}
            placeholder="Select start date"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">End Date</label>
          <CustomDatePicker
            value={endDate}
            onChange={val => setEndDate(val)}
            placeholder="Select end date"
          />
        </div>

        {/* EMPLOYEE SELECT DROPDOWN (Floating Style) */}
        <div className="flex flex-col gap-1.5 w-full sm:w-64 relative" ref={dropdownRef}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Select Employees
            </label>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase">
              {selectedIds.length} Selected
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg bg-white transition-all shadow-sm
                          ${isDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-300 hover:border-slate-400'}`}
          >
            <span className="text-slate-700 truncate">
              {selectedIds.length === 0 ? "Choose team members..." : `${selectedIds.length} team members`}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-50 top-[calc(100%+4px)] left-0 w-full overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100">
              <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                {employees.map(emp => {
                  const checked = selectedIds.includes(emp.id);
                  return (
                    <label key={emp.id} className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all mb-0.5 ${checked ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-slate-50 text-slate-600"}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                          checked={checked}
                          onChange={() => {
                            if (checked) setSelectedIds(selectedIds.filter(i => i !== emp.id));
                            else setSelectedIds([...selectedIds, emp.id]);
                          }}
                        />
                        <span className="text-sm">{emp.name}</span>
                      </div>
                      {checked && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                    </label>
                  );
                })}
              </div>
              <div className="flex justify-between px-3 py-2 border-t border-slate-100 bg-slate-50/30">
                <button onClick={() => setSelectedIds([])} className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase px-2 py-1">Clear</button>
                <button onClick={() => setSelectedIds(employees.map(e => e.id))} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase px-2 py-1">Select All</button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={fetchReport}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow transition"
        >
          {loading ? "Loading..." : "Generate Data"}
        </button>
      </div>

      {/* TOP SCROLL CONTROLS */}
      {data.length > 0 && (
        <div className="flex items-center justify-between shrink-0 bg-white px-2">
          <span className="text-xs font-bold text-slate-500">
            Showing {displayedEmployees.length} employee{displayedEmployees.length !== 1 ? 's' : ''} across {dates.length} days
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollTable(-350)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition active:scale-95"
            >
              ← Scroll Left
            </button>
            <button
              type="button"
              onClick={() => scrollTable(350)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition active:scale-95"
            >
              Scroll Right →
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      {data.length > 0 && (
        <div ref={tableScrollRef} className="flex-1 overflow-auto border rounded-xl shadow-inner relative">

          <table className="min-w-max border-collapse text-sm">

            <thead className="bg-slate-100 sticky top-0 z-30 shadow-sm">
              <tr>
                <th className="sticky left-0 z-40 bg-slate-100 border px-4 py-2.5 text-left font-bold text-slate-700">
                  Date
                </th>
                <th className="sticky left-[110px] z-40 bg-slate-100 border px-4 py-2.5 text-left font-bold text-slate-700">
                  Day
                </th>
                {displayedEmployees.map(emp => (
                  <th key={emp.id} className="border px-4 py-2.5 text-center font-bold text-slate-800 min-w-[130px]">
                    {emp.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* DATE ROWS */}
              {dates.map(date => (
                <tr key={date} className="hover:bg-slate-50/50">
                  <td className="sticky left-0 z-20 bg-white border px-4 py-2 font-semibold whitespace-nowrap text-slate-700">
                    {format(new Date(date), "dd MMM yyyy")}
                  </td>

                  <td className="sticky left-[110px] z-20 bg-white border px-4 py-2 font-semibold whitespace-nowrap text-slate-600">
                    {format(new Date(date), "EEEE")}
                  </td>

                  {displayedEmployees.map(emp => (
                    <td key={emp.id} className="border px-4 py-2 text-center bg-white">
                      {(() => {
                        const cell = matrix[date]?.[emp.id];
                        const calendarDay = calendarMap[date];
                        const weekday = new Date(date).getDay(); // 0=Sun,6=Sat

                        // Holiday
                        if (calendarDay?.calendar_type === "HOLIDAY") {
                          return (
                            <span className="text-blue-800 font-semibold text-xs">
                              {calendarDay.holiday_name}
                            </span>
                          );
                        }

                        // Leave
                        if (cell?.work_status === "LEAVE") {
                          return (
                            <span className="text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded text-xs font-bold">
                              Leave
                            </span>
                          );
                        }

                        // WFH
                        if (cell?.work_status === "WFH") {
                          return (
                            <span className="text-purple-900 bg-purple-200/80 px-2.5 py-0.5 rounded text-xs font-bold">
                              WFH
                            </span>
                          );
                        }

                        // Off
                        if (cell?.work_status === "OFF") {
                          return (
                            <span className="text-slate-500 font-semibold text-xs">
                              Off
                            </span>
                          );
                        }

                        // Weekend
                        if (weekday === 0) {
                          return (
                            <span className="text-yellow-500 font-semibold text-xs">
                              Sunday
                            </span>
                          );
                        }

                        if (weekday === 6) {
                          return (
                            <span className="text-yellow-500 font-semibold text-xs">
                              Saturday
                            </span>
                          );
                        }

                        // Absent
                        if (!cell?.total_time) {
                          return (
                            <span className="text-red-600 font-bold text-xs">
                              Absent
                            </span>
                          );
                        }

                        // Present
                        return <span className="font-medium text-slate-800">{cell.total_time}</span>;
                      })()}
                    </td>
                  ))}
                </tr>
              ))}

              {/* TOTAL HOURS ROW */}
              <tr className="bg-emerald-50 font-bold text-emerald-950 border-t-2 border-slate-300">
                <td className="border px-4 py-2.5 sticky left-0 z-20 bg-emerald-100">
                  Total Hours Worked
                </td>
                <td className="sticky left-[110px] z-20 bg-emerald-50 border px-4 py-2.5 font-semibold whitespace-nowrap text-center">
                  Hours
                </td>
                {displayedEmployees.map(emp => (
                  <td key={emp.id} className="border px-4 py-2.5 text-center font-black">
                    {minutesToHHMM(employeeTotals[emp.id] || 0)}
                  </td>
                ))}
              </tr>

              {/* EXPECTED HOURS ROW */}
              <tr className="bg-blue-50 font-bold text-blue-950">
                <td className="border px-4 py-2.5 sticky left-0 z-20 bg-blue-100">
                  Expected Hours
                </td>
                <td className="sticky left-[110px] z-20 bg-blue-50 border px-4 py-2.5 font-semibold whitespace-nowrap text-center">
                  Expected
                </td>
                {displayedEmployees.map(emp => (
                  <td key={emp.id} className="border px-4 py-2.5 text-center font-black">
                    {expectedHours}
                  </td>
                ))}
              </tr>

              {/* TOTAL PRESENT ROW */}
              <tr className="bg-green-50 font-bold text-green-950">
                <td className="border px-4 py-2.5 sticky left-0 z-20 bg-green-100">
                  Total Present Days
                </td>
                <td className="sticky left-[110px] z-20 bg-green-50 border px-4 py-2.5 font-semibold whitespace-nowrap text-center">
                  Present
                </td>
                {displayedEmployees.map(emp => (
                  <td key={emp.id} className="border px-4 py-2.5 text-center">
                    <span className="bg-green-200 text-green-900 px-3 py-1 rounded-full text-xs font-black shadow-sm">
                      {employeePresent[emp.id] || 0}
                    </span>
                  </td>
                ))}
              </tr>

              {/* TOTAL WFH ROW */}
              <tr className="bg-purple-50 font-bold text-purple-950">
                <td className="border px-4 py-2.5 sticky left-0 z-20 bg-purple-100">
                  Total WFH Days
                </td>
                <td className="sticky left-[110px] z-20 bg-purple-50 border px-4 py-2.5 font-semibold whitespace-nowrap text-center">
                  WFH
                </td>
                {displayedEmployees.map(emp => (
                  <td key={emp.id} className="border px-4 py-2.5 text-center">
                    <span className="bg-purple-200 text-purple-900 px-3 py-1 rounded-full text-xs font-black shadow-sm">
                      {employeeWfh[emp.id] || 0}
                    </span>
                  </td>
                ))}
              </tr>

              {/* TOTAL LEAVE ROW */}
              <tr className="bg-amber-50 font-bold text-amber-950">
                <td className="border px-4 py-2.5 sticky left-0 z-20 bg-amber-100">
                  Total Leave Days
                </td>
                <td className="sticky left-[110px] z-20 bg-amber-50 border px-4 py-2.5 font-semibold whitespace-nowrap text-center">
                  Leave
                </td>
                {displayedEmployees.map(emp => (
                  <td key={emp.id} className="border px-4 py-2.5 text-center">
                    <span className="bg-amber-200 text-amber-950 px-3 py-1 rounded-full text-xs font-black shadow-sm">
                      {employeeLeaves[emp.id] || 0}
                    </span>
                  </td>
                ))}
              </tr>

              {/* TOTAL ABSENT ROW */}
              <tr className="bg-red-50 font-bold text-red-950">
                <td className="border px-4 py-2.5 sticky left-0 z-20 bg-red-100">
                  Total Absent Days
                </td>
                <td className="sticky left-[110px] z-20 bg-red-50 border px-4 py-2.5 font-semibold whitespace-nowrap text-center">
                  Absent
                </td>
                {displayedEmployees.map(emp => (
                  <td key={emp.id} className="border px-4 py-2.5 text-center">
                    <span className="bg-red-200 text-red-950 px-3 py-1 rounded-full text-xs font-black shadow-sm">
                      {employeeAbsent[emp.id] || 0}
                    </span>
                  </td>
                ))}
              </tr>

            </tbody>

          </table>
        </div>
      )}

      {data.length === 0 && !loading && (
        <div className="p-10 text-center text-slate-400 border rounded-xl bg-slate-50/50">
          No report generated yet. Select dates and employees, then click Generate Data.
        </div>
      )}

    </div>
  );
}


export default function CompanyWorkPage() {
  return (
    <></>
  )
}
