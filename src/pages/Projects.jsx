import { useMemo, useState } from "react"
import Project from "../components/Project.jsx"
import Badge from "../components/Badge.jsx"
import { getAssetURL, tagColors } from "../utils/utils.js"

function resolveMediaPath(mediaPath) {
    if (!mediaPath) return mediaPath
    if (/^https?:\/\//i.test(mediaPath)) return mediaPath
    if (mediaPath.startsWith('/')) return mediaPath
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
            <h2 id="projects" className="mb-5">Projets</h2>
            <div className="mb-6 flex flex-wrap gap-2">
                {filters.map((filter) => {
                    const [bgClass, fgClass] = filter === 'Tous'
                        ? ['bg-slate-800', 'text-white']
                        : tagColors[filter] || ['bg-slate-200', 'text-slate-900']
                    return (
                        <Badge
                            key={filter}
                            label={filter}
                            bgColor={bgClass}
                            fgColor={fgClass}
                            onClick={() => setActiveFilter(filter)}
                            active={activeFilter === filter}
                        />
                    )
                })}
            </div>
            <div
                key={activeFilter}
                className="project-grid-fade grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5"
            >
                {filteredProjects.map((project, index) => (
                    <div
                        key={project.title}
                        className="project-card-fade h-full"
                        style={{ animationDelay: `${index * 45}ms` }}
                    >
                        <Project
                            title={project.title}
                            context={project.context}
                            skills={project.skills}
                            outputs={project.outputs}
                            missions={project.missions}
                            link={project.link}
                            picture={resolveMediaPath(project.picture)}
                            bilan={project.bilan || ''}
                            gallery={project.gallery ? project.gallery.map(normalizeGalleryItem) : []}
                            imageDescriptions={project.imageDescriptions || []}
                        />
                    </div>
                ))}
            </div>
        </>
    )
}