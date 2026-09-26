export interface KnowledgeFormProps {
  onStart: () => void;
  onSuccess: (success: boolean, form: HTMLFormElement, message: string) => Promise<void>;
}
