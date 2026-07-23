type LobbyCardProps = {
  name: string;
  inviteCode: string;
  status: string;
};

// This component shows one lobby in a simple card format.
export default function LobbyCard({ name, inviteCode, status }: LobbyCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="font-semibold">{name}</h3>
      <p className="mt-2 text-sm text-slate-400">Invite code: {inviteCode}</p>
      <p className="mt-2 text-sm text-slate-400">Status: {status}</p>
    </div>
  );
}
