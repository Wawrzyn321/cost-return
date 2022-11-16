import styles from './PaidBadge.module.css';

export function PaidBadge() {
  const className = `badge ml-2 background-color--background color-text--inverted ${styles['crazy']}`;

  return <span class={className}>PAID!</span>;
}
