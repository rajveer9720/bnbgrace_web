import type { ComponentPropsWithoutRef } from "react";

type AuthFieldProps = ComponentPropsWithoutRef<"input"> & {
  id: string;
  label: string;
};

export default function AuthField({ id, label, ...props }: AuthFieldProps) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} />
    </>
  );
}
