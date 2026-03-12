import * as utils from "../utils/utils"
import { getAssetURL } from "../utils/utils"
import { Link } from "react-router-dom"
import Badge from './Badge.jsx'
import { useState } from 'react'

export default function Project({ title, picture, context, outputs, missions, skills, link, gallery }) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const openGallery = (imgName) => {
        const fullUrl = getAssetURL("media", imgName);
        setSelectedImage(fullUrl);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="card bg-base-100 shadow-lg border border-slate-200 h-full flex flex-col">
                <figure 
                    className="!my-0 relative group cursor-pointer" 
                    onClick={() => gallery && gallery.length > 0 ? openGallery(gallery[0]) : null}
                >
                    <img src={picture} alt={title} className="w-full h-110 object-cover transition-transform group-hover:scale-105"/>
                    
                    {/* --- NOUVEAU : Badge compteur de photos --- */}
                    {gallery && gallery.length > 0 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                            {gallery.length}
                        </div>
                    )}
                </figure>

                <div className="card-body flex flex-col flex-grow">
                    <div className="flex flex-wrap gap-1">
                        {
                            skills.map((skill, index) =>
                                <Badge key={index} label={skill}
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

                    <hr className="my-1 h-0.5 border-t-0 bg-neutral-100" />

                    <div className="flex-grow">
                        <h5 className="font-semibold italic text-sm">Contexte</h5>
                        <p className="!my-1">
                            {context}
                        </p>
                        <h5 className="font-semibold italic text-sm">Missions</h5>
                        <ul className="!my-1 list-disc pl-4">
                            {missions.map((mission, idx) =>
                                <li key={idx}>{mission}</li>
                            )}
                        </ul>
                        <h5 className="font-semibold  italic text-sm">Livrables</h5>
                        <ul className="!my-1 list-disc pl-4">
                            {outputs.map((output, idx) =>
                                <li key={idx}>{output}</li>
                            )}
                        </ul>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {/* Ton bouton original */}
                        {link && (
                            <Link to={link} target="_blank" className="text-white no-underline btn btn-xs btn-primary btn-outline grow-0">
                                Voir le projet
                                <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                                </svg>
                            </Link>
                        )}

                        {/* --- NOUVEAU : Bouton Galerie (S'affiche uniquement si galerie existe) --- */}
                        {gallery && gallery.length > 0 && (
                            <button onClick={() => openGallery(gallery[0])} className="btn btn-xs btn-neutral text-white no-underline">
                                Ouvrir la galerie
                            </button>
                        )}
                    </div>

                </div>
            </div>

            {/* --- NOUVEAU : La Modale (Pop-up) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 p-4" onClick={() => setIsModalOpen(false)}>
                    
                    {/* Bouton Fermer */}
                    <button className="absolute top-5 right-5 text-white/80 hover:text-white text-5xl leading-none">&times;</button>

                    <div className="max-w-6xl w-full flex flex-col items-center h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Image en grand */}
                        <div className="flex-grow flex items-center justify-center w-full overflow-hidden mb-4">
                            <img src={selectedImage} alt="Zoom" className="max-h-full max-w-full object-contain rounded shadow-2xl" />
                        </div>

                        {/* Miniatures */}
                        <div className="flex gap-3 overflow-x-auto w-full justify-center py-2 px-4 bg-white/5 rounded-xl">
                            {gallery.map((imgName, index) => {
                                const thumbUrl = getAssetURL("media", imgName);
                                return (
                                    <img 
                                        key={index} 
                                        src={thumbUrl} 
                                        onClick={() => setSelectedImage(thumbUrl)}
                                        className={`h-16 w-16 object-cover rounded-md cursor-pointer border-2 transition-all ${selectedImage === thumbUrl ? 'border-primary opacity-100 scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`} 
                                    />
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}