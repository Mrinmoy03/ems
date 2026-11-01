import React from "react"
import { ProjectLink } from "../../types/project"
import { Globe, Server, GitBranch, FileCode2, FileText, ExternalLink, Copy, Check } from "lucide-react"
import { Button } from "../ui/button"
import { toast } from "sonner"

interface ProjectLinksListProps {
  links: ProjectLink[]
  compact?: boolean
  className?: string
}

export const ProjectLinksList: React.FC<ProjectLinksListProps> = ({
  links,
  compact = false,
  className = "",
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const handleCopy = (id: string, url: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success("URL copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getLinkIcon = (type: ProjectLink["type"]) => {
    switch (type) {
      case "live":
        return <Globe className="w-3.5 h-3.5 text-emerald-500" />
      case "staging":
        return <Server className="w-3.5 h-3.5 text-amber-500" />
      case "repository":
        return <GitBranch className="w-3.5 h-3.5 text-violet-500" />
      case "figma":
        return <FileCode2 className="w-3.5 h-3.5 text-rose-500" />
      case "docs":
        return <FileText className="w-3.5 h-3.5 text-indigo-500" />
      default:
        return <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
    }
  }

  if (links.length === 0) {
    return <span className="text-[11px] text-slate-400 italic">No external references configured.</span>
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
        {links.map(lnk => (
          <a
            key={lnk.id}
            href={lnk.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${lnk.label}: ${lnk.url}`}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] transition-colors border border-slate-200 dark:border-slate-700/60"
          >
            {getLinkIcon(lnk.type)}
            <span className="font-medium max-w-[120px] truncate">{lnk.label}</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
          </a>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {links.map(lnk => (
        <div
          key={lnk.id}
          className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 shrink-0">
              {getLinkIcon(lnk.type)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                {lnk.label}
              </p>
              <p className="text-[10px] font-mono text-slate-400 truncate max-w-xs sm:max-w-md">
                {lnk.url}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={e => handleCopy(lnk.id, lnk.url, e)}
              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Copy URL"
            >
              {copiedId === lnk.id ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-[11px] gap-1 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
            >
              <a href={lnk.url} target="_blank" rel="noopener noreferrer">
                <span>Open</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

