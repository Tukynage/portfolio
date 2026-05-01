import Menu from "./Menu.jsx"


export default function Footer() {
    return (
        <>
            <hr className="border-base-200" />

            <footer className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16 py-10 flex flex-col-reverse items-center lg:flex-row justify-between">

                <aside className="my-4">
                    <p className="italic">BUT MMI - IUT de Lannion - 2025</p>
                </aside>
                <nav className="flex py-4 justify-center md:py-0">
                    <Menu ulClasses={"flex flex-col gap-2 items-center md:flex-row md:gap-4"} liClasses={""} includeCV={false} underline={true} />
                </nav>
            </footer>
        </>
    )
}