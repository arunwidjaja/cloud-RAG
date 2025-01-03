export const LandingPageAnimation = () => {
    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 bg-[#08010C] ">
            <div id="animation" className="w-full h-full">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 2560 1440"
                    className="w-full h-full"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <defs>
                            <linearGradient id="tailwindGradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="2560" y2="1440">
                                <stop
                                    offset="0%"
                                    stopColor="rgb(59, 130, 246)"
                                    stopOpacity="1"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="rgb(59, 130, 246)"
                                    stopOpacity="0"
                                />
                            </linearGradient>
                        </defs>
                    </defs>
                    {/* Background path that shows the full line route */}
                    <path
                        d=" M 700,0
                        Q 700,720 0,720
                        M 635,0
                        Q 635,720 0,720
                        M 465,0
                        Q 465,720 0,720
                        M 105,0
                        Q 105,720 0,720
                        M 0,720

                        M 1860,0
                        Q 1860,720 2560,720
                        M 1945,0
                        Q 1945,720 2560,720
                        M 2115,0
                        Q 2115,720 2560,720
                        M 2455,0
                        Q 2455,720 2560,720

                        M 1860,1440
                        Q 1860,720 2560,720
                        M 1945,1440
                        Q 1945,720 2560,720
                        M 2115,1440
                        Q 2115,720 2560,720
                        M 2455,1440
                        Q 2455,720 2560,720

                        M 700,1440
                        Q 700,720 0,720
                        M 635,1440
                        Q 635,720 0,720
                        M 465,1440
                        Q 465,720 0,720
                        M 105,1440
                        Q 105,720 0,720"

                        stroke="#4A90E2"
                        strokeWidth="1"
                        fill="none"
                        strokeLinecap="round"
                        className="background-path"
                    />

                    {/* Animated drawing line */}
                    <path
                        d=" M 700,0
                            Q 700,720 0,720
                            M 105,0
                            Q 105,720 0,720

                            M 1945,0
                            Q 1945,720 2560,720
                            M 2455,0
                            Q 2455,720 2560,720

                            M 1860,1440
                            Q 1860,720 2560,720
                            M 1945,1440
                            Q 1945,720 2560,720

                            M 2455,1440
                            Q 2455,720 2560,720

                            M 105,1440
                            Q 105,720 0,720"
                        stroke="#A405FA"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        className="animated-path"
                    />
                </svg>




            </div>
        </div>
    )
}