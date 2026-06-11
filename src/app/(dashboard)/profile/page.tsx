"use client";

import axios from 'axios';
import React, { useState, useEffect, ChangeEvent, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Cookies from "js-cookie";
import { apiUrl } from '@/lib/data';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

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
    const [files, setFiles] = useState<{ [key: string]: File }>({});
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/api/profile/me');
            // Assuming get_queryset returns a list, we take the first item
            const data = Array.isArray(response.data) ? response.data[0] : response.data;
            setProfile(data);
        } catch (error) {
            console.error("Error fetching profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (e.target.name === 'profile_photo_file') {
                // Use FileReader data URL instead of createObjectURL
                // for better compatibility with react-easy-crop on mobile
                const reader = new FileReader();
                reader.onload = () => {
                    setCropImageSrc(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setFiles({ ...files, [e.target.name]: file });
            }
            // Reset the value so that selecting the same image again still triggers onChange
            e.target.value = '';
        }
    };

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);

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
        if (files.e_sign_file) formData.append('e_sign_file', files.e_sign_file);

        try {
            await api.patch(`/api/profile/me/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Profile updated successfully");
            setPreviewUrl(null);
            fetchProfile(); // Refresh data
        } catch (error) {
            console.error("Update failed", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-slate-500">Loading profile...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800">
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900">Employee Profile</h1>
                        <p className="text-sm text-slate-500">Update your professional information and documents</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold disabled:bg-slate-300"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                <div className="p-6 md:p-8 space-y-8">

                    {/* Section 1: Basic Info */}
                    <section>
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Profile Photo Display & Upload */}
                            <div className="flex flex-col items-center space-y-3 p-4 bg-slate-50 rounded-lg">
                                <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : profile?.profile_photo ? (
                                        <img src={
                                            profile.profile_photo.startsWith('/api/') 
                                                ? `${apiUrl}${profile.profile_photo}?t=${Date.now()}` 
                                                : profile.profile_photo.startsWith('data:') 
                                                    ? profile.profile_photo 
                                                    : `data:image/jpeg;base64,${profile.profile_photo}`
                                        } alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo</div>
                                    )}
                                </div>
                                <label className="cursor-pointer text-blue-600 text-xs font-semibold hover:underline">
                                    Change Photo
                                    <input type="file" name="profile_photo_file" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>

                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                                    <input type="text" name="name" value={profile?.name || ''} onChange={handleInputChange} className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
                                    <input type="email" name="email" value={profile?.email || ''} onChange={handleInputChange} className="w-full p-2 border border-slate-200 rounded text-sm bg-slate-50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
                                    <input type="text" name="phone" value={profile?.phone || ''} onChange={handleInputChange} className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Gender</label>
                                    <select name="gender" value={profile?.gender || ''} onChange={handleInputChange} className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Emergency Contact</label>
                                    <input
                                        type="text"
                                        name="emergency_contact"
                                        value={profile?.emergency_contact || ''}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={profile?.date_of_birth || ''}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                            </div>
                        </div>
                    </section>

                    {/* Section 2: Work Details */}
                    <section className="pt-6 border-t border-slate-100">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Professional Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Department</label>
                                <select
                                    name="department"
                                    value={profile?.department || ''}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">Select Department</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Human Resource">Human Resource</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Designation</label>
                                <input type="text" name="designation" value={profile?.designation || ''} onChange={handleInputChange} className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Joining Date</label>
                                <input
                                    type="date"
                                    name="joining_date"
                                    value={profile?.joining_date || ''}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">LinkedIn URL</label>
                                <input type="url" name="linkedIn" value={profile?.linkedIn || ''} onChange={handleInputChange} className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Address & Bio */}
                    <section className="pt-6 border-t border-slate-100">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Residential Address</h2>
                        <textarea
                            name="address"
                            rows={3}
                            value={profile?.address || ''}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter your full home address..."
                        />
                    </section>
                    <div className="flex flex-col items-center space-y-3 p-4 bg-slate-50 rounded-lg">
                        <div className="w-40 h-20 border border-dashed border-slate-300 rounded bg-white flex items-center justify-center">
                            {profile?.e_sign ? (
                                <img src={`data:image/png;base64,${profile.e_sign}`} alt="E-Sign" className="max-h-full" />
                            ) : (
                                <span className="text-xs text-slate-400">No E-Sign</span>
                            )}
                        </div>

                        <label className="cursor-pointer text-blue-600 text-xs font-semibold hover:underline">
                            Upload E-Sign
                            <input
                                type="file"
                                name="e_sign_file"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
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