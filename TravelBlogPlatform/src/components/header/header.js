import template from './header.html?raw';
import './header.css';

export function renderHeader(pathname) {
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');

  return template
    .replace('href="/" data-link>Home', `href="/" data-link ${normalizedPath === '/' ? 'aria-current="page"' : ''}>Home`)
    .replace(
      'href="/dashboard" data-link>Dashboard',
      `href="/dashboard" data-link ${normalizedPath === '/dashboard' ? 'aria-current="page"' : ''}>Dashboard`
    );
}
