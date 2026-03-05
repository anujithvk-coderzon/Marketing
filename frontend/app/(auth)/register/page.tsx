"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/helper/loader";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import { errorToast, successToast } from "@/helper/ToastMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullhorn,
  faChartLine,
  faPaperPlane,
  faUsers,
  faUser,
  faEnvelope,
  faPhone,
  faLock,
  faEye,
  faEyeSlash,
  faArrowRight,
  faCircleCheck,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";

const Page = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [passwordTest, setPasswordTest] = useState({
    length: false,
    upper: false,
    lower: false,
    special: false,
    number: false,
  });
  const [loader, setLoader] = useState(false);
  const route = useRouter();
  const [match, setMatch] = useState(false);
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setData((prev) => ({ ...prev, [id]: value }));
  };
  const passwordOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setPasswordTest({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%&*?]/.test(password),
    });
  };
  const isPasswordValid =
    passwordTest.length &&
    passwordTest.upper &&
    passwordTest.lower &&
    passwordTest.number &&
    passwordTest.special;

  const strengthCount = [
    passwordTest.length,
    passwordTest.upper,
    passwordTest.lower,
    passwordTest.number,
    passwordTest.special,
  ].filter(Boolean).length;

  const confirmingPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmValue = e.target.value;
    setPasswordConfirmation(confirmValue);
    setMatch(confirmValue === data.password);
  };

  const handleSumbit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoader(true);
    try {
      const response = await api.post("/register", data);
      if (response) {
        console.log(response);
        successToast(response.data.message);
        setTimeout(() => {
          route.push(`/register/verification?email=${encodeURIComponent(data.email)}`);
        }, 1500);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        setLoader(false);
        const errors = error.response?.data.errors;
        if (errors && errors.length > 0) {
          errors.forEach((err: { field: string; message: string }) =>
            errorToast(`${err.field}: ${err.message}`)
          );
        } else {
          errorToast(error.response?.data.message);
        }
      }
    }
  };

  const features = [
    { icon: faChartLine, text: "Real-time campaign analytics" },
    { icon: faUsers, text: "Audience segmentation & targeting" },
    { icon: faPaperPlane, text: "Automated email campaigns" },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full">
      {/* Loader Overlay */}
      {loader && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <Loader />
        </div>
      )}

      {/* Left Branding Panel */}
      <div
        className="relative w-full lg:w-[45%] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800
                      flex flex-col items-center justify-center
                      px-4 sm:px-6 py-10 sm:py-12 lg:py-0 lg:min-h-screen lg:fixed lg:left-0 lg:top-0
                      text-white overflow-hidden"
      >
        {/* Decorative blurred circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          {/* Brand Icon */}
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-sm
                          flex items-center justify-center border border-white/20"
          >
            <FontAwesomeIcon
              icon={faBullhorn}
              className="text-3xl sm:text-4xl text-blue-400"
            />
          </div>

          {/* Heading */}
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Welcome to <span className="text-blue-400">Coderzon</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-sm leading-relaxed">
            Launch smarter campaigns, reach the right audience, and grow your
            business with enterprise-grade marketing tools.
          </p>

          {/* Feature bullets - hidden on small mobile */}
          <div className="hidden sm:flex flex-col gap-4 mt-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-slate-300 text-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon
                    icon={feature.icon}
                    className="text-blue-400 text-xs"
                  />
                </div>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div
        className="w-full lg:w-[55%] lg:ml-[45%] flex items-start lg:items-center justify-center
                      px-4 sm:px-8 py-8 sm:py-12 lg:py-0 min-h-screen"
      >
        <div className="w-full max-w-md">
          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              Create your account
            </h2>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              Start your free trial. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSumbit} className="flex flex-col gap-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="text-sm font-medium text-slate-700"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-slate-400 text-sm"
                  />
                </div>
                <input
                  type="text"
                  id="name"
                  required
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300
                             bg-slate-50 text-slate-800 text-sm
                             placeholder:text-slate-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                             transition-all duration-200"
                  value={data.name}
                  onChange={inputChange}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-slate-400 text-sm"
                  />
                </div>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300
                             bg-slate-50 text-slate-800 text-sm
                             placeholder:text-slate-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                             transition-all duration-200"
                  value={data.email}
                  onChange={inputChange}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-slate-700"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="text-slate-400 text-sm"
                  />
                </div>
                <input
                  type="text"
                  id="phone"
                  required
                  placeholder="9876543210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300
                             bg-slate-50 text-slate-800 text-sm
                             placeholder:text-slate-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                             transition-all duration-200"
                  value={data.phone}
                  onChange={inputChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faLock}
                    className="text-slate-400 text-sm"
                  />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-lg border border-slate-300
                             bg-slate-50 text-slate-800 text-sm
                             placeholder:text-slate-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                             transition-all duration-200"
                  value={data.password}
                  onChange={(e) => {
                    inputChange(e);
                    passwordOnchange(e);
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400
                             hover:text-slate-600 transition-colors"
                >
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="text-sm"
                  />
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {data.password.length > 0 && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-500">
                      Password strength
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        strengthCount <= 1
                          ? "text-red-500"
                          : strengthCount <= 3
                            ? "text-amber-500"
                            : strengthCount === 5
                              ? "text-green-500"
                              : "text-blue-500"
                      }`}
                    >
                      {strengthCount <= 1
                        ? "Weak"
                        : strengthCount <= 3
                          ? "Fair"
                          : strengthCount === 4
                            ? "Strong"
                            : "Excellent"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        strengthCount <= 1
                          ? "bg-red-500"
                          : strengthCount <= 3
                            ? "bg-amber-500"
                            : strengthCount === 5
                              ? "bg-green-500"
                              : "bg-blue-500"
                      }`}
                      style={{ width: `${(strengthCount / 5) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-1">
                  {[
                    { met: passwordTest.length, label: "8+ characters" },
                    { met: passwordTest.upper, label: "Uppercase" },
                    { met: passwordTest.lower, label: "Lowercase" },
                    { met: passwordTest.number, label: "Number" },
                    { met: passwordTest.special, label: "Special char" },
                  ].map((req, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <FontAwesomeIcon
                        icon={faCircleCheck}
                        className={`text-[10px] transition-colors duration-200 ${
                          req.met ? "text-green-500" : "text-slate-300"
                        }`}
                      />
                      <span
                        className={`text-xs transition-colors duration-200 ${
                          req.met ? "text-green-600" : "text-slate-400"
                        }`}
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirm_password"
                className="text-sm font-medium text-slate-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faLock}
                    className="text-slate-400 text-sm"
                  />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm_password"
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-11 py-2.5 rounded-lg border text-sm
                              bg-slate-50 text-slate-800
                              placeholder:text-slate-400
                              focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                              transition-all duration-200
                              disabled:opacity-50 disabled:cursor-not-allowed
                              ${
                                passwordConfirmation.length > 7
                                  ? match
                                    ? "border-green-500 focus:ring-green-500/40"
                                    : "border-red-500 focus:ring-red-500/40"
                                  : "border-slate-300"
                              }`}
                  disabled={!isPasswordValid}
                  value={passwordConfirmation}
                  onChange={confirmingPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400
                             hover:text-slate-600 transition-colors disabled:opacity-0"
                  disabled={!isPasswordValid}
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                    className="text-sm"
                  />
                </button>
              </div>
              {passwordConfirmation.length > 7 && (
                <p
                  className={`text-xs flex items-center gap-1 ${match ? "text-green-500" : "text-red-500"}`}
                >
                  <FontAwesomeIcon
                    icon={match ? faCircleCheck : faShieldHalved}
                    className="text-[10px]"
                  />
                  {match ? "Passwords match" : "Passwords do not match"}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold
                         hover:bg-blue-700 active:bg-blue-800
                         focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2
                         transition-all duration-200
                         flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!match || !isPasswordValid}
            >
              Create Account
              <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Page;
