import Menu from "./Menu.jsx"


export default function Footer() {
    return (
        <>
            <hr className="border-base-200" />

            <footer className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16 py-10 flex flex-col items-center gap-8">

                <nav className="flex justify-center">
                    <Menu ulClasses={"flex flex-wrap gap-2 items-center justify-center md:gap-4"} liClasses={""} includeCV={false} underline={true} />
                </nav>
                <aside>
                    <p className="italic text-sm opacity-70 text-center">Basé sur le <a href="https://github.com/antoninglc/portfolio" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:opacity-100 transition-opacity">modèle du BUT MMI de Lannion</a>, repensé et adapté par mes soins.</p>
                </aside>
            </footer>
        </>
    )
}