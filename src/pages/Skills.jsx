import Skill from "../components/Skill.jsx"
import { getAssetURL } from "../utils/utils.js"

export default function Skills({skills}) {
    function resolveIcon(iconPath) {
        if (!iconPath) return null
        if (/^https?:\/\//i.test(iconPath)) return iconPath
        return getAssetURL("media", iconPath)
    }

    return (
        <>
            <h2 id="skills" className="mb-11">Compétences</h2>

            <div className="max-w-7xl w-full mx-auto">
                <div className="flex flex-wrap justify-center gap-8">
                    {
                        skills.map(skill =>
                            <Skill key={skill.title}
                                title={skill.title}
                                description={skill.description}
                                tools={skill.tools}
                                level={skill.level}
                                icon={resolveIcon(skill.icon)} />
                        )
                    }
                </div>
            </div>

        </>
    )

}