import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Participant } from "@/lib/types";
import { useValdek } from "@/lib/store";

export function ParticipantDialog({
  open,
  onOpenChange,
  participant,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant?: Participant | null;
}) {
  const groups = useValdek((s) => s.groups);
  const addParticipant = useValdek((s) => s.addParticipant);
  const updateParticipant = useValdek((s) => s.updateParticipant);
  const addGroup = useValdek((s) => s.addGroup);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [fee, setFee] = useState("0");
  const [notes, setNotes] = useState("");
  const [newGroup, setNewGroup] = useState("");

  useEffect(() => {
    if (!open) return;
    setFirstName(participant?.firstName ?? "");
    setLastName(participant?.lastName ?? "");
    setGroupId(participant?.groupId ?? groups[0]?.id ?? "");
    setFee(String(participant?.monthlyFee ?? groups[0]?.defaultFee ?? 0));
    setNotes(participant?.notes ?? "");
    setNewGroup("");
  }, [open, participant, groups]);

  const save = () => {
    let gid = groupId;
    if (newGroup.trim()) {
      const group = groups.find((g) => g.id === gid);
      gid = addGroup(newGroup.trim(), Number(fee) || group?.defaultFee || 0);
    }
    const draft = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      groupId: gid,
      monthlyFee: Number(fee.replace(",", ".")) || 0,
      notes: notes.trim(),
      active: true,
    };
    if (!draft.firstName && !draft.lastName) return;
    if (participant) updateParticipant(participant.id, draft);
    else addParticipant(draft);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{participant ? "Edycja uczestnika" : "Nowy uczestnik"}</DialogTitle>
          <DialogDescription>
            Stawka może być inna niż w grupie — tu jest źródło prawdy przy rozliczeniu.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="first">Imię</Label>
              <Input id="first" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last">Nazwisko</Label>
              <Input id="last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Grupa</Label>
            <Select
              value={groupId}
              onValueChange={(id) => {
                setGroupId(id);
                const g = groups.find((x) => x.id === id);
                if (g && !participant) setFee(String(g.defaultFee));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz grupę" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Albo wpisz nową grupę"
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fee">Stawka miesięczna (zł)</Label>
            <Input id="fee" inputMode="decimal" value={fee} onChange={(e) => setFee(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Uwagi</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={save}>Zapisz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
