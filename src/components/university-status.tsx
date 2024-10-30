export type UniversityStatus =
'active' | 'inactive' | 'canceled' | 'pending';

interface UniversityStatusProps {
  status: UniversityStatus
}

const universityStatusMap: Record<UniversityStatus, string> = {
  pending: 'Pendente',
  canceled: 'Cancelado',
  active: 'Ativo',
  inactive: 'Inativo',
}

export function UniversityStatus({ status }: UniversityStatusProps) {
  return (
    <div className="flex items-center gap-2">
      {status === 'inactive' && (
        <span className="h-2 w-2 rounded-full bg-slate-400" />
      )}
      {status === 'canceled' && (
        <span className="h-2 w-2 rounded-full bg-rose-500" />
      )}
      {status === 'active' && (
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
      )}
      {['processing', 'pending'].includes(status) && (
        <span className="h-2 w-2 rounded-full bg-amber-500" />
      )}

      <span className="font-medum text-muted-foreground">
        {universityStatusMap[status]}
      </span>
    </div>
  )}