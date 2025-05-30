
"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteConfirmationButtonProps {
  itemId: string;
  itemName: string;
  itemType: string; // e.g., "Classe", "Ordem"
  deleteAction: (id: string) => Promise<{ success: boolean; message: string }>;
  onSuccess?: () => void; // Optional: for redirection or other client-side actions
  triggerButtonProps?: ButtonProps;
  triggerIcon?: React.ReactNode;
}

export function DeleteConfirmationButton({
  itemId,
  itemName,
  itemType,
  deleteAction,
  onSuccess,
  triggerButtonProps,
  triggerIcon,
}: DeleteConfirmationButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deleteAction(itemId);
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        });
        if (onSuccess) {
          onSuccess();
        } else {
          // Default refresh if no specific success action
          router.refresh();
        }
        setIsDialogOpen(false);
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={triggerButtonProps?.variant || "ghost"}
          size={triggerButtonProps?.size || "icon"}
          className={triggerButtonProps?.className || "text-destructive hover:text-destructive"}
          title={triggerButtonProps?.title || `Excluir ${itemType}`}
          disabled={isPending}
          {...triggerButtonProps}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : triggerIcon || <Trash2 className="h-4 w-4" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir {itemType.toLowerCase()} "{itemName}"? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
