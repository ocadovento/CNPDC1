import { useState, useEffect } from 'react';
import { supabase, Usuario } from '../lib/supabase';
import { UserPlus, Users, Trash2, Shield, FileText, Upload, X, Edit2, Key, Eye, Download, Link as LinkIcon, Code, Database, HardDrive, Plus, BarChart3 } from 'lucide-react';
import * as XLSX from 'xlsx';
import DelegacaoTab from '../components/DelegacaoTab';
import RelatorioCotas from './RelatorioCotas';

interface AdminDashboardProps {
  usuario: Usuario | null;
}

interface Document {
  id: string;
  title: string;
  file_name: string;
  file_url: string;
  description: string | null;
  category: string | null;
  file_type: 'pdf' | 'image' | 'video';
  upload_method: 'url' | 'upload';
  file_size: number | null;
  created_at: string;
}

interface DelegadoNato {
  id: string;
  nome_completo: string;
  cpf: string;
  email: string;
  contato_whatsapp: string;
  nome_mae: string;
  nome_ponto_cultura: string;
  cidade: string;
  estado_uf: string;
  gt_responsavel: 'GT' | 'Executiva';
  cota_representada: string | null;
  genero: string | null;
  tipo_delegado: 'nato';
  inscricao_completa: boolean;
  data_validacao: string | null;
  created_at: string;
  evento_id: string;
  representante_id: string;
}

type ActiveTab = 'usuarios' | 'documentos' | 'eventos' | 'delegacao' | 'delegados_natos' | 'relatorios' | 'backup';

export default function AdminDashboard({ usuario }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('usuarios');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome_completo: '',
    tipo_usuario: 'admin_auxiliar' as 'admin_auxiliar' | 'representante_gt',
    estado_uf: '',
  });
  const [estados, setEstados] = useState<{ uf: string; nome: string }[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docFormData, setDocFormData] = useState({
    title: '',
    description: '',
    category: '',
    file_name: '',
    file_url: '',
    file_type: 'pdf' as 'pdf' | 'image' | 'video',
    upload_method: 'url' as 'url' | 'upload',
    file: null as File | null,
  });
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({ userId: '', authUserId: '', email: '', newPassword: '' });
  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [editUserFormData, setEditUserFormData] = useState({ nome_completo: '', email: '', estado_uf: '' });

  const [eventos, setEventos] = useState<any[]>([]);
  const [eventoSelecionado, setEventoSelecionado] = useState<string>('');
  const [participantesValidados, setParticipantesValidados] = useState<any[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportUrl, setExportUrl] = useState('');
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupProgress, setBackupProgress] = useState('');

  const [showEventForm, setShowEventForm] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    tipo_evento: 'forum' as 'teia' | 'forum',
    data_evento: '',
    data_fim: '',
    cidade: '',
    estado_uf: '',
    temas: '',
    quantidade_pontos_estimada: 0,
  });
  const [todosEventos, setTodosEventos] = useState<any[]>([]);

  const [delegadosNatos, setDelegadosNatos] = useState<DelegadoNato[]>([]);
  const [showEditNatoModal, setShowEditNatoModal] = useState(false);
  const [editingNato, setEditingNato] = useState<DelegadoNato | null>(null);
  const [natoFormData, setNatoFormData] = useState({
    nome_completo: '',
    cpf: '',
    email: '',
    contato_whatsapp: '',
    nome_mae: '',
    nome_ponto_cultura: '',
    cidade: '',
    estado_uf: '',
    gt_responsavel: '',
    cota_representada: '',
    genero: '',
  });
  const [filtroGT, setFiltroGT] = useState<string>('todos');
  const [filtroEstadoNato, setFiltroEstadoNato] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [buscaNato, setBuscaNato] = useState<string>('');

  useEffect(() => {
    loadUsuarios();
    loadEstados();
    loadDocuments();
  }, []);

  useEffect(() => {
    if (activeTab === 'eventos') {
      loadTodosEventos();
    }
    if (activeTab === 'delegados_natos') {
      loadDelegadosNatos();
    }
  }, [activeTab]);

  const loadUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .in('tipo_usuario', ['admin_auxiliar', 'representante_gt'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsuarios(data || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEstados = async () => {
    try {
      const { data, error } = await supabase
        .from('estados_brasil')
        .select('uf, nome')
        .order('nome');

      if (error) throw error;
      setEstados(data || []);
    } catch (err) {
      console.error('Erro ao carregar estados:', err);
    }
  };

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Erro ao carregar documentos:', err);
    }
  };

  const loadTodosEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos_teias_foruns')
        .select('*')
        .order('data_evento', { ascending: false });

      if (error) throw error;
      setTodosEventos(data || []);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: userData } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) throw new Error('Usuário não encontrado');

      const { error: insertError } = await supabase
        .from('eventos_teias_foruns')
        .insert({
          representante_id: userData.id,
          tipo_evento: eventFormData.tipo_evento,
          data_evento: eventFormData.data_evento,
          data_fim: eventFormData.data_fim || null,
          cidade: eventFormData.cidade,
          estado_uf: eventFormData.estado_uf,
          temas: eventFormData.temas,
          quantidade_pontos_estimada: eventFormData.quantidade_pontos_estimada,
        });

      if (insertError) throw insertError;

      setSuccess('Evento criado com sucesso!');
      setShowEventForm(false);
      setEventFormData({
        tipo_evento: 'forum',
        data_evento: '',
        data_fim: '',
        cidade: '',
        estado_uf: '',
        temas: '',
        quantidade_pontos_estimada: 0,
      });
      loadTodosEventos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar evento');
    }
  };

  const handleDeleteEvent = async (eventoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento? Todos os dados relacionados serão perdidos.')) return;

    try {
      const { error } = await supabase
        .from('eventos_teias_foruns')
        .delete()
        .eq('id', eventoId);

      if (error) throw error;

      setSuccess('Evento excluído com sucesso!');
      loadTodosEventos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir evento');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('=== INICIANDO CRIAÇÃO DE USUÁRIO ===');
    console.log('Dados do formulário:', {
      email: formData.email,
      nome_completo: formData.nome_completo,
      tipo_usuario: formData.tipo_usuario,
      estado_uf: formData.estado_uf
    });

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.tipo_usuario === 'representante_gt' && !formData.estado_uf) {
      setError('Selecione um estado para o representante GT');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Sessão obtida:', { hasSession: !!session, userId: session?.user?.id });

      if (!session) {
        throw new Error('Você precisa estar autenticado');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-admin-user`;
      console.log('URL da API:', apiUrl);

      const requestBody = {
        email: formData.email,
        password: formData.password,
        nome_completo: formData.nome_completo,
        tipo_usuario: formData.tipo_usuario,
        estado_uf: formData.tipo_usuario === 'representante_gt' ? formData.estado_uf : undefined,
      };
      console.log('Enviando requisição:', requestBody);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Status da resposta:', response.status, response.statusText);

      const result = await response.json();
      console.log('Resposta da API:', result);

      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar usuário');
      }

      console.log('✓ Usuário criado com sucesso!');
      setSuccess('Usuário criado com sucesso!');
      setFormData({
        email: '',
        password: '',
        nome_completo: '',
        tipo_usuario: 'admin_auxiliar',
        estado_uf: '',
      });
      setShowAddForm(false);
      loadUsuarios();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('=== ERRO NA CRIAÇÃO ===');
      console.error('Tipo do erro:', err.constructor.name);
      console.error('Mensagem:', err.message);
      console.error('Stack:', err.stack);
      setError(err.message || 'Erro ao criar usuário');
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm('Deseja realmente desativar este usuário?')) return;

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ ativo: false })
        .eq('id', userId);

      if (error) throw error;

      setSuccess('Usuário desativado com sucesso!');
      loadUsuarios();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao desativar usuário');
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ ativo: true })
        .eq('id', userId);

      if (error) throw error;

      setSuccess('Usuário reativado com sucesso!');
      loadUsuarios();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao reativar usuário');
    }
  };

  const handleDeleteUserPermanently = async (userId: string, authUserId: string, email: string) => {
    const confirmMessage = `ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\nVocê está prestes a EXCLUIR PERMANENTEMENTE o usuário:\n${email}\n\nTodos os dados serão removidos do sistema.\n\nDigite "EXCLUIR" para confirmar:`;

    const userConfirmation = prompt(confirmMessage);

    if (userConfirmation !== 'EXCLUIR') {
      setError('Exclusão cancelada. Você deve digitar "EXCLUIR" para confirmar.');
      setTimeout(() => setError(''), 5000);
      return;
    }

    try {
      const { error: deleteUsuariosError } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId);

      if (deleteUsuariosError) throw deleteUsuariosError;

      const { error: deleteAuthError } = await supabase
        .from('auth.users')
        .delete()
        .eq('id', authUserId);

      if (deleteAuthError) {
        console.error('Erro ao excluir do auth.users:', deleteAuthError);
      }

      setSuccess(`Usuário ${email} excluído permanentemente!`);
      loadUsuarios();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir usuário permanentemente');
    }
  };

  const handleResetPassword = async (userId: string, authUserId: string, email: string) => {
    setResetPasswordData({ userId, authUserId, email, newPassword: '' });
    setShowResetPasswordForm(true);
    setError('');
    setSuccess('');
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (resetPasswordData.newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Você precisa estar autenticado');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-password`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: resetPasswordData.authUserId,
          newPassword: resetPasswordData.newPassword,
        }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setSuccess(`Senha de ${resetPasswordData.email} redefinida com sucesso!`);
      setShowResetPasswordForm(false);
      setResetPasswordData({ userId: '', authUserId: '', email: '', newPassword: '' });
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha');
    }
  };

  const handleEditUser = (user: Usuario) => {
    setEditingUser(user);
    setEditUserFormData({
      nome_completo: user.nome_completo,
      email: user.email,
      estado_uf: user.estado_uf || '',
    });
    setShowEditUserForm(true);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editingUser) return;

    try {
      console.log('=== INICIANDO ATUALIZAÇÃO ===');
      console.log('Admin logado:', usuario);
      console.log('ID do usuário a editar:', editingUser.id);
      console.log('Dados atuais:', {
        nome: editingUser.nome_completo,
        email: editingUser.email,
        estado: editingUser.estado_uf
      });
      console.log('Novos dados:', editUserFormData);

      // Verificar permissões do admin logado
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Auth user:', user?.id);

      const { data: adminData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_user_id', user?.id)
        .single();

      console.log('Dados do admin no banco:', adminData);

      const { data, error: updateError, status, statusText } = await supabase
        .from('usuarios')
        .update({
          nome_completo: editUserFormData.nome_completo.trim(),
          email: editUserFormData.email.trim(),
          estado_uf: editUserFormData.estado_uf || null,
        })
        .eq('id', editingUser.id)
        .select();

      console.log('=== RESULTADO DA ATUALIZAÇÃO ===');
      console.log('Status:', status, statusText);
      console.log('Data retornada:', data);
      console.log('Erro:', updateError);

      if (updateError) {
        console.error('Erro detectado:', updateError);
        throw updateError;
      }

      if (!data || data.length === 0) {
        console.error('Nenhum dado retornado - possível problema de permissão RLS');
        throw new Error('Não foi possível atualizar o usuário. Verifique as permissões.');
      }

      console.log('=== ATUALIZAÇÃO BEM SUCEDIDA ===');
      console.log('Dados atualizados:', data[0]);

      setSuccess('Usuário atualizado com sucesso!');
      setShowEditUserForm(false);
      setEditingUser(null);

      console.log('Recarregando lista de usuários...');
      await loadUsuarios();
      console.log('Lista recarregada!');

      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      console.error('=== ERRO NA ATUALIZAÇÃO ===', err);
      setError(err.message || 'Erro ao atualizar usuário');
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (docFormData.upload_method === 'url') {
      if (!docFormData.file_url.trim()) {
        setError('Insira a URL do documento');
        return;
      }
      if (!docFormData.file_name.trim()) {
        setError('Insira o nome do arquivo');
        return;
      }
    } else {
      if (!editingDoc && !docFormData.file) {
        setError('Selecione um arquivo');
        return;
      }
    }

    setUploadingDoc(true);

    try {
      let fileUrl = docFormData.file_url;
      let fileName = docFormData.file_name;
      let fileSize = null;

      if (docFormData.upload_method === 'upload' && docFormData.file) {
        const file = docFormData.file;
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (file.size > maxSize) {
          setError('Arquivo muito grande. Tamanho máximo: 10MB');
          setUploadingDoc(false);
          return;
        }

        const fileExt = file.name.split('.').pop();
        fileName = file.name;
        const filePath = `documents/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('public-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('public-files')
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
        fileSize = file.size;
      }

      if (editingDoc) {
        const { error: updateError } = await supabase
          .from('documents')
          .update({
            title: docFormData.title,
            file_name: fileName,
            file_url: fileUrl,
            description: docFormData.description || null,
            category: docFormData.category || null,
            file_type: docFormData.file_type,
            upload_method: docFormData.upload_method,
            file_size: fileSize,
          })
          .eq('id', editingDoc.id);

        if (updateError) throw updateError;

        setSuccess('Documento atualizado com sucesso!');
      } else {
        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            title: docFormData.title,
            file_name: fileName,
            file_url: fileUrl,
            description: docFormData.description || null,
            category: docFormData.category || null,
            file_type: docFormData.file_type,
            upload_method: docFormData.upload_method,
            file_size: fileSize,
            created_by: (await supabase.auth.getUser()).data.user?.id,
          });

        if (dbError) throw dbError;

        setSuccess('Documento adicionado com sucesso!');
      }

      setDocFormData({
        title: '',
        description: '',
        category: '',
        file_name: '',
        file_url: '',
        file_type: 'pdf',
        upload_method: 'url',
        file: null
      });
      setShowDocumentForm(false);
      setEditingDoc(null);
      loadDocuments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar documento');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleEditDocument = (doc: Document) => {
    setEditingDoc(doc);
    setDocFormData({
      title: doc.title,
      description: doc.description || '',
      category: doc.category || '',
      file_name: doc.file_name,
      file_url: doc.file_url,
      file_type: doc.file_type,
      upload_method: doc.upload_method,
      file: null,
    });
    setShowDocumentForm(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingDoc(null);
    setDocFormData({
      title: '',
      description: '',
      category: '',
      file_name: '',
      file_url: '',
      file_type: 'pdf',
      upload_method: 'url',
      file: null
    });
    setShowDocumentForm(false);
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Deseja realmente excluir este documento?')) return;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      setSuccess('Documento excluído com sucesso!');
      loadDocuments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir documento');
    }
  };

  const loadEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos_teias_foruns')
        .select('*')
        .order('data_evento', { ascending: false });

      if (error) throw error;
      setEventos(data || []);
      if (data && data.length > 0) {
        setEventoSelecionado(data[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
    }
  };

  const loadParticipantesValidados = async (eventoId: string) => {
    try {
      const { data: delegados, error } = await supabase
        .from('delegacao_estado')
        .select('*')
        .eq('evento_id', eventoId);

      if (error) throw error;

      const delegadosCompletos = await Promise.all(
        (delegados || []).map(async (delegado) => {
          const { data: inscricao } = await supabase
            .from('inscricoes_membros')
            .select('*')
            .eq('delegacao_id', delegado.id)
            .maybeSingle();

          return {
            ...(inscricao || {}),
            id: delegado.id,
            delegacao_id: delegado.id,
            nome_completo: inscricao?.nome_completo || delegado.nome_completo,
            cpf: inscricao?.cpf || delegado.cpf,
            email: inscricao?.email || delegado.email,
            celular: inscricao?.celular || delegado.contato_whatsapp,
            nome_ponto_cultura: inscricao?.nome_ponto_cultura || delegado.nome_ponto_cultura,
            cidade_ponto: inscricao?.cidade_ponto || delegado.cidade,
            uf_ponto: inscricao?.uf_ponto || delegado.estado_uf,
            estado_forum: delegado.estado_uf,
            tipo_delegado: delegado.tipo_delegado,
            gt_responsavel: delegado.gt_responsavel,
            inscricao_completa: delegado.inscricao_completa,
            nome_cracha: inscricao?.nome_cracha || inscricao?.nome_social || inscricao?.nome_completo || delegado.nome_completo,
          };
        })
      );

      setParticipantesValidados(delegadosCompletos);
    } catch (err) {
      console.error('Erro ao carregar participantes:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'delegacao') {
      loadEventos();
    }
  }, [activeTab]);

  useEffect(() => {
    if (eventoSelecionado) {
      loadParticipantesValidados(eventoSelecionado);
    }
  }, [eventoSelecionado]);

  const gerarDadosExportacaoEleitos = () => {
    const eleitos = participantesValidados.filter((inscricao: any) => inscricao.tipo_delegado === 'eleito');
    return eleitos.map((inscricao: any) => ({
      'Status': inscricao.inscricao_completa ? 'Validado' : 'Aguardando Validação',
      'CPF': inscricao.cpf || '',
      'Passaporte': inscricao.passaporte || '',
      'Nome Completo': inscricao.nome_completo,
      'Nome Social': inscricao.nome_social || '',
      'Nome no Crachá': inscricao.nome_cracha,
      'Email': inscricao.email,
      'Celular': inscricao.celular,
      'Faixa Etária': inscricao.faixa_etaria || '',
      'Nacionalidade': inscricao.nacionalidade || '',
      'Raça/Cor/Etnia': inscricao.raca_cor_etnia || '',
      'Gênero': inscricao.genero || '',
      'Orientação Sexual': inscricao.orientacao_sexual || '',
      'Cotas Desejadas': (inscricao.cota_desejada || []).join(', '),
      'Escolaridade': inscricao.escolaridade || '',
      'Comunidade Tradicional': inscricao.comunidade_tradicional ? 'Sim' : 'Não',
      'Comunidades Tradicionais': (inscricao.comunidades_tradicionais || []).join(', '),
      'Comunidade Tradicional (Outra)': inscricao.comunidade_tradicional_outra || '',
      'Logradouro': `${inscricao.logradouro_tipo || ''} ${inscricao.logradouro_nome || ''}`,
      'Número': inscricao.numero || '',
      'Complemento': inscricao.complemento || '',
      'Bairro': `${inscricao.bairro_tipo || ''} ${inscricao.bairro_nome || ''}`,
      'Cidade': inscricao.cidade || '',
      'Estado/UF': inscricao.estado_uf || '',
      'CEP': inscricao.cep || '',
      'Renda Pessoal': inscricao.renda_pessoal || '',
      'Pessoa com Deficiência': (inscricao.pessoa_com_deficiencia || []).join(', '),
      'Medida de Acessibilidade': inscricao.medida_acessibilidade || '',
      'Nome Ponto de Cultura': inscricao.nome_ponto_cultura,
      'Link Mapa Cultura Viva': inscricao.link_mapa_cultura_viva || '',
      'Documento Certificação': inscricao.documento_certificacao || '',
      'Tem ID no Mapa': inscricao.tem_id_mapa ? 'Sim' : 'Não',
      'ID Mapa (Arquivo)': inscricao.id_mapa_arquivo_url || '',
      'UF do Ponto': inscricao.uf_ponto,
      'Cidade do Ponto': inscricao.cidade_ponto,
      'Estado Fórum': inscricao.estado_forum || inscricao.uf_ponto,
      'Ações Estruturantes': (inscricao.acoes_estruturantes || []).join(', '),
      'Área de Atuação Principal': (inscricao.area_atuacao_principal || []).join(', '),
      'Como Participa da Rede': inscricao.como_participa_rede || '',
      'GT Temático Escolhido': (inscricao.gt_tematico_escolhido || []).join(', '),
      'Tipo de Acomodação': inscricao.tipo_acomodacao || '',
      'Restrição Alimentar': inscricao.restricao_alimentar ? 'Sim' : 'Não',
      'Descrição da Restrição': inscricao.descricao_restricao || '',
      'Aceita Compartilhar Dados': inscricao.aceita_compartilhar_dados ? 'Sim' : 'Não',
      'Aceita Contato por Email': inscricao.aceita_email ? 'Sim' : 'Não',
      'Aceita Contato por Telefone': inscricao.aceita_telefone ? 'Sim' : 'Não',
      'Autoriza Uso de Imagem': inscricao.autoriza_uso_imagem ? 'Sim' : 'Não',
    }));
  };

  const gerarDadosExportacaoNatos = () => {
    const natos = participantesValidados.filter((inscricao: any) => inscricao.tipo_delegado === 'nato');
    return natos.map((inscricao: any) => ({
      'Status': inscricao.inscricao_completa ? 'Validado' : 'Aguardando Validação',
      'CPF': inscricao.cpf || '',
      'Passaporte': inscricao.passaporte || '',
      'Nome Completo': inscricao.nome_completo,
      'Nome Social': inscricao.nome_social || '',
      'Nome no Crachá': inscricao.nome_cracha,
      'Email': inscricao.email,
      'Celular': inscricao.celular,
      'GT Responsável': inscricao.gt_responsavel || '',
      'Faixa Etária': inscricao.faixa_etaria || '',
      'Nacionalidade': inscricao.nacionalidade || '',
      'Raça/Cor/Etnia': inscricao.raca_cor_etnia || '',
      'Gênero': inscricao.genero || '',
      'Orientação Sexual': inscricao.orientacao_sexual || '',
      'Cotas Desejadas': (inscricao.cota_desejada || []).join(', '),
      'Escolaridade': inscricao.escolaridade || '',
      'Comunidade Tradicional': inscricao.comunidade_tradicional ? 'Sim' : 'Não',
      'Comunidades Tradicionais': (inscricao.comunidades_tradicionais || []).join(', '),
      'Comunidade Tradicional (Outra)': inscricao.comunidade_tradicional_outra || '',
      'Logradouro': `${inscricao.logradouro_tipo || ''} ${inscricao.logradouro_nome || ''}`,
      'Número': inscricao.numero || '',
      'Complemento': inscricao.complemento || '',
      'Bairro': `${inscricao.bairro_tipo || ''} ${inscricao.bairro_nome || ''}`,
      'Cidade': inscricao.cidade || '',
      'Estado/UF': inscricao.estado_uf || '',
      'CEP': inscricao.cep || '',
      'Renda Pessoal': inscricao.renda_pessoal || '',
      'Pessoa com Deficiência': (inscricao.pessoa_com_deficiencia || []).join(', '),
      'Medida de Acessibilidade': inscricao.medida_acessibilidade || '',
      'Nome Ponto de Cultura': inscricao.nome_ponto_cultura,
      'Link Mapa Cultura Viva': inscricao.link_mapa_cultura_viva || '',
      'Documento Certificação': inscricao.documento_certificacao || '',
      'Tem ID no Mapa': inscricao.tem_id_mapa ? 'Sim' : 'Não',
      'ID Mapa (Arquivo)': inscricao.id_mapa_arquivo_url || '',
      'UF do Ponto': inscricao.uf_ponto,
      'Cidade do Ponto': inscricao.cidade_ponto,
      'Estado Fórum': inscricao.estado_forum || inscricao.uf_ponto,
      'Ações Estruturantes': (inscricao.acoes_estruturantes || []).join(', '),
      'Área de Atuação Principal': (inscricao.area_atuacao_principal || []).join(', '),
      'Como Participa da Rede': inscricao.como_participa_rede || '',
      'GT Temático Escolhido': (inscricao.gt_tematico_escolhido || []).join(', '),
      'Tipo de Acomodação': inscricao.tipo_acomodacao || '',
      'Restrição Alimentar': inscricao.restricao_alimentar ? 'Sim' : 'Não',
      'Descrição da Restrição': inscricao.descricao_restricao || '',
      'Aceita Compartilhar Dados': inscricao.aceita_compartilhar_dados ? 'Sim' : 'Não',
      'Aceita Contato por Email': inscricao.aceita_email ? 'Sim' : 'Não',
      'Aceita Contato por Telefone': inscricao.aceita_telefone ? 'Sim' : 'Não',
      'Autoriza Uso de Imagem': inscricao.autoriza_uso_imagem ? 'Sim' : 'Não',
    }));
  };

  const exportarExcelEleitos = () => {
    const dadosExportacao = gerarDadosExportacaoEleitos();
    if (dadosExportacao.length === 0) {
      setError('Nenhum delegado eleito encontrado.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(dadosExportacao);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Delegados Eleitos');

    const eventoInfo = eventos.find(e => e.id === eventoSelecionado);
    const nomeArquivo = `Delegados_Eleitos_${eventoInfo?.cidade || 'Evento'}_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(workbook, nomeArquivo);
    setSuccess(`Arquivo ${nomeArquivo} baixado com sucesso! (${dadosExportacao.length} eleitos)`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const exportarExcelNatos = () => {
    const dadosExportacao = gerarDadosExportacaoNatos();
    if (dadosExportacao.length === 0) {
      setError('Nenhum delegado nato encontrado.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(dadosExportacao);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Delegados Natos');

    const eventoInfo = eventos.find(e => e.id === eventoSelecionado);
    const nomeArquivo = `Delegados_Natos_${eventoInfo?.cidade || 'Evento'}_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(workbook, nomeArquivo);
    setSuccess(`Arquivo ${nomeArquivo} baixado com sucesso! (${dadosExportacao.length} natos)`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const exportarAmbosExcel = () => {
    const dadosEleitos = gerarDadosExportacaoEleitos();
    const dadosNatos = gerarDadosExportacaoNatos();

    const workbook = XLSX.utils.book_new();

    if (dadosEleitos.length > 0) {
      const worksheetEleitos = XLSX.utils.json_to_sheet(dadosEleitos);
      XLSX.utils.book_append_sheet(workbook, worksheetEleitos, 'Delegados Eleitos');
    }

    if (dadosNatos.length > 0) {
      const worksheetNatos = XLSX.utils.json_to_sheet(dadosNatos);
      XLSX.utils.book_append_sheet(workbook, worksheetNatos, 'Delegados Natos');
    }

    const eventoInfo = eventos.find(e => e.id === eventoSelecionado);
    const nomeArquivo = `Delegacao_Completa_${eventoInfo?.cidade || 'Evento'}_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(workbook, nomeArquivo);
    setSuccess(`Arquivo ${nomeArquivo} baixado com sucesso! (${dadosEleitos.length} eleitos + ${dadosNatos.length} natos)`);
    setTimeout(() => setSuccess(''), 3000);
  };


  const gerarUrlExportacao = () => {
    const eventoInfo = eventos.find(e => e.id === eventoSelecionado);
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/participantes-teia-2026?evento=${eventoSelecionado}`;
    setExportUrl(url);
    setShowExportModal(true);
  };

  const copiarUrl = () => {
    navigator.clipboard.writeText(exportUrl);
    setSuccess('URL copiada para a área de transferência!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const copiarCodigoIncorporacao = () => {
    const codigo = `<iframe src="${exportUrl}" width="100%" height="600" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(codigo);
    setSuccess('Código de incorporação copiado!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const loadDelegadosNatos = async () => {
    try {
      const { data: eventoData } = await supabase
        .from('eventos_teias_foruns')
        .select('id')
        .eq('tipo_evento', 'teia')
        .eq('cidade', 'Aracruz')
        .eq('estado_uf', 'ES')
        .maybeSingle();

      if (!eventoData) {
        console.error('Evento Teia Nacional 2026 não encontrado');
        return;
      }

      const { data, error } = await supabase
        .from('delegacao_estado')
        .select('*')
        .eq('tipo_delegado', 'nato')
        .eq('evento_id', eventoData.id)
        .order('gt_responsavel')
        .order('estado_uf')
        .order('nome_completo');

      if (error) throw error;

      setDelegadosNatos(data || []);
    } catch (err) {
      console.error('Erro ao carregar delegados natos:', err);
      setError('Erro ao carregar delegados natos');
      setTimeout(() => setError(''), 3000);
    }
  };

  const filtrarDelegadosNatos = () => {
    return delegadosNatos.filter((nato) => {
      const matchGT = filtroGT === 'todos' || nato.gt_responsavel === filtroGT;
      const matchEstado = filtroEstadoNato === 'todos' || nato.estado_uf === filtroEstadoNato;
      const matchStatus =
        filtroStatus === 'todos' ||
        (filtroStatus === 'validado' && nato.inscricao_completa) ||
        (filtroStatus === 'aguardando' && !nato.inscricao_completa);
      const matchBusca =
        buscaNato === '' ||
        nato.nome_completo.toLowerCase().includes(buscaNato.toLowerCase()) ||
        nato.cpf.includes(buscaNato);

      return matchGT && matchEstado && matchStatus && matchBusca;
    });
  };

  const handleEditNato = (nato: DelegadoNato) => {
    setEditingNato(nato);
    setNatoFormData({
      nome_completo: nato.nome_completo,
      cpf: nato.cpf,
      email: nato.email,
      contato_whatsapp: nato.contato_whatsapp,
      nome_mae: nato.nome_mae,
      nome_ponto_cultura: nato.nome_ponto_cultura,
      cidade: nato.cidade,
      estado_uf: nato.estado_uf,
      gt_responsavel: nato.gt_responsavel,
      cota_representada: nato.cota_representada || '',
      genero: nato.genero || '',
    });
    setShowEditNatoModal(true);
  };

  const handleSaveNato = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editingNato) return;

    if (!natoFormData.nome_completo || !natoFormData.cpf || !natoFormData.email ||
        !natoFormData.contato_whatsapp || !natoFormData.nome_mae ||
        !natoFormData.nome_ponto_cultura || !natoFormData.cidade ||
        !natoFormData.estado_uf || !natoFormData.gt_responsavel) {
      setError('Preencha todos os campos obrigatórios');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(natoFormData.email)) {
      setError('Email inválido');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const { error } = await supabase
        .from('delegacao_estado')
        .update({
          nome_completo: natoFormData.nome_completo,
          cpf: natoFormData.cpf,
          email: natoFormData.email,
          contato_whatsapp: natoFormData.contato_whatsapp,
          nome_mae: natoFormData.nome_mae,
          nome_ponto_cultura: natoFormData.nome_ponto_cultura,
          cidade: natoFormData.cidade,
          estado_uf: natoFormData.estado_uf,
          gt_responsavel: natoFormData.gt_responsavel,
          cota_representada: natoFormData.cota_representada || null,
          genero: natoFormData.genero || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingNato.id);

      if (error) throw error;

      setSuccess('Delegado nato atualizado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      setShowEditNatoModal(false);
      setEditingNato(null);
      loadDelegadosNatos();
    } catch (err: any) {
      console.error('Erro ao atualizar delegado nato:', err);
      setError(`Erro ao atualizar: ${err.message}`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteNato = async (natoId: string, nomeCompleto: string) => {
    if (!confirm(`Tem certeza que deseja excluir o delegado ${nomeCompleto}? Esta ação é irreversível.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('delegacao_estado')
        .delete()
        .eq('id', natoId);

      if (error) throw error;

      setSuccess('Delegado nato excluído com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      loadDelegadosNatos();
    } catch (err: any) {
      console.error('Erro ao excluir delegado nato:', err);
      setError(`Erro ao excluir: ${err.message}`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const exportDelegadosNatosExcel = () => {
    const natosParaExportar = delegadosNatos.map((nato) => ({
      'Nome Completo': nato.nome_completo,
      'GT/Executiva': nato.gt_responsavel,
      'Estado/UF': nato.estado_uf,
      'Telefone/WhatsApp': nato.contato_whatsapp,
    }));

    const worksheet = XLSX.utils.json_to_sheet(natosParaExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Delegados Natos');

    const nomeArquivo = `Delegados_Natos_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(workbook, nomeArquivo);
    setSuccess(`Arquivo exportado com sucesso! (${natosParaExportar.length} delegados)`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const fazerBackupCompleto = async () => {
    setBackupLoading(true);
    setBackupProgress('Iniciando backup...');
    setError('');

    try {
      const backupData: any = {
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0',
          backup_by: usuario?.email || 'unknown',
        },
        data: {}
      };

      setBackupProgress('Exportando usuários...');
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('usuarios')
        .select('*');
      if (usuariosError) throw usuariosError;
      backupData.data.usuarios = usuariosData;

      setBackupProgress('Exportando eventos...');
      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos_teias_foruns')
        .select('*');
      if (eventosError) throw eventosError;
      backupData.data.eventos = eventosData;

      setBackupProgress('Exportando delegação...');
      const { data: delegacaoData, error: delegacaoError } = await supabase
        .from('delegacao_estado')
        .select('*');
      if (delegacaoError) throw delegacaoError;
      backupData.data.delegacao = delegacaoData;

      setBackupProgress('Exportando inscrições...');
      const { data: inscricoesData, error: inscricoesError } = await supabase
        .from('inscricoes_membros')
        .select('*');
      if (inscricoesError) throw inscricoesError;
      backupData.data.inscricoes = inscricoesData;

      setBackupProgress('Exportando documentos...');
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*');
      if (documentsError) throw documentsError;
      backupData.data.documents = documentsData;

      setBackupProgress('Exportando estados...');
      const { data: estadosData, error: estadosError } = await supabase
        .from('estados_brasil')
        .select('*');
      if (estadosError) throw estadosError;
      backupData.data.estados = estadosData;

      setBackupProgress('Gerando arquivo...');
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_supabase_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setBackupProgress('');
      setSuccess(`✅ Backup realizado com sucesso! ${Object.keys(backupData.data).length} tabelas exportadas.`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      console.error('Erro ao fazer backup:', err);
      setError(`Erro ao fazer backup: ${err.message}`);
      setBackupProgress('');
    } finally {
      setBackupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const auxiliares = usuarios.filter(u => u.tipo_usuario === 'admin_auxiliar');
  const representantes = usuarios.filter(u => u.tipo_usuario === 'representante_gt');

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Painel Administrativo</h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo, <span className="font-semibold">{usuario?.nome_completo}</span>
          </p>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'usuarios'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={20} />
                <span>Usuários</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('documentos')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'documentos'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText size={20} />
                <span>Documentos</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('eventos')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'eventos'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText size={20} />
                <span>Eventos</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('delegacao')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'delegacao'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield size={20} />
                <span>Delegação Teia 2026</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('delegados_natos')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'delegados_natos'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={20} />
                <span>Delegados Natos</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('relatorios')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'relatorios'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 size={20} />
                <span>Relatórios</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'backup'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Database size={20} />
                <span>Backup</span>
              </div>
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          {activeTab === 'usuarios' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all"
            >
              <UserPlus size={20} />
              <span>Adicionar Usuário</span>
            </button>
          )}
          {activeTab === 'documentos' && (
            <button
              onClick={() => setShowDocumentForm(!showDocumentForm)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              <Upload size={20} />
              <span>Adicionar Documento</span>
            </button>
          )}
          {activeTab === 'eventos' && (
            <button
              onClick={() => setShowEventForm(!showEventForm)}
              className="flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all"
            >
              <Plus size={20} />
              <span>Adicionar Evento</span>
            </button>
          )}
          {activeTab === 'delegacao' && <div></div>}
          {activeTab === 'delegados_natos' && (
            <button
              onClick={exportDelegadosNatosExcel}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all"
            >
              <Download size={20} />
              <span>Exportar Excel</span>
            </button>
          )}
          {activeTab === 'backup' && <div></div>}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {showEditUserForm && (
          <div className="bg-blue-50 rounded-lg p-6 mb-6 border-2 border-blue-300">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Editar Usuário</h3>
            <p className="text-sm text-gray-700 mb-4">
              Usuário: <span className="font-semibold">{editingUser?.email}</span>
            </p>
            <form onSubmit={handleSaveEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={editUserFormData.nome_completo}
                  onChange={(e) => setEditUserFormData({ ...editUserFormData, nome_completo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editUserFormData.email}
                  onChange={(e) => setEditUserFormData({ ...editUserFormData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {editingUser?.tipo_usuario === 'representante_gt' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado (UF)
                  </label>
                  <select
                    value={editUserFormData.estado_uf}
                    onChange={(e) => setEditUserFormData({ ...editUserFormData, estado_uf: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione o Estado</option>
                    {estados.map((estado) => (
                      <option key={estado.uf} value={estado.uf}>
                        {estado.nome} ({estado.uf})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Salvar Alterações
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUserForm(false);
                    setEditingUser(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {showResetPasswordForm && (
          <div className="bg-yellow-50 rounded-lg p-6 mb-6 border-2 border-yellow-300">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Redefinir Senha</h3>
            <p className="text-sm text-gray-700 mb-4">
              Usuário: <span className="font-semibold">{resetPasswordData.email}</span>
            </p>
            <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={resetPasswordData.newPassword}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Confirmar Nova Senha
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPasswordForm(false);
                    setResetPasswordData({ userId: '', authUserId: '', email: '', newPassword: '' });
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {showDocumentForm && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingDoc ? 'Editar Documento' : 'Adicionar Novo Documento'}
            </h3>
            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Documento
                </label>
                <input
                  type="text"
                  value={docFormData.title}
                  onChange={(e) => setDocFormData({ ...docFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={docFormData.description}
                  onChange={(e) => setDocFormData({ ...docFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria (opcional)
                </label>
                <input
                  type="text"
                  value={docFormData.category}
                  onChange={(e) => setDocFormData({ ...docFormData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Regimento, Formulário, Passo a Passo"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Arquivo
                  </label>
                  <select
                    value={docFormData.file_type}
                    onChange={(e) => setDocFormData({ ...docFormData, file_type: e.target.value as 'pdf' | 'image' | 'video' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pdf">PDF</option>
                    <option value="image">Imagem (PNG/JPG)</option>
                    <option value="video">Vídeo (YouTube)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Envio
                  </label>
                  <select
                    value={docFormData.upload_method}
                    onChange={(e) => setDocFormData({ ...docFormData, upload_method: e.target.value as 'url' | 'upload' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="url">Link/URL</option>
                    <option value="upload">Upload de Arquivo</option>
                  </select>
                </div>
              </div>

              {docFormData.upload_method === 'url' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Arquivo
                    </label>
                    <input
                      type="text"
                      value={docFormData.file_name}
                      onChange={(e) => setDocFormData({ ...docFormData, file_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Regimento_Interno.pdf"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL do Documento
                    </label>
                    <input
                      type="url"
                      value={docFormData.file_url}
                      onChange={(e) => setDocFormData({ ...docFormData, file_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={
                        docFormData.file_type === 'video'
                          ? 'https://www.youtube.com/watch?v=...'
                          : 'https://drive.google.com/file/d/...'
                      }
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {docFormData.file_type === 'video'
                        ? 'Cole o link do vídeo do YouTube'
                        : 'Cole o link público do Google Drive, Dropbox ou outro serviço'}
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecionar Arquivo (máx. 10MB)
                  </label>
                  <input
                    type="file"
                    accept={
                      docFormData.file_type === 'pdf'
                        ? '.pdf'
                        : docFormData.file_type === 'image'
                        ? '.png,.jpg,.jpeg'
                        : '*'
                    }
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setDocFormData({
                        ...docFormData,
                        file,
                        file_name: file ? file.name : ''
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required={!editingDoc}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {docFormData.file_type === 'pdf' && 'Apenas arquivos PDF'}
                    {docFormData.file_type === 'image' && 'Apenas imagens PNG ou JPG'}
                  </p>
                  {editingDoc && (
                    <p className="text-sm text-gray-600 mt-1">
                      Arquivo atual: {editingDoc.file_name}
                    </p>
                  )}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={uploadingDoc}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploadingDoc ? (editingDoc ? 'Atualizando...' : 'Adicionando...') : (editingDoc ? 'Atualizar Documento' : 'Adicionar Documento')}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {showEventForm && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Adicionar Novo Evento</h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Evento *
                  </label>
                  <select
                    value={eventFormData.tipo_evento}
                    onChange={(e) => setEventFormData({ ...eventFormData, tipo_evento: e.target.value as 'teia' | 'forum' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="forum">Fórum Estadual</option>
                    <option value="teia">Teia Nacional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado (UF) *
                  </label>
                  <select
                    value={eventFormData.estado_uf}
                    onChange={(e) => setEventFormData({ ...eventFormData, estado_uf: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="">Selecione o Estado</option>
                    {estados.map((estado) => (
                      <option key={estado.uf} value={estado.uf}>
                        {estado.nome} ({estado.uf})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Para eventos da CNPDC, selecione ES (Espírito Santo)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={eventFormData.cidade}
                    onChange={(e) => setEventFormData({ ...eventFormData, cidade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Ex: São Paulo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade Estimada de Pontos
                  </label>
                  <input
                    type="number"
                    value={eventFormData.quantidade_pontos_estimada}
                    onChange={(e) => setEventFormData({ ...eventFormData, quantidade_pontos_estimada: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data do Evento *
                  </label>
                  <input
                    type="date"
                    value={eventFormData.data_evento}
                    onChange={(e) => setEventFormData({ ...eventFormData, data_evento: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Fim (opcional)
                  </label>
                  <input
                    type="date"
                    value={eventFormData.data_fim}
                    onChange={(e) => setEventFormData({ ...eventFormData, data_fim: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temas *
                </label>
                <textarea
                  value={eventFormData.temas}
                  onChange={(e) => setEventFormData({ ...eventFormData, temas: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  rows={3}
                  placeholder="Descreva os temas que serão abordados no evento"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Criar Evento
                </button>
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'eventos' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="w-8 h-8 text-teal-600" />
              <h2 className="text-2xl font-bold text-gray-800">Eventos Cadastrados</h2>
            </div>

            {todosEventos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum evento cadastrado</p>
            ) : (
              <div className="space-y-3">
                {todosEventos.map((evento) => (
                  <div
                    key={evento.id}
                    className="p-4 rounded-lg border-2 border-teal-200 bg-teal-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {evento.tipo_evento === 'teia' ? '🌐 Teia Nacional' : '🏛️ Fórum Estadual'}
                          </h3>
                          <span className="inline-block text-xs bg-teal-200 text-teal-800 px-2 py-1 rounded font-medium">
                            {evento.estado_uf}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          <strong>Local:</strong> {evento.cidade}/{evento.estado_uf}
                        </p>
                        <p className="text-sm text-gray-700 mb-1">
                          <strong>Data:</strong> {new Date(evento.data_evento).toLocaleDateString('pt-BR')}
                          {evento.data_fim && ` até ${new Date(evento.data_fim).toLocaleDateString('pt-BR')}`}
                        </p>
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Temas:</strong> {evento.temas}
                        </p>
                        <p className="text-xs text-gray-600">
                          Pontos estimados: {evento.quantidade_pontos_estimada || 0}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleDeleteEvent(evento.id)}
                          className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-sm"
                          title="Excluir evento"
                        >
                          <X size={16} />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'delegacao' && (
          <>
            <DelegacaoTab
              eventos={eventos}
              eventoSelecionado={eventoSelecionado}
              setEventoSelecionado={setEventoSelecionado}
              participantesValidados={participantesValidados}
              onExportEleitos={exportarExcelEleitos}
              onExportNatos={exportarExcelNatos}
              onExportAmbos={exportarAmbosExcel}
              onGerarUrl={gerarUrlExportacao}
              setSuccess={setSuccess}
              setError={setError}
            />

            {showExportModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
                  <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-800">Link de Compartilhamento</h3>
                    <button
                      onClick={() => setShowExportModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL de Compartilhamento</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={exportUrl}
                          readOnly
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                        <button
                          onClick={copiarUrl}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <LinkIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Compartilhe este link para que outros possam visualizar os dados.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Código de Incorporação</label>
                      <div className="flex gap-2">
                        <textarea
                          value={`<iframe src="${exportUrl}" width="100%" height="600" frameborder="0"></iframe>`}
                          readOnly
                          rows={3}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                        />
                        <button
                          onClick={copiarCodigoIncorporacao}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Code className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Use este código HTML para incorporar a lista em seu site.</p>
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <button
                      onClick={() => setShowExportModal(false)}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'usuarios' && showAddForm && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Adicionar Novo Usuário</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={formData.nome_completo}
                    onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Usuário
                  </label>
                  <select
                    value={formData.tipo_usuario}
                    onChange={(e) => setFormData({ ...formData, tipo_usuario: e.target.value as 'admin_auxiliar' | 'representante_gt' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="admin_auxiliar">Admin Auxiliar</option>
                    <option value="representante_gt">Representante GT Estadual</option>
                  </select>
                </div>

                {formData.tipo_usuario === 'representante_gt' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={formData.estado_uf}
                      onChange={(e) => setFormData({ ...formData, estado_uf: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Selecione um estado</option>
                      {estados.map(estado => (
                        <option key={estado.uf} value={estado.uf}>
                          {estado.nome} ({estado.uf})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Criar Usuário
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {activeTab === 'usuarios' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-800">Administradores Auxiliares</h2>
          </div>

          {auxiliares.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum auxiliar cadastrado</p>
          ) : (
            <div className="space-y-3">
              {auxiliares.map((aux) => (
                <div
                  key={aux.id}
                  className={`p-4 rounded-lg border-2 ${
                    aux.ativo ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{aux.nome_completo}</h3>
                      <p className="text-sm text-gray-600">{aux.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {aux.ativo ? 'Ativo' : 'Desativado'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(aux)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleResetPassword(aux.id, aux.auth_user_id, aux.email)}
                        className="text-yellow-600 hover:text-yellow-800 transition-colors"
                        title="Redefinir Senha"
                      >
                        <Key size={18} />
                      </button>
                      {aux.ativo ? (
                        <button
                          onClick={() => handleDeactivateUser(aux.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Desativar"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleActivateUser(aux.id)}
                            className="text-green-600 hover:text-green-800 transition-colors text-sm"
                          >
                            Reativar
                          </button>
                          {usuario?.tipo_usuario === 'admin_geral' && (
                            <button
                              onClick={() => handleDeleteUserPermanently(aux.id, aux.auth_user_id, aux.email)}
                              className="bg-red-700 text-white px-2 py-1 rounded hover:bg-red-900 transition-colors text-xs font-bold"
                              title="Excluir Permanentemente"
                            >
                              Excluir Perm.
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Users className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Representantes GT Estaduais</h2>
          </div>

          {representantes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum representante cadastrado</p>
          ) : (
            <div className="space-y-3">
              {representantes.map((rep) => (
                <div
                  key={rep.id}
                  className={`p-4 rounded-lg border-2 ${
                    rep.ativo ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{rep.nome_completo}</h3>
                      <p className="text-sm text-gray-600">{rep.email}</p>
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        Estado: {rep.estado_uf}
                      </p>
                      <p className="text-xs text-gray-500">
                        {rep.ativo ? 'Ativo' : 'Desativado'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(rep)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleResetPassword(rep.id, rep.auth_user_id, rep.email)}
                        className="text-yellow-600 hover:text-yellow-800 transition-colors"
                        title="Redefinir Senha"
                      >
                        <Key size={18} />
                      </button>
                      {rep.ativo ? (
                        <button
                          onClick={() => handleDeactivateUser(rep.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Desativar"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleActivateUser(rep.id)}
                            className="text-green-600 hover:text-green-800 transition-colors text-sm"
                          >
                            Reativar
                          </button>
                          {usuario?.tipo_usuario === 'admin_geral' && (
                            <button
                              onClick={() => handleDeleteUserPermanently(rep.id, rep.auth_user_id, rep.email)}
                              className="bg-red-700 text-white px-2 py-1 rounded hover:bg-red-900 transition-colors text-xs font-bold"
                              title="Excluir Permanentemente"
                            >
                              Excluir Perm.
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {activeTab === 'documentos' && (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Documentos Disponíveis</h2>
        </div>

        {documents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum documento cadastrado</p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{doc.title}</h3>
                    {doc.description && (
                      <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                    )}
                    {doc.category && (
                      <span className="inline-block text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded mt-2">
                        {doc.category}
                      </span>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Arquivo: {doc.file_name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      title="Visualizar documento"
                    >
                      <Eye size={16} />
                      <span>Ver</span>
                    </a>
                    <button
                      onClick={() => handleEditDocument(doc)}
                      className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      title="Editar documento"
                    >
                      <Edit2 size={16} />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-sm"
                      title="Excluir documento"
                    >
                      <X size={16} />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {activeTab === 'delegados_natos' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Delegados Natos (GT/Executiva)</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                <div className="text-sm text-blue-600 font-semibold mb-1">Total de Delegados</div>
                <div className="text-3xl font-bold text-blue-700">{delegadosNatos.length}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                <div className="text-sm text-green-600 font-semibold mb-1">Validados</div>
                <div className="text-3xl font-bold text-green-700">
                  {delegadosNatos.filter(n => n.inscricao_completa).length}
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                <div className="text-sm text-yellow-600 font-semibold mb-1">Aguardando Validação</div>
                <div className="text-3xl font-bold text-yellow-700">
                  {delegadosNatos.filter(n => !n.inscricao_completa).length}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
              <h3 className="font-semibold text-gray-700 mb-3">Filtros</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GT/Executiva</label>
                  <select
                    value={filtroGT}
                    onChange={(e) => setFiltroGT(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="todos">Todos</option>
                    <option value="GT">GT</option>
                    <option value="Executiva">Executiva</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={filtroEstadoNato}
                    onChange={(e) => setFiltroEstadoNato(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="todos">Todos</option>
                    {estados.map(estado => (
                      <option key={estado.uf} value={estado.uf}>{estado.uf}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="todos">Todos</option>
                    <option value="validado">Validado</option>
                    <option value="aguardando">Aguardando</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                  <input
                    type="text"
                    value={buscaNato}
                    onChange={(e) => setBuscaNato(e.target.value)}
                    placeholder="Nome ou CPF..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">GT</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ponto de Cultura</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">UF</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrarDelegadosNatos().map((nato) => (
                    <tr key={nato.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {nato.inscricao_completa ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            Validado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                            Aguardando
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                          {nato.gt_responsavel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{nato.nome_completo}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{nato.nome_ponto_cultura}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{nato.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {nato.estado_uf}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEditNato(nato)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteNato(nato.id, nato.nome_completo)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtrarDelegadosNatos().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum delegado nato encontrado
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showEditNatoModal && editingNato && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">Editar Delegado Nato</h3>
              <button
                onClick={() => {
                  setShowEditNatoModal(false);
                  setEditingNato(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-100 rounded-lg p-4 mb-6 border-2 border-gray-300">
                <h4 className="font-semibold text-gray-700 mb-3">Status de Validação (Somente Leitura)</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    {editingNato.inscricao_completa ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Validado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        Aguardando Validação
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Data de Validação: {editingNato.data_validacao ? new Date(editingNato.data_validacao).toLocaleString('pt-BR') : 'Não validado'}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveNato} className="space-y-4">
                <h4 className="font-semibold text-gray-700 mb-3">Dados Cadastrais (Editáveis)</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={natoFormData.nome_completo}
                      onChange={(e) => setNatoFormData({ ...natoFormData, nome_completo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CPF <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={natoFormData.cpf}
                      onChange={(e) => setNatoFormData({ ...natoFormData, cpf: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Mãe <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={natoFormData.nome_mae}
                      onChange={(e) => setNatoFormData({ ...natoFormData, nome_mae: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={natoFormData.email}
                      onChange={(e) => setNatoFormData({ ...natoFormData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp/Telefone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={natoFormData.contato_whatsapp}
                      onChange={(e) => setNatoFormData({ ...natoFormData, contato_whatsapp: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ponto de Cultura <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={natoFormData.nome_ponto_cultura}
                      onChange={(e) => setNatoFormData({ ...natoFormData, nome_ponto_cultura: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={natoFormData.cidade}
                      onChange={(e) => setNatoFormData({ ...natoFormData, cidade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado/UF <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={natoFormData.estado_uf}
                      onChange={(e) => setNatoFormData({ ...natoFormData, estado_uf: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Selecione...</option>
                      {estados.map(estado => (
                        <option key={estado.uf} value={estado.uf}>{estado.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GT Nato Representado <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={natoFormData.gt_responsavel}
                      onChange={(e) => setNatoFormData({ ...natoFormData, gt_responsavel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="EXECUTIVA CNPDC">EXECUTIVA CNPDC</option>
                      <option value="GT ESTADUAL">GT ESTADUAL</option>
                      <option value="GT Ação Griô">GT Ação Griô</option>
                      <option value="GT Acessibilidade">GT Acessibilidade</option>
                      <option value="GT Amazônico">GT Amazônico</option>
                      <option value="GT Audiovisual">GT Audiovisual</option>
                      <option value="GT Circo">GT Circo</option>
                      <option value="GT Comunicação/Rádio Comunitária">GT Comunicação/Rádio Comunitária</option>
                      <option value="GT Cultura Digital">GT Cultura Digital</option>
                      <option value="GT Cultura e Arte Negra">GT Cultura e Arte Negra</option>
                      <option value="GT Cultura Popular">GT Cultura Popular</option>
                      <option value="GT Dança">GT Dança</option>
                      <option value="GT Gênero">GT Gênero</option>
                      <option value="GT Hip Hop">GT Hip Hop</option>
                      <option value="GT Indígenas">GT Indígenas</option>
                      <option value="GT Integração Latino Americana">GT Integração Latino Americana</option>
                      <option value="GT Legislação">GT Legislação</option>
                      <option value="GT Matriz Africana">GT Matriz Africana</option>
                      <option value="GT Música">GT Música</option>
                      <option value="GT Patrimônio Imaterial e Tradicional">GT Patrimônio Imaterial e Tradicional</option>
                      <option value="GT Rurais">GT Rurais</option>
                      <option value="GT Pontões e Redes">GT Pontões e Redes</option>
                      <option value="GT Sustentabilidade">GT Sustentabilidade</option>
                      <option value="GT Teatro">GT Teatro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cota Representada
                    </label>
                    <select
                      value={natoFormData.cota_representada}
                      onChange={(e) => setNatoFormData({ ...natoFormData, cota_representada: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      <option value="juventude">Juventude</option>
                      <option value="mulher">Mulher</option>
                      <option value="lgbtqiapn+">LGBTQIAPN+</option>
                      <option value="pessoa_com_deficiencia">Pessoa com Deficiência</option>
                      <option value="comunidade_tradicional">Comunidade Tradicional</option>
                      <option value="nenhuma">Nenhuma</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gênero
                    </label>
                    <select
                      value={natoFormData.genero}
                      onChange={(e) => setNatoFormData({ ...natoFormData, genero: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      <option value="feminino">Feminino</option>
                      <option value="masculino">Masculino</option>
                      <option value="não-binário">Não-binário</option>
                      <option value="outro">Outro</option>
                      <option value="prefiro_nao_informar">Prefiro não informar</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditNatoModal(false);
                      setEditingNato(null);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'relatorios' && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <RelatorioCotas />
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="w-10 h-10 text-green-600" />
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Backup do Banco de Dados</h2>
              <p className="text-gray-600 mt-1">Faça backup de todos os dados importantes do sistema</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <HardDrive className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Backup Manual</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Exporta todas as tabelas importantes em um único arquivo JSON com timestamp.
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1 mb-4">
                    <li>• Usuários e permissões</li>
                    <li>• Eventos e fóruns</li>
                    <li>• Delegação estadual</li>
                    <li>• Inscrições de membros</li>
                    <li>• Documentos cadastrados</li>
                  </ul>
                  <button
                    onClick={fazerBackupCompleto}
                    disabled={backupLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    <Download size={20} />
                    <span>{backupLoading ? 'Exportando...' : 'Fazer Backup Agora'}</span>
                  </button>
                  {backupProgress && (
                    <div className="mt-4 bg-white rounded-lg p-3 border border-blue-300">
                      <p className="text-sm text-blue-700 font-medium">{backupProgress}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200">
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-600 p-3 rounded-lg">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Backups Automáticos do Supabase</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    O Supabase realiza backups automáticos diários do seu banco de dados.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-yellow-300 mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Como Acessar:</h4>
                    <ol className="text-sm text-gray-700 space-y-2">
                      <li>1. Acesse o <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Dashboard do Supabase</a></li>
                      <li>2. Selecione seu projeto</li>
                      <li>3. Vá em <strong>Database → Backups</strong></li>
                      <li>4. Visualize e restaure backups anteriores</li>
                    </ol>
                  </div>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-all font-semibold"
                  >
                    <span>Abrir Dashboard Supabase</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Recomendações Importantes
            </h3>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start space-x-3">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold">Faça backups regulares</p>
                  <p className="text-sm">Recomendamos fazer backup manual semanalmente ou antes de alterações importantes.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold">Armazene em local seguro</p>
                  <p className="text-sm">Guarde os arquivos de backup em um local seguro (Google Drive, Dropbox, disco externo, etc.).</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-semibold">Verifique os backups do Supabase</p>
                  <p className="text-sm">Confirme periodicamente que os backups automáticos do Supabase estão funcionando no dashboard.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  ⚠
                </div>
                <div>
                  <p className="font-semibold text-yellow-700">Dados são compartilhados</p>
                  <p className="text-sm">Lembre-se: todos os ambientes (Bolt, Netlify, Vercel) acessam o MESMO banco de dados. Se você perder dados aqui, eles somem de todos os lugares.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
