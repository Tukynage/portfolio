import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-scroll'
import { ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/solid'
import Menu from './Menu.jsx'
import { getAssetURL } from '../utils/utils.js'

const NAV_LINKS = [
    { to: 'skills',     label: 'Compétences' },
    { to: 'projects',   label: 'Projets' },
    { to: 'bio',        label: 'Bio' },
    { to: 'training',   label: 'Formation' },
    { to: 'interests',  label: "Centres d'intérêts" },
    { to: 'contacts',   label: 'Contacts' },
]

function SunIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4"/>
            <line x1="12" y1="2" x2="12" y2="4"/>
            <line x1="12" y1="20" x2="12" y2="22"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="2" y1="12" x2="4" y2="12"/>
            <line x1="20" y1="12" x2="22" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
    )
}

function MoonIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
    )
}

function ThemeToggle({ theme, toggleTheme }) {
    const isDark = theme === 'theme-negatif'
    return (
        <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Basculer vers le thème clair' : 'Basculer vers le thème sombre'}
            className="btn btn-ghost btn-sm btn-circle opacity-50 hover:opacity-100 hover:text-primary transition-all duration-200"
        >
            {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
    )
}

export default function Nav({ cv, theme, toggleTheme }) {
    const [isOpen, setIsOpen] = useState(false)
    const closeRef = useRef(null)
    const burgerRef = useRef(null)
    const previouslyFocused = useRef(null)

    const open = () => {
        previouslyFocused.current = document.activeElement
        setIsOpen(true)
    }
    const close = () => {
        setIsOpen(false)
        previouslyFocused.current?.focus()
    }

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    // ESC to close + focus close button on open
    useEffect(() => {
        if (!isOpen) return
        const t = setTimeout(() => closeRef.current?.focus(), 50)
        const handleKey = (e) => { if (e.key === 'Escape') close() }
        window.addEventListener('keydown', handleKey)
        return () => { clearTimeout(t); window.removeEventListener('keydown', handleKey) }
    }, [isOpen])

    const cvPath = cv ? getAssetURL('download', cv) : null

    return (
        <div className="fixed top-0 left-0 z-50 w-full">

            {/* ── Desktop navbar ─────────────────────────────────────── */}
            <div className="navbar bg-base-100 w-full shadow-md hidden lg:flex">
                <div className="navbar-start pl-3">
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                </div>
                <div className="navbar-end">
                    <Menu
                        ulClasses="menu menu-horizontal px-1 gap-1"
                        liClasses=""
                        includeCV={true}
                        cvPath={cv}
                        underline={false}
                    />
                </div>
            </div>

            {/* ── Burger button (mobile only) ────────────────────────── */}
            <div className="flex justify-end lg:hidden pr-4 pt-4">
                <button
                    ref={burgerRef}
                    onClick={open}
                    aria-label="Ouvrir le menu"
                    aria-expanded={isOpen}
                    aria-controls="mobile-nav-panel"
                    className="btn btn-ghost rounded-full p-2 bg-primary text-white shadow-md hover:bg-primary/90 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                    </svg>
                </button>
            </div>

            {/* ── Mobile side drawer (portal) ────────────────────────── */}
            {createPortal(
                <>
                    {/* Backdrop */}
                    <div
                        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                        style={{ zIndex: 9980 }}
                        onClick={close}
                        aria-hidden="true"
                    />

                    {/* Panel */}
                    <div
                        id="mobile-nav-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menu de navigation"
                        className={`fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-base-100 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                        style={{ zIndex: 9981 }}
                    >
                        {/* Panel header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-base-200 shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-base-content/70 text-sm tracking-wide uppercase">Menu</span>
                                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                            </div>
                            <button
                                ref={closeRef}
                                onClick={close}
                                aria-label="Fermer le menu"
                                className="btn btn-ghost btn-sm btn-circle"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Links */}
                        <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Navigation principale">
                            <ul className="space-y-0.5">
                                {NAV_LINKS.map(({ to, label }) => (
                                    <li key={to}>
                                        <Link
                                            to={to}
                                            spy={true}
                                            smooth={true}
                                            duration={300}
                                            onClick={close}
                                            tabIndex={isOpen ? 0 : -1}
                                            className="flex items-center w-full px-4 py-3.5 rounded-xl text-base font-medium text-base-content hover:bg-base-200 active:bg-base-300 transition-colors cursor-pointer select-none"
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* CV download — ancré en bas */}
                        {cvPath && (
                            <div className="px-4 py-5 border-t border-base-200 shrink-0">
                                <a
                                    href={cvPath}
                                    download
                                    onClick={close}
                                    tabIndex={isOpen ? 0 : -1}
                                    className="btn btn-outline btn-primary w-full gap-2 no-underline"
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                    Télécharger le CV
                                </a>
                            </div>
                        )}
                    </div>
                </>,
                document.body
            )}
        </div>
    )
}
