import Menu from "./Menu.jsx"

export default function Nav({cv}) {
    return (
        <div className="fixed top-0 left-0 z-50 w-full">
            <div className="navbar bg-base-100 flex justify-end no-wrap w-full shadow-md hidden lg:flex pr-8">
                <div className="navbar-end lg:w-full">
                    <Menu ulClasses={"menu menu-horizontal px-1"} liClasses={""} includeCV={true} cvPath={cv} underline={false}/>
                </div>
            </div>
            <div className="navbar-end flex justify-end lg:hidden ml-auto pr-4 pt-4">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost rounded-full p-2 bg-primary text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </div>
                    <Menu ulClasses={"menu menu-sm dropdown-content mt-3 z-[1] p-3 shadow-xl bg-base-100 !w-48 right-0"} liClasses={"inline text-right py-1"} includeCV={true} cvPath={cv}/>
                </div>
            </div>
        </div>
    )
}