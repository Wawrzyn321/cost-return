import hand from './cashback--hand.svg';
import ball from './cashback--ball.svg';
import styles from './AnimatedCashback.module.css';
import { createSignal } from 'solid-js';

export function AnimatedCashback() {
  const [hasHover, setHasHover] = createSignal(false);

  const imgClass = () => (hasHover() ? styles['hover'] : '');

  return (
    <div
      class="grid place-content-center mr-2"
      onMouseEnter={() => setHasHover(true)}
      onMouseLeave={() => setHasHover(false)}
    >
      <img src={ball} alt="" class={`${imgClass()} ${styles['ball']}`} />
      <img src={hand} alt="" class={`${imgClass()} ${styles['hand']}`} />
    </div>
  );
}
