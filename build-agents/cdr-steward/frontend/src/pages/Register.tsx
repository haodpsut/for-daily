import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', institution_name: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Mật khẩu cần ít nhất 6 ký tự');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        full_name: form.full_name || undefined,
        institution_name: form.institution_name || undefined,
      });
      navigate('/', { replace: true });
    } catch (e: any) {
      setError(String(e.response?.data?.detail || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-brand-900">CĐR Steward</h1>
          <p className="text-sm text-gray-500 mt-1">Tạo tài khoản mới</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <Input label="Email *" type="email" value={form.email} onChange={(v) => set('email', v)} placeholder="email@truong.edu.vn" />
          <Input label="Mật khẩu * (≥6 ký tự)" type="password" value={form.password} onChange={(v) => set('password', v)} placeholder="••••••••" />
          <Input label="Họ và tên" value={form.full_name} onChange={(v) => set('full_name', v)} placeholder="TS. Nguyễn Văn A" />
          <Input label="Trường / Đơn vị" value={form.institution_name} onChange={(v) => set('institution_name', v)} placeholder="ĐH Kiến trúc Đà Nẵng" />

          <button
            type="submit" disabled={submitting}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white py-2.5 rounded font-medium mt-2"
          >
            {submitting ? 'Đang tạo...' : 'Đăng ký + Đăng nhập'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-gray-500">Đã có tài khoản? </span>
          <Link to="/login" className="text-brand-600 hover:underline font-medium">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

function Input({ label, type = 'text', value, onChange, placeholder }: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      />
    </div>
  );
}
