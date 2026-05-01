import { useMemo, useState } from "react"
import Project from "../components/Project.jsx"
import { getAssetURL, tagColors } from "../utils/utils.js"

function resolveMediaPath(mediaPath) {
    if (!mediaPath) return mediaPath
    if (/^https?:\/\//i.test(mediaPath)) return mediaPath
    return getAssetURL("media", mediaPath)
}

function normalizeGalleryItem(item) {
    if (typeof item === 'string') {
        return resolveMediaPath(item)
    }

    if (!item || typeof item !== 'object') {
        return item
    }

    return {
        ...item,
        src: item.src ? resolveMediaPath(item.src) : item.src,
        url: item.url ? resolveMediaPath(item.url) : item.url,
        thumbnail: item.thumbnail ? resolveMediaPath(item.thumbnail) : item.thumbnail,
        poster: item.poster ? resolveMediaPath(item.poster) : item.poster
    }
}

export default function Projects({projects}) {
    const [activeFilter, setActiveFilter] = useState("Tous")

    function getContrastTextClass(bgClass = "") {
        const lightBgTokens = [
            "bg-red-",
            "bg-fuchsia-",
            "bg-pink-",
            "bg-orange-",
            "bg-amber-",
            "bg-yellow-",
            "bg-lime-",
            "bg-green-",
            "bg-sky-",
            "bg-indigo-",
            "bg-slate-",
            "bg-zinc-",
            "bg-neutral-",
            "bg-stone-"
        ]

        const isLightBg = lightBgTokens.some((token) => bgClass.startsWith(token))
        return isLightBg ? "text-slate-950" : "text-white"
    }

    function getFilterClasses(filter, isActive) {
        const inactiveClasses = "bg-transparent text-base-content/80 border-base-300 hover:border-base-content/40 hover:text-base-content"
        if (!isActive) return inactiveClasses

        if (filter === "Tous") return "bg-slate-800 text-white border-slate-800"

        const [bgClass] = tagColors[filter] || ["bg-slate-200"]
        const textClass = getContrastTextClass(bgClass)
        return `${bgClass} ${textClass} border-transparent`
    }

    const filters = useMemo(() => {
        const collectedTags = new Set()
        projects.forEach((project) => {
            (project.skills || []).forEach((skill) => collectedTags.add(skill))
        })
        return ["Tous", ...Array.from(collectedTags)]
    }, [projects])

    const filteredProjects = useMemo(() => {
        if (activeFilter === "Tous") return projects
        return projects.filter((project) => (project.skills || []).includes(activeFilter))
    }, [projects, activeFilter])

    return (
        <>
            <h2 id="projects" className="mb-11">Projets</h2>
            <div className="mb-6 flex flex-wrap gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`btn btn-sm border transition-all duration-300 ${getFilterClasses(filter, activeFilter === filter)}`}
                    >
                        {filter}
                    </button>
                ))}
            </div>
            <div className="w-full">
                <div key={activeFilter} className="project-auto-layout project-grid-fade items-stretch">
                    {filteredProjects.map(
                        (project, index) =>
                            <div
                                key={project.title}
                                className="w-full project-card-fade"
                                style={{ animationDelay: `${index * 45}ms` }}
                            >
                            <Project
                                    title = {project.title} 
                                    context = {project.context}
                                    skills = {project.skills}
                                    outputs = {project.outputs}
                                    missions = {project.missions}
                                    link = {project.link}
                                    picture = {resolveMediaPath(project.picture)}
                                    bilan = {project.bilan || ''}
                                    gallery = {project.gallery ? project.gallery.map(normalizeGalleryItem) : []}
                                    imageDescriptions = {project.imageDescriptions || []}/>
                            </div>
                    )}
                </div>
            </div>
        </>

    )
}