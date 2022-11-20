import { Header } from '../Header/Header';
import { FancyInteractiveText } from '../FancyInteractiveText/FancyInteractiveText';
import { JSX } from 'solid-js/jsx-runtime';
import styles from './Layout.module.css';

export function Layout(props: { children: JSX.Element; withAuth: boolean }) {
  const VSpacer = () => <div class={styles['v-spacer']}></div>;

  return (
    <>
      <div class={styles['container']}>
        <Header withAuth={props.withAuth} />
        <div class={styles['wave']}></div>
      </div>
      <VSpacer />
      <div class={styles['content']}>{props.children}</div>
      <VSpacer />
      <div class={`${styles['container']} ${styles['container--bottom']}`}>
        <div class={`${styles['wave']} ${styles['wave--bottom']}`}></div>
        <FancyInteractiveText text="PW, 2022" />
      </div>
    </>
  );
}
