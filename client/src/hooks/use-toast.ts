import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

type Toast = ReturnType<typeof sonnerToast>;

interface UseToastReturn {
  toast: (props: ToastProps | string) => Toast;
}

export function useToast(): UseToastReturn {
  const toast = (props: ToastProps | string): Toast => {
    if (typeof props === "string") {
      return sonnerToast(props);
    }

    return sonnerToast(props.title || props.description || "", {
      description: props.description,
      ...(props.variant === "destructive" ? { className: "destructive" } : {}),
    });
  };

  return { toast };
}
