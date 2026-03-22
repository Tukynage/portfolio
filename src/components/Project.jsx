import * as utils from "../utils/utils"
import { Link } from "react-router-dom"
import Badge from './Badge.jsx'
import { useState, useEffect, useRef } from 'react'
import { PhotoIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/solid'

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

        const videoIdFromWatch = parsed.searchParams.get('v')
        if (videoIdFromWatch) return `https://www.youtube.com/embed/${videoIdFromWatch}`

        const parts = parsed.pathname.split('/').filter(Boolean)
        const shortsIndex = parts.indexOf('shorts')
        if (shortsIndex !== -1 && parts[shortsIndex + 1]) {
            return `https://www.youtube.com/embed/${parts[shortsIndex + 1]}`
        }

        const embedIndex = parts.indexOf('embed')
        if (embedIndex !== -1 && parts[embedIndex + 1]) {
            return `https://www.youtube.com/embed/${parts[embedIndex + 1]}`
        }

        return null
    } catch {
        return null
    }
}

function getInstagramEmbedUrl(url = '') {
    try {
        const parsed = new URL(url)
        if (!INSTAGRAM_HOSTS.includes(parsed.hostname)) return null

        const parts = parsed.pathname.split('/').filter(Boolean)
        const reelIndex = parts.indexOf('reel')
        if (reelIndex !== -1 && parts[reelIndex + 1]) {
            return `https://www.instagram.com/reel/${parts[reelIndex + 1]}/embed`
        }

        const pIndex = parts.indexOf('p')
        if (pIndex !== -1 && parts[pIndex + 1]) {
            return `https://www.instagram.com/p/${parts[pIndex + 1]}/embed`
        }

        return null
    } catch {
        return null
    }
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
    const explicitType = raw.type
    const type = explicitType || detectMediaType(src)

    const normalized = {
        type,
        src,
        alt: raw.alt || fallbackAlt || fallbackDescription || 'Média du projet',
        description: raw.description || fallbackDescription || '',
        thumbnail: raw.thumbnail || raw.poster || '',
        poster: raw.poster || raw.thumbnail || '',
        aspectRatio: raw.aspectRatio || ''
    }

    if (type === 'youtube') {
        normalized.embedSrc = raw.embedSrc || getYouTubeEmbedUrl(src)
    } else if (type === 'instagram') {
        normalized.embedSrc = raw.embedSrc || getInstagramEmbedUrl(src)
    } else if (type === 'embed') {
        normalized.embedSrc = raw.embedSrc || src
    }

    return normalized
}

function getThumbnailSource(item) {
    if (!item) return ''
    if (item.type === 'image') return item.src || ''
    if (item.type === 'video') return item.thumbnail || item.poster || ''
    if (item.type === 'youtube' || item.type === 'instagram' || item.type === 'embed') return item.thumbnail || ''
    return ''
}

export default function Project({ title, picture, context, outputs, missions, skills, link, gallery = [], imageDescriptions = [] }) {
    const [isGalleryOpen, setIsGalleryOpen] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const imageRef = useRef(null)
    const containerRef = useRef(null)

    const hasDedicatedCover = Boolean(picture)
    const galleryDescriptionOffset = hasDedicatedCover && imageDescriptions.length === gallery.length + 1 ? 1 : 0

    const normalizedGallery = gallery.map((item, index) =>
        normalizeMediaItem(
            item,
            imageDescriptions[index + galleryDescriptionOffset] || '',
            `${title} - média ${index + 1}`
        )
    )

    const coverMedia = picture
        ? normalizeMediaItem(
            { src: picture },
            galleryDescriptionOffset === 1 ? imageDescriptions[0] || '' : '',
            `${title} - miniature`
        )
        : (normalizedGallery[0] || null)

    const mediaItems = normalizedGallery
    const hasGallery = mediaItems.length > 0
    const hasMultipleImages = mediaItems.length > 1
    const currentMedia = mediaItems[currentImageIndex] || null
    const currentDescription = currentMedia?.description || ''
    const isCurrentImage = currentMedia?.type === 'image'
    const isCurrentInstagram = currentMedia?.type === 'instagram'
    const isCurrentEmbedded = currentMedia?.type === 'youtube' || currentMedia?.type === 'instagram' || currentMedia?.type === 'embed'
    const currentEmbedAspectRatio = currentMedia?.aspectRatio
        || (currentMedia?.type === 'youtube' ? '16 / 9' : (currentMedia?.type === 'instagram' ? '9 / 16' : '16 / 9'))

    const resetImageState = () => {
        setScale(1)
        setPosition({ x: 0, y: 0 })
        setImageLoaded(false)
        setIsTransitioning(false)
    }

    const nextImage = () => {
        if (!mediaItems.length) return
        if (isTransitioning) return
        setIsTransitioning(true)
        resetImageState()
        setTimeout(() => {
            setCurrentImageIndex((prev) => (prev + 1) % mediaItems.length)
        }, 100)
    }

    const prevImage = () => {
        if (!mediaItems.length) return
        if (isTransitioning) return
        setIsTransitioning(true)
        resetImageState()
        setTimeout(() => {
            setCurrentImageIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
        }, 100)
    }

    const goToImage = (index) => {
        if (isTransitioning || index === currentImageIndex) return
        setIsTransitioning(true)
        resetImageState()
        setTimeout(() => {
            setCurrentImageIndex(index)
        }, 100)
    }

    const openGallery = () => {
        if (!hasGallery) return
        setIsGalleryOpen(true)
        setCurrentImageIndex(0)
        resetImageState()
        document.body.style.overflow = 'hidden' // Empêcher le scroll du body
    }

    const closeGallery = () => {
        setIsGalleryOpen(false)
        resetImageState()
        setCurrentImageIndex(0)
        document.body.style.overflow = 'unset' // Rétablir le scroll
    }

    // Gestion clavier
    useEffect(() => {
        if (!isGalleryOpen) return

        const handleKeyDown = (e) => {
            if (isTransitioning) return
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault()
                    prevImage()
                    break
                case 'ArrowRight':
                    e.preventDefault()
                    nextImage()
                    break
                case 'Escape':
                    e.preventDefault()
                    closeGallery()
                    break
                default:
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isGalleryOpen, isTransitioning])

    // Gestion du zoom à la molette
    useEffect(() => {
        if (!isGalleryOpen || !containerRef.current) return

        const handleWheel = (e) => {
            e.preventDefault()
            const delta = e.deltaY > 0 ? 0.9 : 1.1
            const newScale = Math.min(Math.max(scale * delta, 0.5), 5)
            setScale(newScale)
            
            // Reset position si on dézoome complètement
            if (newScale <= 1) {
                setPosition({ x: 0, y: 0 })
            }
        }

        const container = containerRef.current
        container.addEventListener('wheel', handleWheel, { passive: false })
        
        return () => container.removeEventListener('wheel', handleWheel)
    }, [isGalleryOpen, scale])

    // Gestion du drag
    const handleMouseDown = (e) => {
        if (scale <= 1) return
        setIsDragging(true)
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        })
        e.preventDefault()
    }

    const handleMouseMove = (e) => {
        if (!isDragging || scale <= 1) return
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        })
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    // Gestion du pinch-to-zoom sur mobile
    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            const touch1 = e.touches[0]
            const touch2 = e.touches[1]
            const distance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) + 
                Math.pow(touch2.clientY - touch1.clientY, 2)
            )
            setDragStart({ ...dragStart, distance })
        } else if (e.touches.length === 1 && scale > 1) {
            setIsDragging(true)
            const touch = e.touches[0]
            setDragStart({
                x: touch.clientX - position.x,
                y: touch.clientY - position.y
            })
        }
    }

    const handleTouchMove = (e) => {
        e.preventDefault()
        
        if (e.touches.length === 2) {
            const touch1 = e.touches[0]
            const touch2 = e.touches[1]
            const distance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) + 
                Math.pow(touch2.clientY - touch1.clientY, 2)
            )
            
            if (dragStart.distance) {
                const scaleChange = distance / dragStart.distance
                const newScale = Math.min(Math.max(scale * scaleChange, 0.5), 5)
                setScale(newScale)
                setDragStart({ ...dragStart, distance })
                
                if (newScale <= 1) {
                    setPosition({ x: 0, y: 0 })
                }
            }
        } else if (e.touches.length === 1 && isDragging && scale > 1) {
            const touch = e.touches[0]
            setPosition({
                x: touch.clientX - dragStart.x,
                y: touch.clientY - dragStart.y
            })
        }
    }

    const handleTouchEnd = () => {
        setIsDragging(false)
        setDragStart({ x: 0, y: 0 })
    }

    // Double tap pour zoomer
    const handleDoubleClick = (e) => {
        e.stopPropagation() // Empêcher la fermeture du modal
        if (scale > 1) {
            setScale(1)
            setPosition({ x: 0, y: 0 })
        } else {
            setScale(2)
        }
    }

    // Reset transition state when image loads
    useEffect(() => {
        if (imageLoaded) {
            setTimeout(() => {
                setIsTransitioning(false)
            }, 200)
        }
    }, [imageLoaded])

    return (
        <div className="card bg-base-100 shadow-lg border border-slate-200 h-full">
            <figure className="!my-0 relative group cursor-pointer" onClick={hasGallery ? openGallery : undefined}>
                {coverMedia?.type === 'video' ? (
                    <video
                        src={coverMedia.src}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        loop
                        autoPlay
                    />
                ) : coverMedia?.type === 'youtube' || coverMedia?.type === 'instagram' || coverMedia?.type === 'embed' ? (
                    <iframe
                        src={coverMedia.embedSrc}
                        title={coverMedia.alt}
                        className="w-full aspect-video"
                        allow="autoplay; encrypted-media; picture-in-picture; web-share"
                        allowFullScreen
                    />
                ) : (
                    <img src={coverMedia?.src} alt={coverMedia?.alt || title} />
                )}
                {hasGallery && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                            <div className="bg-black/50 rounded-lg p-3 backdrop-blur-sm">
                                <span className="text-2xl">📷</span>
                                <div className="text-sm mt-1 font-medium">{mediaItems.length} médias</div>
                                <div className="text-xs mt-1 opacity-75">Cliquer pour voir la galerie</div>
                            </div>
                        </div>
                    </div>
                )}
            </figure>
            <div className="card-body">
                <div className="flex flex-wrap gap-1">
                    {
                        skills.map(skill =>
                            <Badge label={skill}
                                bgColor={utils.tagColors.hasOwnProperty(skill) ? utils.tagColors[skill][0] : "bg-slate-300"}
                                fgColor={utils.tagColors.hasOwnProperty(skill) ? utils.tagColors[skill][1] : "text-slate-950"}
                                filled={false}
                            />
                        )
                    }
                </div>
                <h4 className="card-title !mt-1">
                    {title}
                </h4>

                <hr class="my-1 h-0.5 border-t-0 bg-neutral-100" />


                <h5 className="font-semibold italic text-sm">Contexte</h5>
                <p className="!my-1">
                    {context}
                </p>
                <h5 className="font-semibold italic text-sm">Missions</h5>
                <ul className="!my-1">
                    {missions.map(mission =>
                        <li>{mission}</li>
                    )}
                </ul>
                <h5 className="font-semibold  italic text-sm">Livrables</h5>
                <ul className="!my-1">
                    {outputs.map(output =>
                        <li>{output}</li>
                    )}
                </ul>
                <div>
                    {hasGallery ? (
                        <button 
                            onClick={openGallery}
                            className="text-white no-underline btn btn-xs btn-secondary btn-outline grow-0 mt-2"
                        >
                            📷 Voir la galerie ({mediaItems.length})
                        </button>
                    ) : (
                        <Link to={link} target="_blank" className="text-white no-underline btn btn-xs btn-primary btn-outline grow-0 mt-2">
                            Voir le projet
                            <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                            </svg>
                        </Link>
                    )}
                </div>

                {/* Modal Galerie Pro avec Zoom */}
                {isGalleryOpen && (
                    <div 
                        className="fixed inset-0 z-50 bg-black bg-opacity-98" 
                        onClick={(e) => {
                            // Fermer si on clique sur le background (norme UX)
                            if (e.target === e.currentTarget) {
                                closeGallery()
                            }
                        }}
                        style={{ zIndex: 9999 }}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {/* UI moderne - Header minimal en haut */}
                        <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
                            <div className="flex items-start justify-between p-6">
                                {/* Compteur discret - Coin gauche */}
                                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 pointer-events-auto">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/80 text-sm">
                                            {currentImageIndex + 1} / {mediaItems.length}
                                        </span>
                                        {isCurrentImage && scale > 1 && (
                                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                                {Math.round(scale * 100)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Fermer - Coin droit */}
                                <button 
                                    onClick={closeGallery}
                                    className="bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all duration-200 p-3 rounded-lg pointer-events-auto text-white/80 hover:text-white"
                                    aria-label="Fermer"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Contrôles latéraux - Zoom à droite (masqué sur mobile) */}
                        {isCurrentImage && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30 pointer-events-auto hidden md:block">
                            <div className="bg-black/80 backdrop-blur-sm rounded-xl p-3 flex flex-col gap-2">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setScale(Math.min(scale * 1.3, 5))
                                    }}
                                    disabled={scale >= 5}
                                    className="w-10 h-10 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center justify-center font-bold text-lg"
                                    title="Zoom +"
                                >
                                    +
                                </button>
                                
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setScale(1)
                                        setPosition({ x: 0, y: 0 })
                                    }}
                                    className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg transition-all duration-200 flex items-center justify-center"
                                    title="Reset 1:1"
                                >
                                    1:1
                                </button>
                                
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setScale(Math.max(scale * 0.8, 0.5))
                                        if (scale * 0.8 <= 1) setPosition({ x: 0, y: 0 })
                                    }}
                                    disabled={scale <= 0.5}
                                    className="w-10 h-10 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center justify-center font-bold text-lg"
                                    title="Zoom -"
                                >
                                    −
                                </button>
                                
                                <div className="text-white text-xs text-center py-1 min-w-10">
                                    {Math.round(scale * 100)}%
                                </div>
                            </div>
                        </div>
                        )}

                        {/* Conteneur principal de l'image avec zoom */}
                        <div 
                            ref={containerRef}
                            className="h-full w-full flex items-center justify-center overflow-hidden cursor-move"
                            style={{ cursor: isCurrentImage && scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                            onClick={(e) => {
                                // Si le clic est en dehors de l'image, fermer la galerie
                                if (e.target === e.currentTarget) {
                                    closeGallery()
                                }
                            }}
                        >
                            {/* Image principale avec zoom et drag */}
                            <div 
                                className={`relative flex items-center justify-center h-full w-full ${isCurrentEmbedded ? (isCurrentInstagram ? 'pb-28 md:pb-36 pt-6 md:pt-10' : 'pb-40 md:pb-52 pt-10 md:pt-14') : ''}`}
                                onMouseDown={isCurrentImage ? handleMouseDown : undefined}
                                onTouchStart={isCurrentImage ? handleTouchStart : undefined}
                                onTouchMove={isCurrentImage ? handleTouchMove : undefined}
                                onTouchEnd={isCurrentImage ? handleTouchEnd : undefined}
                                onDoubleClick={isCurrentImage ? handleDoubleClick : undefined}
                                style={{ touchAction: isCurrentImage ? 'none' : 'auto' }}
                                onClick={(e) => {
                                    // Si le clic est en dehors de l'image elle-même, fermer la galerie
                                    if (e.target === e.currentTarget) {
                                        closeGallery()
                                    }
                                }}
                            >
                                {!imageLoaded && currentMedia?.type !== 'instagram' && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                        <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}

                                {currentMedia?.type === 'image' && (
                                    <img 
                                        ref={imageRef}
                                        src={currentMedia.src}
                                        alt={currentMedia.alt || `${title} - Média ${currentImageIndex + 1}`}
                                        className={`max-w-full max-h-full object-contain select-none transition-all duration-200 ease-out ${
                                            imageLoaded ? 'opacity-100' : 'opacity-0'
                                        }`}
                                        style={{
                                            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                                            transformOrigin: 'center center'
                                        }}
                                        onLoad={() => setImageLoaded(true)}
                                        onError={(e) => {
                                            console.error('Error loading image:', currentMedia.src)
                                            e.target.style.display = 'none'
                                        }}
                                        draggable={false}
                                    />
                                )}

                                {currentMedia?.type === 'video' && (
                                    <video
                                        src={currentMedia.src}
                                        poster={currentMedia.poster || undefined}
                                        controls
                                        className={`max-w-full max-h-full object-contain transition-all duration-200 ease-out ${
                                            imageLoaded ? 'opacity-100' : 'opacity-0'
                                        }`}
                                        onLoadedData={() => setImageLoaded(true)}
                                    />
                                )}

                                {(currentMedia?.type === 'youtube' || currentMedia?.type === 'instagram' || currentMedia?.type === 'embed') && (
                                    <iframe
                                        src={currentMedia.embedSrc}
                                        title={currentMedia.alt || `${title} - Média ${currentImageIndex + 1}`}
                                        className={`${isCurrentInstagram ? 'w-[min(92vw,500px)] h-[min(78vh,780px)]' : 'w-[min(92vw,1100px)]'} rounded-lg bg-black transition-all duration-200 ease-out ${
                                            imageLoaded ? 'opacity-100' : 'opacity-0'
                                        }`}
                                        style={isCurrentInstagram
                                            ? { maxHeight: 'calc(100vh - 11rem)' }
                                            : {
                                                aspectRatio: currentEmbedAspectRatio,
                                                maxHeight: 'calc(100vh - 320px)'
                                            }
                                        }
                                        scrolling={isCurrentInstagram ? 'yes' : 'no'}
                                        allow="autoplay; encrypted-media; picture-in-picture; web-share"
                                        allowFullScreen
                                        onLoad={() => setImageLoaded(true)}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Boutons navigation latéraux - Repositionnés */}
                        {mediaItems.length > 1 && (!isCurrentImage || scale <= 1.2) && (
                            <>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        prevImage()
                                    }}
                                    disabled={isTransitioning}
                                    className="fixed left-6 top-1/2 z-30 -translate-y-1/2 bg-black/80 hover:bg-black/90 text-white p-3 rounded-xl transition-all duration-200 backdrop-blur-sm disabled:opacity-30 disabled:cursor-not-allowed hidden md:flex items-center justify-center"
                                    aria-label="Image précédente"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        nextImage()
                                    }}
                                    disabled={isTransitioning}
                                    className="fixed right-24 top-1/2 z-30 -translate-y-1/2 bg-black/80 hover:bg-black/90 text-white p-3 rounded-xl transition-all duration-200 backdrop-blur-sm disabled:opacity-30 disabled:cursor-not-allowed hidden md:flex items-center justify-center"
                                    aria-label="Image suivante"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}



                        {/* Footer - Navigation et contrôles */}
                        <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
                            <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 md:p-6">
                                
                                {/* Miniatures en bas - Petites et discrètes */}
                                {mediaItems.length > 1 && (!isCurrentImage || scale <= 1.5) && (
                                    <div className="flex justify-center mb-4 pointer-events-auto">
                                        <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2">
                                            {/* Container fixe pour éviter les coupures */}
                                            <div className="flex gap-2 items-center justify-center" style={{ minHeight: '54px' }}>
                                                {mediaItems.map((item, index) => (
                                                    (() => {
                                                        const thumbSrc = getThumbnailSource(item)
                                                        const fallbackLabel = item.type === 'video'
                                                            ? 'Vidéo'
                                                            : (item.type === 'youtube' ? 'YouTube' : (item.type === 'instagram' ? 'Reel' : 'Média'))

                                                        return (
                                                    <button
                                                        key={`thumb-${index}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            if (!isTransitioning) goToImage(index)
                                                        }}
                                                        disabled={isTransitioning}
                                                        className={`flex-shrink-0 rounded overflow-hidden transition-all duration-200 ${
                                                            currentImageIndex === index 
                                                                ? 'opacity-100 shadow-[0_0_0_2px_rgba(255,255,255,0.75)]' 
                                                                : 'opacity-50 hover:opacity-80 shadow-[0_0_0_1px_rgba(255,255,255,0.18)]'
                                                        } ${isTransitioning ? 'cursor-wait' : 'cursor-pointer'} p-0 m-0 leading-none appearance-none`}
                                                        style={{ 
                                                            width: '50px', 
                                                            height: '50px',
                                                            transform: currentImageIndex === index ? 'scale(1.05)' : 'scale(1)',
                                                            backgroundImage: thumbSrc ? `url(${thumbSrc})` : 'none',
                                                            backgroundSize: 'contain',
                                                            backgroundPosition: 'center',
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundColor: thumbSrc ? 'transparent' : 'rgba(0,0,0,0.65)',
                                                            backgroundClip: 'border-box'
                                                        }}
                                                    >
                                                        {!thumbSrc && (
                                                            <span className="w-full h-full flex items-center justify-center text-white text-[10px]">
                                                                {fallbackLabel}
                                                            </span>
                                                        )}
                                                        <span className="sr-only">Miniature {index + 1} - {item.alt || fallbackLabel}</span>
                                                    </button>
                                                        )
                                                    })()
                                                ))}
                                            </div>
                                            
                                            {/* Description stable avec transition smooth */}
                                            <div className="mt-2 text-center transition-all duration-300 ease-in-out" style={{ minHeight: currentDescription ? '20px' : '0px' }}>
                                                {currentDescription && (
                                                    <div className="text-white/40 text-xs max-w-sm mx-auto leading-relaxed transition-opacity duration-300 ease-in-out">
                                                        {currentDescription}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Actions simplifiées */}
                                <div className="flex flex-col gap-4 pointer-events-auto">
                                    
                                    {/* Navigation mobile seulement */}
                                    {mediaItems.length > 1 && (!isCurrentImage || scale <= 1.2) && (
                                        <div className="flex items-center justify-center gap-3 md:hidden">
                                            <div className="bg-black/90 backdrop-blur-sm rounded-xl p-3 flex gap-3">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        prevImage()
                                                    }}
                                                    disabled={isTransitioning}
                                                    className="bg-white/20 hover:bg-white/30 disabled:opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                    Précédent
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        nextImage()
                                                    }}
                                                    disabled={isTransitioning}
                                                    className="bg-white/20 hover:bg-white/30 disabled:opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm flex items-center gap-1"
                                                >
                                                    Suivant
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Lien projet si disponible */}
                                    {link && (
                                        <div className="flex justify-center">
                                            <Link 
                                                to={link} 
                                                target="_blank" 
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 inline-flex items-center gap-2 shadow-lg"
                                                onClick={closeGallery}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                <span className="hidden sm:inline">Voir le projet complet</span>
                                                <span className="sm:hidden">Voir le projet</span>
                                            </Link>
                                        </div>
                                    )}

                                    {/* Aide discrète */}
                                    <div className="hidden lg:block text-center pointer-events-none">
                                        <p className="text-white/30 text-xs">
                                            Double-clic: Zoom • ← → Navigation • Molette: Zoom • Glisser: Déplacer • ESC: Fermer
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Zones de clic pour navigation mobile - cachées en mode zoom */}
                        {mediaItems.length > 1 && (!isCurrentImage || scale <= 1.2) && (
                            <>
                                <div 
                                    className="absolute left-0 top-20 bottom-20 w-1/4 md:hidden z-20"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        prevImage()
                                    }}
                                />
                                <div 
                                    className="absolute right-0 top-20 bottom-20 w-1/4 md:hidden z-20"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        nextImage()
                                    }}
                                />
                            </>
                        )}
                    </div>
                )}

            </div>
        </div>
    )
}