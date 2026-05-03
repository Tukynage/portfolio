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

export default function Nav({ cv }) {
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
                <div className="navbar-end w-full">
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
                            <span className="font-semibold text-base-content/70 text-sm tracking-wide uppercase">Menu</span>
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
