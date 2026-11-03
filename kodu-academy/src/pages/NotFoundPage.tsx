import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="card narrow" style={{ margin: '40px auto' }}>
      <h1>Página não encontrada</h1>
      <p>O endereço pode estar errado ou a página mudou de lugar.</p>
      <Link className="btn" to="/">Voltar ao início</Link>
    </div>
  );
}
