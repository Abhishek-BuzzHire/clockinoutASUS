"use client";

import axios from 'axios';
import React, { useState, useEffect, ChangeEvent, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Cookies from "js-cookie";
import { apiUrl } from '@/lib/data';
import { X, ZoomIn, ZoomOut, Upload, User, Briefcase, MapPin, Camera, Linkedin, ShieldCheck } from 'lucide-react';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';
import { useAuth } from '@/context/AuthContext';
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useRouter } from 'next/navigation';

interface ProfileData {
    id?: number;
    name: string;
    phone: string;
    emergency_contact: string;
    e_sign: string;
    email: string;
    department: string;
    designation: string;
    gender: string;
    address: string;
    joining_date: string;
    date_of_birth: string;
    linkedIn: string;
    profile_photo?: string; // Base64 string from backend
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      if (file) {
        resolve(file);
      } else {
        reject(new Error('Canvas toBlob failed'));
      }
    }, 'image/jpeg');
  });
}

const token = Cookies.get("access");

const api = axios.create({
    baseURL: apiUrl,
    headers: { Authorization: `Bearer ${token}` }
});

export default function ProfilePage() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [files, setFiles] = useState<{ [key: string]: File }>({});
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [cropperActive, setCropperActive] = useState(false);
    const [photoTimestamp, setPhotoTimestamp] = useState(Date.now());
    const { employee, isLoading: isEmployeeLoading, mutate: mutateCurrentEmployee } = useCurrentEmployee();
    const { user } = useAuth();

    // Admin PIN state
    const [adminPin, setAdminPin] = useState('');
    const [savingPin, setSavingPin] = useState(false);

    useEffect(() => {
        if (cropImageSrc) {
            const timer = setTimeout(() => {
                setCropperActive(true);
            }, 350);
            return () => clearTimeout(timer);
        } else {
            setCropperActive(false);
        }
    }, [cropImageSrc]);

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropSave = async () => {
        if (!cropImageSrc || !croppedAreaPixels) return;
        try {
            const croppedBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels);
            const croppedFile = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });
            setFiles(prev => ({ ...prev, profile_photo_file: croppedFile }));
            
            const localUrl = URL.createObjectURL(croppedBlob);
            setPreviewUrl(localUrl);
            setCropImageSrc(null);
        } catch (e) {
            console.error("Error cropping image", e);
        }
    };

    useEffect(() => {
        if (typeof window === "undefined") return;

        const currentDate = new Date();
        const cacheKey = `attendance_local_cache_${format(currentDate, "yyyy-MM")}`;
        const stored = localStorage.getItem(cacheKey);

        if (!stored) {
            const prewarmCache = async () => {
                try {
                    const token = Cookies.get("access");
                    if (!token) return;
                    
                    const start = format(startOfMonth(currentDate), "yyyy-MM-dd");
                    const end = format(endOfMonth(currentDate), "yyyy-MM-dd");
                    const headers = { Authorization: `Bearer ${token}` };

                    console.log("⚡ [Profile] Pre-warming attendance cache in background...");
                    const [calRes, attRes] = await Promise.all([
                        axios.get(`${apiUrl}/api/company-calendar`, { headers, params: { start_date: start, end_date: end } }),
                        axios.get(`${apiUrl}/api/admin/emp-total-details/`, { headers, params: { start_date: start, end_date: end } })
                    ]);

                    const payload = { calendar: calRes.data, attendance: attRes.data };
                    localStorage.setItem(cacheKey, JSON.stringify(payload));
                    console.log("⚡ [Profile] Attendance cache pre-warmed successfully!");
                } catch (e) {
                    console.error("Failed to pre-warm attendance cache in Profile:", e);
                }
            };
            prewarmCache();
        }
    }, []);

    // Use SWR cached data for instant 0ms load
    useEffect(() => {
        if (employee) {
            setProfile(employee as unknown as ProfileData);
            setLoading(false);
        } else if (!isEmployeeLoading) {
            // If SWR finished and there is no employee
            setLoading(false);
        }
    }, [employee, isEmployeeLoading]);

    // Keep fetchProfile available for forced refreshes after save
    const fetchProfile = async () => {
        try {
            await mutateCurrentEmployee(); // Re-fetch SWR data
        } catch (error) {
            console.error("Error fetching profile", error);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => prev ? { ...prev, [name]: value } : null);
    };

    const [processingImage, setProcessingImage] = useState(false);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            let file = e.target.files[0];
            
            const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
            if (isHeic) {
                setProcessingImage(true);
                try {
                    const heic2any = (await import('heic2any')).default;
                    const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
                    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                    file = new window.File([blob], file.name.replace(/\.heic|\.heif/i, '.jpg'), { type: 'image/jpeg' });
                } catch (err) {
                    console.error("HEIC conversion failed:", err);
                    alert("Failed to process HEIC image. Please try another photo.");
                    e.target.value = '';
                    setProcessingImage(false);
                    return;
                }
                setProcessingImage(false);
            }

            if (e.target.name === 'profile_photo_file') {
                // INSTANT 0ms loading
                setCropImageSrc(URL.createObjectURL(file));
            } else {
                setFiles({ ...files, [e.target.name]: file });
            }
            e.target.value = '';
        }
    };

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        setError(null);

        // Use FormData for binary/file uploads
        const formData = new FormData();

        // Append text fields
        Object.entries(profile).forEach(([key, value]) => {
            if (value !== null && key !== 'profile_photo' && key !== 'e_sign') {
                formData.append(key, value.toString());
            }
        });

        // Append specific files for binary fields as defined in your Serializer
        if (files.profile_photo_file) formData.append('profile_photo_file', files.profile_photo_file);

        try {
            await api.patch(`/api/profile/me/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("✅ Details updated successfully");
            setPreviewUrl(null);
            setPhotoTimestamp(Date.now());
            mutateCurrentEmployee();
            fetchProfile(); // Refresh data
        } catch (error: any) {
            console.error("Update failed", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to update profile. Please try again.";
            setError(errorMessage);
            alert(`❌ Error: ${errorMessage}`);
        } finally {
            setSaving(false);
        }
    };

    const handleSavePin = async () => {
        if (adminPin.length !== 4) {
            alert("PIN must be exactly 4 digits.");
            return;
        }
        setSavingPin(true);
        try {
            await api.post(`/api/documents/admin/set-pin/`, { pin: adminPin });
            alert("✅ Admin PIN updated successfully.");
            setAdminPin("");
        } catch (error: any) {
            console.error("Failed to update PIN", error);
            alert("❌ Failed to update PIN. Please try again.");
        } finally {
            setSavingPin(false);
        }
    };

    if (loading) return <div className="p-8 text-slate-500">Loading profile...</div>;

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 text-slate-800 font-sans">
            
            {processingImage && (
                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-sm">
                    <div className="w-12 h-12 border-4 border-slate-600 border-t-white rounded-full animate-spin mb-4 shadow-lg"></div>
                    <p className="text-white font-bold text-lg tracking-wide drop-shadow-sm">Processing Image...</p>
                    <p className="text-slate-300 text-sm mt-1">Preparing high-quality preview</p>
                </div>
            )}

            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-100 bg-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Profile</h1>
                            <p className="text-sm text-slate-500 mt-1">Manage your personal and professional details</p>
                        </div>
                        <button
                            onClick={() => router.push('/documents')}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm hover:shadow-md"
                        >
                            <Upload size={18} />
                            Upload Documents
                        </button>
                    </div>
                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex justify-between items-center shadow-sm">
                            <span className="text-sm font-medium text-red-800">{error}</span>
                            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">✕</button>
                        </div>
                    )}
                </div>

                <div className="p-6 md:p-8 space-y-10">

                    {/* Section 1: Basic Info */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <User size={18} />
                            </div>
                            <h2 className="text-base font-semibold text-slate-900">Basic Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            
                            {/* Profile Photo Display & Upload */}
                            <div className="md:col-span-4 flex flex-col items-center">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full bg-slate-100 overflow-hidden ring-4 ring-slate-50 shadow-md">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : profile?.profile_photo ? (
                                            <img src={
                                                profile.profile_photo.startsWith('/api/') 
                                                    ? (profile.profile_photo.includes('?') 
                                                        ? `${apiUrl}${profile.profile_photo}` 
                                                        : `${apiUrl}${profile.profile_photo}?t=${photoTimestamp}`)
                                                    : profile.profile_photo.startsWith('data:') 
                                                        ? profile.profile_photo 
                                                        : `data:image/jpeg;base64,${profile.profile_photo}`
                                            } alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                                <User size={32} className="opacity-50 mb-1" />
                                                <span className="text-[10px] uppercase font-semibold">No Photo</span>
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 p-2.5 bg-blue-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors ring-4 ring-white group-hover:scale-105 transform duration-200">
                                        <Camera size={16} />
                                        <input type="file" name="profile_photo_file" className="hidden" onChange={handleFileChange} />
                                    </label>
                                </div>
                                <p className="text-xs text-slate-500 mt-4 font-medium">Allowed: JPG, PNG (Max 5MB)</p>
                            </div>

                            {/* Inputs */}
                            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                                    <input type="text" name="name" value={profile?.name || ''} onChange={handleInputChange} className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                                    <input type="email" name="email" value={profile?.email || ''} onChange={handleInputChange} className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
                                    <input type="text" name="phone" value={profile?.phone || ''} onChange={handleInputChange} className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
                                    <select name="gender" value={profile?.gender || ''} onChange={handleInputChange} className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Emergency Contact</label>
                                    <input
                                        type="text"
                                        name="emergency_contact"
                                        value={profile?.emergency_contact || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={profile?.date_of_birth || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* Section 2: Work Details */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Briefcase size={18} />
                            </div>
                            <h2 className="text-base font-semibold text-slate-900">Professional Details</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department</label>
                                <select
                                    name="department"
                                    value={profile?.department || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                >
                                    <option value="">Select Department</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Human Resource">Human Resource</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Marketing">Marketing</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Designation</label>
                                <input type="text" name="designation" value={profile?.designation || ''} onChange={handleInputChange} className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Joining Date</label>
                                <input
                                    type="date"
                                    name="joining_date"
                                    value={profile?.joining_date || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">LinkedIn Profile</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <img src="https://img.icons8.com/color/48/linkedin.png" alt="LinkedIn" className="w-5 h-5 object-contain" />
                                    </div>
                                    <input type="url" name="linkedIn" value={profile?.linkedIn || ''} onChange={handleInputChange} placeholder="https://linkedin.com/in/username" className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* Section 3: Address */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <MapPin size={18} />
                            </div>
                            <h2 className="text-base font-semibold text-slate-900">Residential Address</h2>
                        </div>
                        <textarea
                            name="address"
                            rows={3}
                            value={profile?.address || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                            placeholder="Enter your full home address..."
                        />
                    </section>

                    {user?.role === "admin" && (
                        <>
                            <hr className="border-slate-100" />
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <h2 className="text-base font-semibold text-slate-900">Document Security (Admin Only)</h2>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-end gap-4 max-w-sm">
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Set 4-Digit Document PIN</label>
                                        <input
                                            type="password"
                                            maxLength={4}
                                            value={adminPin}
                                            onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))}
                                            className="w-full px-3.5 py-2.5 tracking-[0.5em] text-center font-bold bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                            placeholder="••••"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSavePin}
                                        disabled={savingPin || adminPin.length !== 4}
                                        className="px-6 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all duration-300 text-sm font-semibold disabled:bg-slate-300 shadow-sm"
                                    >
                                        {savingPin ? 'Saving...' : 'Set PIN'}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">This PIN is required to unlock employee documents.</p>
                            </section>
                        </>
                    )}

                    {/* Save Changes Button */}
                    <div className="pt-4 pb-2 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 text-sm font-semibold disabled:bg-slate-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0.5"
                        >
                            {saving ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>

                </div>
            </div>
            
            {/* Cropper Modal */}
            {cropImageSrc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col transform scale-100 transition-all duration-300">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                            <h3 className="text-base font-semibold text-slate-800">Edit photo</h3>
                            <button
                                type="button"
                                onClick={() => setCropImageSrc(null)}
                                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body (Cropper Area) */}
                        <div className="relative w-full h-[280px] bg-slate-900">
                            {cropperActive && (
                                <Cropper
                                    image={cropImageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    cropShape="round"
                                    showGrid={false}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                />
                            )}
                        </div>

                        {/* Controls (Zoom Slider) */}
                        <div className="px-6 py-4 bg-slate-50/50 flex flex-col items-center border-b border-slate-100">
                            <div className="flex items-center space-x-3 w-full max-w-xs">
                                <ZoomOut size={16} className="text-slate-400" />
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                                />
                                <ZoomIn size={16} className="text-slate-400" />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-white flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setCropImageSrc(null)}
                                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full text-xs font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCropSave}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold shadow-sm transition-colors"
                            >
                                Save Photo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}