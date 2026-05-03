const LEVEL_LABELS = {
    1: "Notions",
    2: "Bases solides",
    3: "Opérationnel",
    4: "Autonome",
    5: "Référent"
}

export default function Skill({ title, description, tools, level, icon }) {
    const safeLevel = Math.min(Math.max(Number(level) || 1, 1), 5)
    const levelLabel = LEVEL_LABELS[safeLevel]

    return (
        <div className='card bg-base-100 text-base-content shadow-md border border-base-300 h-full w-full max-w-[380px] mx-auto'>
            <div className="card-body p-4 gap-3 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                    <h3 className='card-title text-base leading-tight !m-0'>{title}</h3>
                    {icon && (
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-base-200 border border-base-300 shrink-0">
                            <img
                                src={icon}
                                alt={`Icône ${title}`}
                                className="w-7 h-7 object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none"
                                }}
                            />
                        </span>
                    )}
                </div>

                <p className='text-sm !m-0 text-base-content/80'>{description}</p>

                <div className="flex flex-wrap gap-1.5">
                    {tools.map((tool) => (
                        <span key={`${title}-${tool}`} className="badge badge-outline badge-sm">
                            {tool}
                        </span>
                    ))}
                </div>

                <div className="mt-auto pt-1">
                    <div className="flex items-center justify-between text-xs text-base-content/70">
                        <span>Niveau d'autonomie</span>
                        <span className="font-semibold text-base-content">{levelLabel}</span>
                    </div>
                    <div className="mt-1 flex gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <span
                                key={`${title}-level-${index}`}
                                className={`h-1.5 flex-1 rounded-full ${index < safeLevel ? "bg-base-content" : "bg-base-300"}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}