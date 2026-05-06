import clsx from 'clsx'

export default function Badge({ label, bgColor = 'bg-slate-200', fgColor = 'text-slate-900', filled = false, onClick, active }) {
    const isInteractive = typeof onClick === 'function'
    const Tag = isInteractive ? 'button' : 'span'
    const base = 'inline-flex items-center gap-1.5 rounded-full text-[13px] font-medium transition-all duration-200'

    if (isInteractive) {
        return (
            <Tag
                type="button"
                onClick={onClick}
                className={clsx(base, 'px-2.5 py-1 border cursor-pointer select-none', active
                    ? 'bg-base-content text-base-100 border-base-content shadow-sm'
                    : 'bg-transparent border-base-content/20 text-base-content/70 hover:border-base-content/50 hover:text-base-content'
                )}
            >
                {label}
            </Tag>
        )
    }

    if (filled) {
        return (
            <span className={clsx(base, 'px-2.5 py-1 ring-1 ring-inset ring-white/20', bgColor, fgColor)}>
                {label}
            </span>
        )
    }

    return (
        <span className={clsx(base, 'px-2.5 py-1 bg-base-content/10 text-base-content border border-base-content/5')}>
            <i className={clsx('w-1.5 h-1.5 rounded-full shrink-0', bgColor)} />
            {label}
        </span>
    )
}
