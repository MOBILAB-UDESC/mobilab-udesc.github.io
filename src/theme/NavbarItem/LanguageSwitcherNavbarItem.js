import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';

function portugueseRoute(pathname) {
  return pathname.replace(/^\/en(?=\/|$)/, '') || '/';
}

export default function LanguageSwitcherNavbarItem() {
  const {pathname} = useLocation();
  const isEnglishPage = pathname === '/en' || pathname.startsWith('/en/');
  const target = isEnglishPage ? portugueseRoute(pathname) : '/en';

  return (
    <Link className="navbar__item navbar__link" to={target}>
      {isEnglishPage ? 'Português' : 'English'}
    </Link>
  );
}
