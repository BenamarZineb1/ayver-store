"use client";

import { useState, FormEvent } from "react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Identifiants invalides ou erreur serveur");
      }

      // 🟢 REDIRECTION FORCEE : Déclenche le rewrite du proxy/middleware à la racine
      window.location.href = "/";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inattendue est survenue");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-viewport">
      {/* Le CSS reste injecté ici de manière stable */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          background-color: #F0EDE6 !important;
          color: #131C14 !important;
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
          -webkit-text-size-adjust: 100%;
        }

        .login-viewport {
          background: #F0EDE6 !important;
          color: #131C14 !important;
          font-family: 'Jost', sans-serif;
          font-weight: 300;
          min-height: 100dvh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .login-card {
          background: #FAFAF8;
          border: 1px solid #D4CFC8;
          width: 100%;
          max-width: 420px;
          padding: 50px 40px;
          border-radius: 2px;
          box-shadow: 0 20px 40px rgba(19, 28, 20, 0.03);
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 40px 24px;
          }
        }

        .brand-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 6px;
          color: #1A2F1C;
          line-height: 1;
        }

        .brand-subtitle {
          font-size: 8px;
          letter-spacing: 4px;
          color: #7A8A7B;
          margin-top: 6px;
          text-transform: uppercase;
        }

        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 600;
          text-align: center;
          margin-bottom: 24px;
          color: #131C14;
          font-style: italic;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .input-group label {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #7A8A7B;
          font-weight: 500;
        }

        .input-group input {
          padding: 14px 16px;
          border: 1px solid #D4CFC8;
          background: #F0EDE6;
          font-family: 'Jost', sans-serif;
          font-size: 16px;
          color: #131C14;
          outline: none;
          transition: border-color 0.3s;
          border-radius: 1px;
          -webkit-appearance: none;
        }

        @media (min-width: 768px) {
          .input-group input {
            font-size: 14px;
          }
        }

        .input-group input:focus {
          border-color: #131C14;
        }

        .error-banner {
          background: #FAF3F3;
          border: 1px solid #E6D0D0;
          color: #8B2020;
          font-size: 12px;
          padding: 12px;
          margin-bottom: 20px;
          text-align: center;
          letter-spacing: 0.5px;
        }

        .btn-submit {
          background: #131C14;
          color: #F0EDE6;
          width: 100%;
          padding: 16px;
          border: none;
          font-family: 'Jost', sans-serif;
          letter-spacing: 3px;
          font-size: 11px;
          text-transform: uppercase;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.3s;
          margin-top: 10px;
          border-radius: 1px;
          -webkit-appearance: none;
          display: block;
          text-align: center;
          text-decoration: none;
        }

        .btn-submit:hover:not(:disabled) {
          background: #1A2F1C;
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div className="login-card">
        <div className="brand-header">
          <h1 className="brand-name">AYVER</h1>
          <div className="brand-subtitle">Console de Gestion</div>
        </div>

        <form onSubmit={handleLogin}>
          <h2 className="form-title">Accès Restreint</h2>

          {error && <div className="error-banner">✕ {error}</div>}

          <div className="input-group">
            <label>Identifiant Administrateur</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: admin"
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label>Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Vérification..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}