import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

import { LOGO_PLACEHOLDER } from "@/constants/constants"
import { Button } from "./ui/button"
import { useNavigate } from "react-router-dom"

import { LandingPageAnimation } from "./Animation_Page_Landing"

import '@/Page_Landing.css'


export function LandingPage() {
    const navigate = useNavigate()

    const handleClickRegister = () => {
        navigate('/register')
    }
    const handleClickLogin = () => {
        navigate('/login')
    }

    return (
        <div className="relative">
            <LandingPageAnimation></LandingPageAnimation>
            <div id="landingpagecontent" className="relative z-10 min-h-screen items-center justify-center text-white">
                <header className="flex justify-between items-center p-2 bg-[#08010C] border-b border-b-white/10">
                    <img src={LOGO_PLACEHOLDER} className="w-[70px] h-[70px] p-2"></img>
                    <NavigationMenu className="absolute left-1/2 -translate-x-1/2 ">
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Product</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="w-[400px] h-[400px] text-white bg-[#0e0e0e]">
                                        This section will contain information about the features and capabilities of RAGbase.
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="w-[400px] h-[400px] text-white bg-[#0e0e0e]">
                                        This section will contain links to the GitHub Repo for this project and information on how to contact the developer.
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                    <div>
                        <Button
                            onClick={handleClickLogin}
                            className="p-2 text-xs text-black bg-[#CECECE] hover:bg-[#E6E6E6] m-1">
                            Log In
                        </Button>
                        <Button
                            onClick={handleClickRegister}
                            className="p-2 text-xs text-white bg-[#333333] hover:bg-[#4D4D4D] m-1">
                            Register
                        </Button>
                    </div>
                </header>
                <div className="text-center mx-auto m-12 w-1/2">
                    <h1>Discover the <strong className="text-[#A405FA]">Power</strong> of Your Data</h1>

                </div>
                <div className="text-center mx-auto m-12 w-2/5">
                    <h2 className="m-4">
                        RAGbase is the AI-powered base that empowers your to extract valuable insights from your documents.
                        Upload your files, query them with ease, and leverage analytical techniques like summarization and thematic analysis.
                        With support for multimodal data and multiple generative models, adapt RAGbase to fit your needs.
                    </h2>
                </div>
            </div>
        </div>
    )
}

