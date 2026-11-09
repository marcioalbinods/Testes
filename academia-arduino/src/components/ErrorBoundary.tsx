import { Component, type ReactNode } from 'react';

/** Mostra uma mensagem amigável se alguma parte da página der erro, sem derrubar o site todo. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error('Erro na página:', error);
  }
  render() {
    if (this.state.error)
      return (
        <div className="card center" style={{ padding: 32 }}>
          <h2>Ops! Algo não funcionou nesta página.</h2>
          <p className="muted">Tente recarregar. Se continuar, avise o professor.</p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn primary" onClick={() => window.location.reload()}>Recarregar a página</button>
            <a className="btn ghost" href="#/">Ir para o início</a>
          </div>
        </div>
      );
    return this.props.children;
  }
}
