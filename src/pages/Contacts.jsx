import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAssetURL } from "../utils/utils.js";

export default function Contacts({ contacts }) {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        const darkMode = window.matchMedia("(prefers-color-scheme: dark)");
        setTheme(darkMode.matches ? "dark" : "light");

        const listener = (e) => setTheme(e.matches ? "dark" : "light");
        darkMode.addEventListener("change", listener);

        return () => darkMode.removeEventListener("change", listener);
    }, []);

    return (
        <>
            <h2 id="contacts" className="mb-11">Contacts</h2>

            <div className="md:min-h-40 flex items-center justify-center">
                <ul className="list-none flex flex-col md:flex-row">
                    {contacts.map((cont) => {
                        const darkIcon = cont.icon.replace(".svg", "-dark.svg");
                        const darkIconPath = getAssetURL("media", darkIcon);
                        const lightIconPath = getAssetURL("media", cont.icon);

                        return (
                            <li key={cont.name} className="p-1 flex gap-2 items-center md:p-10">
                                <i>
                                    {/* Teste si l'image dark existe, sinon fallback en invert */}
                                    <img
                                        src={theme === "dark" ? darkIconPath : lightIconPath}
                                        onError={(e) => {
                                            if (theme === "dark") {
                                                e.target.src = lightIconPath;
                                                e.target.classList.add("dark:invert");
                                            }
                                        }}
                                        alt={cont.name}
                                        className="w-6 h-6"
                                    />
                                </i>
                                <Link to={cont.url} target="_blank" className="no-underline hover:underline hover:cursor-pointer">
                                    {cont.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </>
    );
}
