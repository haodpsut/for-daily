import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (e: any) {
      setError(String(e.response?.data?.detail || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    setEmail('demo@cdr-steward.com');
    setPassword('demo1234');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-brand-900">CĐR Steward</h1>
          <p className="text-sm text-gray-500 mt-1">Đăng nhập để tiếp tục</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Email</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Mật khẩu</label>
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit" disabled={submitting}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white py-2.5 rounded font-medium"
          >
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-gray-500">Chưa có tài khoản? </span>
          <Link to="/register" className="text-brand-600 hover:underline font-medium">
            Đăng ký
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={fillDemo}
            type="button"
            className="w-full text-xs text-gray-500 hover:text-brand-700 py-2"
          >
            💡 Try demo: demo@cdr-steward.com / demo1234
          </button>
        </div>
      </div>
    </div>
  );
}
