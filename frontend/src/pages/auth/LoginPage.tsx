import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { connectWallet, signAuthChallenge } from '../../services/walletClient';
import type { UserRole } from '../../types';

// Tujuan setelah login berdasarkan role.
const redirectMap: Record<UserRole, string> = {
  OWNER: '/owner/dashboard',
  CLINIC: '/clinic/dashboard',
  ADMIN: '/admin/dashboard',
  PUBLIC_VERIFIER: '/trace',
};

// Halaman login untuk semua role internal.
export const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');

  const handleWalletLogin = async () => {
    setError('');
    try {
      const connectedWallet = await connectWallet();
      setWalletAddress(connectedWallet);
      const authPayload = await signAuthChallenge(connectedWallet);
      const user = await login(authPayload);
      navigate(redirectMap[user.role] ?? '/owner/dashboard', { replace: true });
    } catch (err: any) {
      const status = err?.response?.status;
      const apiMessage = err?.response?.data?.message;
      if (status === 404) {
        setError(apiMessage ?? 'Wallet belum terdaftar. Silakan daftar terlebih dahulu.');
        return;
      }
      if (err?.message === 'Network Error') {
        setError('Backend tidak dapat diakses. Pastikan server berjalan dan URL API benar.');
        return;
      }
      setError(apiMessage ?? err?.message ?? 'Gagal masuk menggunakan wallet.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        {/* <h2 className="text-xl font-semibold text-slate-800">Masuk dengan Dompet Digital</h2> */}
        <p className="text-sm text-slate-500 text-center">
          Daftar - Verifikasi Klinik - Tercatat di Blockchain
        </p>
      </div>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-600 text-center">
          Klik tombol di bawah, lalu tanda tangani challenge sign in.
        </p>
        {walletAddress && (
          <p className="rounded-lg bg-white px-3 py-2 font-mono text-xs text-slate-700">
            Menghubungkan: {walletAddress}
          </p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="button"
          onClick={handleWalletLogin}
          disabled={loading}
          className="w-full rounded-full bg-primary px-4 py-2 text-white font-semibold shadow-lg shadow-primary/30 disabled:opacity-60"
        >
          {loading ? 'Memproses...' : 'Hubungkan Dompet Digital & Masuk'}
        </button>
      </div>
      <div className="text-sm text-slate-500">
        <p className="rounded-xl bg-mist/70 px-3 py-2 text-xs text-center">
          Fitur Pemilik dan Klinik Hewan dipisah setelah sign in.
        </p>
        <p>
          Halaman penelusuran identitas hewan tersedia di {' '}
          <button
            type="button"
            className="text-primary font-semibold"
            onClick={() => navigate('/trace')}
          >
            Lacak Publik
          </button>
          .
        </p>
        <p className="mt-2">
          Belum punya akun pemilik hewan?{' '}
          <button
            type="button"
            className="text-primary font-semibold"
            onClick={() => navigate('/register')}
          >
            Daftar di sini
          </button>
          .
        </p>
      </div>
    </div>
  );
};
