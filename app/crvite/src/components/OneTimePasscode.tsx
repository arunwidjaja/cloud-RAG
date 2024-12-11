import React from "react";
import { useEffect } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp"
import { start_verify_otp } from "@/api/api";



function OneTimePasscode({ email }: { email: string }) {
    const [value, setValue] = React.useState('');

    const handleSubmit = async () => {
        const otp = Object.values(value).join('');
        setValue('')
        start_verify_otp(otp, email);
    }
    useEffect(() => {
        if (value.length === 6) {
            handleSubmit();
        }
    }, [value]);
    return (
        <div>
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
            <p>Enter the six-digit code sent to {email}</p>
        </div>
    )
}

export default OneTimePasscode;