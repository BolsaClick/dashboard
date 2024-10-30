import { cn } from "@/lib/utils";
import * as React from "react"
import InputMask from "react-input-mask"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  mask?: string; // Adicionando a propriedade mask
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, mask, ...props }, ref) => {
    // Criação de uma referência interna para InputMask
    const inputRef = React.useRef<HTMLInputElement>(null)

    // Usando o ref passado para conectar com o inputRef
    React.useImperativeHandle(ref, () => inputRef.current!)

    
    const inputElement = mask ? (
      <InputMask
        mask={mask}
        inputRef={inputRef}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    ) : (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref} // Usando o ref padrão para input
        {...props}
      />
    )

    return inputElement
  }
)

Input.displayName = "Input"

export { Input }
