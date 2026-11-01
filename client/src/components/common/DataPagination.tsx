import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface DataPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  itemName?: string
  className?: string
}

/**
 * Universal, responsive pagination bar with 10 / 20 / 30 page size switching.
 */
export const DataPagination: React.FC<DataPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 30],
  onPageChange,
  onPageSizeChange,
  itemName = "items",
  className,
}) => {
  if (totalItems === 0) return null

  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalItems)

  // Calculate dynamic visible page numbers (smart windowing)
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, totalPages]
    }
    if (currentPage >= totalPages - 2) {
      return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }
    return [1, currentPage - 1, currentPage, currentPage + 1, totalPages]
  }

  const pages = getPageNumbers()

  return (
    <div
      className={cn(
        "p-3 sm:px-5 sm:py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0",
        className
      )}
    >
      {/* Range Telemetry */}
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          Showing{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {startIndex}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {endIndex}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {totalItems}
          </span>{" "}
          {itemName}
        </div>

        {/* Page Size Selector: 10, 20, 30 */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 font-medium">Show:</span>
            <div className="inline-flex rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 shadow-xs">
              {pageSizeOptions.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    onPageSizeChange(size)
                    onPageChange(1) // Reset to page 1 on page size alteration
                  }}
                  className={cn(
                    "px-2 py-0.5 text-[11px] font-semibold rounded transition-colors",
                    pageSize === size
                      ? "bg-indigo-600 text-white shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  )}
                  title={`Show ${size} ${itemName} per page`}
                >
                  {size}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-400">/ page</span>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="h-8 px-2.5 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((page, index) => {
            const prevPage = pages[index - 1]
            const showEllipsis = prevPage && page - prevPage > 1

            return (
              <React.Fragment key={page}>
                {showEllipsis && (
                  <span className="px-1 text-slate-400 text-xs">...</span>
                )}
                <button
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={cn(
                    "h-8 min-w-[32px] px-2 rounded-md font-medium transition-colors text-xs border",
                    currentPage === page
                      ? "bg-indigo-600 border-indigo-600 text-white font-bold shadow-sm"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  )}
                >
                  {page}
                </button>
              </React.Fragment>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="h-8 px-2.5 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  )
}

