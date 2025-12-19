import Image from "next/image";

import { Card } from "@/components/ui/card";

const members = [
  { name: "Ever Burga" },
  { name: "Sergio Yupanqui" },
  { name: "Natalia Ballarta" },
  { name: "Claudia Ballarta" },
];

function MemberCard({ name }: { name: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border bg-card p-5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/20" />
      <div className="relative">
        <div className="grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-2xl bg-black/20 ring-1 ring-white/10">
          {/* Placeholder similar to the reference; you can replace with real photos later */}
          <Image
            src="/images (10).png"
            alt={name}
            width={96}
            height={96}
            className="opacity-90"
            unoptimized
          />
        </div>
        <div className="mt-4 rounded-2xl bg-background/90 p-4 ring-1 ring-black/5 dark:bg-black/30 dark:ring-white/10">
          <div className="text-lg font-semibold">{name}</div>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-xs font-medium text-muted-foreground">Team</div>
        <div className="mt-1 text-4xl font-semibold tracking-tight">Members</div>
      </div>

      <Card className="border-0 bg-transparent shadow-none">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {members.map((m) => (
            <MemberCard key={m.name} name={m.name} />
          ))}
        </div>
      </Card>
    </div>
  );
}


