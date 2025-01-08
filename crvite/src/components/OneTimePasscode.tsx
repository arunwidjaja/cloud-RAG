import React from "react";
import { useEffect } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp"
import { start_resend_otp, start_verify_otp } from "@/api/api_init";
import { RefreshCcw } from "lucide-react";



function OneTimePasscode({ email }: { email: string }) {
    const [value, setValue] = React.useState('');

    const handleResendOTP = async () => {
        setValue('')
        start_resend_otp(email)
        alert("A new code has been sent to " + email)
    }
    const handleSubmit = async () => {
        const otp = Object.values(value).join('');
        setValue('')
        const success = await start_verify_otp(otp, email);
        if (success) {
            alert("Your email has been verified! Please log in.")
        }
    }
    useEffect(() => {
        if (value.length === 6) {
            handleSubmit();
        }
    }, [value]);
    return (
        <div className="m-3 text-center text-sm">
            <div className="flex justify-center items-center m-2">
                <InputOTP
                    value={value}
                    onChange={setValue}
                    maxLength={6}>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
                <RefreshCcw
                    onClick={handleResendOTP}
                    className="ml-3 hover:cursor-pointer hover:text-purple-500">
                </RefreshCcw>
            </div>
            <p>Please enter the six-digit code sent to:</p>
            <p>{email}</p>
        </div>
    )
}

export default OneTimePasscode;