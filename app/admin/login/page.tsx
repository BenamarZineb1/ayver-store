"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
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
        throw new Error(data.error || "Une erreur est survenue");
      }

      // Redirection immédiate vers le tableau de bord principal après le succès
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght=0,400;0,600;0,700&family=Jost:wght=200;300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cream: #F0EDE6; --dark: #131C14; --forest: #1A2F1C;
          --gold: #C4A882; --text-muted: #7A8A7B; --border: #D4CFC8; --white: #FAFAF8;
        }

        .login-viewport {
          background: var(--cream);
          color: var(--dark);
          font-family: 'Jost', sans-serif;
          font-weight: 300;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .login-card {
          background: var(--white);
          border: 1px solid var(--border);
          width: 100%;
          max-width: 420px;
          padding: 50px 40px;
          border-radius: 2px;
          box-shadow: 0 20px 40px rgba(19, 28, 20, 0.03);
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
          color: var(--forest);
          line-height: 1;
        }

        .brand-subtitle {
          font-size: 8px;
          letter-spacing: 4px;
          color: var(--text-muted);
          margin-top: 6px;
          text-transform: uppercase;
        }

        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 600;
          text-align: center;
          margin-bottom: 24px;
          color: var(--dark);
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
          color: var(--text-muted);
          font-weight: 500;
        }

        .input-group input {
          padding: 14px 16px;
          border: 1px solid var(--border);
          background: var(--cream);
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          color: var(--dark);
          outline: none;
          transition: border-color 0.3s;
          border-radius: 1px;
        }

        .input-group input:focus {
          border-color: var(--dark);
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
          background: var(--dark);
          color: var(--cream);
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
        }

        .btn-submit:hover:not(:disabled) {
          background: var(--forest);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}} />

      <div className="login-viewport">
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
    </>
  );
}