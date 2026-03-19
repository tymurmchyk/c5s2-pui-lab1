import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { EngObjectEvent, EngObjectTask } from "@/backend";
import type { Fact } from "@/backend/model";

export default function EditEventDialog({
  event,
  tasks,
  onConfirm,
  onCancel,
}: {
  event: EngObjectEvent;
  tasks?: EngObjectTask[];
  onConfirm: (patch: Partial<EngObjectEvent>) => void;
  onCancel: () => void;
}) {
  const [note, setNote] = useState(event.note);
  const [facts, setFacts] = useState<Fact[]>([...event.facts]);
  const [taskRefs, setTaskRefs] = useState<string[]>([...event.taskRefs]);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="w-96 rounded-none gap-3">
        <DialogHeader>
          <DialogTitle>Редагувати подію</DialogTitle>
        </DialogHeader>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Час</label>
          <span className="text-sm">{event.timestamp}</span>
        </div>
        <textarea
          className="form-textarea min-h-20 w-full"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div>
          <div className="section-label mb-1">Факти</div>
          {facts.map((f, i) => (
            <div key={i} className="flex gap-2 items-center mb-1">
              <select
                className="form-select"
                value={f.kind}
                onChange={(e) => {
                  const kind = e.target.value as Fact["kind"];
                  const next = [...facts];
                  next[i] = { kind, [kind]: "" } as Fact;
                  setFacts(next);
                }}
              >
                <option value="email">Email</option>
                <option value="call">Дзвінок</option>
                <option value="msg">Повідомлення</option>
              </select>
              <Input
                value={(f as Record<string, string>)[f.kind]}
                onChange={(e) => {
                  const next = [...facts];
                  next[i] = { ...f, [f.kind]: e.target.value } as Fact;
                  setFacts(next);
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                className="rounded-none px-2"
                onClick={() => setFacts(facts.filter((_, j) => j !== i))}
              >
                ×
              </Button>
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            className="rounded-none"
            onClick={() => setFacts([...facts, { kind: "msg", msg: "" }])}
          >
            + Факт
          </Button>
        </div>
        {tasks && tasks.length > 0 && (
          <div>
            <div className="section-label mb-1">Пов&apos;язані задачі</div>
            {tasks.map((t) => (
              <label key={t.id} className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={taskRefs.includes(t.id)}
                  onChange={(e) =>
                    setTaskRefs(
                      e.target.checked
                        ? [...taskRefs, t.id]
                        : taskRefs.filter((id) => id !== t.id)
                    )
                  }
                />
                {t.note.split("\n")[0]}
              </label>
            ))}
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" className="rounded-none" onClick={onCancel}>
            Скасувати
          </Button>
          <Button
            className="rounded-none"
            onClick={() => onConfirm({ note, facts, taskRefs })}
            disabled={!note}
          >
            Зберегти
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
