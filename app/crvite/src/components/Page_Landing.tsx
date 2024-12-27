import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

import { LOGO_PLACEHOLDER, ICON_GITHUB, ICON_LINKEDIN, SCREENSHOT_MAIN } from "@/constants/constants"
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
        <div className="relative overflow-hidden">
            <LandingPageAnimation></LandingPageAnimation>
            <div id="landingpagecontent" className="relative z-10 min-h-screen items-center justify-center text-white">
                <header className="bg-[#08010C] flex justify-between items-center p-2 border-b border-b-white/10">
                    <img src={LOGO_PLACEHOLDER} className="w-[70px] h-[70px] p-2"></img>
                    <NavigationMenu className="flex-1">
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="bg-[#08010C] hover:bg-[#08010C] text-white">Product</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="w-[800px] h-[400px] text-white bg-[#0e0e0e] p-2 grid grid-cols-3">
                                        <div
                                            className={`
                                                col-span-1 p-2 m-2
                                                rounded-sm
                                                border border-white/50
                                            `}>
                                            <p className="justify-self-center">Retrieval-Augmented Generation</p>
                                            <p className="p-2 text-s text-gray-200">RAGbase can convert and query your data. Audio and Video transcription is built-in, along with support for text formats such as .txt and .pdf.</p>
                                            <p className="p-2 text-s text-gray-200">Persistent storage with and user-specific collections and settings make it easy to customize your dashboard to your needs.</p>
                                        </div>
                                        <div
                                            className={`
                                                col-span-1 p-2 m-2
                                                rounded-sm
                                                border border-white/50
                                            `}>
                                            <p className="justify-self-center">Model Selection</p>
                                            <p className="p-2 text-s text-gray-200">RAGbase supports foundation models from OpenAI, Amazon Bedrock, and Ollama</p>
                                        </div>
                                        <div
                                            className={`
                                                col-span-1 p-2 m-2
                                                rounded-sm
                                                border border-white/50
                                            `}>
                                            <p className="justify-self-center">Document Analysis</p>
                                            <p className="p-2 text-s text-gray-200">Presets allow you to run sentiment and thematic analysis on document batches, for straightforward results without having to start a chat.</p>
                                        </div>
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="bg-[#08010C] hover:bg-[#08010C] text-white">Resources</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="w-[400px] h-[400px] text-white bg-[#0e0e0e] p-2 flex flex-col">
                                        <div className="border-b-2 border-b-white p-2">
                                            RAGbase is an Open Source project! Visit the repository for more information.
                                        </div>
                                        <div id="resourcelinks" className="flex-1 flex flex-col m-2 mt-8">
                                            <a href="https://github.com/arunwidjaja/cloud-RAG">
                                                <div className="flex-1 grid grid-cols-6">
                                                    <div className="p-2 m-1">
                                                        <img src={ICON_GITHUB} className="w-8 h-8"></img>
                                                    </div>
                                                    <div className="m-2 col-span-5">
                                                        <p>Project Repository</p>
                                                        <p className="text-xs text-gray-200">Visit the repository for documentation, Q&A, and information on upcoming changes</p>
                                                    </div>
                                                </div>
                                            </a>
                                            <a href="https://github.com/arunwidjaja/cloud-RAG/releases">
                                                <div className="flex-1 grid grid-cols-6">
                                                    <div className="p-2 m-1">
                                                        <img src={ICON_GITHUB} className="w-8 h-8"></img>
                                                    </div>
                                                    <div className="m-2 col-span-5">
                                                        <p>Release History</p>
                                                        <p className="text-xs text-gray-200">Legacy versions can be downloaded from the releases page</p>
                                                    </div>
                                                </div>
                                            </a>
                                            <a href="https://www.linkedin.com/in/arunwidjaja/">
                                                <div className="flex-1 grid grid-cols-6">
                                                    <div className="p-2 m-1">
                                                        <img src={ICON_LINKEDIN} className="w-8 h-8"></img>
                                                    </div>
                                                    <div className="m-2 col-span-5">
                                                        <p>Contact the Developer</p>
                                                        <p className="text-xs text-gray-200">Feel free to contact me directly with suggestions or questions</p>
                                                    </div>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                    <div>
                        <Button
                            onClick={handleClickLogin}
                            className={`
                                p-2 text-xs m-1
                                text-black
                                bg-[#CECECE]
                                hover:bg-[#F5F5F5]
                                hover:text-black
                            `}>
                            Log In
                        </Button>
                        <Button
                            onClick={handleClickRegister}
                            className={`
                                p-2 text-xs m-1
                                text-white
                                bg-[#333333]
                                hover:bg-[#686868]
                                hover:text-white
                            `}>
                            Register
                        </Button>
                    </div>
                </header>
                <div className="text-center mx-auto m-12 w-1/2">
                    <h1>Discover the <span className="text-[#A405FA] font-light">Power</span> of Your Data</h1>

                </div>
                <div className="text-center mx-auto m-12 w-2/5">
                    <h2 className="m-4">
                        RAGbase is an AI-powered dashboard that allows you to extract valuable insights from your documents.
                        Upload your files, query them with ease, and leverage analytical techniques like summarization and thematic analysis.
                        With support for multimodal data and multiple generative models, you can adapt it to fit your needs.
                    </h2>
                </div>
                <div className="grid place-items-center">
                    <div className="p-2 border border-white/50">
                        <img src={SCREENSHOT_MAIN} className="w-[1000px] m-22 rounded-xl"></img>
                    </div>
                </div>
            </div>
        </div>
    )
}

