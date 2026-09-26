import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/crud-page";

export const Route = createFileRoute("/admin/faq")({ component: FaqAdmin });

function FaqAdmin() {
  return (
    <CrudPage
      table="faqs"
      title="FAQ"
      description="Pertanyaan yang sering diajukan. Atur urutan dengan tombol panah."
      singular="FAQ"
      searchKeys={["question", "answer"]}
      defaults={{ question: "", answer: "" }}
      fields={[
        { name: "question", label: "Pertanyaan", type: "textarea", required: true },
        { name: "answer", label: "Jawaban", type: "textarea", required: true },
      ]}
      columns={[
        { label: "Pertanyaan", render: (r) => <div><p className="font-semibold text-primary">{r.question}</p><p className="line-clamp-1 text-xs text-muted-foreground">{r.answer}</p></div> },
      ]}
    />
  );
}
