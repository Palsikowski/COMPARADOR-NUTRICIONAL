import React, { useState } from "react";
import { Leaf, Eye, EyeOff, AlertTriangle, Info } from "lucide-react";
import "../signin.css";

// Tela de entrada da plataforma: formulário à esquerda, foto e destaques à
// direita. É o primeiro contato com o app, então usa os mesmos tokens, os
// mesmos raios e a mesma tipografia do resto — e não uma linguagem visual
// própria que faria a entrada parecer outro produto.
//
// A tela é "burra" de propósito: ela não sabe validar nada. Quem decide se a
// credencial vale é quem passa `onSubmit` (hoje o PasswordGate), e o erro volta
// pra cá pelo prop `error`. Assim dá pra trocar a autenticação depois sem
// mexer no layout.
//
// Os botões sociais (`onGoogleSignIn`) e o "criar conta" (`onCreateAccount`) só
// aparecem se receberem handler. Hoje a plataforma não tem backend de
// autenticação nem cadastro: desenhar os dois botões mesmo assim daria a
// entender que existe uma conta por pessoa, quando a entrada é uma senha só,
// compartilhada com o time.

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z"
    />
  </svg>
);

export default function SignInPage({
  title = "Entrar na plataforma",
  description,
  identifierLabel = null,
  passwordLabel = "Senha",
  passwordPlaceholder = "Digite a senha",
  submitLabel = "Entrar",
  rememberLabel = "Manter conectado neste aparelho",
  showRemember = true,
  error = null,
  hint = null,
  busy = false,
  heroImageSrc,
  heroTitle,
  heroText,
  notes = [],
  onSubmit,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="signin">
      <section className="signin-form-col">
        <div className="signin-form-inner">
          <div className="signin-brand signin-anim signin-d1">
            <span className="signin-brand-mark">
              <Leaf size={19} color="var(--brand-contrast)" />
            </span>
            <span style={{ lineHeight: 1.2 }}>
              <span style={{ display: "block", fontSize: 15, fontWeight: 700, letterSpacing: "-0.015em" }}>
                Comparador Nutricional
              </span>
              <span
                style={{
                  display: "inline-block",
                  marginTop: 3,
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--brand)",
                  background: "var(--brand-soft)",
                  padding: "1px 6px",
                  borderRadius: "var(--radius-pill)",
                }}
              >
                Inteligência Foliar
              </span>
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h1 className="signin-title signin-anim signin-d2">{title}</h1>
            {description && <p className="signin-description muted signin-anim signin-d3">{description}</p>}
          </div>

          <form className="signin-form" onSubmit={onSubmit}>
            {identifierLabel && (
              <div className="signin-anim signin-d4">
                <label className="signin-label" htmlFor="signin-identifier">
                  {identifierLabel}
                </label>
                <div className="signin-field">
                  <input id="signin-identifier" name="identifier" type="text" autoComplete="username" placeholder="Seu nome ou e-mail" />
                </div>
              </div>
            )}

            <div className="signin-anim signin-d4">
              <label className="signin-label" htmlFor="signin-password">
                {passwordLabel}
              </label>
              <div className="signin-field signin-field-with-action">
                <input
                  id="signin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={passwordPlaceholder}
                  autoFocus
                  aria-invalid={error ? "true" : undefined}
                  aria-describedby={error ? "signin-error" : undefined}
                />
                <button
                  type="button"
                  className="signin-field-action"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="signin-error signin-anim" id="signin-error" role="alert">
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            {hint && (
              <div className="signin-hint signin-anim" role="status">
                <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{hint}</span>
              </div>
            )}

            {(showRemember || onResetPassword) && (
              <div className="signin-row signin-anim signin-d5">
                {showRemember && (
                  <label className="signin-check">
                    <input type="checkbox" name="remember" defaultChecked />
                    <span>{rememberLabel}</span>
                  </label>
                )}
                {onResetPassword && (
                  <button type="button" className="signin-link" onClick={onResetPassword}>
                    Esqueci a senha
                  </button>
                )}
              </div>
            )}

            <button type="submit" className="btn btn-primary signin-anim signin-d6" disabled={busy} style={{ width: "100%", minHeight: 50 }}>
              {busy ? "Entrando…" : submitLabel}
            </button>
          </form>

          {onGoogleSignIn && (
            <>
              <div className="signin-divider signin-anim signin-d7">
                <span>ou continue com</span>
              </div>
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="btn btn-ghost signin-anim signin-d7"
                style={{ width: "100%", minHeight: 50 }}
              >
                <GoogleIcon />
                Continuar com Google
              </button>
            </>
          )}

          {onCreateAccount && (
            <p className="signin-foot muted signin-anim signin-d8">
              Ainda não tem acesso?{" "}
              <button type="button" className="signin-link" onClick={onCreateAccount}>
                Criar conta
              </button>
            </p>
          )}
        </div>
      </section>

      <section className="signin-hero" aria-hidden="true">
        <div className="signin-hero-panel signin-anim-right signin-d3">
          {heroImageSrc && <div className="signin-hero-img" style={{ backgroundImage: `url(${heroImageSrc})` }} />}
          <div className="signin-hero-veil" />

          {(heroTitle || heroText) && (
            <div className="signin-hero-caption">
              {heroTitle && <h2>{heroTitle}</h2>}
              {heroText && <p>{heroText}</p>}
            </div>
          )}

          {notes.length > 0 && (
            <div className="signin-notes">
              {notes.slice(0, 3).map((note, i) => (
                <div key={note.label} className={`signin-note signin-anim-note ${["signin-d7", "signin-d8", "signin-d9"][i]}`}>
                  <div className="signin-note-value tnum">{note.value}</div>
                  <div className="signin-note-label">{note.label}</div>
                  {note.text && <div className="signin-note-text">{note.text}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
