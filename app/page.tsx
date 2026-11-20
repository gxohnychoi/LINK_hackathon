import { Cinzel } from 'next/font/google';
import Splash from '@/components/Splash';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '600'] });

export default function Page() {
  return <Splash serifClass={cinzel.className} />;
}
