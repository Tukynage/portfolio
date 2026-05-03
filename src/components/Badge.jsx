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
                    ? [bgColor, fgColor, 'border-transparent shadow-sm']
                    : 'bg-transparent border-base-300 dark:border-slate-600 text-base-content/65 dark:text-slate-400 hover:border-base-content/40 dark:hover:border-slate-500 hover:text-base-content dark:hover:text-slate-200'
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
        <span className={clsx(base, 'px-2.5 py-1 bg-base-200 dark:bg-slate-700/70 text-base-content/75 dark:text-slate-300')}>
            <i className={clsx('w-1.5 h-1.5 rounded-full shrink-0', bgColor)} />
            {label}
        </span>
    )
}
