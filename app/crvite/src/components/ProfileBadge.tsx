import { handle_delete_chat, handle_download_chats } from "./ChatHistory";
import { useAuth } from "@/contexts/AuthContext";

import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

import { LOGO_PLACEHOLDER } from "@/constants/constants";
import { PopoverTrigger, Popover, PopoverContent } from "./ui/popover";
import { ChevronDown } from "lucide-react";
import { Separator } from "./ui/separator";
import { use_chats } from "@/hooks/hooks";
import { start_delete_account } from "@/api/api_user_data";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } from '@/components/ui/alert-dialog'
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

import { X } from "lucide-react";



export const ProfileBadge = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const chat_history = use_chats();

    const handle_delete_all_chats = async () => {
        for (const chat of chat_history) {
            const current_id = chat.id;
            handle_delete_chat(current_id);
        }
    }
    const handle_delete_account = async (email: string, password: string) => {
        const success = await start_delete_account(email, password);
        if (success) {
            logout();
            alert("Deleted account: " + email)
        } else {
            alert("Unable to delete the account.")
        }
    }

    type AccountDeletionAlertProps = {
        isOpen: boolean;
        setIsOpen: (open: boolean) => void;
    }

    const AccountDeletionAlert = ({ isOpen, setIsOpen }: AccountDeletionAlertProps) => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');

        return (
            <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                <AlertDialogContent className="bg-accent">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-text flex flex-row">
                            <div>
                                Are you sure?
                            </div>
                            <AlertDialogCancel className="ml-auto bg-text text-text2 hover:bg-primary hover:text-text">
                                <X></X>
                            </AlertDialogCancel>
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-text bg-accent">
                            This action cannot be undone. This will permanently delete your account, chat history, database, and documents.
                            Enter your email and password to continue.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="email"
                        className='bg-text ml-0'>
                    </Input>
                    <Input
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="password"
                        className='bg-text ml-0'>
                    </Input>
                    <Button
                        onClick={() => handle_delete_account(email, password)}
                        type="submit"
                        className="bg-warning text-text">
                        Delete Account
                    </Button>
                </AlertDialogContent>
            </AlertDialog>
        );
    };

    return (
        <div className='justify-end flex flex-1 items-center mr-6'>
            <Popover>
                <PopoverTrigger>
                    <div className='rounded-md flex flex-row text-text items-center border border-white/20 hover:bg-accent text-sm'>
                        <ChevronDown
                            className="m-2"></ChevronDown>
                        <div className='pr-2'>
                            {user?.email}
                        </div>
                        <div>
                            <Avatar className="m-1">
                                <AvatarImage src={LOGO_PLACEHOLDER} />
                                <AvatarFallback className='bg-accent text-text'>{user?.email.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                    <div className="bg-primary text-text border-none p-1 flex flex-col rounded-sm">
                        <div
                            onClick={() => handle_download_chats(chat_history)}
                            className="p-1 m-1 hover:bg-text hover:text-text2 hover:cursor-pointer rounded-sm">
                            Download Chat History</div>
                        <div
                            onClick={() => handle_delete_all_chats()}
                            className="p-1 m-1 hover:bg-text hover:text-text2 hover:cursor-pointer rounded-sm">
                            Delete Chat History
                        </div>
                        <Separator />
                        <div
                            onClick={logout}
                            className="p-1 m-1 hover:bg-text hover:text-text2 hover:cursor-pointer rounded-sm">
                            Log Out
                        </div>
                        <Separator />
                        <div
                            onClick={() => setIsOpen(true)}
                            className="p-1 m-1 hover:bg-warning hover:text-text hover:cursor-pointer rounded-sm">
                            Delete Account
                        </div>
                        <AccountDeletionAlert isOpen={isOpen} setIsOpen={setIsOpen}></AccountDeletionAlert>
                    </div>
                </PopoverContent>
            </Popover>

        </div>
    )
}


