"use client";

import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import Lottie from "lottie-react";
import { useWindowSize } from "react-use";
import axios from "axios";
import Cookies from "js-cookie";
import { apiUrl } from "@/lib/data";
import { X } from "lucide-react";
import birthdayAnimation from "../../public/birthday.json";

function getOrdinalNum(n: number) {
  return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
}

export default function BirthdayCelebration() {
  const [show, setShow] = useState(false);
  const [age, setAge] = useState<number>(0);
  const [name, setName] = useState("");
  const { width, height } = useWindowSize();

  useEffect(() => {
    const checkBirthday = async () => {
      try {
        const token = Cookies.get("access");
        if (!token) return;

        // Fetch user profile
        const res = await axios.get(`${apiUrl}/api/profile/me/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const profile = res.data;
        if (!profile.date_of_birth) return;

        const dob = new Date(profile.date_of_birth);
        const today = new Date();

        // Check if today is their birthday
        if (dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate()) {
          const currentAge = today.getFullYear() - dob.getFullYear();
          const storageKey = `birthday_wished_${today.getFullYear()}`;
          
          // Check if we already showed it today
          if (!localStorage.getItem(storageKey)) {
            setAge(currentAge);
            setName(profile.name || "User");
            setShow(true);

            // Automatically hide after 15 seconds
            setTimeout(() => {
              handleClose();
            }, 15000);
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile for birthday check", error);
      }
    };

    checkBirthday();
  }, []);

  const handleClose = () => {
    const today = new Date();
    const storageKey = `birthday_wished_${today.getFullYear()}`;
    localStorage.setItem(storageKey, "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fadeIn">
      <Confetti width={width} height={height} numberOfPieces={400} gravity={0.15} />
      
      <div className="relative bg-white/10 p-10 md:p-16 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center justify-center max-w-2xl w-[90%] mx-auto transform animate-bounce-slow text-center">
        
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors z-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lottie Animation */}
        <div className="w-64 h-64 md:w-80 md:h-80 -mt-10">
          <Lottie animationData={birthdayAnimation} loop={true} />
        </div>

        {/* Dynamic Text */}
        <div className="space-y-4 relative z-10 -mt-8">
          <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 drop-shadow-lg tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
            Happy {getOrdinalNum(age)} Birthday
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white drop-shadow-md">
            {name}! 🎉
          </h3>
          <p className="text-lg md:text-xl text-white/80 mt-4 max-w-md mx-auto font-medium">
            Wishing you a fantastic day filled with joy, success, and great celebrations from all of us at BuzzHire!
          </p>
        </div>

      </div>
    </div>
  );
}
