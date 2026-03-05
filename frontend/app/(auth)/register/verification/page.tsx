'use client'
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAxiosError } from 'axios';
import api from '@/lib/api';
import { errorToast, successToast } from '@/helper/ToastMessage';
import Loader from '@/helper/loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelopeCircleCheck, faClock, faArrowRight, faRotateRight } from '@fortawesome/free-solid-svg-icons';

const VerificationContent = () => {
    const limit=4
     const[otp,setOtp]=useState<string[]>(Array(limit).fill(''))
     const inputRef=useRef<HTMLInputElement[]>([])
     const [loader,setLoader]=useState(false)
     const [resendCooldown,setResendCooldown]=useState(0)
     const route=useRouter()
     const searchParams=useSearchParams()
     const email=searchParams.get('email')

     useEffect(()=>{
       if(resendCooldown<=0) return
       const timer=setTimeout(()=>setResendCooldown(resendCooldown-1),1000)
       return ()=>clearTimeout(timer)
     },[resendCooldown])

     const inputData=(value:string,index:number)=>{
       if(/[0-9]/.test(value)){
          setOtp((prev)=>{
            const new_otp=[...prev]
            new_otp[index]=value;
            return new_otp
          })
           if (value && index < limit - 1) {
      inputRef.current[index + 1]?.focus()
    }
       }
       return
     }

const keyChange=(e:React.KeyboardEvent<HTMLInputElement>,index:number)=>{
if(e.key==='Backspace'){
    if(otp[index]){
        setOtp((prev)=>{
            const new_otp=[...prev];
            new_otp[index]="";
            return new_otp
        })
    }else if(index>0){
        inputRef.current[index-1]?.focus();
    }
}

}

const handleSubmit=async()=>{
  const otpValue=otp.join('')
  if(otpValue.length<limit){
    errorToast('Please enter the complete OTP')
    return
  }
  setLoader(true)
  try {
    const response=await api.post('/verify/email',{otp:otpValue})
    if(response){
      successToast(response.data.message)
      setTimeout(() => {
        route.push('/login')
      }, 1500);
    }
  } catch (error) {
    if(isAxiosError(error)){
      setLoader(false)
      const errors=error.response?.data.errors
      if(errors && errors.length>0){
        errors.forEach((err:{field:string,message:string})=>errorToast(`${err.field}: ${err.message}`))
      }else{
        errorToast(error.response?.data.message)
      }
    }
  }
}

const handleResend=async()=>{
  if(!email){
    errorToast('Email not found. Please register again.')
    return
  }
  if(resendCooldown>0) return
  try {
    const response=await api.post('/resend/otp',{email})
    if(response){
      successToast(response.data.message)
      setOtp(Array(limit).fill(''))
      inputRef.current[0]?.focus()
      setResendCooldown(30)
    }
  } catch (error) {
    if(isAxiosError(error)){
      const errors=error.response?.data.errors
      if(errors && errors.length>0){
        errors.forEach((err:{field:string,message:string})=>errorToast(`${err.field}: ${err.message}`))
      }else{
        errorToast(error.response?.data.message)
      }
    }
  }
}

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50
                    flex items-center justify-center px-4 py-8 sm:px-6">
      {/* Loader Overlay */}
      {loader && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <Loader />
        </div>
      )}

      {/* Verification Card */}
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl
                      shadow-lg shadow-slate-200/50
                      border border-slate-100
                      p-4 sm:p-8 md:p-10
                      flex flex-col items-center text-center gap-6">

        {/* Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full
                        bg-gradient-to-br from-blue-500 to-blue-600
                        flex items-center justify-center
                        shadow-lg shadow-blue-500/25">
          <FontAwesomeIcon icon={faEnvelopeCircleCheck} className="text-white text-2xl sm:text-3xl" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Verify your email
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
            We&apos;ve sent a 4-digit verification code to your email address. Please enter it below.
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex gap-2 sm:gap-3">
          {otp.map((v, i) => (
            <input
              key={i}
              value={v}
              ref={(el) => { if (el) inputRef.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              onKeyDown={(e) => keyChange(e, i)}
              onChange={(e) => inputData(e.target.value, i)}
              className={`w-10 h-12 sm:w-14 sm:h-16 md:w-16 md:h-18
                          text-center text-xl sm:text-2xl font-semibold font-mono
                          rounded-xl border-2 bg-slate-50
                          text-slate-800
                          focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                          focus:bg-white
                          transition-all duration-200
                          ${v
                            ? 'border-blue-500 bg-white shadow-sm shadow-blue-500/10'
                            : 'border-slate-200 hover:border-slate-300'
                          }`}
            />
          ))}
        </div>

        {/* Timer Hint */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <FontAwesomeIcon icon={faClock} className="text-xs" />
          <span>Code expires in 10 minutes</span>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold
                     hover:bg-blue-700 active:bg-blue-800
                     focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2
                     transition-all duration-200
                     flex items-center justify-center gap-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={otp.join('').length < limit}
        >
          Verify & Continue
          <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
        </button>

        {/* Resend Link */}
        <p className="text-sm text-slate-500">
          Didn&apos;t receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown>0}
            className={`font-medium inline-flex items-center gap-1 transition-colors
                       ${resendCooldown>0
                         ? 'text-slate-400 cursor-not-allowed'
                         : 'text-blue-600 hover:text-blue-700 hover:underline'
                       }`}
          >
            <FontAwesomeIcon icon={faRotateRight} className="text-xs" />
            {resendCooldown>0 ? `Resend in ${resendCooldown}s` : 'Resend'}
          </button>
        </p>
      </div>

    </div>
  );
}

const Page = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader />
      </div>
    }>
      <VerificationContent />
    </Suspense>
  );
};

export default Page;
