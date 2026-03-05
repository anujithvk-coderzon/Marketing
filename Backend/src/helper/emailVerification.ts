const verificationOTP=new Map()
const emailToOtp=new Map<string,string>()

export  function generateOTP(email:string,name:string,hashedPassword:string,phone:number) {
   // Remove old OTP if exists for this email
   const oldOtp=emailToOtp.get(email)
   if(oldOtp) verificationOTP.delete(oldOtp)

   const otp=Math.floor(1000+Math.random()*9000).toString()
   const user_data={
    email,
    name,
    password:hashedPassword,
    phone,
    otp
   }
   verificationOTP.set(otp,user_data)
   emailToOtp.set(email,otp)
   setTimeout(() => {
    verificationOTP.delete(otp)
    emailToOtp.delete(email)
   },10*60*1000);
   return user_data;
}

export function validateOtp(otp:string){
return verificationOTP.get(otp)
}

export function resendOTP(email:string){
  const oldOtp=emailToOtp.get(email)
  if(!oldOtp) return null
  const oldData=verificationOTP.get(oldOtp)
  if(!oldData) return null
  // Delete old OTP
  verificationOTP.delete(oldOtp)
  emailToOtp.delete(email)
  // Generate new OTP with same user data
  return generateOTP(oldData.email,oldData.name,oldData.password,oldData.phone)
}