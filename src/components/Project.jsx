import * as utils from "../utils/utils"
import Badge from './Badge.jsx'
import { useState, useEffect, useRef, useId } from 'react'
import { createPortal } from 'react-dom'

const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'youtu.be', 'www.youtu.be']
const INSTAGRAM_HOSTS = ['instagram.com', 'www.instagram.com']

function isExternalUrl(url = '') {
    return /^https?:\/\//i.test(url)
}

function getYouTubeEmbedUrl(url = '') {
    try {
        const parsed = new URL(url)
        if (!YOUTUBE_HOSTS.includes(parsed.hostname)) return null
        if (parsed.hostname.includes('youtu.be')) {
            const id = parsed.pathname.split('/').filter(Boolean)[0]
            return id ? `https://www.youtube.com/embed/${id}` : null
        }
        const v = parsed.searchParams.get('v')
        if (v) return `https://www.youtube.com/embed/${v}`
        const parts = parsed.pathname.split('/').filter(Boolean)
        const si = parts.indexOf('shorts')
        if (si !== -1 && parts[si + 1]) return `https://www.youtube.com/embed/${parts[si + 1]}`
        const ei = parts.indexOf('embed')
        if (ei !== -1 && parts[ei + 1]) return `https://www.youtube.com/embed/${parts[ei + 1]}`
        return null
    } catch { return null }
}

function getInstagramEmbedUrl(url = '') {
    try {
        const parsed = new URL(url)
        if (!INSTAGRAM_HOSTS.includes(parsed.hostname)) return null
        const parts = parsed.pathname.split('/').filter(Boolean)
        const ri = parts.indexOf('reel')
        if (ri !== -1 && parts[ri + 1]) return `https://www.instagram.com/reel/${parts[ri + 1]}/embed`
        const pi = parts.indexOf('p')
        if (pi !== -1 && parts[pi + 1]) return `https://www.instagram.com/p/${parts[pi + 1]}/embed`
        return null
    } catch { return null }
}

function detectMediaType(src = '') {
    const cleaned = src.toLowerCase().split('?')[0]
    if (/\.(jpg|jpeg|png|webp|gif|avif|svg)$/i.test(cleaned)) return 'image'
    if (/\.(mp4|webm|ogg|mov|m4v)$/i.test(cleaned)) return 'video'
    if (isExternalUrl(src) && getYouTubeEmbedUrl(src)) return 'youtube'
    if (isExternalUrl(src) && getInstagramEmbedUrl(src)) return 'instagram'
    if (isExternalUrl(src)) return 'embed'
    return 'image'
}

function normalizeMediaItem(item, fallbackDescription = '', fallbackAlt = '') {
    const raw = typeof item === 'string' ? { src: item } : (item || {})
    const src = raw.src || raw.url || ''
    const type = raw.type || detectMediaType(src)
    const normalized = {
        type, src,
        alt: raw.alt || fallbackAlt || fallbackDescription || 'Média du projet',
        description: raw.description || fallbackDescription || '',
        thumbnail: raw.thumbnail || raw.poster || '',
        poster: raw.poster || raw.thumbnail || '',
        aspectRatio: raw.aspectRatio || ''
    }
    if (type === 'youtube') normalized.embedSrc = raw.embedSrc || getYouTubeEmbedUrl(src)
    else if (type === 'instagram') normalized.embedSrc = raw.embedSrc || getInstagramEmbedUrl(src)
    else if (type === 'embed') normalized.embedSrc = raw.embedSrc || src
    return normalized
}

function getThumbnailSource(item) {
    if (!item) return ''
    if (item.type === 'image') return item.src || ''
    if (item.type === 'video') return item.thumbnail || item.poster || ''
    if (['youtube', 'instagram', 'embed'].includes(item.type)) return item.thumbnail || ''
    return ''
}

export default function Project({ title, picture, context, outputs, missions, skills = [], link, bilan = '', gallery = [], imageDescriptions = [] }) {
    const uid = useId()
    const modalTitleId = `${uid}-title`

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    const modalRef = useRef(null)
    const closeBtnRef = useRef(null)
    const imageRef = useRef(null)
    const lightboxContainerRef = useRef(null)
    const previouslyFocused = useRef(null)

    // ── Media normalization ──────────────────────────────────────────────────
    const hasDedicatedCover = Boolean(picture)
    const galleryDescriptionOffset = hasDedicatedCover && imageDescriptions.length === gallery.length + 1 ? 1 : 0

    const normalizedGallery = gallery.map((item, index) =>
        normalizeMediaItem(item, imageDescriptions[index + galleryDescriptionOffset] || '', `${title} - média ${index + 1}`)
    )

    const coverMedia = picture
        ? normalizeMediaItem({ src: picture }, galleryDescriptionOffset === 1 ? imageDescriptions[0] || '' : '', `${title} - miniature`)
        : (normalizedGallery[0] || null)

    const mediaItems = normalizedGallery
    const currentMedia = mediaItems[currentImageIndex] || null
    const currentDescription = currentMedia?.description || ''
    const isCurrentImage = currentMedia?.type === 'image'
    const isCurrentInstagram = currentMedia?.type === 'instagram'
    const isCurrentEmbedded = ['youtube', 'instagram', 'embed'].includes(currentMedia?.type)
    const currentEmbedAspectRatio = currentMedia?.aspectRatio
        || (currentMedia?.type === 'youtube' ? '16 / 9' : (currentMedia?.type === 'instagram' ? '9 / 16' : '16 / 9'))

    // ── Lightbox helpers ─────────────────────────────────────────────────────
    const resetImageState = () => {
        setScale(1)
        setPosition({ x: 0, y: 0 })
        setImageLoaded(false)
        setIsTransitioning(false)
    }

    const nextImage = () => {
        if (!mediaItems.length || isTransitioning) return
        setIsTransitioning(true)
        resetImageState()
        setTimeout(() => setCurrentImageIndex(prev => (prev + 1) % mediaItems.length), 100)
    }

    const prevImage = () => {
        if (!mediaItems.length || isTransitioning) return
        setIsTransitioning(true)
        resetImageState()
        setTimeout(() => setCurrentImageIndex(prev => (prev - 1 + mediaItems.length) % mediaItems.length), 100)
    }

    const goToImage = (index) => {
        if (isTransitioning || index === currentImageIndex) return
        setIsTransitioning(true)
        resetImageState()
        setTimeout(() => setCurrentImageIndex(index), 100)
    }

    // ── Open / close ─────────────────────────────────────────────────────────
    const openModal = () => {
        previouslyFocused.current = document.activeElement
        setIsModalOpen(true)
        document.body.style.overflow = 'hidden'
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setIsLightboxOpen(false)
        resetImageState()
        setCurrentImageIndex(0)
        document.body.style.overflow = 'unset'
        previouslyFocused.current?.focus()
    }

    const openLightbox = (index = 0) => {
        setCurrentImageIndex(index)
        resetImageState()
        setIsLightboxOpen(true)
    }

    const closeLightbox = () => {
        setIsLightboxOpen(false)
        resetImageState()
        setCurrentImageIndex(0)
        // Return focus to close button in the modal
        closeBtnRef.current?.focus()
    }

    // ── Focus management: move focus into modal on open ──────────────────────
    useEffect(() => {
        if (isModalOpen && !isLightboxOpen) {
            // Small delay so the DOM is fully rendered
            const t = setTimeout(() => closeBtnRef.current?.focus(), 50)
            return () => clearTimeout(t)
        }
    }, [isModalOpen, isLightboxOpen])

    // ── Focus trap ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isModalOpen || isLightboxOpen) return
        const modal = modalRef.current
        if (!modal) return

        const focusable = () => Array.from(
            modal.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')
        )

        const handleTab = (e) => {
            if (e.key !== 'Tab') return
            const els = focusable()
            if (!els.length) return
            const first = els[0]
            const last = els[els.length - 1]
            if (e.shiftKey) {
                if (document.activeElement === first) { last.focus(); e.preventDefault() }
            } else {
                if (document.activeElement === last) { first.focus(); e.preventDefault() }
            }
        }

        document.addEventListener('keydown', handleTab)
        return () => document.removeEventListener('keydown', handleTab)
    }, [isModalOpen, isLightboxOpen])

    // ── Keyboard: ESC + arrow keys ────────────────────────────────────────────
    useEffect(() => {
        if (!isModalOpen && !isLightboxOpen) return
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                if (isLightboxOpen) closeLightbox()
                else closeModal()
                return
            }
            if (!isLightboxOpen || isTransitioning) return
            if (e.key === 'ArrowLeft') { e.preventDefault(); prevImage() }
            else if (e.key === 'ArrowRight') { e.preventDefault(); nextImage() }
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [isModalOpen, isLightboxOpen, isTransitioning])

    // ── Wheel zoom in lightbox ────────────────────────────────────────────────
    useEffect(() => {
        if (!isLightboxOpen || !lightboxContainerRef.current) return
        const handleWheel = (e) => {
            e.preventDefault()
            const delta = e.deltaY > 0 ? 0.9 : 1.1
            const newScale = Math.min(Math.max(scale * delta, 0.5), 5)
            setScale(newScale)
            if (newScale <= 1) setPosition({ x: 0, y: 0 })
        }
        const el = lightboxContainerRef.current
        el.addEventListener('wheel', handleWheel, { passive: false })
        return () => el.removeEventListener('wheel', handleWheel)
    }, [isLightboxOpen, scale])

    // ── Drag (mouse) ──────────────────────────────────────────────────────────
    const handleMouseDown = (e) => {
        if (scale <= 1) return
        setIsDragging(true)
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
        e.preventDefault()
    }
    const handleMouseMove = (e) => {
        if (!isDragging || scale <= 1) return
        setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
    const handleMouseUp = () => setIsDragging(false)

    // ── Touch (pinch + drag) ──────────────────────────────────────────────────
    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            const [t1, t2] = e.touches
            setDragStart({ ...dragStart, distance: Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY) })
        } else if (e.touches.length === 1 && scale > 1) {
            setIsDragging(true)
            const t = e.touches[0]
            setDragStart({ x: t.clientX - position.x, y: t.clientY - position.y })
        }
    }
    const handleTouchMove = (e) => {
        e.preventDefault()
        if (e.touches.length === 2) {
            const [t1, t2] = e.touches
            const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
            if (dragStart.distance) {
                const newScale = Math.min(Math.max(scale * (dist / dragStart.distance), 0.5), 5)
                setScale(newScale)
                setDragStart({ ...dragStart, distance: dist })
                if (newScale <= 1) setPosition({ x: 0, y: 0 })
            }
        } else if (e.touches.length === 1 && isDragging && scale > 1) {
            const t = e.touches[0]
            setPosition({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y })
        }
    }
    const handleTouchEnd = () => { setIsDragging(false); setDragStart({ x: 0, y: 0 }) }

    const handleDoubleClick = (e) => {
        e.stopPropagation()
        if (scale > 1) { setScale(1); setPosition({ x: 0, y: 0 }) } else setScale(2)
    }

    useEffect(() => {
        if (imageLoaded) setTimeout(() => setIsTransitioning(false), 200)
    }, [imageLoaded])

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            {/* ── CARD (minimal) ─────────────────────────────────────────── */}
            <div
                role="button"
                tabIndex={0}
                aria-haspopup="dialog"
                className="card bg-base-100 shadow-md border border-base-200 h-full cursor-pointer group overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                onClick={openModal}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal() } }}
            >
                <figure className="aspect-video w-full m-0 p-0 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {coverMedia?.type === 'video' ? (
                        <video src={coverMedia.src} className="w-full h-full object-cover" muted playsInline loop autoPlay />
                    ) : (
                        <img
                            src={coverMedia?.src}
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    )}
                </figure>
                <div className="card-body p-3 gap-1.5">
                    <div className="flex flex-wrap gap-1" aria-hidden="true">
                        {skills.map(skill => (
                            <Badge key={skill} label={skill}
                                bgColor={utils.tagColors[skill]?.[0] ?? "bg-slate-200"}
                                fgColor={utils.tagColors[skill]?.[1] ?? "text-slate-900"}
                                filled={false}
                            />
                        ))}
                    </div>
                    <h4 className="card-title !mt-0 text-base leading-snug">{title}</h4>
                </div>
            </div>

            {/* ── MODAL UNIQUE (projet + mode cinéma) ─────────────────────── */}
            {isModalOpen && createPortal(
                <>
                    {/* Backdrop — masqué en mode cinéma (le modal est plein écran) */}
                    {!isLightboxOpen && (
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            style={{ zIndex: 9990 }}
                            onClick={closeModal}
                            aria-hidden="true"
                        />
                    )}

                    {/* Panel — s'étend plein écran en mode cinéma */}
                    <div
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={modalTitleId}
                        className={`fixed flex flex-col shadow-2xl overflow-hidden ${
                            isLightboxOpen
                                ? 'inset-0 bg-black rounded-none'
                                : 'inset-0 md:inset-4 lg:inset-y-8 lg:inset-x-16 xl:inset-x-40 2xl:inset-x-60 bg-base-100 md:rounded-2xl'
                        }`}
                        style={{ zIndex: 9991 }}
                        onMouseMove={isLightboxOpen ? handleMouseMove : undefined}
                        onMouseUp={isLightboxOpen ? handleMouseUp : undefined}
                        onMouseLeave={isLightboxOpen ? handleMouseUp : undefined}
                    >

                        {isLightboxOpen ? (
                            /* ══ MODE CINÉMA ══════════════════════════════════════ */
                            <div className="relative h-full flex flex-col">

                                {/* Barre supérieure */}
                                <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
                                    <div className="flex items-start justify-between gap-3 p-4 md:p-5">
                                        {/* Retour au projet */}
                                        <button
                                            onClick={closeLightbox}
                                            className="pointer-events-auto flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white/80 hover:text-white text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                            aria-label="Retour au projet"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            <span className="hidden sm:inline">Retour au projet</span>
                                        </button>

                                        {/* Compteur + zoom badge + fermer */}
                                        <div className="pointer-events-auto flex items-center gap-2">
                                            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                                                <span className="text-white/80 text-sm">{currentImageIndex + 1} / {mediaItems.length}</span>
                                                {isCurrentImage && scale > 1 && (
                                                    <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded">{Math.round(scale * 100)}%</span>
                                                )}
                                            </div>
                                            <button
                                                ref={closeBtnRef}
                                                onClick={closeModal}
                                                className="bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all p-2.5 rounded-lg text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                                aria-label="Fermer"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Contrôles zoom — desktop */}
                                {isCurrentImage && (
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 pointer-events-auto hidden md:flex flex-col gap-2">
                                        <div className="bg-black/70 backdrop-blur-sm rounded-xl p-2.5 flex flex-col gap-1.5">
                                            <button onClick={(e) => { e.stopPropagation(); setScale(s => Math.min(s * 1.3, 5)) }} disabled={scale >= 5}
                                                className="w-9 h-9 bg-white/15 hover:bg-white/25 disabled:opacity-30 text-white rounded-lg transition-all flex items-center justify-center font-bold text-lg" aria-label="Zoom avant">+</button>
                                            <button onClick={(e) => { e.stopPropagation(); setScale(1); setPosition({ x: 0, y: 0 }) }}
                                                className="w-9 h-9 bg-white/15 hover:bg-white/25 text-white text-[10px] rounded-lg transition-all flex items-center justify-center" aria-label="Taille réelle">1:1</button>
                                            <button onClick={(e) => { e.stopPropagation(); const s = Math.max(scale * 0.8, 0.5); setScale(s); if (s <= 1) setPosition({ x: 0, y: 0 }) }} disabled={scale <= 0.5}
                                                className="w-9 h-9 bg-white/15 hover:bg-white/25 disabled:opacity-30 text-white rounded-lg transition-all flex items-center justify-center font-bold text-lg" aria-label="Zoom arrière">−</button>
                                            <div className="text-white/50 text-[10px] text-center">{Math.round(scale * 100)}%</div>
                                        </div>
                                    </div>
                                )}

                                {/* Zone média principale */}
                                <div
                                    ref={lightboxContainerRef}
                                    className="h-full w-full flex items-center justify-center overflow-hidden"
                                    style={{ cursor: isCurrentImage && scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                                    onClick={(e) => { if (e.target === e.currentTarget) closeLightbox() }}
                                >
                                    <div
                                        className={`relative flex items-center justify-center h-full w-full ${isCurrentEmbedded ? (isCurrentInstagram ? 'pb-28 md:pb-36 pt-16 md:pt-20' : 'pb-40 md:pb-52 pt-16 md:pt-20') : 'pt-16 md:pt-20'}`}
                                        onMouseDown={isCurrentImage ? handleMouseDown : undefined}
                                        onTouchStart={isCurrentImage ? handleTouchStart : undefined}
                                        onTouchMove={isCurrentImage ? handleTouchMove : undefined}
                                        onTouchEnd={isCurrentImage ? handleTouchEnd : undefined}
                                        onDoubleClick={isCurrentImage ? handleDoubleClick : undefined}
                                        style={{ touchAction: isCurrentImage ? 'none' : 'auto' }}
                                        onClick={(e) => { if (e.target === e.currentTarget) closeLightbox() }}
                                    >
                                        {!imageLoaded && currentMedia?.type !== 'instagram' && (
                                            <div className="absolute inset-0 flex items-center justify-center z-10" aria-hidden="true">
                                                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}

                                        {currentMedia?.type === 'image' && (
                                            <img
                                                ref={imageRef}
                                                src={currentMedia.src}
                                                alt={currentMedia.alt}
                                                className={`max-w-full max-h-full object-contain select-none transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                                style={{ transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`, transformOrigin: 'center center' }}
                                                onLoad={() => setImageLoaded(true)}
                                                draggable={false}
                                            />
                                        )}
                                        {currentMedia?.type === 'video' && (
                                            <video
                                                src={currentMedia.src}
                                                poster={currentMedia.poster || undefined}
                                                controls
                                                className={`max-w-full max-h-full object-contain transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                                onLoadedData={() => setImageLoaded(true)}
                                            />
                                        )}
                                        {isCurrentEmbedded && (
                                            <iframe
                                                src={currentMedia.embedSrc}
                                                title={currentMedia.alt}
                                                className={`${isCurrentInstagram ? 'w-[min(92vw,500px)] h-[min(78vh,780px)]' : 'w-[min(92vw,1100px)]'} rounded-lg bg-black transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                                style={isCurrentInstagram
                                                    ? { maxHeight: 'calc(100vh - 11rem)' }
                                                    : { aspectRatio: currentEmbedAspectRatio, maxHeight: 'calc(100vh - 300px)' }
                                                }
                                                allow="autoplay; encrypted-media; picture-in-picture; web-share"
                                                allowFullScreen
                                                onLoad={() => setImageLoaded(true)}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Nav prev/next — desktop */}
                                {mediaItems.length > 1 && (!isCurrentImage || scale <= 1.2) && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); prevImage() }}
                                            disabled={isTransitioning}
                                            className="absolute left-4 md:left-6 top-1/2 z-20 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-xl transition-all backdrop-blur-sm disabled:opacity-30 hidden md:flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                            aria-label="Média précédent"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); nextImage() }}
                                            disabled={isTransitioning}
                                            className="absolute right-4 md:right-20 top-1/2 z-20 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-xl transition-all backdrop-blur-sm disabled:opacity-30 hidden md:flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                            aria-label="Média suivant"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </>
                                )}

                                {/* Barre du bas */}
                                <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
                                    <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 md:p-5">
                                        {/* Miniatures */}
                                        {mediaItems.length > 1 && (!isCurrentImage || scale <= 1.5) && (
                                            <div className="flex justify-center mb-4 pointer-events-auto">
                                                <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2" role="group" aria-label="Miniatures de navigation">
                                                    <div className="flex gap-2 items-center justify-center" style={{ minHeight: '54px' }}>
                                                        {mediaItems.map((item, index) => {
                                                            const thumbSrc = getThumbnailSource(item)
                                                            const lbl = item.type === 'video' ? '▶' : item.type === 'youtube' ? 'YT' : item.type === 'instagram' ? 'IG' : ''
                                                            return (
                                                                <button
                                                                    key={index}
                                                                    onClick={(e) => { e.stopPropagation(); if (!isTransitioning) goToImage(index) }}
                                                                    disabled={isTransitioning}
                                                                    aria-label={`Aller au média ${index + 1}`}
                                                                    aria-pressed={currentImageIndex === index}
                                                                    className={`flex-shrink-0 rounded overflow-hidden transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${currentImageIndex === index ? 'opacity-100 shadow-[0_0_0_2px_rgba(255,255,255,0.75)]' : 'opacity-50 hover:opacity-80'}`}
                                                                    style={{
                                                                        width: '50px', height: '50px',
                                                                        transform: currentImageIndex === index ? 'scale(1.05)' : 'scale(1)',
                                                                        backgroundImage: thumbSrc ? `url(${thumbSrc})` : 'none',
                                                                        backgroundSize: 'contain',
                                                                        backgroundPosition: 'center',
                                                                        backgroundRepeat: 'no-repeat',
                                                                        backgroundColor: thumbSrc ? 'transparent' : 'rgba(0,0,0,0.65)',
                                                                    }}
                                                                >
                                                                    {!thumbSrc && <span className="w-full h-full flex items-center justify-center text-white text-xs" aria-hidden="true">{lbl}</span>}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                    {currentDescription && (
                                                        <p className="mt-2 text-center text-white/40 text-xs" aria-live="polite">{currentDescription}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {/* Nav mobile */}
                                        {mediaItems.length > 1 && (!isCurrentImage || scale <= 1.2) && (
                                            <div className="flex justify-center mb-3 pointer-events-auto md:hidden">
                                                <div className="bg-black/90 backdrop-blur-sm rounded-xl p-3 flex gap-3">
                                                    <button onClick={(e) => { e.stopPropagation(); prevImage() }} disabled={isTransitioning}
                                                        className="bg-white/20 hover:bg-white/30 disabled:opacity-30 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                                                        aria-label="Média précédent">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                                        Précédent
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); nextImage() }} disabled={isTransitioning}
                                                        className="bg-white/20 hover:bg-white/30 disabled:opacity-30 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                                                        aria-label="Média suivant">
                                                        Suivant
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <p className="hidden lg:block text-center text-white/25 text-xs pointer-events-none">
                                            Double-clic : Zoom · ← → : Navigation · Molette : Zoom · Glisser : Déplacer · ESC : Fermer
                                        </p>
                                    </div>
                                </div>

                                {/* Zones tap mobile */}
                                {mediaItems.length > 1 && (!isCurrentImage || scale <= 1.2) && (
                                    <>
                                        <div className="absolute left-0 top-20 bottom-20 w-1/4 md:hidden z-10" onClick={(e) => { e.stopPropagation(); prevImage() }} aria-hidden="true" />
                                        <div className="absolute right-0 top-20 bottom-20 w-1/4 md:hidden z-10" onClick={(e) => { e.stopPropagation(); nextImage() }} aria-hidden="true" />
                                    </>
                                )}
                            </div>

                        ) : (
                            /* ══ VUE PROJET ═══════════════════════════════════════ */
                            <>
                                {/* Header sticky */}
                                <div className="flex items-center justify-between gap-4 px-4 md:px-6 py-3 md:py-4 border-b border-base-200 shrink-0 bg-base-100">
                                    <h2 id={modalTitleId} className="font-bold text-lg md:text-xl !m-0 leading-snug">
                                        {title}
                                    </h2>
                                    <button
                                        ref={closeBtnRef}
                                        onClick={closeModal}
                                        className="btn btn-ghost btn-sm btn-circle shrink-0"
                                        aria-label="Fermer le projet"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Corps scrollable */}
                                <div className="flex-1 overflow-y-auto">

                                    {/* Bannière cover pleine largeur */}
                                    {coverMedia?.src && (
                                        <div className="w-full overflow-hidden shrink-0">
                                            {coverMedia.type === 'video' ? (
                                                <video src={coverMedia.src} className="w-full aspect-video object-cover" muted playsInline loop autoPlay />
                                            ) : (
                                                <img src={coverMedia.src} alt={`Illustration — ${title}`} className="w-full aspect-video max-h-[250px] md:max-h-[400px] object-cover object-center" />
                                            )}
                                        </div>
                                    )}

                                    {/* Grille principale : 1/3 infos + 2/3 contenu */}
                                    <div className="flex flex-col md:flex-row gap-8 md:gap-12 mt-6 p-6 border-b border-base-200">

                                        {/* Colonne gauche — Compétences + lien */}
                                        <div className="w-full md:w-[250px] flex-shrink-0 flex flex-col gap-6">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/40 mb-3">
                                                    Compétences mobilisées
                                                </p>
                                                <div className="flex flex-col gap-3 items-start">
                                                    {skills.map(skill => (
                                                        <Badge key={skill} label={skill}
                                                            bgColor={utils.tagColors[skill]?.[0] ?? "bg-slate-200"}
                                                            filled={false}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            {link && (
                                                <a
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-primary btn-sm w-fit no-underline"
                                                >
                                                    Voir le projet
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            )}
                                        </div>

                                        {/* Colonne droite (2/3) — Contexte + Missions + Livrables */}
                                        <div className="flex-1">
                                            <section className="pb-7">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/40 mb-4">
                                                    Contexte &amp; objectifs
                                                </p>
                                                <p className="text-base md:text-[1.0625rem] leading-[1.8] text-base-content !m-0">
                                                    {context}
                                                </p>
                                            </section>

                                            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-base-200 py-7">
                                                <section className="pb-7 md:pb-0 md:pr-8">
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/40 mb-4">
                                                        Missions
                                                    </p>
                                                    <ul className="space-y-2.5 !m-0 !p-0 list-none">
                                                        {(missions || []).map((m, i) => (
                                                            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-base-content">
                                                                <span className="mt-[0.35em] w-1.5 h-1.5 rounded-full bg-base-content/30 shrink-0" aria-hidden="true" />
                                                                {m}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </section>
                                                <section className="pt-7 md:pt-0 md:pl-8">
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/40 mb-4">
                                                        Livrables
                                                    </p>
                                                    <ul className="space-y-2.5 !m-0 !p-0 list-none">
                                                        {(outputs || []).map((o, i) => (
                                                            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-base-content">
                                                                <span className="mt-[0.35em] w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" aria-hidden="true" />
                                                                {o}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </section>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bilan + Galerie — pleine largeur sous la grille */}
                                    {bilan && (
                                        <section className="px-6 md:px-8 xl:px-10 py-7 border-b border-base-200">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/40 mb-4">
                                                Bilan personnel
                                            </p>
                                            <blockquote className="border-l-2 border-primary pl-4 !m-0 text-base md:text-[1.0625rem] leading-[1.8] text-base-content/80 italic">
                                                {bilan}
                                            </blockquote>
                                        </section>
                                    )}

                                    {mediaItems.length > 0 && (
                                        <section className="px-6 md:px-8 xl:px-10 py-7">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/40 mb-4">
                                                Galerie — {mediaItems.length} média{mediaItems.length > 1 ? 's' : ''}
                                            </p>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-2">
                                                {mediaItems.map((item, index) => {
                                                    const thumbSrc = getThumbnailSource(item)
                                                    const typeLabel = item.type === 'youtube' ? 'YouTube' : item.type === 'instagram' ? 'Instagram' : item.type === 'video' ? 'Vidéo' : 'Média'
                                                    return (
                                                        <button
                                                            key={index}
                                                            onClick={() => openLightbox(index)}
                                                            className="aspect-square overflow-hidden rounded-xl bg-base-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-opacity relative group/thumb"
                                                            aria-label={item.alt || `${typeLabel} ${index + 1} — ${title}`}
                                                        >
                                                            {thumbSrc ? (
                                                                <img src={thumbSrc} alt="" aria-hidden="true" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="w-full h-full flex items-center justify-center text-base-content/40 text-xs font-medium" aria-hidden="true">
                                                                    {typeLabel}
                                                                </span>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/25 transition-colors flex items-center justify-center" aria-hidden="true">
                                                                <svg className="w-5 h-5 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                                </svg>
                                                            </div>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </>,
                document.body
            )}
        </>
    )
}
