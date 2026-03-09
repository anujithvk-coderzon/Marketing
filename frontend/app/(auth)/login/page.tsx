"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { isAxiosError } from "axios";
import { errorToast, successToast } from "@/helper/ToastMessage";
import { useAuth } from "@/context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullhorn,
  faPaperPlane,
  faUsers,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

const Page = () => {
  const [data, setData] = useState({ email: "", password: "" });

  const [showPassword, setShowPassword] = useState(false);
  const route = useRouter();
  const { login } = useAuth();

  const inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await api.post("/login", data);
      if (response) {
        successToast(response.data.message);
        await login(response.data.accessToken);
        setTimeout(() => {
          route.push("/");
        }, 1000);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const errors = error.response?.data.errors;
        if (errors && errors.length > 0) {
          errors.forEach((err: { field: string; message: string }) =>
            errorToast(`${err.field}: ${err.message}`)
          );
        } else {
          errorToast(error.response?.data.message);
        }
        if (status === 404) {
          setTimeout(() => {
            route.push("/register");
          }, 1500);
        }
      }
    }
  };

  const features = [
    { icon: faPaperPlane, text: "Send personalized emails to contacts" },
    { icon: faBullhorn, text: "Schedule & manage email campaigns" },
    { icon: faUsers, text: "Import & organize contact lists" },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full">
{}

      <div className="relative w-full lg:w-[45%] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800
                      flex flex-col items-center justify-center
                      px-4 sm:px-6 py-10 sm:py-12 lg:py-0 lg:min-h-screen lg:fixed lg:left-0 lg:top-0
                      text-white overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-sm
                          flex items-center justify-center border border-white/20">
            <FontAwesomeIcon icon={faBullhorn} className="text-3xl sm:text-4xl text-blue-400" />
          </div>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Welcome back to <span className="text-blue-400">CODERZON</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-sm leading-relaxed">
            Sign in to manage your contacts, send emails, and run campaigns.
          </p>
          <div className="hidden sm:flex flex-col gap-4 mt-4">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={feature.icon} className="text-blue-400 text-xs" />
                </div>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[55%] lg:ml-[45%] flex items-start lg:items-center justify-center
                      px-4 sm:px-8 py-8 sm:py-12 lg:py-0 min-h-screen">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faEnvelope} className="text-slate-400 text-sm" />
                </div>
                <input type="email" id="email" required placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-200"
                  value={data.email} onChange={inputChange} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="text-slate-400 text-sm" />
                </div>
                <input type={showPassword ? "text" : "password"} id="password" placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-200"
                  value={data.password} onChange={inputChange} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-sm" />
                </button>
              </div>
            </div>

            <button type="submit"
              className="w-full py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2">
              Sign In
              <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors">Create one</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
