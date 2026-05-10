import { Shield, ShieldCheck, Mail, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserTableProps {
  users: any[];
}

export const UserTable = ({ users }: UserTableProps) => {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-quiz-border bg-quiz-bg/50">
            <th className="p-5 text-[10px] font-black uppercase tracking-widest text-quiz-text-muted">Usuário</th>
            <th className="p-5 text-[10px] font-black uppercase tracking-widest text-quiz-text-muted">Email</th>
            <th className="p-5 text-[10px] font-black uppercase tracking-widest text-quiz-text-muted">Status</th>
            <th className="p-5 text-[10px] font-black uppercase tracking-widest text-quiz-text-muted">Data de Ingresso</th>
            <th className="p-5 text-[10px] font-black uppercase tracking-widest text-quiz-text-muted">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-quiz-border/50 hover:bg-quiz-primary/5 transition-colors group">
              <td className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-quiz-surface border border-quiz-border flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-quiz-text-muted" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight text-quiz-text-main group-hover:text-quiz-primary transition-colors">
                      {user.name || "Sem Nome"}
                    </p>
                    {user.is_admin && (
                      <div className="flex items-center gap-1 text-[8px] font-bold text-quiz-primary uppercase tracking-widest mt-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Administrador
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="p-5">
                <div className="flex items-center gap-2 text-xs text-quiz-text-muted font-medium">
                  <Mail className="w-3.5 h-3.5 opacity-50" />
                  {user.email}
                </div>
              </td>
              <td className="p-5">
                <Badge variant="outline" className="bg-quiz-correct/10 text-quiz-correct border-quiz-correct/20 text-[9px] font-black uppercase tracking-widest">Ativo</Badge>
              </td>
              <td className="p-5">
                <div className="flex items-center gap-2 text-xs text-quiz-text-muted font-medium">
                  <Calendar className="w-3.5 h-3.5 opacity-50" />
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                </div>
              </td>
              <td className="p-5 text-right">
                 <button className="text-[10px] font-black uppercase tracking-widest text-quiz-text-muted hover:text-quiz-primary transition-colors">Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="p-20 text-center">
          <p className="text-sm font-bold text-quiz-text-muted uppercase tracking-widest">Nenhum usuário encontrado no sistema.</p>
        </div>
      )}
    </div>
  );
};
