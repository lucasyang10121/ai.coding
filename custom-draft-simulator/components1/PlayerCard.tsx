type PlayerCardProps = {
  fullName: string;
  position: string;
  team: string;
  projectedValue: number;
};

// This component shows a single NFL player in a card.
export default function PlayerCard({ fullName, position, team, projectedValue }: PlayerCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="font-semibold">{fullName}</h3>
      <p className="mt-2 text-sm text-slate-400">Position: {position}</p>
      <p className="mt-2 text-sm text-slate-400">Team: {team}</p>
      <p className="mt-2 text-sm text-slate-400">Projected Value: {projectedValue}</p>
    </div>
  );
}
