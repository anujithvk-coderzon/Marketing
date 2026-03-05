import toast from "react-hot-toast"

export const successToast=(message:string)=>{
toast.success(message,{
    duration:2000,
    position:"top-center",
    style:{
        background:"#1e293b",
        color:'white',
        padding:'9px',
        borderRadius:"10px"
    },
    iconTheme:{
        primary:"#22c55e",
        secondary:"#fff"
    }
})
}
export const errorToast=(message:string)=>{
    toast.error(message,{
    duration:2000,
    position:"top-center",
    style:{
        background:"#1e293b",
        color:'white',
        padding:'9px',
        borderRadius:"10px"
    },
    iconTheme:{
        primary:"red",
        secondary:"#fff"
    }
})
}