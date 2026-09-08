import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-[#0a0a0a] focus-visible:ring-2 focus-visible:ring-[#0a0a0a]/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 aria-invalid:border-[#DC2626] aria-invalid:ring-2 aria-invalid:ring-[#DC2626]/10 dark:focus-visible:border-[#fafafa] dark:focus-visible:ring-[#fafafa]/10 dark:aria-invalid:border-[#EF4444] dark:aria-invalid:ring-[#EF4444]/10",
        className
      )}
      {...props}
    />
  )
}

export { Input }
