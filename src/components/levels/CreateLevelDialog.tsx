import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createLevel } from "@/api/tradingCliService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useInvalidateLevels } from "@/hooks/useLevelsPoll";
import {
  nextOrderType,
  toggleSide,
  validateCreateLevelForm,
  type CreateLevelFormValues,
} from "@/lib/validation";
import { useTradingStore } from "@/store/tradingStore";

const initialValues: CreateLevelFormValues = {
  levelId: "",
  symbolBase: "",
  symbolQuote: "",
  side: "Buy",
  orderType: "Limit",
  enabled: true,
  price: "",
  quantity: "",
  riskLimit: "0",
  maxPosition: "0",
  repostOnFill: false,
  repostOnCancel: false,
};

export function CreateLevelDialog() {
  const overlay = useTradingStore((s) => s.overlay);
  const closeOverlay = useTradingStore((s) => s.closeOverlay);
  const [values, setValues] = useState<CreateLevelFormValues>(initialValues);
  const invalidateLevels = useInvalidateLevels();

  const mutation = useMutation({
    mutationFn: createLevel,
    onSuccess: async (res) => {
      toast.success(`Level created: ${res.levelId}`);
      await invalidateLevels();
      closeOverlay();
      setValues(initialValues);
    },
    onError: (err) => toast.error(String(err)),
  });

  const onSubmit = () => {
    const err = validateCreateLevelForm(values);
    if (err) {
      toast.error(err);
      return;
    }
    mutation.mutate(values);
  };

  return (
    <Dialog
      open={overlay === "createLevel"}
      onOpenChange={(o) => {
        if (!o) {
          closeOverlay();
          setValues(initialValues);
        }
      }}
    >
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Level</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <Field label="Level ID">
            <Input
              value={values.levelId}
              onChange={(e) => setValues({ ...values, levelId: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Base">
              <Input
                value={values.symbolBase}
                onChange={(e) =>
                  setValues({ ...values, symbolBase: e.target.value })
                }
              />
            </Field>
            <Field label="Quote">
              <Input
                value={values.symbolQuote}
                onChange={(e) =>
                  setValues({ ...values, symbolQuote: e.target.value })
                }
              />
            </Field>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setValues({ ...values, side: toggleSide(values.side) })
              }
            >
              Side: {values.side}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setValues({
                  ...values,
                  orderType: nextOrderType(values.orderType),
                })
              }
            >
              Type: {values.orderType}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={values.enabled}
              onCheckedChange={(enabled) => setValues({ ...values, enabled })}
            />
            <Label>Enabled</Label>
          </div>
          <Field label="Price">
            <Input
              value={values.price}
              onChange={(e) => setValues({ ...values, price: e.target.value })}
            />
          </Field>
          <Field label="Quantity">
            <Input
              value={values.quantity}
              onChange={(e) =>
                setValues({ ...values, quantity: e.target.value })
              }
            />
          </Field>
          <Field label="Risk Limit">
            <Input
              value={values.riskLimit}
              onChange={(e) =>
                setValues({ ...values, riskLimit: e.target.value })
              }
            />
          </Field>
          <Field label="Max Position">
            <Input
              value={values.maxPosition}
              onChange={(e) =>
                setValues({ ...values, maxPosition: e.target.value })
              }
            />
          </Field>
          <ToggleRow
            label="Repost on Fill"
            checked={values.repostOnFill}
            onChange={(repostOnFill) => setValues({ ...values, repostOnFill })}
          />
          <ToggleRow
            label="Repost on Cancel"
            checked={values.repostOnCancel}
            onChange={(repostOnCancel) =>
              setValues({ ...values, repostOnCancel })
            }
          />
          <Button onClick={onSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Creating…" : "Create Level"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={checked} onCheckedChange={onChange} />
      <Label>{label}</Label>
    </div>
  );
}
