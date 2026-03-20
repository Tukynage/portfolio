import Project from "../components/Project.jsx"
import {getAssetURL} from "../utils/utils.js"

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
    console.log(projects)
    return (
        <>
            <h2 id="projects" className="mb-11">Projets</h2>
            <div className="flex justify-center">
                <div className="grid justify-items-center sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 place-items-center">
                    {projects.map(
                        project => 
                            <Project key={project.title} 
                                    title = {project.title} 
                                    context = {project.context}
                                    skills = {project.skills}
                                    outputs = {project.outputs}
                                    missions = {project.missions}
                                    link = {project.link}
                                    picture = {resolveMediaPath(project.picture)}
                                    gallery = {project.gallery ? project.gallery.map(normalizeGalleryItem) : []}
                                    imageDescriptions = {project.imageDescriptions || []}/>
                    )}
                </div>
            </div>
        </>

    )
}